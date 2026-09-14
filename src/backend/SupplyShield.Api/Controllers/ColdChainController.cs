using Microsoft.AspNetCore.Mvc;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Cold-chain sensors and temperature monitoring API.
/// Phase 2: Returns placeholder responses.
/// Phase 11+: Connect to IColdChainService.
/// </summary>
[ApiController]
[Route("api/cold-chain")]
public class ColdChainController : ControllerBase
{
    [HttpGet]
    public IActionResult GetSensors() =>
        Ok(new { status = "placeholder", message = "Cold-chain endpoint — Phase 11+", data = Array.Empty<object>() });

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id) =>
        Ok(new { status = "placeholder", message = $"Sensor {id} — Phase 11+", data = (object?)null });

    [HttpGet("{id:guid}/readings")]
    public IActionResult GetReadings(Guid id) =>
        Ok(new { status = "placeholder", message = $"Readings for sensor {id} — Phase 11+", data = Array.Empty<object>() });
}
