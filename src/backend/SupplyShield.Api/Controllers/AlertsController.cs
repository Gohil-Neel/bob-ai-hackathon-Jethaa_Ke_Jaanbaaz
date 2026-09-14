using Microsoft.AspNetCore.Mvc;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Alerts API.
/// Phase 2: Returns placeholder responses.
/// Phase 11+: Connect to alert repositories.
/// </summary>
[ApiController]
[Route("api/alerts")]
public class AlertsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() =>
        Ok(new { status = "placeholder", message = "Alerts endpoint — Phase 11+", data = Array.Empty<object>() });

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id) =>
        Ok(new { status = "placeholder", message = $"Alert {id} — Phase 11+", data = (object?)null });
}
