using SupplyShield.Domain.Enums;

namespace SupplyShield.Domain.Entities;

/// <summary>
/// An alert raised by the cold-chain excursion engine.
/// Severity is assigned by deterministic rules — not by AI.
/// </summary>
public class ColdChainAlert
{
    public Guid Id { get; set; }
    public Guid SensorId { get; set; }
    public Guid ShipmentId { get; set; }
    public SeverityLevel Severity { get; set; }
    public decimal ExcursionPeakCelsius { get; set; }
    public decimal AllowedMinCelsius { get; set; }
    public decimal AllowedMaxCelsius { get; set; }
    public DateTime ExcursionStartUtc { get; set; }
    public DateTime? ExcursionEndUtc { get; set; }
    public int? DurationMinutes { get; set; }
    public bool IsAcknowledged { get; set; }
    public DateTime? AcknowledgedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    // Navigation
    public Sensor Sensor { get; set; } = null!;
    public Shipment Shipment { get; set; } = null!;
}
