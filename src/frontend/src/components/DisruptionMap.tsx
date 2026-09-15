import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Disruption, Shipment } from '../types/domain';
import { fetchLiveNodeWeather, type WeatherNodeData } from '../services/weatherService';

// Geographic Coordinates Mapping for Disruption Blast Radii & Regional Corridors
interface RegionGeo {
  name: string;
  coords: [number, number];
  radiusMeters: number;
}

const REGION_GEO_MAP: Record<string, RegionGeo> = {
  'east china sea': { name: 'East China Sea / Taiwan Strait', coords: [27.5, 123.8], radiusMeters: 350000 },
  'china': { name: 'East China Sea / Taiwan Strait', coords: [27.5, 123.8], radiusMeters: 350000 },
  'taiwan': { name: 'East China Sea / Taiwan Strait', coords: [27.5, 123.8], radiusMeters: 350000 },
  'rotterdam': { name: 'Port of Rotterdam, Maasvlakte', coords: [51.92, 4.47], radiusMeters: 120000 },
  'suez': { name: 'Suez Canal Chokepoint', coords: [30.6, 32.32], radiusMeters: 180000 },
  'egypt': { name: 'Suez Canal Chokepoint', coords: [30.6, 32.32], radiusMeters: 180000 },
  'rhine': { name: 'North Rhine-Westphalia Rail Corridor', coords: [51.43, 6.76], radiusMeters: 140000 },
  'germany': { name: 'North Rhine-Westphalia Rail Corridor', coords: [51.43, 6.76], radiusMeters: 140000 },
  'nh-48': { name: 'NH-48 Western Freight Spine', coords: [17.65, 75.9], radiusMeters: 160000 },
  'nh-65': { name: 'NH-65 Deccan Corridor', coords: [17.38, 78.48], radiusMeters: 150000 },
  'nh-16': { name: 'NH-16 Eastern Coast Corridor', coords: [16.98, 82.24], radiusMeters: 180000 },
  'nh-44': { name: 'NH-44 North-South Highway', coords: [12.97, 77.59], radiusMeters: 130000 },
};

function getDisruptionCoords(disruption: Disruption): RegionGeo {
  const query = (disruption.affectedRegion + ' ' + disruption.title).toLowerCase();
  for (const [key, val] of Object.entries(REGION_GEO_MAP)) {
    if (query.includes(key)) {
      return val;
    }
  }
  // Default fallback to global maritime corridor
  return { name: disruption.affectedRegion || 'Global Corridor', coords: [28.0, 50.0], radiusMeters: 200000 };
}

// Major Multi-Modal Corridors
interface MapRoute {
  id: string;
  name: string;
  color: string;
  status: 'CRITICAL' | 'WARNING' | 'OPTIMAL';
  waypoints: [number, number][];
  detourWaypoints?: [number, number][];
}

const MAP_ROUTES: MapRoute[] = [
  {
    id: 'corridor-asia-eu',
    name: 'Asia - Europe Maritime Spine (Shanghai -> Rotterdam)',
    color: '#ef4444',
    status: 'CRITICAL',
    waypoints: [
      [31.23, 121.47],
      [27.5, 123.8],
      [18.0, 116.0],
      [4.21, 100.55],
      [5.9, 80.5],
      [11.5, 58.0],
      [12.58, 43.33],
      [22.0, 38.0],
      [30.6, 32.32],
      [34.5, 23.0],
      [36.0, -5.0],
      [44.0, -9.0],
      [51.92, 4.47],
    ],
    detourWaypoints: [
      [31.23, 121.47],
      [24.5, 124.0],
      [20.0, 121.5],
      [8.0, 110.0],
      [1.35, 103.82],
    ],
  },
  {
    id: 'corridor-in-eu',
    name: 'India - Middle East - Europe Pharma Corridor (Mumbai -> Hamburg)',
    color: '#f59e0b',
    status: 'WARNING',
    waypoints: [
      [18.95, 72.95],
      [23.0, 62.0],
      [25.01, 55.06],
      [31.0, 40.0],
      [38.0, 27.0],
      [46.0, 15.0],
      [50.04, 8.56],
      [53.55, 9.99],
    ],
    detourWaypoints: [
      [18.95, 72.95],
      [25.01, 55.06],
      [36.0, 38.0],
      [50.04, 8.56],
      [53.55, 9.99],
    ],
  },
  {
    id: 'corridor-us-intermodal',
    name: 'US Transcontinental Intermodal (Los Angeles -> Chicago)',
    color: '#10b981',
    status: 'OPTIMAL',
    waypoints: [
      [33.74, -118.27],
      [34.89, -117.02],
      [35.19, -111.65],
      [35.08, -106.65],
      [35.47, -97.52],
      [39.10, -94.58],
      [41.88, -87.63],
    ],
  },
  {
    id: 'corridor-nh48-in',
    name: 'National Freight Corridor NH-48 (Mumbai -> Pune -> Bangalore)',
    color: '#ef4444',
    status: 'CRITICAL',
    waypoints: [
      [18.95, 72.95],
      [18.52, 73.85],
      [17.65, 75.9],
      [15.85, 74.5],
      [12.97, 77.59],
    ],
    detourWaypoints: [
      [18.52, 73.85],
      [17.68, 74.0],
      [16.85, 74.58],
      [12.97, 77.59],
    ],
  },
  {
    id: 'corridor-transpacific',
    name: 'Trans-Pacific Freight Corridor (Busan -> Long Beach)',
    color: '#f59e0b',
    status: 'WARNING',
    waypoints: [
      [35.18, 129.08],
      [38.0, 145.0],
      [44.0, 170.0],
      [45.0, -165.0],
      [40.0, -140.0],
      [33.77, -118.19],
    ],
  },
];

// Shipment Location Estimator along Corridors
function getShipmentCoords(s: Shipment, idx: number): [number, number] {
  const origin = s.origin.toLowerCase();
  const dest = s.destination.toLowerCase();

  if (origin.includes('shanghai') || dest.includes('rotterdam')) {
    return [24.0, 118.5]; // Taiwan Strait vicinity
  }
  if (origin.includes('mumbai') || dest.includes('hamburg')) {
    return [26.2, 53.8]; // Arabian Gulf / Red Sea
  }
  if (origin.includes('los angeles') || dest.includes('chicago')) {
    return [35.2, -107.0]; // New Mexico rail span
  }
  if (origin.includes('singapore') || dest.includes('frankfurt')) {
    return [15.0, 78.0]; // Indian Ocean air span
  }
  if (origin.includes('busan') || dest.includes('long beach')) {
    return [41.0, -155.0]; // Mid-Pacific
  }

  // Fallback distribution
  const defaults: [number, number][] = [
    [27.5, 123.8],
    [51.92, 4.47],
    [30.6, 32.32],
    [18.52, 73.85],
    [41.88, -87.63],
  ];
  return defaults[idx % defaults.length];
}

interface DisruptionMapProps {
  disruptions: Disruption[];
  shipments: Shipment[];
  selectedDisruptionId: string | null;
  onSelectDisruption: (disruptionId: string) => void;
  onSelectShipment?: (shipment: Shipment) => void;
}

export default function DisruptionMap({
  disruptions,
  shipments,
  selectedDisruptionId,
  onSelectDisruption,
  onSelectShipment,
}: DisruptionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    tileLayer?: L.TileLayer;
    routesGroup?: L.LayerGroup;
    disruptionsGroup?: L.LayerGroup;
    shipmentsGroup?: L.LayerGroup;
  }>({});

  const [mapStyle, setMapStyle] = useState<'STREET' | 'SATELLITE'>('STREET');
  const [activeTrackingShipment, setActiveTrackingShipment] = useState<Shipment | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28, 45],
      zoom: 2.6,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const routesGroup = L.layerGroup().addTo(map);
    const disruptionsGroup = L.layerGroup().addTo(map);
    const shipmentsGroup = L.layerGroup().addTo(map);
    const weatherGroup = L.layerGroup().addTo(map);

    layersRef.current = { routesGroup, disruptionsGroup, shipmentsGroup, weatherGroup };
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Live Weather Radar Stream (Open-Meteo API)
  const [showWeatherRadar, setShowWeatherRadar] = useState<boolean>(true);
  const [weatherNodes, setWeatherNodes] = useState<WeatherNodeData[]>([]);

  useEffect(() => {
    fetchLiveNodeWeather().then((data) => {
      setWeatherNodes(data);
    });
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.tileLayer) {
      map.removeLayer(layersRef.current.tileLayer);
    }

    const tileUrl =
      mapStyle === 'STREET'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const attribution =
      mapStyle === 'STREET'
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution,
    }).addTo(map);

    layersRef.current.tileLayer = tileLayer;
  }, [mapStyle]);

  // Render Routes & Detours
  useEffect(() => {
    const { routesGroup } = layersRef.current;
    if (!routesGroup) return;

    routesGroup.clearLayers();

    MAP_ROUTES.forEach((route) => {
      // Glow underlay
      L.polyline(route.waypoints, {
        color: route.color,
        weight: 6,
        opacity: 0.28,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routesGroup);

      // Main line
      L.polyline(route.waypoints, {
        color: route.color,
        weight: 3,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routesGroup);

      // AI Detour Alternative Line (if available)
      if (route.detourWaypoints) {
        L.polyline(route.detourWaypoints, {
          color: '#10b981',
          weight: 2.5,
          opacity: 0.9,
          dashArray: '6, 8',
          lineCap: 'round',
        }).addTo(routesGroup);
      }
    });
  }, []);

  // Render Disruption Blast Radii
  useEffect(() => {
    const { disruptionsGroup } = layersRef.current;
    if (!disruptionsGroup) return;

    disruptionsGroup.clearLayers();

    disruptions.forEach((d) => {
      const geo = getDisruptionCoords(d);
      const isSelected = selectedDisruptionId === d.id;
      const isCritical = d.severity === 'CRITICAL';
      const color = isCritical ? '#ef4444' : d.severity === 'HIGH' ? '#f97316' : '#f59e0b';

      // Blast radius circle
      const circle = L.circle(geo.coords, {
        radius: geo.radiusMeters,
        color,
        fillColor: color,
        fillOpacity: isSelected ? 0.35 : 0.18,
        weight: isSelected ? 3 : 1.5,
        dashArray: isCritical ? '4, 4' : undefined,
      }).addTo(disruptionsGroup);

      circle.on('click', () => {
        onSelectDisruption(d.id);
      });

      // Disruption center icon
      const centerIcon = L.divIcon({
        className: 'custom-disruption-center',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${isCritical ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)'};
            color: white;
            box-shadow: 0 0 16px ${color};
            border: 2px solid #ffffff;
            cursor: pointer;
            transition: transform 0.2s;
          " class="hover:scale-110">
            <span class="material-symbols-outlined" style="font-size: 18px; line-height: 1;">
              ${d.disruptionType === 'WEATHER' ? 'cyclone' : d.disruptionType === 'PORT_CONGESTION' ? 'directions_boat' : 'warning'}
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(geo.coords, { icon: centerIcon }).addTo(disruptionsGroup);

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0f172a; padding: 2px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
            <strong style="font-size: 12px; text-transform: uppercase;">${d.severity} Disruption</strong>
          </div>
          <div style="font-size: 13px; font-weight: 600; line-height: 1.3; margin-bottom: 4px;">${d.title}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${d.affectedRegion}</div>
          <div style="font-size: 11px; padding: 4px 6px; background: #f1f5f9; border-radius: 4px; margin-bottom: 6px;">
            ${d.affectedShipmentCount || 1} Impacted Consignments
          </div>
          <button style="
            width: 100%;
            padding: 5px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          " onclick="window.dispatchEvent(new CustomEvent('inspect-disruption', { detail: '${d.id}' }))">
            Inspect Disruption
          </button>
        </div>
      `);

      marker.on('click', () => {
        onSelectDisruption(d.id);
      });
    });
  }, [disruptions, selectedDisruptionId, onSelectDisruption]);

  // Render Tracked Shipment Markers
  useEffect(() => {
    const { shipmentsGroup } = layersRef.current;
    if (!shipmentsGroup) return;

    shipmentsGroup.clearLayers();

    shipments.forEach((s, idx) => {
      const coords = getShipmentCoords(s, idx);
      const isAtRisk = s.status === 'AT_RISK' || (s.riskScore !== null && s.riskScore >= 0.7);
      const isSelected = activeTrackingShipment?.id === s.id;

      const markerHtml = `
        <div style="
          position: relative;
          cursor: pointer;
          transition: transform 0.2s;
        " class="hover:scale-110">
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 3px 6px;
            border-radius: 6px;
            background: ${isSelected ? '#2563eb' : isAtRisk ? '#dc2626' : '#0f172a'};
            color: white;
            font-size: 10px;
            font-weight: 700;
            font-family: monospace;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            border: 1.5px solid ${isSelected ? '#60a5fa' : isAtRisk ? '#fca5a5' : '#475569'};
            white-space: nowrap;
          ">
            <span class="material-symbols-outlined" style="font-size: 12px; line-height: 1;">
              ${s.isColdChain ? 'ac_unit' : 'local_shipping'}
            </span>
            <span>${s.trackingNumber.slice(-7)}</span>
            ${isAtRisk ? '<span style="color: #fecaca;">!</span>' : ''}
          </div>
          ${
            isAtRisk
              ? `<div style="
                  position: absolute;
                  top: -4px;
                  right: -4px;
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: #ef4444;
                  box-shadow: 0 0 6px #ef4444;
                "></div>`
              : ''
          }
        </div>
      `;

      const shipIcon = L.divIcon({
        className: 'custom-shipment-marker',
        html: markerHtml,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const marker = L.marker(coords, { icon: shipIcon }).addTo(shipmentsGroup);

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 190px; color: #0f172a; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="font-size: 12px; font-family: monospace;">${s.trackingNumber}</strong>
            <span style="font-size: 10px; padding: 2px 5px; border-radius: 4px; background: ${isAtRisk ? '#fee2e2' : '#dcfce7'}; color: ${isAtRisk ? '#b91c1c' : '#15803d'}; font-weight: 700;">
              ${s.status}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
            ${s.origin} &rarr; ${s.destination}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            Carrier: <strong>${s.carrier}</strong> ${s.isColdChain ? '• <span style="color: #0284c7;">WHO 2-8°C</span>' : ''}
          </div>
          <button style="
            width: 100%;
            padding: 5px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          " onclick="window.dispatchEvent(new CustomEvent('track-shipment', { detail: '${s.id}' }))">
            View Live Telemetry
          </button>
        </div>
      `);

      marker.on('click', () => {
        setActiveTrackingShipment(s);
        if (onSelectShipment) onSelectShipment(s);
      });
    });

    // ── Render Live Meteorology & Weather Radar Layer ──
    const { weatherGroup } = layersRef.current;
    if (weatherGroup) {
      weatherGroup.clearLayers();

      if (showWeatherRadar && weatherNodes.length > 0) {
        weatherNodes.forEach((w) => {
          const isHazard = w.isHazardous;
          const badgeColor = isHazard ? (w.hazardSeverity === 'CRITICAL' ? '#ef4444' : '#f97316') : '#0284c7';

          const weatherIcon = L.divIcon({
            className: 'custom-weather-badge',
            html: `
              <div style="
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 2px 5px;
                border-radius: 6px;
                background: ${isHazard ? '#7f1d1dee' : '#0f172aee'};
                border: 1.5px solid ${badgeColor};
                color: #f8fafc;
                font-family: Inter, sans-serif;
                font-size: 10px;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(0,0,0,0.5);
                transform: translate(-50%, -120%);
                cursor: pointer;
                white-space: nowrap;
              ">
                <span class="material-symbols-outlined" style="font-size: 12px; color: ${isHazard ? '#fca5a5' : '#7dd3fc'};">
                  ${w.weatherIcon}
                </span>
                <span>${w.temperatureCelsius > 0 ? `+${w.temperatureCelsius}°C` : `${w.temperatureCelsius}°C`}</span>
                ${isHazard ? `<span style="color: #fecaca; font-size: 9px;">${w.windGustsKmh}kph</span>` : ''}
              </div>
            `,
            iconSize: [0, 0],
          });

          const marker = L.marker([w.latitude, w.longitude], { icon: weatherIcon });

          marker.bindTooltip(`
            <div style="font-family: Inter, sans-serif; font-size: 11px; padding: 2px;">
              <strong style="color: #38bdf8;">${w.name}</strong> (${w.country})<br/>
              <span>Condition: <strong>${w.weatherCondition}</strong></span><br/>
              <span>Temperature: <strong>${w.temperatureCelsius}°C</strong> • Wind: <strong>${w.windSpeedKmh} km/h (Gusts: ${w.windGustsKmh} km/h)</strong></span><br/>
              ${w.hazardDescription ? `<span style="color: #ef4444; font-weight: 600; font-size: 10px;">⚠️ ${w.hazardDescription}</span>` : '<span style="color: #10b981; font-size: 10px;">✓ Atmospheric conditions normal</span>'}
            </div>
          `);

          weatherGroup.addLayer(marker);

          if (isHazard && (w.hazardSeverity === 'CRITICAL' || w.hazardSeverity === 'HIGH')) {
            const stormRing = L.circle([w.latitude, w.longitude], {
              radius: 200000,
              color: badgeColor,
              fillColor: badgeColor,
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 4',
            });
            weatherGroup.addLayer(stormRing);
          }
        });
      }
    }
  }, [shipments, activeTrackingShipment, onSelectShipment, showWeatherRadar, weatherNodes]);

  // Center on selected disruption when changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedDisruptionId) return;

    const targetDisruption = disruptions.find((d) => d.id === selectedDisruptionId);
    if (targetDisruption) {
      const geo = getDisruptionCoords(targetDisruption);
      map.flyTo(geo.coords, 5, {
        duration: 1.4,
      });
    }
  }, [selectedDisruptionId, disruptions]);

  // Window event listeners for popup interactions
  useEffect(() => {
    const handleInspect = (e: any) => {
      if (e.detail) onSelectDisruption(e.detail);
    };
    const handleTrack = (e: any) => {
      const found = shipments.find((s) => s.id === e.detail);
      if (found) {
        setActiveTrackingShipment(found);
        if (onSelectShipment) onSelectShipment(found);
      }
    };

    window.addEventListener('inspect-disruption', handleInspect);
    window.addEventListener('track-shipment', handleTrack);

    return () => {
      window.removeEventListener('inspect-disruption', handleInspect);
      window.removeEventListener('track-shipment', handleTrack);
    };
  }, [onSelectDisruption, onSelectShipment, shipments]);

  return (
    <div className="relative w-full h-[420px] rounded-xl overflow-hidden shadow-lg border border-border-subtle bg-slate-950">
      {/* Map Tile & Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Map Style Switcher (Street / Satellite) & Weather Radar */}
      <div className="absolute top-3 left-3 flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 shadow-xl backdrop-blur-md z-10 text-xs flex-wrap gap-1">
        <button
          onClick={() => setMapStyle('STREET')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
            mapStyle === 'STREET'
              ? 'bg-primary text-on-primary font-semibold shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[14px]">map</span>
          <span>Street Map</span>
        </button>
        <button
          onClick={() => setMapStyle('SATELLITE')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
            mapStyle === 'SATELLITE'
              ? 'bg-primary text-on-primary font-semibold shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[14px]">satellite_alt</span>
          <span>Satellite</span>
        </button>
        <div className="w-px h-4 bg-slate-700 mx-0.5"></div>
        <button
          onClick={() => setShowWeatherRadar(!showWeatherRadar)}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
            showWeatherRadar
              ? 'bg-sky-600 text-white font-semibold shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
          type="button"
          title="Toggle Real-Time Open-Meteo Weather Radar Stream"
        >
          <span className="material-symbols-outlined text-[14px]">
            {showWeatherRadar ? 'cyclone' : 'cloud'}
          </span>
          <span>Weather Radar</span>
        </button>
      </div>

      {/* Top Right: Disruption & Tracking Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-md z-10 text-xs text-slate-200">
        <span className="w-2 h-2 rounded-full bg-risk-critical animate-ping"></span>
        <span className="font-semibold text-risk-critical">{disruptions.length} Active Incidents</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-300 font-mono">{shipments.length} Tracked Consignments</span>
      </div>

      {/* Bottom Left: Corridor & Hazard Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-md z-10 text-[11px] text-slate-300 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-risk-critical"></span>
          <span>Critical Disruption</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-risk-medium"></span>
          <span>Warning / Delay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-risk-low"></span>
          <span>Optimal Corridor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400"></span>
          <span>AI Detour Vector</span>
        </div>
      </div>
    </div>
  );
}
