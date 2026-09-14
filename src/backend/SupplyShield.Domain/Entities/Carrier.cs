namespace SupplyShield.Domain.Entities;

/// <summary>
/// A logistics carrier / transport company.
/// </summary>
public class Carrier
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    // Navigation
    public ICollection<Vehicle> Vehicles { get; set; } = [];
}
