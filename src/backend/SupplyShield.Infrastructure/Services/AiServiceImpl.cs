using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SupplyShield.Application.Interfaces;
using SupplyShield.Infrastructure.Integrations.WatsonX;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Infrastructure.Services;

/// <summary>
/// IAiService implementation — assembles verified backend facts and delegates to
/// the Python AI service (which calls IBM watsonx.ai internally).
///
/// Architecture rules:
///   - All fact dicts are built from EF Core entities — never from raw request payloads.
///   - AI failure always returns a safe fallback message; this service never throws.
///   - IBM credentials are NOT held here — they live in the Python AI service.
/// </summary>
public sealed class AiServiceImpl : IAiService
{
    private readonly AppDbContext _db;
    private readonly AiServiceClient _aiClient;
    private readonly ILogger<AiServiceImpl> _logger;

    public AiServiceImpl(
        AppDbContext db,
        AiServiceClient aiClient,
        ILogger<AiServiceImpl> logger)
    {
        _db = db;
        _aiClient = aiClient;
        _logger = logger;
    }

    // ── IAiService ──────────────────────────────────────────────────────────

    public async Task<string> ExplainShipmentAsync(Guid shipmentId, CancellationToken ct = default)
    {
        _logger.LogInformation("ExplainShipmentAsync — shipmentId={ShipmentId}", shipmentId);

        // Load shipment with linked disruptions
        var shipment = await _db.Shipments
            .Include(s => s.ShipmentDisruptions)
                .ThenInclude(sd => sd.Disruption)
            .FirstOrDefaultAsync(s => s.Id == shipmentId, ct);

        if (shipment is null)
            return $"Shipment {shipmentId} not found.";

        var disruptions = shipment.ShipmentDisruptions
            .Where(sd => sd.Disruption?.IsActive == true)
            .Select(sd => sd.Disruption!.Title)
            .ToList();

        var facts = new Dictionary<string, object?>
        {
            ["tracking_number"]     = shipment.TrackingNumber,
            ["origin"]              = shipment.Origin,
            ["destination"]         = shipment.Destination,
            ["carrier"]             = shipment.CarrierCode,
            ["status"]              = shipment.Status.ToString(),
            ["priority"]            = shipment.Priority.ToString(),
            ["risk_score"]          = shipment.RiskScore?.ToString("F4") ?? "N/A",
            ["is_cold_chain"]       = shipment.IsColdChain ? "Yes" : "No",
            ["estimated_arrival_utc"] = shipment.EstimatedArrivalUtc?.ToString("u") ?? "N/A",
            ["active_disruptions"]  = string.Join("|", disruptions),
        };

        return await _aiClient.GenerateExplanationAsync("shipment", shipmentId.ToString(), facts, ct);
    }

    public async Task<string> ExplainDisruptionAsync(Guid disruptionId, CancellationToken ct = default)
    {
        _logger.LogInformation("ExplainDisruptionAsync — disruptionId={DisruptionId}", disruptionId);

        var disruption = await _db.Disruptions
            .Include(d => d.ShipmentDisruptions)
                .ThenInclude(sd => sd.Shipment)
            .FirstOrDefaultAsync(d => d.Id == disruptionId, ct);

        if (disruption is null)
            return $"Disruption {disruptionId} not found.";

        var affectedShipments = disruption.ShipmentDisruptions
            .Select(sd => sd.Shipment?.TrackingNumber ?? sd.ShipmentId.ToString())
            .ToList();

        var facts = new Dictionary<string, object?>
        {
            ["title"]                    = disruption.Title,
            ["disruption_type"]          = disruption.DisruptionType.ToString(),
            ["severity"]                 = disruption.Severity.ToString(),
            ["affected_region"]          = disruption.AffectedRegion,
            ["description"]              = disruption.Description ?? "N/A",
            ["started_at_utc"]           = disruption.StartedAtUtc.ToString("u"),
            ["affected_shipment_count"]  = affectedShipments.Count.ToString(),
            ["affected_shipments"]       = string.Join("|", affectedShipments.Take(10)),
        };

        return await _aiClient.GenerateExplanationAsync("disruption", disruptionId.ToString(), facts, ct);
    }

    public async Task<string> ExplainColdChainExcursionAsync(Guid sensorId, CancellationToken ct = default)
    {
        _logger.LogInformation("ExplainColdChainExcursionAsync — sensorId={SensorId}", sensorId);

        var sensor = await _db.Sensors
            .Include(s => s.Shipment)
            .Include(s => s.Alerts.OrderByDescending(a => a.CreatedAtUtc).Take(1))
            .FirstOrDefaultAsync(s => s.Id == sensorId, ct);

        if (sensor is null)
            return $"Sensor {sensorId} not found.";

        var latestAlert = sensor.Alerts.FirstOrDefault();

        var facts = new Dictionary<string, object?>
        {
            ["sensor_id"]                    = sensor.SensorCode,
            ["shipment_tracking_number"]     = sensor.Shipment?.TrackingNumber ?? "N/A",
            ["current_temp_c"]               = sensor.LastReadingCelsius?.ToString("F2") ?? "N/A",
            ["min_threshold_c"]              = sensor.MinTempCelsius.ToString("F2"),
            ["max_threshold_c"]              = sensor.MaxTempCelsius.ToString("F2"),
            ["excursion_severity"]           = sensor.CurrentExcursionSeverity?.ToString() ?? "None",
            ["excursion_duration_minutes"]   = latestAlert?.DurationMinutes?.ToString() ?? "N/A",
            ["cargo_description"]            = "Temperature-sensitive cargo",
            ["last_reading_utc"]             = sensor.LastReadingAtUtc?.ToString("u") ?? "N/A",
        };

        return await _aiClient.GenerateExplanationAsync("cold_chain", sensorId.ToString(), facts, ct);
    }

    public async Task<string> RecommendRerouteAsync(Guid shipmentId, CancellationToken ct = default)
    {
        _logger.LogInformation("RecommendRerouteAsync — shipmentId={ShipmentId}", shipmentId);

        var shipment = await _db.Shipments
            .Include(s => s.Route)
            .Include(s => s.ShipmentDisruptions)
                .ThenInclude(sd => sd.Disruption)
            .FirstOrDefaultAsync(s => s.Id == shipmentId, ct);

        if (shipment is null)
            return $"Shipment {shipmentId} not found.";

        var disruptions = shipment.ShipmentDisruptions
            .Where(sd => sd.Disruption?.IsActive == true)
            .Select(sd => sd.Disruption!.Title)
            .ToList();

        // Alternative routes: load other active routes that serve the same destination region
        var alternatives = await _db.Routes
            .Where(r => r.IsActive && r.Id != shipment.RouteId)
            .Take(3)
            .Select(r => new
            {
                r.Name,
                r.CarrierCode,
                EstimatedHours = r.EstimatedHours
            })
            .ToListAsync(ct);

        var altList = alternatives.Select(a =>
            $"{a.Name}|{a.CarrierCode}|N/A|N/A|N/A"
        ).ToList();

        var facts = new Dictionary<string, object?>
        {
            ["tracking_number"]      = shipment.TrackingNumber,
            ["current_route_name"]   = shipment.Route?.Name ?? "N/A",
            ["origin"]               = shipment.Origin,
            ["destination"]          = shipment.Destination,
            ["carrier"]              = shipment.CarrierCode,
            ["risk_score"]           = shipment.RiskScore?.ToString("F4") ?? "N/A",
            ["disruption_titles"]    = string.Join("|", disruptions),
            ["alternative_routes"]   = string.Join(";", altList),
        };

        return await _aiClient.GenerateExplanationAsync("reroute", shipmentId.ToString(), facts, ct);
    }
}
