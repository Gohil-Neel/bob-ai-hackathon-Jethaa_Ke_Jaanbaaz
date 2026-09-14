using SupplyShield.Domain.Enums;

namespace SupplyShield.Domain.Entities;

/// <summary>
/// A fleet vehicle or transport asset.
/// </summary>
public class Vehicle
{
    public Guid Id { get; set; }
    public string AssetCode { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;   // e.g. "Refrigerated Truck"
    public VehicleStatus Status { get; set; }
    public decimal CapacityKg { get; set; }
    public string CurrentLocation { get; set; } = string.Empty;
    public DateTime? LastSeenAtUtc { get; set; }
    public Guid? CarrierId { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    // Navigation
    public Carrier? Carrier { get; set; }
    public ICollection<VehicleAssignment> Assignments { get; set; } = [];
}
