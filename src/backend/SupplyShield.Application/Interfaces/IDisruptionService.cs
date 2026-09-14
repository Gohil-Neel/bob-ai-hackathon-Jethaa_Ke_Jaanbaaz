using SupplyShield.Application.DTOs;

namespace SupplyShield.Application.Interfaces;

/// <summary>
/// Disruption intelligence.
/// Phase 2: Stub.
/// Phase 8+: Implement disruption detection, affected-shipment analysis, route alternatives.
/// </summary>
public interface IDisruptionService
{
    Task<IReadOnlyList<DisruptionDto>> GetActiveAsync(CancellationToken ct = default);
    Task<DisruptionDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns shipments whose routes intersect this disruption.</summary>
    Task<IReadOnlyList<ShipmentDto>> GetAffectedShipmentsAsync(Guid disruptionId, CancellationToken ct = default);

    /// <summary>
    /// Finds alternative routes avoiding the disruption zone.
    /// Compares ETA, cost, and risk for each alternative.
    /// Phase 9+.
    /// </summary>
    Task<IReadOnlyList<RecoveryRecommendationDto>> GetRouteAlternativesAsync(Guid disruptionId, CancellationToken ct = default);
}
