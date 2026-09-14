using Microsoft.EntityFrameworkCore;
using SupplyShield.Domain.Entities;

namespace SupplyShield.Infrastructure.Persistence;

/// <summary>
/// Entity Framework Core DbContext for SupplyShield AI.
///
/// Phase 2: Stub — no connection string configured. Application starts without a database.
/// Phase 3+: Configure PostgreSQL connection via Supabase and add EF Core migrations.
///
/// Architecture rule: Only Infrastructure touches the DbContext directly.
/// Application layer uses repository interfaces. API layer never queries DbContext.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ─── DbSets ─────────────────────────────────────────────────────────────

    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<Disruption> Disruptions => Set<Disruption>();
    public DbSet<ShipmentDisruption> ShipmentDisruptions => Set<ShipmentDisruption>();
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<RouteSegment> RouteSegments => Set<RouteSegment>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Carrier> Carriers => Set<Carrier>();
    public DbSet<VehicleAssignment> VehicleAssignments => Set<VehicleAssignment>();
    public DbSet<Sensor> Sensors => Set<Sensor>();
    public DbSet<SensorReading> SensorReadings => Set<SensorReading>();
    public DbSet<ColdChainAlert> ColdChainAlerts => Set<ColdChainAlert>();
    public DbSet<RecoveryRecommendation> RecoveryRecommendations => Set<RecoveryRecommendation>();
    public DbSet<DecisionAudit> DecisionAudits => Set<DecisionAudit>();
    public DbSet<ModelPrediction> ModelPredictions => Set<ModelPrediction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Shipment ────────────────────────────────────────────────────────
        modelBuilder.Entity<Shipment>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TrackingNumber).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.TrackingNumber).IsUnique();
            e.Property(x => x.RiskScore).HasPrecision(5, 4);
            e.HasOne(x => x.Route).WithMany(r => r.Shipments).HasForeignKey(x => x.RouteId).IsRequired(false);
        });

        // ── Disruption ──────────────────────────────────────────────────────
        modelBuilder.Entity<Disruption>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
        });

        // ── ShipmentDisruption ───────────────────────────────────────────────
        modelBuilder.Entity<ShipmentDisruption>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Shipment).WithMany(s => s.ShipmentDisruptions).HasForeignKey(x => x.ShipmentId);
            e.HasOne(x => x.Disruption).WithMany(d => d.ShipmentDisruptions).HasForeignKey(x => x.DisruptionId);
            e.HasIndex(x => new { x.ShipmentId, x.DisruptionId }).IsUnique();
        });

        // ── Route / RouteSegment ─────────────────────────────────────────────
        modelBuilder.Entity<Route>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });
        modelBuilder.Entity<RouteSegment>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Route).WithMany(r => r.Segments).HasForeignKey(x => x.RouteId);
        });

        // ── Vehicle / Carrier / VehicleAssignment ────────────────────────────
        modelBuilder.Entity<Carrier>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Code).HasMaxLength(20).IsRequired();
            e.HasIndex(x => x.Code).IsUnique();
        });
        modelBuilder.Entity<Vehicle>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.AssetCode).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.AssetCode).IsUnique();
            e.Property(x => x.CapacityKg).HasPrecision(10, 2);
            e.HasOne(x => x.Carrier).WithMany(c => c.Vehicles).HasForeignKey(x => x.CarrierId).IsRequired(false);
        });
        modelBuilder.Entity<VehicleAssignment>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Vehicle).WithMany(v => v.Assignments).HasForeignKey(x => x.VehicleId);
            e.HasOne(x => x.Shipment).WithMany(s => s.VehicleAssignments).HasForeignKey(x => x.ShipmentId);
        });

        // ── Sensor / Reading / Alert ─────────────────────────────────────────
        modelBuilder.Entity<Sensor>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.SensorCode).HasMaxLength(50).IsRequired();
            e.Property(x => x.MinTempCelsius).HasPrecision(6, 2);
            e.Property(x => x.MaxTempCelsius).HasPrecision(6, 2);
            e.Property(x => x.LastReadingCelsius).HasPrecision(6, 2);
            e.HasOne(x => x.Shipment).WithMany(s => s.Sensors).HasForeignKey(x => x.ShipmentId);
        });
        modelBuilder.Entity<SensorReading>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TemperatureCelsius).HasPrecision(6, 2);
            e.HasOne(x => x.Sensor).WithMany(s => s.Readings).HasForeignKey(x => x.SensorId);
        });
        modelBuilder.Entity<ColdChainAlert>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.ExcursionPeakCelsius).HasPrecision(6, 2);
            e.Property(x => x.AllowedMinCelsius).HasPrecision(6, 2);
            e.Property(x => x.AllowedMaxCelsius).HasPrecision(6, 2);
            e.HasOne(x => x.Sensor).WithMany(s => s.Alerts).HasForeignKey(x => x.SensorId);
            e.HasOne(x => x.Shipment).WithMany().HasForeignKey(x => x.ShipmentId);
        });

        // ── RecoveryRecommendation ───────────────────────────────────────────
        modelBuilder.Entity<RecoveryRecommendation>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Confidence).HasPrecision(5, 4);
            e.Property(x => x.EstimatedCostDeltaUsd).HasPrecision(12, 2);
            e.HasOne(x => x.Shipment).WithMany(s => s.Recommendations).HasForeignKey(x => x.ShipmentId);
        });

        // ── DecisionAudit ───────────────────────────────────────────────────
        modelBuilder.Entity<DecisionAudit>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.OperatorId).HasMaxLength(200).IsRequired();
            e.Property(x => x.ActionType).HasMaxLength(100).IsRequired();
        });

        // ── ModelPrediction ─────────────────────────────────────────────────
        modelBuilder.Entity<ModelPrediction>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Score).HasPrecision(8, 6);
        });
    }
}
