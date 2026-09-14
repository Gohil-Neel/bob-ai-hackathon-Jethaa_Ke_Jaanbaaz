using SupplyShield.Application.DTOs;

namespace SupplyShield.Application.Interfaces;

/// <summary>
/// Cold-chain monitoring and excursion detection.
/// Phase 2: Stub.
/// Phase 11+: Implement deterministic severity engine.
///
/// Severity rules (deterministic — AI does NOT decide this):
///   NORMAL   → temperature within configured min/max
///   MEDIUM   → short/limited excursion
///   HIGH     → longer or materially significant excursion
///   CRITICAL → extreme or prolonged excursion
///
/// Thresholds are configurable per sensor policy — not hard-coded.
/// </summary>
public interface IColdChainService
{
    Task<IReadOnlyList<SensorDto>> GetSensorsAsync(CancellationToken ct = default);
    Task<SensorDto?> GetSensorByIdAsync(Guid sensorId, CancellationToken ct = default);
    Task<IReadOnlyList<SensorReadingDto>> GetReadingsAsync(Guid sensorId, int count = 100, CancellationToken ct = default);
    Task<IReadOnlyList<ColdChainAlertDto>> GetActiveAlertsAsync(CancellationToken ct = default);

    /// <summary>
    /// Ingest a new temperature reading.
    /// Applies deterministic excursion detection and creates/updates alerts.
    /// Phase 11+.
    /// </summary>
    Task<SensorReadingDto> IngestReadingAsync(Guid sensorId, decimal temperatureCelsius, DateTime recordedAtUtc, CancellationToken ct = default);
}
