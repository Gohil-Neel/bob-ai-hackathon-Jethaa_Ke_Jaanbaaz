namespace SupplyShield.Domain.Entities;

/// <summary>
/// A logistics route connecting origin to destination via zero or more waypoints.
/// </summary>
public class Route
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public int EstimatedHours { get; set; }
    public string? CarrierCode { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    // Navigation
    public ICollection<RouteSegment> Segments { get; set; } = [];
    public ICollection<Shipment> Shipments { get; set; } = [];
}
