namespace SupplyShield.Domain.Entities;

/// <summary>
/// Join entity linking a disruption to an affected shipment.
/// Carries impact metadata calculated by the disruption intelligence service.
/// </summary>
public class ShipmentDisruption
{
    public Guid Id { get; set; }
    public Guid ShipmentId { get; set; }
    public Guid DisruptionId { get; set; }
    public int? EstimatedDelayHours { get; set; }
    public string? ImpactNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    // Navigation
    public Shipment Shipment { get; set; } = null!;
    public Disruption Disruption { get; set; } = null!;
}
