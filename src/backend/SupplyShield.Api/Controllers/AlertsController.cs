using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Operational and Cold-Chain Alerts API.
/// Connects to PostgreSQL / Supabase via AppDbContext.
/// </summary>
[ApiController]
[Route("api/alerts")]
public class AlertsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AlertsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all active cold-chain and operational alerts.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var alerts = await _context.ColdChainAlerts
            .Include(a => a.Shipment)
            .Include(a => a.Sensor)
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new
            {
                a.Id,
                a.SensorId,
                SensorCode = a.Sensor.SensorCode,
                a.ShipmentId,
                ShipmentTrackingNumber = a.Shipment.TrackingNumber,
                Severity = a.Severity.ToString(),
                a.ExcursionPeakCelsius,
                a.AllowedMinCelsius,
                a.AllowedMaxCelsius,
                a.ExcursionStartUtc,
                a.ExcursionEndUtc,
                a.DurationMinutes,
                a.IsAcknowledged,
                a.AcknowledgedAtUtc,
                a.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(alerts);
    }

    /// <summary>
    /// Gets a single alert by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var alert = await _context.ColdChainAlerts
            .Include(a => a.Shipment)
            .Include(a => a.Sensor)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (alert == null)
            return NotFound(new { message = $"Alert with ID {id} not found." });

        var response = new
        {
            alert.Id,
            alert.SensorId,
            SensorCode = alert.Sensor.SensorCode,
            alert.ShipmentId,
            ShipmentTrackingNumber = alert.Shipment.TrackingNumber,
            Severity = alert.Severity.ToString(),
            alert.ExcursionPeakCelsius,
            alert.AllowedMinCelsius,
            alert.AllowedMaxCelsius,
            alert.ExcursionStartUtc,
            alert.ExcursionEndUtc,
            alert.DurationMinutes,
            alert.IsAcknowledged,
            alert.AcknowledgedAtUtc,
            alert.CreatedAtUtc
        };

        return Ok(response);
    }

    /// <summary>
    /// Acknowledges an alert.
    /// </summary>
    [HttpPost("{id:guid}/acknowledge")]
    public async Task<IActionResult> Acknowledge(Guid id, CancellationToken cancellationToken)
    {
        var alert = await _context.ColdChainAlerts.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (alert == null)
            return NotFound(new { message = $"Alert with ID {id} not found." });

        alert.IsAcknowledged = true;
        alert.AcknowledgedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { success = true, message = "Alert acknowledged.", alertId = id });
    }
}
