namespace SupplyShield.Domain.Entities;

/// <summary>
/// A single temperature reading from a cold-chain sensor.
/// </summary>
public class SensorReading
{
    public Guid Id { get; set; }
    public Guid SensorId { get; set; }
    public decimal TemperatureCelsius { get; set; }
    public DateTime RecordedAtUtc { get; set; }
    public bool IsExcursion { get; set; }

    // Navigation
    public Sensor Sensor { get; set; } = null!;
}
