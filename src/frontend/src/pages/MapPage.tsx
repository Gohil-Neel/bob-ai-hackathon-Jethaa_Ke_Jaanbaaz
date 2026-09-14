/**
 * SupplyShield AI — Global Live Map & Geospatial Tracking
 *
 * Real-time interactive control tower geospatial command center:
 * - Live vessel, aircraft, and overland truck tracking pins
 * - Severe weather zones & port congestion heatmaps
 * - Dynamic geofence breach monitors & cold-chain sensor status
 * - Segment-by-segment telemetry inspection & deviation alerts
 */

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapPin {
  id: string;
  type: 'VESSEL' | 'FLIGHT' | 'TRUCK' | 'PORT' | 'DISRUPTION';
  name: string;
  code: string;
  lat: number; // For SVG mapping (% from top)
  lng: number; // For SVG mapping (% from left)
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  speed: string;
  heading: string;
  temperature?: string;
  cargo: string;
  eta: string;
  carrier: string;
  destination: string;
}

// ─── Mock Geospatial Data ─────────────────────────────────────────────────────

const MOCK_PINS: MapPin[] = [
  {
    id: 'pin-001',
    type: 'VESSEL',
    name: 'Maersk Mc-Kinney Moller',
    code: 'SS-2024-0001',
    lat: 38,
    lng: 32,
    status: 'CRITICAL',
    speed: '18.4 kts',
    heading: '265° W',
    temperature: '10.4°C (Excursion!)',
    cargo: 'Pharma Insulin 100IU',
    eta: 'Dec 18, 14:00 UTC',
    carrier: 'Maersk Line',
    destination: 'Chicago, USA',
  },
  {
    id: 'pin-002',
    type: 'VESSEL',
    name: 'COSCO Shipping Universe',
    code: 'SS-2024-0002',
    lat: 52,
    lng: 68,
    status: 'NORMAL',
    speed: '19.2 kts',
    heading: '290° WNW',
    temperature: '4.2°C (Optimal)',
    cargo: 'Monoclonal Antibodies',
    eta: 'Dec 22, 09:00 UTC',
    carrier: 'COSCO Shipping',
    destination: 'Rotterdam, Netherlands',
  },
  {
    id: 'pin-003',
    type: 'VESSEL',
    name: 'CMA CGM Jacques Saadé',
    code: 'SS-2024-0003',
    lat: 44,
    lng: 82,
    status: 'CRITICAL',
    speed: '4.1 kts (Drifting)',
    heading: '310° NW',
    temperature: '-16.2°C',
    cargo: 'mRNA Vaccines',
    eta: 'Dec 20, 16:00 UTC (+36h delay)',
    carrier: 'CMA CGM',
    destination: 'Tokyo, Japan',
  },
  {
    id: 'pin-004',
    type: 'FLIGHT',
    name: 'Lufthansa Cargo LH8220',
    code: 'SS-2024-0005',
    lat: 30,
    lng: 45,
    status: 'NORMAL',
    speed: '490 kts (FL360)',
    heading: '280° W',
    temperature: '3.8°C (Active Envirotainer)',
    cargo: 'Clinical Trial Biomarkers',
    eta: 'Dec 15, 02:00 UTC',
    carrier: 'Lufthansa Cargo',
    destination: 'Chicago O’Hare (ORD)',
  },
  {
    id: 'pin-005',
    type: 'TRUCK',
    name: 'KN Overland Reefer Fleet #09',
    code: 'SS-2024-0006',
    lat: 33,
    lng: 51,
    status: 'NORMAL',
    speed: '82 km/h',
    heading: '340° NNW',
    temperature: '4.9°C',
    cargo: 'Vaccine Bulk Substances',
    eta: 'Today, 21:30 UTC',
    carrier: 'Kuehne + Nagel',
    destination: 'Antwerp Gateway Hub',
  },
  {
    id: 'pin-006',
    type: 'DISRUPTION',
    name: 'North Atlantic Winter Storm Belt',
    code: 'DIS-001',
    lat: 32,
    lng: 30,
    status: 'CRITICAL',
    speed: 'Wave height 9.2m',
    heading: 'Eastward 35 kts',
    cargo: 'Affects 14 Vessels',
    eta: 'Peak impact next 36h',
    carrier: 'Regional Disruption Zone',
    destination: 'North Atlantic Sea Lane',
  },
  {
    id: 'pin-007',
    type: 'PORT',
    name: 'Port of Rotterdam (Strike Hold)',
    code: 'DIS-002',
    lat: 28,
    lng: 50,
    status: 'WARNING',
    speed: '28 Vessels Queued',
    heading: 'Zero crane throughput',
    cargo: '3 Managed Shipments Delayed',
    eta: 'Strike ends in ~24h',
    carrier: 'Rotterdam Port Authority',
    destination: 'Maasvlakte II',
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
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🗺️</span>
            <h1 className="text-2xl font-extrabold text-white">Global Live Tracking Map</h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live AIS / ADS-B Telemetry
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            High-precision satellite geolocation, storm vortex overlays & real-time cold chain sensor status
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLayerWeather(!layerWeather)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              layerWeather ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            🌪️ Storm Zones {layerWeather ? '✓' : ''}
          </button>
          <button
            onClick={() => setLayerColdChain(!layerColdChain)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              layerColdChain ? 'bg-teal-600/30 text-teal-300 border border-teal-500/50' : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            🌡️ Cold-Chain Loggers {layerColdChain ? '✓' : ''}
          </button>
          <button
            onClick={() => setLayerFleet(!layerFleet)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
              layerFleet ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50' : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            🚢 Fleet & Assets {layerFleet ? '✓' : ''}
          </button>
        </div>
      </div>

      {/* ── Interactive Map Viewport & Telemetry HUD ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: '620px', background: 'radial-gradient(ellipse at center, #111827 0%, #080a12 100%)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
        {/* World Map SVG Background Grid */}
        <svg className="w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Rough Continental Vector Lines */}
          <path d="M 120 180 Q 220 120 340 160 T 480 300 T 260 480 Z" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 520 140 Q 640 90 760 180 T 880 340 T 700 460 Z" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 880 180 Q 1020 120 1140 220 T 1060 440 Z" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>

        {/* Storm Radar Overlay */}
        {layerWeather && (
          <div
            className="absolute rounded-full pointer-events-none animate-pulse"
            style={{
              top: '25%',
              left: '26%',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(239,68,68,0.25) 0%, rgba(239,68,68,0) 70%)',
              border: '1px dashed rgba(239,68,68,0.4)',
            }}
          >
            <span className="absolute bottom-2 left-4 text-[10px] font-bold text-red-400 uppercase tracking-widest">
              Storm Zone (Wave 9m+)
            </span>
          </div>
        )}

        {/* Interactive Map Pins */}
        {pins.map((pin) => {
          const isSelected = selectedPin?.id === pin.id;
          const icon = pin.type === 'VESSEL' ? '🚢' : pin.type === 'FLIGHT' ? '✈️' : pin.type === 'TRUCK' ? '🚛' : pin.type === 'PORT' ? '⚓' : '🌪️';
          const pinColor = pin.status === 'CRITICAL' ? '#ef4444' : pin.status === 'WARNING' ? '#facc15' : '#4ade80';

          return (
            <div
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-10"
              style={{ top: `${pin.lat}%`, left: `${pin.lng}%` }}
            >
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl shadow-2xl transition-all"
                style={{
                  background: isSelected ? 'rgba(0,0,0,0.9)' : 'rgba(15,23,42,0.85)',
                  border: `2px solid ${isSelected ? '#ffffff' : pinColor}`,
                  boxShadow: isSelected ? `0 0 20px ${pinColor}` : '0 4px 12px rgba(0,0,0,0.5)',
                }}
              >
                <span className="text-sm">{icon}</span>
                <span className="text-xs font-mono font-bold text-white">{pin.code}</span>
                {pin.status === 'CRITICAL' && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
            </div>
          );
        })}

        {/* Selected Asset HUD Floating Card */}
        {selectedPin && (
          <div
            className="absolute bottom-6 right-6 p-5 rounded-2xl w-96 shadow-2xl backdrop-blur-md"
            style={{
              background: 'rgba(10,12,20,0.92)',
              border: `1.5px solid ${selectedPin.status === 'CRITICAL' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.15)'}`,
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white/80">
                    {selectedPin.code}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedPin.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {selectedPin.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1 leading-snug">{selectedPin.name}</h3>
              </div>
              <button onClick={() => setSelectedPin(null)} className="text-white/40 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5 text-xs mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex justify-between">
                <span className="text-white/40">Carrier / Fleet:</span>
                <span className="font-semibold text-white">{selectedPin.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Cargo Payload:</span>
                <span className="font-semibold text-white">{selectedPin.cargo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Speed & Heading:</span>
                <span className="font-mono text-white">{selectedPin.speed} · {selectedPin.heading}</span>
              </div>
              {selectedPin.temperature && (
                <div className="flex justify-between">
                  <span className="text-white/40">Cold-Chain Logger:</span>
                  <span className={`font-mono font-bold ${selectedPin.temperature.includes('Excursion') ? 'text-red-400' : 'text-teal-400'}`}>
                    {selectedPin.temperature}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40">Estimated Arrival:</span>
                <span className="font-semibold text-purple-300">{selectedPin.eta}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => alert(`Centering high-resolution satellite AIS telemetry on ${selectedPin.name}.`)}
                className="flex-1 py-2 rounded-xl font-bold text-xs bg-primary hover:bg-primary-hover text-white transition-colors"
              >
                🛰️ Track Sensor Stream
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
