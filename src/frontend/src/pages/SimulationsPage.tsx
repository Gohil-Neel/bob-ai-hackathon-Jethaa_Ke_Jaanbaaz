import { useState } from 'react'

interface ShipmentManifestUnit {
  id: string
  consignee: string
  cargo: string
  cargoIcon: string
  priority: 'Critical P0' | 'High P1' | 'Medium P2'
  status: string
  statusType: 'critical' | 'high' | 'medium'
  statusIcon: string
  simulatedEta: string
  etaDelta: string
  costDelta: string
  recommendation: string
}

const mockManifest: ShipmentManifestUnit[] = [
  {
    id: 'SHP-0117',
    consignee: 'Serum Institute Hub',
    cargo: 'Vaccines (2-8°C Cryo)',
    cargoIcon: 'ac_unit',
    priority: 'Critical P0',
    status: 'Immobilized (Km 188)',
    statusType: 'critical',
    statusIcon: 'block',
    simulatedEta: 'Today 07:15 PM',
    etaDelta: '+4.2h',
    costDelta: '+₹1,940',
    recommendation: 'Detour via SH-142 North'
  },
  {
    id: 'SHP-0102',
    consignee: 'Tata GigaFactory',
    cargo: 'Lithium-Ion Modules',
    cargoIcon: 'battery_charging_full',
    priority: 'High P1',
    status: 'Slow Crawl (12 km/h)',
    statusType: 'high',
    statusIcon: 'speed',
    simulatedEta: 'Today 08:30 PM',
    etaDelta: '+5.1h',
    costDelta: '+₹1,820',
    recommendation: 'Detour via SH-142 North'
  },
  {
    id: 'SHP-0145',
    consignee: 'Bharat Electronics',
    cargo: 'Precision Optronics',
    cargoIcon: 'camera',
    priority: 'High P1',
    status: 'Immobilized (Km 191)',
    statusType: 'critical',
    statusIcon: 'block',
    simulatedEta: 'Today 09:10 PM',
    etaDelta: '+5.6h',
    costDelta: '+₹1,840',
    recommendation: 'Detour via SH-142 North'
  },
  {
    id: 'SHP-0188',
    consignee: 'Apollo Health Network',
    cargo: 'Plasma & Reagents (Cryo)',
    cargoIcon: 'bloodtype',
    priority: 'Critical P0',
    status: 'Immobilized (Km 185)',
    statusType: 'critical',
    statusIcon: 'block',
    simulatedEta: 'Today 06:55 PM',
    etaDelta: '+3.9h',
    costDelta: '+₹1,910',
    recommendation: 'Detour via SH-142 North'
  },
  {
    id: 'SHP-0204',
    consignee: 'Foxconn Assembly',
    cargo: 'Microcontrollers (Moisture Sens.)',
    cargoIcon: 'memory',
    priority: 'Medium P2',
    status: 'In Transit (Approach)',
    statusType: 'medium',
    statusIcon: 'navigation',
    simulatedEta: 'Today 10:40 PM',
    etaDelta: '+4.8h',
    costDelta: '+₹1,790',
    recommendation: 'Pre-emptive Reroute'
  },
  {
    id: 'SHP-0231',
    consignee: 'Biocon Biologics',
    cargo: 'Insulin Glargine Vials',
    cargoIcon: 'medication',
    priority: 'Critical P0',
    status: 'Reroute Queued (Km 172)',
    statusType: 'high',
    statusIcon: 'alt_route',
    simulatedEta: 'Today 08:10 PM',
    etaDelta: '+4.5h',
    costDelta: '+₹1,980',
    recommendation: 'Detour via SH-142 North'
  },
  {
    id: 'SHP-0249',
    consignee: 'Dr. Reddy’s Labs',
    cargo: 'Oncology APIs (Cold-Chain)',
    cargoIcon: 'vaccines',
    priority: 'Critical P0',
    status: 'Approaching Breach Point',
    statusType: 'high',
    statusIcon: 'warning',
    simulatedEta: 'Today 09:30 PM',
    etaDelta: '+5.0h',
    costDelta: '+₹1,890',
    recommendation: 'Detour via SH-142 North'
  },
  {
    id: 'SHP-0266',
    consignee: 'Sun Pharma Logistics',
    cargo: 'Monoclonal Antibodies',
    cargoIcon: 'ac_unit',
    priority: 'Critical P0',
    status: 'Holding at Highway Toll',
    statusType: 'medium',
    statusIcon: 'pause_circle',
    simulatedEta: 'Today 09:50 PM',
    etaDelta: '+5.3h',
    costDelta: '+₹1,860',
    recommendation: 'Detour via SH-142 North'
  }
]

export default function SimulationsPage() {
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C' | 'CUSTOM'>('A')
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>(mockManifest.map(m => m.id))
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllUnits, setShowAllUnits] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionComplete, setExecutionComplete] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null)
  const [showCustomModal, setShowCustomModal] = useState(false)

  // Custom scenario builder state
  const [customCorridor, setCustomCorridor] = useState('NH-48 Mumbai-Pune Expressway')
  const [customSeverity, setCustomSeverity] = useState('Critical Inundation (>1.0m)')
  const [customDuration, setCustomDuration] = useState('36')
  const [customUnits, setCustomUnits] = useState('17')

  const toggleSelectAll = () => {
    if (selectedShipmentIds.length === mockManifest.length) {
      setSelectedShipmentIds([])
    } else {
      setSelectedShipmentIds(mockManifest.map(m => m.id))
    }
  }

  const toggleUnit = (id: string) => {
    if (selectedShipmentIds.includes(id)) {
      setSelectedShipmentIds(selectedShipmentIds.filter(i => i !== id))
    } else {
      setSelectedShipmentIds([...selectedShipmentIds, id])
    }
  }

  const triggerMonteCarlo = () => {
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
      setToastMessage({
        title: 'Monte Carlo Simulation Complete (10,000 Iterations)',
        desc: 'Confidence level: 94.8%. 10,000 algorithmic variations converged on Route B (SH-142 Bypass).',
        type: 'info'
      })
      setTimeout(() => setToastMessage(null), 5000)
    }, 1200)
  }

  const handleExecutePlan = () => {
    setIsExecuting(true)
    setTimeout(() => {
      setIsExecuting(false)
      setExecutionComplete(true)
      setToastMessage({
        title: 'Scenario Dispatched Successfully',
        desc: `${selectedShipmentIds.length} geofences active • Drivers acknowledged • Consignees notified`,
        type: 'success'
      })
      setTimeout(() => setToastMessage(null), 6000)
    }, 1000)
  }

  const filteredManifest = mockManifest.filter(m => 
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.consignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayedManifest = showAllUnits ? filteredManifest : filteredManifest.slice(0, 5)

  return (
    <div className="flex flex-col w-full text-on-surface pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-8 bg-surface-container-high border border-risk-low text-text-primary px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="material-symbols-outlined text-risk-low text-[24px]">
            {toastMessage.type === 'success' ? 'task_alt' : 'insights'}
          </span>
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-text-primary">{toastMessage.title}</span>
            <span className="text-[11px] text-text-secondary">{toastMessage.desc}</span>
          </div>
        </div>
      )}

      {/* Section 1: Page Header & Global Simulation Controls */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-primary font-semibold">
              Predictive Control Studio
            </span>
            <span className="text-text-muted">•</span>
            <span className="font-caption text-caption text-text-secondary">Corridor Risk Engine v3.4</span>
          </div>
          <h1 className="font-page-title text-page-title text-text-primary tracking-tight">What-If Simulation</h1>
          <p className="font-body-default text-body-default text-text-secondary mt-0.5 max-w-3xl">
            Contingency planning, algorithmic scenario modeling, and operational impact analysis across multimodal corridors.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-risk-low animate-pulse"></span>
            <span className="font-table-cell text-table-cell text-text-secondary">Engine v3.4 Ready</span>
            <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-surface-container text-text-muted">
              42ms latency
            </span>
          </div>
          <button
            onClick={() => {
              setActiveScenario('A')
              setExecutionComplete(false)
              setSelectedShipmentIds(mockManifest.map(m => m.id))
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors font-body-default text-body-default"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Scenario</span>
          </button>
          <button
            onClick={triggerMonteCarlo}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary-hover transition-colors font-body-default text-body-default font-medium shadow-md shadow-primary-container/20 disabled:opacity-75 cursor-pointer"
            type="button"
          >
            <span className={`material-symbols-outlined text-[17px] ${isSimulating ? 'animate-spin' : ''}`}>
              {isSimulating ? 'sync' : 'calculate'}
            </span>
            <span>{isSimulating ? 'Simulating 10,000 Runs...' : 'Run Monte Carlo (10,000 sims)'}</span>
          </button>
        </div>
      </section>

      {/* Section 2: Preset Scenarios & Parameter Bar */}
      <section className="mb-4 bg-bg-surface rounded-xl border border-border-subtle p-3.5 shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Preset Tabs */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="font-caption text-caption uppercase tracking-wider text-text-muted mr-1 font-medium">
                Scenarios:
              </span>
              <button
                onClick={() => { setActiveScenario('A'); setExecutionComplete(false); }}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg font-caption text-caption transition-colors ${
                  activeScenario === 'A'
                    ? 'bg-primary-soft text-primary border border-primary/30 font-semibold'
                    : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-strong'
                }`}
                type="button"
              >
                {activeScenario === 'A' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>}
                <span>Scenario A: NH-48 Severe Flooding {activeScenario === 'A' ? '(Active)' : ''}</span>
              </button>
              <button
                onClick={() => { setActiveScenario('B'); setExecutionComplete(false); }}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg font-caption text-caption transition-colors ${
                  activeScenario === 'B'
                    ? 'bg-primary-soft text-primary border border-primary/30 font-semibold'
                    : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-strong'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">anchor</span>
                <span>Scenario B: JNPT Port Strike / 48h Halt</span>
              </button>
              <button
                onClick={() => { setActiveScenario('C'); setExecutionComplete(false); }}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg font-caption text-caption transition-colors ${
                  activeScenario === 'C'
                    ? 'bg-primary-soft text-primary border border-primary/30 font-semibold'
                    : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-strong'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">ac_unit</span>
                <span>Scenario C: Cryo Reefer Fleet Shortage</span>
              </button>
              <button
                onClick={() => setShowCustomModal(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed font-caption text-caption transition-colors ${
                  activeScenario === 'CUSTOM'
                    ? 'bg-primary-soft text-primary border-primary font-semibold'
                    : 'border-border-strong text-text-muted hover:text-text-secondary hover:border-primary'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>{activeScenario === 'CUSTOM' ? 'Custom Scenario (Active)' : 'Custom Scenario Builder'}</span>
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2 font-caption text-caption text-text-muted">
              <span className="material-symbols-outlined text-[15px] text-risk-medium">cloud_sync</span>
              <span>Synced with IMD Weather Radar (9 min ago)</span>
            </div>
          </div>

          {/* Configured Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-0.5">
            <div className="bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 flex flex-col justify-center">
              <span className="font-caption text-caption uppercase tracking-wider text-text-muted">
                Disruption Trigger
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 font-card-title text-card-title text-text-primary truncate">
                <span className="material-symbols-outlined text-[16px] text-risk-critical">
                  {activeScenario === 'A' ? 'flood' : activeScenario === 'B' ? 'anchor' : activeScenario === 'C' ? 'ac_unit' : 'tune'}
                </span>
                <span className="truncate">
                  {activeScenario === 'A' && 'NH-48 Solapur-Pune Inundation'}
                  {activeScenario === 'B' && 'JNPT Berth 4 Dockworkers Strike'}
                  {activeScenario === 'C' && 'Regional Reefer Compressor Recall'}
                  {activeScenario === 'CUSTOM' && `${customCorridor} (${customSeverity})`}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 flex flex-col justify-center">
              <span className="font-caption text-caption uppercase tracking-wider text-text-muted">
                Duration Assumption
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1.5 font-card-title text-card-title text-text-primary">
                  <span className="material-symbols-outlined text-[16px] text-risk-medium">timer</span>
                  <span>{activeScenario === 'CUSTOM' ? `${customDuration} Hours (Custom CI)` : '36 Hours (±4.2h CI)'}</span>
                </div>
                <span className="font-caption text-caption text-primary px-1.5 py-0.2 rounded bg-primary/10">Dynamic</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 flex flex-col justify-center">
              <span className="font-caption text-caption uppercase tracking-wider text-text-muted">
                Target Fleet at Risk
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 font-card-title text-card-title text-text-primary">
                <span className="material-symbols-outlined text-[16px] text-risk-high">local_shipping</span>
                <span>{activeScenario === 'CUSTOM' ? `${customUnits} Active Units` : '17 Active Transit Units'}</span>
                <span className="font-caption text-caption text-text-muted ml-1">(4 Pharma Cryo)</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 flex flex-col justify-center">
              <span className="font-caption text-caption uppercase tracking-wider text-text-muted">
                Optimization Strategy
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 font-card-title text-card-title text-text-primary truncate">
                <span className="material-symbols-outlined text-[16px] text-primary">alt_route</span>
                <span className="truncate">Multi-Obj: SLA Priority + Cost Min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: High-Impact KPI Tradeoff Matrix */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        {/* KPI 1: Transit Delay Delta */}
        <div className="bg-bg-surface rounded-xl border border-border-subtle p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-border-strong transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-risk-low/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted">
              Transit Delay Delta
            </span>
            <span className="flex items-center gap-1 font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low border border-risk-low/30 font-medium">
              <span className="material-symbols-outlined text-[13px]">trending_down</span> -78%
            </span>
          </div>
          <div className="my-2">
            <div className="font-kpi-val text-kpi-val text-risk-low tracking-tight">-19.1 hrs Saved</div>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              Compresses +24.5h delay down to +5.4h buffer
            </p>
          </div>
          <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-risk-low h-full w-[78%]"></div>
            <div className="bg-risk-critical/40 h-full w-[22%]"></div>
          </div>
        </div>

        {/* KPI 2: Net Financial Protection */}
        <div className="bg-bg-surface rounded-xl border border-border-subtle p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-border-strong transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted">
              Net Financial Protection
            </span>
            <span className="flex items-center gap-1 font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/30 font-medium">
              <span className="material-symbols-outlined text-[13px]">shield</span> Protected
            </span>
          </div>
          <div className="my-2">
            <div className="font-kpi-val text-kpi-val text-text-primary tracking-tight">₹1,10,720 Avoided</div>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              ₹31.3k detour cost vs ₹142.0k late penalty
            </p>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted">
            <span>ROI: 3.54x on alternate fuel</span>
            <span className="text-risk-low font-medium">Net Benefit</span>
          </div>
        </div>

        {/* KPI 3: Fleet Asset Strain */}
        <div className="bg-bg-surface rounded-xl border border-border-subtle p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted">
              Fleet Asset Strain
            </span>
            <span className="flex items-center gap-1 font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-surface-container-high text-text-secondary border border-border-subtle font-medium">
              <span className="material-symbols-outlined text-[13px] text-risk-low">check</span> Within Limits
            </span>
          </div>
          <div className="my-2">
            <div className="font-kpi-val text-kpi-val text-text-primary tracking-tight">+42.0 km / truck</div>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              +7.5% fuel usage • Driver duty cycles compliant
            </p>
          </div>
          <div className="flex items-center gap-2 font-caption text-caption text-text-secondary">
            <span className="material-symbols-outlined text-[14px] text-risk-low">check_circle</span>
            <span>All 17 drivers within 9h shift cap</span>
          </div>
        </div>

        {/* KPI 4: Composite Corridor Risk */}
        <div className="bg-bg-surface rounded-xl border border-border-subtle p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted">
              Composite Corridor Risk
            </span>
            <span className="flex items-center gap-1 font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low border border-risk-low/30 font-medium">
              -74 Risk Pts
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <div className="font-kpi-val text-kpi-val text-risk-low tracking-tight">
              14 <span className="text-sm font-normal text-text-muted">/ 100</span>
            </div>
            <span className="font-caption text-caption text-risk-critical line-through">88 / 100</span>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
            <span>Confidence: 94.8%</span>
            <span className="text-risk-low font-medium">Safe Clearance Profile</span>
          </div>
        </div>
      </section>

      {/* Section 4: Primary Visual Comparison Workspace (2 Side-by-Side Columns) */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        {/* Left Column: Status Quo (Route A) */}
        <div className="bg-bg-surface rounded-xl border-2 border-risk-critical/40 p-4 flex flex-col justify-between shadow-lg relative">
          <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-badge-label text-badge-label px-2.5 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical border border-risk-critical/40 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-ping"></span>
                  Status Quo: Blocked & Critical Risk
                </span>
              </div>
              <h2 className="font-section-title text-section-title text-text-primary">
                Current Live Plan (Route A — Inundated)
              </h2>
              <span className="font-caption text-caption text-text-muted">
                Direct NH-48 Express via Solapur-Mohol Corridor
              </span>
            </div>
            <div className="text-right">
              <div className="font-kpi-val text-kpi-val text-risk-critical leading-tight">
                88<span className="text-xs font-normal text-text-muted">/100</span>
              </div>
              <span className="font-caption text-caption uppercase text-risk-critical font-medium">Risk Score</span>
            </div>
          </div>

          {/* SVG Map Obstruction Visualizer */}
          <div className="my-3 bg-surface-container-lowest rounded-lg p-3 border border-border-subtle relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-caption text-caption uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-risk-critical">warning</span>
                Km 194.2 Telemetry Obstruction Map
              </span>
              <span className="font-caption text-caption text-risk-critical font-medium">
                Water Depth: 1.2m over tarmac
              </span>
            </div>
            <svg className="w-full h-28 text-on-surface" fill="none" viewBox="0 0 540 110" xmlns="http://www.w3.org/2000/svg">
              <line stroke="#243142" strokeDasharray="3 3" x1="0" x2="540" y1="20" y2="20"></line>
              <line stroke="#243142" strokeDasharray="3 3" x1="0" x2="540" y1="55" y2="55"></line>
              <line stroke="#243142" strokeDasharray="3 3" x1="0" x2="540" y1="90" y2="90"></line>
              <path d="M 20 55 L 180 55" stroke="#6f7d8f" strokeLinecap="round" strokeWidth="4"></path>
              <path d="M 180 55 L 360 55" stroke="#ef4444" strokeDasharray="6 4" strokeLinecap="round" strokeWidth="4"></path>
              <path d="M 360 55 L 520 55" stroke="#4b5868" strokeLinecap="round" strokeWidth="4"></path>
              <ellipse cx="270" cy="55" fill="#ef4444" fillOpacity="0.18" rx="75" ry="32" stroke="#ef4444" strokeDasharray="4 2" strokeWidth="1.5"></ellipse>
              <path d="M 210 50 Q 230 42 250 50 T 290 50 T 330 50" fill="none" stroke="#ef4444" strokeWidth="1.5"></path>
              <path d="M 215 62 Q 235 54 255 62 T 295 62 T 325 62" fill="none" stroke="#ef4444" strokeWidth="1.5"></path>
              <circle cx="20" cy="55" fill="#38bdf8" r="5" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#dee2ed" fontFamily="Inter" fontSize="10" textAnchor="middle" x="20" y="78">Pune Hub</text>
              <circle cx="270" cy="55" fill="#ef4444" r="7" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#ef4444" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="middle" x="270" y="32">Km 194 Solapur Breach</text>
              <text fill="#f97316" fontFamily="Inter" fontSize="9" textAnchor="middle" x="270" y="98">17 Trucks Stalled / Gridlock</text>
              <circle cx="520" cy="55" fill="#6f7d8f" r="5" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#dee2ed" fontFamily="Inter" fontSize="10" textAnchor="middle" x="520" y="78">Solapur DC</text>
            </svg>
            <div className="flex items-center justify-between text-xs text-text-muted mt-1 px-1">
              <span>Speed: 0 km/h (Standstill)</span>
              <span className="text-risk-critical font-medium">NHAI Alert #FL-489: Indefinite closure</span>
              <span>Elevation: 410m (Basin Floodline)</span>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-2.5 my-2">
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
              <span className="font-caption text-caption text-text-muted">Total Expected Delay</span>
              <div className="font-card-title text-card-title text-risk-critical font-bold mt-0.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">schedule</span>+24.5 Hours
              </div>
              <span className="font-caption text-caption text-risk-critical">100% SLA Breach guaranteed</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
              <span className="font-caption text-caption text-text-muted">Penalty & Demurrage Cost</span>
              <div className="font-card-title text-card-title text-risk-critical font-bold mt-0.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">payments</span>₹1,42,000
              </div>
              <span className="font-caption text-caption text-text-muted">₹8,350 avg demurrage/vehicle</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
              <span className="font-caption text-caption text-text-muted">Impacted High-Priority Units</span>
              <div className="font-card-title text-card-title text-text-primary font-semibold mt-0.5">17 Units Trapped</div>
              <span className="font-caption text-caption text-text-secondary">4 Reefer Pharma + 2 HazMat EV</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
              <span className="font-caption text-caption text-text-muted">Cold Chain Thermal Rupture</span>
              <div className="font-card-title text-card-title text-risk-critical font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">severe_cold</span>92% Likelihood
              </div>
              <span className="font-caption text-caption text-risk-critical">Gen-set fuel expires in 11.5h</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-risk-critical/10 border border-risk-critical/30 mt-2 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-risk-critical flex-shrink-0 mt-0.5">report_problem</span>
            <div className="text-xs">
              <span className="font-semibold text-risk-critical">SLA Liquidation & Spoilage Hazard:</span>
              <p className="text-on-surface mt-0.5 leading-relaxed">
                Without reroute authorization within 45 minutes, 4 vaccine consignments valued at ₹2.40 Cr will suffer irreversible temperature excursions beyond 8°C.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Detour (Route B) */}
        <div className="bg-bg-surface rounded-xl border-2 border-primary-container p-4 flex flex-col justify-between shadow-xl relative">
          <div className="absolute -top-3 right-6 bg-primary-container text-on-primary-container px-3 py-0.5 rounded-full font-badge-label text-badge-label font-bold tracking-wide uppercase flex items-center gap-1 shadow-md shadow-primary-container/30">
            <span className="material-symbols-outlined text-[13px]">smart_toy</span>
            AI Recommended Scenario
          </div>
          <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-badge-label text-badge-label px-2.5 py-0.5 rounded-full bg-risk-low/15 text-risk-low border border-risk-low/40 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Pavement Dry & Passable
                </span>
              </div>
              <h2 className="font-section-title text-section-title text-text-primary">
                Simulated Detour (Route B — SH-142 Solapur Bypass)
              </h2>
              <span className="font-caption text-caption text-primary">
                Detour via NH-65 interchange → SH-142 elevated ridge line
              </span>
            </div>
            <div className="text-right">
              <div className="font-kpi-val text-kpi-val text-risk-low leading-tight">
                14<span className="text-xs font-normal text-text-muted">/100</span>
              </div>
              <span className="font-caption text-caption uppercase text-risk-low font-medium">Residual Risk</span>
            </div>
          </div>

          {/* SVG Map Detour Visualizer */}
          <div className="my-3 bg-surface-container-lowest rounded-lg p-3 border border-border-subtle relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-caption text-caption uppercase tracking-wider text-primary font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">route</span>
                Dynamic Geofence Path: SH-142 Solapur Bypass
              </span>
              <span className="font-caption text-caption text-risk-low font-medium">Clearance: 100% Guaranteed</span>
            </div>
            <svg className="w-full h-28 text-on-surface" fill="none" viewBox="0 0 540 110" xmlns="http://www.w3.org/2000/svg">
              <line stroke="#243142" strokeDasharray="3 3" x1="0" x2="540" y1="20" y2="20"></line>
              <line stroke="#243142" strokeDasharray="3 3" x1="0" x2="540" y1="55" y2="55"></line>
              <line stroke="#243142" strokeDasharray="3 3" x1="0" x2="540" y1="90" y2="90"></line>
              <path d="M 20 55 L 180 55 L 360 55 L 520 55" stroke="#ef4444" strokeDasharray="4 4" strokeOpacity="0.3" strokeWidth="2"></path>
              <path d="M 20 55 C 130 15, 230 15, 330 20 C 420 25, 480 40, 520 55" stroke="#2f6df6" strokeLinecap="round" strokeWidth="3.5"></path>
              <circle cx="160" cy="23" fill="#b3c5ff" r="3.5"></circle>
              <circle cx="330" cy="20" fill="#b3c5ff" r="3.5"></circle>
              <circle cx="430" cy="28" fill="#b3c5ff" r="3.5"></circle>
              <circle cx="20" cy="55" fill="#38bdf8" r="5" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#dee2ed" fontFamily="Inter" fontSize="10" textAnchor="middle" x="20" y="75">Pune Hub</text>
              <g transform="translate(250, 10)">
                <rect fill="#141d29" height="18" rx="4" stroke="#2f6df6" strokeWidth="1" width="76" x="-4" y="-2"></rect>
                <text fill="#b3c5ff" fontFamily="Inter" fontSize="9" fontWeight="600" textAnchor="middle" x="34" y="11">SH-142 Ridge (+480m)</text>
              </g>
              <circle cx="520" cy="55" fill="#22c55e" r="5" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#dee2ed" fontFamily="Inter" fontSize="10" textAnchor="middle" x="520" y="75">Solapur DC</text>
            </svg>
            <div className="flex items-center justify-between text-xs text-text-muted mt-1 px-1">
              <span className="text-risk-low font-medium">Avg Cruise Speed: 58 km/h</span>
              <span className="text-text-secondary">FASTag Plaza: Automated Priority Lane 02</span>
              <span className="text-primary font-medium">Detour Distance: +42 km</span>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-2.5 my-2">
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
              <span className="font-caption text-caption text-text-muted">Expected Delay (Buffer Preserved)</span>
              <div className="font-card-title text-card-title text-risk-low font-bold mt-0.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">timelapse</span>+5.4 Hours
              </div>
              <span className="font-caption text-caption text-risk-low">Inside 6.0h grace window • 0 SLA Penalties</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
              <span className="font-caption text-caption text-text-muted">Incremental Fuel & Toll Outlay</span>
              <div className="font-card-title text-card-title text-text-primary font-bold mt-0.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">local_gas_station</span>₹31,280
              </div>
              <span className="font-caption text-caption text-text-muted">₹1,840 per truck avg across 17 units</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
              <span className="font-caption text-caption text-text-muted">Cold Chain Thermal Preservation</span>
              <div className="font-card-title text-card-title text-risk-low font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">thermostat</span>100% Compliance
              </div>
              <span className="font-caption text-caption text-text-secondary">Maintains continuous 3.8°C core mean</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
              <span className="font-caption text-caption text-text-muted">Net Cargo Value Protected</span>
              <div className="font-card-title text-card-title text-primary font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">security</span>₹2.40 Crores
              </div>
              <span className="font-caption text-caption text-risk-low">Zero spoilage or product write-off</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-primary-soft border border-primary/30 mt-2 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-0.5">neurology</span>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">AI Co-Pilot Recommendation (94.8% Confidence):</span>
                <span className="font-caption text-caption px-1.5 py-0.2 rounded bg-surface-container-lowest text-text-secondary">
                  Deterministic Model
                </span>
              </div>
              <p className="text-on-surface mt-0.5 leading-relaxed">
                Corridor SH-142 pavement is confirmed stable by state highway telemetry. Automated FASTag clearance pre-staged for 17 license plates. Executing now eliminates catastrophic dwell.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Comparative Tradeoff Bar Visualizer (4 Key Dimensions) */}
      <section className="bg-bg-surface rounded-xl border border-border-subtle p-4 mb-4">
        <div className="flex items-center justify-between mb-3 border-b border-border-subtle pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
            <h3 className="font-section-title text-section-title text-text-primary">
              Multi-Objective Operational Tradeoff Analysis
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-risk-critical/80"></span>
              <span className="text-text-muted">Status Quo (Direct NH-48)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary-container"></span>
              <span className="text-text-primary font-medium">Simulated Detour (SH-142)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: On-Time SLA Adherence */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-border-subtle flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-secondary font-medium">On-Time SLA Adherence</span>
              <span className="text-risk-low font-bold">94% vs 18%</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-caption text-caption text-text-muted mb-0.5">
                  <span>Status Quo</span>
                  <span className="text-risk-critical">18%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-risk-critical h-full w-[18%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-caption text-caption text-text-muted mb-0.5">
                  <span>Simulated Plan</span>
                  <span className="text-risk-low font-semibold">94%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full w-[94%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric 2: Thermal & Cargo Preservation */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-border-subtle flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-secondary font-medium">Pharma Cargo Safety</span>
              <span className="text-risk-low font-bold">99% vs 12%</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-caption text-caption text-text-muted mb-0.5">
                  <span>Status Quo</span>
                  <span className="text-risk-critical">12%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-risk-critical h-full w-[12%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-caption text-caption text-text-muted mb-0.5">
                  <span>Simulated Plan</span>
                  <span className="text-risk-low font-semibold">99.4%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full w-[99.4%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric 3: Fleet Fuel Burn Index */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-border-subtle flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-secondary font-medium">Fuel Consumption Index</span>
              <span className="text-risk-medium font-bold">+7.5% Fuel Burn</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-caption text-caption text-text-muted mb-0.5">
                  <span>Baseline Idling</span>
                  <span className="text-text-secondary">100% (High Idling)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-text-muted h-full w-[100%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-caption text-caption text-text-muted mb-0.5">
                  <span>Detour Mileage</span>
                  <span className="text-primary font-semibold">107.5% (+42km)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full w-[100%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric 4: Carbon Footprint Delta */}
          <div className="bg-surface-container-lowest p-3 rounded-lg border border-border-subtle flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-secondary font-medium">Carbon Footprint / Unit</span>
              <span className="text-text-secondary font-semibold">+62 kg CO₂e</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-caption text-caption text-text-muted mb-0.5">
                  <span>Status Quo Idle</span>
                  <span className="text-text-secondary">412 kg CO₂e</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-text-muted h-full w-[78%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-caption text-caption text-text-muted mb-0.5">
                  <span>Detour Transit</span>
                  <span className="text-primary font-semibold">474 kg CO₂e</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full w-[90%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Affected Shipments Batch Manifest Table */}
      <section className="bg-bg-surface rounded-xl border border-border-subtle overflow-hidden mb-5">
        <div className="p-3.5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <h3 className="font-section-title text-section-title text-text-primary">Impacted Fleet Manifest</h3>
            <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/30 font-medium">
              {mockManifest.length} Transit Units Filtered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-2.5 py-1 rounded bg-surface-container-low border border-border-subtle text-text-secondary hover:text-text-primary text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">select_all</span>
              <span>{selectedShipmentIds.length === mockManifest.length ? 'Deselect All' : `Select All (${mockManifest.length} Units)`}</span>
            </button>
            <div className="relative">
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-surface-container-lowest border border-border-subtle rounded-lg px-2.5 py-1 text-xs text-text-primary placeholder-text-muted w-48 focus:outline-none focus:border-primary"
                placeholder="Filter shipment ID or cargo..."
                type="text"
              />
              <span className="material-symbols-outlined text-[14px] text-text-muted absolute right-2 top-1.5">search</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-9 bg-surface-container-lowest border-b border-border-subtle text-text-muted font-caption text-caption uppercase tracking-wider">
                <th className="w-10 px-3 text-center">
                  <input
                    checked={selectedShipmentIds.length === mockManifest.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-surface-container-high border-border-subtle text-primary focus:ring-0 cursor-pointer"
                    type="checkbox"
                  />
                </th>
                <th className="px-3">Shipment & Consignee</th>
                <th className="px-3">Cargo Type</th>
                <th className="px-3">Priority</th>
                <th className="px-3">Current Status</th>
                <th className="px-3">Simulated ETA</th>
                <th className="px-3 text-right">Cost Delta</th>
                <th className="px-3 text-center">AI Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 font-table-cell text-table-cell">
              {displayedManifest.map((unit) => (
                <tr key={unit.id} className="h-10 hover:bg-bg-surface-hover transition-colors">
                  <td className="px-3 text-center">
                    <input
                      checked={selectedShipmentIds.includes(unit.id)}
                      onChange={() => toggleUnit(unit.id)}
                      className="unit-checkbox rounded bg-surface-container-high border-border-subtle text-primary focus:ring-0 cursor-pointer"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-6 rounded-full ${
                        unit.priority === 'Critical P0' ? 'bg-risk-critical' : unit.priority === 'High P1' ? 'bg-risk-high' : 'bg-risk-medium'
                      }`}></span>
                      <div>
                        <span className="font-semibold text-text-primary">{unit.id}</span>
                        <span className="text-text-muted ml-1">→ {unit.consignee}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3">
                    <span className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-[14px]">{unit.cargoIcon}</span>
                      {unit.cargo}
                    </span>
                  </td>
                  <td className="px-3">
                    <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full border font-medium ${
                      unit.priority === 'Critical P0'
                        ? 'bg-risk-critical/15 text-risk-critical border-risk-critical/30'
                        : unit.priority === 'High P1'
                        ? 'bg-risk-high/15 text-risk-high border-risk-high/30'
                        : 'bg-risk-medium/15 text-risk-medium border-risk-medium/30'
                    }`}>
                      {unit.priority}
                    </span>
                  </td>
                  <td className="px-3">
                    <span className={`flex items-center gap-1 font-medium ${
                      unit.statusType === 'critical' ? 'text-risk-critical' : unit.statusType === 'high' ? 'text-risk-high' : 'text-risk-medium'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">{unit.statusIcon}</span>
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-3">
                    <span className="text-risk-low font-medium">{unit.simulatedEta}</span>
                    <span className="text-text-muted text-[10px] ml-1">({unit.etaDelta})</span>
                  </td>
                  <td className="px-3 text-right font-medium text-text-primary">{unit.costDelta}</td>
                  <td className="px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[11px] font-medium">
                      {unit.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Manifest Pagination/Triage Info */}
        <div className="px-4 py-2.5 bg-surface-container-lowest border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-risk-low">verified_user</span>
            <span>All {mockManifest.length} units verified with active GPS transponders & onboard CANbus telemetry</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Showing {displayedManifest.length} of {mockManifest.length} Units</span>
            <button
              onClick={() => setShowAllUnits(!showAllUnits)}
              className="text-primary hover:underline cursor-pointer font-medium"
              type="button"
            >
              {showAllUnits ? 'Collapse to 5 Units' : `View All ${mockManifest.length} Manifest Rows →`}
            </button>
          </div>
        </div>
      </section>

      {/* Section 7: Primary Plan Execution & Audit Governance Card (Sticky Footer Action Banner) */}
      <section className="sticky bottom-4 z-30 bg-bg-surface-raised/95 backdrop-blur-md rounded-xl border border-primary/40 p-4 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined text-[24px]">alt_route</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h4 className="font-section-title text-section-title text-text-primary">
                  Apply Detour Plan to {selectedShipmentIds.length} Selected Transit Units?
                </h4>
                <span className="font-caption text-caption px-2 py-0.5 rounded bg-risk-low/15 text-risk-low border border-risk-low/30 font-medium">
                  Human-in-the-Loop Gate
                </span>
              </div>
              <p className="font-body-default text-body-default text-text-secondary mt-0.5 max-w-2xl">
                This will push revised turn-by-turn geofenced navigation directly to {selectedShipmentIds.length} linked driver onboard units, auto-notify consignees with revised +5.4h ETAs, and commit an immutable change-event to the compliance audit log.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center flex-shrink-0">
            <button
              onClick={() => {
                setToastMessage({
                  title: 'Simulation Dossier Exported',
                  desc: 'Multi-corridor PDF report generated with audit cryptographic stamp.',
                  type: 'info'
                })
                setTimeout(() => setToastMessage(null), 4000)
              }}
              className="h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Export Simulation PDF</span>
            </button>
            <button
              onClick={() => {
                setToastMessage({
                  title: 'Individual Exceptions Configurator',
                  desc: 'All 17 units conform to automated detour criteria without special permits.',
                  type: 'info'
                })
                setTimeout(() => setToastMessage(null), 4000)
              }}
              className="h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Individual Exceptions (0)</span>
            </button>
            <button
              onClick={handleExecutePlan}
              disabled={isExecuting || selectedShipmentIds.length === 0}
              className={`h-9 px-5 rounded-lg font-card-title text-card-title font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer ${
                executionComplete
                  ? 'bg-risk-low text-on-primary hover:bg-risk-low shadow-risk-low/30'
                  : 'bg-primary-container hover:bg-primary-hover text-on-primary-container shadow-primary-container/30'
              }`}
              type="button"
            >
              <span className={`material-symbols-outlined text-[18px] ${isExecuting ? 'animate-spin' : ''}`}>
                {isExecuting ? 'sync' : executionComplete ? 'done_all' : 'lock_open'}
              </span>
              <span>
                {isExecuting
                  ? 'Transmitting Waypoints...'
                  : executionComplete
                  ? 'Alternative Plan Executed'
                  : 'Authorize & Execute Alternative Plan'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Custom Scenario Builder Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-strong rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                <h3 className="font-section-title text-section-title text-text-primary">Custom Scenario Builder</h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 py-4">
              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-muted mb-1">
                  Corridor / Geography
                </label>
                <select
                  value={customCorridor}
                  onChange={e => setCustomCorridor(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                >
                  <option>NH-48 Mumbai-Pune Expressway</option>
                  <option>NH-44 Hyderabad-Bengaluru Corridor</option>
                  <option>JNPT Port Outbound Marine Arterial</option>
                  <option>Eastern Dedicated Freight Corridor (EDFC)</option>
                  <option>Delhi-NCR Ring Expressway</option>
                </select>
              </div>

              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-muted mb-1">
                  Disruption Severity & Type
                </label>
                <select
                  value={customSeverity}
                  onChange={e => setCustomSeverity(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                >
                  <option>Critical Inundation (&gt;1.0m)</option>
                  <option>Farmer Protest Highway Blockade</option>
                  <option>Landslide & Heavy Rockfall</option>
                  <option>Port Labor Strike (48h Halt)</option>
                  <option>Hazardous Material Spill Closure</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-caption text-caption uppercase tracking-wider text-text-muted mb-1">
                    Expected Duration (Hours)
                  </label>
                  <input
                    type="number"
                    value={customDuration}
                    onChange={e => setCustomDuration(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-caption text-caption uppercase tracking-wider text-text-muted mb-1">
                    Transit Units in Corridor
                  </label>
                  <input
                    type="number"
                    value={customUnits}
                    onChange={e => setCustomUnits(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-low border border-border-subtle text-text-secondary hover:text-text-primary text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveScenario('CUSTOM')
                  setShowCustomModal(false)
                  triggerMonteCarlo()
                }}
                className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary-container text-xs font-medium flex items-center gap-1.5 shadow-md shadow-primary-container/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Synthesize & Run Model</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
