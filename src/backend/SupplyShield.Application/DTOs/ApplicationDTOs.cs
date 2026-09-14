using SupplyShield.Domain.Enums;

namespace SupplyShield.Application.DTOs;

// ─── Shared ──────────────────────────────────────────────────────────────────

public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

// ─── Shipment DTOs ───────────────────────────────────────────────────────────

public record ShipmentDto(
    Guid Id,
    string TrackingNumber,
    string Origin,
    string Destination,
    string CarrierCode,
    ShipmentStatus Status,
    SeverityLevel Priority,
    DateTime? EstimatedArrivalUtc,
    bool IsColdChain,
    Guid? RouteId,
    decimal? RiskScore,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);

// ─── Disruption DTOs ─────────────────────────────────────────────────────────

public record DisruptionDto(
    Guid Id,
    string Title,
    DisruptionType DisruptionType,
    SeverityLevel Severity,
    string AffectedRegion,
    string Description,
    DateTime StartedAtUtc,
    DateTime? ResolvedAtUtc,
    bool IsActive,
    int AffectedShipmentCount,
    DateTime CreatedAtUtc
);

// ─── Vehicle / Fleet DTOs ────────────────────────────────────────────────────

public record VehicleDto(
    Guid Id,
    string AssetCode,
    string AssetType,
    VehicleStatus Status,
    decimal CapacityKg,
    string CurrentLocation,
    DateTime? LastSeenAtUtc,
    DateTime CreatedAtUtc
);

// ─── Sensor / Cold-Chain DTOs ────────────────────────────────────────────────

public record SensorDto(
    Guid Id,
    string SensorCode,
    Guid ShipmentId,
    decimal MinTempCelsius,
    decimal MaxTempCelsius,
    decimal? LastReadingCelsius,
    DateTime? LastReadingAtUtc,
    ColdChainStatus Status,
    SeverityLevel? CurrentExcursionSeverity,
    DateTime CreatedAtUtc
);

public record SensorReadingDto(
    Guid Id,
    Guid SensorId,
    decimal TemperatureCelsius,
    DateTime RecordedAtUtc,
    bool IsExcursion
);

// ─── Alert DTOs ──────────────────────────────────────────────────────────────

public record ColdChainAlertDto(
    Guid Id,
    Guid SensorId,
    Guid ShipmentId,
    SeverityLevel Severity,
    decimal ExcursionPeakCelsius,
    decimal AllowedMinCelsius,
    decimal AllowedMaxCelsius,
    DateTime ExcursionStartUtc,
    DateTime? ExcursionEndUtc,
    int? DurationMinutes,
    bool IsAcknowledged,
    DateTime CreatedAtUtc
);

// ─── Recommendation DTOs ─────────────────────────────────────────────────────

public record RecoveryRecommendationDto(
    Guid Id,
    Guid ShipmentId,
    RecommendationType RecommendationType,
    string Title,
    string Rationale,
    SeverityLevel Severity,
    decimal? Confidence,
    Guid? ProposedRouteId,
    string? ProposedCarrierCode,
    Guid? ProposedVehicleId,
    int? EstimatedTimeSavingMinutes,
    decimal? EstimatedCostDeltaUsd,
    bool RequiresApproval,
    DateTime CreatedAtUtc
);

// ─── Health ──────────────────────────────────────────────────────────────────

public record HealthDto(string Status, string Service);

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

public record DashboardKpisDto(
    int TotalShipments,
    int ActiveDisruptions,
    int AtRiskShipments,
    int ColdChainAlerts,
    int IdleVehicles,
    DateTime LastUpdatedUtc
);
