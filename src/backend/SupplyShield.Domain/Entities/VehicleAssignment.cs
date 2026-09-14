namespace SupplyShield.Domain.Entities;

/// <summary>
/// Assignment of a vehicle to a shipment for a given time window.
/// </summary>
public class VehicleAssignment
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public Guid ShipmentId { get; set; }
    public DateTime AssignedAtUtc { get; set; }
    public DateTime? ReleasedAtUtc { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public Vehicle Vehicle { get; set; } = null!;
    public Shipment Shipment { get; set; } = null!;
}
