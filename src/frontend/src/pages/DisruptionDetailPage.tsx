import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function DisruptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'shipments' | 'reroutes' | 'telemetry'>('shipments');
  const [approvedAction, setApprovedAction] = useState<boolean>(false);

  return (
    <div className="flex flex-col w-full gap-4 pb-12">
      {/* Top Operational Breadcrumb Bar & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-bg-surface p-3 rounded-lg border border-border-subtle shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/disruptions')}
            className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-primary transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Disruptions</span>
          </button>
          <span className="text-text-disabled text-xs">/</span>
          <span className="text-xs text-text-muted">Control Tower</span>
          <span className="text-text-disabled text-xs">/</span>
          <span className="text-xs text-text-muted">Disruptions</span>
          <span className="text-text-disabled text-xs">/</span>
          <span className="text-xs font-semibold text-text-primary px-1.5 py-0.5 rounded bg-bg-surface-raised border border-border-subtle font-mono">
            {id || 'DIS-2024-881'}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical border border-risk-critical/30 font-badge-label text-badge-label ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-ping"></span>
            <span className="font-semibold uppercase tracking-wider">Active Hazard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/simulations')}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-bg-surface-raised border border-border-subtle hover:border-border-strong text-text-secondary hover:text-text-primary text-xs transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">alt_route</span>
            <span>Simulate Detour</span>
          </button>
          <button
            onClick={() => setApprovedAction(true)}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors shadow-sm ${approvedAction
                ? 'bg-risk-low text-on-primary'
                : 'bg-primary-container hover:bg-primary-hover text-on-primary-container'
              }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {approvedAction ? 'check_circle' : 'verified'}
            </span>
            <span>{approvedAction ? 'Action Approved' : 'Authorize AI Reroute'}</span>
          </button>
        </div>
      </div>

      {/* Incident Title & Primary Status Banner */}
      <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle shadow-sm flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="material-symbols-outlined text-risk-critical text-[22px]">flood</span>
              <h1 className="text-page-title font-page-title text-text-primary tracking-tight">
                NH-48 Flooding — Pune-Hyderabad Corridor (Km 194.2)
              </h1>
            </div>
            <p className="text-caption font-caption text-text-secondary">
              Flash Inundation &amp; Reservoir Spillway Discharge obstructing multi-lane carriageway at Solapur bypass underpass.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-risk-critical/15 text-risk-critical border border-risk-critical/30 font-badge-label text-badge-label font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-critical"></span>
              CRITICAL P0 / HIGH IMPACT
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-risk-high/15 text-risk-high border border-risk-high/30 font-badge-label text-badge-label">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-high animate-pulse"></span>
              ACTIVE OBSTRUCTION
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-status-info border border-status-info/30 font-badge-label text-badge-label">
              <span className="material-symbols-outlined text-[13px]">water</span>
              SURGE LEVEL: 1.2m
            </span>
          </div>
        </div>

        {/* Incident Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border-subtle/70 text-xs">
          <div className="flex flex-col">
            <span className="text-caption font-caption text-text-muted">Initiation Time</span>
            <span className="text-text-primary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-text-secondary">schedule</span>
              Today, 08:30 IST (Ongoing 6.2 hrs)
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-caption font-caption text-text-muted">Clearance Forecast</span>
            <span className="text-text-primary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-risk-medium">update</span>
              Tomorrow, 08:30 IST <span className="text-[10px] text-risk-low px-1 rounded bg-risk-low/10 font-mono">94% CONF</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-caption font-caption text-text-muted">Chokepoint Geofence</span>
            <span className="text-text-primary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">pin_drop</span>
              Solapur Bypass Underpass Km 194.2
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-caption font-caption text-text-muted">Weather Dynamic</span>
            <span className="text-text-primary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-status-info">cloud_sync</span>
              Catchment Rainfall + Spillway
            </span>
          </div>
        </div>
      </div>

      {/* Top Operational Impact KPI Strip (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-bg-surface p-3.5 rounded-lg border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-caption font-caption text-text-secondary uppercase font-medium tracking-wider">
              Affected Consignments
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="text-kpi-val font-kpi-val text-text-primary">
              17 <span className="text-xs font-normal text-text-muted">Shipments</span>
            </div>
            <div className="flex items-center gap-1 text-caption font-caption text-text-secondary mt-0.5">
              <span className="text-status-info font-medium">7 Convoy</span>
              <span>•</span>
              <span>10 Independent Units</span>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface p-3.5 rounded-lg border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-caption font-caption text-text-secondary uppercase font-medium tracking-wider">
              Critical Cold Chain Cargo
            </span>
            <span className="p-1.5 rounded-lg bg-risk-critical/15 text-risk-critical">
              <span className="material-symbols-outlined text-[18px]">ac_unit</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="text-kpi-val font-kpi-val text-risk-critical">
              4 <span className="text-xs font-normal text-text-muted">Cryo Units</span>
            </div>
            <div className="flex items-center gap-1 text-caption font-caption text-text-secondary mt-0.5 truncate">
              <span className="text-risk-high font-medium">SHP-0117 (Vaccines)</span>
              <span className="text-text-muted text-[10px]">T-Buffer: 4.8h</span>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface p-3.5 rounded-lg border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-caption font-caption text-text-secondary uppercase font-medium tracking-wider">
              Cumulative Cargo at Risk
            </span>
            <span className="p-1.5 rounded-lg bg-risk-critical/15 text-risk-critical">
              <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="text-kpi-val font-kpi-val text-risk-critical">
              ₹2.40 <span className="text-xs font-normal text-text-muted">Crores</span>
            </div>
            <div className="flex items-center gap-1 text-caption font-caption text-text-secondary mt-0.5">
              <span className="text-text-primary font-medium">₹1.15 Cr</span>
              <span className="text-text-muted">Pharma + EV Cells</span>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface p-3.5 rounded-lg border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-caption font-caption text-text-secondary uppercase font-medium tracking-wider">
              Mean Delay Projection
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-high text-risk-high">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="text-kpi-val font-kpi-val text-risk-high">
              +5.4 <span className="text-xs font-normal text-text-muted">Hours (Detour)</span>
            </div>
            <div className="flex items-center gap-1 text-caption font-caption text-text-muted mt-0.5">
              <span>Without Reroute: </span>
              <span className="text-risk-critical font-medium">+22.5h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map & Detour Comparison Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Interactive Map */}
        <div className="xl:col-span-8 bg-bg-surface rounded-xl border border-border-subtle overflow-hidden flex flex-col">
          <div className="p-3 bg-surface-container-lowest border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">map</span>
              <span className="font-card-title text-card-title text-text-primary">
                Geofence &amp; Inundation Telemetry
              </span>
            </div>
            <div className="flex items-center gap-2 font-caption text-caption text-text-muted">
              <span className="w-2 h-2 rounded-full bg-risk-critical animate-ping"></span>
              <span>17 Trucks Tracking Realtime</span>
            </div>
          </div>

          <div className="relative w-full h-[320px] bg-[#070b12]">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
            <svg className="w-full h-full" fill="none" viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg">
              {/* Blocked and Detour Routes */}
              <path d="M100 160 L 320 160 L 500 160 L 720 160" stroke="#ef4444" strokeDasharray="6 6" strokeWidth="4" />
              <path d="M100 160 Q 320 60 500 60 T 720 160" stroke="#2f6df6" strokeWidth="3.5" />

              {/* Inundation Circle */}
              <circle cx="410" cy="160" fill="#ef4444" fillOpacity="0.25" r="50" />
              <circle cx="410" cy="160" stroke="#ef4444" strokeDasharray="3 3" strokeWidth="1.5" r="50" />

              {/* Waypoints */}
              <circle cx="100" cy="160" fill="#101722" stroke="#38bdf8" strokeWidth="3" r="8" />
              <text fill="#f3f6fa" fontFamily="Inter" fontSize="11" fontWeight="600" x="80" y="195">
                Pune Hub
              </text>

              <circle cx="410" cy="160" fill="#ef4444" stroke="#ffffff" strokeWidth="2" r="6" />
              <text fill="#ef4444" fontFamily="Inter" fontSize="10" fontWeight="700" x="370" y="145">
                Km 194.2 BLOCKED
              </text>

              <circle cx="410" cy="60" fill="#101722" stroke="#2f6df6" strokeWidth="3" r="8" />
              <text fill="#b3c5ff" fontFamily="Inter" fontSize="11" fontWeight="600" x="360" y="45">
                Solapur Bypass (Open)
              </text>

              <circle cx="720" cy="160" fill="#101722" stroke="#22c55e" strokeWidth="3" r="8" />
              <text fill="#f3f6fa" fontFamily="Inter" fontSize="11" fontWeight="600" x="670" y="195">
                Hyderabad Hub
              </text>
            </svg>
          </div>
        </div>

        {/* Right Route Recommendation Card */}
        <div className="xl:col-span-4 bg-bg-surface-raised rounded-xl p-4 border border-primary-container/40 ring-1 ring-primary/40 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-card-title text-card-title text-text-primary flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                AI Recommended Mitigation
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-primary text-on-primary font-semibold text-[10px]">
                BEST ETA
              </span>
            </div>

            <p className="text-caption font-caption text-text-secondary">
              Redirect 17 shipments through <strong>Solapur Bypass (SH-142)</strong>. Elevated causeway avoids submerged
              flood basin with zero risk of cold-chain thermal penalty.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-bg-surface p-2.5 rounded-lg border border-border-subtle flex flex-col">
                <span className="text-text-muted text-[10px]">Distance Delta</span>
                <span className="text-text-primary font-semibold text-sm">+42 km (7.5%)</span>
              </div>
              <div className="bg-bg-surface p-2.5 rounded-lg border border-border-subtle flex flex-col">
                <span className="text-text-muted text-[10px]">Transit Delta</span>
                <span className="text-risk-low font-semibold text-sm">+5.4h (On SLA)</span>
              </div>
              <div className="bg-bg-surface p-2.5 rounded-lg border border-border-subtle flex flex-col">
                <span className="text-text-muted text-[10px]">Fuel / Toll</span>
                <span className="text-text-primary font-semibold text-sm">+₹1,840/truck</span>
              </div>
              <div className="bg-bg-surface p-2.5 rounded-lg border border-border-subtle flex flex-col">
                <span className="text-text-muted text-[10px]">AI Confidence</span>
                <span className="text-primary font-semibold text-sm">96.8%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={() => setApprovedAction(true)}
              className={`w-full py-2.5 px-4 rounded-lg font-body-default text-body-default font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${approvedAction
                  ? 'bg-risk-low text-on-primary'
                  : 'bg-primary-container hover:bg-primary-hover text-on-primary-container'
                }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {approvedAction ? 'check_circle' : 'verified'}
              </span>
              <span>{approvedAction ? 'Dispatched to 17 Vehicles' : 'Authorize 17 Shipments Reroute'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deep-Dive Tabs: Affected Shipments / Details */}
      <div className="bg-bg-surface rounded-xl border border-border-subtle p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-3 py-1.5 rounded-lg font-caption text-caption font-medium transition-colors ${activeTab === 'shipments'
                ? 'bg-primary-container text-on-primary-container'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-container'
              }`}
            type="button"
          >
            Affected Shipments (17)
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg font-caption text-caption font-medium transition-colors ${activeTab === 'telemetry'
                ? 'bg-primary-container text-on-primary-container'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-container'
              }`}
            type="button"
          >
            Hydrology &amp; Sensor Telemetry
          </button>
        </div>

        {/* Shipments Table */}
        {activeTab === 'shipments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-table-cell text-table-cell">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-[11px] uppercase tracking-wider">
                  <th className="pb-2">Shipment ID</th>
                  <th className="pb-2">Carrier / Vehicle</th>
                  <th className="pb-2">Cargo Category</th>
                  <th className="pb-2">Value</th>
                  <th className="pb-2">Current Location</th>
                  <th className="pb-2">Detour Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 text-text-secondary">
                <tr className="hover:bg-bg-surface-hover transition-colors">
                  <td className="py-2.5 font-medium text-text-primary">SHP-0117</td>
                  <td className="py-2.5">BlueDart Express / TRK-8821</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-risk-critical/15 text-risk-critical font-medium text-[10px]">
                      HPV Vaccines (Cryo)
                    </span>
                  </td>
                  <td className="py-2.5 text-text-primary font-medium">₹84 Lakh</td>
                  <td className="py-2.5">Km 178 (Approaching Chokepoint)</td>
                  <td className="py-2.5 text-risk-low font-medium">Bypass Queued</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => navigate('/shipments')}
                      className="px-2.5 py-1 rounded bg-surface-container text-text-primary hover:bg-primary-container hover:text-on-primary-container text-xs transition-colors"
                      type="button"
                    >
                      Track
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-bg-surface-hover transition-colors">
                  <td className="py-2.5 font-medium text-text-primary">SHP-0124</td>
                  <td className="py-2.5">Gati KWE / TRK-4902</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-risk-high/15 text-risk-high font-medium text-[10px]">
                      EV Lithium Cells
                    </span>
                  </td>
                  <td className="py-2.5 text-text-primary font-medium">₹45 Lakh</td>
                  <td className="py-2.5">Km 142 (Pune Outer Ring)</td>
                  <td className="py-2.5 text-text-secondary">En Route Detour</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => navigate('/shipments')}
                      className="px-2.5 py-1 rounded bg-surface-container text-text-primary hover:bg-primary-container hover:text-on-primary-container text-xs transition-colors"
                      type="button"
                    >
                      Track
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-bg-surface-hover transition-colors">
                  <td className="py-2.5 font-medium text-text-primary">SHP-0130</td>
                  <td className="py-2.5">VRL Logistics / TRK-3310</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-text-secondary text-[10px]">
                      Auto Spare Assemblies
                    </span>
                  </td>
                  <td className="py-2.5 text-text-primary font-medium">₹32 Lakh</td>
                  <td className="py-2.5">Km 110 (Lonavala Pass)</td>
                  <td className="py-2.5 text-text-secondary">Pending Dispatch</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => navigate('/shipments')}
                      className="px-2.5 py-1 rounded bg-surface-container text-text-primary hover:bg-primary-container hover:text-on-primary-container text-xs transition-colors"
                      type="button"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Telemetry Stream */}
        {activeTab === 'telemetry' && (
          <div className="flex flex-col gap-2 font-mono text-xs text-text-secondary bg-surface-container-lowest p-3 rounded-lg border border-border-subtle">
            <div className="flex items-center justify-between text-text-muted pb-1 border-b border-border-subtle">
              <span>Sensor Feed: Koyna Spillway Gauge #08</span>
              <span className="text-risk-critical">DISCHARGE: 45,000 cfs</span>
            </div>
            <div>[14:45:10] Inundation crest reached: +2.40m over baseline pavement.</div>
            <div>[14:40:02] Solapur Bypass SH-142 structural clearance sensor: 100% dry (Safe for heavy axles).</div>
            <div>[14:35:19] IMD Doppler radar indicates cloudburst core shifting eastward towards Solapur ridge.</div>
          </div>
        )}
      </div>
    </div>
  );
}
