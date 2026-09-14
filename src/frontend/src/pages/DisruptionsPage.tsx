import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface IncidentItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'flood' | 'congestion' | 'cyclone' | 'strike';
  corridor: string;
  description: string;
  trucksCount: number;
  cargoValue: string;
  delayEst: string;
  bypass: string;
  aiConfidence: number;
  icon: string;
}

const incidentsData: IncidentItem[] = [
  {
    id: 'DIS-2024-881',
    title: 'NH-48 Severe Water Inundation (Km 182-210)',
    severity: 'CRITICAL',
    category: 'flood',
    corridor: 'NH-48',
    description: 'Submersion of four-lane carriageway in Krishna river tributary basin. Total carriageway closure ordered by Kolhapur DM.',
    trucksCount: 17,
    cargoValue: '₹2.40 Cr',
    delayEst: '+5.4h',
    bypass: 'Solapur Bypass (SH-142) Available',
    aiConfidence: 96.8,
    icon: 'flood',
  },
  {
    id: 'DIS-2024-884',
    title: 'NH-65 Heavy Freight Bottleneck (Omerga Border)',
    severity: 'HIGH',
    category: 'congestion',
    corridor: 'NH-65',
    description: 'Overturned double-axle bulk container caused 9km single-lane queue. State highway patrol clearing salvage crane.',
    trucksCount: 14,
    cargoValue: '₹1.85 Cr',
    delayEst: '+2.8h',
    bypass: 'Detour Ready (+28 km)',
    aiConfidence: 91.4,
    icon: 'traffic',
  },
  {
    id: 'DIS-2024-879',
    title: 'JNPT Navi Mumbai Terminal Berth Congestion',
    severity: 'MEDIUM',
    category: 'congestion',
    corridor: 'NH-48',
    description: 'Crane mechanical fault at GTI Terminal berth 3 causing vessel turnaround buffer delays of 14 hours.',
    trucksCount: 10,
    cargoValue: '₹1.59 Cr',
    delayEst: '+6.2h',
    bypass: 'Buffer Absorbed',
    aiConfidence: 88.5,
    icon: 'directions_boat',
  },
  {
    id: 'DIS-2024-888',
    title: 'NH-16 Coastal Cyclone Feeder Inundation',
    severity: 'MEDIUM',
    category: 'cyclone',
    corridor: 'NH-16',
    description: 'IMD warning for squalls up to 65km/h and waterlogging across lower Godavari delta crossing.',
    trucksCount: 8,
    cargoValue: '₹95 Lakh',
    delayEst: '+3.5h',
    bypass: 'Inland NH-65 Detour Active',
    aiConfidence: 89.2,
    icon: 'cyclone',
  },
  {
    id: 'DIS-2024-890',
    title: 'Hosur Toll Plaza Inter-State Checkpost Strike',
    severity: 'LOW',
    category: 'strike',
    corridor: 'NH-44',
    description: 'Local union demonstration blocking 2 commercial toll lanes. RTO clearance expedited via dedicated Fastag green lane.',
    trucksCount: 5,
    cargoValue: '₹62 Lakh',
    delayEst: '+1.2h',
    bypass: 'Green Lane Bypass Open',
    aiConfidence: 94.0,
    icon: 'block',
  },
];

export default function DisruptionsPage() {
  const navigate = useNavigate();
  const [selectedCorridor, setSelectedCorridor] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapMode, setMapMode] = useState<'vector' | 'infrared' | 'hydrology'>('vector');
  const [activeIncidentId, setActiveIncidentId] = useState<string>('DIS-2024-881');
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [notificationSent, setNotificationSent] = useState<boolean>(false);

  const activeIncident = incidentsData.find((i) => i.id === activeIncidentId) || incidentsData[0];

  const filteredIncidents = incidentsData.filter((item) => {
    if (selectedCorridor !== 'all' && item.corridor !== selectedCorridor) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.corridor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Top Operational Header Bar with Corridor Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-risk-critical/15 flex items-center justify-center text-risk-critical border border-risk-critical/20">
            <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                National Corridor Disruption Radar
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical border border-risk-critical/30 font-semibold">
                ACTIVE EMERGENCIES
              </span>
              <span className="font-caption text-caption text-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-ping"></span>
                Telemetry Synced: 38s ago
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              AI Geo-Corridor monitoring: West-South Logistic Grids • NHAI, INCOIS &amp; IMD radar telemetry active
            </span>
          </div>
        </div>

        {/* Quick Corridor Switcher */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-caption text-caption text-text-muted uppercase tracking-wider mr-1 font-semibold">
            Corridor Filter
          </span>
          <button
            onClick={() => setSelectedCorridor('all')}
            className={`px-2.5 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 shadow-sm transition-colors ${selectedCorridor === 'all'
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle'
              }`}
            type="button"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            All Corridors (7)
          </button>
          <button
            onClick={() => setSelectedCorridor('NH-48')}
            className={`px-2.5 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors ${selectedCorridor === 'NH-48'
                ? 'bg-risk-critical/20 text-risk-critical border border-risk-critical/40 font-semibold'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle'
              }`}
            type="button"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-risk-critical"></span>
            NH-48 Western
          </button>
          <button
            onClick={() => setSelectedCorridor('NH-65')}
            className={`px-2.5 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors ${selectedCorridor === 'NH-65'
                ? 'bg-risk-high/20 text-risk-high border border-risk-high/40 font-semibold'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle'
              }`}
            type="button"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-risk-high"></span>
            NH-65 Deccan
          </button>
          <button
            onClick={() => setSelectedCorridor('NH-16')}
            className={`px-2.5 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors ${selectedCorridor === 'NH-16'
                ? 'bg-risk-medium/20 text-risk-medium border border-risk-medium/40 font-semibold'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle'
              }`}
            type="button"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-risk-medium"></span>
            NH-16 Eastern Coast
          </button>
        </div>
      </div>

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* KPI 1 */}
        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Active Disruptions
            </span>
            <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical font-semibold">
              2 Critical
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">7</span>
            <div className="flex items-center gap-1 text-risk-high font-caption text-caption font-medium">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+2 in 4h</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-auto pt-1">
            <div className="w-full h-1.5 bg-surface-container-high rounded-full flex overflow-hidden">
              <div className="bg-risk-critical h-full w-[29%]"></div>
              <div className="bg-risk-high h-full w-[43%]"></div>
              <div className="bg-risk-medium h-full w-[28%]"></div>
            </div>
            <div className="flex justify-between font-caption text-caption text-text-disabled text-[10px]">
              <span className="text-risk-critical font-medium">2 Crit</span>
              <span className="text-risk-high font-medium">3 High</span>
              <span className="text-risk-medium font-medium">2 Med</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Affected Shipments
            </span>
            <span className="material-symbols-outlined text-text-muted text-[18px]">local_shipping</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">
              41 <span className="text-xs font-normal text-text-muted">units</span>
            </span>
            <span className="font-caption text-caption text-risk-critical font-medium bg-risk-critical/10 px-1.5 py-0.5 rounded border border-risk-critical/20">
              ₹5.84 Cr Risk
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption mt-auto pt-1">
            <div className="w-2 h-2 rounded-full bg-risk-high flex-shrink-0"></div>
            <span className="truncate">19 High-Priority Medical / Cold</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Blocked Corridors
            </span>
            <span className="material-symbols-outlined text-risk-critical text-[18px]">alt_route</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">
              3 <span className="text-xs font-normal text-text-muted">Primary NH</span>
            </span>
            <span className="font-caption text-caption text-text-secondary">26 Detours</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption mt-auto pt-1">
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-risk-critical font-semibold text-[10px]">
              NH-48
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-risk-high font-semibold text-[10px]">
              NH-65
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-risk-medium font-semibold text-[10px]">
              NH-16
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Avg Resolution Time
            </span>
            <span className="material-symbols-outlined text-risk-low text-[18px]">schedule</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">
              4.8 <span className="text-xs font-normal text-text-muted">hours</span>
            </span>
            <span className="font-caption text-caption text-risk-low font-medium bg-risk-low/10 px-1.5 py-0.5 rounded border border-risk-low/20">
              -18% AI Speed
            </span>
          </div>
          <div className="space-y-1 mt-auto pt-1">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-risk-low h-full w-[78%]"></div>
            </div>
            <div className="flex justify-between text-[10px] font-caption text-caption text-text-disabled">
              <span>Current: 4.8h</span>
              <span>Baseline: 5.9h</span>
            </div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle hover:border-border-strong transition-colors relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              AI Reroute Confidence
            </span>
            <span className="material-symbols-outlined text-primary text-[18px]">neurology</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-kpi-val text-kpi-val text-primary">94.2%</span>
            <span className="font-caption text-caption text-primary bg-primary/20 px-2 py-0.5 rounded-full font-medium">
              Auto-ready
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-caption text-caption text-text-secondary mt-auto pt-1">
            <span className="material-symbols-outlined text-[14px] text-risk-low flex-shrink-0">check_circle</span>
            <span className="truncate">24 Dispatched • 17 Pending</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Pane Workspace: Left Map & Incidents + Right Action Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT & CENTER WORKSPACE (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* Interactive Corridor Disruption Map View */}
          <div className="bg-bg-surface rounded-xl overflow-hidden shadow-lg flex flex-col border border-border-subtle">
            {/* Map Header Toolbar */}
            <div className="px-4 py-3 bg-surface-container-lowest flex items-center justify-between gap-3 border-b border-border-subtle">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">hub</span>
                </div>
                <span className="font-card-title text-card-title text-text-primary truncate">
                  Live Corridor Telemetry &amp; Detour Matrix
                </span>
                <span className="font-caption text-caption text-text-muted hidden sm:inline truncate">
                  • Sector: MH-KA-TS Western Freight Spine
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center bg-bg-surface rounded-lg p-1 border border-border-subtle gap-1">
                  <button
                    onClick={() => setMapMode('vector')}
                    className={`px-2.5 py-1 rounded-md font-caption text-caption leading-none transition-colors ${mapMode === 'vector'
                        ? 'bg-primary-container text-text-primary font-medium shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                    type="button"
                  >
                    Vector
                  </button>
                  <button
                    onClick={() => setMapMode('infrared')}
                    className={`px-2.5 py-1 rounded-md font-caption text-caption leading-none transition-colors ${mapMode === 'infrared'
                        ? 'bg-primary-container text-text-primary font-medium shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                    type="button"
                  >
                    Infrared
                  </button>
                  <button
                    onClick={() => setMapMode('hydrology')}
                    className={`px-2.5 py-1 rounded-md font-caption text-caption leading-none transition-colors ${mapMode === 'hydrology'
                        ? 'bg-primary-container text-text-primary font-medium shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                    type="button"
                  >
                    Hydrology
                  </button>
                </div>
                <button
                  aria-label="Layers"
                  className="p-1.5 rounded-lg bg-bg-surface hover:bg-bg-surface-hover text-text-secondary border border-border-subtle transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">layers</span>
                </button>
              </div>
            </div>

            {/* Visual Map Canvas SVG */}
            <div className="relative w-full h-[400px] bg-[#070b12] overflow-hidden select-none">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

              <svg className="w-full h-full" fill="none" viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient cx="50%" cy="50%" id="floodGlow" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#ef4444" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient cx="50%" cy="50%" id="cycloneGlow" r="50%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </radialGradient>
                  <filter height="140%" id="glowEffect" width="140%" x="-20%" y="-20%">
                    <feGaussianBlur result="blur" stdDeviation="3" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Regional Waterways */}
                <path
                  d="M120 180 Q 280 230 420 215 T 720 290"
                  opacity="0.6"
                  stroke={mapMode === 'hydrology' ? '#38bdf8' : '#172554'}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
                <path
                  d="M380 40 Q 420 150 510 230 T 630 380"
                  opacity="0.4"
                  stroke={mapMode === 'hydrology' ? '#38bdf8' : '#172554'}
                  strokeWidth="4"
                />

                {/* Active Weather Impact Radius */}
                <circle cx="345" cy="205" fill="url(#floodGlow)" r="75" />
                <circle
                  className="animate-pulse"
                  cx="345"
                  cy="205"
                  opacity="0.8"
                  r="75"
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />

                {/* Coastal Cyclone Radius */}
                <circle cx="780" cy="250" fill="url(#cycloneGlow)" r="60" />
                <circle cx="780" cy="250" opacity="0.7" r="60" stroke="#f97316" strokeDasharray="4 4" strokeWidth="1" />

                {/* Clear Corridor */}
                <path
                  d="M260 260 L 320 340 L 460 370"
                  opacity="0.85"
                  stroke="#22c55e"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
                <path d="M130 140 L 230 180" stroke="#22c55e" strokeLinecap="round" strokeWidth="3.5" />

                {/* Blocked Route Segment */}
                <path
                  d="M230 180 L 345 205 L 430 220 L 590 210"
                  stroke="#ef4444"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />

                {/* AI Recommended Bypass: Solapur Detour */}
                <path
                  d="M230 180 Q 300 130 450 140 T 590 210"
                  stroke="#2f6df6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3.5"
                />

                {/* Alternative NH-65 Slowdown */}
                <path d="M590 210 L 680 180 L 760 140" stroke="#f59e0b" strokeLinecap="round" strokeWidth="2.5" />
                <path d="M780 140 L 790 250 L 750 360" stroke="#f97316" strokeDasharray="4 4" strokeWidth="3" />

                {/* Vehicles */}
                <g transform="translate(320, 142)">
                  <rect fill="#101722" height="20" opacity="0.85" rx="4" stroke="#2f6df6" strokeWidth="1" width="105" x="-4" y="-10" />
                  <circle cx="6" cy="0" fill="#2f6df6" r="4" />
                  <circle className="animate-ping" cx="6" cy="0" opacity="0.6" r="8" stroke="#2f6df6" strokeWidth="1.5" />
                  <text fill="#dbe1ff" fontFamily="Inter" fontSize="9" fontWeight="600" x="16" y="3">
                    TRK-8821 [Detour]
                  </text>
                </g>

                <g transform="translate(425, 138)">
                  <rect fill="#101722" height="18" opacity="0.85" rx="4" stroke="#334155" strokeWidth="1" width="68" x="-4" y="-9" />
                  <circle cx="5" cy="0" fill="#2f6df6" r="3.5" />
                  <text fill="#a8b3c2" fontFamily="Inter" fontSize="9" x="14" y="3">
                    TRK-4902
                  </text>
                </g>

                {/* Stranded Vehicle in Hazard Zone */}
                <g transform="translate(340, 205)">
                  <circle cx="0" cy="0" fill="#ef4444" filter="url(#glowEffect)" r="7" />
                  <circle className="animate-ping" cx="0" cy="0" opacity="0.4" r="14" stroke="#ef4444" strokeWidth="1.5" />
                  <rect fill="#ffffff" height="6" width="6" x="-3" y="-3" />
                </g>

                {/* Regional Nodes */}
                {/* Mumbai */}
                <g transform="translate(130, 140)">
                  <rect fill="#101722" height="36" opacity="0.9" rx="6" stroke="#243142" strokeWidth="1" width="120" x="-16" y="-18" />
                  <circle cx="0" cy="0" fill="#1e293b" r="6" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="0" cy="0" fill="#38bdf8" r="2.5" />
                  <text fill="#f3f6fa" fontFamily="Inter" fontSize="10" fontWeight="600" x="12" y="-2">
                    Mumbai (JNPT)
                  </text>
                  <text fill="#a8b3c2" fontFamily="Inter" fontSize="8.5" x="12" y="11">
                    Port Clear • 92% Flw
                  </text>
                </g>

                {/* Pune */}
                <g transform="translate(230, 180)">
                  <rect fill="#101722" height="22" opacity="0.9" rx="5" stroke="#243142" strokeWidth="1" width="96" x="-14" y="-11" />
                  <circle cx="0" cy="0" fill="#1e293b" r="5.5" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="0" cy="0" fill="#38bdf8" r="2.5" />
                  <text fill="#f3f6fa" fontFamily="Inter" fontSize="10" fontWeight="600" x="10" y="3">
                    Pune Gateway
                  </text>
                </g>

                {/* Solapur Bypass */}
                <g transform="translate(450, 140)">
                  <rect fill="#101722" height="36" opacity="0.9" rx="6" stroke="#2f6df6" strokeWidth="1" width="124" x="-14" y="-18" />
                  <circle cx="0" cy="0" fill="#1e293b" r="6" stroke="#2f6df6" strokeWidth="2" />
                  <circle cx="0" cy="0" fill="#2f6df6" r="2.5" />
                  <text fill="#b3c5ff" fontFamily="Inter" fontSize="10" fontWeight="600" x="12" y="-2">
                    Solapur Bypass
                  </text>
                  <text fill="#22c55e" fontFamily="Inter" fontSize="8.5" fontWeight="500" x="12" y="11">
                    Detour Open (Fast)
                  </text>
                </g>

                {/* Hyderabad */}
                <g transform="translate(590, 210)">
                  <rect fill="#101722" height="36" opacity="0.9" rx="6" stroke="#243142" strokeWidth="1" width="120" x="-14" y="-18" />
                  <circle cx="0" cy="0" fill="#1e293b" r="6" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="0" cy="0" fill="#38bdf8" r="2.5" />
                  <text fill="#f3f6fa" fontFamily="Inter" fontSize="10" fontWeight="600" x="12" y="-2">
                    Hyderabad Hub
                  </text>
                  <text fill="#a8b3c2" fontFamily="Inter" fontSize="8.5" x="12" y="11">
                    Receiving Detours
                  </text>
                </g>

                {/* Bengaluru */}
                <g transform="translate(460, 366)">
                  <rect fill="#101722" height="22" opacity="0.9" rx="5" stroke="#243142" strokeWidth="1" width="112" x="-14" y="-11" />
                  <circle cx="0" cy="0" fill="#1e293b" r="5.5" stroke="#22c55e" strokeWidth="2" />
                  <circle cx="0" cy="0" fill="#22c55e" r="2.5" />
                  <text fill="#f3f6fa" fontFamily="Inter" fontSize="10" fontWeight="600" x="10" y="3">
                    Bengaluru Central
                  </text>
                </g>

                {/* Chennai */}
                <g transform="translate(740, 350)">
                  <rect fill="#101722" height="22" opacity="0.9" rx="5" stroke="#243142" strokeWidth="1" width="102" x="-14" y="-11" />
                  <circle cx="0" cy="0" fill="#1e293b" r="5.5" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="0" cy="0" fill="#f59e0b" r="2.5" />
                  <text fill="#f3f6fa" fontFamily="Inter" fontSize="10" fontWeight="600" x="10" y="3">
                    Chennai Ennore
                  </text>
                </g>

                {/* Chokepoint Callout Pin */}
                <g transform="translate(345, 205)">
                  <rect fill="#141d29" height="40" rx="6" stroke="#ef4444" strokeWidth="1.5" width="154" x="-77" y="-54" />
                  <polygon fill="#141d29" points="0,-14 -6,-20 6,-20" />
                  <text fill="#ef4444" fontFamily="Inter" fontSize="9.5" fontWeight="700" x="-67" y="-38">
                    NH-48 KM 182-210
                  </text>
                  <text fill="#dee2ed" fontFamily="Inter" fontSize="8.5" x="-67" y="-23">
                    Water Depth: 2.4m | BLOCKED
                  </text>
                </g>
              </svg>

              {/* Floating Legend */}
              <div className="absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm p-3 rounded-lg flex flex-col gap-1.5 shadow-md border border-border-subtle">
                <span className="font-caption text-caption text-text-disabled uppercase font-semibold text-[10px]">
                  Corridor Status Legend
                </span>
                <div className="flex items-center gap-3.5 text-text-secondary font-caption text-caption flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-risk-low rounded"></span> Free Flow
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-risk-medium rounded"></span> Moderate Delay
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-risk-critical rounded border-t border-dashed border-white"></span> Severe / Choked
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-primary-container rounded"></span> AI Active Reroute
                  </span>
                </div>
              </div>

              {/* Real-Time Radar Scanner Badge */}
              <div className="absolute top-3 right-3 bg-bg-surface-raised/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-border-subtle shadow-md">
                <span className="material-symbols-outlined text-risk-critical text-[16px] animate-pulse">radar</span>
                <span className="font-caption text-caption text-text-primary font-medium text-[11px]">
                  IMD Radar: Heavy Cloudburst Cell Moving SE (32km/h)
                </span>
              </div>
            </div>

            {/* Chokepoint Elevation & Hydrology Cross-Section */}
            <div className="p-4 bg-surface-container-lowest/70 flex flex-col gap-3 border-t border-border-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-status-info/10 text-status-info flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">water</span>
                  </div>
                  <span className="font-card-title text-card-title text-text-primary">
                    Chokepoint Elevation &amp; Hydrology Cross-Section
                  </span>
                  <span className="font-caption text-caption text-text-muted">(NH-48 Sector: Km 175 to Km 225)</span>
                </div>
                <span className="font-caption text-caption text-risk-critical font-semibold bg-risk-critical/15 border border-risk-critical/30 px-2.5 py-1 rounded-full w-fit">
                  Current Flood Level: +2.4m Over Road Surface
                </span>
              </div>

              {/* Dynamic SVG Cross Section */}
              <div className="w-full h-24 bg-bg-surface rounded-lg p-2 relative overflow-hidden border border-border-subtle">
                <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 700 80">
                  <path
                    d="M0 65 L 120 62 L 200 68 L 300 75 L 350 78 L 400 75 L 500 66 L 620 58 L 700 55"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="2"
                  />
                  <path
                    d="M0 60 L 120 57 L 200 63 L 300 70 L 350 73 L 400 70 L 500 61 L 620 53 L 700 50"
                    fill="none"
                    stroke="#475569"
                    strokeDasharray="2 2"
                    strokeWidth="3"
                  />
                  <path d="M220 75 Q 350 32 480 75 Z" fill="#ef4444" fillOpacity="0.28" />
                  <path d="M220 50 L 480 50" stroke="#ef4444" strokeDasharray="3 3" strokeWidth="1.5" />
                  <circle cx="350" cy="50" fill="#ef4444" r="4" />
                  <line stroke="#ef4444" strokeWidth="1.5" x1="350" x2="350" y1="50" y2="73" />
                  <line opacity="0.6" stroke="#22c55e" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="36" y2="36" />
                  <text fill="#22c55e" fontFamily="Inter" fontSize="9" fontWeight="600" x="10" y="32">
                    Safe Clearance Baseline (+0.3m)
                  </text>
                  <text fill="#ffdad6" fontFamily="Inter" fontSize="9" fontWeight="600" x="355" y="46">
                    Submerged Sector (-2.4m below safe line)
                  </text>
                  <text fill="#a8b3c2" fontFamily="Inter" fontSize="8.5" x="210" y="77">
                    Km 182 (Karad)
                  </text>
                  <text fill="#a8b3c2" fontFamily="Inter" fontSize="8.5" x="440" y="77">
                    Km 210 (Kolhapur N.)
                  </text>
                </svg>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-text-muted font-caption text-caption pt-0.5">
                <span className="text-text-secondary">
                  NHAI Flood Sensors (FL-48-204) reporting static head receding at 4cm/hr. Drainage: ~26h.
                </span>
                <span className="text-primary font-medium flex-shrink-0">
                  Detour path via Solapur (SH-142) elevated +14m above basin
                </span>
              </div>
            </div>
          </div>

          {/* Disruption Filter Tabs & Incident Card Feed */}
          <div className="flex flex-col gap-3">
            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-bg-surface p-3 rounded-xl border border-border-subtle shadow-sm">
              <div className="flex items-center flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg font-badge-label text-badge-label font-medium transition-colors leading-none ${selectedCategory === 'all'
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'bg-surface-container hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle'
                    }`}
                  type="button"
                >
                  All Incidents ({incidentsData.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('flood')}
                  className={`px-3 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors border leading-none ${selectedCategory === 'flood'
                      ? 'bg-risk-critical/20 text-risk-critical border-risk-critical/40 font-semibold'
                      : 'bg-surface-container hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary border-border-subtle'
                    }`}
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-risk-critical"></span>
                  Critical Flood (1)
                </button>
                <button
                  onClick={() => setSelectedCategory('congestion')}
                  className={`px-3 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors border leading-none ${selectedCategory === 'congestion'
                      ? 'bg-risk-high/20 text-risk-high border-risk-high/40 font-semibold'
                      : 'bg-surface-container hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary border-border-subtle'
                    }`}
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-risk-high"></span>
                  Port Congestion (2)
                </button>
                <button
                  onClick={() => setSelectedCategory('cyclone')}
                  className={`px-3 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors border leading-none ${selectedCategory === 'cyclone'
                      ? 'bg-risk-medium/20 text-risk-medium border-risk-medium/40 font-semibold'
                      : 'bg-surface-container hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary border-border-subtle'
                    }`}
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-risk-medium"></span>
                  Cyclone Weather (1)
                </button>
                <button
                  onClick={() => setSelectedCategory('strike')}
                  className={`px-3 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors border leading-none ${selectedCategory === 'strike'
                      ? 'bg-surface-variant text-text-primary border-border-strong font-semibold'
                      : 'bg-surface-container hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary border-border-subtle'
                    }`}
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-text-disabled"></span>
                  Checkpost Strike (1)
                </button>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-disabled text-[16px]">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 rounded-lg bg-bg-app border border-border-subtle text-text-primary placeholder:text-text-disabled font-caption text-caption focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-60"
                    placeholder="Filter highway, cargo, ID..."
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Incident Cards */}
            {filteredIncidents.map((incident) => {
              const isSelected = activeIncidentId === incident.id;
              const severityColor =
                incident.severity === 'CRITICAL'
                  ? 'bg-risk-critical'
                  : incident.severity === 'HIGH'
                    ? 'bg-risk-high'
                    : incident.severity === 'MEDIUM'
                      ? 'bg-risk-medium'
                      : 'bg-risk-low';

              const severityBadge =
                incident.severity === 'CRITICAL'
                  ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                  : incident.severity === 'HIGH'
                    ? 'bg-risk-high/15 text-risk-high border border-risk-high/30'
                    : incident.severity === 'MEDIUM'
                      ? 'bg-risk-medium/15 text-risk-medium border border-risk-medium/30'
                      : 'bg-risk-low/15 text-risk-low border border-risk-low/30';

              return (
                <div
                  key={incident.id}
                  onClick={() => setActiveIncidentId(incident.id)}
                  className={`bg-bg-surface p-4 rounded-xl shadow-sm relative overflow-hidden transition-all cursor-pointer border ${isSelected
                      ? 'ring-1 ring-primary/50 border-primary-container/40 bg-bg-surface-hover'
                      : 'border-border-subtle hover:border-border-strong hover:bg-bg-surface-hover'
                    }`}
                >
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${severityColor}`}></div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2.5">
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-lg flex-shrink-0 mt-0.5 ${severityBadge}`}>
                        <span className="material-symbols-outlined text-[20px]">{incident.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-card-title text-card-title text-text-primary">{incident.title}</span>
                          <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full font-semibold ${severityBadge}`}>
                            {incident.severity}
                          </span>
                          <span className="font-caption text-caption text-text-muted">ID: {incident.id}</span>
                        </div>
                        <span className="font-body-default text-body-default text-text-secondary mt-1">
                          {incident.description}
                        </span>
                        <div className="flex items-center gap-4 mt-2.5 font-caption text-caption text-text-muted flex-wrap">
                          <span className="flex items-center gap-1.5 text-text-primary font-medium">
                            <span className="material-symbols-outlined text-[14px] text-risk-critical">local_shipping</span>
                            {incident.trucksCount} In-Transit Trucks
                          </span>
                          <span className="flex items-center gap-1 text-risk-critical font-medium bg-risk-critical/10 px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px]">currency_rupee</span>
                            {incident.cargoValue} At Risk
                          </span>
                          <span className="flex items-center gap-1 text-text-secondary">
                            <span className="material-symbols-outlined text-[14px]">timer</span>
                            Est. Delay: {incident.delayEst}
                          </span>
                          <span className="flex items-center gap-1 text-risk-low font-medium bg-risk-low/10 px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px]">alt_route</span>
                            {incident.bypass}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col items-end justify-between gap-2.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border-subtle">
                      <div className="flex items-center gap-1.5 bg-primary-soft text-primary px-2.5 py-1 rounded-full font-badge-label text-badge-label border border-primary-container/20">
                        <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                        <span>{incident.aiConfidence}% AI Confidence</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/disruptions/${incident.id}`);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-caption text-caption font-medium hover:bg-primary-hover shadow-sm transition-colors"
                        type="button"
                      >
                        Inspect &amp; Reroute
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT DISRUPTION COMMAND & ACTION DRAWER (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-bg-surface-raised rounded-xl p-4 shadow-xl flex flex-col gap-4 ring-1 ring-border-strong border border-border-subtle">
            {/* Incident Header */}
            <div className="flex flex-col gap-2 pb-3.5 bg-surface-container-low/60 -mx-4 -mt-4 p-4 rounded-t-xl border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-risk-critical animate-ping"></span>
                  Active Incident Cockpit
                </span>
                <span className="font-badge-label text-badge-label px-2.5 py-0.5 rounded-full bg-risk-critical/20 text-risk-critical font-semibold border border-risk-critical/30">
                  {activeIncident.severity} HAZARD
                </span>
              </div>
              <span className="font-section-title text-section-title text-text-primary font-semibold leading-tight">
                {activeIncident.title}
              </span>
              <div className="flex items-center justify-between text-text-secondary font-caption text-caption pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-text-disabled">schedule</span>
                  ID: {activeIncident.id}
                </span>
                <span className="text-risk-high font-medium bg-risk-high/15 px-2 py-0.5 rounded">Clearing: ~26.4h</span>
              </div>
            </div>

            {/* Impact Breakdown: 4 Visual Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-surface-container-low p-3 rounded-lg flex flex-col justify-between border border-border-subtle min-h-[82px]">
                <span className="font-caption text-caption text-text-muted">Impacted Trucks</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-kpi-val text-kpi-val text-text-primary">{activeIncident.trucksCount}</span>
                  <span className="font-caption text-caption text-risk-critical font-medium bg-risk-critical/10 px-1.5 py-0.5 rounded">
                    4 Priority 1
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-risk-critical h-full w-[65%]"></div>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg flex flex-col justify-between border border-border-subtle min-h-[82px]">
                <span className="font-caption text-caption text-text-muted">Cargo at Risk</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-kpi-val text-kpi-val text-risk-critical">{activeIncident.cargoValue}</span>
                  <span className="font-caption text-caption text-text-muted font-medium">Value</span>
                </div>
                <span className="font-caption text-caption text-text-secondary mt-1 text-[10px] truncate">
                  Pharma &amp; EV Batteries
                </span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg flex flex-col justify-between border border-border-subtle min-h-[82px]">
                <span className="font-caption text-caption text-text-muted">Average Delay</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-kpi-val text-kpi-val text-risk-high">{activeIncident.delayEst}</span>
                  <span className="font-caption text-caption text-text-muted font-medium">Hours</span>
                </div>
                <span className="font-caption text-caption text-text-disabled mt-1 text-[10px]">Without Detour: +22h</span>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg flex flex-col justify-between border border-border-subtle min-h-[82px]">
                <span className="font-caption text-caption text-text-muted">AI Confidence</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-kpi-val text-kpi-val text-primary">{activeIncident.aiConfidence}%</span>
                  <span className="material-symbols-outlined text-risk-low text-[16px]">verified</span>
                </div>
                <span className="font-caption text-caption text-risk-low mt-1 text-[10px] font-medium">
                  Hydrology Verified
                </span>
              </div>
            </div>

            {/* Alternative Route Comparison */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-card-title text-card-title text-text-primary">Alternative Detour Options</span>
                <span className="font-caption text-caption text-text-muted bg-surface-container px-2 py-0.5 rounded">
                  3 Engine Paths
                </span>
              </div>

              {/* Route A: Blocked */}
              <div className="p-3 rounded-lg bg-surface-container-low opacity-60 flex flex-col gap-1.5 border border-border-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-risk-critical"></span>
                    <span className="font-caption text-caption font-semibold text-text-primary">
                      Route A: Direct {activeIncident.corridor}
                    </span>
                  </div>
                  <span className="font-badge-label text-badge-label text-risk-critical font-semibold bg-risk-critical/15 px-2 py-0.5 rounded">
                    BLOCKED
                  </span>
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-muted text-[11px]">
                  <span>Dist: 560 km • Fuel: ₹14,200</span>
                  <span className="text-risk-critical font-medium">+24h delay expected</span>
                </div>
              </div>

              {/* Route B: AI Recommended */}
              <div className="p-3.5 rounded-lg bg-surface-container shadow-sm ring-2 ring-primary flex flex-col gap-2.5 relative border border-primary/30">
                <div className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-badge-label text-badge-label font-semibold text-[10px] shadow-sm">
                  AI RECOMMENDED DETOUR
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-card-title text-card-title text-text-primary">Route B: Solapur Bypass (SH-142)</span>
                  </div>
                  <span className="font-badge-label text-badge-label text-risk-low bg-risk-low/15 border border-risk-low/30 px-2 py-0.5 rounded font-semibold">
                    Optimal ETA
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-caption text-caption pt-1 border-t border-border-subtle">
                  <div className="flex flex-col">
                    <span className="text-text-muted text-[10px]">Added Distance</span>
                    <span className="text-text-primary font-semibold">+42 km (7.5%)</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-muted text-[10px]">Fuel &amp; Toll Delta</span>
                    <span className="text-text-primary font-semibold">+₹1,840 / truck</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-muted text-[10px]">Arrival Window</span>
                    <span className="text-risk-low font-semibold">+5.4h (On SLA)</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <div className="flex justify-between font-caption text-caption text-[10px] text-text-muted">
                    <span>Route Risk Score: Low (12/100)</span>
                    <span className="text-risk-low font-medium">Pavement Dry &amp; Verified</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="bg-risk-low h-full w-[12%]"></div>
                  </div>
                </div>
              </div>

              {/* Route C */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5 border border-border-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-risk-medium"></span>
                    <span className="font-caption text-caption font-semibold text-text-primary">
                      Route C: Northern Aurangabad Loop
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-secondary bg-surface-container px-2 py-0.5 rounded">
                    Viable Fallback
                  </span>
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-muted text-[11px]">
                  <span>Dist: +118 km • Extra Cost: +₹4,950</span>
                  <span className="text-risk-high font-medium">+11.8h delay</span>
                </div>
              </div>
            </div>

            {/* One-Click Action Trigger */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-primary-soft text-primary font-caption text-caption flex items-start gap-2 border border-primary-container/20">
                <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-0.5">shield</span>
                <span className="leading-tight">
                  <strong>SupplyShield Auto-Reroute Engine:</strong> Ready to dispatch revised geofenced itineraries to{' '}
                  {activeIncident.trucksCount} telematics terminals.
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setAuthorized(!authorized)}
                  className={`w-full py-2.5 px-4 rounded-lg font-body-default text-body-default font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${authorized
                      ? 'bg-risk-low text-on-primary'
                      : 'bg-primary-container hover:bg-primary-hover text-on-primary-container'
                    }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {authorized ? 'check_circle' : 'verified'}
                  </span>
                  <span>
                    {authorized
                      ? `Reroute Authorized (${activeIncident.trucksCount} Dispatched)`
                      : `Authorize ${activeIncident.trucksCount} Shipments Reroute via Route B`}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNotificationSent(true)}
                    className="flex-1 py-2 px-3 rounded-lg bg-bg-surface hover:bg-bg-surface-hover text-text-primary font-caption text-caption font-medium flex items-center justify-center gap-1.5 border border-border-subtle transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">
                      {notificationSent ? 'check' : 'notifications_active'}
                    </span>
                    <span>{notificationSent ? 'Carrier Notified' : 'Notify Carrier Fleet'}</span>
                  </button>
                  <button
                    onClick={() => navigate(`/simulations`)}
                    className="flex-1 py-2 px-3 rounded-lg bg-bg-surface hover:bg-bg-surface-hover text-text-primary font-caption text-caption font-medium flex items-center justify-center gap-1.5 border border-border-subtle transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px] text-text-secondary">tune</span>
                    <span>Simulate Custom</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Incident Telemetry Feed */}
            <div className="flex flex-col gap-2.5 pt-2.5 border-t border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-text-secondary">rss_feed</span>
                  Live Incident Sensor Feed
                </span>
                <span className="font-caption text-caption text-text-disabled">Real-time Stream</span>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5 text-caption font-caption p-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                  <span className="text-text-disabled whitespace-nowrap font-mono text-[11px] mt-0.5">14:42</span>
                  <span className="w-2 h-2 rounded-full bg-risk-critical mt-1.5 flex-shrink-0"></span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-text-primary font-medium truncate">NHAI Regional Notice #491</span>
                    <span className="text-text-secondary text-[11px] leading-tight mt-0.5">
                      Koyna Dam reservoir release increased to 45,000 cusecs; low-lying causeway breach.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-caption font-caption p-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                  <span className="text-text-disabled whitespace-nowrap font-mono text-[11px] mt-0.5">14:38</span>
                  <span className="w-2 h-2 rounded-full bg-risk-low mt-1.5 flex-shrink-0"></span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-text-primary font-medium truncate">SH-142 Solapur Detour Verified</span>
                    <span className="text-text-secondary text-[11px] leading-tight mt-0.5">
                      Maharashtra Highway Patrol confirms clear roads on bypass stretch.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-caption font-caption p-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
                  <span className="text-text-disabled whitespace-nowrap font-mono text-[11px] mt-0.5">14:15</span>
                  <span className="w-2 h-2 rounded-full bg-status-info mt-1.5 flex-shrink-0"></span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-text-primary font-medium truncate">Telematics Broadcast Ready</span>
                    <span className="text-text-secondary text-[11px] leading-tight mt-0.5">
                      Turn-by-turn regional detour packets generated for awaiting trucks.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
