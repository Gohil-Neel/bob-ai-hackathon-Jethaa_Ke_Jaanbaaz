/**
 * SupplyShield AI — API & Supabase Service Layer
 *
 * Connects React UI components directly to Supabase PostgreSQL via PostgREST
 * and/or the ASP.NET Core Web API backend.
 * Provides fallback to local fixtures if the database is disconnected.
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
  Carrier,
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

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://jcctioxlzddejhhfxarx.supabase.co').replace(/\/$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjY3Rpb3hsemRkZWpoaGZ4YXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNzI1NDAsImV4cCI6MjEwNDk0ODU0MH0.-eS-vNNhqeMPVRleEm_oO9kaVTU1YXaEZdCm3fmOyiE'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : ''

/**
 * Executes a query against Supabase REST API (or optional ASP.NET backend)
 * Falls back to mock data if unconfigured or error occurs.
 */
async function fetchFromDatabase<T>(endpointOrTable: string, fallback: () => T): Promise<T> {
  // 1. If explicit custom API_BASE_URL is configured, try backend first
  if (API_BASE_URL) {
    try {
      const endpoint = endpointOrTable.startsWith('/') ? endpointOrTable : `/api/${endpointOrTable}`
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Accept': 'application/json' }
      })
      if (response.ok) {
        return (await response.json()) as T
      }
    } catch {
      // Fall through to direct Supabase REST
    }
  }

  // 2. Direct Supabase PostgREST query
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const tableQuery = endpointOrTable.replace(/^\/api\//, '')
      const url = `${SUPABASE_URL}/rest/v1/${tableQuery}`
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length === 0) {
          // Empty table in Supabase — return fallback fixtures so UI renders nicely
          return fallback()
        }
        return data as T
      } else {
        console.warn(`[Supabase] Query ${tableQuery} returned ${response.status}. Using fallback.`)
      }
    } catch (err) {
      console.warn(`[Supabase] Connection error querying ${endpointOrTable}:`, err)
    }
  }

  return fallback()
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

export async function getDashboardKpis(): Promise<DashboardKpis> {
  try {
    const [shipments, disruptions, alerts, vehicles] = await Promise.all([
      getShipments(),
      getDisruptions(),
      getAlerts(),
      getFleetAssets(),
    ])

    if (!shipments || shipments.length === 0) {
      return mockDashboardKpis
    }

    const totalShipments = shipments.length
    const activeDisruptions = disruptions.filter((d) => d.isActive).length
    const atRiskShipments = shipments.filter(
      (s) => s.status === 'AT_RISK' || (s.riskScore !== null && s.riskScore >= 0.7)
    ).length
    const coldChainAlerts = alerts.filter((a) => !a.isAcknowledged).length
    const idleFleetAssets = vehicles.filter(
      (v) => v.status === 'IDLE' || v.status === 'AVAILABLE'
    ).length

    return {
      totalShipments,
      activeDisruptions,
      atRiskShipments,
      coldChainAlerts,
      idleFleetAssets,
      lastUpdated: new Date().toISOString(),
    }
  } catch (err) {
    console.warn('[Dashboard] Error calculating KPIs from Supabase, using fallback:', err)
    return mockDashboardKpis
  }
}

// ─── Shipments ────────────────────────────────────────────────────────────────

export async function getShipments(): Promise<Shipment[]> {
  const data = await fetchFromDatabase<any[]>('shipments?select=*&order=created_at_utc.desc', () => mockShipments)
  if (!Array.isArray(data) || data.length === 0) return mockShipments

  return data.map((item) => {
    const rawStatus = (item.status ?? item.Status ?? 'IN_TRANSIT').toString().toUpperCase().replace('-', '_')
    const normalizedStatus: ShipmentStatus =
      rawStatus === 'ATRISK' ? 'AT_RISK' :
        rawStatus === 'INTRANSIT' ? 'IN_TRANSIT' :
          rawStatus === 'DELAYED' ? 'DELAYED' :
            rawStatus === 'DELIVERED' ? 'DELIVERED' :
              rawStatus === 'CANCELLED' ? 'CANCELLED' :
                rawStatus === 'PENDING' ? 'PENDING' : 'IN_TRANSIT'

    const rawPriority = (item.priority ?? item.Priority ?? 'MEDIUM').toString().toUpperCase()
    const normalizedPriority: SeverityLevel =
      rawPriority === 'CRITICAL' ? 'CRITICAL' :
        rawPriority === 'HIGH' ? 'HIGH' :
          rawPriority === 'LOW' ? 'LOW' : 'MEDIUM'

    return {
      id: item.id ?? item.Id,
      trackingNumber: item.tracking_number ?? item.trackingNumber ?? item.TrackingNumber ?? item.id,
      origin: item.origin ?? item.Origin ?? '',
      destination: item.destination ?? item.Destination ?? '',
      carrier: item.carrier_code ?? item.carrierCode ?? item.CarrierCode ?? item.carrier ?? 'UNKNOWN',
      status: normalizedStatus,
      priority: normalizedPriority,
      estimatedArrival: item.estimated_arrival_utc ?? item.estimatedArrivalUtc ?? item.estimatedArrival ?? null,
      isColdChain: Boolean(item.is_cold_chain ?? item.isColdChain ?? item.IsColdChain),
      routeId: item.route_id ?? item.routeId ?? item.RouteId ?? null,
      riskScore: typeof item.risk_score === 'number' ? item.risk_score : (typeof item.riskScore === 'number' ? item.riskScore : (item.RiskScore ?? null)),
      createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updated_at_utc ?? item.updatedAtUtc ?? item.updatedAt ?? new Date().toISOString(),
    }
  })
}

export async function getShipmentById(id: string): Promise<Shipment | null> {
  const data = await fetchFromDatabase<any[]>(`shipments?id=eq.${id}&select=*`, () => [])
  const item = Array.isArray(data) && data.length > 0 ? data[0] : (mockShipments.find((s) => s.id === id) ?? null)
  if (!item) return null

  const rawStatus = (item.status ?? item.Status ?? 'IN_TRANSIT').toString().toUpperCase().replace('-', '_')
  const normalizedStatus: ShipmentStatus =
    rawStatus === 'ATRISK' ? 'AT_RISK' :
      rawStatus === 'INTRANSIT' ? 'IN_TRANSIT' :
        rawStatus === 'DELAYED' ? 'DELAYED' :
          rawStatus === 'DELIVERED' ? 'DELIVERED' :
            rawStatus === 'CANCELLED' ? 'CANCELLED' :
              rawStatus === 'PENDING' ? 'PENDING' : 'IN_TRANSIT'

  const rawPriority = (item.priority ?? item.Priority ?? 'MEDIUM').toString().toUpperCase()
  const normalizedPriority: SeverityLevel =
    rawPriority === 'CRITICAL' ? 'CRITICAL' :
      rawPriority === 'HIGH' ? 'HIGH' :
        rawPriority === 'LOW' ? 'LOW' : 'MEDIUM'

  return {
    id: item.id ?? item.Id,
    trackingNumber: item.tracking_number ?? item.trackingNumber ?? item.TrackingNumber ?? item.id,
    origin: item.origin ?? item.Origin ?? '',
    destination: item.destination ?? item.Destination ?? '',
    carrier: item.carrier_code ?? item.carrierCode ?? item.CarrierCode ?? item.carrier ?? 'UNKNOWN',
    status: normalizedStatus,
    priority: normalizedPriority,
    estimatedArrival: item.estimated_arrival_utc ?? item.estimatedArrivalUtc ?? item.estimatedArrival ?? null,
    isColdChain: Boolean(item.is_cold_chain ?? item.isColdChain ?? item.IsColdChain),
    routeId: item.route_id ?? item.routeId ?? item.RouteId ?? null,
    riskScore: typeof item.risk_score === 'number' ? item.risk_score : (typeof item.riskScore === 'number' ? item.riskScore : (item.RiskScore ?? null)),
    createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updated_at_utc ?? item.updatedAtUtc ?? item.updatedAt ?? new Date().toISOString(),
  }
}

// ─── Disruptions ──────────────────────────────────────────────────────────────

export async function getDisruptions(): Promise<Disruption[]> {
  const data = await fetchFromDatabase<any[]>('disruptions?select=*,shipment_disruptions(count)&order=created_at_utc.desc', () => mockDisruptions)
  if (!Array.isArray(data) || data.length === 0) return mockDisruptions

  return data.map((item) => {
    const rawType = (item.disruption_type ?? item.disruptionType ?? item.DisruptionType ?? 'WEATHER').toString().toUpperCase()
    const normalizedType: DisruptionType =
      rawType === 'PORTCONGESTION' ? 'PORT_CONGESTION' :
        rawType === 'ROADCLOSURE' ? 'ROAD_CLOSURE' :
          rawType === 'CUSTOMSDELAY' ? 'CUSTOMS_DELAY' :
            rawType === 'CARRIERISSUE' ? 'CARRIER_ISSUE' :
              rawType === 'POLITICAL' ? 'POLITICAL' :
                rawType === 'OTHER' ? 'OTHER' :
                  rawType === 'WEATHER' ? 'WEATHER' : 'WEATHER'

    const rawSeverity = (item.severity?.toUpperCase() ?? item.Severity?.toUpperCase() ?? 'HIGH')
    const normalizedSeverity: SeverityLevel =
      rawSeverity === 'CRITICAL' ? 'CRITICAL' :
        rawSeverity === 'MEDIUM' ? 'MEDIUM' :
          rawSeverity === 'LOW' ? 'LOW' : 'HIGH'

    const shipmentCount = item.shipment_disruptions?.[0]?.count ??
      item.affectedShipmentsCount ??
      item.affectedShipmentCount ??
      item.affected_shipment_count ?? 0

    return {
      id: item.id ?? item.Id,
      title: item.title ?? item.Title ?? '',
      disruptionType: normalizedType,
      severity: normalizedSeverity,
      affectedRegion: item.affected_region ?? item.affectedRegion ?? item.AffectedRegion ?? '',
      description: item.description ?? item.Description ?? '',
      startedAt: item.started_at_utc ?? item.startedAtUtc ?? item.startedAt ?? new Date().toISOString(),
      resolvedAt: item.resolved_at_utc ?? item.resolvedAtUtc ?? item.resolvedAt ?? null,
      isActive: Boolean(item.is_active ?? item.isActive ?? item.IsActive ?? true),
      affectedShipmentCount: shipmentCount,
      createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
    }
  })
}

export async function getDisruptionById(id: string): Promise<Disruption | null> {
  const data = await fetchFromDatabase<any[]>(`disruptions?id=eq.${id}&select=*,shipment_disruptions(count)`, () => [])
  const item = Array.isArray(data) && data.length > 0 ? data[0] : (mockDisruptions.find((d) => d.id === id) ?? null)
  if (!item) return null

  const rawType = (item.disruption_type ?? item.disruptionType ?? item.DisruptionType ?? 'WEATHER').toString().toUpperCase()
  const normalizedType: DisruptionType =
    rawType === 'PORTCONGESTION' ? 'PORT_CONGESTION' :
      rawType === 'ROADCLOSURE' ? 'ROAD_CLOSURE' :
        rawType === 'CUSTOMSDELAY' ? 'CUSTOMS_DELAY' :
          rawType === 'CARRIERISSUE' ? 'CARRIER_ISSUE' :
            rawType === 'POLITICAL' ? 'POLITICAL' :
              rawType === 'OTHER' ? 'OTHER' : 'WEATHER'

  return {
    id: item.id ?? item.Id,
    title: item.title ?? item.Title ?? '',
    disruptionType: normalizedType,
    severity: (item.severity?.toUpperCase() ?? 'HIGH') as SeverityLevel,
    affectedRegion: item.affected_region ?? item.affectedRegion ?? item.AffectedRegion ?? '',
    description: item.description ?? item.Description ?? '',
    startedAt: item.started_at_utc ?? item.startedAtUtc ?? item.startedAt ?? new Date().toISOString(),
    resolvedAt: item.resolved_at_utc ?? item.resolvedAtUtc ?? item.resolvedAt ?? null,
    isActive: Boolean(item.is_active ?? item.isActive ?? item.IsActive ?? true),
    affectedShipmentCount: item.shipment_disruptions?.[0]?.count ?? item.affectedShipmentsCount ?? 0,
    createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }
}

// ─── Fleet ────────────────────────────────────────────────────────────────────

export async function getFleetAssets(): Promise<FleetAsset[]> {
  const data = await fetchFromDatabase<any[]>('vehicles?select=*&order=created_at_utc.desc', () => mockFleetAssets)
  if (!Array.isArray(data) || data.length === 0) return mockFleetAssets

  return data.map((item) => {
    const rawStatus = (item.status ?? item.Status ?? 'AVAILABLE').toString().toUpperCase()
    const normalizedStatus: FleetAssetStatus =
      rawStatus === 'INUSE' ? 'IN_USE' :
        rawStatus === 'IDLE' ? 'IDLE' :
          rawStatus === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE'

    return {
      id: item.id ?? item.Id,
      assetCode: item.asset_code ?? item.assetCode ?? item.AssetCode,
      assetType: item.asset_type ?? item.assetType ?? item.AssetType,
      status: normalizedStatus,
      capacityKg: Number(item.capacity_kg ?? item.capacityKg ?? item.CapacityKg ?? 0),
      currentLocation: item.current_location ?? item.currentLocation ?? item.CurrentLocation ?? '',
      carrierId: item.carrier_id ?? item.carrierId ?? null,
      lastSeenAt: item.last_seen_at_utc ?? item.lastSeenAtUtc ?? item.lastSeenAt ?? null,
      createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
    }
  })
}

// ─── Cold Chain ───────────────────────────────────────────────────────────────

export async function getColdChainSensors(): Promise<ColdChainSensor[]> {
  const data = await fetchFromDatabase<any[]>('sensors?select=*,shipments(tracking_number)&order=created_at_utc.desc', () => mockColdChainSensors)
  if (!Array.isArray(data) || data.length === 0) return mockColdChainSensors

  return data.map((item) => ({
    id: item.id ?? item.Id,
    sensorCode: item.sensor_code ?? item.sensorCode ?? item.SensorCode,
    shipmentId: item.shipment_id ?? item.shipmentId ?? item.ShipmentId,
    shipmentTrackingNumber: item.shipments?.tracking_number ?? item.shipmentTrackingNumber ?? item.ShipmentTrackingNumber,
    minTempCelsius: Number(item.min_temp_celsius ?? item.minTempCelsius ?? item.MinTempCelsius ?? 2.0),
    maxTempCelsius: Number(item.max_temp_celsius ?? item.maxTempCelsius ?? item.MaxTempCelsius ?? 8.0),
    lastReadingCelsius: item.last_reading_celsius !== undefined && item.last_reading_celsius !== null
      ? Number(item.last_reading_celsius)
      : (item.lastReadingCelsius !== undefined && item.lastReadingCelsius !== null ? Number(item.lastReadingCelsius) : null),
    lastReadingAt: item.last_reading_at_utc ?? item.lastReadingAtUtc ?? item.lastReadingAt ?? null,
    status: (item.status?.toUpperCase() === 'EXCURSION' ? 'EXCURSION' : item.status?.toUpperCase() === 'WARNING' ? 'RECOVERING' : 'NORMAL') as ColdChainStatus,
    currentExcursionSeverity: item.current_excursion_severity
      ? (item.current_excursion_severity.toUpperCase() as SeverityLevel)
      : (item.currentExcursionSeverity ? (item.currentExcursionSeverity.toUpperCase() as SeverityLevel) : null),
    createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }))
}

export async function getSensorReadings(sensorId: string): Promise<TemperatureReading[]> {
  const data = await fetchFromDatabase<any[]>(`sensor_readings?sensor_id=eq.${sensorId}&order=recorded_at_utc.desc&limit=50`, () => [])
  if (!Array.isArray(data)) return []

  return data.map((r) => ({
    id: r.id ?? r.Id,
    sensorId: r.sensor_id ?? r.sensorId ?? r.SensorId,
    temperatureCelsius: Number(r.temperature_celsius ?? r.temperatureCelsius ?? r.TemperatureCelsius),
    recordedAt: r.recorded_at_utc ?? r.recordedAtUtc ?? r.recordedAt,
    isExcursion: Boolean(r.is_excursion ?? r.isExcursion ?? r.IsExcursion),
  }))
}

// ─── Routes & Corridors ───────────────────────────────────────────────────────

export async function getRoutes(): Promise<Route[]> {
  const data = await fetchFromDatabase<any[]>('routes?select=*,route_segments(*)&order=created_at_utc.desc', () => [])
  if (!Array.isArray(data)) return []

  return data.map((item) => {
    const rawSegments = item.route_segments ?? item.segments ?? []
    const segments = Array.isArray(rawSegments)
      ? rawSegments.map((s: any) => ({
        id: s.id ?? s.Id,
        sequenceOrder: Number(s.sequence_order ?? s.sequenceOrder ?? s.SequenceOrder ?? 1),
        fromLocation: s.from_location ?? s.fromLocation ?? s.FromLocation ?? '',
        toLocation: s.to_location ?? s.toLocation ?? s.ToLocation ?? '',
        transportMode: s.transport_mode ?? s.transportMode ?? s.TransportMode ?? 'Road',
        estimatedHours: Number(s.estimated_hours ?? s.estimatedHours ?? s.EstimatedHours ?? 0),
      }))
      : []

    return {
      id: item.id ?? item.Id,
      name: item.name ?? item.Name,
      origin: item.origin ?? item.Origin,
      destination: item.destination ?? item.Destination,
      carrierCode: item.carrier_code ?? item.carrierCode ?? item.CarrierCode ?? null,
      estimatedHours: Number(item.estimated_hours ?? item.estimatedHours ?? item.EstimatedHours ?? 0),
      isActive: Boolean(item.is_active ?? item.isActive ?? item.IsActive ?? true),
      segmentsCount: segments.length,
      segments,
      createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt,
    }
  })
}

export async function getRouteById(id: string): Promise<Route | null> {
  const data = await fetchFromDatabase<any[]>(`routes?id=eq.${id}&select=*,route_segments(*)`, () => [])
  const item = Array.isArray(data) && data.length > 0 ? data[0] : null
  if (!item) return null

  const rawSegments = item.route_segments ?? item.segments ?? []
  const segments = Array.isArray(rawSegments)
    ? rawSegments.map((s: any) => ({
      id: s.id ?? s.Id,
      sequenceOrder: Number(s.sequence_order ?? s.sequenceOrder ?? s.SequenceOrder ?? 1),
      fromLocation: s.from_location ?? s.fromLocation ?? s.FromLocation ?? '',
      toLocation: s.to_location ?? s.toLocation ?? s.ToLocation ?? '',
      transportMode: s.transport_mode ?? s.transportMode ?? s.TransportMode ?? 'Road',
      estimatedHours: Number(s.estimated_hours ?? s.estimatedHours ?? s.EstimatedHours ?? 0),
    }))
    : []

  return {
    id: item.id ?? item.Id,
    name: item.name ?? item.Name,
    origin: item.origin ?? item.Origin,
    destination: item.destination ?? item.Destination,
    carrierCode: item.carrier_code ?? item.carrierCode ?? item.CarrierCode ?? null,
    estimatedHours: Number(item.estimated_hours ?? item.estimatedHours ?? item.EstimatedHours ?? 0),
    isActive: Boolean(item.is_active ?? item.isActive ?? item.IsActive ?? true),
    segmentsCount: segments.length,
    segments,
    createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt,
  }
}

// ─── Decision Audits & Recommendations ─────────────────────────────────────────

export async function getDecisionAudits(): Promise<DecisionAudit[]> {
  const data = await fetchFromDatabase<any[]>('decision_audits?select=*&order=approved_at_utc.desc', () => [])
  if (!Array.isArray(data)) return []

  return data.map((item) => ({
    id: item.id ?? item.Id,
    operatorId: item.operator_id ?? item.operatorId ?? item.OperatorId ?? 'SYSTEM',
    actionType: item.action_type ?? item.actionType ?? item.ActionType ?? 'AUTO_REROUTE',
    targetEntityType: item.target_entity_type ?? item.targetEntityType ?? item.TargetEntityType ?? 'SHIPMENT',
    targetEntityId: item.target_entity_id ?? item.targetEntityId ?? item.TargetEntityId ?? '',
    description: item.description ?? item.Description ?? '',
    status: (item.status?.toUpperCase() ?? 'APPROVED') as any,
    approvedAt: item.approved_at_utc ?? item.approvedAtUtc ?? item.approvedAt ?? new Date().toISOString(),
    appliedAt: item.applied_at_utc ?? item.appliedAtUtc ?? item.appliedAt ?? null,
    beforeStateJson: item.before_state_json ?? item.beforeStateJson ?? null,
    afterStateJson: item.after_state_json ?? item.afterStateJson ?? null,
  }))
}

export async function getAllRecommendations(): Promise<Recommendation[]> {
  const data = await fetchFromDatabase<any[]>('recovery_recommendations?select=*,shipments(tracking_number,origin,destination)&order=created_at_utc.desc', () => [])
  if (!Array.isArray(data)) return []

  return data.map((item) => ({
    id: item.id ?? item.Id,
    shipmentId: item.shipment_id ?? item.shipmentId ?? item.ShipmentId,
    shipmentTrackingNumber: item.shipments?.tracking_number ?? item.shipmentTrackingNumber ?? item.ShipmentTrackingNumber,
    shipmentOrigin: item.shipments?.origin ?? item.shipmentOrigin ?? item.ShipmentOrigin,
    shipmentDestination: item.shipments?.destination ?? item.shipmentDestination ?? item.ShipmentDestination,
    recommendationType: item.recommendation_type ?? item.recommendationType ?? item.RecommendationType ?? 'REROUTE',
    title: item.title ?? item.Title ?? 'Recovery Plan',
    rationale: item.rationale ?? item.Rationale ?? '',
    severity: (item.severity?.toUpperCase() ?? 'HIGH') as SeverityLevel,
    confidence: item.confidence !== undefined && item.confidence !== null ? Number(item.confidence) : null,
    proposedRouteId: item.proposed_route_id ?? item.proposedRouteId ?? item.ProposedRouteId ?? null,
    proposedCarrier: item.proposed_carrier_code ?? item.proposedCarrier ?? item.ProposedCarrier ?? null,
    proposedFleetAssetId: item.proposed_vehicle_id ?? item.proposedFleetAssetId ?? item.ProposedFleetAssetId ?? null,
    estimatedTimeSavingMinutes: item.estimated_time_saving_minutes ?? item.estimatedTimeSavingMinutes ?? item.EstimatedTimeSavingMinutes ?? null,
    estimatedCostDeltaUsd: item.estimated_cost_delta_usd !== undefined && item.estimated_cost_delta_usd !== null
      ? Number(item.estimated_cost_delta_usd)
      : (item.estimatedCostDeltaUsd ?? null),
    requiresApproval: Boolean(item.requires_approval ?? item.requiresApproval ?? item.RequiresApproval ?? true),
    createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }))
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function getAlerts(): Promise<Alert[]> {
  const data = await fetchFromDatabase<any[]>('cold_chain_alerts?select=*,sensors(sensor_code),shipments(tracking_number)&order=created_at_utc.desc', () => mockAlerts)
  if (!Array.isArray(data) || data.length === 0) return mockAlerts

  return data.map((item) => ({
    id: item.id ?? item.Id,
    alertType: 'TEMPERATURE_EXCURSION',
    severity: (item.severity?.toUpperCase() ?? 'HIGH') as SeverityLevel,
    title: `Cold Chain Alert: Sensor ${item.sensors?.sensor_code ?? item.sensorCode ?? 'SEN-001'}`,
    description: `Temperature reached ${item.excursion_peak_celsius ?? item.excursionPeakCelsius ?? item.ExcursionPeakCelsius ?? '9.8'}°C (Allowed: ${item.allowed_min_celsius ?? item.allowedMinCelsius ?? 2.0}°C to ${item.allowed_max_celsius ?? item.allowedMaxCelsius ?? 8.0}°C).`,
    shipmentId: item.shipment_id ?? item.shipmentId ?? item.ShipmentId ?? null,
    shipmentTrackingNumber: item.shipments?.tracking_number ?? item.shipmentTrackingNumber ?? null,
    sensorId: item.sensor_id ?? item.sensorId ?? item.SensorId ?? null,
    sensorCode: item.sensors?.sensor_code ?? item.sensorCode ?? item.SensorCode ?? null,
    excursionPeakCelsius: item.excursion_peak_celsius !== undefined ? Number(item.excursion_peak_celsius) : item.excursionPeakCelsius,
    allowedMinCelsius: item.allowed_min_celsius !== undefined ? Number(item.allowed_min_celsius) : item.allowedMinCelsius,
    allowedMaxCelsius: item.allowed_max_celsius !== undefined ? Number(item.allowed_max_celsius) : item.allowedMaxCelsius,
    excursionStart: item.excursion_start_utc ?? item.excursionStartUtc ?? item.excursionStart,
    excursionEnd: item.excursion_end_utc ?? item.excursionEndUtc ?? item.excursionEnd,
    durationMinutes: item.duration_minutes ?? item.durationMinutes ?? item.DurationMinutes,
    disruptionId: null,
    isAcknowledged: Boolean(item.is_acknowledged ?? item.isAcknowledged ?? item.IsAcknowledged),
    acknowledgedAt: item.acknowledged_at_utc ?? item.acknowledgedAtUtc ?? item.acknowledgedAt ?? null,
    createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }))
}

export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/cold_chain_alerts?id=eq.${alertId}`
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          is_acknowledged: true,
          acknowledged_at_utc: new Date().toISOString(),
        }),
      })
      if (response.ok) return true
    } catch (err) {
      console.warn(`[Supabase] Could not acknowledge alert ${alertId}:`, err)
    }
  }
  return false
}

// ─── Carriers ─────────────────────────────────────────────────────────────────

export async function getCarriers(): Promise<Carrier[]> {
  const data = await fetchFromDatabase<any[]>('carriers?select=*&order=name.asc', () => [])
  if (!Array.isArray(data)) return []

  return data.map((item) => ({
    id: item.id ?? item.Id,
    code: item.code ?? item.Code,
    name: item.name ?? item.Name,
    contactEmail: item.contact_email ?? item.contactEmail ?? item.ContactEmail ?? null,
    isActive: Boolean(item.is_active ?? item.isActive ?? item.IsActive ?? true),
    createdAt: item.created_at_utc ?? item.createdAtUtc ?? item.createdAt ?? new Date().toISOString(),
  }))
}


