using Microsoft.AspNetCore.Mvc;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// What-If simulation API.
/// Phase 2: Returns placeholder responses.
/// Phase 14+: Connect to ISimulationService.
///
/// Architecture rule:
///   - Simulations NEVER mutate live operational state.
///   - Applying a simulation result requires explicit operator confirmation.
///   - Applied actions create DecisionAudit records.
/// </summary>
[ApiController]
[Route("api/simulations")]
public class SimulationsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() =>
        Ok(new { status = "placeholder", message = "Simulations endpoint — Phase 14+", data = Array.Empty<object>() });

    [HttpPost("run")]
    public IActionResult Run() =>
        Ok(new { status = "placeholder", message = "Run simulation — Phase 14+", data = (object?)null });
}
