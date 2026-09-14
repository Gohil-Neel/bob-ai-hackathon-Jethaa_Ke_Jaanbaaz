/**
 * SupplyShield AI — Alerts & Incident Triage Page
 *
 * Real-time incident command center with:
 * - Live alert feed with severity triage bands
 * - Incident detail panel with timeline & RCA
 * - Bulk acknowledge / escalate / resolve actions
 * - MTTR / SLA breach metrics
 * - Audit ledger for all triage actions
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type AlertType =
  | 'TEMPERATURE_EXCURSION'
  | 'DISRUPTION'
  | 'DELAY'
  | 'DATA_GAP'
  | 'SYSTEM'
  | 'CARRIER_SLA'
  | 'CUSTOMS';
type AlertStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLVED';

interface TimelineEvent {
  timestamp: string;
  actor: string;
  action: string;
  note: string;
  kind: 'detection' | 'escalation' | 'action' | 'resolution' | 'update';
}

interface IncidentAlert {
  id: string;
  incidentId: string;
  alertType: AlertType;
  severity: Severity;
  title: string;
  description: string;
  shipmentCode: string | null;
  sensorId: string | null;
  disruptionId: string | null;
  status: AlertStatus;
  isAcknowledged: boolean;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  createdAt: string;
  slaDeadline: string;
  mttrMinutes: number | null;
  region: string;
  impactedShipments: number;
  rootCause: string | null;
  recommendedActions: string[];
  timeline: TimelineEvent[];
  escalationPath: string[];
}

interface AuditEntry {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  alertTitle: string;
  hash: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ALERTS: IncidentAlert[] = [
  {
    id: 'alt-001',
    incidentId: 'INC-2024-0047',
    alertType: 'TEMPERATURE_EXCURSION',
    severity: 'CRITICAL',
    title: 'Cold Chain Breach — Insulin Shipment SS-2024-0001',
    description:
      'Sensor SENSOR-A1 recorded sustained temperature of 10.4°C (allowed: 2–8°C). Excursion duration now exceeds 87 minutes. Product integrity at risk.',
    shipmentCode: 'SS-2024-0001',
    sensorId: 'sns-001',
    disruptionId: null,
    status: 'IN_PROGRESS',
    isAcknowledged: true,
    acknowledgedAt: '2024-12-14T10:15:00Z',
    acknowledgedBy: 'Riya Sharma',
    createdAt: '2024-12-14T10:00:00Z',
    slaDeadline: '2024-12-14T11:00:00Z',
    mttrMinutes: null,
    region: 'North Atlantic',
    impactedShipments: 1,
    rootCause:
      'Reefer unit compressor failure detected. Secondary backup unit not triggered due to sensor firmware v2.1.3 bug.',
    recommendedActions: [
      'Immediately contact carrier Maersk for emergency reefer repair',
      'Dispatch backup fleet unit TRUCK-009 (currently 12 km away)',
      'Notify consignee Chicago Pharma Depot of potential excursion',
      'Initiate QA hold protocol — do not release product without MKT assessment',
      'File excursion report to GDP compliance team within 2 hours',
    ],
    timeline: [
      {
        timestamp: '2024-12-14T10:00:00Z',
        actor: 'AI Monitor',
        action: 'Alert Generated',
        note: 'Temp threshold breach detected: 10.4°C vs 8°C limit',
        kind: 'detection',
      },
      {
        timestamp: '2024-12-14T10:03:00Z',
        actor: 'System',
        action: 'PagerDuty Triggered',
        note: 'On-call engineer Riya Sharma notified via SMS + app',
        kind: 'escalation',
      },
      {
        timestamp: '2024-12-14T10:15:00Z',
        actor: 'Riya Sharma',
        action: 'Alert Acknowledged',
        note: 'Reviewing carrier telemetry data',
        kind: 'action',
      },
      {
        timestamp: '2024-12-14T10:28:00Z',
        actor: 'Riya Sharma',
        action: 'Carrier Contacted',
        note: 'Maersk ops confirmed reefer unit fault — repair ETA 45 min',
        kind: 'action',
      },
      {
        timestamp: '2024-12-14T10:45:00Z',
        actor: 'AI Copilot',
        action: 'Root Cause Identified',
        note: 'Firmware bug confirmed in v2.1.3 — escalated to IoT team',
        kind: 'update',
      },
    ],
    escalationPath: [
      'Riya Sharma (L1)',
      'Arjun Mehta (L2 — Cold Chain Lead)',
      'Dr. Priya Nair (L3 — GDP Compliance)',
    ],
  },
  {
    id: 'alt-002',
    incidentId: 'INC-2024-0046',
    alertType: 'DISRUPTION',
    severity: 'CRITICAL',
    title: 'Force Majeure — North Atlantic Storm System',
    description:
      '14 shipments affected by Category 4 North Atlantic storm. Carrier deviations authorized. ETA revisions pending for 6 high-priority loads.',
    shipmentCode: null,
    sensorId: null,
    disruptionId: 'dis-001',
    status: 'IN_PROGRESS',
    isAcknowledged: true,
    acknowledgedAt: '2024-12-12T06:30:00Z',
    acknowledgedBy: 'Arjun Mehta',
    createdAt: '2024-12-12T06:00:00Z',
    slaDeadline: '2024-12-12T09:00:00Z',
    mttrMinutes: null,
    region: 'North Atlantic / EU',
    impactedShipments: 14,
    rootCause:
      'Rapid cyclogenesis beyond 72-hour forecast window. Weather API confidence score degraded to 41% at T-96h.',
    recommendedActions: [
      'Activate force majeure clause with carriers Maersk, MSC',
      'Reroute 3 critical shipments via southern Azores corridor (+18h)',
      'Notify all 14 affected consignees of revised ETAs',
      'Engage insurance broker for cargo delay claims',
      'Update supply allocation model for EU distribution centres',
    ],
    timeline: [
      {
        timestamp: '2024-12-12T06:00:00Z',
        actor: 'Weather AI',
        action: 'Disruption Detected',
        note: 'ECMWF ensemble: 94% probability of 48h operational shutdown — Hamburg port',
        kind: 'detection',
      },
      {
        timestamp: '2024-12-12T06:15:00Z',
        actor: 'System',
        action: 'Mass Alert Issued',
        note: '14 shipment operators notified simultaneously',
        kind: 'escalation',
      },
      {
        timestamp: '2024-12-12T06:30:00Z',
        actor: 'Arjun Mehta',
        action: 'Crisis Bridge Opened',
        note: 'War-room call initiated with 6 carriers',
        kind: 'action',
      },
      {
        timestamp: '2024-12-12T07:45:00Z',
        actor: 'Arjun Mehta',
        action: 'Reroute Approved',
        note: 'SS-2024-0001, 0002, 0007 rerouted via Azores corridor',
        kind: 'action',
      },
    ],
    escalationPath: [
      'Arjun Mehta (L2 — Operations)',
      'Vikram Rao (L3 — VP Logistics)',
      'Exec Committee',
    ],
  },
  {
    id: 'alt-003',
    incidentId: 'INC-2024-0045',
    alertType: 'DELAY',
    severity: 'HIGH',
    title: 'Port Congestion Delay — Rotterdam +36h',
    description:
      'SS-2024-0003 delayed 36 hours due to Rotterdam port worker strike. Consignee Tokyo Pharma Ltd. facing stock-out risk in 48h.',
    shipmentCode: 'SS-2024-0003',
    sensorId: null,
    disruptionId: 'dis-002',
    status: 'ACKNOWLEDGED',
    isAcknowledged: true,
    acknowledgedAt: '2024-12-14T09:00:00Z',
    acknowledgedBy: 'Meera Pillai',
    createdAt: '2024-12-13T07:00:00Z',
    slaDeadline: '2024-12-13T13:00:00Z',
    mttrMinutes: 1560,
    region: 'Rotterdam, Netherlands',
    impactedShipments: 3,
    rootCause:
      'Unplanned 48-hour dock worker strike. Port authority issued Force Majeure notice at 06:00 UTC.',
    recommendedActions: [
      'Activate air freight contingency for critical pharmaceutical items',
      'Negotiate expedited customs clearance on arrival',
      'Coordinate with consignee for emergency stock transfer from Frankfurt depot',
    ],
    timeline: [
      {
        timestamp: '2024-12-13T07:00:00Z',
        actor: 'Port Monitor',
        action: 'Strike Detected',
        note: 'Rotterdam port declared operational shutdown',
        kind: 'detection',
      },
      {
        timestamp: '2024-12-13T07:30:00Z',
        actor: 'System',
        action: 'Delay Alert Fired',
        note: '36h delay calculated for SS-2024-0003',
        kind: 'escalation',
      },
      {
        timestamp: '2024-12-14T09:00:00Z',
        actor: 'Meera Pillai',
        action: 'Acknowledged',
        note: 'Reviewing air freight costs vs. delay impact',
        kind: 'action',
      },
    ],
    escalationPath: ['Meera Pillai (L1)', 'Arjun Mehta (L2)'],
  },
  {
    id: 'alt-004',
    incidentId: 'INC-2024-0044',
    alertType: 'DATA_GAP',
    severity: 'MEDIUM',
    title: 'IoT Data Gap — SENSOR-B3 Offline 2h+',
    description:
      'No temperature telemetry received from SENSOR-B3 on shipment SS-2024-0001 for 127 minutes. Possible device failure or connectivity outage.',
    shipmentCode: 'SS-2024-0001',
    sensorId: 'sns-003',
    disruptionId: null,
    status: 'NEW',
    isAcknowledged: false,
    acknowledgedAt: null,
    acknowledgedBy: null,
    createdAt: '2024-12-14T09:00:00Z',
    slaDeadline: '2024-12-14T11:00:00Z',
    mttrMinutes: null,
    region: 'Mid-Atlantic (Vessel)',
    impactedShipments: 1,
    rootCause: null,
    recommendedActions: [
      'Ping device via LTE fallback channel',
      'Request vessel crew to visually inspect sensor unit',
      'Flag excursion risk — worst-case temperature projection: 12°C at 3h without data',
    ],
    timeline: [
      {
        timestamp: '2024-12-14T09:00:00Z',
        actor: 'IoT Gateway',
        action: 'Heartbeat Lost',
        note: 'SENSOR-B3 last ping at 09:00 UTC. Connection timeout after 120s.',
        kind: 'detection',
      },
    ],
    escalationPath: ['IoT Operations Team', 'Riya Sharma (Cold Chain Lead)'],
  },
  {
    id: 'alt-005',
    incidentId: 'INC-2024-0043',
    alertType: 'CARRIER_SLA',
    severity: 'HIGH',
    title: 'Carrier SLA Breach — CMA CGM On-Time < 85%',
    description:
      'CMA CGM monthly on-time delivery rate dropped to 81.3% (SLA threshold: 85%). 3 consecutive breaches trigger automatic contract review clause.',
    shipmentCode: null,
    sensorId: null,
    disruptionId: null,
    status: 'ESCALATED',
    isAcknowledged: true,
    acknowledgedAt: '2024-12-10T14:00:00Z',
    acknowledgedBy: 'Vikram Rao',
    createdAt: '2024-12-10T13:00:00Z',
    slaDeadline: '2024-12-12T13:00:00Z',
    mttrMinutes: null,
    region: 'Global — CMA CGM Network',
    impactedShipments: 7,
    rootCause:
      'Systematic vessel capacity overbooking pattern identified across 3 trade lanes: Asia-Europe, USWC-Asia, Europe-Gulf.',
    recommendedActions: [
      'Formally invoke SLA breach clause — request remediation plan within 5 business days',
      'Divert 4 upcoming bookings to Maersk and Hapag-Lloyd',
      'Activate backup carrier contract with Evergreen Marine',
      'Schedule performance review call with CMA CGM VP of Operations',
    ],
    timeline: [
      {
        timestamp: '2024-12-10T13:00:00Z',
        actor: 'Analytics Engine',
        action: 'SLA Breach Computed',
        note: 'Rolling 30-day OTD: 81.3% (SLA: >= 85%)',
        kind: 'detection',
      },
      {
        timestamp: '2024-12-10T13:30:00Z',
        actor: 'System',
        action: 'Contract Review Triggered',
        note: '3rd consecutive breach — auto-escalation to VP Logistics',
        kind: 'escalation',
      },
      {
        timestamp: '2024-12-10T14:00:00Z',
        actor: 'Vikram Rao',
        action: 'Escalated to Legal',
        note: 'Penalty clause assessment initiated',
        kind: 'escalation',
      },
    ],
    escalationPath: ['Vikram Rao (VP Logistics)', 'Legal & Procurement', 'CEO Office'],
  },
  {
    id: 'alt-006',
    incidentId: 'INC-2024-0041',
    alertType: 'CUSTOMS',
    severity: 'MEDIUM',
    title: 'Customs Hold — SS-2024-0004 Dubai',
    description:
      'Shipment SS-2024-0004 placed under UAE customs examination. Missing pharmaceutical import certificate. Release expected in 24-48h.',
    shipmentCode: 'SS-2024-0004',
    sensorId: null,
    disruptionId: null,
    status: 'RESOLVED',
    isAcknowledged: true,
    acknowledgedAt: '2024-12-11T09:00:00Z',
    acknowledgedBy: 'Sanjay Gupta',
    createdAt: '2024-12-11T08:00:00Z',
    slaDeadline: '2024-12-11T20:00:00Z',
    mttrMinutes: 720,
    region: 'Dubai, UAE',
    impactedShipments: 1,
    rootCause:
      'Automated document submission missed UAE Form-17B (new requirement effective Dec 1). System regulatory update delayed by 12 days.',
    recommendedActions: [
      'Document filed and shipment cleared at 20:00 UTC',
      'Regulatory database update deployed for future submissions',
    ],
    timeline: [
      {
        timestamp: '2024-12-11T08:00:00Z',
        actor: 'Customs API',
        action: 'Hold Detected',
        note: 'Dubai customs examination notice received',
        kind: 'detection',
      },
      {
        timestamp: '2024-12-11T09:00:00Z',
        actor: 'Sanjay Gupta',
        action: 'Documentation Filed',
        note: 'Form-17B submitted via customs broker',
        kind: 'action',
      },
      {
        timestamp: '2024-12-11T20:00:00Z',
        actor: 'Customs Authority',
        action: 'Clearance Granted',
        note: 'Shipment released. Delay: 12 hours.',
        kind: 'resolution',
      },
    ],
    escalationPath: ['Sanjay Gupta (Customs)', 'Meera Pillai (Compliance)'],
  },
];

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: 'aud-007',
    timestamp: '2024-12-14T10:28:00Z',
    operator: 'Riya Sharma',
    action: 'Carrier Contacted — Maersk',
    alertTitle: 'INC-2024-0047',
    hash: 'f3a9b2c1',
  },
  {
    id: 'aud-006',
    timestamp: '2024-12-14T10:15:00Z',
    operator: 'Riya Sharma',
    action: 'Acknowledged',
    alertTitle: 'INC-2024-0047',
    hash: 'a7d4e891',
  },
  {
    id: 'aud-005',
    timestamp: '2024-12-12T07:45:00Z',
    operator: 'Arjun Mehta',
    action: 'Reroute Approved — 3 Shipments',
    alertTitle: 'INC-2024-0046',
    hash: 'c2f8a310',
  },
  {
    id: 'aud-004',
    timestamp: '2024-12-14T09:00:00Z',
    operator: 'Meera Pillai',
    action: 'Acknowledged',
    alertTitle: 'INC-2024-0045',
    hash: 'b91f3d27',
  },
  {
    id: 'aud-003',
    timestamp: '2024-12-10T14:00:00Z',
    operator: 'Vikram Rao',
    action: 'Escalated to Legal',
    alertTitle: 'INC-2024-0043',
    hash: 'e5c6f482',
  },
  {
    id: 'aud-002',
    timestamp: '2024-12-11T20:00:00Z',
    operator: 'Sanjay Gupta',
    action: 'Resolved — Customs Cleared',
    alertTitle: 'INC-2024-0041',
    hash: '9d2a7b56',
  },
];

// ─── Config Maps ──────────────────────────────────────────────────────────────

const SEV: Record<
  Severity,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  CRITICAL: {
    label: 'Critical',
    dot: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    text: '#ef4444',
    border: 'rgba(239,68,68,0.35)',
  },
  HIGH: {
    label: 'High',
    dot: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
    text: '#fb923c',
    border: 'rgba(249,115,22,0.35)',
  },
  MEDIUM: {
    label: 'Medium',
    dot: '#eab308',
    bg: 'rgba(234,179,8,0.1)',
    text: '#facc15',
    border: 'rgba(234,179,8,0.35)',
  },
  LOW: {
    label: 'Low',
    dot: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    text: '#4ade80',
    border: 'rgba(34,197,94,0.35)',
  },
};

const STA: Record<AlertStatus, { label: string; cls: string }> = {
  NEW: {
    label: 'New',
    cls: 'bg-red-500/20 text-red-300 border border-red-500/40',
  },
  ACKNOWLEDGED: {
    label: 'Acknowledged',
    cls: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  },
  ESCALATED: {
    label: 'Escalated',
    cls: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
  },
  RESOLVED: {
    label: 'Resolved',
    cls: 'bg-green-500/20 text-green-300 border border-green-500/40',
  },
};

const TYPE_ICON: Record<AlertType, string> = {
  TEMPERATURE_EXCURSION: '🌡️',
  DISRUPTION: '🌪️',
  DELAY: '⏱️',
  DATA_GAP: '📡',
  SYSTEM: '⚙️',
  CARRIER_SLA: '📋',
  CUSTOMS: '🛃',
};

const TYPE_LABEL: Record<AlertType, string> = {
  TEMPERATURE_EXCURSION: 'Cold Chain',
  DISRUPTION: 'Disruption',
  DELAY: 'Delay',
  DATA_GAP: 'Data Gap',
  SYSTEM: 'System',
  CARRIER_SLA: 'SLA Breach',
  CUSTOMS: 'Customs',
};

const TL_ICON: Record<TimelineEvent['kind'], string> = {
  detection: '🔍',
  escalation: '📣',
  action: '⚡',
  resolution: '✅',
  update: '🔄',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function isBreached(deadline: string, status: AlertStatus) {
  if (status === 'RESOLVED') return false;
  return new Date('2024-12-14T11:30:00Z') > new Date(deadline);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Chip({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        className ?? ''
      }`}
      style={style}
    >
      {children}
    </span>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="flex flex-col gap-2 p-5 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {label}
        </span>
      </div>
      <div className="text-3xl font-extrabold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {sub}
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  selected,
  onClick,
  onAck,
}: {
  alert: IncidentAlert;
  selected: boolean;
  onClick: () => void;
  onAck: (id: string) => void;
}) {
  const s = SEV[alert.severity];
  const st = STA[alert.status];
  const breached = isBreached(alert.slaDeadline, alert.status);
  const isNew = alert.status === 'NEW';

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:brightness-110"
      style={{
        background: selected
          ? s.bg
          : isNew
          ? 'rgba(239,68,68,0.04)'
          : 'rgba(255,255,255,0.025)',
        border: selected
          ? `1.5px solid ${s.border}`
          : isNew
          ? '1px solid rgba(239,68,68,0.2)'
          : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Severity dot */}
        <div className="mt-1.5 flex-shrink-0">
          {isNew ? (
            <span className="relative flex h-3 w-3">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                style={{ background: s.dot }}
              />
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ background: s.dot }}
              />
            </span>
          ) : (
            <span
              className="inline-flex rounded-full h-3 w-3"
              style={{ background: s.dot, opacity: 0.55 }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span
              className="text-xs font-mono font-bold"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              {alert.incidentId}
            </span>
            <Chip
              style={{
                background: s.bg,
                color: s.text,
                border: `1px solid ${s.border}`,
              }}
            >
              {s.label}
            </Chip>
            <Chip
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {TYPE_ICON[alert.alertType]} {TYPE_LABEL[alert.alertType]}
            </Chip>
            <Chip className={st.cls}>{st.label}</Chip>
            {breached && (
              <Chip className="bg-red-900/50 text-red-300 border border-red-700/60 animate-pulse">
                ⚠ SLA BREACHED
              </Chip>
            )}
          </div>

          <div className="text-sm font-bold text-white mb-1 leading-snug">
            {alert.title}
          </div>
          <div
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {alert.description}
          </div>

          <div className="flex flex-wrap gap-3 mt-2">
            {alert.shipmentCode && (
              <span
                className="text-xs font-mono"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                📦 {alert.shipmentCode}
              </span>
            )}
            <span
              className="text-xs"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              🌍 {alert.region}
            </span>
            <span
              className="text-xs"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              ⏰ {fmt(alert.createdAt)}
            </span>
            <span
              className="text-xs"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              🚢 {alert.impactedShipments} shipment
              {alert.impactedShipments !== 1 ? 's' : ''}
            </span>
            {alert.mttrMinutes != null && (
              <span
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                ⏱ MTTR{' '}
                {alert.mttrMinutes >= 60
                  ? `${Math.round(alert.mttrMinutes / 60)}h`
                  : `${alert.mttrMinutes}m`}
              </span>
            )}
          </div>
        </div>

        {!alert.isAcknowledged && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAck(alert.id);
            }}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors hover:brightness-125"
            style={{
              background: 'rgba(139,92,246,0.18)',
              border: '1px solid rgba(139,92,246,0.45)',
              color: '#c4b5fd',
            }}
          >
            ACK
          </button>
        )}
      </div>
    </div>
  );
}

function DetailPanel({
  alert,
  onClose,
  onAck,
  onEscalate,
  onResolve,
}: {
  alert: IncidentAlert;
  onClose: () => void;
  onAck: (id: string) => void;
  onEscalate: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const s = SEV[alert.severity];
  const st = STA[alert.status];
  const [tab, setTab] = useState<'overview' | 'timeline' | 'actions'>('overview');

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(10,12,20,0.97)',
        border: `1.5px solid ${s.border}`,
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        className="p-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Chip
                style={{
                  background: s.bg,
                  color: s.text,
                  border: `1px solid ${s.border}`,
                }}
              >
                {TYPE_ICON[alert.alertType]} {TYPE_LABEL[alert.alertType]}
              </Chip>
              <Chip className={st.cls}>{st.label}</Chip>
              <span
                className="text-xs font-mono font-bold self-center"
                style={{ color: s.text }}
              >
                {alert.incidentId}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white leading-snug">
              {alert.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none hover:text-white transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            ✕
          </button>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {alert.shipmentCode && (
            <span
              className="text-xs px-2 py-1 rounded-lg font-mono"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              📦 {alert.shipmentCode}
            </span>
          )}
          <span
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            🌍 {alert.region}
          </span>
          <span
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            ⏰ {fmt(alert.createdAt)}
          </span>
          <span
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              background: isBreached(alert.slaDeadline, alert.status)
                ? 'rgba(239,68,68,0.15)'
                : 'rgba(255,255,255,0.06)',
              color: isBreached(alert.slaDeadline, alert.status)
                ? '#f87171'
                : 'rgba(255,255,255,0.55)',
            }}
          >
            🎯 SLA: {fmt(alert.slaDeadline)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {!alert.isAcknowledged && (
            <button
              onClick={() => onAck(alert.id)}
              className="text-xs px-4 py-2 rounded-xl font-bold transition-colors hover:brightness-125"
              style={{
                background: 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(139,92,246,0.45)',
                color: '#c4b5fd',
              }}
            >
              ✓ Acknowledge
            </button>
          )}
          {alert.status !== 'ESCALATED' && alert.status !== 'RESOLVED' && (
            <button
              onClick={() => onEscalate(alert.id)}
              className="text-xs px-4 py-2 rounded-xl font-bold transition-colors hover:brightness-125"
              style={{
                background: 'rgba(249,115,22,0.15)',
                border: '1px solid rgba(249,115,22,0.4)',
                color: '#fb923c',
              }}
            >
              ↑ Escalate
            </button>
          )}
          {alert.status !== 'RESOLVED' && (
            <button
              onClick={() => onResolve(alert.id)}
              className="text-xs px-4 py-2 rounded-xl font-bold transition-colors hover:brightness-125"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.4)',
                color: '#4ade80',
              }}
            >
              ✓ Resolve
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex px-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {(['overview', 'timeline', 'actions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="py-3 px-4 text-sm capitalize font-semibold transition-all"
            style={{
              color: tab === t ? s.text : 'rgba(255,255,255,0.35)',
              borderBottom:
                tab === t ? `2px solid ${s.text}` : '2px solid transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {tab === 'overview' && (
          <>
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Description
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {alert.description}
              </p>
            </div>

            {alert.rootCause && (
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <div className="text-xs font-bold uppercase tracking-widest mb-2 text-red-400">
                  🔍 Root Cause Analysis
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  {alert.rootCause}
                </p>
              </div>
            )}

            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Escalation Path
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {alert.escalationPath.map((step, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <Chip
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {step}
                    </Chip>
                    {i < alert.escalationPath.length - 1 && (
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {alert.acknowledgedBy && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Acknowledged By', value: alert.acknowledgedBy },
                  {
                    label: 'Acknowledged At',
                    value: alert.acknowledgedAt
                      ? fmt(alert.acknowledgedAt)
                      : '—',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div
                      className="text-xs mb-1"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      {item.label}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'timeline' && (
          <div className="relative">
            <div
              className="absolute left-5 top-2 bottom-2 w-px"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <div className="space-y-4">
              {alert.timeline.map((ev, i) => (
                <div key={i} className="flex gap-4 relative pl-10">
                  <div
                    className="absolute left-[14px] top-2 w-3 h-3 rounded-full flex items-center justify-center"
                    style={{
                      background: s.bg,
                      border: `2px solid ${s.border}`,
                      zIndex: 1,
                      fontSize: 7,
                    }}
                  >
                    {TL_ICON[ev.kind]}
                  </div>
                  <div
                    className="flex-1 p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white">
                        {ev.actor}
                      </span>
                      <Chip style={{ background: s.bg, color: s.text }}>
                        {ev.action}
                      </Chip>
                      <span
                        className="text-xs ml-auto"
                        style={{ color: 'rgba(255,255,255,0.28)' }}
                      >
                        {fmt(ev.timestamp)}
                      </span>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      {ev.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'actions' && (
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              AI-Recommended Actions
            </div>
            <div className="space-y-2">
              {alert.recommendedActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold"
                    style={{ background: s.bg, color: s.text }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.72)' }}
                  >
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<IncidentAlert[]>(MOCK_ALERTS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_ALERTS[0].id);
  const [sevFilter, setSevFilter] = useState<Severity | 'ALL'>('ALL');
  const [staFilter, setStaFilter] = useState<AlertStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<AlertType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [showAudit, setShowAudit] = useState(false);

  const selected = alerts.find((a) => a.id === selectedId) ?? null;

  const filtered = useMemo(
    () =>
      alerts.filter((a) => {
        if (sevFilter !== 'ALL' && a.severity !== sevFilter) return false;
        if (staFilter !== 'ALL' && a.status !== staFilter) return false;
        if (typeFilter !== 'ALL' && a.alertType !== typeFilter) return false;
        if (
          search &&
          !a.title.toLowerCase().includes(search.toLowerCase()) &&
          !a.incidentId.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [alerts, sevFilter, staFilter, typeFilter, search]
  );

  const ack = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              isAcknowledged: true,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: 'Current User',
              status: a.status === 'NEW' ? 'ACKNOWLEDGED' : a.status,
            }
          : a
      )
    );

  const escalate = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'ESCALATED' as AlertStatus } : a
      )
    );

  const resolve = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'RESOLVED' as AlertStatus } : a
      )
    );

  const bulkAck = () =>
    setAlerts((prev) =>
      prev.map((a) =>
        !a.isAcknowledged
          ? {
              ...a,
              isAcknowledged: true,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: 'Current User',
              status: 'ACKNOWLEDGED' as AlertStatus,
            }
          : a
      )
    );

  const critCount = alerts.filter(
    (a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED'
  ).length;
  const unackCount = alerts.filter((a) => !a.isAcknowledged).length;
  const slaBreached = alerts.filter((a) =>
    isBreached(a.slaDeadline, a.status)
  ).length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;
  const mttrAlerts = alerts.filter((a) => a.mttrMinutes != null);
  const avgMttr = mttrAlerts.length
    ? mttrAlerts.reduce((s, a) => s + (a.mttrMinutes ?? 0), 0) /
      mttrAlerts.length
    : 0;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🚨</span>
            <h1 className="text-2xl font-extrabold text-white">
              Alerts & Incident Triage
            </h1>
            {unackCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full animate-pulse bg-red-500/20 text-red-400 border border-red-500/40">
                {unackCount} UNACK
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Real-time incident command ·{' '}
            {alerts.filter((a) => a.status !== 'RESOLVED').length} active ·{' '}
            {resolvedCount} resolved today
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {unackCount > 0 && (
            <button
              onClick={bulkAck}
              className="text-sm px-4 py-2 rounded-xl font-bold transition-colors hover:brightness-125"
              style={{
                background: 'rgba(139,92,246,0.18)',
                border: '1px solid rgba(139,92,246,0.45)',
                color: '#c4b5fd',
              }}
            >
              ✓ Ack All ({unackCount})
            </button>
          )}
          <button
            onClick={() => setShowAudit((p) => !p)}
            className="text-sm px-4 py-2 rounded-xl font-bold transition-colors hover:bg-white/10"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            📋 Audit Trail
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <KpiCard
          icon="🔴"
          label="Critical Active"
          value={critCount}
          sub="Immediate action required"
          color="#ef4444"
        />
        <KpiCard
          icon="⚠️"
          label="Unacknowledged"
          value={unackCount}
          sub="Pending operator response"
          color="#fb923c"
        />
        <KpiCard
          icon="⏰"
          label="SLA Breached"
          value={slaBreached}
          sub="Past response deadline"
          color="#facc15"
        />
        <KpiCard
          icon="✅"
          label="Resolved Today"
          value={resolvedCount}
          sub="Successfully closed"
          color="#4ade80"
        />
        <KpiCard
          icon="⏱️"
          label="Avg MTTR"
          value={`${Math.floor(avgMttr / 60)}h ${Math.round(avgMttr % 60)}m`}
          sub="Mean time to resolve"
          color="#818cf8"
        />
      </div>

      {/* ── Audit Trail ── */}
      {showAudit && (
        <div
          className="mb-6 p-5 rounded-2xl"
          style={{
            background: 'rgba(10,12,20,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-white mb-0.5">
                Immutable Audit Ledger
              </div>
              <div
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                All operator actions are cryptographically anchored · ISO 27001
                compliant
              </div>
            </div>
            <span
              className="text-xs px-2 py-1 rounded-lg"
              style={{
                background: 'rgba(34,197,94,0.1)',
                color: '#4ade80',
                border: '1px solid rgba(34,197,94,0.25)',
              }}
            >
              🔒 SHA-256
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {['Timestamp', 'Operator', 'Action', 'Incident', 'Hash'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-3 font-bold uppercase tracking-wide"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {MOCK_AUDIT.map((entry) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td
                      className="py-2 px-3 font-mono"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      {fmt(entry.timestamp)}
                    </td>
                    <td className="py-2 px-3 font-semibold text-white">
                      {entry.operator}
                    </td>
                    <td
                      className="py-2 px-3"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {entry.action}
                    </td>
                    <td
                      className="py-2 px-3 font-mono"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {entry.alertTitle}
                    </td>
                    <td
                      className="py-2 px-3 font-mono"
                      style={{ color: 'rgba(99,102,241,0.7)' }}
                    >
                      …{entry.hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div
        className="flex flex-wrap gap-3 items-center p-4 rounded-2xl mb-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <input
          type="text"
          placeholder="🔍  Search by title or incident ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none w-64"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'white',
          }}
        />
        {[
          {
            val: sevFilter,
            set: setSevFilter,
            opts: ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
            label: 'Severity',
          },
          {
            val: staFilter,
            set: setStaFilter,
            opts: [
              'ALL',
              'NEW',
              'ACKNOWLEDGED',
              'IN_PROGRESS',
              'ESCALATED',
              'RESOLVED',
            ],
            label: 'Status',
          },
          {
            val: typeFilter,
            set: setTypeFilter,
            opts: [
              'ALL',
              'TEMPERATURE_EXCURSION',
              'DISRUPTION',
              'DELAY',
              'DATA_GAP',
              'CARRIER_SLA',
              'CUSTOMS',
            ],
            label: 'Type',
          },
        ].map(({ val, set, opts, label }) => (
          <select
            key={label}
            value={val}
            onChange={(e) => (set as (v: string) => void)(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl outline-none"
            style={{
              background: 'rgba(25,27,40,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            {opts.map((o) => (
              <option key={o} value={o}>
                {o === 'ALL' ? `All ${label}s` : o.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        ))}
        <span
          className="text-xs ml-auto"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          {filtered.length} / {alerts.length} alerts
        </span>
      </div>

      {/* ── Split Layout ── */}
      <div className="flex gap-4" style={{ minHeight: '65vh' }}>
        {/* List */}
        <div
          className="flex flex-col gap-2 flex-shrink-0 overflow-y-auto"
          style={{ width: selected ? 420 : '100%', minWidth: 320 }}
        >
          {filtered.length === 0 ? (
            <div
              className="p-10 text-center rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="text-4xl mb-3">✅</div>
              <div className="text-sm font-bold text-white mb-1">
                No alerts found
              </div>
              <div
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                All clear on selected filters
              </div>
            </div>
          ) : (
            filtered.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                selected={selectedId === alert.id}
                onClick={() => setSelectedId(alert.id)}
                onAck={ack}
              />
            ))
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div className="flex-1 min-w-0" style={{ minHeight: 580 }}>
            <DetailPanel
              alert={selected}
              onClose={() => setSelectedId(null)}
              onAck={ack}
              onEscalate={escalate}
              onResolve={resolve}
            />
          </div>
        )}
      </div>
    </div>
  );
}
