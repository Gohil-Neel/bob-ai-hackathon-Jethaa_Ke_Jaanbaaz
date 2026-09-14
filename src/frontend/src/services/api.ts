/**
 * SupplyShield AI — API Service Layer
 *
 * Connects React UI components to the ASP.NET Core Web API primary backend.
 * Provides fallback to local fixtures if backend is disconnected.
 */

import type {
  Shipment,
  Disruption,
  FleetAsset,
  Alert,
  ColdChainSensor,
  DashboardKpis,
  TemperatureReading,
  SeverityLevel,
  ShipmentStatus,
  DisruptionType,
  FleetAssetStatus,
  ColdChainStatus,
  Route,
  DecisionAudit,
  Recommendation
} from '../types/domain'

import {
  mockShipments,
  mockDisruptions,
  mockFleetAssets,
  mockAlerts,
  mockColdChainSensors,
  mockDashboardKpis,
} from './mock/mockData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function fetchJson<T>(endpoint: string, fallback: () => T): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.warn(`[API] ${endpoint} returned ${response.status}. Using fallback.`);
      return fallback()
    }

    return (await response.json()) as T
  } catch (err) {
    console.warn(`[API] Could not connect to backend for ${endpoint}:`, err);
    return fallback()
  }
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

export async function getDashboardKpis(): Promise<DashboardKpis> {
  return fetchJson('/api/dashboard/kpis', () => mockDashboardKpis)
}

// ─── Shipments ────────────────────────────────────────────────────────────────

export async function getShipments(): Promise<Shipment[]> {
  const data = await fetchJson<any[]>('/api/shipments', () => mockShipments)
  if (!Array.isArray(data)) return mockShipments

  return data.map((item) => ({
    id: item.id ?? item.Id,
    trackingNumber: item.trackingNumber ?? item.TrackingNumber,
    origin: item.origin ?? item.Origin,
    destination: item.destination ?? item.Destination,
    carrier: item.carrierCode ?? item.CarrierCode ?? item.carrier ?? 'UNKNOWN',
    status: (item.status?.toUpperCase() ?? 'IN_TRANSIT') as ShipmentStatus,
    priority: (item.priority?.toUpperCase() ?? 'MEDIUM') as SeverityLevel,
    estimatedArrival: item.estimatedArrivalUtc ?? item.estimatedArrival ?? null,
    isColdChain: Boolean(item.isColdChain ?? item.IsColdChain),
    routeId: item.routeId ?? item.RouteId ?? null,
    riskScore: typeof item.riskScore === 'number' ? item.riskScore : (item.RiskScore ?? null),
    createdAt: item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAtUtc ?? item.updatedAt ?? new Date().toISOString(),
  }))
}

export async function getShipmentById(id: string): Promise<Shipment | null> {
  const item = await fetchJson<any>(`/api/shipments/${id}`, () => mockShipments.find((s) => s.id === id) ?? null)
  if (!item) return null

  return {
    id: item.id ?? item.Id,
    trackingNumber: item.trackingNumber ?? item.TrackingNumber,
    origin: item.origin ?? item.Origin,
    destination: item.destination ?? item.Destination,
    carrier: item.carrierCode ?? item.CarrierCode ?? item.carrier ?? 'UNKNOWN',
    status: (item.status?.toUpperCase() ?? 'IN_TRANSIT') as ShipmentStatus,
    priority: (item.priority?.toUpperCase() ?? 'MEDIUM') as SeverityLevel,
    estimatedArrival: item.estimatedArrivalUtc ?? item.estimatedArrival ?? null,
    isColdChain: Boolean(item.isColdChain ?? item.IsColdChain),
    routeId: item.routeId ?? item.RouteId ?? null,
    riskScore: typeof item.riskScore === 'number' ? item.riskScore : (item.RiskScore ?? null),
    createdAt: item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAtUtc ?? item.updatedAt ?? new Date().toISOString(),
  }
}

// ─── Disruptions ──────────────────────────────────────────────────────────────

export async function getDisruptions(): Promise<Disruption[]> {
  const data = await fetchJson<any[]>('/api/disruptions', () => mockDisruptions)
  if (!Array.isArray(data)) return mockDisruptions

  return data.map((item) => ({
    id: item.id ?? item.Id,
    title: item.title ?? item.Title,
    disruptionType: (item.disruptionType?.toUpperCase() ?? 'WEATHER') as DisruptionType,
    severity: (item.severity?.toUpperCase() ?? 'HIGH') as SeverityLevel,
    affectedRegion: item.affectedRegion ?? item.AffectedRegion ?? '',
    description: item.description ?? item.Description ?? '',
    startedAt: item.startedAtUtc ?? item.startedAt ?? new Date().toISOString(),
    resolvedAt: item.resolvedAtUtc ?? item.resolvedAt ?? null,
    isActive: Boolean(item.isActive ?? item.IsActive),
    affectedShipmentCount: item.affectedShipmentsCount ?? item.affectedShipmentCount ?? 0,
    createdAt: item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }))
}

export async function getDisruptionById(id: string): Promise<Disruption | null> {
  const item = await fetchJson<any>(`/api/disruptions/${id}`, () => mockDisruptions.find((d) => d.id === id) ?? null)
  if (!item) return null

  return {
    id: item.id ?? item.Id,
    title: item.title ?? item.Title,
    disruptionType: (item.disruptionType?.toUpperCase() ?? 'WEATHER') as DisruptionType,
    severity: (item.severity?.toUpperCase() ?? 'HIGH') as SeverityLevel,
    affectedRegion: item.affectedRegion ?? item.AffectedRegion ?? '',
    description: item.description ?? item.Description ?? '',
    startedAt: item.startedAtUtc ?? item.startedAt ?? new Date().toISOString(),
    resolvedAt: item.resolvedAtUtc ?? item.resolvedAt ?? null,
    isActive: Boolean(item.isActive ?? item.IsActive),
    affectedShipmentCount: item.affectedShipments?.length ?? item.affectedShipmentCount ?? 0,
    createdAt: item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }
}

// ─── Fleet ────────────────────────────────────────────────────────────────────

export async function getFleetAssets(): Promise<FleetAsset[]> {
  const data = await fetchJson<any[]>('/api/fleet', () => mockFleetAssets)
  if (!Array.isArray(data)) return mockFleetAssets

  return data.map((item) => ({
    id: item.id ?? item.Id,
    assetCode: item.assetCode ?? item.AssetCode,
    assetType: item.assetType ?? item.AssetType,
    status: (item.status?.toUpperCase() ?? 'AVAILABLE') as FleetAssetStatus,
    capacityKg: Number(item.capacityKg ?? item.CapacityKg ?? 0),
    currentLocation: item.currentLocation ?? item.CurrentLocation ?? '',
    lastSeenAt: item.lastSeenAtUtc ?? item.lastSeenAt ?? null,
    createdAt: item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }))
}

// ─── Cold Chain ───────────────────────────────────────────────────────────────

export async function getColdChainSensors(): Promise<ColdChainSensor[]> {
  const data = await fetchJson<any[]>('/api/cold-chain', () => mockColdChainSensors)
  if (!Array.isArray(data)) return mockColdChainSensors

  return data.map((item) => ({
    id: item.id ?? item.Id,
    sensorCode: item.sensorCode ?? item.SensorCode,
    shipmentId: item.shipmentId ?? item.ShipmentId,
    shipmentTrackingNumber: item.shipmentTrackingNumber ?? item.ShipmentTrackingNumber,
    minTempCelsius: Number(item.minTempCelsius ?? item.MinTempCelsius ?? 2.0),
    maxTempCelsius: Number(item.maxTempCelsius ?? item.MaxTempCelsius ?? 8.0),
    lastReadingCelsius: item.lastReadingCelsius !== undefined && item.lastReadingCelsius !== null ? Number(item.lastReadingCelsius) : null,
    lastReadingAt: item.lastReadingAtUtc ?? item.lastReadingAt ?? null,
    status: (item.status?.toUpperCase() ?? 'NORMAL') as ColdChainStatus,
    currentExcursionSeverity: item.currentExcursionSeverity ? (item.currentExcursionSeverity.toUpperCase() as SeverityLevel) : null,
    createdAt: item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }))
}

export async function getSensorReadings(sensorId: string): Promise<TemperatureReading[]> {
  const data = await fetchJson<any[]>(`/api/cold-chain/${sensorId}/readings`, () => [])
  return data.map((r) => ({
    id: r.id ?? r.Id,
    sensorId: r.sensorId ?? r.SensorId,
    temperatureCelsius: Number(r.temperatureCelsius ?? r.TemperatureCelsius),
    recordedAt: r.recordedAtUtc ?? r.recordedAt,
    isExcursion: Boolean(r.isExcursion ?? r.IsExcursion),
  }))
}

// ─── Routes & Corridors ───────────────────────────────────────────────────────

export async function getRoutes(): Promise<Route[]> {
  const data = await fetchJson<any[]>('/api/routes', () => [])
  if (!Array.isArray(data)) return []

  return data.map((item) => ({
    id: item.id ?? item.Id,
    name: item.name ?? item.Name,
    origin: item.origin ?? item.Origin,
    destination: item.destination ?? item.Destination,
    carrierCode: item.carrierCode ?? item.CarrierCode ?? null,
    estimatedHours: Number(item.estimatedHours ?? item.EstimatedHours ?? 0),
    isActive: Boolean(item.isActive ?? item.IsActive),
    segmentsCount: item.segmentsCount ?? (item.segments ? item.segments.length : 0),
    segments: Array.isArray(item.segments)
      ? item.segments.map((s: any) => ({
          id: s.id ?? s.Id,
          sequenceOrder: Number(s.sequenceOrder ?? s.SequenceOrder ?? 1),
          fromLocation: s.fromLocation ?? s.FromLocation,
          toLocation: s.toLocation ?? s.ToLocation,
          transportMode: s.transportMode ?? s.TransportMode,
          estimatedHours: Number(s.estimatedHours ?? s.EstimatedHours ?? 0),
        }))
      : [],
    createdAt: item.createdAtUtc ?? item.createdAt,
  }))
}

export async function getRouteById(id: string): Promise<Route | null> {
  const item = await fetchJson<any>(`/api/routes/${id}`, () => null)
  if (!item) return null

  return {
    id: item.id ?? item.Id,
    name: item.name ?? item.Name,
    origin: item.origin ?? item.Origin,
    destination: item.destination ?? item.Destination,
    carrierCode: item.carrierCode ?? item.CarrierCode ?? null,
    estimatedHours: Number(item.estimatedHours ?? item.EstimatedHours ?? 0),
    isActive: Boolean(item.isActive ?? item.IsActive),
    segmentsCount: item.segmentsCount ?? (item.segments ? item.segments.length : 0),
    segments: Array.isArray(item.segments)
      ? item.segments.map((s: any) => ({
          id: s.id ?? s.Id,
          sequenceOrder: Number(s.sequenceOrder ?? s.SequenceOrder ?? 1),
          fromLocation: s.fromLocation ?? s.FromLocation,
          toLocation: s.toLocation ?? s.ToLocation,
          transportMode: s.transportMode ?? s.TransportMode,
          estimatedHours: Number(s.estimatedHours ?? s.EstimatedHours ?? 0),
        }))
      : [],
    createdAt: item.createdAtUtc ?? item.createdAt,
  }
}

// ─── Decision Audits & Recommendations ─────────────────────────────────────────

export async function getDecisionAudits(): Promise<DecisionAudit[]> {
  const data = await fetchJson<any[]>('/api/audit', () => [])
  if (!Array.isArray(data)) return []

  return data.map((item) => ({
    id: item.id ?? item.Id,
    operatorId: item.operatorId ?? item.OperatorId ?? 'SYSTEM',
    actionType: item.actionType ?? item.ActionType ?? 'AUTO_REROUTE',
    targetEntityType: item.targetEntityType ?? item.TargetEntityType ?? 'SHIPMENT',
    targetEntityId: item.targetEntityId ?? item.TargetEntityId ?? '',
    description: item.description ?? item.Description ?? '',
    status: (item.status?.toUpperCase() ?? 'APPROVED') as any,
    approvedAt: item.approvedAtUtc ?? item.approvedAt ?? new Date().toISOString(),
    appliedAt: item.appliedAtUtc ?? item.appliedAt ?? null,
    beforeStateJson: item.beforeStateJson ?? null,
    afterStateJson: item.afterStateJson ?? null,
  }))
}

export async function getAllRecommendations(): Promise<Recommendation[]> {
  const data = await fetchJson<any[]>('/api/audit/recommendations', () => [])
  if (!Array.isArray(data)) return []

  return data.map((item) => ({
    id: item.id ?? item.Id,
    shipmentId: item.shipmentId ?? item.ShipmentId,
    shipmentTrackingNumber: item.shipmentTrackingNumber ?? item.ShipmentTrackingNumber,
    shipmentOrigin: item.shipmentOrigin ?? item.ShipmentOrigin,
    shipmentDestination: item.shipmentDestination ?? item.ShipmentDestination,
    recommendationType: item.recommendationType ?? item.RecommendationType ?? 'REROUTE',
    title: item.title ?? item.Title ?? 'Recovery Plan',
    rationale: item.rationale ?? item.Rationale ?? '',
    severity: (item.severity?.toUpperCase() ?? 'HIGH') as SeverityLevel,
    confidence: item.confidence !== undefined && item.confidence !== null ? Number(item.confidence) : null,
    proposedRouteId: item.proposedRouteId ?? item.ProposedRouteId ?? null,
    proposedCarrier: item.proposedCarrier ?? item.ProposedCarrier ?? null,
    proposedFleetAssetId: item.proposedFleetAssetId ?? item.ProposedFleetAssetId ?? null,
    estimatedTimeSavingMinutes: item.estimatedTimeSavingMinutes ?? item.EstimatedTimeSavingMinutes ?? null,
    estimatedCostDeltaUsd: item.estimatedCostDeltaUsd ?? item.EstimatedCostDeltaUsd ?? null,
    requiresApproval: Boolean(item.requiresApproval ?? item.RequiresApproval ?? true),
    createdAt: item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }))
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function getAlerts(): Promise<Alert[]> {
  const data = await fetchJson<any[]>('/api/alerts', () => mockAlerts)
  if (!Array.isArray(data)) return mockAlerts

  return data.map((item) => ({
    id: item.id ?? item.Id,
    alertType: 'TEMPERATURE_EXCURSION',
    severity: (item.severity?.toUpperCase() ?? 'HIGH') as SeverityLevel,
    title: `Cold Chain Alert: Sensor ${item.sensorCode ?? 'SEN-001'}`,
    description: `Temperature reached ${item.excursionPeakCelsius ?? item.ExcursionPeakCelsius}°C (Allowed: ${item.allowedMinCelsius}°C to ${item.allowedMaxCelsius}°C).`,
    shipmentId: item.shipmentId ?? item.ShipmentId ?? null,
    sensorId: item.sensorId ?? item.SensorId ?? null,
    sensorCode: item.sensorCode ?? item.SensorCode ?? null,
    excursionPeakCelsius: item.excursionPeakCelsius ?? item.ExcursionPeakCelsius,
    allowedMinCelsius: item.allowedMinCelsius ?? item.AllowedMinCelsius,
    allowedMaxCelsius: item.allowedMaxCelsius ?? item.AllowedMaxCelsius,
    excursionStart: item.excursionStartUtc ?? item.excursionStart,
    excursionEnd: item.excursionEndUtc ?? item.excursionEnd,
    durationMinutes: item.durationMinutes ?? item.DurationMinutes,
    disruptionId: null,
    isAcknowledged: Boolean(item.isAcknowledged ?? item.IsAcknowledged),
    acknowledgedAt: item.acknowledgedAtUtc ?? item.acknowledgedAt ?? null,
    createdAt: item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }))
}

export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}/api/alerts/${alertId}/acknowledge`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    })
    return response.ok
  } catch (err) {
    console.warn(`[API] Could not acknowledge alert ${alertId}:`, err)
    return false
  }
}
