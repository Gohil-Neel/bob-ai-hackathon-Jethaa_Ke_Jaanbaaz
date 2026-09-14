using SupplyShield.Domain.Enums;

namespace SupplyShield.Domain.Entities;

/// <summary>
/// A supply-chain disruption event affecting one or more routes.
/// </summary>
public class Disruption
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DisruptionType DisruptionType { get; set; }
    public SeverityLevel Severity { get; set; }
    public string AffectedRegion { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartedAtUtc { get; set; }
    public DateTime? ResolvedAtUtc { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    // Navigation
    public ICollection<ShipmentDisruption> ShipmentDisruptions { get; set; } = [];
}
