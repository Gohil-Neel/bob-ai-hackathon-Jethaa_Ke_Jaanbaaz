using SupplyShield.Application.DTOs;

namespace SupplyShield.Application.Interfaces;

/// <summary>
/// Shipment business logic.
/// Phase 2: Stub — methods raise NotImplementedException.
/// Phase 6+: Implement with EF Core repository queries.
/// </summary>
public interface IShipmentService
{
    Task<PagedResult<ShipmentDto>> GetAllAsync(int page = 1, int pageSize = 50, CancellationToken ct = default);
    Task<ShipmentDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Returns shipments currently affected by active disruptions.</summary>
    Task<IReadOnlyList<ShipmentDto>> GetAtRiskAsync(CancellationToken ct = default);

    /// <summary>
    /// Calculates a normalised risk score 0.0–1.0.
    /// Combines: disruption severity, priority, delay, cold-chain state, route risk.
    /// Deterministic — not AI-assigned.
    /// </summary>
    Task<decimal> CalculateRiskScoreAsync(Guid shipmentId, CancellationToken ct = default);
}
