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
            e.ToTable("shipments");
            e.HasKey(x => x.Id);
            e.Property(x => x.TrackingNumber).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.TrackingNumber).IsUnique();
            e.Property(x => x.Origin).HasMaxLength(200).IsRequired();
            e.Property(x => x.Destination).HasMaxLength(200).IsRequired();
            e.Property(x => x.CarrierCode).HasMaxLength(50).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.Property(x => x.Priority).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.Property(x => x.RiskScore).HasPrecision(5, 4);
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.Priority);
            e.HasIndex(x => x.CarrierCode);
            e.HasOne(x => x.Route)
                .WithMany(r => r.Shipments)
                .HasForeignKey(x => x.RouteId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        // ── Disruption ──────────────────────────────────────────────────────
        modelBuilder.Entity<Disruption>(e =>
        {
            e.ToTable("disruptions");
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.DisruptionType).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.Property(x => x.Severity).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.Property(x => x.AffectedRegion).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(2000);
            e.HasIndex(x => x.DisruptionType);
            e.HasIndex(x => x.Severity);
            e.HasIndex(x => x.IsActive);
        });

        // ── ShipmentDisruption ───────────────────────────────────────────────
        modelBuilder.Entity<ShipmentDisruption>(e =>
        {
            e.ToTable("shipment_disruptions");
            e.HasKey(x => x.Id);
            e.Property(x => x.ImpactNotes).HasMaxLength(1000);
            e.HasOne(x => x.Shipment)
                .WithMany(s => s.ShipmentDisruptions)
                .HasForeignKey(x => x.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Disruption)
                .WithMany(d => d.ShipmentDisruptions)
                .HasForeignKey(x => x.DisruptionId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.ShipmentId, x.DisruptionId }).IsUnique();
        });

        // ── Route / RouteSegment ─────────────────────────────────────────────
        modelBuilder.Entity<Route>(e =>
        {
            e.ToTable("routes");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Origin).HasMaxLength(200).IsRequired();
            e.Property(x => x.Destination).HasMaxLength(200).IsRequired();
            e.Property(x => x.CarrierCode).HasMaxLength(50);
            e.HasIndex(x => x.IsActive);
        });

        modelBuilder.Entity<RouteSegment>(e =>
        {
            e.ToTable("route_segments");
            e.HasKey(x => x.Id);
            e.Property(x => x.FromLocation).HasMaxLength(200).IsRequired();
            e.Property(x => x.ToLocation).HasMaxLength(200).IsRequired();
            e.Property(x => x.TransportMode).HasMaxLength(50).IsRequired();
            e.HasOne(x => x.Route)
                .WithMany(r => r.Segments)
                .HasForeignKey(x => x.RouteId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.RouteId, x.SequenceOrder });
        });

        // ── Vehicle / Carrier / VehicleAssignment ────────────────────────────
        modelBuilder.Entity<Carrier>(e =>
        {
            e.ToTable("carriers");
            e.HasKey(x => x.Id);
            e.Property(x => x.Code).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.ContactEmail).HasMaxLength(200);
            e.HasIndex(x => x.IsActive);
        });

        modelBuilder.Entity<Vehicle>(e =>
        {
            e.ToTable("vehicles");
            e.HasKey(x => x.Id);
            e.Property(x => x.AssetCode).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.AssetCode).IsUnique();
            e.Property(x => x.AssetType).HasMaxLength(100).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.Property(x => x.CapacityKg).HasPrecision(10, 2);
            e.Property(x => x.CurrentLocation).HasMaxLength(200).IsRequired();
            e.HasIndex(x => x.Status);
            e.HasOne(x => x.Carrier)
                .WithMany(c => c.Vehicles)
                .HasForeignKey(x => x.CarrierId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        modelBuilder.Entity<VehicleAssignment>(e =>
        {
            e.ToTable("vehicle_assignments");
            e.HasKey(x => x.Id);
            e.Property(x => x.Notes).HasMaxLength(500);
            e.HasOne(x => x.Vehicle)
                .WithMany(v => v.Assignments)
                .HasForeignKey(x => x.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Shipment)
                .WithMany(s => s.VehicleAssignments)
                .HasForeignKey(x => x.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.VehicleId, x.ShipmentId });
        });

        // ── Sensor / Reading / Alert ─────────────────────────────────────────
        modelBuilder.Entity<Sensor>(e =>
        {
            e.ToTable("sensors");
            e.HasKey(x => x.Id);
            e.Property(x => x.SensorCode).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.SensorCode).IsUnique();
            e.Property(x => x.MinTempCelsius).HasPrecision(6, 2);
            e.Property(x => x.MaxTempCelsius).HasPrecision(6, 2);
            e.Property(x => x.LastReadingCelsius).HasPrecision(6, 2);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.Property(x => x.CurrentExcursionSeverity).HasConversion<string>().HasMaxLength(50);
            e.HasOne(x => x.Shipment)
                .WithMany(s => s.Sensors)
                .HasForeignKey(x => x.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.Status);
        });

        modelBuilder.Entity<SensorReading>(e =>
        {
            e.ToTable("sensor_readings");
            e.HasKey(x => x.Id);
            e.Property(x => x.TemperatureCelsius).HasPrecision(6, 2);
            e.HasOne(x => x.Sensor)
                .WithMany(s => s.Readings)
                .HasForeignKey(x => x.SensorId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.SensorId, x.RecordedAtUtc });
            e.HasIndex(x => x.IsExcursion);
        });

        modelBuilder.Entity<ColdChainAlert>(e =>
        {
            e.ToTable("cold_chain_alerts");
            e.HasKey(x => x.Id);
            e.Property(x => x.Severity).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.Property(x => x.ExcursionPeakCelsius).HasPrecision(6, 2);
            e.Property(x => x.AllowedMinCelsius).HasPrecision(6, 2);
            e.Property(x => x.AllowedMaxCelsius).HasPrecision(6, 2);
            e.HasOne(x => x.Sensor)
                .WithMany(s => s.Alerts)
                .HasForeignKey(x => x.SensorId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Shipment)
                .WithMany()
                .HasForeignKey(x => x.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.Severity);
            e.HasIndex(x => x.IsAcknowledged);
        });

        // ── RecoveryRecommendation ───────────────────────────────────────────
        modelBuilder.Entity<RecoveryRecommendation>(e =>
        {
            e.ToTable("recovery_recommendations");
            e.HasKey(x => x.Id);
            e.Property(x => x.RecommendationType).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Rationale).HasMaxLength(2000).IsRequired();
            e.Property(x => x.Severity).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.Property(x => x.Confidence).HasPrecision(5, 4);
            e.Property(x => x.ProposedCarrierCode).HasMaxLength(50);
            e.Property(x => x.EstimatedCostDeltaUsd).HasPrecision(12, 2);
            e.HasOne(x => x.Shipment)
                .WithMany(s => s.Recommendations)
                .HasForeignKey(x => x.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.RecommendationType);
            e.HasIndex(x => x.Severity);
        });

        // ── DecisionAudit ───────────────────────────────────────────────────
        modelBuilder.Entity<DecisionAudit>(e =>
        {
            e.ToTable("decision_audits");
            e.HasKey(x => x.Id);
            e.Property(x => x.OperatorId).HasMaxLength(200).IsRequired();
            e.Property(x => x.ActionType).HasMaxLength(100).IsRequired();
            e.Property(x => x.TargetEntityType).HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasMaxLength(2000).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.ActionType);
            e.HasIndex(x => x.TargetEntityType);
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.ApprovedAtUtc);
        });

        // ── ModelPrediction ─────────────────────────────────────────────────
        modelBuilder.Entity<ModelPrediction>(e =>
        {
            e.ToTable("model_predictions");
            e.HasKey(x => x.Id);
            e.Property(x => x.ModelName).HasMaxLength(100).IsRequired();
            e.Property(x => x.ModelVersion).HasMaxLength(50).IsRequired();
            e.Property(x => x.ContextType).HasMaxLength(50).IsRequired();
            e.Property(x => x.PredictionType).HasMaxLength(100).IsRequired();
            e.Property(x => x.Score).HasPrecision(8, 6);
            e.HasIndex(x => new { x.ContextType, x.ContextEntityId });
            e.HasIndex(x => x.ModelName);
        });

        // ── Apply snake_case naming convention across all PostgreSQL tables & columns ──
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var tableName = entity.GetTableName();
            if (!string.IsNullOrEmpty(tableName))
            {
                entity.SetTableName(ToSnakeCase(tableName));
            }

            foreach (var property in entity.GetProperties())
            {
                var columnName = property.GetColumnName();
                if (!string.IsNullOrEmpty(columnName))
                {
                    property.SetColumnName(ToSnakeCase(columnName));
                }
            }

            foreach (var key in entity.GetKeys())
            {
                var keyName = key.GetName();
                if (!string.IsNullOrEmpty(keyName))
                {
                    key.SetName(ToSnakeCase(keyName));
                }
            }

            foreach (var key in entity.GetForeignKeys())
            {
                var constraintName = key.GetConstraintName();
                if (!string.IsNullOrEmpty(constraintName))
                {
                    key.SetConstraintName(ToSnakeCase(constraintName));
                }
            }

            foreach (var index in entity.GetIndexes())
            {
                var databaseName = index.GetDatabaseName();
                if (!string.IsNullOrEmpty(databaseName))
                {
                    index.SetDatabaseName(ToSnakeCase(databaseName));
                }
            }
        }
    }

    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        var sb = new System.Text.StringBuilder();
        for (int i = 0; i < input.Length; i++)
        {
            char c = input[i];
            if (char.IsUpper(c))
            {
                if (i > 0 && input[i - 1] != '_')
                    sb.Append('_');
                sb.Append(char.ToLowerInvariant(c));
            }
            else
            {
                sb.Append(c);
            }
        }
        return sb.ToString();
    }
}
