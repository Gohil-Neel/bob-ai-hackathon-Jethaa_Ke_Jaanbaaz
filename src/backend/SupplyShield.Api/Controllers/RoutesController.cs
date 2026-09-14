using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Routes & Multimodal Corridors API.
/// Connects to PostgreSQL / Supabase via AppDbContext.
/// </summary>
[ApiController]
[Route("api/routes")]
public class RoutesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RoutesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all active transport routes with their multimodal segments.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var routes = await _context.Routes
            .Include(r => r.Segments)
            .OrderBy(r => r.Name)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.Origin,
                r.Destination,
                r.CarrierCode,
                r.EstimatedHours,
                r.IsActive,
                SegmentsCount = r.Segments.Count,
                Segments = r.Segments.OrderBy(s => s.SequenceOrder).Select(s => new
                {
                    s.Id,
                    s.SequenceOrder,
                    s.FromLocation,
                    s.ToLocation,
                    s.TransportMode,
                    s.EstimatedHours
                }),
                r.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(routes);
    }

    /// <summary>
    /// Gets a single route by ID with active shipments currently assigned.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var route = await _context.Routes
            .Include(r => r.Segments)
            .Include(r => r.Shipments)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (route == null)
            return NotFound(new { message = $"Route with ID {id} not found." });

        var response = new
        {
            route.Id,
            route.Name,
            route.Origin,
            route.Destination,
            route.CarrierCode,
            route.EstimatedHours,
            route.IsActive,
            Segments = route.Segments.OrderBy(s => s.SequenceOrder).Select(s => new
            {
                s.Id,
                s.SequenceOrder,
                s.FromLocation,
                s.ToLocation,
                s.TransportMode,
                s.EstimatedHours
            }),
            ActiveShipments = route.Shipments.Select(s => new
            {
                s.Id,
                s.TrackingNumber,
                s.Origin,
                s.Destination,
                Status = s.Status.ToString(),
                Priority = s.Priority.ToString(),
                s.RiskScore
            }),
            route.CreatedAtUtc
        };

        return Ok(response);
    }
}
