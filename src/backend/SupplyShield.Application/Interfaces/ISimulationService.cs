using SupplyShield.Application.DTOs;

namespace SupplyShield.Application.Interfaces;

/// <summary>
/// What-If simulation service.
/// Compares current vs proposed plan without mutating live state.
///
/// RULES:
///   - Simulations NEVER write to operational tables.
///   - Applying a simulation result requires explicit operator confirmation.
///   - Every applied action creates a DecisionAudit record.
///
/// Phase 2: Stub.
/// Phase 14+: Implement simulation engine.
/// </summary>
public interface ISimulationService
{
    Task<object> RunAsync(Guid shipmentId, Guid? proposedRouteId, string? proposedCarrierCode, CancellationToken ct = default);
    Task<object> ApplyAsync(Guid simulationId, string operatorId, CancellationToken ct = default);
}
