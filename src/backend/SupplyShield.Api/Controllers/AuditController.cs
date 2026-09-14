using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Audit Trail & Recommendations API.
/// Connects to PostgreSQL / Supabase via AppDbContext.
/// </summary>
[ApiController]
[Route("api/audit")]
public class AuditController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Returns all decision audit logs with operator details and state transitions.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAuditLogs(CancellationToken cancellationToken)
    {
        var logs = await _context.DecisionAudits
            .OrderByDescending(a => a.ApprovedAtUtc)
            .Select(a => new
            {
                a.Id,
                a.OperatorId,
                a.ActionType,
                a.TargetEntityType,
                a.TargetEntityId,
                a.Description,
                Status = a.Status.ToString(),
                a.ApprovedAtUtc,
                a.AppliedAtUtc,
                a.BeforeStateJson,
                a.AfterStateJson
            })
            .ToListAsync(cancellationToken);

        return Ok(logs);
    }

    /// <summary>
    /// Returns all AI recovery recommendations across all shipments.
    /// </summary>
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations(CancellationToken cancellationToken)
    {
        var recs = await _context.RecoveryRecommendations
            .Include(r => r.Shipment)
            .OrderByDescending(r => r.Confidence)
            .Select(r => new
            {
                r.Id,
                r.ShipmentId,
                ShipmentTrackingNumber = r.Shipment.TrackingNumber,
                ShipmentOrigin = r.Shipment.Origin,
                ShipmentDestination = r.Shipment.Destination,
                RecommendationType = r.RecommendationType.ToString(),
                r.Title,
                r.Rationale,
                Severity = r.Severity.ToString(),
                r.Confidence,
                r.ProposedCarrierCode,
                r.ProposedRouteId,
                r.ProposedVehicleId,
                r.EstimatedTimeSavingMinutes,
                r.EstimatedCostDeltaUsd,
                r.RequiresApproval,
                r.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(recs);
    }
}
