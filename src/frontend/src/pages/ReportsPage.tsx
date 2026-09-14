import { useState } from 'react'

interface IncidentAuditItem {
  id: string
  timestamp: string
  corridor: string
  corridorSub: string
  disruptionClass: string
  disruptionType: 'critical' | 'high' | 'medium'
  impactedFleet: string
  actionTaken: string
  actionDetail: string
  protectedValue: string
  approver: string
  approverRule: string
  hash: string
}

const mockAuditLogs: IncidentAuditItem[] = [
  {
    id: '#INC-88942',
    timestamp: 'Jun 12, 14:22 IST',
    corridor: 'NH-48 Manor Toll Gate',
    corridorSub: 'Mumbai → Surat Arterial',
    disruptionClass: 'Flash Inundation',
    disruptionType: 'critical',
    impactedFleet: '6 Multi-Axle Trucks',
    actionTaken: 'SH-73 Dynamic Bypass Divert',
    actionDetail: '+18.4km detour (+24 min)',
    protectedValue: '₹42.8 L',
    approver: 'R. Deshmukh (Lead)',
    approverRule: 'Auto-Approved (Rule #4)',
    hash: '0xFA...901E'
  },
  {
    id: '#INC-88931',
    timestamp: 'Jun 10, 09:15 IST',
    corridor: 'JNPT Custom Terminal 3',
    corridorSub: 'Port Access Bottleneck',
    disruptionClass: 'Gate Strike Delay',
    disruptionType: 'high',
    impactedFleet: '4 Reefer Units',
    actionTaken: 'CFS Nhava Sheva 2 Buffer Staging',
    actionDetail: 'Pre-cleared gate staging slot',
    protectedValue: '₹1.15 Cr',
    approver: 'S. Kulkarni',
    approverRule: 'HITL Sign-Off',
    hash: '0x3D...88A2'
  },
  {
    id: '#INC-88914',
    timestamp: 'Jun 08, 22:40 IST',
    corridor: 'Bengaluru Outer Ring Road',
    corridorSub: 'Hosur → Peenya Expressway',
    disruptionClass: 'Urban Congestion',
    disruptionType: 'medium',
    impactedFleet: '3 High-Tech EVs',
    actionTaken: 'NICE Road Tollway Reroute',
    actionDetail: 'Toll subsidized (+₹420/unit)',
    protectedValue: '₹68.0 L',
    approver: 'System Auto',
    approverRule: 'Policy #12-Opt',
    hash: '0x7C...41B9'
  },
  {
    id: '#INC-88895',
    timestamp: 'Jun 05, 11:05 IST',
    corridor: 'Delhi-NCR Peripheral Ring',
    corridorSub: 'Kundli → Manesar Corridor',
    disruptionClass: 'Toll Gridlock',
    disruptionType: 'medium',
    impactedFleet: '5 Box Container Units',
    actionTaken: 'Dedicated Green FASTag Lane 02',
    actionDetail: 'Direct RFID bypass',
    protectedValue: '₹54.2 L',
    approver: 'A. Verma (Ops)',
    approverRule: 'Operator Override',
    hash: '0x9E...62C4'
  },
  {
    id: '#INC-88870',
    timestamp: 'Jun 01, 16:50 IST',
    corridor: 'NH-48 Solapur-Pune Km 194',
    corridorSub: 'Solapur Valley Basin',
    disruptionClass: 'Heavy River Overwash',
    disruptionType: 'critical',
    impactedFleet: '17 Transit Units',
    actionTaken: 'SH-142 Ridge Detour + Dry Ice',
    actionDetail: '+42.0km detour (+5.4h buffer)',
    protectedValue: '₹2.40 Cr',
    approver: 'Ramesh C. (Lead)',
    approverRule: 'Tier 2 HITL Gate',
    hash: '0x8F...D41A'
  }
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'exec' | 'disruption' | 'coldchain' | 'carrier' | 'driver'>('exec')
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState('All Corridors')
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days (May 15 – Jun 14, 2026)')
  const [auditSearchTerm, setAuditSearchTerm] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null)

  const triggerExport = (format: string) => {
    setToastMessage({
      title: `${format} Export Generated`,
      desc: `Packaging verified audit cryptographic bundle [${format}] with SHA-256 stamp (0x8F92...D41A).`
    })
    setTimeout(() => setToastMessage(null), 4500)
  }

  const filteredAuditLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.id.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      log.corridor.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      log.disruptionClass.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      log.approver.toLowerCase().includes(auditSearchTerm.toLowerCase())
    
    const matchesSeverity = selectedSeverity === 'all' || log.disruptionType === selectedSeverity
    return matchesSearch && matchesSeverity
  })

  return (
    <div className="flex flex-col w-full text-on-surface pb-16">
      {/* Export Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-container-high border border-risk-low text-text-primary shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="material-symbols-outlined text-risk-low text-[22px]">verified_user</span>
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-text-primary">{toastMessage.title}</span>
            <span className="text-[11px] text-text-secondary">{toastMessage.desc}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-text-muted hover:text-text-primary ml-2 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Breadcrumbs & Utility Actions */}
      <div className="flex flex-col gap-3 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-caption text-caption text-text-muted">
            <span className="material-symbols-outlined text-[14px]">analytics</span>
            <span>Control Tower</span>
            <span>/</span>
            <span className="text-text-secondary">Operational Analytics</span>
            <span>/</span>
            <span className="text-primary font-medium">Multi-Corridor Performance Audit & SLA Compliance</span>
          </div>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-text-secondary text-xs border border-border-subtle">
              <span className="material-symbols-outlined text-risk-low text-[16px]">verified</span>
              <span className="font-caption text-caption text-text-muted">Audit Hash:</span>
              <span className="font-caption text-caption text-primary font-mono font-medium">0x8F92...D41A</span>
            </div>

            <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-border-subtle">
              <button
                onClick={() => triggerExport('Certified PDF')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded transition-colors cursor-pointer"
                title="Export Certified PDF"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px] text-error">picture_as_pdf</span>
                <span>PDF</span>
              </button>
              <button
                onClick={() => triggerExport('Granular CSV')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded transition-colors cursor-pointer"
                title="Export Granular CSV"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px] text-risk-low">table_view</span>
                <span>CSV</span>
              </button>
              <button
                onClick={() => triggerExport('Complete Cryptographic SHA-256 Bundle')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-primary bg-bg-surface-hover hover:bg-surface-container-high rounded transition-colors font-medium cursor-pointer"
                title="Complete Telemetry & Cryptographic Log"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px] text-status-info">folder_zip</span>
                <span>Audit Bundle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page Title & Date Range */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-page-title text-page-title text-text-primary tracking-tight">
                Reports & Operational Performance Analytics
              </h1>
              <span className="font-badge-label text-badge-label px-2.5 py-0.5 rounded-full bg-primary-soft text-primary">
                {activeTab === 'exec' && 'Executive Summary'}
                {activeTab === 'disruption' && 'Disruption & Salvage ROI'}
                {activeTab === 'coldchain' && 'Cold Chain Compliance'}
                {activeTab === 'carrier' && 'Carrier Reliability'}
                {activeTab === 'driver' && 'Driver & Asset Utilization'}
              </span>
              <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-low"></span>
                GDP/ISO 17025 Certified
              </span>
            </div>
            <p className="font-body-default text-body-default text-text-secondary mt-1 max-w-4xl">
              Comprehensive post-incident telemetry analysis, disruption salvage metrics, carrier SLA adherence, and cold-chain thermal excursion compliance auditing across all multi-modal freight corridors.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2.5 bg-bg-surface-raised p-1.5 rounded-lg shadow-sm border border-border-subtle">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-low text-xs text-text-secondary">
              <span className="material-symbols-outlined text-[16px] text-text-muted">calendar_today</span>
              <select
                value={selectedDateRange}
                onChange={e => setSelectedDateRange(e.target.value)}
                className="bg-transparent text-text-primary font-medium focus:outline-none cursor-pointer"
              >
                <option value="Last 30 Days (May 15 – Jun 14, 2026)">May 15 – Jun 14, 2026 (30 Days)</option>
                <option value="Last 7 Days (Jun 07 – Jun 14, 2026)">Jun 07 – Jun 14, 2026 (7 Days)</option>
                <option value="Current Quarter Q2 2026">Q2 2026 (Quarter-to-Date)</option>
                <option value="Year to Date 2026">YTD 2026</option>
              </select>
            </div>
            <button
              onClick={() => triggerExport('Live Telemetry Refresh')}
              className="p-1 text-text-muted hover:text-text-primary hover:bg-bg-surface-hover rounded transition-colors cursor-pointer"
              title="Refresh Telemetry"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 text-xs bg-surface-container-low text-text-secondary rounded">
              <span className="material-symbols-outlined text-[16px]">filter_alt</span>
              <select
                value={selectedCorridorFilter}
                onChange={e => setSelectedCorridorFilter(e.target.value)}
                className="bg-transparent text-text-secondary focus:outline-none cursor-pointer"
              >
                <option>All Corridors</option>
                <option>Western Corridor (NH-48)</option>
                <option>JNPT Port Outbound</option>
                <option>Delhi-NCR Peripheral</option>
                <option>Bengaluru-Chennai Belt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Sub-Tabs Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-1">
          <button
            onClick={() => setActiveTab('exec')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm whitespace-nowrap cursor-pointer ${
              activeTab === 'exec'
                ? 'bg-primary-container text-text-primary font-semibold'
                : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">summarize</span>
            <span>Executive Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('disruption')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm whitespace-nowrap cursor-pointer ${
              activeTab === 'disruption'
                ? 'bg-primary-container text-text-primary font-semibold'
                : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span>Disruption & Salvage ROI</span>
          </button>
          <button
            onClick={() => setActiveTab('coldchain')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm whitespace-nowrap cursor-pointer ${
              activeTab === 'coldchain'
                ? 'bg-primary-container text-text-primary font-semibold'
                : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">ac_unit</span>
            <span>Cold Chain Compliance</span>
          </button>
          <button
            onClick={() => setActiveTab('carrier')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm whitespace-nowrap cursor-pointer ${
              activeTab === 'carrier'
                ? 'bg-primary-container text-text-primary font-semibold'
                : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            <span>Carrier Reliability</span>
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm whitespace-nowrap cursor-pointer ${
              activeTab === 'driver'
                ? 'bg-primary-container text-text-primary font-semibold'
                : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>Driver & Asset Utilization</span>
          </button>
        </div>
      </div>

      {/* Top 5 Key Performance Indicators Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {/* KPI 1 */}
        <div className="bg-bg-surface p-3.5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border-strong border border-border-subtle transition-all">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">Overall OTD (SLA)</span>
            <span className="material-symbols-outlined text-[18px] text-risk-low">verified</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">94.8%</span>
              <span className="font-caption text-caption text-risk-low flex items-center font-medium">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +3.2%
              </span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-risk-low h-full rounded-full" style={{ width: '94.8%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted">
            <span>Target: 92.0%</span>
            <span className="text-text-secondary">4,812 Trips Audited</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-bg-surface p-3.5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border-strong border border-border-subtle transition-all">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">Salvage Value</span>
            <span className="material-symbols-outlined text-[18px] text-primary">security_update_good</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="font-kpi-val text-kpi-val text-primary tracking-tight">₹3.42 Cr</span>
              <span className="font-caption text-caption text-risk-low flex items-center font-medium">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> Protected
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1">48 automated & assisted reroutes</p>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted">
            <span>Cargo At-Risk: ₹3.68 Cr</span>
            <span className="text-risk-low font-medium">92.9% Salvaged</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-bg-surface p-3.5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border-strong border border-border-subtle transition-all">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">Detour MTTR</span>
            <span className="material-symbols-outlined text-[18px] text-status-info">timer</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">24.5 min</span>
              <span className="font-caption text-caption text-risk-low flex items-center font-medium">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span> -42.0%
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1">Detection to corridor clearance</p>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted">
            <span>Prior Baseline: 42.1m</span>
            <span className="text-status-info font-medium">AI Dispatch</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-bg-surface p-3.5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border-strong border border-border-subtle transition-all">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">Cold Excursion</span>
            <span className="material-symbols-outlined text-[18px] text-status-info">device_thermostat</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">0.8%</span>
              <span className="font-caption text-caption text-risk-low flex items-center font-medium">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Safe
              </span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-status-info h-full rounded-full" style={{ width: '53%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted">
            <span>Target: &lt;1.5% SLA</span>
            <span className="text-risk-low font-medium">0 Write-Offs</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-bg-surface p-3.5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border-strong border border-border-subtle transition-all">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">Penalty Demurrage</span>
            <span className="material-symbols-outlined text-[18px] text-risk-low">savings</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="font-kpi-val text-kpi-val text-risk-low tracking-tight">₹18.6 L</span>
              <span className="font-caption text-caption text-risk-low flex items-center font-medium">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span> Net
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1">Post-fuel & toll overhead offset</p>
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-muted">
            <span>Gross Avoided: ₹24.2L</span>
            <span className="text-text-secondary font-medium">100% Retained</span>
          </div>
        </div>
      </div>

      {/* Operational Resiliency Banner */}
      <div className="bg-surface-container-low rounded-xl p-3.5 mb-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary-soft text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">troubleshoot</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-card-title text-card-title text-text-primary">Operational Corridor Resiliency Index: 96.4/100</span>
              <span className="font-caption text-caption px-2 py-0.5 rounded bg-risk-low/10 text-risk-low font-medium">Tier-1 Optimal</span>
            </div>
            <p className="font-caption text-caption text-text-muted mt-0.5">
              Dynamic multi-route failover active across all 4 key economic arterial routes. Current average detour deviation penalty stands at +14.2 km (+3.8% transit time impact).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <span className="font-caption text-caption text-text-muted block">Automated Dispatch Rate</span>
            <span className="font-card-title text-card-title text-primary font-semibold">88.4% Autonomous</span>
          </div>
          <button
            onClick={() => triggerExport('Regulatory Proof Certification')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface-hover hover:bg-surface-container-high text-xs text-text-primary transition-colors border border-border-subtle cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Export Regulatory Proof</span>
          </button>
        </div>
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Disruption Resolution & Cargo Protection Waterfall (7 Cols) */}
        <div className="lg:col-span-7 bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-section-title text-section-title text-text-primary">Disruption Resolution & Cargo Protection by Corridor</h2>
                <span className="font-caption text-caption text-text-muted px-2 py-0.5 bg-surface-container-low rounded">₹3.68 Cr Gross Risk</span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Comparative value analysis: Cargo value at threat vs value successfully salvaged via dynamic detour rerouting
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-risk-high"></span>
                <span className="font-caption text-caption text-text-secondary">Gross At-Risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary-container"></span>
                <span className="font-caption text-caption text-text-secondary">Salvaged Value</span>
              </div>
            </div>
          </div>

          {/* Corridor Bars */}
          <div className="space-y-3.5 my-2">
            {/* NH-48 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-body-default text-body-default font-medium text-text-primary flex items-center gap-1.5">
                  <span>Western Corridor (NH-48 / Mumbai-Surat)</span>
                  <span className="font-caption text-caption text-risk-low bg-risk-low/10 px-1.5 py-0.2 rounded">96.8% Rescued</span>
                </span>
                <div className="text-right font-caption text-caption">
                  <span className="text-text-muted">₹1.85 Cr At-Risk</span>
                  <span className="text-text-primary font-medium ml-2">₹1.79 Cr Salvaged</span>
                </div>
              </div>
              <div className="w-full h-3 bg-surface-container-lowest rounded-full overflow-hidden flex">
                <div className="bg-primary-container h-full rounded-l-full transition-all duration-500" style={{ width: '96.8%' }}></div>
                <div className="bg-risk-high h-full rounded-r-full" style={{ width: '3.2%' }}></div>
              </div>
            </div>

            {/* JNPT Coastal */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-body-default text-body-default font-medium text-text-primary flex items-center gap-1.5">
                  <span>JNPT Coastal Port Expressway</span>
                  <span className="font-caption text-caption text-risk-low bg-risk-low/10 px-1.5 py-0.2 rounded">91.4% Rescued</span>
                </span>
                <div className="text-right font-caption text-caption">
                  <span className="text-text-muted">₹98.4 L At-Risk</span>
                  <span className="text-text-primary font-medium ml-2">₹89.9 L Salvaged</span>
                </div>
              </div>
              <div className="w-full h-3 bg-surface-container-lowest rounded-full overflow-hidden flex">
                <div className="bg-primary-container h-full rounded-l-full transition-all duration-500" style={{ width: '91.4%' }}></div>
                <div className="bg-risk-high h-full rounded-r-full" style={{ width: '8.6%' }}></div>
              </div>
            </div>

            {/* Delhi-NCR */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-body-default text-body-default font-medium text-text-primary flex items-center gap-1.5">
                  <span>Delhi-NCR Eastern Peripheral Expressway</span>
                  <span className="font-caption text-caption text-risk-low bg-risk-low/10 px-1.5 py-0.2 rounded">94.2% Rescued</span>
                </span>
                <div className="text-right font-caption text-caption">
                  <span className="text-text-muted">₹52.0 L At-Risk</span>
                  <span className="text-text-primary font-medium ml-2">₹49.0 L Salvaged</span>
                </div>
              </div>
              <div className="w-full h-3 bg-surface-container-lowest rounded-full overflow-hidden flex">
                <div className="bg-primary-container h-full rounded-l-full transition-all duration-500" style={{ width: '94.2%' }}></div>
                <div className="bg-risk-high h-full rounded-r-full" style={{ width: '5.8%' }}></div>
              </div>
            </div>

            {/* Bengaluru-Chennai */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-body-default text-body-default font-medium text-text-primary flex items-center gap-1.5">
                  <span>Bengaluru-Chennai Tech & Pharma Belt</span>
                  <span className="font-caption text-caption text-risk-low bg-risk-low/10 px-1.5 py-0.2 rounded">73.6% Rescued</span>
                </span>
                <div className="text-right font-caption text-caption">
                  <span className="text-text-muted">₹32.6 L At-Risk</span>
                  <span className="text-text-primary font-medium ml-2">₹24.0 L Salvaged</span>
                </div>
              </div>
              <div className="w-full h-3 bg-surface-container-lowest rounded-full overflow-hidden flex">
                <div className="bg-primary-container h-full rounded-l-full transition-all duration-500" style={{ width: '73.6%' }}></div>
                <div className="bg-risk-high h-full rounded-r-full" style={{ width: '26.4%' }}></div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-3 gap-2 pt-3 bg-surface-container-low rounded-lg p-2.5 mt-2 border border-border-subtle">
            <div>
              <span className="font-caption text-caption text-text-muted block">Average Reroute ETA Shift</span>
              <span className="font-card-title text-card-title text-text-primary font-semibold">+38 mins (vs 4.2h delay)</span>
            </div>
            <div>
              <span className="font-caption text-caption text-text-muted block">Autonomous Intervention</span>
              <span className="font-card-title text-card-title text-risk-low font-semibold">36 / 48 (75.0%)</span>
            </div>
            <div>
              <span className="font-caption text-caption text-text-muted block">Operator Override Rate</span>
              <span className="font-card-title text-card-title text-text-primary font-semibold">4.1% (Low friction)</span>
            </div>
          </div>
        </div>

        {/* Operational Efficiency Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-section-title text-section-title text-text-primary">Operational Efficiency Breakdown</h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">Real-time telematics adherence vs baseline operational benchmarks</p>
            </div>
            <span className="font-caption text-caption text-text-muted bg-surface-container-low px-2 py-0.5 rounded">30-Day Mean</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            {/* Shift compliance */}
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col justify-between border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-muted uppercase">Driver Shift Adherence</span>
                <span className="material-symbols-outlined text-[16px] text-risk-low">timer</span>
              </div>
              <div className="my-1.5">
                <span className="font-kpi-val text-kpi-val text-text-primary">98.4%</span>
                <span className="font-caption text-caption text-risk-low block mt-0.5">0 Hours-of-Service Breaches</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
                <div className="bg-risk-low h-full" style={{ width: '98.4%' }}></div>
              </div>
            </div>

            {/* Fuel overhead */}
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col justify-between border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-muted uppercase">Fuel Overhead Index</span>
                <span className="material-symbols-outlined text-[16px] text-risk-medium">local_gas_station</span>
              </div>
              <div className="my-1.5">
                <span className="font-kpi-val text-kpi-val text-risk-medium">+4.1%</span>
                <span className="font-caption text-caption text-text-muted block mt-0.5">Target &lt; +6.0% Detour Fuel</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
                <div className="bg-risk-medium h-full" style={{ width: '68%' }}></div>
              </div>
            </div>

            {/* FASTag clearance */}
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col justify-between border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-muted uppercase">FASTag Toll Clearance</span>
                <span className="material-symbols-outlined text-[16px] text-primary">toll</span>
              </div>
              <div className="my-1.5">
                <span className="font-kpi-val text-kpi-val text-text-primary">99.1%</span>
                <span className="font-caption text-caption text-risk-low block mt-0.5">Avg Plaza Delay: 1.8m</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
                <div className="bg-primary-container h-full" style={{ width: '99.1%' }}></div>
              </div>
            </div>

            {/* IoT sensor integrity */}
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col justify-between border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-muted uppercase">IoT Sensor Integrity</span>
                <span className="material-symbols-outlined text-[16px] text-risk-low">sensors</span>
              </div>
              <div className="my-1.5">
                <span className="font-kpi-val text-kpi-val text-text-primary">99.9%</span>
                <span className="font-caption text-caption text-risk-low block mt-0.5">14.2M Heartbeats Verified</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
                <div className="bg-risk-low h-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-lg flex items-center justify-between text-xs border border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
              <span className="text-text-secondary">AI Dispatch Optimization Efficiency:</span>
            </div>
            <span className="font-mono text-primary font-semibold">Score: 98.2 / 100</span>
          </div>
        </div>
      </div>

      {/* Secondary Analytical Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Cold Chain Thermal Audit (4 Cols) */}
        <div className="lg:col-span-4 bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-primary-soft text-primary">
                  <span className="material-symbols-outlined text-[18px]">ac_unit</span>
                </div>
                <div>
                  <h3 className="font-section-title text-section-title text-text-primary">Cold Chain Thermal Audit</h3>
                  <span className="font-caption text-caption text-text-muted">GDP & ISO 17025 Regulatory Standard</span>
                </div>
              </div>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low">100% Compliant</span>
            </div>

            <div className="my-3 p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-border-subtle">
              <div>
                <span className="font-caption text-caption text-text-muted block">Monitored Pharma Shipments</span>
                <span className="font-kpi-val text-kpi-val text-text-primary">342 Loads</span>
              </div>
              <div className="text-right">
                <span className="font-caption text-caption text-text-muted block">Cargo Spoilage / Loss</span>
                <span className="font-card-title text-card-title text-risk-low font-semibold">₹0.00 Lost (0.0%)</span>
              </div>
            </div>

            {/* Excursion Duration Breakdown */}
            <div className="space-y-2.5">
              <span className="font-caption text-caption uppercase tracking-wider text-text-muted block">Thermal Deviation Duration Analysis</span>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                    <span>Normal Envelope (+2°C to +8°C)</span>
                  </span>
                  <span className="text-text-primary font-medium">99.2% (339 units)</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                  <div className="bg-risk-low h-full rounded-full" style={{ width: '99.2%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-risk-medium"></span>
                    <span>Minor Excursion (&lt;15 mins)</span>
                  </span>
                  <span className="text-text-primary font-medium">0.8% (3 units)</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                  <div className="bg-risk-medium h-full rounded-full" style={{ width: '0.8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-risk-critical"></span>
                    <span>Critical Excursion (&gt;45m Breach)</span>
                  </span>
                  <span className="text-text-primary font-medium">0.0% (0 units)</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                  <div className="bg-risk-critical h-full rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 bg-surface-container-lowest p-2.5 rounded-lg flex items-center justify-between border border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-risk-low">verified</span>
              <span className="font-caption text-caption text-text-muted">WHO GDP Audit Stamp ID:</span>
            </div>
            <span className="font-caption text-caption font-mono text-text-primary font-medium">GDP-2026-Q2-IN</span>
          </div>
        </div>

        {/* Carrier SLA Benchmark Scorecard (8 Cols) */}
        <div className="lg:col-span-8 bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-section-title text-section-title text-text-primary">Carrier & Fleet SLA Benchmark Scorecard</h3>
                <span className="font-caption text-caption text-text-muted px-2 py-0.5 bg-surface-container-low rounded">5 Contracted Operators</span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-0.5">Objective audit of carrier compliance across on-time delivery, detour cooperation, and thermal metrics</p>
            </div>
            <button
              onClick={() => triggerExport('Carrier SLA Scorecard')}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium cursor-pointer"
              type="button"
            >
              <span>Export Scorecard</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-default text-table-cell">
              <thead>
                <tr className="h-9 bg-bg-sidebar text-text-muted font-caption text-caption uppercase tracking-wider">
                  <th className="px-3 rounded-l-lg">Carrier Partner</th>
                  <th className="px-3">On-Time SLA</th>
                  <th className="px-3">Detour Compliance</th>
                  <th className="px-3">Temp Stability</th>
                  <th className="px-3">HOS Driver Score</th>
                  <th className="px-3">Penalty Deduction</th>
                  <th className="px-3 rounded-r-lg text-right">Audit Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 font-table-cell text-table-cell">
                <tr className="h-10 hover:bg-bg-surface-hover transition-colors">
                  <td className="px-3 font-medium text-text-primary flex items-center gap-2 py-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span>SupplyShield Dedicated</span>
                  </td>
                  <td className="px-3 font-mono font-medium text-risk-low">98.9%</td>
                  <td className="px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-text-primary">100%</span>
                      <span className="font-caption text-caption text-text-muted">(24/24)</span>
                    </div>
                  </td>
                  <td className="px-3 font-mono text-text-primary">99.9%</td>
                  <td className="px-3 font-mono text-text-primary">99.4%</td>
                  <td className="px-3 font-mono text-risk-low">₹0</td>
                  <td className="px-3 text-right">
                    <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">Prime Tier 1</span>
                  </td>
                </tr>

                <tr className="h-10 hover:bg-bg-surface-hover transition-colors bg-surface-container-low/40">
                  <td className="px-3 font-medium text-text-primary flex items-center gap-2 py-2">
                    <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                    <span>BlueDart Express</span>
                  </td>
                  <td className="px-3 font-mono font-medium text-risk-low">95.4%</td>
                  <td className="px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-text-primary">94.1%</span>
                      <span className="font-caption text-caption text-text-muted">(16/17)</span>
                    </div>
                  </td>
                  <td className="px-3 font-mono text-text-primary">99.1%</td>
                  <td className="px-3 font-mono text-text-primary">98.2%</td>
                  <td className="px-3 font-mono text-text-muted">₹14,500</td>
                  <td className="px-3 text-right">
                    <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low font-medium">Tier 1 Partner</span>
                  </td>
                </tr>

                <tr className="h-10 hover:bg-bg-surface-hover transition-colors">
                  <td className="px-3 font-medium text-text-primary flex items-center gap-2 py-2">
                    <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                    <span>VRL Logistics Intermodal</span>
                  </td>
                  <td className="px-3 font-mono font-medium text-risk-low">93.8%</td>
                  <td className="px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-text-primary">90.0%</span>
                      <span className="font-caption text-caption text-text-muted">(9/10)</span>
                    </div>
                  </td>
                  <td className="px-3 font-mono text-text-primary">98.7%</td>
                  <td className="px-3 font-mono text-text-primary">97.5%</td>
                  <td className="px-3 font-mono text-text-muted">₹28,200</td>
                  <td className="px-3 text-right">
                    <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low font-medium">Tier 1 Partner</span>
                  </td>
                </tr>

                <tr className="h-10 hover:bg-bg-surface-hover transition-colors bg-surface-container-low/40">
                  <td className="px-3 font-medium text-text-primary flex items-center gap-2 py-2">
                    <span className="w-2 h-2 rounded-full bg-risk-medium"></span>
                    <span>TCI Freight Carriers</span>
                  </td>
                  <td className="px-3 font-mono font-medium text-risk-medium">91.2%</td>
                  <td className="px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-text-primary">85.7%</span>
                      <span className="font-caption text-caption text-risk-medium">(6/7)</span>
                    </div>
                  </td>
                  <td className="px-3 font-mono text-text-primary">97.8%</td>
                  <td className="px-3 font-mono text-text-primary">96.0%</td>
                  <td className="px-3 font-mono text-risk-medium">₹62,000</td>
                  <td className="px-3 text-right">
                    <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-medium/10 text-risk-medium font-medium">Tier 2 Review</span>
                  </td>
                </tr>

                <tr className="h-10 hover:bg-bg-surface-hover transition-colors">
                  <td className="px-3 font-medium text-text-primary flex items-center gap-2 py-2">
                    <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                    <span>Safexpress 3PL</span>
                  </td>
                  <td className="px-3 font-mono font-medium text-risk-low">94.0%</td>
                  <td className="px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-text-primary">92.3%</span>
                      <span className="font-caption text-caption text-text-muted">(12/13)</span>
                    </div>
                  </td>
                  <td className="px-3 font-mono text-text-primary">99.0%</td>
                  <td className="px-3 font-mono text-text-primary">98.0%</td>
                  <td className="px-3 font-mono text-text-muted">₹18,000</td>
                  <td className="px-3 text-right">
                    <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low font-medium">Tier 1 Partner</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 pt-2 flex items-center justify-between text-xs text-text-muted">
            <span>* SLA Threshold defined at 92.0% on-time window with ±20 min tolerance.</span>
            <span className="text-text-secondary">Next Audit Cycle: July 01, 2026</span>
          </div>
        </div>
      </div>

      {/* Incident Log & Disruption Audit History Table */}
      <div className="bg-bg-surface rounded-xl p-4 shadow-sm border border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-section-title text-section-title text-text-primary">Incident Telemetry & Operator Audit History</h2>
              <span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container-low text-text-secondary font-medium">
                {filteredAuditLogs.length} Interventions Filtered
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              Cryptographically signed logs of all disruption bypass orders, autonomous reroutes, and cold-chain transfers.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">search</span>
              <input
                value={auditSearchTerm}
                onChange={e => setAuditSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-bg-app text-text-primary placeholder-text-muted rounded-md focus:outline-none focus:ring-1 focus:ring-primary-container w-64 border border-border-subtle"
                placeholder="Filter by Incident ID, Corridor, or Carrier..."
                type="text"
              />
            </div>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1 text-xs bg-surface-container-low text-text-secondary rounded border border-border-subtle focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-default text-table-cell">
            <thead>
              <tr className="h-9 bg-bg-sidebar text-text-muted font-caption text-caption uppercase tracking-wider">
                <th className="px-3 rounded-l-lg">Incident ID & Timestamp</th>
                <th className="px-3">Corridor & Chokepoint</th>
                <th className="px-3">Disruption Class</th>
                <th className="px-3">Impacted Fleet</th>
                <th className="px-3">Autonomous Action Taken</th>
                <th className="px-3">Protected Value</th>
                <th className="px-3">Human Approver</th>
                <th className="px-3 rounded-r-lg text-right">Audit Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 font-table-cell text-table-cell">
              {filteredAuditLogs.map((log, index) => (
                <tr
                  key={log.id}
                  className={`h-11 hover:bg-bg-surface-hover transition-colors ${
                    index % 2 === 1 ? 'bg-surface-container-low/40' : ''
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-text-primary">
                    <div className="font-semibold text-primary">{log.id}</div>
                    <span className="font-caption text-caption text-text-muted">{log.timestamp}</span>
                  </td>
                  <td className="px-3 text-text-secondary">
                    <span className="text-text-primary font-medium block">{log.corridor}</span>
                    <span className="font-caption text-caption text-text-muted">{log.corridorSub}</span>
                  </td>
                  <td className="px-3">
                    <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full flex items-center gap-1 w-max ${
                      log.disruptionType === 'critical'
                        ? 'bg-risk-critical/10 text-risk-critical'
                        : log.disruptionType === 'high'
                        ? 'bg-risk-high/10 text-risk-high'
                        : 'bg-risk-medium/10 text-risk-medium'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.disruptionType === 'critical'
                          ? 'bg-risk-critical'
                          : log.disruptionType === 'high'
                          ? 'bg-risk-high'
                          : 'bg-risk-medium'
                      }`}></span>
                      {log.disruptionClass}
                    </span>
                  </td>
                  <td className="px-3 font-mono text-text-primary">{log.impactedFleet}</td>
                  <td className="px-3 text-text-primary">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-risk-low">alt_route</span>
                      <span>{log.actionTaken}</span>
                    </div>
                    <span className="font-caption text-caption text-text-muted">{log.actionDetail}</span>
                  </td>
                  <td className="px-3 font-mono font-medium text-risk-low">{log.protectedValue}</td>
                  <td className="px-3 text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                      <span>{log.approver}</span>
                    </div>
                    <span className="font-caption text-caption text-text-muted">{log.approverRule}</span>
                  </td>
                  <td className="px-3 text-right">
                    <button
                      onClick={() => triggerExport(log.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-low hover:bg-bg-surface-hover text-xs font-mono text-text-primary hover:text-primary transition-colors border border-border-subtle cursor-pointer"
                      title="Download cryptographic audit proof"
                    >
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      <span>{log.hash}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
