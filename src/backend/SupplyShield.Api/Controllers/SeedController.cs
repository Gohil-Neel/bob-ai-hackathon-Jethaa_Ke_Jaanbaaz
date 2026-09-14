using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Administrative controller to seed or check database records (Phases 4 & 5).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<SeedController> _logger;

    public SeedController(AppDbContext context, ILogger<SeedController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Returns current counts of all domain entities in the database.
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        var status = new
        {
            Carriers = await _context.Carriers.CountAsync(cancellationToken),
            Routes = await _context.Routes.CountAsync(cancellationToken),
            RouteSegments = await _context.RouteSegments.CountAsync(cancellationToken),
            Vehicles = await _context.Vehicles.CountAsync(cancellationToken),
            Disruptions = await _context.Disruptions.CountAsync(cancellationToken),
            Shipments = await _context.Shipments.CountAsync(cancellationToken),
            ShipmentDisruptions = await _context.ShipmentDisruptions.CountAsync(cancellationToken),
            Sensors = await _context.Sensors.CountAsync(cancellationToken),
            SensorReadings = await _context.SensorReadings.CountAsync(cancellationToken),
            ColdChainAlerts = await _context.ColdChainAlerts.CountAsync(cancellationToken),
            RecoveryRecommendations = await _context.RecoveryRecommendations.CountAsync(cancellationToken),
            DecisionAudits = await _context.DecisionAudits.CountAsync(cancellationToken)
        };

        return Ok(status);
    }

    /// <summary>
    /// Triggers synthetic dataset seeding into the connected database.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> SeedDatabase([FromQuery] bool force = false, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Seeding database requested (force={Force})...", force);
        var result = await DataSeeder.SeedAsync(_context, force, cancellationToken);
        return Ok(result);
    }
}
