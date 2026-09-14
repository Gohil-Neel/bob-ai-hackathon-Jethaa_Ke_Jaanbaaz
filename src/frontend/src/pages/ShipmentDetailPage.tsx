import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeSensor, setActiveSensor] = useState<'all' | 'core' | 'aft' | 'door'>('all');
  const [detourAuthorized, setDetourAuthorized] = useState<boolean>(false);

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Context & Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6">
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
            <span className="text-text-primary font-medium font-mono">{id || 'SHP-0117'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/40 text-error border border-error/30 font-badge-label text-badge-label font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-risk-critical animate-ping"></span>
              <span>HIGH THERMAL RISK • ACTIVE EXCURSION</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary font-caption text-caption px-2.5 py-1 rounded-full bg-bg-surface-raised border border-border-subtle">
              <span className="material-symbols-outlined text-[15px] text-primary">sensors</span>
              <span>Real-Time Reefer Telemetry (TRK-203)</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted font-caption text-caption">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low"></span>
              <span>Sync: 4s ago</span>
            </div>
          </div>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/simulations')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-surface-hover hover:border-border-strong transition-colors font-body-default text-body-default font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-text-secondary">alt_route</span>
            <span>Simulate Reroute</span>
          </button>
          <button
            onClick={() => alert('Exporting GDP compliance & audit dossier (PDF)...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-surface-hover hover:border-border-strong transition-colors font-body-default text-body-default font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-text-secondary">verified_user</span>
            <span>Export GDP Dossier</span>
          </button>
          <button
            onClick={() => setDetourAuthorized(!detourAuthorized)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg shadow-sm transition-all font-body-default text-body-default font-semibold ${
              detourAuthorized
                ? 'bg-risk-low text-on-primary'
                : 'bg-primary-container text-on-primary-container hover:bg-primary-hover'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">
              {detourAuthorized ? 'check_circle' : 'emergency'}
            </span>
            <span>{detourAuthorized ? 'Cryo-Booster Active & Detour Dispatched' : 'Authorize Cryo-Booster & Detour'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Impact Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Card 1 */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-start justify-between mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Cargo &amp; Consignment
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-badge-label text-badge-label font-medium">
              Tier-1 Cryo
            </span>
          </div>
          <div>
            <div className="font-kpi-val text-kpi-val text-text-primary tracking-tight">₹1.85 Cr</div>
            <div className="font-card-title text-card-title text-text-primary mt-0.5 truncate">
              HPV Vaccines (2,400 Vials)
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-text-secondary font-caption text-caption">
            <span className="truncate">Serum Inst. → Apollo Hyd</span>
            <span className="font-mono text-text-muted">$222K USD</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-start justify-between mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Thermal Health &amp; Buffer
            </span>
            <span className="px-2 py-0.5 rounded-full bg-risk-critical/10 text-risk-critical border border-risk-critical/30 font-badge-label text-badge-label font-medium">
              +9.4°C Peak
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-kpi-val text-kpi-val text-risk-critical tracking-tight font-semibold">+9.4°C</span>
              <span className="font-caption text-caption text-text-secondary">/ Limit +8.0°C</span>
            </div>
            <div className="font-caption text-caption text-risk-critical mt-0.5 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">timer</span>
              <span>Kinetic Buffer: 28 min left</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/50">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-risk-critical h-full rounded-full transition-all duration-500" style={{ width: '28%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-start justify-between mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Route &amp; Bottleneck
            </span>
            <span className="px-2 py-0.5 rounded-full bg-risk-high/10 text-risk-high border border-risk-high/30 font-badge-label text-badge-label font-medium">
              Halted
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-kpi-val text-kpi-val text-risk-high tracking-tight">+3.2 hrs</span>
              <span className="font-caption text-caption text-text-muted">Delay</span>
            </div>
            <div className="font-card-title text-card-title text-text-primary mt-0.5 truncate">
              NH-48 Km 188.4 Solapur
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center justify-between font-caption text-caption">
            <span className="text-text-muted">Inundation (1.2m)</span>
            <span className="text-primary font-medium">Detour Ready</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-all">
          <div className="flex items-start justify-between mb-1">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              Carrier &amp; Hardware
            </span>
            <span className="px-2 py-0.5 rounded-full bg-risk-low/10 text-risk-low border border-risk-low/30 font-badge-label text-badge-label font-medium">
              Sensitech Active
            </span>
          </div>
          <div>
            <div className="font-kpi-val text-kpi-val text-text-primary tracking-tight">TRK-203</div>
            <div className="font-card-title text-card-title text-text-primary mt-0.5 truncate">
              ColdBridge Express Ltd
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-text-secondary font-caption text-caption">
            <span className="truncate">Driver: Rajesh K.</span>
            <span className="font-mono text-status-info">94% Batt</span>
          </div>
        </div>
      </div>

      {/* Multi-Sensor Thermal Excursion & MKT Curve Analysis */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 border-b border-border-subtle">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-risk-critical">device_thermostat</span>
              <h2 className="font-section-title text-section-title text-text-primary">
                Multi-Sensor Thermal Excursion &amp; MKT Curve
              </h2>
            </div>
            <span className="font-caption text-caption text-text-muted mt-0.5">
              Calculated via USP &lt;1079&gt; Kinetic Mean Temperature formulation
            </span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-lowest p-0.5 rounded-lg border border-border-subtle font-caption text-caption">
            <button
              onClick={() => setActiveSensor('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeSensor === 'all'
                  ? 'bg-bg-surface-raised text-primary border border-border-subtle shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              All Sensors
            </button>
            <button
              onClick={() => setActiveSensor('core')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeSensor === 'core'
                  ? 'bg-bg-surface-raised text-primary border border-border-subtle shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              Core A
            </button>
            <button
              onClick={() => setActiveSensor('aft')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeSensor === 'aft'
                  ? 'bg-bg-surface-raised text-primary border border-border-subtle shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              Aft B
            </button>
            <button
              onClick={() => setActiveSensor('door')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeSensor === 'door'
                  ? 'bg-bg-surface-raised text-primary border border-border-subtle shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              Door C
            </button>
          </div>
        </div>

        {/* Metric pill summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border-subtle flex flex-col">
            <span className="font-caption text-caption text-text-muted">Core Payload Probe A</span>
            <span className="font-card-title text-card-title text-text-primary mt-0.5 font-semibold">
              +7.8°C <span className="font-caption text-risk-low text-caption font-normal">• Nominal</span>
            </span>
          </div>
          <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border-subtle flex flex-col">
            <span className="font-caption text-caption text-text-muted">Aft Bulkhead Sensor B</span>
            <span className="font-card-title text-card-title text-risk-critical mt-0.5 font-semibold">
              +9.4°C <span className="font-caption text-risk-critical text-caption font-normal">• EXCURSION</span>
            </span>
          </div>
          <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border-subtle flex flex-col">
            <span className="font-caption text-caption text-text-muted">Mean Kinetic Temp (MKT)</span>
            <span className="font-card-title text-card-title text-risk-medium mt-0.5 font-semibold">
              +6.2°C <span className="font-caption text-text-muted text-caption font-normal">• Calculated</span>
            </span>
          </div>
          <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-border-subtle flex flex-col">
            <span className="font-caption text-caption text-text-muted">Ambient Reefer Exterior</span>
            <span className="font-card-title text-card-title text-text-primary mt-0.5 font-semibold">
              +38.4°C <span className="font-caption text-risk-high text-caption font-normal">• Direct Sun</span>
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
    </div>
  );
}
