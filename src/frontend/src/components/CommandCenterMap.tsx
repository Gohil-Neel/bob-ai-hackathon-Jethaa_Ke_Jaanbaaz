import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Disruption, Route, Shipment } from '../types/domain';

// ── Geographic Node Coordinates ─────────────────────────────────────────────
interface GeoNode {
  name: string;
  coords: [number, number]; // [lat, lng]
  country: string;
  type: 'SEA' | 'AIR' | 'RAIL' | 'ROAD' | 'CHOKEPOINT';
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export const GEO_NODES: Record<string, GeoNode> = {
  shanghai: { name: 'Port of Shanghai', coords: [31.2304, 121.4737], country: 'CN', type: 'SEA', status: 'CRITICAL' },
  rotterdam: { name: 'Port of Rotterdam', coords: [51.9244, 4.4777], country: 'NL', type: 'SEA', status: 'WARNING' },
  mumbai: { name: 'JNPT Mumbai', coords: [18.9499, 72.9515], country: 'IN', type: 'SEA', status: 'NORMAL' },
  hamburg: { name: 'Hamburg Port', coords: [53.5511, 9.9937], country: 'DE', type: 'ROAD', status: 'NORMAL' },
  dubai: { name: 'Jebel Ali / Dubai', coords: [25.0118, 55.0617], country: 'AE', type: 'AIR', status: 'NORMAL' },
  frankfurt: { name: 'Frankfurt CargoCity', coords: [50.0379, 8.5622], country: 'DE', type: 'AIR', status: 'NORMAL' },
  losangeles: { name: 'Port of Los Angeles', coords: [33.7432, -118.2673], country: 'US', type: 'SEA', status: 'NORMAL' },
  chicago: { name: 'Chicago Intermodal Hub', coords: [41.8781, -87.6298], country: 'US', type: 'RAIL', status: 'NORMAL' },
  singapore: { name: 'Changi / Singapore', coords: [1.3521, 103.8198], country: 'SG', type: 'AIR', status: 'NORMAL' },
  busan: { name: 'Port of Busan', coords: [35.1796, 129.0756], country: 'KR', type: 'SEA', status: 'NORMAL' },
  longbeach: { name: 'Long Beach Terminal', coords: [33.7701, -118.1937], country: 'US', type: 'SEA', status: 'NORMAL' },
  suez: { name: 'Suez Canal Chokepoint', coords: [30.6085, 32.3275], country: 'EG', type: 'CHOKEPOINT', status: 'WARNING' },
  malacca: { name: 'Strait of Malacca', coords: [4.2105, 100.5518], country: 'MY', type: 'CHOKEPOINT', status: 'NORMAL' },
  rhinewestphalia: { name: 'Rhine-Westphalia Rail Corridor', coords: [51.4332, 6.7623], country: 'DE', type: 'RAIL', status: 'WARNING' },
};

// ── Realistic Multi-Waypoint Corridors ──────────────────────────────────────
export interface RouteGeometry {
  id: string;
  name: string;
  carrier: string;
  color: string; // '#ef4444' (Red), '#f59e0b' (Yellow), '#10b981' (Green)
  status: 'CRITICAL' | 'WARNING' | 'OPTIMAL';
  transitHours: number;
  waypoints: [number, number][];
  detourWaypoints?: [number, number][];
}

export const ROUTE_GEOMETRIES: RouteGeometry[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    name: 'Shanghai - Rotterdam Express',
    carrier: 'MAERSK',
    color: '#ef4444', // Red: Typhoon Malakas & Rotterdam Congestion
    status: 'CRITICAL',
    transitHours: 672,
    waypoints: [
      [31.23, 121.47], // Shanghai
      [27.5, 123.8],   // East China Sea (Typhoon Zone)
      [18.0, 116.0],   // South China Sea
      [4.21, 100.55],  // Malacca Strait
      [5.9, 80.5],     // South of Sri Lanka
      [11.5, 58.0],    // Arabian Sea
      [12.58, 43.33],  // Bab el Mandeb
      [22.0, 38.0],    // Red Sea
      [30.6, 32.32],   // Suez Canal
      [34.5, 23.0],    // Mediterranean Sea
      [36.0, -5.0],    // Gibraltar
      [44.0, -9.0],    // Atlantic Off Spain
      [49.5, -4.0],    // English Channel Entry
      [51.92, 4.47],   // Port of Rotterdam
    ],
    detourWaypoints: [
      [31.23, 121.47], // Shanghai
      [24.5, 124.0],   // East Taiwan Outer Passage (Bypassing Typhoon)
      [20.0, 121.5],   // Luzon Strait
      [8.0, 110.0],    // Deep South China Sea
      [1.35, 103.82],  // Singapore Hub
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    name: 'Mumbai - Dubai - Hamburg Pharma Lane',
    carrier: 'DHL',
    color: '#f59e0b', // Yellow: Suez delay & Cold-Chain alert
    status: 'WARNING',
    transitHours: 480,
    waypoints: [
      [18.95, 72.95],  // JNPT Mumbai
      [23.0, 62.0],    // Arabian Sea
      [25.01, 55.06],  // Jebel Ali Dubai (Cold-Chain Hub)
      [31.0, 40.0],    // Air flight path across Middle East
      [38.0, 27.0],    // Aegean Sea corridor
      [46.0, 15.0],    // Central Europe Air Waypoint
      [50.04, 8.56],   // Frankfurt CargoCity
      [52.0, 9.2],     // German High-Speed Road Corridor
      [53.55, 9.99],   // Hamburg Port
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    name: 'Los Angeles - Chicago Rail-Road',
    carrier: 'FEDEX',
    color: '#10b981', // Green: Optimal & On-Time
    status: 'OPTIMAL',
    transitHours: 72,
    waypoints: [
      [33.74, -118.27], // Port of Los Angeles
      [34.89, -117.02], // Barstow Intermodal Rail Yard
      [35.19, -111.65], // Flagstaff, AZ
      [35.08, -106.65], // Albuquerque, NM
      [37.7, -97.3],    // Wichita Intermodal
      [39.09, -94.57],  // Kansas City Rail Hub
      [41.88, -87.63],  // Chicago Intermodal
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    name: 'Singapore - Frankfurt Air Freight',
    carrier: 'SCHENKER',
    color: '#10b981', // Green: Nominal Express Air Freight
    status: 'OPTIMAL',
    transitHours: 24,
    waypoints: [
      [1.35, 103.82],  // Singapore Changi
      [13.0, 88.0],    // Bay of Bengal Flight Path
      [22.0, 75.0],    // India Air Corridor
      [28.0, 56.0],    // Gulf Air Corridor
      [37.0, 36.0],    // Turkey Waypoint
      [45.0, 19.0],    // Balkans Waypoint
      [50.04, 8.56],   // Frankfurt CargoCity
    ],
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    name: 'Busan - Long Beach Transpacific',
    carrier: 'MSC',
    color: '#f59e0b', // Yellow: Pacific Weather Swell / Delayed
    status: 'WARNING',
    transitHours: 384,
    waypoints: [
      [35.18, 129.07],  // Port of Busan
      [36.5, 137.0],    // Sea of Japan
      [41.0, 155.0],    // Great Circle Pacific Track
      [43.0, 175.0],    // North Pacific Midpoint
      [42.0, -165.0],   // West Pacific Basin
      [37.5, -135.0],   // California Approach
      [33.77, -118.19], // Long Beach Terminal
    ],
  },
];

// ── Shipment Real-Time Geolocation Interpolator ──────────────────────────────
export interface TrackedShipmentMarker {
  shipment: Shipment;
  lat: number;
  lng: number;
  statusColor: string;
  carrier: string;
  heading: string;
  tempReading?: number;
}

function getShipmentPosition(s: Shipment): TrackedShipmentMarker {
  const trk = s.trackingNumber.toUpperCase();
  // Geolocation interpolation based on shipment status and route
  if (trk.includes('EU8821') || s.origin.includes('Shanghai')) {
    // Vessel at East China Sea / anchored outside Zhoushan
    return {
      shipment: s,
      lat: 28.8,
      lng: 122.8,
      statusColor: '#ef4444',
      carrier: 'MAERSK',
      heading: '215° SW (Anchored - Typhoon Alert)',
    };
  }
  if (trk.includes('BIO9942') || s.origin.includes('Mumbai')) {
    // Biologic load in transit between Dubai and Frankfurt
    return {
      shipment: s,
      lat: 25.1,
      lng: 55.2,
      statusColor: '#ef4444',
      carrier: 'DHL',
      heading: '320° NW (Jebel Ali Cold Hub Excursion)',
      tempReading: 9.8,
    };
  }
  if (trk.includes('US4419') || s.origin.includes('Los Angeles')) {
    // Train rolling near Flagstaff, Arizona
    return {
      shipment: s,
      lat: 35.15,
      lng: -111.7,
      statusColor: '#10b981',
      carrier: 'FEDEX',
      heading: '068° ENE (On-Time 55 mph)',
    };
  }
  if (trk.includes('MED7730') || s.origin.includes('Singapore')) {
    // Air cargo cruising over Arabian Sea
    return {
      shipment: s,
      lat: 26.5,
      lng: 60.2,
      statusColor: '#10b981',
      carrier: 'SCHENKER',
      heading: '305° NW (Flight Alt 36,000ft)',
      tempReading: 4.3,
    };
  }
  if (trk.includes('PAC3312') || s.origin.includes('Busan')) {
    // Container ship in mid-Pacific
    return {
      shipment: s,
      lat: 39.2,
      lng: -148.5,
      statusColor: '#f59e0b',
      carrier: 'MSC',
      heading: '095° E (Speed 16.5 kts)',
    };
  }
  // Default fallback
  return {
    shipment: s,
    lat: 30.0,
    lng: 50.0,
    statusColor: '#38bdf8',
    carrier: s.carrier || 'CARRIER',
    heading: '090° E',
  };
}

interface CommandCenterMapProps {
  routes: Route[];
  disruptions: Disruption[];
  shipments: Shipment[];
  selectedRouteId: string | null;
  selectedDisruptionId: string | null;
  onSelectRoute: (routeId: string | null) => void;
  onSelectDisruption: (disruptionId: string) => void;
  onSelectShipment?: (shipmentId: string) => void;
  showBlastRadius: boolean;
  showReroutes: boolean;
  mapLayer: 'ALL' | 'CORRIDORS' | 'DISRUPTIONS' | 'REROUTES';
}

export default function CommandCenterMap({
  routes,
  disruptions,
  shipments,
  selectedRouteId,
  selectedDisruptionId,
  onSelectRoute,
  onSelectDisruption,
  onSelectShipment,
  showBlastRadius,
  showReroutes,
  mapLayer,
}: CommandCenterMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    tileLayer?: L.TileLayer;
    routesGroup?: L.LayerGroup;
    disruptionsGroup?: L.LayerGroup;
    nodesGroup?: L.LayerGroup;
    shipmentsGroup?: L.LayerGroup;
  }>({});

  const [mapStyle, setMapStyle] = useState<'DARK' | 'STREET' | 'SATELLITE'>('DARK');
  const [activeTrackingShipment, setActiveTrackingShipment] = useState<Shipment | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Leaflet global dark command center map
    const map = L.map(mapContainerRef.current, {
      center: [26, 42],
      zoom: 2.4,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Tile URL dictionary (100% Free Open APIs)
    const tileUrls = {
      DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      STREET: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      SATELLITE: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    };

    const tileLayer = L.tileLayer(tileUrls[mapStyle], {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    layersRef.current.tileLayer = tileLayer;
    layersRef.current.routesGroup = L.layerGroup().addTo(map);
    layersRef.current.disruptionsGroup = L.layerGroup().addTo(map);
    layersRef.current.nodesGroup = L.layerGroup().addTo(map);
    layersRef.current.shipmentsGroup = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Style Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current.tileLayer) return;

    const tileUrls = {
      DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      STREET: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      SATELLITE: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    };

    layersRef.current.tileLayer.setUrl(tileUrls[mapStyle]);
  }, [mapStyle]);

  // Render Routes, Disruptions, Nodes, and Shipments onto Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { routesGroup, disruptionsGroup, nodesGroup, shipmentsGroup } = layersRef.current;
    if (!routesGroup || !disruptionsGroup || !nodesGroup || !shipmentsGroup) return;

    // Clear previous dynamic layers
    routesGroup.clearLayers();
    disruptionsGroup.clearLayers();
    nodesGroup.clearLayers();
    shipmentsGroup.clearLayers();

    // ── 1. RENDER CORRIDOR POLYLINES (Red / Yellow / Green) ───────────────
    if (mapLayer === 'ALL' || mapLayer === 'CORRIDORS') {
      ROUTE_GEOMETRIES.forEach((routeGeo) => {
        const isSelected = selectedRouteId === routeGeo.id;
        const isDimmed = selectedRouteId !== null && !isSelected;

        // Base Polyline Glow
        const polyline = L.polyline(routeGeo.waypoints, {
          color: routeGeo.color,
          weight: isSelected ? 4.5 : isDimmed ? 1.8 : 3.0,
          opacity: isDimmed ? 0.25 : 0.9,
          dashArray: routeGeo.status === 'CRITICAL' ? '8, 6' : routeGeo.status === 'WARNING' ? '6, 5' : undefined,
          lineCap: 'round',
          lineJoin: 'round',
        });

        polyline.on('click', () => {
          onSelectRoute(isSelected ? null : routeGeo.id);
        });

        // Hover Tooltip
        polyline.bindTooltip(
          `<div style="font-family: Inter, sans-serif; font-size: 11px; padding: 3px 6px;">
            <strong style="color: ${routeGeo.color};">${routeGeo.name}</strong><br/>
            <span>Carrier: ${routeGeo.carrier} • Transit: ${routeGeo.transitHours}h</span><br/>
            <span style="font-size: 10px; opacity: 0.8;">Status: ${routeGeo.status}</span>
          </div>`,
          { sticky: true, opacity: 0.95 }
        );

        routesGroup.addLayer(polyline);

        // AI Recommended Detour Reroute (if enabled)
        if (showReroutes && routeGeo.detourWaypoints) {
          const detourLine = L.polyline(routeGeo.detourWaypoints, {
            color: '#10b981',
            weight: 3.2,
            opacity: 0.95,
            dashArray: '5, 5',
          });
          detourLine.bindTooltip(
            `<div style="font-family: Inter, sans-serif; font-size: 11px; color: #10b981; font-weight: 600;">
              ✨ AI Recommended Detour Bypass (Saves 24h)
            </div>`,
            { sticky: true }
          );
          routesGroup.addLayer(detourLine);
        }
      });
    }

    // ── 2. RENDER DISRUPTION EPICENTERS & BLAST RADII ─────────────────────
    if (mapLayer === 'ALL' || mapLayer === 'DISRUPTIONS') {
      disruptions.forEach((d) => {
        const title = (d.title + ' ' + d.affectedRegion).toLowerCase();
        let centerCoords: [number, number] = [28.0, 123.5]; // Default East China Sea
        let radiusMeters = 550000;
        let iconHtml = '🌀';
        let color = '#ef4444';

        if (title.includes('typhoon') || title.includes('shanghai') || title.includes('weather')) {
          centerCoords = [28.2, 123.8];
          radiusMeters = 600000; // 600km typhoon blast radius
          iconHtml = '🌀';
          color = '#ef4444';
        } else if (title.includes('rotterdam') || title.includes('berth') || title.includes('congestion')) {
          centerCoords = [51.92, 4.47];
          radiusMeters = 85000; // 85km port congestion zone
          iconHtml = '⚓';
          color = '#f59e0b';
        } else if (title.includes('suez') || title.includes('canal') || title.includes('egypt')) {
          centerCoords = [30.6, 32.32];
          radiusMeters = 65000; // 65km canal chokepoint
          iconHtml = '⚠️';
          color = '#f59e0b';
        } else if (title.includes('rail') || title.includes('strike') || title.includes('germany')) {
          centerCoords = [51.43, 6.76];
          radiusMeters = 120000; // 120km rail strike boundary
          iconHtml = '🛑';
          color = '#ef4444';
        }

        const isSelected = selectedDisruptionId === d.id;

        // Disruption Impact Blast Radius Circle
        if (showBlastRadius) {
          const circle = L.circle(centerCoords, {
            radius: radiusMeters,
            color: color,
            fillColor: color,
            fillOpacity: isSelected ? 0.35 : 0.15,
            weight: isSelected ? 2.5 : 1.2,
            dashArray: '6, 6',
          });
          circle.on('click', () => onSelectDisruption(d.id));
          disruptionsGroup.addLayer(circle);
        }

        // Custom Animated Disruption Icon
        const disruptionIcon = L.divIcon({
          className: 'custom-disruption-marker',
          html: `
            <div style="
              width: ${isSelected ? 36 : 28}px;
              height: ${isSelected ? 36 : 28}px;
              border-radius: 50%;
              background: ${color}25;
              border: 2px solid ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${isSelected ? 16 : 13}px;
              box-shadow: 0 0 16px ${color}80;
              cursor: pointer;
              transform: translate(-50%, -50%);
              animation: ${d.disruptionType === 'WEATHER' ? 'spin 18s linear infinite' : 'pulse 2s infinite'};
            ">
              ${iconHtml}
            </div>
          `,
          iconSize: [0, 0],
        });

        const marker = L.marker(centerCoords, { icon: disruptionIcon });
        marker.on('click', () => onSelectDisruption(d.id));
        marker.bindTooltip(
          `<div style="font-family: Inter, sans-serif; font-size: 11px;">
            <strong style="color: ${color};">${d.title}</strong><br/>
            <span style="color: #cbd5e1;">${d.affectedRegion}</span><br/>
            <span style="font-size: 10px; color: ${color}; font-weight: 600;">Severity: ${d.severity}</span>
          </div>`,
          { sticky: true }
        );
        disruptionsGroup.addLayer(marker);
      });
    }

    // ── 3. RENDER MULTI-MODAL NODE PINS (Ports, Airports, Hubs) ───────────
    Object.entries(GEO_NODES).forEach(([key, node]) => {
      const isCritical = node.status === 'CRITICAL';
      const isWarning = node.status === 'WARNING';
      const pinColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8';

      const nodeIcon = L.divIcon({
        className: 'custom-node-pin',
        html: `
          <div style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${pinColor};
            border: 2px solid #070b12;
            box-shadow: 0 0 8px ${pinColor};
            transform: translate(-50%, -50%);
            cursor: pointer;
          "></div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker(node.coords, { icon: nodeIcon });
      marker.bindTooltip(
        `<div style="font-family: Inter, sans-serif; font-size: 11px;">
          <strong style="color: ${pinColor};">${node.name}</strong> (${node.country})<br/>
          <span style="font-size: 10px; opacity: 0.8;">Type: ${node.type} • Status: ${node.status}</span>
        </div>`,
        { direction: 'top', offset: [0, -6] }
      );
      nodesGroup.addLayer(marker);
    });

    // ── 4. RENDER REAL-TIME TRACKED SHIPMENTS ─────────────────────────────
    shipments.forEach((shipment) => {
      const markerData = getShipmentPosition(shipment);
      const isTracked = activeTrackingShipment?.id === shipment.id;

      const isColdChain = shipment.isColdChain;
      const isExcursion = markerData.tempReading && markerData.tempReading > 8.0;

      const vehicleIcon = L.divIcon({
        className: 'custom-shipment-marker',
        html: `
          <div style="
            padding: 2px 6px;
            border-radius: 12px;
            background: #0f172aee;
            border: 1.5px solid ${isTracked ? '#38bdf8' : markerData.statusColor};
            color: #f8fafc;
            font-family: Inter, sans-serif;
            font-size: 10px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.6);
            transform: translate(-50%, -50%);
            cursor: pointer;
            white-space: nowrap;
          ">
            <span style="
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: ${markerData.statusColor};
              display: inline-block;
            "></span>
            <span>${markerData.carrier}</span>
            ${isColdChain ? `<span style="color: ${isExcursion ? '#ef4444' : '#38bdf8'}; font-size: 9px;">${markerData.tempReading ? markerData.tempReading + '°C' : '❄️'}</span>` : ''}
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([markerData.lat, markerData.lng], { icon: vehicleIcon });

      marker.on('click', () => {
        setActiveTrackingShipment(shipment);
        if (onSelectShipment) onSelectShipment(shipment.id);
        map.flyTo([markerData.lat, markerData.lng], 5.5, { duration: 1.2 });
      });

      marker.bindPopup(
        `<div style="font-family: Inter, sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #38bdf8; font-size: 12px;">${shipment.trackingNumber}</strong>
            <span style="background: ${markerData.statusColor}25; color: ${markerData.statusColor}; font-size: 10px; padding: 1px 5px; border-radius: 4px; font-weight: 600;">
              ${shipment.status}
            </span>
          </div>
          <div style="font-size: 11px; line-height: 1.5; color: #cbd5e1;">
            <div><strong>Route:</strong> ${shipment.origin} → ${shipment.destination}</div>
            <div><strong>Carrier:</strong> ${markerData.carrier}</div>
            <div><strong>Telemetry:</strong> ${markerData.heading}</div>
            ${markerData.tempReading ? `<div><strong>Temperature:</strong> <span style="color: ${isExcursion ? '#ef4444' : '#10b981'}; font-weight: 600;">${markerData.tempReading}°C (WHO 2–8°C)</span></div>` : ''}
            ${shipment.riskScore ? `<div><strong>Risk Score:</strong> ${(shipment.riskScore * 100).toFixed(0)}%</div>` : ''}
          </div>
        </div>`
      );

      shipmentsGroup.addLayer(marker);
    });
  }, [routes, disruptions, shipments, selectedRouteId, selectedDisruptionId, mapLayer, showBlastRadius, showReroutes, activeTrackingShipment]);

  // Handle Fly-To Focus when selectedRouteId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRouteId) return;

    const routeGeo = ROUTE_GEOMETRIES.find((r) => r.id === selectedRouteId);
    if (routeGeo && routeGeo.waypoints.length > 0) {
      const bounds = L.latLngBounds(routeGeo.waypoints);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
    }
  }, [selectedRouteId]);

  // Reset View Handler
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([26, 42], 2.4, { duration: 1 });
    onSelectRoute(null);
  };

  return (
    <div className="relative w-full h-[520px] bg-[#070b12] rounded-b-lg overflow-hidden select-none">
      {/* Real Interactive Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Style Controls (Tactical Dark, Satellite, Street) */}
      <div className="absolute top-3 left-3 flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 shadow-xl backdrop-blur-md z-10 text-xs">
        <button
          onClick={() => setMapStyle('DARK')}
          className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
            mapStyle === 'DARK'
              ? 'bg-primary text-on-primary font-semibold shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[14px]">dark_mode</span>
          Tactical Dark
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
          Satellite
        </button>
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
          Street Map
        </button>
      </div>

      {/* Map Zoom & Pan Control HUD */}
      <div className="absolute bottom-4 right-3 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 shadow-xl backdrop-blur-md z-10">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="w-7 h-7 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 transition-colors rounded"
          type="button"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
        </button>
        <div className="h-px bg-slate-700/60"></div>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="w-7 h-7 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 transition-colors rounded"
          type="button"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[17px]">remove</span>
        </button>
        <div className="h-px bg-slate-700/60"></div>
        <button
          onClick={handleResetView}
          aria-label="Reset view"
          className="w-7 h-7 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 transition-colors rounded"
          type="button"
          title="Reset Global View"
        >
          <span className="material-symbols-outlined text-[17px]">public</span>
        </button>
      </div>

      {/* Path Legend Bar */}
      <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-md z-10 flex items-center gap-4 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-risk-critical rounded-full"></span>
          <span>Critical Disruption</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-risk-medium rounded-full"></span>
          <span>Delay Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-risk-low rounded-full"></span>
          <span>Optimal Corridor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 border-t-2 border-dashed border-emerald-400"></span>
          <span>AI Detour</span>
        </div>
      </div>

      {/* Live Tracked Shipment Floating Card (when active) */}
      {activeTrackingShipment && (
        <div className="absolute top-14 left-3 bg-slate-900/95 border border-sky-500/50 rounded-lg p-3 shadow-2xl backdrop-blur-md z-10 max-w-[280px] text-xs text-slate-200 animate-fade-in">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-sky-400">
              <span className="material-symbols-outlined text-[15px] animate-spin">navigation</span>
              <span>Live Tracking</span>
            </div>
            <button
              onClick={() => setActiveTrackingShipment(null)}
              className="text-slate-400 hover:text-white"
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Tracking #:</span>
              <span className="font-mono font-bold text-white">{activeTrackingShipment.trackingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Route:</span>
              <span>{activeTrackingShipment.origin} → {activeTrackingShipment.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Carrier:</span>
              <span className="font-semibold text-sky-300">{activeTrackingShipment.carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`font-semibold ${activeTrackingShipment.status === 'AT_RISK' ? 'text-red-400' : 'text-emerald-400'}`}>
                {activeTrackingShipment.status}
              </span>
            </div>
            {activeTrackingShipment.isColdChain && (
              <div className="flex justify-between">
                <span className="text-slate-400">Cold Chain:</span>
                <span className="text-sky-300 font-medium">2°C–8°C Monitored</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
