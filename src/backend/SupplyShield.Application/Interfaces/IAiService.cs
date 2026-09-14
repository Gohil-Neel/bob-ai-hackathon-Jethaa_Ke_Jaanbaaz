using SupplyShield.Application.DTOs;

namespace SupplyShield.Application.Interfaces;

/// <summary>
/// AI explanation and insight service.
/// Assembles verified backend facts and sends them to the Python AI service.
///
/// RULES (enforced by this interface contract):
///   - AI receives ONLY verified structured facts from the backend.
///   - AI NEVER receives raw user input.
///   - AI MUST NOT invent IDs, costs, ETAs, sensor values, or disruption facts.
///   - AI failure is handled gracefully (fallback message, no crash).
///   - Confidence is surfaced separately from severity.
///
/// Phase 2: Stub.
/// Phase 13+: Implement watsonx.ai via Python AI service HTTP call.
/// </summary>
public interface IAiService
{
    Task<string> ExplainShipmentAsync(Guid shipmentId, CancellationToken ct = default);
    Task<string> ExplainDisruptionAsync(Guid disruptionId, CancellationToken ct = default);
    Task<string> ExplainColdChainExcursionAsync(Guid sensorId, CancellationToken ct = default);
    Task<string> RecommendRerouteAsync(Guid shipmentId, CancellationToken ct = default);
}
