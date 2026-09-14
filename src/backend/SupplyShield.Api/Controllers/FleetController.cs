using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Fleet & Vehicles API.
/// Connects to PostgreSQL / Supabase via AppDbContext.
/// </summary>
[ApiController]
[Route("api/fleet")]
public class FleetController : ControllerBase
{
    private readonly AppDbContext _context;

    public FleetController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all fleet vehicles.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var vehicles = await _context.Vehicles
            .Include(v => v.Carrier)
            .OrderBy(v => v.Status)
            .Select(v => new
            {
                v.Id,
                v.AssetCode,
                v.AssetType,
                Status = v.Status.ToString(),
                v.CapacityKg,
                v.CurrentLocation,
                v.LastSeenAtUtc,
                v.CarrierId,
                CarrierName = v.Carrier != null ? v.Carrier.Name : null,
                v.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(vehicles);
    }

    /// <summary>
    /// Gets a single vehicle by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var vehicle = await _context.Vehicles
            .Include(v => v.Carrier)
            .Include(v => v.Assignments)
                .ThenInclude(a => a.Shipment)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

        if (vehicle == null)
            return NotFound(new { message = $"Vehicle with ID {id} not found." });

        var response = new
        {
            vehicle.Id,
            vehicle.AssetCode,
            vehicle.AssetType,
            Status = vehicle.Status.ToString(),
            vehicle.CapacityKg,
            vehicle.CurrentLocation,
            vehicle.LastSeenAtUtc,
            vehicle.CarrierId,
            Carrier = vehicle.Carrier != null ? new
            {
                vehicle.Carrier.Id,
                vehicle.Carrier.Code,
                vehicle.Carrier.Name,
                vehicle.Carrier.ContactEmail
            } : null,
            Assignments = vehicle.Assignments.OrderByDescending(a => a.AssignedAtUtc).Select(a => new
            {
                a.Id,
                a.ShipmentId,
                a.Shipment.TrackingNumber,
                a.AssignedAtUtc,
                a.ReleasedAtUtc,
                a.Notes
            }),
            vehicle.CreatedAtUtc
        };

        return Ok(response);
    }
}
