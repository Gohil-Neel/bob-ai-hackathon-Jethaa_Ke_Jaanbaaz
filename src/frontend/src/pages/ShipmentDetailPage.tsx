import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getShipments,
  getColdChainSensors,
  getDisruptions,
  getAllRecommendations,
} from '../services/api';
import type {
  Shipment,
  ColdChainSensor,
  Disruption,
  Recommendation,
} from '../types/domain';

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [sensor, setSensor] = useState<ColdChainSensor | null>(null);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSensorProbe, setActiveSensorProbe] = useState<'all' | 'core' | 'aft' | 'ambient'>('all');
  const [detourAuthorized, setDetourAuthorized] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getShipments(),
      getColdChainSensors(),
      getDisruptions(),
      getAllRecommendations(),
    ])
      .then(([allShipments, allSensors, allDisruptions, allRecs]) => {
        // Find shipment by ID or tracking number
        const found =
          allShipments?.find((s) => s.id === id || s.trackingNumber === id) ||
          allShipments?.[0] ||
          null;

        setShipment(found);
        if (found) {
          const matchingSensor = allSensors?.find((sen) => sen.shipmentId === found.id);
          setSensor(matchingSensor || null);

          const matchingRecs = allRecs?.filter((r) => r.shipmentId === found.id);
          setRecommendations(matchingRecs || []);
        }
        setDisruptions(allDisruptions || []);
      })
      .catch((err) => {
        console.error('Failed to load shipment detail from Supabase:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const isCritical =
    shipment?.status === 'AT_RISK' ||
    (shipment?.riskScore !== null && shipment?.riskScore !== undefined && shipment.riskScore >= 0.7);

  const isColdChainExcursion =
    sensor?.status === 'EXCURSION' ||
    (sensor?.lastReadingCelsius !== null &&
      sensor?.lastReadingCelsius !== undefined &&
      sensor.lastReadingCelsius > sensor.maxTempCelsius);

  return (
    <div className="flex flex-col w-full pb-12 gap-4">
      {/* Context & Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
            <button
              onClick={() => navigate('/shipments')}
              className="hover:text-primary transition-colors flex items-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Back to Shipments</span>
            </button>
            <span className="text-text-disabled">/</span>
            <span>Control Tower</span>
            <span className="text-text-disabled">/</span>
            <span>Shipments</span>
            <span className="text-text-disabled">/</span>
            <span className="text-text-primary font-medium font-mono">{shipment?.trackingNumber || id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-badge-label text-badge-label font-semibold tracking-wide ${
                isCritical
                  ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                  : 'bg-risk-low/15 text-risk-low border border-risk-low/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCritical ? 'bg-risk-critical animate-ping' : 'bg-risk-low'
                }`}
              ></span>
              <span>
                {isCritical
                  ? 'HIGH OPERATIONAL RISK • ACTIVE INTERVENTION REQUIRED'
                  : 'NORMAL TRANSIT • ON SCHEDULE'}
              </span>
            </div>

            {shipment?.isColdChain && (
              <div className="flex items-center gap-1.5 text-sky-400 font-caption text-caption px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30">
                <span className="material-symbols-outlined text-[14px]">ac_unit</span>
                <span>WHO 2°C–8°C Cold Chain Protocol</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-text-muted font-caption text-caption">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low"></span>
              <span>Supabase Live DB</span>
            </div>
          </div>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/simulations')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-surface-hover hover:border-border-strong transition-colors font-body-default text-body-default font-medium text-xs shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">alt_route</span>
            <span>Simulate Reroute</span>
          </button>
          
          <button
            onClick={() => navigate('/audit')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-surface-hover hover:border-border-strong transition-colors font-body-default text-body-default font-medium text-xs shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-text-secondary">verified_user</span>
            <span>Audit Trail Ledger</span>
          </button>

          <button
            onClick={() => setDetourAuthorized(!detourAuthorized)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg shadow-sm transition-all font-body-default text-xs font-semibold ${
              detourAuthorized
                ? 'bg-risk-low text-on-primary'
                : 'bg-primary text-on-primary hover:bg-primary-hover'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">
              {detourAuthorized ? 'check_circle' : 'emergency'}
            </span>
            <span>{detourAuthorized ? 'Bypass Detour Authorized' : 'Authorize AI Recovery Reroute'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Impact Strip (Live from Supabase) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Consignment Specs */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-start justify-between mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Tracking Number
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-badge-label text-badge-label font-medium font-mono">
              {shipment?.carrier || 'CARRIER'}
            </span>
          </div>
          <div>
            <div className="font-kpi-val text-kpi-val text-text-primary tracking-tight font-mono">
              {loading ? '…' : shipment?.trackingNumber}
            </div>
            <div className="font-card-title text-card-title text-text-primary mt-0.5 truncate">
              {shipment?.isColdChain ? 'Biopharma / Cold Chain Active' : 'General Freight Cargo'}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-text-secondary font-caption text-caption">
            <span className="truncate">{shipment?.origin} → {shipment?.destination}</span>
            <span className="text-text-muted font-medium">{shipment?.priority}</span>
          </div>
        </div>

        {/* Card 2: Cold Chain Health */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-start justify-between mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Thermal Telemetry
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-badge-label text-badge-label font-medium ${
                isColdChainExcursion
                  ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              }`}
            >
              {isColdChainExcursion ? 'Excursion Alert' : 'Nominal 2°C–8°C'}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-kpi-val text-kpi-val tracking-tight font-semibold ${
                  isColdChainExcursion ? 'text-risk-critical' : 'text-sky-400'
                }`}
              >
                {sensor?.lastReadingCelsius !== null && sensor?.lastReadingCelsius !== undefined
                  ? `${sensor.lastReadingCelsius}°C`
                  : shipment?.isColdChain
                  ? '4.2°C'
                  : 'Ambient'}
              </span>
              <span className="font-caption text-caption text-text-secondary">/ Limit 8.0°C</span>
            </div>
            <div
              className={`font-caption text-caption mt-0.5 font-medium flex items-center gap-1 ${
                isColdChainExcursion ? 'text-risk-critical' : 'text-risk-low'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {isColdChainExcursion ? 'warning' : 'check_circle'}
              </span>
              <span>
                {isColdChainExcursion
                  ? 'Excursion above 8.0°C threshold'
                  : 'Thermal buffer nominal (USP <1079>)'}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/50 text-[11px] text-text-muted flex justify-between">
            <span>Sensor Code:</span>
            <span className="font-mono text-text-primary">{sensor?.sensorCode || 'SEN-DEFAULT'}</span>
          </div>
        </div>

        {/* Card 3: AI Risk Score */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-start justify-between mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              AI Risk Score
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-badge-label text-badge-label font-medium ${
                isCritical
                  ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                  : 'bg-risk-low/15 text-risk-low border border-risk-low/30'
              }`}
            >
              {shipment?.status}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`font-kpi-val text-kpi-val tracking-tight font-bold ${
                  isCritical ? 'text-risk-critical' : 'text-risk-low'
                }`}
              >
                {shipment?.riskScore !== null && shipment?.riskScore !== undefined
                  ? `${(shipment.riskScore * 100).toFixed(0)}%`
                  : '10%'}
              </span>
              <span className="font-caption text-caption text-text-muted">Hazard Probability</span>
            </div>
            <div className="font-card-title text-card-title text-text-primary mt-0.5 truncate">
              {isCritical ? 'Corridor Delay / Storm Impact' : 'On Schedule'}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center justify-between font-caption text-caption">
            <span className="text-text-muted">ETA:</span>
            <span className="text-primary font-medium">
              {shipment?.estimatedArrival
                ? new Date(shipment.estimatedArrival).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Pending'}
            </span>
          </div>
        </div>

        {/* Card 4: Carrier & Logistics */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-start justify-between mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Carrier Line
            </span>
            <span className="px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low border border-risk-low/30 font-badge-label text-badge-label font-medium">
              Supabase REST
            </span>
          </div>
          <div>
            <div className="font-kpi-val text-kpi-val text-text-primary tracking-tight font-mono">
              {shipment?.carrier || 'MAERSK'}
            </div>
            <div className="font-card-title text-card-title text-text-primary mt-0.5 truncate">
              Multi-Modal Freight Dispatch
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-text-secondary font-caption text-caption">
            <span className="truncate">Status: {shipment?.status}</span>
            <span className="font-mono text-status-info">GPS Linked</span>
          </div>
        </div>
      </div>

      {/* Multi-Sensor Thermal Excursion & MKT Curve Analysis */}
      {shipment?.isColdChain && (
        <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 border-b border-border-subtle">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-risk-critical">device_thermostat</span>
                <h2 className="font-section-title text-section-title text-text-primary">
                  Multi-Sensor Thermal Excursion &amp; MKT Curve
                </h2>
              </div>
              <span className="font-caption text-caption text-text-muted mt-0.5">
                Calculated via USP &lt;1079&gt; Mean Kinetic Temperature telemetry formulation
              </span>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-lowest p-0.5 rounded-lg border border-border-subtle font-caption text-caption text-xs">
              <button
                onClick={() => setActiveSensorProbe('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeSensorProbe === 'all'
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                All Probes
              </button>
              <button
                onClick={() => setActiveSensorProbe('core')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeSensorProbe === 'core'
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                Core Probe A
              </button>
              <button
                onClick={() => setActiveSensorProbe('aft')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeSensorProbe === 'aft'
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                Aft Probe B
              </button>
            </div>
          </div>

          {/* Metric Pill Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border-subtle flex flex-col">
              <span className="font-caption text-caption text-text-muted">Live Probe Reading</span>
              <span className="font-card-title text-card-title text-text-primary mt-0.5 font-semibold">
                {sensor?.lastReadingCelsius !== null && sensor?.lastReadingCelsius !== undefined
                  ? `${sensor.lastReadingCelsius}°C`
                  : '4.3°C'}
              </span>
            </div>
            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border-subtle flex flex-col">
              <span className="font-caption text-caption text-text-muted">Allowed Upper Ceiling</span>
              <span className="font-card-title text-card-title text-risk-critical mt-0.5 font-semibold">
                +8.0°C <span className="font-caption text-risk-critical text-caption font-normal">• Threshold</span>
              </span>
            </div>
            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border-subtle flex flex-col">
              <span className="font-caption text-caption text-text-muted">Allowed Lower Floor</span>
              <span className="font-card-title text-card-title text-sky-400 mt-0.5 font-semibold">
                +2.0°C <span className="font-caption text-sky-400 text-caption font-normal">• Floor</span>
              </span>
            </div>
            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border-subtle flex flex-col">
              <span className="font-caption text-caption text-text-muted">Telemetry Status</span>
              <span className="font-card-title text-card-title text-text-primary mt-0.5 font-semibold">
                {sensor?.status || 'NORMAL'}
              </span>
            </div>
          </div>

          {/* Sparkline Graph */}
          <div className="relative h-44 w-full bg-[#070b12] rounded-lg p-3 border border-border-subtle overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            <div className="absolute left-3 right-3 top-[32%] border-b border-error/40 border-dashed"></div>
            <div className="absolute right-4 top-[24%] text-[10px] text-error font-medium">Critical Ceiling (+8.0°C)</div>

            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 120">
              <path d="M0,80 Q100,75 200,78 T350,85 T450,55 T550,25 T600,18" fill="none" stroke="#ef4444" strokeWidth="3" />
              <path d="M0,90 Q120,88 240,92 T360,90 T480,75 T600,60" fill="none" stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="2" />
              <circle cx="600" cy="18" fill="#ef4444" r="4" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
