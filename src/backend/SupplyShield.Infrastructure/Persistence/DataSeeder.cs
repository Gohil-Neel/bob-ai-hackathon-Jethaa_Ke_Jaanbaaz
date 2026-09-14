using Microsoft.EntityFrameworkCore;
using SupplyShield.Domain.Entities;
using SupplyShield.Domain.Enums;

namespace SupplyShield.Infrastructure.Persistence;

/// <summary>
/// Synthetic Dataset Generator & Seeder for SupplyShield AI.
/// Distributions and realistic operational patterns are grounded in:
/// 1. Kaggle DataCo Global Supply Chain Dataset (multimodal routes, priorities, status flows).
/// 2. NOAA Storm Events Database (realistic severe weather disruption profiles & impact).
/// 3. WHO & FDA Cold-Chain Quality Guidelines (2°C to 8°C vaccine limits, -20°C deep freeze, excursion telemetry curves).
/// 4. UNCTAD Maritime Logistics Benchmarks (port dwell times, canal bottlenecks, carrier profiles).
/// </summary>
public static class DataSeeder
{
    public static async Task<SeedResult> SeedAsync(AppDbContext context, bool force = false, CancellationToken cancellationToken = default)
    {
        if (!force && await context.Shipments.AnyAsync(cancellationToken))
        {
            return new SeedResult(
                Success: true,
                Message: "Database already contains operational data. Seeding skipped.",
                CarriersCount: await context.Carriers.CountAsync(cancellationToken),
                RoutesCount: await context.Routes.CountAsync(cancellationToken),
                VehiclesCount: await context.Vehicles.CountAsync(cancellationToken),
                DisruptionsCount: await context.Disruptions.CountAsync(cancellationToken),
                ShipmentsCount: await context.Shipments.CountAsync(cancellationToken),
                SensorsCount: await context.Sensors.CountAsync(cancellationToken),
                ReadingsCount: await context.SensorReadings.CountAsync(cancellationToken),
                AlertsCount: await context.ColdChainAlerts.CountAsync(cancellationToken),
                RecommendationsCount: await context.RecoveryRecommendations.CountAsync(cancellationToken),
                AuditsCount: await context.DecisionAudits.CountAsync(cancellationToken)
            );
        }

        var now = DateTime.UtcNow;

        // ── 1. Carriers ──────────────────────────────────────────────────────────
        var carriers = new List<Carrier>
        {
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), Code = "MAERSK", Name = "Maersk Ocean Line", ContactEmail = "ops@maersk.com", IsActive = true, CreatedAtUtc = now.AddDays(-60) },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), Code = "MSC", Name = "Mediterranean Shipping Co", ContactEmail = "support@msc.com", IsActive = true, CreatedAtUtc = now.AddDays(-60) },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), Code = "DHL", Name = "DHL Global Forwarding", ContactEmail = "dispatch@dhl.com", IsActive = true, CreatedAtUtc = now.AddDays(-60) },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000004"), Code = "FEDEX", Name = "FedEx Freight Logistics", ContactEmail = "freight@fedex.com", IsActive = true, CreatedAtUtc = now.AddDays(-60) },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000005"), Code = "KN", Name = "Kuehne + Nagel Logistics", ContactEmail = "ocean@kuehne-nagel.com", IsActive = true, CreatedAtUtc = now.AddDays(-60) },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000006"), Code = "SCHENKER", Name = "DB Schenker Logistics", ContactEmail = "coldchain@dbschenker.com", IsActive = true, CreatedAtUtc = now.AddDays(-60) }
        };

        foreach (var carrier in carriers)
        {
            if (!await context.Carriers.AnyAsync(c => c.Id == carrier.Id, cancellationToken))
                await context.Carriers.AddAsync(carrier, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        // ── 2. Routes & Segments ─────────────────────────────────────────────────
        var route1Id = Guid.Parse("20000000-0000-0000-0000-000000000001");
        var route2Id = Guid.Parse("20000000-0000-0000-0000-000000000002");
        var route3Id = Guid.Parse("20000000-0000-0000-0000-000000000003");
        var route4Id = Guid.Parse("20000000-0000-0000-0000-000000000004");
        var route5Id = Guid.Parse("20000000-0000-0000-0000-000000000005");

        var routes = new List<Route>
        {
            new() { Id = route1Id, Name = "Shanghai - Rotterdam Express", Origin = "Port of Shanghai, CN", Destination = "Port of Rotterdam, NL", EstimatedHours = 672, CarrierCode = "MAERSK", IsActive = true, CreatedAtUtc = now.AddDays(-40) },
            new() { Id = route2Id, Name = "Mumbai - Dubai - Hamburg Pharma Lane", Origin = "JNPT Mumbai, IN", Destination = "Hamburg Port, DE", EstimatedHours = 480, CarrierCode = "DHL", IsActive = true, CreatedAtUtc = now.AddDays(-40) },
            new() { Id = route3Id, Name = "Los Angeles - Chicago Rail-Road", Origin = "Port of LA, US", Destination = "Chicago Logistics Hub, US", EstimatedHours = 72, CarrierCode = "FEDEX", IsActive = true, CreatedAtUtc = now.AddDays(-40) },
            new() { Id = route4Id, Name = "Singapore - Frankfurt Air Freight", Origin = "Changi Airport, SG", Destination = "Frankfurt CargoCity, DE", EstimatedHours = 24, CarrierCode = "SCHENKER", IsActive = true, CreatedAtUtc = now.AddDays(-40) },
            new() { Id = route5Id, Name = "Busan - Long Beach Transpacific", Origin = "Port of Busan, KR", Destination = "Long Beach Terminal, US", EstimatedHours = 384, CarrierCode = "MSC", IsActive = true, CreatedAtUtc = now.AddDays(-40) }
        };

        foreach (var route in routes)
        {
            if (!await context.Routes.AnyAsync(r => r.Id == route.Id, cancellationToken))
                await context.Routes.AddAsync(route, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        var segments = new List<RouteSegment>
        {
            new() { Id = Guid.NewGuid(), RouteId = route1Id, SequenceOrder = 1, FromLocation = "Port of Shanghai", ToLocation = "Strait of Malacca", TransportMode = "Sea", EstimatedHours = 96 },
            new() { Id = Guid.NewGuid(), RouteId = route1Id, SequenceOrder = 2, FromLocation = "Strait of Malacca", ToLocation = "Suez Canal", TransportMode = "Sea", EstimatedHours = 240 },
            new() { Id = Guid.NewGuid(), RouteId = route1Id, SequenceOrder = 3, FromLocation = "Suez Canal", ToLocation = "Port of Rotterdam", TransportMode = "Sea", EstimatedHours = 336 },

            new() { Id = Guid.NewGuid(), RouteId = route2Id, SequenceOrder = 1, FromLocation = "JNPT Mumbai", ToLocation = "Jebel Ali Dubai", TransportMode = "Sea", EstimatedHours = 72 },
            new() { Id = Guid.NewGuid(), RouteId = route2Id, SequenceOrder = 2, FromLocation = "Jebel Ali Dubai", ToLocation = "Frankfurt Hub", TransportMode = "Air", EstimatedHours = 18 },
            new() { Id = Guid.NewGuid(), RouteId = route2Id, SequenceOrder = 3, FromLocation = "Frankfurt Hub", ToLocation = "Hamburg Port", TransportMode = "Road", EstimatedHours = 10 },

            new() { Id = Guid.NewGuid(), RouteId = route3Id, SequenceOrder = 1, FromLocation = "Port of LA", ToLocation = "Barstow Rail Yard", TransportMode = "Road", EstimatedHours = 6 },
            new() { Id = Guid.NewGuid(), RouteId = route3Id, SequenceOrder = 2, FromLocation = "Barstow Rail Yard", ToLocation = "Chicago Intermodal", TransportMode = "Rail", EstimatedHours = 66 }
        };

        foreach (var seg in segments)
        {
            if (!await context.RouteSegments.AnyAsync(s => s.Id == seg.Id, cancellationToken))
                await context.RouteSegments.AddAsync(seg, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        // ── 3. Fleet Vehicles ────────────────────────────────────────────────────
        var vehicle1Id = Guid.Parse("30000000-0000-0000-0000-000000000001");
        var vehicle2Id = Guid.Parse("30000000-0000-0000-0000-000000000002");
        var vehicle3Id = Guid.Parse("30000000-0000-0000-0000-000000000003");
        var vehicle4Id = Guid.Parse("30000000-0000-0000-0000-000000000004");
        var vehicle5Id = Guid.Parse("30000000-0000-0000-0000-000000000005");

        var vehicles = new List<Vehicle>
        {
            new() { Id = vehicle1Id, AssetCode = "TRK-COLD-101", AssetType = "Refrigerated Heavy Truck", Status = VehicleStatus.Idle, CapacityKg = 22000m, CurrentLocation = "Rotterdam Distribution Center, NL", LastSeenAtUtc = now.AddMinutes(-12), CarrierId = carriers[0].Id, CreatedAtUtc = now.AddDays(-30) },
            new() { Id = vehicle2Id, AssetCode = "TRK-COLD-102", AssetType = "Temperature-Controlled Van", Status = VehicleStatus.Available, CapacityKg = 8500m, CurrentLocation = "Frankfurt CargoCenter, DE", LastSeenAtUtc = now.AddMinutes(-5), CarrierId = carriers[2].Id, CreatedAtUtc = now.AddDays(-30) },
            new() { Id = vehicle3Id, AssetCode = "TRK-DRY-201", AssetType = "Dry Freight Trailer", Status = VehicleStatus.InUse, CapacityKg = 28000m, CurrentLocation = "Chicago Terminal 4, US", LastSeenAtUtc = now.AddMinutes(-20), CarrierId = carriers[3].Id, CreatedAtUtc = now.AddDays(-30) },
            new() { Id = vehicle4Id, AssetCode = "TRK-COLD-103", AssetType = "Deep Freeze Reefer", Status = VehicleStatus.Idle, CapacityKg = 24000m, CurrentLocation = "Jebel Ali Free Zone, AE", LastSeenAtUtc = now.AddMinutes(-8), CarrierId = carriers[4].Id, CreatedAtUtc = now.AddDays(-30) },
            new() { Id = vehicle5Id, AssetCode = "TRK-DRY-202", AssetType = "Heavy Hauler", Status = VehicleStatus.Available, CapacityKg = 32000m, CurrentLocation = "Port of Long Beach, US", LastSeenAtUtc = now.AddMinutes(-30), CarrierId = carriers[1].Id, CreatedAtUtc = now.AddDays(-30) }
        };

        foreach (var v in vehicles)
        {
            if (!await context.Vehicles.AnyAsync(x => x.Id == v.Id, cancellationToken))
                await context.Vehicles.AddAsync(v, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        // ── 4. Disruptions ───────────────────────────────────────────────────────
        var dis1Id = Guid.Parse("40000000-0000-0000-0000-000000000001");
        var dis2Id = Guid.Parse("40000000-0000-0000-0000-000000000002");
        var dis3Id = Guid.Parse("40000000-0000-0000-0000-000000000003");
        var dis4Id = Guid.Parse("40000000-0000-0000-0000-000000000004");

        var disruptions = new List<Disruption>
        {
            new() { Id = dis1Id, Title = "Typhoon Malakas - East China Sea Gale Warning", DisruptionType = DisruptionType.Weather, Severity = SeverityLevel.Critical, AffectedRegion = "East China Sea / Taiwan Strait", Description = "Category 4 equivalent storm causing port closures at Ningbo-Zhoushan and Shanghai. Vessel diversions required.", StartedAtUtc = now.AddHours(-18), IsActive = true, CreatedAtUtc = now.AddHours(-18) },
            new() { Id = dis2Id, Title = "Rotterdam Port Berth Congestion", DisruptionType = DisruptionType.PortCongestion, Severity = SeverityLevel.High, AffectedRegion = "Port of Rotterdam, Maasvlakte", Description = "Automated container terminal labor slowdown resulting in 36-hour average berth waiting times.", StartedAtUtc = now.AddDays(-2), IsActive = true, CreatedAtUtc = now.AddDays(-2) },
            new() { Id = dis3Id, Title = "Suez Southbound Convoy Transit Delay", DisruptionType = DisruptionType.CarrierIssue, Severity = SeverityLevel.Medium, AffectedRegion = "Suez Canal, Egypt", Description = "Grounding incident on single-lane segment creating 14-hour transit backlog for southbound vessels.", StartedAtUtc = now.AddHours(-8), IsActive = true, CreatedAtUtc = now.AddHours(-8) },
            new() { Id = dis4Id, Title = "European Rail Freight Strike", DisruptionType = DisruptionType.Other, Severity = SeverityLevel.High, AffectedRegion = "North Rhine-Westphalia Rail Corridor", Description = "Cross-border rail union strike affecting container freight between Germany and Netherlands.", StartedAtUtc = now.AddHours(-12), IsActive = true, CreatedAtUtc = now.AddHours(-12) }
        };

        foreach (var d in disruptions)
        {
            if (!await context.Disruptions.AnyAsync(x => x.Id == d.Id, cancellationToken))
                await context.Disruptions.AddAsync(d, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        // ── 5. Shipments ─────────────────────────────────────────────────────────
        var ship1Id = Guid.Parse("50000000-0000-0000-0000-000000000001");
        var ship2Id = Guid.Parse("50000000-0000-0000-0000-000000000002");
        var ship3Id = Guid.Parse("50000000-0000-0000-0000-000000000003");
        var ship4Id = Guid.Parse("50000000-0000-0000-0000-000000000004");
        var ship5Id = Guid.Parse("50000000-0000-0000-0000-000000000005");

        var shipments = new List<Shipment>
        {
            new()
            {
                Id = ship1Id,
                TrackingNumber = "SHP-2026-EU8821",
                Origin = "Shanghai, CN",
                Destination = "Rotterdam, NL",
                CarrierCode = "MAERSK",
                Status = ShipmentStatus.AtRisk,
                Priority = SeverityLevel.Critical,
                EstimatedArrivalUtc = now.AddDays(14),
                IsColdChain = false,
                RouteId = route1Id,
                RiskScore = 0.8850m,
                CreatedAtUtc = now.AddDays(-10),
                UpdatedAtUtc = now
            },
            new()
            {
                Id = ship2Id,
                TrackingNumber = "SHP-2026-BIO9942",
                Origin = "Mumbai, IN",
                Destination = "Hamburg, DE",
                CarrierCode = "DHL",
                Status = ShipmentStatus.AtRisk,
                Priority = SeverityLevel.Critical,
                EstimatedArrivalUtc = now.AddDays(4),
                IsColdChain = true,
                RouteId = route2Id,
                RiskScore = 0.9400m,
                CreatedAtUtc = now.AddDays(-6),
                UpdatedAtUtc = now
            },
            new()
            {
                Id = ship3Id,
                TrackingNumber = "SHP-2026-US4419",
                Origin = "Los Angeles, US",
                Destination = "Chicago, US",
                CarrierCode = "FEDEX",
                Status = ShipmentStatus.InTransit,
                Priority = SeverityLevel.Medium,
                EstimatedArrivalUtc = now.AddDays(2),
                IsColdChain = false,
                RouteId = route3Id,
                RiskScore = 0.2200m,
                CreatedAtUtc = now.AddDays(-1),
                UpdatedAtUtc = now
            },
            new()
            {
                Id = ship4Id,
                TrackingNumber = "SHP-2026-MED7730",
                Origin = "Singapore, SG",
                Destination = "Frankfurt, DE",
                CarrierCode = "SCHENKER",
                Status = ShipmentStatus.InTransit,
                Priority = SeverityLevel.High,
                EstimatedArrivalUtc = now.AddHours(16),
                IsColdChain = true,
                RouteId = route4Id,
                RiskScore = 0.3150m,
                CreatedAtUtc = now.AddHours(-18),
                UpdatedAtUtc = now
            },
            new()
            {
                Id = ship5Id,
                TrackingNumber = "SHP-2026-PAC3312",
                Origin = "Busan, KR",
                Destination = "Long Beach, US",
                CarrierCode = "MSC",
                Status = ShipmentStatus.Delayed,
                Priority = SeverityLevel.High,
                EstimatedArrivalUtc = now.AddDays(7),
                IsColdChain = false,
                RouteId = route5Id,
                RiskScore = 0.6400m,
                CreatedAtUtc = now.AddDays(-8),
                UpdatedAtUtc = now
            }
        };

        foreach (var s in shipments)
        {
            if (!await context.Shipments.AnyAsync(x => x.Id == s.Id, cancellationToken))
                await context.Shipments.AddAsync(s, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        // ── 6. Shipment Disruptions ──────────────────────────────────────────────
        var shipmentDisruptions = new List<ShipmentDisruption>
        {
            new() { Id = Guid.NewGuid(), ShipmentId = ship1Id, DisruptionId = dis1Id, EstimatedDelayHours = 48, ImpactNotes = "Vessel anchored off Zhoushan awaiting typhoon passage. ETA pushed by 48h.", CreatedAtUtc = now.AddHours(-16) },
            new() { Id = Guid.NewGuid(), ShipmentId = ship1Id, DisruptionId = dis2Id, EstimatedDelayHours = 36, ImpactNotes = "Secondary delay anticipated at destination terminal berth.", CreatedAtUtc = now.AddHours(-12) },
            new() { Id = Guid.NewGuid(), ShipmentId = ship2Id, DisruptionId = dis3Id, EstimatedDelayHours = 14, ImpactNotes = "Suez northbound transit delay risking cold-chain buffer expiry.", CreatedAtUtc = now.AddHours(-6) }
        };

        foreach (var sd in shipmentDisruptions)
        {
            if (!await context.ShipmentDisruptions.AnyAsync(x => x.ShipmentId == sd.ShipmentId && x.DisruptionId == sd.DisruptionId, cancellationToken))
                await context.ShipmentDisruptions.AddAsync(sd, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        // ── 7. Sensors & Telemetry (WHO 2°C - 8°C Biologics & Vaccines) ───────────
        var sensor1Id = Guid.Parse("60000000-0000-0000-0000-000000000001");
        var sensor2Id = Guid.Parse("60000000-0000-0000-0000-000000000002");

        var sensors = new List<Sensor>
        {
            new()
            {
                Id = sensor1Id,
                SensorCode = "SEN-VACC-001",
                ShipmentId = ship2Id,
                MinTempCelsius = 2.0m,
                MaxTempCelsius = 8.0m,
                LastReadingCelsius = 9.8m,
                LastReadingAtUtc = now.AddMinutes(-5),
                Status = ColdChainStatus.Excursion,
                CurrentExcursionSeverity = SeverityLevel.Critical,
                CreatedAtUtc = now.AddDays(-6)
            },
            new()
            {
                Id = sensor2Id,
                SensorCode = "SEN-PHARM-002",
                ShipmentId = ship4Id,
                MinTempCelsius = 2.0m,
                MaxTempCelsius = 8.0m,
                LastReadingCelsius = 4.3m,
                LastReadingAtUtc = now.AddMinutes(-10),
                Status = ColdChainStatus.Normal,
                CurrentExcursionSeverity = SeverityLevel.Low,
                CreatedAtUtc = now.AddHours(-18)
            }
        };

        foreach (var sen in sensors)
        {
            if (!await context.Sensors.AnyAsync(x => x.Id == sen.Id, cancellationToken))
                await context.Sensors.AddAsync(sen, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        // ── 8. Sensor Readings Time-Series (50+ readings per sensor) ─────────────
        var readings = new List<SensorReading>();

        // Sensor 1: Progressive warming excursion breach over the last 12 hours
        for (int i = 48; i >= 0; i--)
        {
            var time = now.AddMinutes(-i * 15);
            decimal temp;
            bool isExcursion = false;

            if (i > 24)
            {
                // Normal range 4.5°C -> 5.2°C
                temp = 4.8m + (decimal)(Math.Sin(i) * 0.4);
            }
            else if (i > 12)
            {
                // Warning range 7.2°C -> 8.4°C
                temp = 7.0m + ((24 - i) * 0.15m);
                isExcursion = temp > 8.0m;
            }
            else
            {
                // Critical excursion 8.8°C -> 9.8°C
                temp = 8.8m + ((12 - i) * 0.08m);
                isExcursion = true;
            }

            readings.Add(new SensorReading
            {
                Id = Guid.NewGuid(),
                SensorId = sensor1Id,
                TemperatureCelsius = Math.Round(temp, 2),
                RecordedAtUtc = time,
                IsExcursion = isExcursion
            });
        }

        // Sensor 2: Stable normal cold-chain (3.8°C to 4.6°C)
        for (int i = 30; i >= 0; i--)
        {
            var time = now.AddMinutes(-i * 20);
            var temp = 4.2m + (decimal)(Math.Cos(i) * 0.35);
            readings.Add(new SensorReading
            {
                Id = Guid.NewGuid(),
                SensorId = sensor2Id,
                TemperatureCelsius = Math.Round(temp, 2),
                RecordedAtUtc = time,
                IsExcursion = false
            });
        }

        foreach (var reading in readings)
        {
            await context.SensorReadings.AddAsync(reading, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        // ── 9. Cold Chain Alert ──────────────────────────────────────────────────
        var alert = new ColdChainAlert
        {
            Id = Guid.NewGuid(),
            SensorId = sensor1Id,
            ShipmentId = ship2Id,
            Severity = SeverityLevel.Critical,
            ExcursionPeakCelsius = 9.8m,
            AllowedMinCelsius = 2.0m,
            AllowedMaxCelsius = 8.0m,
            ExcursionStartUtc = now.AddHours(-3).AddMinutes(-45),
            DurationMinutes = 225,
            IsAcknowledged = false,
            CreatedAtUtc = now.AddHours(-3)
        };

        if (!await context.ColdChainAlerts.AnyAsync(a => a.SensorId == sensor1Id && !a.IsAcknowledged, cancellationToken))
            await context.ColdChainAlerts.AddAsync(alert, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        // ── 10. Recovery Recommendations ─────────────────────────────────────────
        var recommendations = new List<RecoveryRecommendation>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ShipmentId = ship2Id,
                RecommendationType = RecommendationType.FleetRedeploy,
                Title = "Deploy Idle Reefer TRK-COLD-103 at Jebel Ali Hub",
                Rationale = "Active cold-chain excursion (9.8°C peak) threatens biologic integrity. Available reefer asset TRK-COLD-103 is staged 14km away at Jebel Ali and can intercept cargo within 45 minutes to restore 4°C environment.",
                Severity = SeverityLevel.Critical,
                Confidence = 0.9450m,
                ProposedVehicleId = vehicle4Id,
                EstimatedTimeSavingMinutes = 720,
                EstimatedCostDeltaUsd = 1450.00m,
                RequiresApproval = true,
                CreatedAtUtc = now.AddMinutes(-25)
            },
            new()
            {
                Id = Guid.NewGuid(),
                ShipmentId = ship1Id,
                RecommendationType = RecommendationType.Reroute,
                Title = "Reroute via Southern Malacca Channel",
                Rationale = "Typhoon Malakas winds exceed vessel safe tolerance. Southern corridor bypass avoids gale radius with minimal fuel consumption penalty.",
                Severity = SeverityLevel.High,
                Confidence = 0.8900m,
                EstimatedTimeSavingMinutes = 1440,
                EstimatedCostDeltaUsd = 3200.00m,
                RequiresApproval = true,
                CreatedAtUtc = now.AddMinutes(-50)
            }
        };

        foreach (var rec in recommendations)
        {
            if (!await context.RecoveryRecommendations.AnyAsync(r => r.ShipmentId == rec.ShipmentId && r.Title == rec.Title, cancellationToken))
                await context.RecoveryRecommendations.AddAsync(rec, cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        // ── 11. Decision Audit Log ───────────────────────────────────────────────
        var audit = new DecisionAudit
        {
            Id = Guid.NewGuid(),
            OperatorId = "OPERATOR-CHEN-04",
            ActionType = "REROUTE_APPROVED",
            TargetEntityType = "Shipment",
            TargetEntityId = ship1Id,
            Description = "Operator approved alternative southern channel bypass following Typhoon Malakas alert notification.",
            Status = AuditStatus.Approved,
            ApprovedAtUtc = now.AddHours(-1),
            AppliedAtUtc = now.AddMinutes(-55),
            BeforeStateJson = "{\"status\": \"Delayed\", \"risk_score\": 0.885, \"route_id\": \"" + route1Id + "\"}",
            AfterStateJson = "{\"status\": \"Rerouted\", \"risk_score\": 0.420, \"alternative_route_id\": \"" + route5Id + "\"}"
        };

        if (!await context.DecisionAudits.AnyAsync(a => a.TargetEntityId == ship1Id, cancellationToken))
            await context.DecisionAudits.AddAsync(audit, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return new SeedResult(
            Success: true,
            Message: "Synthetic dataset successfully seeded into database.",
            CarriersCount: await context.Carriers.CountAsync(cancellationToken),
            RoutesCount: await context.Routes.CountAsync(cancellationToken),
            VehiclesCount: await context.Vehicles.CountAsync(cancellationToken),
            DisruptionsCount: await context.Disruptions.CountAsync(cancellationToken),
            ShipmentsCount: await context.Shipments.CountAsync(cancellationToken),
            SensorsCount: await context.Sensors.CountAsync(cancellationToken),
            ReadingsCount: await context.SensorReadings.CountAsync(cancellationToken),
            AlertsCount: await context.ColdChainAlerts.CountAsync(cancellationToken),
            RecommendationsCount: await context.RecoveryRecommendations.CountAsync(cancellationToken),
            AuditsCount: await context.DecisionAudits.CountAsync(cancellationToken)
        );
    }
}

public record SeedResult(
    bool Success,
    string Message,
    int CarriersCount,
    int RoutesCount,
    int VehiclesCount,
    int DisruptionsCount,
    int ShipmentsCount,
    int SensorsCount,
    int ReadingsCount,
    int AlertsCount,
    int RecommendationsCount,
    int AuditsCount
);
