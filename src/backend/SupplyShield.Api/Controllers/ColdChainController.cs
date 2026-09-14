using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Cold-Chain sensors and temperature telemetry API.
/// Connects to PostgreSQL / Supabase via AppDbContext.
/// </summary>
[ApiController]
[Route("api/cold-chain")]
public class ColdChainController : ControllerBase
{
    private readonly AppDbContext _context;

    public ColdChainController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all cold-chain sensors with current status and shipment info.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetSensors(CancellationToken cancellationToken)
    {
        var sensors = await _context.Sensors
            .Include(s => s.Shipment)
            .OrderByDescending(s => s.CurrentExcursionSeverity)
            .Select(s => new
            {
                s.Id,
                s.SensorCode,
                s.ShipmentId,
                ShipmentTrackingNumber = s.Shipment.TrackingNumber,
                ShipmentOrigin = s.Shipment.Origin,
                ShipmentDestination = s.Shipment.Destination,
                s.MinTempCelsius,
                s.MaxTempCelsius,
                s.LastReadingCelsius,
                s.LastReadingAtUtc,
                Status = s.Status.ToString(),
                CurrentExcursionSeverity = s.CurrentExcursionSeverity.HasValue ? s.CurrentExcursionSeverity.Value.ToString() : null,
                s.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(sensors);
    }

    /// <summary>
    /// Gets single sensor detail with recent alerts.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var sensor = await _context.Sensors
            .Include(s => s.Shipment)
            .Include(s => s.Alerts)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (sensor == null)
            return NotFound(new { message = $"Sensor with ID {id} not found." });

        var response = new
        {
            sensor.Id,
            sensor.SensorCode,
            sensor.ShipmentId,
            Shipment = new
            {
                sensor.Shipment.Id,
                sensor.Shipment.TrackingNumber,
                sensor.Shipment.Origin,
                sensor.Shipment.Destination,
                Status = sensor.Shipment.Status.ToString()
            },
            sensor.MinTempCelsius,
            sensor.MaxTempCelsius,
            sensor.LastReadingCelsius,
            sensor.LastReadingAtUtc,
            Status = sensor.Status.ToString(),
            CurrentExcursionSeverity = sensor.CurrentExcursionSeverity.HasValue ? sensor.CurrentExcursionSeverity.Value.ToString() : null,
            Alerts = sensor.Alerts.OrderByDescending(a => a.CreatedAtUtc).Select(a => new
            {
                a.Id,
                Severity = a.Severity.ToString(),
                a.ExcursionPeakCelsius,
                a.AllowedMinCelsius,
                a.AllowedMaxCelsius,
                a.ExcursionStartUtc,
                a.ExcursionEndUtc,
                a.DurationMinutes,
                a.IsAcknowledged,
                a.CreatedAtUtc
            }),
            sensor.CreatedAtUtc
        };

        return Ok(response);
    }

    /// <summary>
    /// Gets recent temperature telemetry readings for a sensor.
    /// </summary>
    [HttpGet("{id:guid}/readings")]
    public async Task<IActionResult> GetReadings(Guid id, [FromQuery] int limit = 100, CancellationToken cancellationToken = default)
    {
        var readings = await _context.SensorReadings
            .Where(r => r.SensorId == id)
            .OrderByDescending(r => r.RecordedAtUtc)
            .Take(limit)
            .OrderBy(r => r.RecordedAtUtc)
            .Select(r => new
            {
                r.Id,
                r.SensorId,
                r.TemperatureCelsius,
                r.RecordedAtUtc,
                r.IsExcursion
            })
            .ToListAsync(cancellationToken);

        return Ok(readings);
    }
}
