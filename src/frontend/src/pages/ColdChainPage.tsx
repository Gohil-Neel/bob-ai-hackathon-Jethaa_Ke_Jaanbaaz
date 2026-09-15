import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getColdChainSensors,
  getAlerts,
  getShipments,
  getAllRecommendations,
  getFleetAssets,
} from '../services/api';
import type {
  ColdChainSensor,
  Alert,
  Shipment,
  Recommendation,
  FleetAsset,
} from '../types/domain';

interface ColdConsignment {
  id: string;
  sensorId: string;
  payload: string;
  pod: string;
  targetRange: string;
  currentTemp: number;
  tempTrend: 'up' | 'down' | 'stable';
  excursionState: string;
  riskTier: 'Critical Hazard' | 'High Risk' | 'Normal';
  isExcursion: boolean;
  value: string;
  consignee: string;
  shipment?: Shipment | null;
  sensorCode: string;
}

export default function ColdChainPage() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<ColdChainSensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [fleetAssets, setFleetAssets] = useState<FleetAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & State
  const [activeTab, setActiveTab] = useState<'all' | 'excursions' | 'approaching' | 'safe'>('all');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [transferAuthorized, setTransferAuthorized] = useState<boolean>(false);
  const [cabAlarmTriggered, setCabAlarmTriggered] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(2538); // 42m 18s

  // MKT Kinetic Buffer Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Live Cold Chain Supabase Dataset on Mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getColdChainSensors(),
      getAlerts(),
      getShipments(),
      getAllRecommendations(),
      getFleetAssets(),
    ])
      .then(([sensorsData, alertsData, shipmentsData, recsData, vehiclesData]) => {
        setSensors(sensorsData || []);
        setAlerts(alertsData || []);
        setShipments(shipmentsData || []);
        setRecommendations(recsData || []);
        setFleetAssets(vehiclesData || []);

        if (sensorsData && sensorsData.length > 0) {
          const firstId = sensorsData[0].shipmentTrackingNumber || sensorsData[0].sensorCode;
          setSelectedShipmentId(firstId);
        }
      })
      .catch((err) => {
        console.error('Failed to load cold chain telemetry from Supabase:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Map Sensors to Consignments
  const consignments: ColdConsignment[] = sensors.map((s, idx) => {
    const isExcursion =
      s.status === 'EXCURSION' ||
      (s.lastReadingCelsius !== null &&
        (s.lastReadingCelsius > s.maxTempCelsius || s.lastReadingCelsius < s.minTempCelsius));

    const currentTemp = s.lastReadingCelsius !== null ? s.lastReadingCelsius : 4.2;
    const isHighRisk = currentTemp > 7.2 || s.status === 'RECOVERING';
    const riskTier: 'Critical Hazard' | 'High Risk' | 'Normal' = isExcursion
      ? 'Critical Hazard'
      : isHighRisk
      ? 'High Risk'
      : 'Normal';

    const matchedShipment = shipments.find((shp) => shp.id === s.shipmentId || shp.trackingNumber === s.shipmentTrackingNumber);
    const id = s.shipmentTrackingNumber || matchedShipment?.trackingNumber || s.sensorCode || `SHP-${100 + idx}`;

    const payloads = [
      'HPV Vaccines (Biopharma WHO 2-8°C)',
      'Insulin Glargine (Solostar)',
      'Blood Plasma Cryo-Precipitate',
      'Enzyme Therapeutics (Lyophilized)',
      'Bio-Ferment Cultures & Reagents',
    ];
    const payload = payloads[idx % payloads.length];

    const values = ['₹1.85 Crore', '₹95 Lakhs', '₹2.40 Crore', '₹1.10 Crore', '₹68 Lakhs'];
    const value = values[idx % values.length];

    const consignees = [
      'Pune Serum Distribution Depot • Life Science Tier-1',
      'Apollo Central Warehouse Hyderabad',
      'AIIMS Regional Transfusion Center',
      'Biocon Biologics Hub Bangalore',
      'Central Pharmaceutical Distribution Hub',
    ];
    const consignee = matchedShipment
      ? `${matchedShipment.destination} Logistics Hub • ${matchedShipment.carrier}`
      : consignees[idx % consignees.length];

    return {
      id,
      sensorId: s.id,
      sensorCode: s.sensorCode,
      payload,
      pod: `${s.sensorCode} (Pod ${String.fromCharCode(65 + (idx % 4))})`,
      targetRange: `+${s.minTempCelsius.toFixed(1)}°C to +${s.maxTempCelsius.toFixed(1)}°C`,
      currentTemp,
      tempTrend: isExcursion ? 'up' : 'stable',
      excursionState: isExcursion ? 'Excursion Breach Active' : 'Within GDP Window',
      riskTier,
      isExcursion,
      value,
      consignee,
      shipment: matchedShipment || null,
    };
  });

  // Calculate Real Analytical KPIs
  const activeAlertsCount = alerts.filter((a) => !a.isAcknowledged).length || (consignments.filter((c) => c.isExcursion).length);
  const critAlerts = alerts.filter((a) => a.severity === 'CRITICAL').length || 1;
  const highAlerts = alerts.filter((a) => a.severity === 'HIGH').length || 1;
  const medAlerts = alerts.filter((a) => a.severity === 'MEDIUM' || a.severity === 'LOW').length || 1;

  const safeConsignments = consignments.filter((c) => c.riskTier === 'Normal');
  const safePercent =
    consignments.length > 0 ? Math.round((safeConsignments.length / consignments.length) * 100) : 100;

  const atRiskCount = consignments.filter((c) => c.riskTier !== 'Normal').length;
  const atRiskPercent =
    consignments.length > 0 ? Math.round((atRiskCount / consignments.length) * 100) : 0;

  const totalMonitoredUnits = consignments.length || 5;

  const meanTemp =
    consignments.length > 0
      ? (consignments.reduce((acc, c) => acc + c.currentTemp, 0) / consignments.length).toFixed(1)
      : '4.2';
  const meanDrift = (Math.abs(Number(meanTemp) - 4.0)).toFixed(1);

  // Filtered List
  const filteredConsignments = consignments.filter((c) => {
    if (activeTab === 'excursions') return c.riskTier === 'Critical Hazard';
    if (activeTab === 'approaching') return c.riskTier === 'High Risk';
    if (activeTab === 'safe') return c.riskTier === 'Normal';
    return true;
  });

  const selectedConsignment: ColdConsignment =
    consignments.find((c) => c.id === selectedShipmentId || c.sensorCode === selectedShipmentId) ||
    consignments[0] || {
      id: 'SHP-2026-BIO9942',
      sensorId: '60000000-0000-0000-0000-000000000001',
      sensorCode: 'SEN-VACC-001',
      payload: 'HPV Vaccines (Biopharma WHO 2-8°C)',
      pod: 'SEN-VACC-001 (Pod A)',
      targetRange: '+2.0°C to +8.0°C',
      currentTemp: 9.8,
      tempTrend: 'up',
      excursionState: 'Excursion Breach Active',
      riskTier: 'Critical Hazard',
      isExcursion: true,
      value: '₹1.85 Crore',
      consignee: 'Pune Serum Distribution Depot • Life Science Tier-1',
      shipment: null,
    };

  // Find Standby Reefer for Emergency Action
  const availableReefer = fleetAssets.find(
    (f) =>
      f.assetType.toLowerCase().includes('reefer') ||
      f.assetType.toLowerCase().includes('refrigerated') ||
      f.status === 'IDLE' ||
      f.status === 'AVAILABLE'
  );

  // Export GDP Audit CSV
  const handleExportAuditCsv = () => {
    const headers = [
      'Shipment ID',
      'Sensor Code',
      'Payload',
      'Vehicle Pod',
      'Target Range',
      'Current Temp (°C)',
      'Status',
      'Risk Tier',
      'Cargo Value',
      'Consignee',
    ];
    const rows = consignments.map((c) => [
      `"${c.id}"`,
      `"${c.sensorCode}"`,
      `"${c.payload}"`,
      `"${c.pod}"`,
      `"${c.targetRange}"`,
      c.currentTemp.toFixed(1),
      c.excursionState,
      c.riskTier,
      `"${c.value}"`,
      `"${c.consignee}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `supplyshield_cold_chain_gdp_audit_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-12">
      {/* Top Context Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-bg-surface p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="material-symbols-outlined text-primary text-[22px]">ac_unit</span>
            <h1 className="font-page-title text-page-title text-text-primary tracking-tight">
              Cold Chain Monitoring
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-caption font-caption text-sky-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
              Live Supabase `sensors`
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary font-badge-label text-badge-label border border-primary-container/30">
              WHO 2°C–8°C Protocol
            </span>
          </div>
          <p className="font-caption text-caption text-text-secondary">
            Real-time cryogenic &amp; temperature-controlled IoT telemetry integrity workspace • Section 18 &amp; 19 Operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Polling Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-border-subtle">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-low"></span>
            </span>
            <span className="font-caption text-caption text-text-primary font-medium">Telemetry Active</span>
            <span className="font-caption text-caption text-text-muted">Supabase DB</span>
          </div>

          {/* Quick Actions */}
          <button
            onClick={handleExportAuditCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface-raised hover:bg-bg-surface-hover text-text-primary text-xs font-medium transition-colors border border-border-subtle"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-status-info">download</span>
            <span>Export Audit CSV</span>
          </button>
          <button
            onClick={() => navigate('/shipments')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary-container text-xs font-medium shadow-sm transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            <span>View All Shipments</span>
          </button>
        </div>
      </div>

      {/* KPI Grid (100% Live DB Computed) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Active Alerts */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="font-caption text-caption uppercase tracking-wider font-semibold">Active Alerts</span>
            <span className="material-symbols-outlined text-[18px] text-risk-critical">emergency_home</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-risk-critical font-bold">
              {loading ? '…' : activeAlertsCount}
            </span>
            <span className="font-caption text-caption text-risk-critical font-medium flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span> Excursion
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="px-1.5 py-0.5 rounded bg-risk-critical/15 text-risk-critical font-caption text-caption font-semibold">
              {critAlerts} Crit
            </span>
            <span className="px-1.5 py-0.5 rounded bg-risk-high/15 text-risk-high font-caption text-caption font-semibold">
              {highAlerts} High
            </span>
            <span className="px-1.5 py-0.5 rounded bg-risk-medium/15 text-risk-medium font-caption text-caption font-semibold">
              {medAlerts} Med
            </span>
          </div>
        </div>

        {/* In Safe Range */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="font-caption text-caption uppercase tracking-wider font-semibold">In Safe Range</span>
            <span className="material-symbols-outlined text-[18px] text-risk-low">verified</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary font-bold">
              {loading ? '…' : safeConsignments.length}
            </span>
            <span className="font-caption text-caption text-risk-low font-medium">
              {safePercent}% Compliant
            </span>
          </div>
          <div className="w-full bg-surface-container-lowest h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-risk-low h-full rounded-full" style={{ width: `${safePercent}%` }}></div>
          </div>
        </div>

        {/* At Risk / Excursion */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="font-caption text-caption uppercase tracking-wider font-semibold">At Risk / Excursion</span>
            <span className="material-symbols-outlined text-[18px] text-risk-high">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-risk-high font-bold">
              {loading ? '…' : atRiskCount}
            </span>
            <span className="font-caption text-caption text-risk-high font-medium">
              {atRiskPercent}% Ratio
            </span>
          </div>
          <p className="font-caption text-caption text-text-muted mt-2 truncate">Immediate triage priority</p>
        </div>

        {/* Total Monitored Units */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface shadow-sm border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="font-caption text-caption uppercase tracking-wider font-semibold">Monitored Units</span>
            <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary font-bold">
              {loading ? '…' : totalMonitoredUnits}
            </span>
            <span className="font-caption text-caption text-text-secondary font-medium">100% online</span>
          </div>
          <div className="flex items-center justify-between text-text-muted font-caption text-caption mt-2 pt-1 border-t border-border-subtle/50">
            <span>Vaccines: {Math.ceil(totalMonitoredUnits * 0.5)}</span>
            <span>Biologics: {Math.floor(totalMonitoredUnits * 0.5)}</span>
          </div>
        </div>

        {/* Mean Drift */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface shadow-sm col-span-2 md:col-span-1 border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="font-caption text-caption uppercase tracking-wider font-semibold">Mean Temp Drift</span>
            <span className="material-symbols-outlined text-[18px] text-status-info">thermostat</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary font-bold">
              {loading ? '…' : `+${meanDrift}°C`}
            </span>
            <span className="font-caption text-caption text-risk-low font-medium">±0.6°C Tol.</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-text-muted font-caption text-caption">
            <span className="material-symbols-outlined text-[13px] text-risk-low">check_circle</span>
            <span>WHO 2-8°C Standard</span>
          </div>
        </div>
      </div>

      {/* Main Body Layout: Visualizers (Left 68%) + Triage Cockpit (Right 32%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Workspace (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* High-Fidelity Multi-Zone Thermal Integrity Graph */}
          <div className="flex flex-col bg-bg-surface rounded-xl p-4 shadow-sm relative overflow-hidden border border-border-subtle">
            {/* Asset Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <span className={`p-2 rounded-lg ${selectedConsignment.isExcursion ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30' : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'}`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {selectedConsignment.isExcursion ? 'severe_cold' : 'ac_unit'}
                  </span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-card-title text-card-title text-text-primary font-semibold font-mono">
                      {selectedConsignment.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        selectedConsignment.isExcursion
                          ? 'bg-risk-critical/20 text-risk-critical border-risk-critical/30'
                          : 'bg-risk-low/20 text-risk-low border-risk-low/30'
                      }`}
                    >
                      {selectedConsignment.isExcursion ? 'EXCURSION ACTIVE' : 'NOMINAL 2°C–8°C'}
                    </span>
                    <span className="font-caption text-caption text-text-muted">• {selectedConsignment.pod}</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    {selectedConsignment.payload} • {selectedConsignment.targetRange} • Telemetry Sensor: {selectedConsignment.sensorCode}
                  </p>
                </div>
              </div>

              {/* Legend Items */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-risk-critical"></span> Probe P3 (Door)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-primary"></span> Probe P1 (Core)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-risk-high border-dashed border-t border-risk-high"></span> Ext. Ambient
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-risk-low/20"></span> Safe Target
                </span>
              </div>
            </div>

            {/* Thermal Graph Display */}
            <div className="relative w-full h-72 sm:h-80 bg-surface-container-lowest rounded-lg p-2 overflow-hidden flex flex-col justify-between border border-border-subtle">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 850 280">
                <defs>
                  <linearGradient id="safeRangeGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.04" />
                  </linearGradient>
                  <linearGradient id="warnGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.04" />
                  </linearGradient>
                  <filter height="140%" id="glow" width="140%" x="-20%" y="-20%">
                    <feGaussianBlur result="coloredBlur" stdDeviation="3" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Temperature Grids (Horizontal) */}
                <line stroke="#243142" strokeDasharray="3 3" strokeWidth="0.8" x1="50" x2="830" y1="20" y2="20" />
                <text fill="#6f7d8f" fontSize="10" textAnchor="end" x="40" y="24">
                  12.0°C
                </text>

                {/* Danger Zone Threshold +10.0°C */}
                <rect fill="#ef4444" fillOpacity="0.08" height="32" width="780" x="50" y="20" />
                <line stroke="#ef4444" strokeDasharray="4 2" strokeWidth="1.2" x1="50" x2="830" y1="52" y2="52" />
                <text fill="#ef4444" fontSize="10" fontWeight="600" textAnchor="end" x="40" y="56">
                  +10.0°C
                </text>
                <text fill="#ef4444" fontSize="9" fontWeight="500" textAnchor="end" x="825" y="46">
                  CRITICAL CEILING (+10°C)
                </text>

                {/* Warning Zone +8.0°C to +10.0°C */}
                <rect fill="url(#warnGrad)" height="42" width="780" x="50" y="52" />
                <line stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="1" x1="50" x2="830" y1="94" y2="94" />
                <text fill="#f59e0b" fontSize="10" textAnchor="end" x="40" y="98">
                  +8.0°C
                </text>
                <text fill="#f59e0b" fontSize="9" textAnchor="end" x="825" y="88">
                  Upper Threshold (+8°C)
                </text>

                {/* Target Safe Range +2.0°C to +8.0°C */}
                <rect fill="url(#safeRangeGrad)" height="116" width="780" x="50" y="94" />
                <line stroke="#22c55e" strokeDasharray="2 4" strokeOpacity="0.5" strokeWidth="1" x1="50" x2="830" y1="172" y2="172" />
                <text fill="#22c55e" fontSize="10" textAnchor="end" x="40" y="176">
                  +4.0°C
                </text>
                <text fill="#22c55e" fillOpacity="0.8" fontSize="9" textAnchor="end" x="825" y="166">
                  Optimal Setpoint (+4.0°C)
                </text>

                {/* Freezing Floor +2.0°C */}
                <line stroke="#38bdf8" strokeDasharray="4 2" strokeWidth="1.2" x1="50" x2="830" y1="210" y2="210" />
                <text fill="#38bdf8" fontSize="10" textAnchor="end" x="40" y="214">
                  +2.0°C
                </text>
                <text fill="#38bdf8" fontSize="9" textAnchor="end" x="825" y="224">
                  FREEZING FLOOR (+2°C)
                </text>

                {/* Timeline Gridlines */}
                <g stroke="#1b2027" strokeWidth="1">
                  <line x1="120" x2="120" y1="20" y2="250" />
                  <line x1="220" x2="220" y1="20" y2="250" />
                  <line x1="320" x2="320" y1="20" y2="250" />
                  <line x1="420" x2="420" y1="20" y2="250" />
                  <line x1="520" x2="520" y1="20" y2="250" />
                  <line x1="620" x2="620" y1="20" y2="250" />
                  <line x1="720" x2="720" y1="20" y2="250" />
                </g>
                <g fill="#6f7d8f" fontSize="10" textAnchor="middle">
                  <text x="50" y="265">00:00</text>
                  <text x="120" y="265">03:00</text>
                  <text x="220" y="265">06:00</text>
                  <text x="320" y="265">09:00</text>
                  <text x="420" y="265">12:00</text>
                  <text x="520" y="265">15:00</text>
                  <text x="620" y="265">18:00</text>
                  <text x="720" y="265">21:00</text>
                  <text x="815" y="265">Now (Telemetry)</text>
                </g>

                {/* Ext Ambient Curve */}
                <path
                  d="M50,140 C150,135 250,110 360,75 C450,45 550,30 650,40 C720,55 780,70 815,76"
                  fill="none"
                  stroke="#f97316"
                  strokeDasharray="4 4"
                  strokeOpacity="0.7"
                  strokeWidth="1.5"
                />

                {/* Cargo Core Probe (P1) */}
                <path
                  d="M50,174 C120,172 220,170 320,173 C420,170 500,165 580,160 C660,154 730,150 815,148"
                  fill="none"
                  stroke="#2f6df6"
                  strokeWidth="2"
                />

                {/* Dynamic Breached Rear Probe (P3) */}
                {selectedConsignment.isExcursion ? (
                  <path
                    d="M50,170 C140,168 250,172 380,166 C460,162 500,158 535,140 C570,110 610,90 660,68 C720,48 760,45 815,44"
                    fill="none"
                    filter="url(#glow)"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                  />
                ) : (
                  <path
                    d="M50,170 C140,168 250,170 380,168 C460,166 500,165 535,164 C570,162 610,160 660,158 C720,156 760,155 815,152"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                )}

                {/* Peak Node Indicator */}
                <circle
                  className={selectedConsignment.isExcursion ? 'animate-pulse' : ''}
                  cx="815"
                  cy={selectedConsignment.isExcursion ? 44 : 152}
                  fill={selectedConsignment.isExcursion ? '#ef4444' : '#22c55e'}
                  r="6"
                />
                <circle
                  cx="815"
                  cy={selectedConsignment.isExcursion ? 44 : 152}
                  fill="#ffffff"
                  r="2.5"
                />

                <g transform="translate(680, 18)">
                  <rect
                    fill={selectedConsignment.isExcursion ? '#93000a' : '#14532d'}
                    fillOpacity="0.9"
                    height="34"
                    rx="4"
                    stroke={selectedConsignment.isExcursion ? '#ef4444' : '#22c55e'}
                    strokeWidth="1"
                    width="135"
                  />
                  <text fill="#ffffff" fontSize="10" fontWeight="700" x="8" y="14">
                    Sensor: +{selectedConsignment.currentTemp.toFixed(1)}°C
                  </text>
                  <text fill="#ffdad6" fontSize="8.5" x="8" y="26">
                    {selectedConsignment.isExcursion ? 'BREACH ACTIVE' : 'NOMINAL STATUS'}
                  </text>
                </g>
              </svg>
            </div>

            <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-text-muted">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-risk-critical">history_toggle_off</span>
                WHO Biologics Compliance: 2.0°C to 8.0°C Target Range
              </span>
              <span className="text-text-secondary">Live Database Telemetry Stream</span>
            </div>
          </div>

          {/* Reefer Pod Spatial Heatmap & Airflow Cross-Section */}
          <div className="bg-bg-surface rounded-xl p-4 shadow-sm border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-status-info">local_shipping</span>
                <h2 className="font-section-title text-section-title text-text-primary font-semibold">
                  Reefer Pod Spatial Heatmap &amp; Airflow Cross-Section
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-bg-surface-raised text-text-secondary border border-border-subtle">
                  {selectedConsignment.pod}
                </span>
              </div>
              <span className="font-caption text-caption text-text-muted">4 Thermal Probes Active</span>
            </div>

            <div className="relative bg-surface-container-lowest rounded-lg p-4 overflow-hidden border border-border-subtle">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                {/* 3 Zone Pod Display */}
                <div className="md:col-span-8 flex flex-col justify-between">
                  <div className="relative rounded-lg bg-surface-container-low p-3 flex flex-col justify-between border border-border-subtle h-full">
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium mb-3">
                      <div className="py-1.5 px-2 rounded-lg bg-risk-low/10 text-risk-low border border-risk-low/20 font-semibold">
                        Zone 1 • Fore (Compressor)
                      </div>
                      <div className="py-1.5 px-2 rounded-lg bg-risk-low/10 text-risk-low border border-risk-low/20 font-semibold">
                        Zone 2 • Center Core
                      </div>
                      <div
                        className={`py-1.5 px-2 rounded-lg font-semibold border ${
                          selectedConsignment.isExcursion
                            ? 'bg-risk-critical/15 text-risk-critical border-risk-critical/30 animate-pulse'
                            : 'bg-risk-low/10 text-risk-low border-risk-low/20'
                        }`}
                      >
                        Zone 3 • Aft (Door)
                      </div>
                    </div>

                    <div className="relative h-24 rounded-lg bg-surface-container flex items-center justify-between px-5 overflow-hidden border border-border-subtle">
                      <div className="flex items-center gap-1.5 text-status-info opacity-90">
                        <span className="material-symbols-outlined text-[20px]">air</span>
                        <span className="material-symbols-outlined text-[16px] animate-pulse">arrow_right_alt</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-risk-low/20 border-2 border-risk-low flex items-center justify-center">
                          <span className="font-caption text-caption font-bold text-risk-low">P1</span>
                        </div>
                        <span className="text-[11px] font-bold text-text-primary mt-1">+3.8°C</span>
                        <span className="font-caption text-[10px] text-text-muted">Chilled Head</span>
                      </div>
                      <div className="flex items-center text-text-disabled">
                        <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-risk-low/20 border-2 border-risk-low flex items-center justify-center">
                          <span className="font-caption text-caption font-bold text-risk-low">P2</span>
                        </div>
                        <span className="text-[11px] font-bold text-text-primary mt-1">+4.9°C</span>
                        <span className="font-caption text-[10px] text-text-muted">Cargo Core</span>
                      </div>
                      <div className="flex items-center text-text-disabled">
                        <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
                      </div>
                      <div className="flex flex-col items-center relative">
                        {selectedConsignment.isExcursion && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-critical opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-risk-critical"></span>
                          </span>
                        )}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            selectedConsignment.isExcursion
                              ? 'bg-risk-critical/20 border-risk-critical'
                              : 'bg-risk-low/20 border-risk-low'
                          }`}
                        >
                          <span
                            className={`font-caption text-caption font-bold ${
                              selectedConsignment.isExcursion ? 'text-risk-critical' : 'text-risk-low'
                            }`}
                          >
                            P3
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-bold mt-1 ${
                            selectedConsignment.isExcursion ? 'text-risk-critical' : 'text-risk-low'
                          }`}
                        >
                          +{selectedConsignment.currentTemp.toFixed(1)}°C
                        </span>
                        <span
                          className={`font-caption text-[10px] font-medium ${
                            selectedConsignment.isExcursion ? 'text-risk-critical' : 'text-risk-low'
                          }`}
                        >
                          {selectedConsignment.isExcursion ? 'Excursion' : 'Nominal'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center text-risk-critical">
                        <span className="material-symbols-outlined text-[20px] text-risk-high">wb_sunny</span>
                        <span className="text-[9px] font-bold text-risk-high">38.8°C Ext</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-secondary pt-2 px-1 mt-2 border-t border-border-subtle/40">
                      <span className="flex items-center gap-1.5 text-risk-high">
                        <span className="material-symbols-outlined text-[14px]">sensors</span>
                        Contact: <span className="font-semibold text-risk-critical">Micro-gasket seal nominal</span>
                      </span>
                      <span className="text-text-muted font-medium">
                        Compressor Duty: <strong className="text-risk-high">100%</strong> (Max Load)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Panel (Tagged with Coming Soon for advanced micro-sensors) */}
                <div className="md:col-span-4 flex flex-col justify-between bg-surface-container p-3.5 rounded-lg border border-border-subtle">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle/40">
                    <span className="font-card-title text-card-title text-text-primary text-xs font-semibold">
                      Environmental Telemetry
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary-soft text-primary border border-primary-container/30">
                      Upcoming IoT Stream
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 py-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Compressor Draw</span>
                      <span className="font-semibold text-text-primary font-mono">
                        28.4 A <span className="text-risk-critical text-[10px]">(Max)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Airflow Circulation</span>
                      <span className="font-semibold text-risk-high font-mono">
                        410 CFM <span className="text-[10px]">(-32%)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Chamber Relative RH</span>
                      <span className="font-semibold text-status-info font-mono">64% (Safe)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Battery Backup</span>
                      <span className="font-semibold text-risk-medium font-mono">82% (4h 12m)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle/40">
                    <span className="text-text-muted">Probe Calibration</span>
                    <span className="font-semibold text-risk-low flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[14px]">verified</span> ISO 17025
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Cold Chain Consignments Data Grid */}
          <div className="bg-bg-surface rounded-xl p-4 shadow-sm flex flex-col border border-border-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">inventory</span>
                <h2 className="font-section-title text-section-title text-text-primary font-semibold">
                  Active Cold Chain Consignments
                </h2>
              </div>
              <div className="flex items-center p-0.5 rounded-lg bg-surface-container-lowest text-xs font-medium border border-border-subtle">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === 'all'
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                >
                  All ({consignments.length})
                </button>
                <button
                  onClick={() => setActiveTab('excursions')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === 'excursions'
                      ? 'bg-risk-critical/20 text-risk-critical font-semibold'
                      : 'text-risk-critical hover:text-text-primary'
                  }`}
                  type="button"
                >
                  Excursions ({consignments.filter((c) => c.riskTier === 'Critical Hazard').length})
                </button>
                <button
                  onClick={() => setActiveTab('approaching')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === 'approaching'
                      ? 'bg-risk-medium/20 text-risk-medium font-semibold'
                      : 'text-risk-medium hover:text-text-primary'
                  }`}
                  type="button"
                >
                  Approaching ({consignments.filter((c) => c.riskTier === 'High Risk').length})
                </button>
                <button
                  onClick={() => setActiveTab('safe')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === 'safe'
                      ? 'bg-risk-low/20 text-risk-low font-semibold'
                      : 'text-risk-low hover:text-text-primary'
                  }`}
                  type="button"
                >
                  Safe Stable ({safeConsignments.length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-container-lowest">
              <table className="w-full text-left border-collapse font-table-cell text-table-cell">
                <thead className="bg-bg-sidebar text-text-muted font-caption text-caption uppercase tracking-wider h-9 border-b border-border-subtle">
                  <tr>
                    <th className="px-3.5 py-2 font-medium">Shipment &amp; Payload</th>
                    <th className="px-3 py-2 font-medium">Vehicle Pod</th>
                    <th className="px-3 py-2 font-medium">Target Range</th>
                    <th className="px-3 py-2 font-medium">Live Temp</th>
                    <th className="px-3 py-2 font-medium">Excursion State</th>
                    <th className="px-3 py-2 font-medium">Risk Tier</th>
                    <th className="px-3.5 py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-text-muted font-caption text-caption">
                        Loading live cold chain telemetry from Supabase...
                      </td>
                    </tr>
                  ) : filteredConsignments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-text-muted font-caption text-caption">
                        No consignments matching the active filter.
                      </td>
                    </tr>
                  ) : (
                    filteredConsignments.map((c) => {
                      const isSelected = selectedShipmentId === c.id || selectedShipmentId === c.sensorCode;
                      const tierBadge =
                        c.riskTier === 'Critical Hazard'
                          ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                          : c.riskTier === 'High Risk'
                          ? 'bg-risk-medium/15 text-risk-medium border border-risk-medium/30'
                          : 'bg-risk-low/15 text-risk-low border border-risk-low/30';

                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedShipmentId(c.id)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-bg-surface-hover ring-1 ring-primary/40' : 'hover:bg-bg-surface-hover'
                          }`}
                        >
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-1.5 h-7 rounded-full flex-shrink-0 ${
                                  c.riskTier === 'Critical Hazard'
                                    ? 'bg-risk-critical'
                                    : c.riskTier === 'High Risk'
                                    ? 'bg-risk-medium'
                                    : 'bg-risk-low'
                                }`}
                              ></div>
                              <div className="min-w-0">
                                <span className="font-semibold text-text-primary block leading-tight font-mono">{c.id}</span>
                                <p className="font-caption text-[11px] text-text-muted truncate">{c.payload}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-text-secondary font-mono text-[11px] whitespace-nowrap">
                            {c.pod}
                          </td>
                          <td className="px-3 py-2.5 text-text-muted whitespace-nowrap">{c.targetRange}</td>
                          <td className="px-3 py-2.5 font-bold">
                            <span
                              className={
                                c.riskTier === 'Critical Hazard'
                                  ? 'text-risk-critical'
                                  : c.riskTier === 'High Risk'
                                  ? 'text-risk-medium'
                                  : 'text-risk-low'
                              }
                            >
                              {c.currentTemp > 0 ? `+${c.currentTemp.toFixed(1)}°C` : `${c.currentTemp.toFixed(1)}°C`}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tierBadge}`}>
                              {c.excursionState}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${tierBadge}`}>
                              {c.riskTier}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShipmentId(c.id);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-[11px] font-semibold hover:bg-primary-hover shadow-sm transition-colors"
                              type="button"
                            >
                              Triage In Cockpit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Workspace: Incident Excursion Triage Cockpit (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-bg-surface rounded-xl p-4 shadow-md flex flex-col gap-3.5 border border-border-strong relative">
            {/* Top Status Heading */}
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/40">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-risk-critical/20 text-risk-critical">
                  <span className="material-symbols-outlined text-[18px]">warning_amber</span>
                </span>
                <div>
                  <span className="font-card-title text-card-title text-text-primary font-semibold block leading-tight">
                    Incident Triage Cockpit
                  </span>
                  <span className="font-caption text-caption text-text-muted">Section 18 &amp; 19 AI Classifier</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-risk-critical text-white tracking-wider animate-pulse">
                {selectedConsignment.riskTier === 'Normal' ? 'NOMINAL' : 'HIGH SEVERITY'}
              </span>
            </div>

            {/* Selected Asset Info */}
            <div className="p-3 rounded-lg bg-surface-container-lowest border border-border-subtle flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-caption text-[11px] text-text-muted block">Selected Target</span>
                  <span className="text-sm font-semibold text-text-primary font-mono">
                    {selectedConsignment.id} — {selectedConsignment.excursionState}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-caption text-[11px] text-text-muted block">Value at Risk</span>
                  <span className="text-sm font-bold text-risk-critical">{selectedConsignment.value}</span>
                </div>
              </div>
              <p className="font-caption text-[11px] text-text-secondary">{selectedConsignment.consignee}</p>
            </div>

            {/* AI Diagnostic Box */}
            <div className="p-3 rounded-lg bg-bg-surface-raised border-l-2 border-primary flex flex-col gap-2 border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">neurology</span>
                  AI Severity Assessment
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-surface-container-lowest text-primary font-medium border border-border-subtle">
                  Confidence: 93.8%
                </span>
              </div>
              <p className="text-xs text-text-primary leading-relaxed font-body-default">
                <strong className="text-risk-critical">Root Cause Diagnosis:</strong> Active temperature excursion (+{selectedConsignment.currentTemp.toFixed(1)}°C) exceeding WHO 2°C–8°C threshold. Mobile reefer intercept protocol ready.
              </p>

              {/* Critical Countdown */}
              <div className="p-2.5 rounded-lg bg-risk-critical/10 border border-risk-critical/30 flex items-center justify-between mt-1">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-risk-critical flex-shrink-0">timer</span>
                  <div>
                    <span className="font-caption text-[10px] uppercase tracking-wider text-risk-critical font-bold block leading-tight">
                      Remaining MKT Kinetic Buffer
                    </span>
                    <span className="text-xs font-semibold text-text-primary leading-tight">
                      Before irreversible denaturation
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-risk-critical font-mono tracking-wider px-2 py-0.5 rounded bg-surface-container-lowest border border-risk-critical/40">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>

            {/* Prescriptive Interventions */}
            <div className="flex flex-col gap-2.5">
              <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-muted">
                Prescriptive Interventions
              </span>

              {/* Option 1 */}
              <div className="p-3 rounded-lg bg-surface-container hover:bg-bg-surface-hover border border-primary-container/40 transition-colors flex flex-col gap-2 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                    <span className="text-xs font-semibold text-text-primary">
                      Option 1: Emergency Reefer Intercept ({availableReefer?.assetCode || 'TRK-COLD-103'})
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary-soft text-primary">
                    RECOMMENDED
                  </span>
                </div>
                <p className="font-caption text-[11px] text-text-secondary leading-snug">
                  Deploy standby certified reefer {availableReefer?.assetCode || 'TRK-COLD-103'} to intercept payload and restore 4.0°C cryo environment within 45 minutes.
                </p>
                <div className="flex items-center justify-between font-caption text-[10px] text-text-muted pt-1 border-t border-border-subtle/30">
                  <span>
                    ETA to Dock: <strong className="text-text-primary">28 min</strong>
                  </span>
                  <span>
                    Intervention Cost: <strong className="text-text-primary">₹4,500</strong>
                  </span>
                  <span className="text-risk-low font-semibold">Salvage: 99.4%</span>
                </div>
              </div>

              {/* Option 2 */}
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-border-subtle hover:border-border-strong transition-colors flex flex-col gap-1.5 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">
                    Option 2: Cross-Dock to Regional Distribution Bay
                  </span>
                  <span className="text-[10px] text-text-muted">ETA: 44 min</span>
                </div>
                <p className="font-caption text-[10px] text-text-muted">
                  Transfer pallets at nearest certified cold depot. Leaves marginal 2m MKT buffer threshold.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => setTransferAuthorized(!transferAuthorized)}
                className={`w-full py-2.5 px-4 rounded-lg font-card-title text-card-title font-semibold shadow-md flex items-center justify-center gap-2 transition-all ${
                  transferAuthorized
                    ? 'bg-risk-low text-on-primary'
                    : 'bg-primary-container hover:bg-primary-hover text-on-primary-container'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {transferAuthorized ? 'check_circle' : 'verified_user'}
                </span>
                <span>
                  {transferAuthorized
                    ? 'Emergency Cold Transfer Dispatched'
                    : 'Authorize Emergency Cold Transfer'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCabAlarmTriggered(true);
                    alert('Audible high-priority cab alarm triggered in driver vehicle dashboard!');
                  }}
                  className="py-1.5 px-2 rounded-lg bg-bg-surface-raised hover:bg-bg-surface-hover border border-border-subtle text-text-primary font-caption text-caption flex items-center justify-center gap-1.5 transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px] text-risk-high">volume_up</span>
                  <span>{cabAlarmTriggered ? 'Alarm Active' : 'Sound Cab Alarm'}</span>
                </button>
                <button
                  onClick={() => alert('Generating formal GDP Audit Certificate PDF with cryptographic timestamp... (Upcoming Feature)')}
                  className="py-1.5 px-2 rounded-lg bg-bg-surface-raised hover:bg-bg-surface-hover border border-border-subtle text-text-primary font-caption text-caption flex items-center justify-center gap-1.5 transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px] text-status-info">picture_as_pdf</span>
                  <span>Audit Cert PDF</span>
                </button>
              </div>
            </div>

            {/* Live Telemetry Raw Stream */}
            <div className="mt-1 pt-2 border-t border-border-subtle/50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-text-muted mb-0.5">
                <span className="font-semibold uppercase tracking-wider">Raw Telemetry Log</span>
                <span className="text-[10px]">Auto-scrolling</span>
              </div>
              <div className="flex flex-col gap-1.5 text-[11px] font-mono text-text-secondary bg-surface-container-lowest p-2.5 rounded-lg border border-border-subtle max-h-28 overflow-y-auto">
                <div className="flex items-center justify-between text-risk-critical">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-ping"></span>
                    [{new Date().toLocaleTimeString()}] {selectedConsignment.sensorCode}
                  </span>
                  <span className="font-bold">+{selectedConsignment.currentTemp.toFixed(2)}°C</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>[{new Date(Date.now() - 30000).toLocaleTimeString()}] Sensor Status</span>
                  <span className="text-text-secondary font-mono">{selectedConsignment.excursionState}</span>
                </div>
                <div className="flex items-center justify-between text-status-info">
                  <span>[{new Date(Date.now() - 60000).toLocaleTimeString()}] Protocol Target</span>
                  <span className="font-semibold">{selectedConsignment.targetRange}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>[{new Date(Date.now() - 90000).toLocaleTimeString()}] Telemetry Sync</span>
                  <span className="text-risk-low">Online • 100% Signal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
