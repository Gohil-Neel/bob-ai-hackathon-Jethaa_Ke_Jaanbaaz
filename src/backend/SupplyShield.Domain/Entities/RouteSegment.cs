namespace SupplyShield.Domain.Entities;

/// <summary>
/// A single leg of a multi-segment route.
/// </summary>
public class RouteSegment
{
    public Guid Id { get; set; }
    public Guid RouteId { get; set; }
    public int SequenceOrder { get; set; }
    public string FromLocation { get; set; } = string.Empty;
    public string ToLocation { get; set; } = string.Empty;
    public string TransportMode { get; set; } = string.Empty;  // e.g. "Sea", "Road", "Air"
    public int EstimatedHours { get; set; }

    // Navigation
    public Route Route { get; set; } = null!;
}
