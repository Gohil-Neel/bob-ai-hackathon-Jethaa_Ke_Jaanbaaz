using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Shipments API.
/// Connects to PostgreSQL / Supabase via AppDbContext.
/// </summary>
[ApiController]
[Route("api/shipments")]
public class ShipmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ShipmentsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all shipments with route details.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var shipments = await _context.Shipments
            .Include(s => s.Route)
            .Include(s => s.Sensors)
            .OrderByDescending(s => s.RiskScore)
            .Select(s => new
            {
                s.Id,
                s.TrackingNumber,
                s.Origin,
                s.Destination,
                s.CarrierCode,
                Status = s.Status.ToString(),
                Priority = s.Priority.ToString(),
                s.EstimatedArrivalUtc,
                s.IsColdChain,
                s.RouteId,
                RouteName = s.Route != null ? s.Route.Name : null,
                s.RiskScore,
                SensorsCount = s.Sensors.Count,
                s.CreatedAtUtc,
                s.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(shipments);
    }

    /// <summary>
    /// Gets a single shipment by ID with associated disruptions, sensors, and recommendations.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Route)
                .ThenInclude(r => r!.Segments)
            .Include(s => s.ShipmentDisruptions)
                .ThenInclude(sd => sd.Disruption)
            .Include(s => s.Sensors)
            .Include(s => s.Recommendations)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (shipment == null)
            return NotFound(new { message = $"Shipment with ID {id} not found." });

        var response = new
        {
            shipment.Id,
            shipment.TrackingNumber,
            shipment.Origin,
            shipment.Destination,
            shipment.CarrierCode,
            Status = shipment.Status.ToString(),
            Priority = shipment.Priority.ToString(),
            shipment.EstimatedArrivalUtc,
            shipment.IsColdChain,
            shipment.RouteId,
            Route = shipment.Route != null ? new
            {
                shipment.Route.Id,
                shipment.Route.Name,
                shipment.Route.Origin,
                shipment.Route.Destination,
                shipment.Route.EstimatedHours,
                Segments = shipment.Route.Segments.OrderBy(seg => seg.SequenceOrder).Select(seg => new
                {
                    seg.Id,
                    seg.SequenceOrder,
                    seg.FromLocation,
                    seg.ToLocation,
                    seg.TransportMode,
                    seg.EstimatedHours
                })
            } : null,
            shipment.RiskScore,
            Disruptions = shipment.ShipmentDisruptions.Select(sd => new
            {
                sd.DisruptionId,
                sd.Disruption.Title,
                DisruptionType = sd.Disruption.DisruptionType.ToString(),
                Severity = sd.Disruption.Severity.ToString(),
                sd.EstimatedDelayHours,
                sd.ImpactNotes
            }),
            Sensors = shipment.Sensors.Select(sen => new
            {
                sen.Id,
                sen.SensorCode,
                sen.MinTempCelsius,
                sen.MaxTempCelsius,
                sen.LastReadingCelsius,
                sen.LastReadingAtUtc,
                Status = sen.Status.ToString(),
                CurrentExcursionSeverity = sen.CurrentExcursionSeverity.HasValue ? sen.CurrentExcursionSeverity.Value.ToString() : null
            }),
            Recommendations = shipment.Recommendations.Select(r => new
            {
                r.Id,
                RecommendationType = r.RecommendationType.ToString(),
                r.Title,
                r.Rationale,
                Severity = r.Severity.ToString(),
                r.Confidence,
                r.EstimatedTimeSavingMinutes,
                r.EstimatedCostDeltaUsd,
                r.RequiresApproval
            }),
            shipment.CreatedAtUtc,
            shipment.UpdatedAtUtc
        };

        return Ok(response);
    }
}
