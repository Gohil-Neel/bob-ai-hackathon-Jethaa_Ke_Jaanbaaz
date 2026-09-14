using Microsoft.AspNetCore.Mvc;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Fleet / Vehicle assets API.
/// Phase 2: Returns placeholder responses.
/// Phase 10+: Connect to IFleetService.
/// </summary>
[ApiController]
[Route("api/fleet")]
public class FleetController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() =>
        Ok(new { status = "placeholder", message = "Fleet endpoint — Phase 10+", data = Array.Empty<object>() });

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id) =>
        Ok(new { status = "placeholder", message = $"Vehicle {id} — Phase 10+", data = (object?)null });
}
