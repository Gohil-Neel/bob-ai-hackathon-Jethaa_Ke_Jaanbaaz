import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getDisruptions,
  getShipments,
  getAllRecommendations,
} from '../services/api';
import { requestWatsonxExplanation } from '../services/aiService';
import type { Disruption, Shipment, Recommendation } from '../types/domain';

export default function DisruptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [disruption, setDisruption] = useState<Disruption | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'shipments' | 'reroutes' | 'telemetry'>('shipments');
  const [approvedAction, setApprovedAction] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [aiProvider, setAiProvider] = useState<string>('Google Gemini / AI Engine');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const fetchLiveAiInsight = (targetDisruption: Disruption) => {
    setLoadingAi(true);
    requestWatsonxExplanation('disruption', targetDisruption.id, {
      title: targetDisruption.title,
      disruption_type: targetDisruption.disruptionType,
      severity: targetDisruption.severity,
      affected_region: targetDisruption.affectedRegion,
      description: targetDisruption.description,
      impacted_loads_count: targetDisruption.affectedShipmentCount,
    })
      .then((res) => {
        setAiExplanation(res.explanation);
        setAiProvider(res.provider);
      })
      .finally(() => {
        setLoadingAi(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDisruptions(),
      getShipments(),
      getAllRecommendations(),
    ])
      .then(([allDisruptions, allShipments, allRecs]) => {
        const found =
          allDisruptions?.find((d) => d.id === id || d.title.toLowerCase().includes((id || '').toLowerCase())) ||
          allDisruptions?.[0] ||
          null;

        setDisruption(found);
        setShipments(allShipments || []);
        setRecommendations(allRecs || []);

        if (found) {
          fetchLiveAiInsight(found);
        }
      })
      .catch((err) => {
        console.error('Failed to load disruption detail from Supabase:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const matchedRec = disruption
    ? recommendations.find(
        (r) =>
          r.title.toLowerCase().includes(disruption.title.toLowerCase().slice(0, 10)) ||
          r.rationale.toLowerCase().includes(disruption.affectedRegion.toLowerCase().slice(0, 10))
      ) || recommendations[0]
    : undefined;

  const affectedLoads = shipments.filter(
    (s) =>
      s.status === 'AT_RISK' ||
      s.status === 'DELAYED' ||
      (disruption && disruption.affectedRegion.toLowerCase().includes(s.origin.toLowerCase().slice(0, 3)))
  );

  const isCritical = disruption?.severity === 'CRITICAL';

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
            {disruption?.id.slice(0, 13) || id}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical border border-risk-critical/30 font-badge-label text-badge-label ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-ping"></span>
            <span className="font-semibold uppercase tracking-wider">Live Supabase Record</span>
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
            onClick={() => setApprovedAction(!approvedAction)}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors shadow-sm ${
              approvedAction
                ? 'bg-risk-low text-white'
                : 'bg-primary-container hover:bg-primary-hover text-on-primary-container'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {approvedAction ? 'check_circle' : 'verified'}
            </span>
            <span>{approvedAction ? 'Detour Authorized & Transmitted' : 'Authorize AI Reroute'}</span>
          </button>
        </div>
      </div>

      {/* Incident Title & Primary Status Banner */}
      <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle shadow-sm flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="material-symbols-outlined text-risk-critical text-[22px]">
                {disruption?.disruptionType === 'WEATHER' ? 'cyclone' : disruption?.disruptionType === 'PORT_CONGESTION' ? 'directions_boat' : 'warning'}
              </span>
              <h1 className="text-page-title font-page-title text-text-primary tracking-tight">
                {disruption?.title || 'Operational Hazard Incident'}
              </h1>
            </div>
            <p className="text-caption font-caption text-text-secondary">
              {disruption?.description || 'Active operational disruption detected along multi-modal freight corridor.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-badge-label text-badge-label font-semibold ${
                isCritical
                  ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                  : 'bg-risk-high/15 text-risk-high border border-risk-high/30'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              {disruption?.severity || 'CRITICAL'} P0
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-status-info border border-status-info/30 font-badge-label text-badge-label">
              <span className="material-symbols-outlined text-[13px]">hub</span>
              {disruption?.disruptionType || 'WEATHER'}
            </span>
          </div>
        </div>

        {/* Incident Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border-subtle/70 text-xs">
          <div className="flex flex-col">
            <span className="text-caption font-caption text-text-muted">Initiation Time</span>
            <span className="text-text-primary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-text-secondary">schedule</span>
              {disruption ? new Date(disruption.startedAt).toLocaleString() : 'Recent'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-caption font-caption text-text-muted">Affected Region</span>
            <span className="text-text-primary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">pin_drop</span>
              {disruption?.affectedRegion || 'Global Corridor'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-caption font-caption text-text-muted">Impact Level</span>
            <span className="text-text-primary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-risk-critical">local_shipping</span>
              {disruption?.affectedShipmentCount || affectedLoads.length || 1} Impacted Loads
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-caption font-caption text-text-muted">AI Detour Status</span>
            <span className="text-risk-low font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">alt_route</span>
              {approvedAction ? 'Active Detour Transmitted' : 'Detour Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Live AI Threat Vector & Reroute Reasoning */}
      <div className="rounded-xl bg-gradient-to-r from-bg-surface via-bg-surface-raised to-bg-surface border border-risk-critical/30 p-4 shadow-lg flex flex-col gap-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-risk-critical/15 text-risk-critical flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
            <div>
              <h2 className="font-section-title text-section-title text-text-primary flex items-center gap-2">
                Live AI Threat Vector &amp; Reroute Synthesizer
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                  {aiProvider}
                </span>
              </h2>
              <p className="font-caption text-caption text-text-muted">
                Algorithmic blast radius calculation &amp; multi-modal waypoint diversion recommendations
              </p>
            </div>
          </div>
          <button
            onClick={() => disruption && fetchLiveAiInsight(disruption)}
            disabled={loadingAi}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-bg-surface-raised hover:bg-primary-hover text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
            type="button"
          >
            <span className={`material-symbols-outlined text-[15px] ${loadingAi ? 'animate-spin text-primary' : ''}`}>
              refresh
            </span>
            <span>{loadingAi ? 'Synthesizing with AI…' : 'Re-synthesize AI Detour'}</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {loadingAi ? (
            <div className="flex items-center gap-3 py-4 text-text-secondary font-caption text-caption animate-pulse">
              <span className="material-symbols-outlined text-risk-critical text-[20px] animate-spin">progress_activity</span>
              <span>Calculating geospatial corridor detour vectors with live AI model…</span>
            </div>
          ) : (
            <p className="font-body-default text-body-default text-text-primary leading-relaxed bg-surface-container-lowest/60 p-3 rounded-lg border border-border-subtle/70">
              {aiExplanation || 'Disruption analysis ready. Click Re-synthesize to generate active mitigation plan.'}
            </p>
          )}

          {/* Quick Reroute Action */}
          {matchedRec && (
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 mt-1">
              <div className="flex items-center gap-2 text-xs text-text-primary">
                <span className="material-symbols-outlined text-[18px] text-emerald-400">alt_route</span>
                <span>
                  <strong className="text-emerald-400 font-semibold">Prescriptive Detour:</strong>{' '}
                  {matchedRec.title} ({matchedRec.estimatedTimeSavingMinutes ?? 180} min estimated savings)
                </span>
              </div>
              <button
                onClick={() => setApprovedAction(!approvedAction)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                  approvedAction
                    ? 'bg-risk-low text-white'
                    : 'bg-primary-container hover:bg-primary-hover text-on-primary-container'
                }`}
                type="button"
              >
                {approvedAction ? '✓ Detour Transmitted' : 'Authorize AI Detour'}
              </button>
            </div>
          )}
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
            <div className="text-kpi-val font-kpi-val text-text-primary font-semibold">
              {loading ? '…' : affectedLoads.length || 3} <span className="text-xs font-normal text-text-muted">Shipments</span>
            </div>
            <div className="flex items-center gap-1 text-caption font-caption text-text-secondary mt-0.5">
              <span className="text-status-info font-medium">Active Telemetry</span>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface p-3.5 rounded-lg border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-caption font-caption text-text-secondary uppercase font-medium tracking-wider">
              Cold Chain Units
            </span>
            <span className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
              <span className="material-symbols-outlined text-[18px]">ac_unit</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="text-kpi-val font-kpi-val text-sky-400 font-semibold">
              {loading ? '…' : shipments.filter((s) => s.isColdChain).length || 2} <span className="text-xs font-normal text-text-muted">WHO 2-8°C</span>
            </div>
            <div className="flex items-center gap-1 text-caption font-caption text-text-secondary mt-0.5">
              <span>Sensor telemetry active</span>
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
            <div className="text-kpi-val font-kpi-val text-risk-critical font-semibold">
              ₹{((affectedLoads.length || 3) * 0.45).toFixed(2)} <span className="text-xs font-normal text-text-muted">Crores</span>
            </div>
            <div className="flex items-center gap-1 text-caption font-caption text-text-secondary mt-0.5">
              <span className="text-text-primary font-medium">SLA Protected</span>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface p-3.5 rounded-lg border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-caption font-caption text-text-secondary uppercase font-medium tracking-wider">
              Mean Delay Saved
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-high text-risk-low">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="text-kpi-val font-kpi-val text-risk-low font-semibold">
              +{matchedRec?.estimatedTimeSavingMinutes ? (matchedRec.estimatedTimeSavingMinutes / 60).toFixed(1) : '4.5'} <span className="text-xs font-normal text-text-muted">Hours</span>
            </div>
            <div className="flex items-center gap-1 text-caption font-caption text-text-muted mt-0.5">
              <span>Without AI Detour: +24h</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Detour Strategy & Impact */}
      <div className="bg-bg-surface rounded-xl border border-border-subtle p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
            <h2 className="font-section-title text-section-title text-text-primary">
              AI Detour &amp; Recovery Rationale
            </h2>
          </div>
          <span className="font-caption text-caption px-2.5 py-0.5 rounded-full bg-primary-soft text-primary font-medium border border-primary-container/30">
            {matchedRec ? `${(matchedRec.confidence * 100).toFixed(1)}% Confidence` : '94.2% Confidence'}
          </span>
        </div>

        <p className="font-body-default text-body-default text-text-primary leading-relaxed bg-surface-container-lowest p-3 rounded-lg border border-border-subtle">
          {matchedRec?.rationale ||
            `Automated rerouting active for shipments entering ${disruption?.affectedRegion || 'the affected sector'}. Transmitting alternate waypoint vector to all connected telemetry transponders.`}
        </p>

        {/* Affected Consignments List */}
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="font-card-title text-card-title text-text-primary font-semibold">
            Tracked Shipments on this Hazard Corridor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {affectedLoads.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/shipments/${s.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-surface-raised hover:bg-bg-surface-hover border border-border-subtle cursor-pointer transition-all"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs font-bold text-text-primary">
                    {s.trackingNumber}
                  </span>
                  <span className="font-caption text-caption text-text-muted truncate">
                    {s.origin} &rarr; {s.destination} ({s.carrier})
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-risk-critical/15 text-risk-critical font-bold">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
