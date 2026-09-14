using SupplyShield.Application.DTOs;

namespace SupplyShield.Application.Interfaces;

/// <summary>
/// Dashboard aggregation service.
/// Returns KPI snapshot for the Command Center.
/// Phase 2: Stub.
/// </summary>
public interface IDashboardService
{
    Task<DashboardKpisDto> GetKpisAsync(CancellationToken ct = default);
}
