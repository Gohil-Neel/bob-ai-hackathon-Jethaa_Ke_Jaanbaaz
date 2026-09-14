using SupplyShield.Domain.Enums;

namespace SupplyShield.Domain.Entities;

/// <summary>
/// A tracked shipment moving between origin and destination.
/// The core entity that disruption, fleet, cold-chain, and AI intelligence all relate to.
/// </summary>
public class Shipment
{
    public Guid Id { get; set; }
    public string TrackingNumber { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string CarrierCode { get; set; } = string.Empty;
    public ShipmentStatus Status { get; set; }
    public SeverityLevel Priority { get; set; }
    public DateTime? EstimatedArrivalUtc { get; set; }
    public bool IsColdChain { get; set; }
    public Guid? RouteId { get; set; }

    /// <summary>
    /// Normalised risk score 0.0–1.0.
    /// Computed deterministically from disruption severity, priority, delay, and cold-chain state.
    /// Not set by AI.
    /// </summary>
    public decimal? RiskScore { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    // Navigation
    public Route? Route { get; set; }
    public ICollection<ShipmentDisruption> ShipmentDisruptions { get; set; } = [];
    public ICollection<Sensor> Sensors { get; set; } = [];
    public ICollection<VehicleAssignment> VehicleAssignments { get; set; } = [];
    public ICollection<RecoveryRecommendation> Recommendations { get; set; } = [];
}
