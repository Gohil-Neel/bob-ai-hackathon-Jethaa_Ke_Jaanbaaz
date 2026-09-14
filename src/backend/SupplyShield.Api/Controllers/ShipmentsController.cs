using Microsoft.AspNetCore.Mvc;

namespace SupplyShield.Api.Controllers;

/// <summary>
/// Shipments API.
/// Phase 2: Returns placeholder responses.
/// Phase 6+: Connect to IShipmentService.
/// </summary>
[ApiController]
[Route("api/shipments")]
public class ShipmentsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() =>
        Ok(new { status = "placeholder", message = "Shipments endpoint — Phase 6+", data = Array.Empty<object>() });

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id) =>
        Ok(new { status = "placeholder", message = $"Shipment {id} — Phase 6+", data = (object?)null });
}
