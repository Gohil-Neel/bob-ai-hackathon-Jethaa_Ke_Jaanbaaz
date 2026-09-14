namespace SupplyShield.Domain.Entities;

/// <summary>
/// A prediction or anomaly score produced by the Python ML service.
/// Stored for traceability. Never used to directly mutate operational state.
/// </summary>
public class ModelPrediction
{
    public Guid Id { get; set; }
    public string ModelName { get; set; } = string.Empty;
    public string ModelVersion { get; set; } = string.Empty;
    public string ContextType { get; set; } = string.Empty;  // "shipment" | "sensor" | "route"
    public Guid ContextEntityId { get; set; }
    public string PredictionType { get; set; } = string.Empty;
    public decimal Score { get; set; }

    /// <summary>Raw JSON output from the ML model for traceability.</summary>
    public string? RawOutputJson { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
