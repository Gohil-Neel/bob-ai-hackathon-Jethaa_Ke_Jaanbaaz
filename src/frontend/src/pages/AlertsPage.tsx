/**
 * SupplyShield AI — Alerts & Incident Triage Command Center
 *
 * Real-time operational incident triage matching Stitch Design System:
 * - Severity bands (CRITICAL, HIGH, MEDIUM, LOW)
 * - Incident detail workbench with root-cause analysis (RCA) & timeline
 * - Direct operator action buttons (ACK, Escalate to Crisis Bridge, Authorize Detour, Resolve)
 * - Cryptographic SHA-256 audit ledger
 * - Uses standard Stitch tokens: bg-bg-surface, text-text-primary, material-symbols-outlined
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentCategory = 'COLD_CHAIN' | 'DISRUPTION' | 'CUSTOMS' | 'CARRIER_SLA' | 'DATA_GAP' | 'FLEET';
export type IncidentStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_TRIAGE' | 'ESCALATED' | 'RESOLVED';

export interface TriageIncident {
  id: string;
  incidentCode: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  category: IncidentCategory;
  corridor: string;
  shipmentCode: string | null;
  cargoDescription: string;
  cargoValue: string;
  status: IncidentStatus;
  isAcknowledged: boolean;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
  slaDeadline: string;
  slaBreached: boolean;
  rootCause: string;
  recommendedActions: string[];
  timeline: {
    time: string;
    actor: string;
    action: string;
    note: string;
    icon: string;
  }[];
  escalationTier: string[];
  sha256Hash: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_INCIDENTS: TriageIncident[] = [
  {
    id: 'inc-001',
    incidentCode: 'INC-2024-891',
    title: 'NH-48 Cold Chain Excursion — Insulin Batch SS-2024-0001',
    description: 'Sensor SENSOR-A1 recorded sustained temperature of 10.4°C (permitted GDP window: 2.0°C – 8.0°C). Cumulative excursion time 87 min. Cargo at immediate quality risk.',
    severity: 'CRITICAL',
    category: 'COLD_CHAIN',
    corridor: 'NH-48 Western Corridor (Kolhapur - Pune)',
    shipmentCode: 'SS-2024-0001',
    cargoDescription: 'Recombinant Insulin 100IU/ml (Cold Chain 2-8°C)',
    cargoValue: '₹2.40 Cr',
    status: 'IN_TRIAGE',
    isAcknowledged: true,
    acknowledgedBy: 'Arjun Mehta (Lead)',
    acknowledgedAt: '10:15 UTC',
    createdAt: '10:00 UTC (Today)',
    slaDeadline: '11:00 UTC (T-15m)',
    slaBreached: false,
    rootCause: 'Primary reefer unit compressor intermittent power cut. Secondary backup alternator failed to ignite due to sensor gateway v2.1 firmware sync deadlock.',
    recommendedActions: [
      'Dispatch nearest active backup fleet TRUCK-009 (12 km away on NH-48)',
      'Direct carrier Maersk/Fleet ops to execute emergency thermal re-icing',
      'Initiate GDP stability review — calculate MKT delta for QA release hold',
      'Notify consignee Chicago/JNPT Central Pharma Depot of potential quarantine',
    ],
    timeline: [
      { time: '10:00 UTC', actor: 'IoT Telemetry Gateway', action: 'Threshold Breach Detected', note: '10.4°C recorded (Upper Limit: 8.0°C)', icon: 'sensors' },
      { time: '10:03 UTC', actor: 'PagerDuty Engine', action: 'Paging On-Call Team', note: 'SMS & App broadcast sent to Arjun Mehta & Dr. Priya Nair', icon: 'campaign' },
      { time: '10:15 UTC', actor: 'Arjun Mehta', action: 'Incident Acknowledged', note: 'Reviewing reefer telemetry stream & vehicle position', icon: 'check_circle' },
      { time: '10:28 UTC', actor: 'Arjun Mehta', action: 'Carrier Dispatch Bridge Opened', note: 'Contacted carrier operations — backup van en route', icon: 'support_agent' },
    ],
    escalationTier: ['Arjun Mehta (L1 Control Tower)', 'Dr. Priya Nair (L2 GDP Lead)', 'Vikram Rao (L3 VP Logistics)'],
    sha256Hash: '9a3f28c11e74a10d9841f3e82b79a12c8b0e77d2fa9081e812d45c1103f6789b',
  },
  {
    id: 'inc-002',
    incidentCode: 'INC-2024-884',
    title: 'Category 4 Cyclone Feeder Disruption — 14 Ocean Shipments Blocked',
    description: 'Severe weather vortex over North Atlantic / Bay of Bengal sea lane. Port authority closed navigational channels for 48 hours. ETA revisions pending.',
    severity: 'CRITICAL',
    category: 'DISRUPTION',
    corridor: 'North Atlantic / JNPT Sea Route',
    shipmentCode: null,
    cargoDescription: '14 Multi-Carrier Pharmaceutical & Medical Shipments',
    cargoValue: '₹5.84 Cr',
    status: 'IN_TRIAGE',
    isAcknowledged: true,
    acknowledgedBy: 'Riya Sharma',
    acknowledgedAt: '06:30 UTC',
    createdAt: '06:00 UTC (Dec 12)',
    slaDeadline: '09:00 UTC (Passed)',
    slaBreached: true,
    rootCause: 'Rapid cyclogenesis exceeding 72h predictive barometric threshold. Gale force winds > 65 kts and wave heights > 9.2m.',
    recommendedActions: [
      'Authorize southern Azores bypass corridor (+18h, cost delta +$1,450/TEU)',
      'Activate carrier force majeure delay clauses with Maersk and MSC',
      'Notify consignees of revised delivery milestones',
      'Engage marine cargo insurance broker for delay claims',
    ],
    timeline: [
      { time: '06:00 UTC', actor: 'ECMWF Weather AI', action: 'Disruption Detected', note: '94% probability of 48h sea channel closure', icon: 'cyclone' },
      { time: '06:30 UTC', actor: 'Riya Sharma', action: 'War-Room Bridge Opened', note: 'Crisis call initiated with 6 carrier fleet managers', icon: 'forum' },
      { time: '07:45 UTC', actor: 'Arjun Mehta', action: 'Bypass Reroute Approved', note: 'Shipments SS-2024-0001, 0002 diverted via southern track', icon: 'alt_route' },
    ],
    escalationTier: ['Riya Sharma (L1)', 'Arjun Mehta (L2 Operations Lead)', 'Executive Committee'],
    sha256Hash: '4e7b8a1c920f31e78411b0e9821a7c3d4e5f60718293a4b5c6d7e8f901234567',
  },
  {
    id: 'inc-003',
    incidentCode: 'INC-2024-879',
    title: 'JNPT Port Crane Failure Congestion — +36h Berth Delay',
    description: 'GTI Container Terminal berth 3 crane mechanical breakdown causing 9km drayage queue. Shipment SS-2024-0003 delayed by 36 hours.',
    severity: 'HIGH',
    category: 'CUSTOMS',
    corridor: 'JNPT Navi Mumbai Terminal (NH-48)',
    shipmentCode: 'SS-2024-0003',
    cargoDescription: 'mRNA Vaccine Batches (-20°C Deep Freeze)',
    cargoValue: '₹1.85 Cr',
    status: 'ACKNOWLEDGED',
    isAcknowledged: true,
    acknowledgedBy: 'Meera Pillai',
    acknowledgedAt: '09:00 UTC',
    createdAt: '07:00 UTC (Dec 13)',
    slaDeadline: '13:00 UTC',
    slaBreached: false,
    rootCause: 'Hydraulic lift cable fracture on ship-to-shore gantry crane #4. Turnaround buffer exhausted.',
    recommendedActions: [
      'Activate direct air freight charter contingency via Mumbai (BOM) to Tokyo (NRT)',
      'Expedite inland green channel customs pass',
      'Request emergency dry-ice re-topping from local JNPT cryogenic vendor',
    ],
    timeline: [
      { time: '07:00 UTC', actor: 'Port Terminal API', action: 'Berth Congestion Fired', note: 'Crane breakdown flagged by port authority', icon: 'anchor' },
      { time: '09:00 UTC', actor: 'Meera Pillai', action: 'Acknowledged', note: 'Evaluating BOM air charter vs vessel delay cost', icon: 'check_circle' },
    ],
    escalationTier: ['Meera Pillai (L1)', 'Arjun Mehta (L2)'],
    sha256Hash: 'b91c3d2e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [incidents, setIncidents] = useState<TriageIncident[]>(MOCK_INCIDENTS);
  const [activeId, setActiveId] = useState<string>(MOCK_INCIDENTS[0].id);
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuditLedger, setShowAuditLedger] = useState(false);

  const activeIncident = incidents.find((i) => i.id === activeId) || incidents[0];

  const filteredIncidents = useMemo(() => {
    return incidents.filter((i) => {
      if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          i.title.toLowerCase().includes(q) ||
          i.incidentCode.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.shipmentCode && i.shipmentCode.toLowerCase().includes(q)) ||
          i.corridor.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incidents, severityFilter, statusFilter, categoryFilter, searchQuery]);

  const handleAcknowledge = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              isAcknowledged: true,
              acknowledgedBy: 'Arjun Mehta (Lead)',
              acknowledgedAt: 'Just now',
              status: i.status === 'NEW' ? 'ACKNOWLEDGED' : i.status,
            }
          : i
      )
    );
  };

  const handleEscalate = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'ESCALATED' }
          : i
      )
    );
    alert('Incident escalated to Tier-2 Crisis War-Room.');
  };

  const handleResolve = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'RESOLVED' }
          : i
      )
    );
  };

  const handleAckAll = () => {
    setIncidents((prev) =>
      prev.map((i) =>
        !i.isAcknowledged
          ? {
              ...i,
              isAcknowledged: true,
              acknowledgedBy: 'Arjun Mehta (Lead)',
              acknowledgedAt: 'Just now',
              status: 'ACKNOWLEDGED',
            }
          : i
      )
    );
  };

  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const unackCount = incidents.filter((i) => !i.isAcknowledged).length;
  const slaBreachedCount = incidents.filter((i) => i.slaBreached && i.status !== 'RESOLVED').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-risk-critical/15 flex items-center justify-center text-risk-critical border border-risk-critical/20">
            <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                Alerts &amp; Incident Triage Command Center
              </span>
              {unackCount > 0 ? (
                <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical border border-risk-critical/30 font-semibold animate-pulse">
                  {unackCount} UNACKNOWLEDGED
                </span>
              ) : (
                <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/15 text-risk-low border border-risk-low/30 font-semibold">
                  ALL ACKNOWLEDGED
                </span>
              )}
            </div>
            <span className="font-caption text-caption text-text-secondary">
              Real-time multi-corridor breach triage • Automated escalation paths &amp; immutable SHA-256 audit ledger
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {unackCount > 0 && (
            <button
              onClick={handleAckAll}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              Acknowledge All ({unackCount})
            </button>
          )}
          <button
            onClick={() => setShowAuditLedger(!showAuditLedger)}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle font-badge-label text-badge-label flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">fingerprint</span>
            {showAuditLedger ? 'Hide Audit Trail' : 'Audit Trail (SHA-256)'}
          </button>
        </div>
      </div>

      {/* ── KPI Metrics Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">Critical Incidents</span>
            <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical font-semibold">Immediate</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">{criticalCount}</span>
            <span className="text-risk-critical font-caption text-caption font-medium">Action Required</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="bg-risk-critical h-full" style={{ width: `${(criticalCount / incidents.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">Unacknowledged</span>
            <span className="material-symbols-outlined text-text-muted text-[18px]">notifications_active</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">{unackCount}</span>
            <span className="font-caption text-caption text-risk-high font-medium">Pending Triage</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="bg-risk-high h-full" style={{ width: `${(unackCount / incidents.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">SLA Breaches</span>
            <span className="material-symbols-outlined text-text-muted text-[18px]">schedule</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">{slaBreachedCount}</span>
            <span className="font-caption text-caption text-risk-medium font-medium">&gt; Response Cap</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="bg-risk-medium h-full" style={{ width: `${(slaBreachedCount / incidents.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">Resolved Today</span>
            <span className="material-symbols-outlined text-risk-low text-[18px]">check_circle</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">{resolvedCount}</span>
            <span className="font-caption text-caption text-risk-low font-medium">100% GxP Audit</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="bg-risk-low h-full" style={{ width: `${(resolvedCount / incidents.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by incident code, cargo, shipment or corridor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-primary placeholder:text-text-disabled text-caption font-caption outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as SeverityLevel | 'all')}
            className="px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary text-caption font-caption outline-none focus:border-primary"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'all')}
            className="px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary text-caption font-caption outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="IN_TRIAGE">In Triage</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as IncidentCategory | 'all')}
            className="px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary text-caption font-caption outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            <option value="COLD_CHAIN_EXCURSION">Cold Chain Excursions</option>
            <option value="ROUTE_DISRUPTION">Route Disruptions</option>
            <option value="CARRIER_SLA_BREACH">Carrier SLA</option>
            <option value="CUSTOMS_HOLD">Customs Holds</option>
          </select>

          <span className="font-caption text-caption text-text-disabled ml-1">
            {filteredIncidents.length} of {incidents.length}
          </span>
        </div>
      </div>

      {/* ── Split Workbench: List & Detail ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Incident List */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {filteredIncidents.map((inc) => {
            const isSelected = activeIncident.id === inc.id;
            const isCritical = inc.severity === 'CRITICAL';

            return (
              <div
                key={inc.id}
                onClick={() => setActiveId(inc.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-surface-container-low border-primary shadow-md'
                    : 'bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-text-primary">{inc.incidentCode}</span>
                    <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full font-semibold ${
                      isCritical ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30' : 'bg-risk-high/15 text-risk-high border border-risk-high/30'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="font-badge-label text-badge-label px-2 py-0.5 rounded bg-surface-container-high text-text-secondary font-medium">
                      {inc.category.replace('_', ' ')}
                    </span>
                  </div>

                  {!inc.isAcknowledged && (
                    <span className="w-2.5 h-2.5 rounded-full bg-risk-critical animate-ping" />
                  )}
                </div>

                <h3 className="font-card-title text-card-title text-text-primary leading-snug mb-1">
                  {inc.title}
                </h3>
                <p className="font-caption text-caption text-text-secondary line-clamp-2 leading-relaxed mb-3">
                  {inc.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-caption pt-2 border-t border-border-subtle text-text-muted">
                  <span className="truncate max-w-[180px]">📍 {inc.corridor.split('(')[0]}</span>
                  <span className="font-semibold text-text-primary">{inc.cargoValue}</span>
                  <span className={inc.slaBreached ? 'text-risk-critical font-semibold' : 'text-text-muted'}>
                    {inc.createdAt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Incident Workbench */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-md space-y-6 sticky top-20">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-sm font-bold text-primary">{activeIncident.incidentCode}</span>
                <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full font-semibold ${
                  activeIncident.severity === 'CRITICAL' ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30' : 'bg-risk-high/15 text-risk-high border border-risk-high/30'
                }`}>
                  {activeIncident.severity} PRIORITY
                </span>
                <span className="font-badge-label text-badge-label px-2 py-0.5 rounded bg-surface-container-high text-text-secondary">
                  {activeIncident.category}
                </span>
              </div>
              <h2 className="font-section-title text-section-title text-text-primary leading-tight">
                {activeIncident.title}
              </h2>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="font-caption text-caption text-text-muted mb-0.5">SLA Deadline</div>
              <div className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                activeIncident.slaBreached ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30' : 'bg-risk-low/15 text-risk-low border border-risk-low/30'
              }`}>
                {activeIncident.slaDeadline}
              </div>
            </div>
          </div>

          {/* Context Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-bg-surface border border-border-subtle">
              <div className="font-caption text-caption text-text-muted">Corridor</div>
              <div className="font-card-title text-card-title text-text-primary truncate">{activeIncident.corridor.split('(')[0]}</div>
            </div>
            <div className="p-3 rounded-lg bg-bg-surface border border-border-subtle">
              <div className="font-caption text-caption text-text-muted">Shipment Code</div>
              <div className="font-mono text-card-title text-primary font-bold">{activeIncident.shipmentCode || 'Multi-Load'}</div>
            </div>
            <div className="p-3 rounded-lg bg-bg-surface border border-border-subtle">
              <div className="font-caption text-caption text-text-muted">Cargo Value</div>
              <div className="font-card-title text-card-title text-text-primary">{activeIncident.cargoValue}</div>
            </div>
            <div className="p-3 rounded-lg bg-bg-surface border border-border-subtle">
              <div className="font-caption text-caption text-text-muted">Status</div>
              <div className="font-card-title text-card-title text-text-primary">{activeIncident.status}</div>
            </div>
          </div>

          {/* Root Cause Analysis Box */}
          <div className="p-4 rounded-lg bg-risk-critical/5 border border-risk-critical/20 space-y-1.5">
            <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-risk-critical font-bold">
              <span className="material-symbols-outlined text-[16px]">biotech</span>
              AI Root Cause Analysis (RCA)
            </div>
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              {activeIncident.rootCause}
            </p>
          </div>

          {/* Prescriptive Decisions */}
          <div className="space-y-2">
            <div className="font-caption text-caption uppercase tracking-wider text-text-muted font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
              Prescriptive Decision Directives
            </div>
            <div className="space-y-1.5">
              {activeIncident.recommendedActions.map((act, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-bg-surface border border-border-subtle flex items-start gap-2.5 text-caption font-caption text-text-secondary">
                  <span className="w-5 h-5 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Decision Row */}
          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-border-subtle">
            {!activeIncident.isAcknowledged ? (
              <button
                onClick={() => handleAcknowledge(activeIncident.id)}
                className="px-4 py-2 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center gap-1.5 transition-all"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                Acknowledge Incident
              </button>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-risk-low/10 text-risk-low border border-risk-low/20 font-caption text-caption flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Acknowledged by {activeIncident.acknowledgedBy} ({activeIncident.acknowledgedAt})
              </div>
            )}

            {activeIncident.status !== 'ESCALATED' && activeIncident.status !== 'RESOLVED' && (
              <button
                onClick={() => handleEscalate(activeIncident.id)}
                className="px-4 py-2 rounded-lg bg-risk-high/15 text-risk-high hover:bg-risk-high/25 border border-risk-high/30 font-badge-label text-badge-label font-semibold flex items-center gap-1.5 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                Escalate to War-Room
              </button>
            )}

            {activeIncident.status !== 'RESOLVED' && (
              <button
                onClick={() => handleResolve(activeIncident.id)}
                className="px-4 py-2 rounded-lg bg-risk-low/15 text-risk-low hover:bg-risk-low/25 border border-risk-low/30 font-badge-label text-badge-label font-semibold flex items-center gap-1.5 transition-colors ml-auto"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">done</span>
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
