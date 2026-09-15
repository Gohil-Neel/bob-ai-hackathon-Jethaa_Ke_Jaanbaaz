using Microsoft.AspNetCore.Mvc;
using SupplyShield.Application.Interfaces;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// AI insights and explanations API.
///
/// Architecture rules:
///   - This controller passes ONLY verified backend entity IDs to IAiService.
///   - IAiService assembles structured facts from the database — never from raw request bodies.
///   - AI failure returns a safe fallback message with HTTP 200 (not 500).
/// </summary>
[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly IAiService _ai;

    public AiController(IAiService ai) => _ai = ai;

    /// <summary>GET /api/ai/insights — top-level AI status.</summary>
    [HttpGet("insights")]
    public IActionResult GetInsights() =>
        Ok(new
        {
            status = "ok",
            message = "SupplyShield AI — IBM watsonx.ai is active. Use the explain endpoints below.",
            endpoints = new[]
            {
                "POST /api/ai/explain/shipment/{shipmentId}",
                "POST /api/ai/explain/disruption/{disruptionId}",
                "POST /api/ai/explain/cold-chain/{sensorId}",
                "POST /api/ai/recommend/reroute/{shipmentId}",
            },
        });

    /// <summary>
    /// POST /api/ai/explain/shipment/{shipmentId}
    /// Returns a watsonx.ai grounded explanation of the shipment's risk status.
    /// </summary>
    [HttpPost("explain/shipment/{shipmentId:guid}")]
    public async Task<IActionResult> ExplainShipment(
        Guid shipmentId,
        CancellationToken ct)
    {
        var explanation = await _ai.ExplainShipmentAsync(shipmentId, ct);
        return Ok(new { status = "ok", shipmentId, explanation });
    }

    /// <summary>
    /// POST /api/ai/explain/disruption/{disruptionId}
    /// Returns a watsonx.ai grounded impact analysis for the disruption.
    /// </summary>
    [HttpPost("explain/disruption/{disruptionId:guid}")]
    public async Task<IActionResult> ExplainDisruption(
        Guid disruptionId,
        CancellationToken ct)
    {
        var explanation = await _ai.ExplainDisruptionAsync(disruptionId, ct);
        return Ok(new { status = "ok", disruptionId, explanation });
    }

    /// <summary>
    /// POST /api/ai/explain/cold-chain/{sensorId}
    /// Returns a watsonx.ai grounded analysis of the cold-chain excursion on this sensor.
    /// </summary>
    [HttpPost("explain/cold-chain/{sensorId:guid}")]
    public async Task<IActionResult> ExplainColdChain(
        Guid sensorId,
        CancellationToken ct)
    {
        var explanation = await _ai.ExplainColdChainExcursionAsync(sensorId, ct);
        return Ok(new { status = "ok", sensorId, explanation });
    }

    /// <summary>
    /// POST /api/ai/recommend/reroute/{shipmentId}
    /// Returns a watsonx.ai reroute recommendation grounded in backend route/disruption facts.
    /// </summary>
    [HttpPost("recommend/reroute/{shipmentId:guid}")]
    public async Task<IActionResult> RecommendReroute(
        Guid shipmentId,
        CancellationToken ct)
    {
        var recommendation = await _ai.RecommendRerouteAsync(shipmentId, ct);
        return Ok(new { status = "ok", shipmentId, recommendation });
    }
}
