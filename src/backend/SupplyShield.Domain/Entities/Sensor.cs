using SupplyShield.Domain.Enums;

namespace SupplyShield.Domain.Entities;

/// <summary>
/// A cold-chain temperature sensor attached to a shipment.
/// Per-sensor policy thresholds are configurable — they are not hard-coded constants.
/// </summary>
public class Sensor
{
    public Guid Id { get; set; }
    public string SensorCode { get; set; } = string.Empty;
    public Guid ShipmentId { get; set; }

    /// <summary>Configurable minimum temperature in °C for this shipment/product type.</summary>
    public decimal MinTempCelsius { get; set; }

    /// <summary>Configurable maximum temperature in °C for this shipment/product type.</summary>
    public decimal MaxTempCelsius { get; set; }

    public decimal? LastReadingCelsius { get; set; }
    public DateTime? LastReadingAtUtc { get; set; }
    public ColdChainStatus Status { get; set; }
    public SeverityLevel? CurrentExcursionSeverity { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    // Navigation
    public Shipment Shipment { get; set; } = null!;
    public ICollection<SensorReading> Readings { get; set; } = [];
    public ICollection<ColdChainAlert> Alerts { get; set; } = [];
}
