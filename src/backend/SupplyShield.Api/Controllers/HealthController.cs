using Microsoft.AspNetCore.Mvc;
using SupplyShield.Application.DTOs;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Health check endpoint.
/// Used by the automated hackathon validation pipeline and monitoring.
/// </summary>
[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    [HttpGet("health")]
    [ProducesResponseType(typeof(HealthDto), StatusCodes.Status200OK)]
    public IActionResult GetHealth()
    {
        return Ok(new HealthDto("ok", "supplyshield-api"));
    }
}
