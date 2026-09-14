using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using SupplyShield.Api.Controllers;
using SupplyShield.Domain.Entities;
using SupplyShield.Domain.Enums;
using SupplyShield.Infrastructure.Persistence;
using Xunit;

namespace SupplyShield.Api.Tests;

/// <summary>
/// Tests for Phase 4 & 5: Synthetic dataset integrity, referential constraints,
/// temperature telemetry validation, and seeding controllers.
/// </summary>
public class DatasetValidationTests
{
    private static AppDbContext CreateTestDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task DataSeeder_SeedsAllEntitiesSuccessfully()
    {
        using var context = CreateTestDbContext();

        var result = await DataSeeder.SeedAsync(context, force: true);

        Assert.True(result.Success);
        Assert.True(result.CarriersCount >= 5);
        Assert.True(result.RoutesCount >= 5);
        Assert.True(result.VehiclesCount >= 5);
        Assert.True(result.DisruptionsCount >= 4);
        Assert.True(result.ShipmentsCount >= 5);
        Assert.True(result.SensorsCount >= 2);
        Assert.True(result.ReadingsCount >= 50);
        Assert.True(result.AlertsCount >= 1);
        Assert.True(result.RecommendationsCount >= 2);
        Assert.True(result.AuditsCount >= 1);
    }

    [Fact]
    public async Task SeededDataset_MaintainsReferentialIntegrity()
    {
        using var context = CreateTestDbContext();
        await DataSeeder.SeedAsync(context, force: true);

        // Verify shipments link to existing routes
        var shipments = await context.Shipments.Include(s => s.Route).ToListAsync();
        Assert.All(shipments, s =>
        {
            if (s.RouteId.HasValue)
            {
                Assert.NotNull(s.Route);
            }
        });

        // Verify sensors link to cold-chain shipments
        var sensors = await context.Sensors.Include(s => s.Shipment).ToListAsync();
        Assert.All(sensors, s =>
        {
            Assert.NotNull(s.Shipment);
            Assert.True(s.Shipment.IsColdChain);
        });

        // Verify cold-chain alert links to sensor and shipment
        var alerts = await context.ColdChainAlerts.Include(a => a.Sensor).Include(a => a.Shipment).ToListAsync();
        Assert.NotEmpty(alerts);
        Assert.All(alerts, a =>
        {
            Assert.NotNull(a.Sensor);
            Assert.NotNull(a.Shipment);
            Assert.True(a.ExcursionPeakCelsius > a.AllowedMaxCelsius);
        });
    }

    [Fact]
    public async Task SeededDataset_ColdChainTelemetryConformsToProtocols()
    {
        using var context = CreateTestDbContext();
        await DataSeeder.SeedAsync(context, force: true);

        var sensor1 = await context.Sensors
            .Include(s => s.Readings)
            .FirstOrDefaultAsync(s => s.SensorCode == "SEN-VACC-001");

        Assert.NotNull(sensor1);
        Assert.Equal(2.0m, sensor1.MinTempCelsius);
        Assert.Equal(8.0m, sensor1.MaxTempCelsius);
        Assert.Equal(ColdChainStatus.Excursion, sensor1.Status);
        Assert.Equal(SeverityLevel.Critical, sensor1.CurrentExcursionSeverity);

        // Verify excursion readings exist for breached sensor
        var excursionReadings = sensor1.Readings.Where(r => r.IsExcursion).ToList();
        Assert.NotEmpty(excursionReadings);
        Assert.All(excursionReadings, r => Assert.True(r.TemperatureCelsius > 8.0m));
    }

    [Fact]
    public async Task SeededDataset_RiskScoresAreWithinBounds()
    {
        using var context = CreateTestDbContext();
        await DataSeeder.SeedAsync(context, force: true);

        var shipments = await context.Shipments.ToListAsync();
        Assert.All(shipments, s =>
        {
            if (s.RiskScore.HasValue)
            {
                Assert.InRange(s.RiskScore.Value, 0.0m, 1.0m);
            }
        });
    }

    [Fact]
    public async Task SeedController_ReturnsStatusAndSeedExecution()
    {
        using var context = CreateTestDbContext();
        var controller = new SeedController(context, NullLogger<SeedController>.Instance);

        // 1. Initial status before seeding
        var statusResult = await controller.GetStatus(CancellationToken.None);
        var okStatus = Assert.IsType<OkObjectResult>(statusResult);
        Assert.NotNull(okStatus.Value);

        // 2. Trigger seed
        var seedResult = await controller.SeedDatabase(force: true, CancellationToken.None);
        var okSeed = Assert.IsType<OkObjectResult>(seedResult);
        var result = Assert.IsType<SeedResult>(okSeed.Value);
        Assert.True(result.Success);
        Assert.True(result.ShipmentsCount >= 5);
    }
}
