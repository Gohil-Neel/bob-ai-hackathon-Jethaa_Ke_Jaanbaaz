using SupplyShield.Domain.Enums;

namespace SupplyShield.Domain.Entities;

/// <summary>
/// Immutable audit record created when an operator approves and applies a recommendation.
/// Never deleted. Written by the backend only after successful state change.
/// </summary>
public class DecisionAudit
{
    public Guid Id { get; set; }
    public string OperatorId { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public string TargetEntityType { get; set; } = string.Empty;
    public Guid TargetEntityId { get; set; }
    public string Description { get; set; } = string.Empty;
    public AuditStatus Status { get; set; }
    public DateTime ApprovedAtUtc { get; set; }
    public DateTime? AppliedAtUtc { get; set; }

    /// <summary>JSON snapshot of state before the action was applied.</summary>
    public string? BeforeStateJson { get; set; }

    /// <summary>JSON snapshot of state after the action was applied.</summary>
    public string? AfterStateJson { get; set; }
}
