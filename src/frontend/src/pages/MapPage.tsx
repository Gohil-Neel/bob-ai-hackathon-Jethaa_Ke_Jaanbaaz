/**
 * SupplyShield AI — Global Live Geospatial Tracking Map
 *
 * Real-time satellite AIS/ADS-B command center matching Stitch Design System:
 * - Interactive vector map grid with live telemetry positions
 * - Weather storm radar overlay & port congestion flags
 * - Real-time vehicle telemetry HUD (Heading, Speed, Temperature, ETA, Cargo value)
 * - Stitch tokens: bg-bg-surface, bg-surface-container-lowest, material-symbols-outlined
 */

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapPin {
  id: string;
  type: 'VESSEL' | 'FLIGHT' | 'TRUCK' | 'PORT' | 'DISRUPTION';
  name: string;
  code: string;
  lat: number;
  lng: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  speed: string;
  heading: string;
  temperature?: string;
  cargo: string;
  cargoValue: string;
  eta: string;
  carrier: string;
  destination: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PINS: MapPin[] = [
  {
    id: 'pin-001',
    type: 'TRUCK',
    name: 'NH-48 Dedicated Pharma Reefer Unit #09',
    code: 'SS-2024-0001',
    lat: 44,
    lng: 48,
    status: 'CRITICAL',
    speed: '78 km/h',
    heading: '185° S (Kolhapur Bound)',
    temperature: '10.4°C (Excursion Exceeded!)',
    cargo: 'Pharma Recombinant Insulin 100IU',
    cargoValue: '₹2.40 Cr',
    eta: 'Today, 14:00 IST',
    carrier: 'Fleet Asset Unit TRUCK-009',
    destination: 'JNPT / Pune Pharma Logistics Hub',
  },
  {
    id: 'pin-002',
    type: 'VESSEL',
    name: 'Maersk Mc-Kinney Moller (Ocean Container)',
    code: 'SS-2024-0002',
    lat: 36,
    lng: 32,
    status: 'NORMAL',
    speed: '18.4 kts',
    heading: '265° W',
    temperature: '4.2°C (Optimal)',
    cargo: 'Monoclonal Antibodies',
    cargoValue: '₹3.80 Cr',
    eta: 'Dec 22, 09:00 UTC',
    carrier: 'Maersk Line',
    destination: 'Rotterdam Gateway Hub',
  },
  {
    id: 'pin-003',
    type: 'VESSEL',
    name: 'CMA CGM Jacques Saadé',
    code: 'SS-2024-0003',
    lat: 42,
    lng: 80,
    status: 'CRITICAL',
    speed: '4.1 kts (Drifting)',
    heading: '310° NW',
    temperature: '-16.2°C',
    cargo: 'mRNA Vaccines (-20°C)',
    cargoValue: '₹1.85 Cr',
    eta: 'Dec 20, 16:00 UTC (+36h delay)',
    carrier: 'CMA CGM',
    destination: 'Tokyo Port (NRT)',
  },
  {
    id: 'pin-004',
    type: 'FLIGHT',
    name: 'Lufthansa Cargo LH8220 (B777F)',
    code: 'SS-2024-0005',
    lat: 28,
    lng: 42,
    status: 'NORMAL',
    speed: '490 kts (FL360)',
    heading: '280° W',
    temperature: '3.8°C (Active Envirotainer)',
    cargo: 'Clinical Trial Biomarkers',
    cargoValue: '₹4.50 Cr',
    eta: 'Dec 15, 02:00 UTC',
    carrier: 'Lufthansa Cargo',
    destination: 'Chicago O’Hare (ORD)',
  },
  {
    id: 'pin-005',
    type: 'DISRUPTION',
    name: 'North Atlantic Cyclone Vortex',
    code: 'DIS-2024-884',
    lat: 32,
    lng: 28,
    status: 'CRITICAL',
    speed: 'Wave height 9.2m',
    heading: 'Eastward 35 kts',
    cargo: 'Affects 14 Sea Shipments',
    cargoValue: '₹5.84 Cr At Risk',
    eta: 'Peak impact next 36h',
    carrier: 'Weather Disruption Zone',
    destination: 'North Atlantic Sea Lane',
  },
  {
    id: 'pin-006',
    type: 'PORT',
    name: 'JNPT Navi Mumbai Terminal Berth #3',
    code: 'DIS-2024-879',
    lat: 48,
    lng: 52,
    status: 'WARNING',
    speed: 'Crane Fault Hold',
    heading: 'Zero crane throughput',
    cargo: '3 Managed Shipments Delayed',
    cargoValue: '₹1.59 Cr Impact',
    eta: 'Clearance ETA: 14h',
    carrier: 'Port Authority Hub',
    destination: 'GTI Container Terminal',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const [pins] = useState<MapPin[]>(MOCK_PINS);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(MOCK_PINS[0]);
  const [layerWeather, setLayerWeather] = useState(true);
  const [layerColdChain, setLayerColdChain] = useState(true);
  const [layerFleet, setLayerFleet] = useState(true);

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <span className="material-symbols-outlined text-[24px]">map</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                Global Live Tracking &amp; Geospatial Radar
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                AIS / ADS-B TELEMETRY LIVE
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              Real-time vessel, air cargo &amp; overland reefer telemetry • Dynamic storm vortex &amp; corridor bottleneck overlays
            </span>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setLayerWeather(!layerWeather)}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors ${layerWeather
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">cyclone</span>
            Storm Radar {layerWeather ? '✓' : ''}
          </button>
          <button
            onClick={() => setLayerColdChain(!layerColdChain)}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors ${layerColdChain
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 font-semibold'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">ac_unit</span>
            Cold-Chain Loggers {layerColdChain ? '✓' : ''}
          </button>
          <button
            onClick={() => setLayerFleet(!layerFleet)}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-badge-label text-badge-label flex items-center gap-1.5 transition-colors ${layerFleet
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 font-semibold'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">directions_boat</span>
            Fleet Assets {layerFleet ? '✓' : ''}
          </button>
        </div>
      </div>

      {/* ── Interactive Viewport HUD ── */}
      <div className="relative rounded-xl overflow-hidden border border-border-subtle shadow-lg" style={{ height: '640px', background: 'radial-gradient(ellipse at center, #131722 0%, #0a0d14 100%)' }}>
        {/* Vector Grid Lines */}
        <svg className="w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapgrid)" />
          {/* Approximate corridor tracks */}
          <path d="M 140 240 Q 300 180 460 220 T 680 340 T 880 320" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" strokeDasharray="5 5" />
          <path d="M 460 220 Q 560 380 640 480" fill="none" stroke="rgba(20,184,166,0.4)" strokeWidth="1.5" strokeDasharray="5 5" />
        </svg>

        {/* Storm Radar Pulse */}
        {layerWeather && (
          <div
            className="absolute rounded-full pointer-events-none animate-pulse"
            style={{
              top: '22%',
              left: '24%',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(239,68,68,0.25) 0%, rgba(239,68,68,0) 70%)',
              border: '1px dashed rgba(239,68,68,0.4)',
            }}
          >
            <span className="absolute bottom-2 left-4 font-badge-label text-[10px] font-bold text-risk-critical uppercase tracking-widest">
              Storm Vortex (Waves 9m+)
            </span>
          </div>
        )}

        {/* Map Pins */}
        {pins.map((pin) => {
          const isSelected = selectedPin?.id === pin.id;
          const icon = pin.type === 'VESSEL' ? 'directions_boat' : pin.type === 'FLIGHT' ? 'flight' : pin.type === 'TRUCK' ? 'local_shipping' : pin.type === 'PORT' ? 'anchor' : 'cyclone';
          const isCritical = pin.status === 'CRITICAL';
          const isWarning = pin.status === 'WARNING';

          return (
            <div
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-10"
              style={{ top: `${pin.lat}%`, left: `${pin.lng}%` }}
            >
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg shadow-xl transition-all border ${isSelected
                    ? 'bg-surface-container-lowest border-primary ring-2 ring-primary/40'
                    : isCritical
                      ? 'bg-surface-container-lowest border-risk-critical'
                      : isWarning
                        ? 'bg-surface-container-lowest border-risk-high'
                        : 'bg-surface-container-lowest border-border-subtle'
                  }`}
              >
                <span className={`material-symbols-outlined text-[16px] ${isCritical ? 'text-risk-critical' : isWarning ? 'text-risk-high' : 'text-primary'
                  }`}>
                  {icon}
                </span>
                <span className="font-mono text-xs font-bold text-text-primary">{pin.code}</span>
                {isCritical && (
                  <span className="w-2 h-2 rounded-full bg-risk-critical animate-ping" />
                )}
              </div>
            </div>
          );
        })}

        {/* Selected Asset HUD Floating Drawer */}
        {selectedPin && (
          <div className="absolute bottom-6 right-6 p-5 rounded-xl w-96 shadow-2xl bg-surface-container-lowest/95 border border-border-subtle backdrop-blur-md space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border-subtle">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-surface-container-high">
                    {selectedPin.code}
                  </span>
                  <span className={`font-badge-label text-badge-label px-2 py-0.5 rounded-full font-semibold ${selectedPin.status === 'CRITICAL' ? 'bg-risk-critical/15 text-risk-critical' : 'bg-risk-low/15 text-risk-low'
                    }`}>
                    {selectedPin.status}
                  </span>
                </div>
                <h3 className="font-card-title text-card-title text-text-primary leading-tight">{selectedPin.name}</h3>
              </div>
              <button onClick={() => setSelectedPin(null)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>

            <div className="space-y-2 font-caption text-caption text-text-secondary">
              <div className="flex justify-between">
                <span className="text-text-muted">Carrier / Asset:</span>
                <span className="font-semibold text-text-primary">{selectedPin.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Cargo Payload:</span>
                <span className="font-semibold text-text-primary">{selectedPin.cargo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Cargo Value:</span>
                <span className="font-bold text-primary">{selectedPin.cargoValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Speed &amp; Heading:</span>
                <span className="font-mono text-text-primary">{selectedPin.speed} • {selectedPin.heading}</span>
              </div>
              {selectedPin.temperature && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Cold Chain Logger:</span>
                  <span className={`font-mono font-bold ${selectedPin.temperature.includes('Excursion') ? 'text-risk-critical' : 'text-teal-400'}`}>
                    {selectedPin.temperature}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Estimated Arrival:</span>
                <span className="font-semibold text-text-primary">{selectedPin.eta}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Centering high-resolution sensor telemetry stream on ${selectedPin.name}.`)}
              className="w-full py-2 rounded-lg bg-primary text-white font-badge-label text-badge-label font-semibold shadow-sm hover:brightness-110 flex items-center justify-center gap-1.5 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              Inspect Real-Time Telemetry Stream
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
