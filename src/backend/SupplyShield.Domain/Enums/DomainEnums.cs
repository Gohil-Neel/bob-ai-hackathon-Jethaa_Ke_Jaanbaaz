namespace SupplyShield.Domain.Enums;

/// <summary>
/// Operational severity level used across all domain entities.
/// Always display with a text label — never rely on color alone.
/// </summary>
public enum SeverityLevel
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

/// <summary>
/// Lifecycle state of a shipment.
/// </summary>
public enum ShipmentStatus
{
    Pending,
    InTransit,
    Delayed,
    AtRisk,
    Delivered,
    Cancelled
}

/// <summary>
/// Category of supply-chain disruption.
/// </summary>
public enum DisruptionType
{
    Weather,
    PortCongestion,
    RoadClosure,
    CustomsDelay,
    CarrierIssue,
    Political,
    Other
}

/// <summary>
/// Operational status of a fleet vehicle.
/// </summary>
public enum VehicleStatus
{
    Available,
    InUse,
    Maintenance,
    Idle
}

/// <summary>
/// Type of operational alert.
/// </summary>
public enum AlertType
{
    TemperatureExcursion,
    Disruption,
    Delay,
    DataGap,
    System
}

/// <summary>
/// Cold-chain sensor state.
/// Deterministic rules decide this — AI does not override it.
/// </summary>
public enum ColdChainStatus
{
    Normal,
    Excursion,
    Recovering,
    DataGap
}

/// <summary>
/// Recommendation action type.
/// </summary>
public enum RecommendationType
{
    Reroute,
    CarrierChange,
    FleetRedeploy,
    Hold
}

/// <summary>
/// Status of a decision audit record.
/// </summary>
public enum AuditStatus
{
    Pending,
    Approved,
    Rejected,
    Applied
}
