using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyShield.Domain.Enums;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Dashboard & Command Center KPI API.
/// Computes live aggregated supply-chain operational metrics from PostgreSQL / Supabase.
/// </summary>
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Returns Command Center top-level KPIs.
    /// </summary>
    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis(CancellationToken cancellationToken)
    {
        var totalShipments = await _context.Shipments.CountAsync(cancellationToken);
        var activeDisruptions = await _context.Disruptions.CountAsync(d => d.IsActive, cancellationToken);
        var atRiskShipments = await _context.Shipments.CountAsync(
            s => s.Status == ShipmentStatus.AtRisk || (s.RiskScore.HasValue && s.RiskScore >= 0.7m),
            cancellationToken);
        var coldChainAlerts = await _context.ColdChainAlerts.CountAsync(a => !a.IsAcknowledged, cancellationToken);
        var idleFleetAssets = await _context.Vehicles.CountAsync(
            v => v.Status == VehicleStatus.Idle || v.Status == VehicleStatus.Available,
            cancellationToken);

        var kpis = new
        {
            totalShipments,
            activeDisruptions,
            atRiskShipments,
            coldChainAlerts,
            idleFleetAssets,
            dataSource = "LIVE_DATABASE",
            generatedAtUtc = DateTime.UtcNow
        };

        return Ok(kpis);
    }
}
