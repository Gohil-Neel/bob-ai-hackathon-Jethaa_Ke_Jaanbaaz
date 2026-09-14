using SupplyShield.Application.DTOs;

namespace SupplyShield.Application.Interfaces;

/// <summary>
/// Fleet / vehicle intelligence.
/// Phase 2: Stub.
/// Phase 10+: Implement idle-asset detection and redeployment ranking.
/// </summary>
public interface IFleetService
{
    Task<IReadOnlyList<VehicleDto>> GetAllAsync(CancellationToken ct = default);
    Task<VehicleDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns vehicles currently in IDLE or AVAILABLE status.</summary>
    Task<IReadOnlyList<VehicleDto>> GetIdleAssetsAsync(CancellationToken ct = default);

    /// <summary>
    /// Finds idle vehicles suitable for redeployment to cover a given shipment.
    /// Ranks by: availability, capacity, proximity, compatibility.
    /// Requires explicit operator confirmation before applying.
    /// Phase 10+.
    /// </summary>
    Task<IReadOnlyList<RecoveryRecommendationDto>> GetRedeploymentCandidatesAsync(Guid shipmentId, CancellationToken ct = default);
}
