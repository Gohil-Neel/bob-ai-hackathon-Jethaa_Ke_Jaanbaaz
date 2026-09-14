using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Disruptions API.
/// Connects to PostgreSQL / Supabase via AppDbContext.
/// </summary>
[ApiController]
[Route("api/disruptions")]
public class DisruptionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DisruptionsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all disruptions with affected shipment counts.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var disruptions = await _context.Disruptions
            .Include(d => d.ShipmentDisruptions)
            .OrderByDescending(d => d.Severity)
            .Select(d => new
            {
                d.Id,
                d.Title,
                DisruptionType = d.DisruptionType.ToString(),
                Severity = d.Severity.ToString(),
                d.AffectedRegion,
                d.Description,
                d.StartedAtUtc,
                d.ResolvedAtUtc,
                d.IsActive,
                AffectedShipmentsCount = d.ShipmentDisruptions.Count,
                d.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(disruptions);
    }

    /// <summary>
    /// Gets a single disruption by ID with affected shipments list.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var disruption = await _context.Disruptions
            .Include(d => d.ShipmentDisruptions)
                .ThenInclude(sd => sd.Shipment)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (disruption == null)
            return NotFound(new { message = $"Disruption with ID {id} not found." });

        var response = new
        {
            disruption.Id,
            disruption.Title,
            DisruptionType = disruption.DisruptionType.ToString(),
            Severity = disruption.Severity.ToString(),
            disruption.AffectedRegion,
            disruption.Description,
            disruption.StartedAtUtc,
            disruption.ResolvedAtUtc,
            disruption.IsActive,
            AffectedShipments = disruption.ShipmentDisruptions.Select(sd => new
            {
                sd.ShipmentId,
                sd.Shipment.TrackingNumber,
                sd.Shipment.Origin,
                sd.Shipment.Destination,
                sd.Shipment.CarrierCode,
                Status = sd.Shipment.Status.ToString(),
                sd.EstimatedDelayHours,
                sd.ImpactNotes
            }),
            disruption.CreatedAtUtc
        };

        return Ok(response);
    }
}
