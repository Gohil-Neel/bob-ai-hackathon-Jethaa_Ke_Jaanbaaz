using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using SupplyShield.Domain.Entities;
using SupplyShield.Domain.Enums;
using SupplyShield.Infrastructure;
using SupplyShield.Infrastructure.Integrations.Supabase;
using SupplyShield.Infrastructure.Persistence;
using Xunit;

namespace SupplyShield.Api.Tests;

/// <summary>
/// Tests for Phase 3: Database schema configuration, entity model mappings,
/// connection string resolution, and Supabase integration safety.
/// </summary>
public class DatabaseSchemaTests
{
    private static AppDbContext CreateTestDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void AppDbContext_ContainsAllFourteenCoreEntities()
    {
        using var context = CreateTestDbContext();
        var model = context.Model;

        var entityTypes = model.GetEntityTypes().Select(t => t.ClrType).ToHashSet();

        Assert.Contains(typeof(Shipment), entityTypes);
        Assert.Contains(typeof(Disruption), entityTypes);
        Assert.Contains(typeof(ShipmentDisruption), entityTypes);
        Assert.Contains(typeof(Route), entityTypes);
        Assert.Contains(typeof(RouteSegment), entityTypes);
        Assert.Contains(typeof(Vehicle), entityTypes);
        Assert.Contains(typeof(Carrier), entityTypes);
        Assert.Contains(typeof(VehicleAssignment), entityTypes);
        Assert.Contains(typeof(Sensor), entityTypes);
        Assert.Contains(typeof(SensorReading), entityTypes);
        Assert.Contains(typeof(ColdChainAlert), entityTypes);
        Assert.Contains(typeof(RecoveryRecommendation), entityTypes);
        Assert.Contains(typeof(DecisionAudit), entityTypes);
        Assert.Contains(typeof(ModelPrediction), entityTypes);
    }

    [Fact]
    public void ShipmentEntity_HasConfiguredIndexesAndProperties()
    {
        using var context = CreateTestDbContext();
        var shipmentType = context.Model.FindEntityType(typeof(Shipment));

        Assert.NotNull(shipmentType);
        Assert.Equal("shipments", shipmentType.GetTableName());

        var trackingNumberProp = shipmentType.FindProperty(nameof(Shipment.TrackingNumber));
        Assert.NotNull(trackingNumberProp);
        Assert.False(trackingNumberProp.IsNullable);
        Assert.Equal(50, trackingNumberProp.GetMaxLength());

        var statusProp = shipmentType.FindProperty(nameof(Shipment.Status));
        Assert.NotNull(statusProp);
        Assert.Equal(typeof(ShipmentStatus), statusProp.ClrType);
    }

    [Fact]
    public void ResolvePostgreSqlConnectionString_HandlesUriAndStandardFormats()
    {
        // 1. Postgres URI format (Supabase format)
        var uriConn = "postgresql://postgres.myproject:mypassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";
        var resolvedUri = InfrastructureServiceRegistration.ResolvePostgreSqlConnectionString(uriConn);

        Assert.NotNull(resolvedUri);
        Assert.Contains("Host=aws-0-eu-central-1.pooler.supabase.com", resolvedUri);
        Assert.Contains("Port=6543", resolvedUri);
        Assert.Contains("Database=postgres", resolvedUri);
        Assert.Contains("Username=postgres.myproject", resolvedUri);
        Assert.Contains("Password=mypassword123", resolvedUri);
        Assert.Contains("SSL Mode=Require", resolvedUri);

        // 2. Standard ADO.NET format
        var standardConn = "Host=localhost;Port=5432;Database=supplyshield;Username=postgres;Password=postgres";
        var resolvedStandard = InfrastructureServiceRegistration.ResolvePostgreSqlConnectionString(standardConn);
        Assert.Equal(standardConn, resolvedStandard);

        // 3. Null/Empty
        Assert.Null(InfrastructureServiceRegistration.ResolvePostgreSqlConnectionString(null));
        Assert.Null(InfrastructureServiceRegistration.ResolvePostgreSqlConnectionString("   "));
    }

    [Fact]
    public void SupabaseClientWrapper_DoesNotExposeSecretKeyInStatus()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Supabase:Url", "https://xyzcompany.supabase.co" },
            { "Supabase:ServiceRoleKey", "super-secret-service-role-key-12345" }
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var wrapper = new SupabaseClientWrapper(configuration, NullLogger<SupabaseClientWrapper>.Instance);

        Assert.True(wrapper.IsConfigured);
        Assert.Equal("https://xyzcompany.supabase.co", wrapper.SupabaseUrl);

        var status = wrapper.GetStatus();
        Assert.True(status.IsConfigured);
        Assert.True(status.HasServiceRoleKey);
        Assert.Equal("https://xyzcompany.supabase.co", status.Url);
        // Ensure status object does not contain the key text
        Assert.DoesNotContain("super-secret-service-role-key-12345", status.ToString());
    }
}
