import { useEffect, useState } from 'react'
import { getDashboardKpis, getShipments, getDisruptions } from '../services/api'
import type { DashboardKpis, Shipment, Disruption } from '../types/domain'

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [disruptions, setDisruptions] = useState<Disruption[]>([])

  useEffect(() => {
    getDashboardKpis().then(setKpis).catch(() => {})
    getShipments().then(setShipments).catch(() => {})
    getDisruptions().then(setDisruptions).catch(() => {})
  }, [])

  return (
    <>
      {/* Top Command Bar: Page Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-page-title text-page-title text-text-primary">Command Center</h1>
            <span className="px-2 py-0.5 rounded-full bg-risk-low/10 border border-risk-low/30 font-badge-label text-badge-label text-risk-low flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-ping"></span> Live Supabase Sync
            </span>
          </div>
          <p className="font-caption text-caption text-text-muted">Real-time Operations & Supply Chain Telemetry Engine</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-bg-surface rounded border border-border-subtle p-0.5">
            <button className="px-2.5 py-1 text-xs rounded font-medium bg-bg-surface-raised text-primary shadow-sm" type="button">All Corridors</button>
            <button className="px-2.5 py-1 text-xs rounded text-text-secondary hover:text-text-primary transition-colors" type="button">Asia-EU</button>
            <button className="px-2.5 py-1 text-xs rounded text-text-secondary hover:text-text-primary transition-colors" type="button">Transpacific</button>
          </div>
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded bg-bg-surface hover:bg-bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary text-xs transition-colors" type="button">
            <span className="material-symbols-outlined text-[15px]">filter_list</span>
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded bg-primary-container text-on-primary-container hover:bg-primary-hover text-xs font-medium transition-colors" type="button">
            <span className="material-symbols-outlined text-[15px]">add_alert</span>
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* 1. Top KPI Metric Cards Grid (Live Supabase Data) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1: Total Shipments */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">Total Shipments</span>
            <span className="material-symbols-outlined text-[18px] text-text-muted">local_shipping</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {kpis ? kpis.totalShipments : '…'}
            </span>
            <span className="font-badge-label text-badge-label text-risk-low flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>Active
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px]">
            <span>Live DB verified</span>
            <span className="text-risk-low font-medium">Multimodal</span>
          </div>
        </div>

        {/* KPI 2: Active Disruptions */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-risk-high"></div>
          <div className="flex items-center justify-between text-text-secondary pl-1">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">Active Disruptions</span>
            <span className="material-symbols-outlined text-[18px] text-risk-high">warning</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between pl-1">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {kpis ? kpis.activeDisruptions : '…'}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-risk-high/15 border border-risk-high/30 font-badge-label text-badge-label text-risk-high font-medium">
              High Severity
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px] pl-1">
            <span>Weather & Ports</span>
            <span className="text-risk-critical font-medium">Suez & Typhon</span>
          </div>
        </div>

        {/* KPI 3: At Risk Shipments */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-risk-critical"></div>
          <div className="flex items-center justify-between text-text-secondary pl-1">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">At Risk Shipments</span>
            <span className="material-symbols-outlined text-[18px] text-risk-critical">report_problem</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between pl-1">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {kpis ? kpis.atRiskShipments : '…'}
            </span>
            <span className="font-badge-label text-badge-label text-risk-critical flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px]">warning</span>Score &gt; 0.70
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px] pl-1">
            <span>Critical Pharma/Cargo</span>
            <span className="text-text-secondary">Needs Reroute</span>
          </div>
        </div>

        {/* KPI 4: Cold Chain Alerts */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-risk-medium"></div>
          <div className="flex items-center justify-between text-text-secondary pl-1">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">Cold Chain Alerts</span>
            <span className="material-symbols-outlined text-[18px] text-risk-medium">ac_unit</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between pl-1">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {kpis ? kpis.coldChainAlerts : '…'}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-risk-medium/15 border border-risk-medium/30 font-badge-label text-badge-label text-risk-medium font-medium">
              Excursion
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px] pl-1">
            <span>WHO 2°C–8°C limit</span>
            <span className="text-risk-medium font-medium">9.4°C Peak</span>
          </div>
        </div>

        {/* KPI 5: Idle Fleet Assets */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">Idle Fleet Assets</span>
            <span className="material-symbols-outlined text-[18px] text-text-muted">directions_boat</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {kpis ? kpis.idleFleetAssets : '…'}
            </span>
            <span className="font-badge-label text-badge-label text-text-secondary flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px]">check</span>Available
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px]">
            <span>Deployable fleet</span>
            <span className="text-risk-low font-medium">Reefer & Trucks</span>
          </div>
        </div>
      </div>

      {/* 2. Center Live Operational Grid: Map & Disruption Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 min-h-[540px]">
        {/* Live Map Monitoring Panel (7 Columns Desktop) */}
        <div className="xl:col-span-7 bg-bg-surface rounded-lg border border-border-subtle flex flex-col relative overflow-hidden group">
          {/* Map Header Controls Bar */}
          <div className="h-11 px-3 border-b border-border-subtle flex items-center justify-between bg-bg-surface z-10">
            <div className="flex items-center gap-2">
              <span className="font-card-title text-card-title text-text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">hub</span>
                Live Shipments & Corridors
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-caption font-caption text-text-secondary border border-border-subtle">
                Transit Nodes: 6 Active
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors" title="Layers" type="button">
                <span className="material-symbols-outlined text-[16px]">layers</span>
              </button>
              <button className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors" title="Traffic Density" type="button">
                <span className="material-symbols-outlined text-[16px]">traffic</span>
              </button>
              <button className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors" title="Center" type="button">
                <span className="material-symbols-outlined text-[16px]">my_location</span>
              </button>
              <button className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors" title="Fullscreen" type="button">
                <span className="material-symbols-outlined text-[16px]">fullscreen</span>
              </button>
            </div>
          </div>

          {/* Tactical Vector Canvas / Map Surface */}
          <div className="relative flex-1 bg-[#090e17] w-full min-h-[460px] select-none overflow-hidden">
            {/* SVG Map Cartography & Realtime Routes */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 740 460" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="40" id="tacGrid" patternUnits="userSpaceOnUse" width="40">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#172233" strokeWidth="0.75"></path>
                  <circle cx="0" cy="0" fill="#243142" r="1"></circle>
                </pattern>
                <radialGradient cx="50%" cy="50%" id="epicenterGlow" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.38"></stop>
                  <stop offset="70%" stopColor="#ef4444" stopOpacity="0.10"></stop>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"></stop>
                </radialGradient>
                <linearGradient id="bypassGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9"></stop>
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7"></stop>
                </linearGradient>
                <style>
                  {`
                    .flow-path { stroke-dasharray: 6, 6; animation: dashMove 18s linear infinite; }
                    .blocked-path { stroke-dasharray: 8, 5; animation: dashAlert 2s linear infinite; }
                    @keyframes dashMove { to { stroke-dashoffset: -200; } }
                    @keyframes dashAlert { to { stroke-dashoffset: 13; } }
                  `}
                </style>
              </defs>
              <rect fill="#090e17" height="100%" width="100%"></rect>
              <rect fill="url(#tacGrid)" height="100%" opacity="0.8" width="100%"></rect>
              <path d="M 40,80 Q 180,40 320,70 T 560,90 T 700,60 L 710,410 Q 520,430 350,390 T 50,420 Z" fill="#0d1420" stroke="#1a2536" strokeWidth="1.2"></path>
              <path d="M 190,50 L 150,140 L 170,230" fill="none" stroke="#243b55" strokeLinecap="round" strokeWidth="4"></path>
              <path className="flow-path" d="M 190,50 L 150,140 L 170,230" fill="none" opacity="0.8" stroke="#38bdf8" strokeWidth="1.8"></path>
              <path d="M 150,140 Q 230,220 320,380" fill="none" stroke="#1e2d42" strokeWidth="3"></path>
              <path d="M 470,360 L 320,380" fill="none" stroke="#22c55e" strokeDasharray="4,4" strokeOpacity="0.7" strokeWidth="2.5"></path>
              <path d="M 170,230 L 250,260" fill="none" stroke="#38bdf8" strokeLinecap="round" strokeWidth="3.5"></path>
              <path d="M 250,260 Q 320,270 410,240" fill="none" opacity="0.4" stroke="#ef4444" strokeLinecap="round" strokeWidth="4.5"></path>
              <path className="blocked-path" d="M 250,260 Q 320,270 410,240" fill="none" stroke="#ffb4ab" strokeWidth="2"></path>
              <path d="M 250,260 Q 290,190 360,190 T 410,240" fill="none" stroke="url(#bypassGrad)" strokeDasharray="5,3" strokeWidth="2.5"></path>
              <path d="M 410,240 L 320,380" fill="none" stroke="#243b55" strokeWidth="3.5"></path>
              <path className="flow-path" d="M 410,240 L 320,380" fill="none" opacity="0.7" stroke="#38bdf8" strokeWidth="1.5"></path>
              <circle cx="330" cy="255" fill="url(#epicenterGlow)" r="72"></circle>
              <circle className="animate-spin" cx="330" cy="255" fill="none" opacity="0.7" r="54" stroke="#ef4444" strokeDasharray="4,3" strokeWidth="1" style={{ transformOrigin: '330px 255px', animationDuration: '26s' }}></circle>
              <circle cx="330" cy="255" fill="#ef4444" fillOpacity="0.22" r="28" stroke="#ef4444" strokeWidth="1.5"></circle>
              
              <circle cx="170" cy="230" fill="#38bdf8" r="5" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#a8b3c2" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="end" x="160" y="220">Mumbai Hub</text>
              <circle cx="250" cy="260" fill="#f59e0b" r="5" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#dee2ed" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="end" x="240" y="280">Pune</text>
              <circle cx="330" cy="255" fill="#ef4444" r="10" stroke="#ffffff" strokeWidth="1.5"></circle>
              <text fill="#ffffff" fontFamily="Inter" fontSize="11" fontWeight="700" textAnchor="middle" x="330" y="259">A</text>
              <text fill="#ffb4ab" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="middle" x="330" y="282">NH-48 Flooding (Km 184)</text>
              <circle cx="410" cy="240" fill="#38bdf8" r="5" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#dee2ed" fontFamily="Inter" fontSize="11" fontWeight="600" x="424" y="244">Hyderabad Hub</text>
              <circle cx="320" cy="380" fill="#22c55e" r="6" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#dee2ed" fontFamily="Inter" fontSize="11" fontWeight="600" textAnchor="middle" x="320" y="402">Bangalore DC</text>
              <circle cx="470" cy="360" fill="#38bdf8" r="5" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#dee2ed" fontFamily="Inter" fontSize="11" fontWeight="600" x="482" y="364">Chennai Port</text>
              <circle cx="150" cy="140" fill="#38bdf8" r="5" stroke="#080d14" strokeWidth="2"></circle>
              <text fill="#a8b3c2" fontFamily="Inter" fontSize="11" fontWeight="500" textAnchor="end" x="140" y="138">Ahmedabad</text>

              <g transform="translate(290, 240)">
                <circle cx="0" cy="0" fill="#ef4444" r="9" stroke="#101722" strokeWidth="2"></circle>
                <path d="M -3,-2 L 3,-2 L 4,1 L -4,1 Z M -3,1 L -3,3 L -1,3 L -1,1 M 1,1 L 1,3 L 3,3 L 3,1" fill="#ffffff"></path>
              </g>
              <g transform="translate(425, 290)">
                <circle cx="0" cy="0" fill="#f59e0b" r="9" stroke="#101722" strokeWidth="2"></circle>
                <text fill="#000" fontSize="8" fontWeight="bold" textAnchor="middle" x="0" y="3">CC</text>
              </g>
              <g transform="translate(340, 192)">
                <circle cx="0" cy="0" fill="#2f6df6" r="8" stroke="#ffffff" strokeWidth="1.5"></circle>
                <circle cx="0" cy="0" fill="#ffffff" r="3"></circle>
              </g>
            </svg>

            {/* Dynamic Shipment Marker Overlay Chips on Map Canvas */}
            <div className="absolute left-4 top-4 bg-bg-surface-raised/95 border border-border-strong rounded-md p-2 shadow-lg backdrop-blur flex flex-col gap-1.5 z-20">
              <div className="flex items-center gap-1.5 font-caption text-caption text-text-primary">
                <span className="w-2 h-2 rounded-full bg-risk-critical animate-ping"></span>
                <span className="font-semibold text-error">CRITICAL CHOKEPOINT</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-tight max-w-[190px]">
                NH-48 submerged under 2.4m floodwater. 17 commercial freights in stall zone.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-1.5 py-0.5 rounded bg-bg-surface text-[10px] text-primary border border-border-subtle">Detour B ready</span>
                <span className="text-[10px] text-text-muted">+1.2 hrs delay</span>
              </div>
            </div>

            {/* Floating Live Map Legend (top right) */}
            <div className="absolute right-3 top-3 bg-bg-surface/95 border border-border-subtle rounded-lg p-2.5 shadow-md backdrop-blur z-20 w-44">
              <div className="font-caption text-[11px] uppercase tracking-wider text-text-muted font-semibold pb-1.5 border-b border-border-subtle mb-1.5 flex items-center justify-between">
                <span>Disruptions on Map</span>
                <span className="material-symbols-outlined text-[14px]">tune</span>
              </div>
              <div className="flex flex-col gap-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-risk-critical"></span>
                    <span className="text-text-primary">High Impact</span>
                  </div>
                  <span className="font-medium text-risk-critical">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-risk-medium"></span>
                    <span className="text-text-primary">Medium Impact</span>
                  </div>
                  <span className="font-medium text-risk-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-risk-low"></span>
                    <span className="text-text-primary">Low Impact</span>
                  </div>
                  <span className="font-medium text-risk-low">2</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-b-2 border-dashed border-risk-critical inline-block"></span>
                    <span className="text-text-secondary">Blocked Corridor</span>
                  </div>
                  <span className="text-text-muted">1</span>
                </div>
              </div>
            </div>

            {/* Map Zoom & Pan Control Floaters (bottom right) */}
            <div className="absolute right-3 bottom-3 flex flex-col gap-1 bg-bg-surface-raised rounded border border-border-subtle p-0.5 z-20 shadow">
              <button aria-label="Zoom in" className="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors rounded" type="button">
                <span className="material-symbols-outlined text-[15px]">add</span>
              </button>
              <div className="h-px bg-border-subtle"></div>
              <button aria-label="Zoom out" className="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors rounded" type="button">
                <span className="material-symbols-outlined text-[15px]">remove</span>
              </button>
            </div>

            {/* Map Bottom Ticker for Selected Zone */}
            <div className="absolute left-3 bottom-3 bg-bg-surface/90 border border-border-subtle px-2.5 py-1 rounded text-caption text-text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-risk-medium">alt_route</span>
              <span>Simulation Active: Solapur Bypass Recommended</span>
              <span className="text-text-disabled">•</span>
              <span className="text-risk-low">Saves 4.2 hrs</span>
            </div>
          </div>
        </div>

        {/* Right Disruption Detail Panel / Selected Incident Drawer (5 Columns Desktop) */}
        <div className="xl:col-span-5 bg-bg-surface rounded-lg border border-border-subtle flex flex-col justify-between overflow-hidden">
          <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-surface-container-low">
            <button className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors font-medium" type="button">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Disruptions</span>
            </button>
            <div className="flex items-center gap-2">
              <button className="h-7 px-2 rounded border border-border-subtle text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors flex items-center gap-1" type="button">
                <span className="material-symbols-outlined text-[14px]">share</span>
                <span>Share</span>
              </button>
              <button className="h-7 px-3 rounded bg-primary-container hover:bg-primary-hover text-on-primary-container text-xs font-medium transition-colors flex items-center gap-1 shadow-sm" type="button">
                <span className="material-symbols-outlined text-[14px]">sync</span>
                <span>Update</span>
              </button>
            </div>
          </div>
          
          <div className="p-3.5 border-b border-border-subtle">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-section-title text-section-title text-text-primary font-semibold">NH-48 Flooding</h2>
                  <span className="px-2 py-0.5 rounded-full bg-risk-critical/15 border border-risk-critical/30 font-badge-label text-badge-label text-risk-critical font-medium">
                    High Impact
                  </span>
                </div>
                <p className="font-caption text-caption text-text-muted mt-0.5">Pune → Hyderabad Transit Corridor (Km 182 - 210)</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-risk-low/10 border border-risk-low/30 text-[11px] text-risk-low font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse"></span> Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border-subtle/60 text-xs">
              <div>
                <span className="font-caption text-[11px] text-text-muted block">Started At</span>
                <span className="font-medium text-text-primary">12 May 2024, 08:30 AM</span>
              </div>
              <div>
                <span className="font-caption text-[11px] text-text-muted block">Expected To End</span>
                <span className="font-medium text-text-primary">14 May 2024, 08:30 PM</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 border-b border-border-subtle bg-bg-surface-raised divide-x divide-border-subtle text-center">
            <div className="p-2.5">
              <span className="font-caption text-[11px] text-text-muted block truncate">Affected</span>
              <span className="text-base font-semibold text-text-primary mt-0.5 block">17</span>
              <span className="text-[10px] text-text-muted">Shipments</span>
            </div>
            <div className="p-2.5 bg-risk-critical/5">
              <span className="font-caption text-[11px] text-error block truncate">Critical</span>
              <span className="text-base font-semibold text-risk-critical mt-0.5 block">4</span>
              <span className="text-[10px] text-error/80">Priority 1</span>
            </div>
            <div className="p-2.5">
              <span className="font-caption text-[11px] text-text-muted block truncate">At Risk Value</span>
              <span className="text-base font-semibold text-text-primary mt-0.5 block">₹2.4 Cr</span>
              <span className="text-[10px] text-text-secondary">Commercial</span>
            </div>
            <div className="p-2.5">
              <span className="font-caption text-[11px] text-text-muted block truncate">Delay Risk</span>
              <span className="text-base font-semibold text-risk-high mt-0.5 block">High</span>
              <span className="text-[10px] text-text-muted">+5.4h avg</span>
            </div>
          </div>

          <div className="px-3 pt-2 border-b border-border-subtle flex items-center justify-between bg-bg-surface">
            <div className="flex items-center gap-4 text-xs font-medium">
              <button className="pb-2 border-b-2 border-primary-container text-primary" type="button">
                Active Shipments ({shipments.length})
              </button>
              <button className="pb-2 border-b-2 border-transparent text-text-secondary hover:text-text-primary transition-colors" type="button">
                Corridor Disruptions ({disruptions.length})
              </button>
            </div>
            <span className="text-[11px] text-text-muted">Live DB Sync</span>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[175px]">
            <table className="w-full text-left border-collapse text-table-cell font-table-cell">
              <thead>
                <tr className="h-8 bg-surface-container-lowest text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
                  <th className="px-3 py-1 font-medium">Tracking #</th>
                  <th className="px-2 py-1 font-medium">Origin → Destination</th>
                  <th className="px-2 py-1 font-medium text-center">Carrier</th>
                  <th className="px-2 py-1 font-medium text-center">Risk Score</th>
                  <th className="px-2 py-1 font-medium">Status</th>
                  <th className="px-3 py-1 font-medium text-right">Cold Chain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-xs">
                {shipments.map((s) => (
                  <tr key={s.id} className="h-10 hover:bg-bg-surface-hover transition-colors">
                    <td className="px-3 py-1.5 font-medium text-primary flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'AT_RISK' || s.status === 'DELAYED' ? 'bg-risk-critical' : 'bg-risk-low'}`}></span>
                      <span>{s.trackingNumber}</span>
                    </td>
                    <td className="px-2 py-1.5 text-text-secondary truncate max-w-[150px]">{s.origin} → {s.destination}</td>
                    <td className="px-2 py-1.5 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-bg-surface border border-border-subtle font-mono text-text-primary">{s.carrier}</span>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <span className={`font-semibold text-[11px] ${s.riskScore && s.riskScore >= 0.7 ? 'text-risk-critical' : s.riskScore && s.riskScore >= 0.4 ? 'text-risk-medium' : 'text-risk-low'}`}>
                        {s.riskScore !== null ? `${(s.riskScore * 100).toFixed(0)}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${s.status === 'AT_RISK' ? 'bg-risk-critical/10 text-risk-critical border border-risk-critical/30' : s.status === 'DELAYED' ? 'bg-risk-high/15 text-risk-high border border-risk-high/30' : 'bg-risk-low/10 text-risk-low border border-risk-low/30'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {s.isColdChain ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 font-medium">
                          ❄️ 2°C–8°C
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted">Ambient</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-surface-container-lowest border-t border-border-subtle flex items-center justify-between">
            <span className="text-caption text-text-muted">Showing all {shipments.length} live shipments</span>
            <a className="text-xs text-primary hover:underline font-medium flex items-center gap-1" href="/shipments">
              <span>View full Shipments page</span>
              <span className="material-symbols-outlined text-[14px]">east</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Bottom Analytical Cards Grid (3 Bespoke Dense Panels) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Bottom Card 1: Top Disruptions */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-risk-critical">report</span>
                <h3 className="font-card-title text-card-title text-text-primary">Top Disruptions</h3>
              </div>
              <a className="font-caption text-caption text-primary hover:underline" href="#">View all (7)</a>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2 rounded bg-surface-container-low border border-border-subtle flex items-center justify-between hover:border-border-strong transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-risk-critical flex-shrink-0"></div>
                  <div className="min-w-0">
                    <div className="font-body-default text-xs font-semibold text-text-primary truncate">NH-48 Flooding</div>
                    <div className="font-caption text-[11px] text-text-muted truncate">Pune → Hyderabad Corridor</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-risk-critical/15 border border-risk-critical/30 font-badge-label text-[10px] text-risk-critical whitespace-nowrap">High Impact</span>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border-subtle/70 flex items-center justify-between text-caption text-[11px] text-text-muted">
            <span className="flex items-center gap-1 text-risk-critical">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-critical"></span> 2 Unmitigated
            </span>
            <span>Avg resolution: 18 hrs</span>
          </div>
        </div>

        {/* Bottom Card 2: Critical Actions */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-primary">neurology</span>
                <h3 className="font-card-title text-card-title text-text-primary">Critical Actions</h3>
                <span className="px-1.5 py-0.2 rounded bg-primary-soft text-[10px] text-primary font-medium">AI Guard</span>
              </div>
              <a className="font-caption text-caption text-primary hover:underline" href="#">View all</a>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2 rounded bg-surface-container-low border border-border-subtle flex items-center justify-between hover:border-border-strong transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-risk-critical flex-shrink-0">alt_route</span>
                  <div className="min-w-0">
                    <div className="font-body-default text-xs font-semibold text-text-primary truncate">SH-102 Reroute via Route B</div>
                    <div className="font-caption text-[11px] text-text-muted truncate mt-0.5">Avoid NH-48. Save 4.2 hrs. +₹8,400</div>
                  </div>
                </div>
                <button className="px-2 py-1 rounded bg-primary-container hover:bg-primary-hover text-on-primary-container text-[11px] font-medium transition-colors" type="button">Approve</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Card 3: Network Pulse */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-risk-low">health_and_safety</span>
                <h3 className="font-card-title text-card-title text-text-primary">Network Pulse</h3>
              </div>
              <span className="font-caption text-caption text-text-muted">Last 24h</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">On-Time Delivery</span>
                <span className="font-medium text-risk-low">94.2%</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5">
                <div className="bg-risk-low h-1.5 rounded-full" style={{ width: '94.2%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
