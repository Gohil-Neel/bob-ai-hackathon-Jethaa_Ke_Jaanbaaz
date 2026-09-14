using Microsoft.AspNetCore.Mvc;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// AI insights and explanations API.
/// Phase 2: Returns placeholder responses.
/// Phase 13+: Connect to IAiService which calls the Python AI service.
///
/// Architecture note:
///   - This controller passes only VERIFIED facts to IAiService.
///   - It never forwards raw user input to the AI service.
///   - AI failure returns a safe fallback message, not an error.
/// </summary>
[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    [HttpGet("insights")]
    public IActionResult GetInsights() =>
        Ok(new { status = "placeholder", message = "AI insights endpoint — Phase 13+", data = Array.Empty<object>() });

    [HttpPost("explain/shipment/{shipmentId:guid}")]
    public IActionResult ExplainShipment(Guid shipmentId) =>
        Ok(new { status = "placeholder", message = $"AI explanation for shipment {shipmentId} — Phase 13+", data = (object?)null });

    [HttpPost("explain/disruption/{disruptionId:guid}")]
    public IActionResult ExplainDisruption(Guid disruptionId) =>
        Ok(new { status = "placeholder", message = $"AI explanation for disruption {disruptionId} — Phase 13+", data = (object?)null });
}
