using Microsoft.AspNetCore.Mvc;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Disruptions API.
/// Phase 2: Returns placeholder responses.
/// Phase 8+: Connect to IDisruptionService.
/// </summary>
[ApiController]
[Route("api/disruptions")]
public class DisruptionsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() =>
        Ok(new { status = "placeholder", message = "Disruptions endpoint — Phase 8+", data = Array.Empty<object>() });

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id) =>
        Ok(new { status = "placeholder", message = $"Disruption {id} — Phase 8+", data = (object?)null });
}
