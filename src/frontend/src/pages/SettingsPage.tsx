import { useState } from 'react'

interface AuditLedgerEntry {
  timestamp: string
  operator: string
  parameter: string
  oldVal: string
  newVal: string
  hash: string
}

const mockAuditTrail: AuditLedgerEntry[] = [
  {
    timestamp: '2026-06-14 14:12:08',
    operator: 'Operator (Control Tower Lead)',
    parameter: 'Inundation Depth NH-48 Detour',
    oldVal: '0.95 m',
    newVal: '0.80 m',
    hash: '0x7E2A...90BC'
  },
  {
    timestamp: '2026-06-14 11:45:22',
    operator: 'S. Ramanujan (Lead AI Architect)',
    parameter: 'Bayesian Confidence Floor Filter',
    oldVal: '80%',
    newVal: '85%',
    hash: '0x4D1B...F731'
  },
  {
    timestamp: '2026-06-13 20:04:19',
    operator: 'SecOps Automation (Daemon)',
    parameter: 'API Token Key Rotation: Sensitech',
    oldVal: 'ss_live_...291a',
    newVal: 'ss_live_...3a1d',
    hash: '0x11A0...66C4'
  },
  {
    timestamp: '2026-06-12 17:30:00',
    operator: 'Dr. V. Mehta (Cold Chain Officer)',
    parameter: 'MKT Critical Buffer Countdown',
    oldVal: '30 mins',
    newVal: '45 mins',
    hash: '0x88F2...EE10'
  }
]

export default function SettingsPage() {
  const [activeNavTab, setActiveNavTab] = useState<'general' | 'thresholds' | 'coldchain' | 'dispatch' | 'integrations' | 'audit'>('thresholds')

  // Interactive Threshold Settings
  const [inundationDepth, setInundationDepth] = useState(0.80)
  const [demurrageRate, setDemurrageRate] = useState('4,500')
  const [confidenceScore, setConfidenceScore] = useState(85)
  const [mktBufferMins, setMktBufferMins] = useState(45)

  // Toggle Switches
  const [alertMonsoon, setAlertMonsoon] = useState(true)
  const [alertPortStrike, setAlertPortStrike] = useState(true)
  const [alertFastagQueue, setAlertFastagQueue] = useState(false)
  const [cryoAutoDispatch, setCryoAutoDispatch] = useState(true)
  const [routineBypassAuto, setRoutineBypassAuto] = useState(true)
  const [crossDockAuto, setCrossDockAuto] = useState(true)
  const [fastagPreAuth, setFastagPreAuth] = useState(true)

  // Feedback and Deploy State
  const [hasPendingChanges, setHasPendingChanges] = useState(true)
  const [searchParam, setSearchParam] = useState('')
  const [tokenCopied, setTokenCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null)

  const handleDeployChanges = () => {
    setHasPendingChanges(false)
    setToastMessage({
      title: 'Configuration Deployed Successfully',
      desc: 'All 42 active policy rules synchronized across Western freight corridor gateways with SHA-256 seal.'
    })
    setTimeout(() => setToastMessage(null), 5000)
  }

  const handleResetDefaults = () => {
    setInundationDepth(0.80)
    setDemurrageRate('4,500')
    setConfidenceScore(85)
    setMktBufferMins(45)
    setAlertMonsoon(true)
    setAlertPortStrike(true)
    setAlertFastagQueue(false)
    setCryoAutoDispatch(true)
    setRoutineBypassAuto(true)
    setCrossDockAuto(true)
    setFastagPreAuth(true)
    setHasPendingChanges(false)
    setToastMessage({
      title: 'Defaults Restored',
      desc: 'Reverted all operational thresholds to baseline factory specifications.'
    })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText('ss_live_9f82d39b81ea0274c93a1d')
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

  return (
    <div className="flex flex-col w-full gap-5 pb-28 text-on-surface">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-8 bg-surface-container-high border border-risk-low text-text-primary px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="material-symbols-outlined text-risk-low text-[24px]">verified</span>
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-text-primary">{toastMessage.title}</span>
            <span className="text-[11px] text-text-secondary">{toastMessage.desc}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-text-muted hover:text-text-primary ml-2 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Context Header / Breadcrumb & Status Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-bg-surface border border-border-subtle shadow-sm">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 text-text-muted font-caption text-caption tracking-wide">
            <span className="hover:text-text-primary transition-colors cursor-pointer">Control Tower</span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="hover:text-text-primary transition-colors cursor-pointer">Global Configuration</span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-primary font-medium">System & Threshold Governance</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-page-title text-page-title text-text-primary font-semibold tracking-tight">
              Governance & Operational Thresholds
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-risk-low/10 border border-risk-low/30 text-risk-low font-badge-label text-badge-label">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse"></span>
              <span>Engine Config Synced • 14ms Latency</span>
            </div>
            <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-low border border-border-subtle text-text-muted font-caption text-caption font-mono">
              <span className="material-symbols-outlined text-[13px] text-text-secondary">shield_lock</span>
              SEC-9021-AUTH
            </span>
          </div>
        </div>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">filter_list</span>
            <input
              value={searchParam}
              onChange={e => setSearchParam(e.target.value)}
              className="h-8 pl-8 pr-3 w-64 bg-surface-container-lowest border border-border-subtle rounded-lg text-text-primary text-table-cell font-table-cell placeholder-text-muted focus:outline-none focus:border-primary-container transition-colors"
              placeholder="Search parameters (e.g. MKT, Demurrage, NH-48)..."
              type="text"
            />
          </div>
          <button
            onClick={() => {
              const configJson = JSON.stringify({
                inundationDepth,
                demurrageRate,
                confidenceScore,
                mktBufferMins,
                rules: { alertMonsoon, alertPortStrike, alertFastagQueue, cryoAutoDispatch }
              }, null, 2)
              const blob = new Blob([configJson], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'supplyshield-config-export.json'
              a.click()
              setToastMessage({ title: 'JSON Config Exported', desc: 'Configuration payload saved locally.' })
              setTimeout(() => setToastMessage(null), 3000)
            }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border-subtle bg-surface-container-low hover:bg-bg-surface-hover hover:border-border-strong text-text-primary font-caption text-caption font-medium transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px] text-text-secondary">file_download</span>
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border-subtle bg-surface-container-low hover:bg-bg-surface-hover hover:border-border-strong text-text-secondary hover:text-text-primary font-caption text-caption font-medium transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleDeployChanges}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary-container font-card-title text-caption font-medium shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            <span>Deploy Changes</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Horizontal Ribbon */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-px overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveNavTab('general')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-body-default font-body-default transition-colors cursor-pointer ${activeNavTab === 'general'
                ? 'border-primary-container text-primary font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
          >
            <span className="material-symbols-outlined text-[17px]">tune</span>
            <span>General & Operations Profile</span>
          </button>
          <button
            onClick={() => setActiveNavTab('thresholds')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-body-default font-body-default transition-colors cursor-pointer ${activeNavTab === 'thresholds'
                ? 'border-primary-container text-primary font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
          >
            <span className="material-symbols-outlined text-[17px]">crisis_alert</span>
            <span>Risk & Anomaly Thresholds</span>
            <span className="px-1.5 py-0.2 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-[10px] leading-tight">ACTIVE</span>
          </button>
          <button
            onClick={() => setActiveNavTab('coldchain')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-body-default font-body-default transition-colors cursor-pointer ${activeNavTab === 'coldchain'
                ? 'border-primary-container text-primary font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
          >
            <span className="material-symbols-outlined text-[17px]">ac_unit</span>
            <span>Cold Chain & MKT Rules</span>
          </button>
          <button
            onClick={() => setActiveNavTab('dispatch')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-body-default font-body-default transition-colors cursor-pointer ${activeNavTab === 'dispatch'
                ? 'border-primary-container text-primary font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
          >
            <span className="material-symbols-outlined text-[17px]">smart_toy</span>
            <span>Autonomous Dispatch & Guardrails</span>
          </button>
          <button
            onClick={() => setActiveNavTab('integrations')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-body-default font-body-default transition-colors cursor-pointer ${activeNavTab === 'integrations'
                ? 'border-primary-container text-primary font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
          >
            <span className="material-symbols-outlined text-[17px]">hub</span>
            <span>Integrations & IoT Telemetry</span>
          </button>
          <button
            onClick={() => setActiveNavTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-body-default font-body-default transition-colors cursor-pointer ${activeNavTab === 'audit'
                ? 'border-primary-container text-primary font-medium'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
          >
            <span className="material-symbols-outlined text-[17px]">history_edu</span>
            <span>Role-Based Access & Audit Ledger</span>
          </button>
        </nav>
        <div className="hidden lg:flex items-center gap-2 text-text-muted font-caption text-caption pl-4 shrink-0">
          <span>Runtime Hash:</span>
          <code className="font-mono text-primary text-[11px] bg-surface-container px-1.5 py-0.5 rounded border border-border-subtle">
            0x9F3E...44A2
          </code>
        </div>
      </div>

      {/* Top Governance KPI Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* KPI 1 */}
        <div className="flex flex-col p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-table-cell text-table-cell text-text-secondary">Active Policy Rules</span>
            <span className="material-symbols-outlined text-[18px] text-primary">policy</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">42 Enabled</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-risk-low font-caption text-caption">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>100% Validated • 0 syntax conflicts</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="flex flex-col p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-table-cell text-table-cell text-text-secondary">Autonomous Gate Level</span>
            <span className="material-symbols-outlined text-[18px] text-status-info">lock_clock</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">HITL Tier 2</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-text-muted font-caption text-caption truncate" title="Reroutes > ₹50,000 or > 2h delay require operator approval">
            <span className="material-symbols-outlined text-[14px] text-risk-medium">gavel</span>
            <span className="truncate">Reroutes &gt; ₹50k or &gt; 2h require sign-off</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="flex flex-col p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-table-cell text-table-cell text-text-secondary">Cold Chain MKT Tolerance</span>
            <span className="material-symbols-outlined text-[18px] text-status-info">thermostat</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">GDP / ISO 17025</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-status-info font-caption text-caption">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>Alarm at &gt;15m breach or &gt;+8.0°C</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="flex flex-col p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-table-cell text-table-cell text-text-secondary">Connected IoT Nodes</span>
            <span className="material-symbols-outlined text-[18px] text-risk-low">sensors</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">1,420 Live</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-risk-low font-caption text-caption">
            <span className="material-symbols-outlined text-[14px]">cell_tower</span>
            <span>99.98% Heartbeat • 4 Gateways Sync</span>
          </div>
        </div>
      </div>

      {/* Primary Workspace: Two-Column Split (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (60% / 7 Cols lg) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* CARD A: Risk Scoring & Anomaly Detection Sensitivity */}
          <section className="flex flex-col rounded-xl bg-bg-surface border border-border-subtle p-5 gap-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">warning_amber</span>
                </div>
                <div>
                  <h2 className="font-section-title text-section-title text-text-primary font-semibold">
                    Risk Scoring & Anomaly Detection Sensitivity
                  </h2>
                  <p className="font-caption text-caption text-text-muted">
                    Dynamic algorithmic triggers for multi-modal corridor rerouting & disruption escalation
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high border border-border-subtle text-text-secondary font-caption text-caption">
                Engine v4.9.1
              </span>
            </div>

            {/* Slider 1: Inundation Depth Trigger */}
            <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-surface-container-lowest border border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-status-info">flood</span>
                  <span className="font-card-title text-card-title text-text-primary">Corridor Inundation Trigger Depth</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-caption text-caption text-text-muted">Advisory threshold:</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high border border-border-strong text-primary font-mono text-table-cell font-semibold">
                    {inundationDepth.toFixed(2)} m
                  </span>
                </div>
              </div>
              <p className="font-caption text-caption text-text-muted">
                Automatic high-risk detour reroute triggers when water accumulation across NH-48 / Western DFC crosses this barrier.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span className="font-caption text-caption text-text-disabled">0.2m</span>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.05"
                  value={inundationDepth}
                  onChange={e => {
                    setInundationDepth(parseFloat(e.target.value))
                    setHasPendingChanges(true)
                  }}
                  className="w-full accent-primary-container bg-surface-container-high h-1.5 rounded-lg cursor-pointer"
                />
                <span className="font-caption text-caption text-text-disabled">2.0m</span>
              </div>
            </div>

            {/* Demurrage Baseline & Surge Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-between p-3.5 rounded-lg bg-surface-container-lowest border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px] text-risk-high">currency_rupee</span>
                    <span className="font-card-title text-card-title text-text-primary">Demurrage Baseline Rate</span>
                  </div>
                  <span className="font-caption text-caption text-text-muted">Hourly</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-text-muted text-table-cell">₹</span>
                    <input
                      value={demurrageRate}
                      onChange={e => {
                        setDemurrageRate(e.target.value)
                        setHasPendingChanges(true)
                      }}
                      className="w-full h-8 pl-6 pr-2 rounded bg-surface-container border border-border-subtle text-text-primary font-mono text-table-cell focus:outline-none focus:border-primary-container"
                      type="text"
                    />
                  </div>
                  <span className="font-caption text-caption text-text-secondary">/ TEU-hr</span>
                </div>
                <p className="font-caption text-caption text-text-muted mt-2">JNPT & Mundra Port default tariff index</p>
              </div>

              <div className="flex flex-col justify-between p-3.5 rounded-lg bg-surface-container-lowest border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px] text-risk-critical">trending_up</span>
                    <span className="font-card-title text-card-title text-text-primary">Dynamic Surge Multiplier</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-risk-critical/15 text-risk-critical text-[10px] font-mono border border-risk-critical/30">
                    CONGESTION &gt; 48H
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-table-cell text-text-primary font-semibold">1.75x</span>
                  <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-risk-high h-full rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <span className="font-caption text-caption text-text-muted">Max 2.5x</span>
                </div>
                <p className="font-caption text-caption text-text-muted mt-2">Applies automatically when yard dwell time exceeds 48 hours</p>
              </div>
            </div>

            {/* Disruption Severity Priority Matrix */}
            <div className="flex flex-col gap-2.5">
              <span className="font-card-title text-card-title text-text-primary">Disruption Severity Priority Matrix</span>
              <div className="rounded-lg border border-border-subtle overflow-hidden">
                <table className="w-full text-left font-table-cell text-table-cell">
                  <thead className="bg-surface-container-lowest text-text-muted font-caption text-caption uppercase tracking-wider border-b border-border-subtle">
                    <tr>
                      <th className="py-2.5 px-3">Disruption Vector</th>
                      <th className="py-2.5 px-3">Trigger Condition</th>
                      <th className="py-2.5 px-3">Assigned Priority</th>
                      <th className="py-2.5 px-3 text-right">Autonomous Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-bg-surface">
                    <tr className="hover:bg-bg-surface-hover transition-colors">
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-risk-critical">thunderstorm</span>
                        <span className="font-medium text-text-primary">Monsoon Flooding / Landslide</span>
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary font-mono text-[11px]">IMD Red Alert + Precip &gt; 65mm/hr</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical border border-risk-critical/30 font-badge-label text-badge-label">
                          <span className="w-1.5 h-1.5 rounded-full bg-risk-critical"></span>
                          P0 (Critical)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="checkbox"
                          checked={alertMonsoon}
                          onChange={e => { setAlertMonsoon(e.target.checked); setHasPendingChanges(true); }}
                          className="rounded text-primary focus:ring-0 bg-surface-container cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-bg-surface-hover transition-colors">
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-risk-high">anchor</span>
                        <span className="font-medium text-text-primary">Port Terminal Berth Blockade</span>
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary font-mono text-[11px]">Vessel queuing &gt; 6 units or Wildcat strike</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-risk-high/15 text-risk-high border border-risk-high/30 font-badge-label text-badge-label">
                          <span className="w-1.5 h-1.5 rounded-full bg-risk-high"></span>
                          P1 (High)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="checkbox"
                          checked={alertPortStrike}
                          onChange={e => { setAlertPortStrike(e.target.checked); setHasPendingChanges(true); }}
                          className="rounded text-primary focus:ring-0 bg-surface-container cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-bg-surface-hover transition-colors">
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-risk-medium">traffic</span>
                        <span className="font-medium text-text-primary">Toll Plaza FASTag Bottleneck</span>
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary font-mono text-[11px]">Queue delay &gt; 45 mins at NHAI plaza</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-risk-medium/15 text-risk-medium border border-risk-medium/30 font-badge-label text-badge-label">
                          <span className="w-1.5 h-1.5 rounded-full bg-risk-medium"></span>
                          P2 (Medium)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="checkbox"
                          checked={alertFastagQueue}
                          onChange={e => { setAlertFastagQueue(e.target.checked); setHasPendingChanges(true); }}
                          className="rounded text-primary focus:ring-0 bg-surface-container cursor-pointer"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Confidence Slider */}
            <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-surface-container-lowest border border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">neurology</span>
                  <span className="font-card-title text-card-title text-text-primary">Minimum AI Confidence Score for Dispatch Alarm</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary-soft border border-primary/30 text-primary font-mono text-table-cell font-bold">
                  {confidenceScore}%
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="font-caption text-caption text-text-disabled">50%</span>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={confidenceScore}
                  onChange={e => {
                    setConfidenceScore(parseInt(e.target.value))
                    setHasPendingChanges(true)
                  }}
                  className="w-full accent-primary-container bg-surface-container-high h-1.5 rounded-lg cursor-pointer"
                />
                <span className="font-caption text-caption text-text-disabled">99%</span>
              </div>
              <p className="font-caption text-caption text-text-muted">
                Predictions with Bayesian certainty below {confidenceScore}% remain in Silent Logging mode without ringing Control Tower consoles.
              </p>
            </div>
          </section>

          {/* CARD B: Cold Chain Kinetic MKT & Thermal Excursion Thresholds */}
          <section className="flex flex-col rounded-xl bg-bg-surface border border-border-subtle p-5 gap-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-status-info/15 text-status-info flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">severe_cold</span>
                </div>
                <div>
                  <h2 className="font-section-title text-section-title text-text-primary font-semibold">
                    Cold Chain Kinetic MKT & Thermal Excursion Thresholds
                  </h2>
                  <p className="font-caption text-caption text-text-muted">
                    WHO GDP & USP &lt;1079&gt; compliant multi-compartment kinetic monitoring parameters
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low border border-risk-low/30 font-caption text-caption font-mono">
                PHARMA CERTIFIED
              </span>
            </div>

            {/* Thermal Bands Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest border border-border-subtle gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-card-title text-caption font-semibold text-text-primary">Deep Cryo</span>
                  <span className="w-2 h-2 rounded-full bg-status-info"></span>
                </div>
                <div className="flex items-baseline gap-1 font-mono text-text-primary font-semibold">
                  <span className="text-[18px]">-80°C</span>
                  <span className="text-text-muted font-normal text-caption">to</span>
                  <span className="text-[18px]">-20°C</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-status-info h-full rounded-full" style={{ width: '35%' }}></div>
                </div>
                <span className="font-caption text-[10px] text-text-muted">Biologics & mRNA Vaccine</span>
              </div>

              <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest border border-border-subtle gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-card-title text-caption font-semibold text-text-primary">Standard Reefer</span>
                  <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                </div>
                <div className="flex items-baseline gap-1 font-mono text-text-primary font-semibold">
                  <span className="text-[18px]">+2.0°C</span>
                  <span className="text-text-muted font-normal text-caption">to</span>
                  <span className="text-[18px]">+8.0°C</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-risk-low h-full rounded-full" style={{ width: '55%' }}></div>
                </div>
                <span className="font-caption text-[10px] text-text-muted">Insulin, Sera & Injectables</span>
              </div>

              <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest border border-border-subtle gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-card-title text-caption font-semibold text-text-primary">Controlled Room Temp</span>
                  <span className="w-2 h-2 rounded-full bg-risk-medium"></span>
                </div>
                <div className="flex items-baseline gap-1 font-mono text-text-primary font-semibold">
                  <span className="text-[18px]">+15.0°C</span>
                  <span className="text-text-muted font-normal text-caption">to</span>
                  <span className="text-[18px]">+25.0°C</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-risk-medium h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="font-caption text-[10px] text-text-muted">Solid Dosages & IV Fluids</span>
              </div>
            </div>

            {/* MKT Buffer Timer & Cryo-Booster Autonomous Dispatch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col p-3.5 rounded-lg bg-surface-container-lowest border border-border-subtle justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-card-title text-card-title text-text-primary">MKT Critical Buffer Countdown</span>
                  <span className="material-symbols-outlined text-[16px] text-status-info">timer</span>
                </div>
                <p className="font-caption text-caption text-text-muted mb-2">Excursion timer ceiling before automated incident ticket generation</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={mktBufferMins}
                    onChange={e => {
                      setMktBufferMins(parseInt(e.target.value) || 0)
                      setHasPendingChanges(true)
                    }}
                    className="h-8 w-20 px-2 rounded bg-surface-container border border-border-subtle text-text-primary font-mono text-table-cell focus:outline-none focus:border-primary-container"
                  />
                  <span className="font-table-cell text-table-cell text-text-secondary">Minutes cumulative threshold</span>
                </div>
              </div>

              <div className="flex flex-col p-3.5 rounded-lg bg-surface-container-lowest border border-border-subtle justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-card-title text-card-title text-text-primary">Cryo-Booster Autonomous Dispatch</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">autorenew</span>
                </div>
                <p className="font-caption text-caption text-text-muted mb-2">Auto-reserves nearest dry-ice hub if chamber delta exceeds limit</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 font-mono text-table-cell text-text-primary">
                    <span>&gt; +0.5°C/hr</span>
                    <span className="text-text-muted">over 20m</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cryoAutoDispatch}
                    onChange={e => { setCryoAutoDispatch(e.target.checked); setHasPendingChanges(true); }}
                    className="rounded text-primary focus:ring-0 bg-surface-container cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (40% / 5 Cols lg) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* CARD C: Autonomous Dispatch Guardrails */}
          <section className="flex flex-col rounded-xl bg-bg-surface border border-border-subtle p-5 gap-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <div>
                  <h2 className="font-section-title text-section-title text-text-primary font-semibold">
                    Autonomous Dispatch Guardrails
                  </h2>
                  <p className="font-caption text-caption text-text-muted">Human-in-the-Loop policy locks & rate limits</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Policy 1 */}
              <div className="flex items-start justify-between p-3 rounded-lg bg-surface-container-lowest border border-border-subtle gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-risk-critical">shield</span>
                    <span className="font-card-title text-table-cell font-semibold text-text-primary">
                      High-Value Cargo Reroute (&gt; ₹1.0 Cr)
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-muted mt-0.5">
                    Strictly requires 2-Factor Biometric/SMS Operator Sign-off.
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-risk-critical/15 text-risk-critical text-[10px] font-semibold border border-risk-critical/30 shrink-0">
                  LOCKED 2FA
                </span>
              </div>

              {/* Policy 2 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-card-title text-table-cell font-semibold text-text-primary">
                    Routine Congestion Bypass (&lt; 15km delta)
                  </span>
                  <span className="font-caption text-caption text-text-muted">
                    Autonomous navigation feed injection to telematics head-unit
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={routineBypassAuto}
                  onChange={e => { setRoutineBypassAuto(e.target.checked); setHasPendingChanges(true); }}
                  className="rounded text-primary focus:ring-0 bg-surface-container cursor-pointer"
                />
              </div>

              {/* Policy 3 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-card-title text-table-cell font-semibold text-text-primary">
                    Idle Fleet Reefer Cross-Docking
                  </span>
                  <span className="font-caption text-caption text-text-muted">
                    Requires Human Confirmation before dispatch handshake
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={crossDockAuto}
                  onChange={e => { setCrossDockAuto(e.target.checked); setHasPendingChanges(true); }}
                  className="rounded text-primary focus:ring-0 bg-surface-container cursor-pointer"
                />
              </div>

              {/* Policy 4 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-card-title text-table-cell font-semibold text-text-primary">
                    FASTag Dynamic Toll Pre-authorization
                  </span>
                  <span className="font-caption text-caption text-text-muted">
                    Auto-top up wallet balance when corridor queue exceeds SLA
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={fastagPreAuth}
                  onChange={e => { setFastagPreAuth(e.target.checked); setHasPendingChanges(true); }}
                  className="rounded text-primary focus:ring-0 bg-surface-container cursor-pointer"
                />
              </div>
            </div>

            {/* Circuit Breaker & Safety Killswitch */}
            <div className="p-3.5 rounded-lg bg-risk-critical/10 border border-risk-critical/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-risk-critical text-[22px]">flash_on</span>
                <div className="flex flex-col">
                  <span className="font-card-title text-table-cell font-semibold text-risk-critical">Emergency Circuit Breaker</span>
                  <span className="font-caption text-caption text-text-muted">Kill-switch trips if autonomous reroutes exceed 50/hour</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-risk-critical text-white font-mono text-[10px] font-bold">ARMED</span>
            </div>
          </section>

          {/* CARD D: IoT Gateways & Enterprise Integrations */}
          <section className="flex flex-col rounded-xl bg-bg-surface border border-border-subtle p-5 gap-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-status-info flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                </div>
                <div>
                  <h2 className="font-section-title text-section-title text-text-primary font-semibold">
                    IoT Gateways & Integrations
                  </h2>
                  <p className="font-caption text-caption text-text-muted">Live telemetry ingress & enterprise connectors</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setToastMessage({ title: 'Gateways Synchronized', desc: 'All 4 enterprise data pipelines validated healthy.' })
                  setTimeout(() => setToastMessage(null), 3000)
                }}
                className="text-text-muted hover:text-text-primary p-1 rounded transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                  <div className="flex flex-col">
                    <span className="font-card-title text-caption font-semibold text-text-primary">IMD Doppler Weather Radar</span>
                    <span className="font-caption text-[10px] text-text-muted">Latency 34ms • Sync 4m ago</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-risk-low font-caption text-[11px] font-medium border border-risk-low/20">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                  <div className="flex flex-col">
                    <span className="font-card-title text-caption font-semibold text-text-primary">NHAI FASTag National Telemetry</span>
                    <span className="font-caption text-[10px] text-text-muted">12,840 tx/day • Webhook OK</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-risk-low font-caption text-[11px] font-medium border border-risk-low/20">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                  <div className="flex flex-col">
                    <span className="font-card-title text-caption font-semibold text-text-primary">Sensitech & Roambee Ingress</span>
                    <span className="font-caption text-[10px] text-text-muted">1,420 sensors • MQTT TLS 1.3</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-risk-low font-caption text-[11px] font-medium border border-risk-low/20">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                  <div className="flex flex-col">
                    <span className="font-card-title text-caption font-semibold text-text-primary">SAP S/4HANA Supply Chain ERP</span>
                    <span className="font-caption text-[10px] text-text-muted">OData v4 • Bi-directional Sync</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-risk-low font-caption text-[11px] font-medium border border-risk-low/20">
                  Active
                </span>
              </div>
            </div>

            {/* Token Copy & Management */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-surface-container-lowest border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-card-title text-caption text-text-secondary font-medium">Control Tower Production Ingress Token</span>
                <span className="text-text-disabled font-caption text-[10px]">Rotated 12d ago</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-surface-container border border-border-subtle">
                <code className="font-mono text-table-cell text-primary font-medium tracking-wide select-all">
                  ss_live_9f82••••••••••••3a1d
                </code>
                <div className="flex items-center gap-1 text-text-secondary">
                  <button
                    onClick={handleCopyToken}
                    className="p-1 hover:text-text-primary hover:bg-surface-container-high rounded transition-colors cursor-pointer"
                    title="Copy Token"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">{tokenCopied ? 'check' : 'content_copy'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setToastMessage({ title: 'Token Rotated', desc: 'New bearer token provisioned and registered in audit log.' })
                      setTimeout(() => setToastMessage(null), 3000)
                    }}
                    className="p-1 hover:text-risk-high hover:bg-surface-container-high rounded transition-colors cursor-pointer"
                    title="Regenerate Token"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Section: Configuration Audit Ledger */}
      <section className="flex flex-col rounded-xl bg-bg-surface border border-border-subtle p-5 gap-3.5">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high text-text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div>
              <h2 className="font-section-title text-section-title text-text-primary font-semibold">
                Immutable Configuration Audit Ledger
              </h2>
              <p className="font-caption text-caption text-text-muted">
                Cryptographically verified operator parameter overrides & policy modifications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-caption text-caption text-text-muted">
              Hash Chain: <strong className="text-risk-low font-mono font-medium">SHA-256 Intact</strong>
            </span>
            <button
              onClick={() => {
                setToastMessage({ title: 'Audit Trail Exported', desc: 'Cryptographic ledger trail exported to CSV.' })
                setTimeout(() => setToastMessage(null), 3000)
              }}
              className="px-2.5 py-1 rounded bg-surface-container-low border border-border-subtle hover:bg-bg-surface-hover text-text-secondary font-caption text-caption cursor-pointer"
              type="button"
            >
              Export Audit Trail
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left font-table-cell text-table-cell whitespace-nowrap">
            <thead className="bg-surface-container-lowest text-text-muted font-caption text-caption uppercase tracking-wider border-b border-border-subtle">
              <tr>
                <th className="py-2.5 px-3">Timestamp (IST)</th>
                <th className="py-2.5 px-3">Operator / Principal</th>
                <th className="py-2.5 px-3">Parameter Modified</th>
                <th className="py-2.5 px-3">Old Value</th>
                <th className="py-2.5 px-3">New Value</th>
                <th className="py-2.5 px-3 font-mono">Cryptographic Hash</th>
                <th className="py-2.5 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-bg-surface">
              {mockAuditTrail.map((entry, idx) => (
                <tr key={idx} className="hover:bg-bg-surface-hover transition-colors">
                  <td className="py-2 px-3 text-text-secondary font-mono text-[11px]">{entry.timestamp}</td>
                  <td className="py-2 px-3 text-text-primary font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-risk-low"></span>
                    {entry.operator}
                  </td>
                  <td className="py-2 px-3 text-text-primary">{entry.parameter}</td>
                  <td className="py-2 px-3 text-text-muted font-mono text-[11px]">{entry.oldVal}</td>
                  <td className="py-2 px-3 text-primary font-mono text-[11px] font-semibold">{entry.newVal}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-text-muted">{entry.hash}</td>
                  <td className="py-2 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-risk-low/10 text-risk-low border border-risk-low/30 font-badge-label text-[10px]">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sticky Deployment Footer Bar */}
      {hasPendingChanges && (
        <div className="fixed bottom-3 left-[246px] right-6 p-3 rounded-xl bg-bg-surface-raised border border-border-strong shadow-2xl flex items-center justify-between z-30 transition-all animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-risk-high"></span>
            </span>
            <div className="flex flex-col">
              <span className="font-card-title text-card-title text-text-primary font-semibold leading-tight">
                Unsaved operational parameters: modifications pending staging
              </span>
              <span className="font-caption text-caption text-text-muted">
                Changes will immediately calibrate automated dispatch rules across all Western Hub telematics.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setHasPendingChanges(false)}
              className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary font-caption text-caption font-medium transition-colors cursor-pointer"
              type="button"
            >
              Discard Edits
            </button>
            <button
              onClick={handleDeployChanges}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary-container font-card-title text-caption font-medium shadow-md transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              <span>Deploy to Live Control Tower</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
