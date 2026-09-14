/**
 * SupplyShield AI — Route & Corridor Management
 *
 * Strategic trade lane network & multi-modal routing engine:
 * - Real-time corridor health & bottleneck indicators
 * - Multi-segment waypoint breakdowns (Origin -> Port -> Customs -> Consignee)
 * - Dynamic route risk scoring (Weather + Port Congestion + Geopolitical)
 * - Carbon footprint (kg CO2e / TEU) vs. Transit time trade-offs
 * - Alternative bypass corridor routing
 */

import { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'OCEAN' | 'AIR' | 'ROAD' | 'RAIL' | 'MULTI_MODAL';
type RouteStatus = 'OPTIMAL' | 'CONGESTED' | 'DISRUPTED' | 'SEASONAL_CLOSED';

interface Waypoint {
  name: string;
  type: 'ORIGIN' | 'PORT' | 'HUB' | 'CUSTOMS' | 'DESTINATION';
  country: string;
  dwellTimeHours: number;
}

interface TradeRoute {
  id: string;
  corridorCode: string;
  name: string;
  origin: string;
  destination: string;
  primaryMode: Mode;
  distanceKm: number;
  avgTransitDays: number;
  riskScore: number; // 0.0 - 1.0
  status: RouteStatus;
  primaryCarriers: string[];
  activeShipmentsCount: number;
  carbonKgPerTeu: number;
  waypoints: Waypoint[];
  chokepoints: string[];
  costIndexPerTeu: number;
  alternativeRouteName?: string;
  alternativeTransitDeltaDays?: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ROUTES: TradeRoute[] = [
  {
    id: 'rte-001',
    corridorCode: 'CORR-ATL-01',
    name: 'North Atlantic Pharma Express',
    origin: 'Hamburg, Germany (HAM)',
    destination: 'Chicago, USA (ORD/CHI)',
    primaryMode: 'MULTI_MODAL',
    distanceKm: 7420,
    avgTransitDays: 14.5,
    riskScore: 0.78,
    status: 'DISRUPTED',
    primaryCarriers: ['Maersk', 'Hapag-Lloyd'],
    activeShipmentsCount: 18,
    carbonKgPerTeu: 480,
    waypoints: [
      { name: 'Hamburg Pharma Facility', type: 'ORIGIN', country: 'Germany', dwellTimeHours: 4 },
      { name: 'Port of Hamburg (CTA)', type: 'PORT', country: 'Germany', dwellTimeHours: 28 },
      { name: 'Port of New York / New Jersey', type: 'PORT', country: 'USA', dwellTimeHours: 36 },
      { name: 'Chicago Consolidated Rail Hub', type: 'HUB', country: 'USA', dwellTimeHours: 12 },
      { name: 'Chicago Pharma Distribution Center', type: 'DESTINATION', country: 'USA', dwellTimeHours: 0 },
    ],
    chokepoints: ['North Atlantic Storm Belt (Winter)', 'Port of NY/NJ Container Yard'],
    costIndexPerTeu: 3850,
    alternativeRouteName: 'South Atlantic Azores Bypass -> Port of Charleston',
    alternativeTransitDeltaDays: 2.5,
  },
  {
    id: 'rte-002',
    corridorCode: 'CORR-PAC-02',
    name: 'Trans-Pacific Golden Corridor',
    origin: 'Shanghai, China (SHA)',
    destination: 'Rotterdam, Netherlands (RTM)',
    primaryMode: 'OCEAN',
    distanceKm: 19800,
    avgTransitDays: 28.0,
    riskScore: 0.32,
    status: 'OPTIMAL',
    primaryCarriers: ['COSCO', 'MSC'],
    activeShipmentsCount: 42,
    carbonKgPerTeu: 820,
    waypoints: [
      { name: 'Shanghai Waigaoqiao Logistics Park', type: 'ORIGIN', country: 'China', dwellTimeHours: 6 },
      { name: 'Port of Shanghai (Yangshan Deepwater)', type: 'PORT', country: 'China', dwellTimeHours: 18 },
      { name: 'Singapore PSA Transshipment', type: 'PORT', country: 'Singapore', dwellTimeHours: 14 },
      { name: 'Cape of Good Hope Bypass', type: 'HUB', country: 'South Africa', dwellTimeHours: 0 },
      { name: 'Port of Rotterdam (Maasvlakte II)', type: 'DESTINATION', country: 'Netherlands', dwellTimeHours: 24 },
    ],
    chokepoints: ['Malacca Strait Density', 'Suez Avoidance Routing'],
    costIndexPerTeu: 2950,
  },
  {
    id: 'rte-003',
    corridorCode: 'CORR-PAC-03',
    name: 'Asia-Americas High-Tech Lane',
    origin: 'Los Angeles, USA (LAX/LA)',
    destination: 'Tokyo, Japan (NRT/TYO)',
    primaryMode: 'OCEAN',
    distanceKm: 8800,
    avgTransitDays: 16.0,
    riskScore: 0.85,
    status: 'CONGESTED',
    primaryCarriers: ['CMA CGM', 'ONE'],
    activeShipmentsCount: 14,
    carbonKgPerTeu: 590,
    waypoints: [
      { name: 'Los Angeles Inland Distribution Port', type: 'ORIGIN', country: 'USA', dwellTimeHours: 8 },
      { name: 'Port of Los Angeles (Berth 400)', type: 'PORT', country: 'USA', dwellTimeHours: 52 },
      { name: 'Port of Tokyo (Ohi Container Terminal)', type: 'DESTINATION', country: 'Japan', dwellTimeHours: 20 },
    ],
    chokepoints: ['San Pedro Bay Berth Delays', 'Tokyo Bay Customs Clearance'],
    costIndexPerTeu: 4100,
    alternativeRouteName: 'Direct Air Priority via Anchorage (ANC)',
    alternativeTransitDeltaDays: -12.0,
  },
  {
    id: 'rte-004',
    corridorCode: 'CORR-EUR-04',
    name: 'Trans-European Cold-Chain Overland',
    origin: 'Basel, Switzerland (BSL)',
    destination: 'Antwerp, Belgium (ANR)',
    primaryMode: 'ROAD',
    distanceKm: 640,
    avgTransitDays: 1.2,
    riskScore: 0.15,
    status: 'OPTIMAL',
    primaryCarriers: ['Kuehne + Nagel', 'DHL Freight'],
    activeShipmentsCount: 26,
    carbonKgPerTeu: 140,
    waypoints: [
      { name: 'Novartis Campus Central Cold Depot', type: 'ORIGIN', country: 'Switzerland', dwellTimeHours: 2 },
      { name: 'Basel / Saint-Louis Border Customs', type: 'CUSTOMS', country: 'France', dwellTimeHours: 1.5 },
      { name: 'Strasbourg Reefer Check Station', type: 'HUB', country: 'France', dwellTimeHours: 1 },
      { name: 'Port of Antwerp Cold Gateway', type: 'DESTINATION', country: 'Belgium', dwellTimeHours: 3 },
    ],
    chokepoints: ['Rhine Valley Autobahn Congestion'],
    costIndexPerTeu: 1450,
  },
  {
    id: 'rte-005',
    corridorCode: 'CORR-AIR-05',
    name: 'Global LifeSciences Air Bridge',
    origin: 'Frankfurt, Germany (FRA)',
    destination: 'Chicago, USA (ORD)',
    primaryMode: 'AIR',
    distanceKm: 6950,
    avgTransitDays: 1.5,
    riskScore: 0.18,
    status: 'OPTIMAL',
    primaryCarriers: ['Lufthansa Cargo', 'Swiss WorldCargo'],
    activeShipmentsCount: 8,
    carbonKgPerTeu: 3400,
    waypoints: [
      { name: 'Frankfurt Animal & Pharma Lounge', type: 'ORIGIN', country: 'Germany', dwellTimeHours: 4 },
      { name: 'FRA Air Cargo Terminal 2', type: 'HUB', country: 'Germany', dwellTimeHours: 6 },
      { name: 'Chicago O’Hare International Customs', type: 'DESTINATION', country: 'USA', dwellTimeHours: 4 },
    ],
    chokepoints: ['De-icing queue during deep freeze'],
    costIndexPerTeu: 12800,
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RouteStatus, { label: string; bg: string; text: string; border: string }> = {
  OPTIMAL:         { label: '🟢 Optimal', bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.35)' },
  CONGESTED:       { label: '🟡 Congested', bg: 'rgba(234,179,8,0.12)', text: '#facc15', border: 'rgba(234,179,8,0.35)' },
  DISRUPTED:       { label: '🔴 Disrupted', bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.35)' },
  SEASONAL_CLOSED: { label: '⚪ Closed', bg: 'rgba(107,114,128,0.12)', text: '#9ca3af', border: 'rgba(107,114,128,0.35)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoutesPage() {
  const [routes] = useState<TradeRoute[]>(MOCK_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<TradeRoute | null>(MOCK_ROUTES[0]);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<Mode | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<RouteStatus | 'ALL'>('ALL');

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (modeFilter !== 'ALL' && r.primaryMode !== modeFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (
        search &&
        !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.corridorCode.toLowerCase().includes(search.toLowerCase()) &&
        !r.origin.toLowerCase().includes(search.toLowerCase()) &&
        !r.destination.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [routes, modeFilter, statusFilter, search]);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🛤️</span>
            <h1 className="text-2xl font-extrabold text-white">Route & Corridor Management</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {routes.length} Active Corridors
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Multi-modal waypoint intelligence, bottleneck monitoring & real-time detour rerouting
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('AI Dynamic Route Optimizer executed: 3 alternative bypass corridors simulated.')}
            className="text-sm px-4 py-2 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all"
          >
            ⚡ Optimize Network Routes
          </button>
        </div>
      </div>

      {/* ── Metrics Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Network Health Index</div>
          <div className="text-3xl font-extrabold text-green-400">84.2%</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>3 of 5 Corridors Free of Delays</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Active Shipments in Transit</div>
          <div className="text-3xl font-extrabold text-blue-400">108</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Across All Monitored Trade Lanes</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Active Severe Bottlenecks</div>
          <div className="text-3xl font-extrabold text-red-400">2</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>North Atlantic Storm + San Pedro Bay</div>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Avg Ocean Transit Time</div>
          <div className="text-3xl font-extrabold text-purple-400">19.5d</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>-1.8d vs Industry Average</div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap gap-3 items-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <input
          type="text"
          placeholder="🔍 Search routes by corridor, origin or destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl outline-none w-80"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
        />
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value as Mode | 'ALL')}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ background: 'rgba(25,27,40,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
        >
          <option value="ALL">All Transport Modes</option>
          <option value="OCEAN">Ocean</option>
          <option value="AIR">Air</option>
          <option value="ROAD">Road</option>
          <option value="MULTI_MODAL">Multi-Modal</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RouteStatus | 'ALL')}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{ background: 'rgba(25,27,40,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
        >
          <option value="ALL">All Route Statuses</option>
          <option value="OPTIMAL">Optimal</option>
          <option value="CONGESTED">Congested</option>
          <option value="DISRUPTED">Disrupted</option>
        </select>
        <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Showing {filteredRoutes.length} of {routes.length} corridors
        </span>
      </div>

      {/* ── Main Split View ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Route List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredRoutes.map((route) => {
            const isSelected = selectedRoute?.id === route.id;
            const statusStyle = STATUS_CONFIG[route.status];

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{
                  background: isSelected ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.025)',
                  border: isSelected ? '1.5px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-purple-300">
                        {route.corridorCode}
                      </span>
                      <h3 className="text-base font-bold text-white">{route.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="text-xs flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <span>📍 {route.origin}</span>
                      <span>➔</span>
                      <span>🏁 {route.destination}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{route.avgTransitDays} Days</div>
                    <div className="text-xs font-mono" style={{ color: route.riskScore > 0.6 ? '#f87171' : '#4ade80' }}>
                      Risk Index: {(route.riskScore * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Waypoint summary chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Waypoints:</span>
                  {route.waypoints.map((wp, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }}>
                        {wp.name.split(' ')[0]}
                      </span>
                      {i < route.waypoints.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>}
                    </span>
                  ))}
                  <span className="text-xs ml-auto font-mono text-purple-300">
                    📦 {route.activeShipmentsCount} active loads
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail / Waypoint Inspector */}
        {selectedRoute && (
          <div className="p-6 rounded-2xl flex flex-col gap-5" style={{ background: 'rgba(10,12,20,0.97)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-purple-400">{selectedRoute.corridorCode}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">{selectedRoute.primaryMode}</span>
              </div>
              <h2 className="text-lg font-extrabold text-white">{selectedRoute.name}</h2>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Total Distance: {selectedRoute.distanceKm.toLocaleString()} km · Avg Cost: ${selectedRoute.costIndexPerTeu.toLocaleString()} / TEU
              </div>
            </div>

            {/* Waypoint Flow Chain */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-3 text-purple-300">Corridor Waypoint Flow</div>
              <div className="relative pl-6 space-y-3">
                <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/10" />
                {selectedRoute.waypoints.map((wp, idx) => (
                  <div key={idx} className="relative flex flex-col gap-0.5">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-black" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{wp.name}</span>
                      <span className="text-xs font-mono text-white/40">{wp.dwellTimeHours > 0 ? `~${wp.dwellTimeHours}h dwell` : 'Direct'}</span>
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Type: {wp.type} · {wp.country}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chokepoints & Vulnerabilities */}
            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-red-400">⚠️ Active Corridor Bottlenecks</div>
              <ul className="text-xs space-y-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {selectedRoute.chokepoints.map((cp, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span>•</span>
                    <span>{cp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Alternative Detour */}
            {selectedRoute.alternativeRouteName && (
              <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div className="text-xs font-bold uppercase tracking-wider text-green-400">💡 AI Bypass Corridor Recommendation</div>
                <div className="text-xs font-semibold text-white">{selectedRoute.alternativeRouteName}</div>
                <div className="text-xs text-green-300">
                  Transit impact: {selectedRoute.alternativeTransitDeltaDays && selectedRoute.alternativeTransitDeltaDays > 0 ? `+${selectedRoute.alternativeTransitDeltaDays} days` : `${selectedRoute.alternativeTransitDeltaDays} days`}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => alert(`Simulating full reroute of ${selectedRoute.activeShipmentsCount} shipments onto alternative bypass.`)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                🔄 Trigger Reroute Simulation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
