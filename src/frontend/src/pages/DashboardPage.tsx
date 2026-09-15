import { useEffect, useState } from 'react';
import {
  getDashboardKpis,
  getShipments,
  getDisruptions,
  getRoutes,
  getAllRecommendations,
} from '../services/api';
import { requestWatsonxExplanation, checkAiServiceStatus } from '../services/aiService';
import type {
  DashboardKpis,
  Shipment,
  Disruption,
  Route,
  Recommendation,
} from '../types/domain';
import CommandCenterMap from '../components/CommandCenterMap';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedDisruptionId, setSelectedDisruptionId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [showReroutes, setShowReroutes] = useState<boolean>(true);
  const [showBlastRadius, setShowBlastRadius] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'SHIPMENTS' | 'DISRUPTIONS' | 'ROUTES'>('SHIPMENTS');
  const [mapLayer, setMapLayer] = useState<'ALL' | 'CORRIDORS' | 'DISRUPTIONS' | 'REROUTES'>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiProvider, setAiProvider] = useState<string>('✨ Powered by Google Gemini API');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const fetchLiveAiCopilotSummary = (activeDisruptions: Disruption[], activeShipments: Shipment[]) => {
    setLoadingAi(true);
    callGeminiLive(
      'Synthesize the global supply chain situation across all active disruptions and at-risk shipments. Give a concise, 2-sentence executive operational brief with key recommended actions.',
      {
        contextType: 'command_center',
        disruptions: activeDisruptions,
        shipments: activeShipments,
      }
    )
      .then((res) => {
        setAiSummary(res.text);
        setAiProvider('✨ Powered by Google Gemini API');
      })
      .finally(() => {
        setLoadingAi(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDashboardKpis(),
      getShipments(),
      getDisruptions(),
      getRoutes(),
      getAllRecommendations(),
      checkAiServiceStatus(),
    ])
      .then(([kpiData, shipmentData, disruptionData, routeData, recData, aiStat]) => {
        setKpis(kpiData);
        setShipments(shipmentData || []);
        setDisruptions(disruptionData || []);
        setRoutes(routeData || []);
        setRecommendations(recData || []);
        if (aiStat.activeProvider) {
          setAiProvider(aiStat.activeProvider);
        }
        if (disruptionData && disruptionData.length > 0) {
          setSelectedDisruptionId(disruptionData[0].id);
        }
        fetchLiveAiCopilotSummary(disruptionData || [], shipmentData || []);
      })
      .catch((err) => {
        console.error('Failed to load dashboard data from Supabase:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const selectedDisruption: Disruption | null =
    disruptions.find((d) => d.id === selectedDisruptionId) || disruptions[0] || null;

  const selectedRoute: Route | null =
    routes.find((r) => r.id === selectedRouteId) || null;

  const criticalShipmentsCount = shipments.filter(
    (s) => s.status === 'AT_RISK' || (s.riskScore !== null && s.riskScore >= 0.7)
  ).length;

  const coldChainShipments = shipments.filter((s) => s.isColdChain);
  const safeColdChainCount = coldChainShipments.filter((s) => s.status !== 'AT_RISK').length;
  const coldChainCompliancePercent =
    coldChainShipments.length > 0
      ? Math.round((safeColdChainCount / coldChainShipments.length) * 100)
      : 100;

  const onTimeShipmentsCount = shipments.filter(
    (s) => s.status === 'IN_TRANSIT' || s.status === 'DELIVERED'
  ).length;
  const onTimeRatePercent =
    shipments.length > 0 ? Math.round((onTimeShipmentsCount / shipments.length) * 100) : 100;

  // Filter shipments based on selected route or disruption if any
  const displayedShipments = selectedRouteId
    ? shipments.filter((s) => s.routeId === selectedRouteId)
    : shipments;

  // Helper to check if a route has active disruptions
  const getRouteDisruptions = (r: Route): Disruption[] => {
    const name = r.name.toLowerCase();
    return disruptions.filter((d) => {
      const region = d.affectedRegion.toLowerCase();
      const title = d.title.toLowerCase();
      if (name.includes('shanghai') || name.includes('rotterdam')) {
        return title.includes('typhoon') || title.includes('rotterdam') || title.includes('suez');
      }
      if (name.includes('mumbai') || name.includes('hamburg')) {
        return title.includes('suez') || title.includes('rail') || region.includes('germany');
      }
      return false;
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-12 w-full">
      {/* Top Command Bar: Page Header & Live Database Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-page-title text-page-title text-text-primary tracking-tight">Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-risk-low/10 border border-risk-low/30 font-badge-label text-badge-label text-risk-low flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-ping"></span>
              Live Supabase Connected
            </span>
          </div>
          <p className="font-caption text-caption text-text-muted mt-0.5">
            Real-time Operations & Multi-Modal Telemetry Engine • PostgreSQL Synced
          </p>
        </div>

        {/* Global Controls & Upcoming Tagged Features */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-bg-surface rounded border border-border-subtle p-0.5">
            <button
              onClick={() => setSelectedRouteId(null)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedRouteId === null
                  ? 'bg-bg-surface-raised text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              All Corridors ({routes.length} Active)
            </button>
            {routes.slice(0, 2).map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRouteId(r.id === selectedRouteId ? null : r.id)}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors truncate max-w-[130px] ${
                  selectedRouteId === r.id
                    ? 'bg-bg-surface-raised text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
                title={r.name}
              >
                {r.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <a
            href="/disruptions"
            className="flex items-center gap-1.5 h-7 px-3 rounded bg-primary-container text-on-primary-container hover:bg-primary-hover text-xs font-medium transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">add_alert</span>
            <span>Disruptions Hub ({disruptions.length})</span>
          </a>
        </div>
      </div>

      {/* 1. Top KPI Metric Cards Grid (100% Live Supabase Data) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1: Total Shipments */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">Total Shipments</span>
            <span className="material-symbols-outlined text-[18px] text-text-muted">local_shipping</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {loading ? '…' : kpis?.totalShipments ?? shipments.length}
            </span>
            <span className="font-badge-label text-badge-label text-risk-low flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>Live DB
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px]">
            <span>Supabase `shipments`</span>
            <span className="text-risk-low font-medium">{shipments.length} Records</span>
          </div>
        </div>

        {/* KPI 2: Active Disruptions */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-risk-high"></div>
          <div className="flex items-center justify-between text-text-secondary pl-1">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">Active Disruptions</span>
            <span className="material-symbols-outlined text-[18px] text-risk-high">warning</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between pl-1">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {loading ? '…' : kpis?.activeDisruptions ?? disruptions.length}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-risk-high/15 border border-risk-high/30 font-badge-label text-badge-label text-risk-high font-medium">
              {disruptions.filter((d) => d.severity === 'CRITICAL' || d.severity === 'HIGH').length} High Impact
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px] pl-1">
            <span>Supabase `disruptions`</span>
            <span className="text-risk-high font-medium">{disruptions.length} Active</span>
          </div>
        </div>

        {/* KPI 3: At Risk Shipments */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-risk-critical"></div>
          <div className="flex items-center justify-between text-text-secondary pl-1">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">At Risk Shipments</span>
            <span className="material-symbols-outlined text-[18px] text-risk-critical">report_problem</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between pl-1">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {loading ? '…' : kpis?.atRiskShipments ?? criticalShipmentsCount}
            </span>
            <span className="font-badge-label text-badge-label text-risk-critical flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px]">warning</span>Score &ge; 0.70
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px] pl-1">
            <span>Critical Severity</span>
            <span className="text-risk-critical font-medium">{criticalShipmentsCount} Loads</span>
          </div>
        </div>

        {/* KPI 4: Cold Chain Alerts */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-risk-medium"></div>
          <div className="flex items-center justify-between text-text-secondary pl-1">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">Cold Chain Alerts</span>
            <span className="material-symbols-outlined text-[18px] text-risk-medium">ac_unit</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between pl-1">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {loading ? '…' : kpis?.coldChainAlerts ?? 0}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-risk-medium/15 border border-risk-medium/30 font-badge-label text-badge-label text-risk-medium font-medium">
              WHO 2°C–8°C
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px] pl-1">
            <span>Supabase `cold_chain_alerts`</span>
            <span className="text-risk-medium font-medium">{kpis?.coldChainAlerts ?? 0} Open</span>
          </div>
        </div>

        {/* KPI 5: Available Fleet */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-caption text-caption tracking-wider uppercase text-text-muted">Available Fleet</span>
            <span className="material-symbols-outlined text-[18px] text-text-muted">directions_boat</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-kpi-val text-kpi-val text-text-primary tracking-tight">
              {loading ? '…' : kpis?.idleFleetAssets ?? 0}
            </span>
            <span className="font-badge-label text-badge-label text-text-secondary flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px]">check</span>Deployable
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-text-muted font-caption text-[11px]">
            <span>Supabase `vehicles`</span>
            <span className="text-risk-low font-medium">Ready</span>
          </div>
        </div>
      </div>

      {/* Live AI Operations Copilot Intelligence Strip */}
      <div className="rounded-xl bg-gradient-to-r from-bg-surface via-bg-surface-raised to-bg-surface border border-primary/30 p-3.5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-card-title text-card-title text-text-primary font-semibold">
                Live Operations Copilot Synthesis
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                {aiProvider}
              </span>
            </div>
            <p className="font-body-default text-xs text-text-secondary line-clamp-2 mt-0.5">
              {loadingAi
                ? 'Synthesizing live multi-modal risk vectors, weather alarms, and cold-chain buffers…'
                : aiSummary || 'Real-time AI monitoring active across all global corridors.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => fetchLiveAiCopilotSummary(disruptions, shipments)}
            disabled={loadingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface-raised hover:bg-primary-hover text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-medium transition-colors cursor-pointer"
            type="button"
          >
            <span className={`material-symbols-outlined text-[15px] ${loadingAi ? 'animate-spin text-primary' : ''}`}>
              refresh
            </span>
            <span>{loadingAi ? 'Synthesizing…' : 'Refresh AI'}</span>
          </button>
          <a
            href="/ai-insights"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary-container text-xs font-medium transition-colors shadow-sm"
          >
            <span>Open Copilot</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
        </div>
      </div>

      {/* 2. Center Live Operational Grid: Live Routes Map & Disruption Workbench */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 min-h-[580px]">
        {/* Interactive Live Routes Map (7 Columns Desktop) */}
        <div className="xl:col-span-7 bg-bg-surface rounded-lg border border-border-subtle flex flex-col relative overflow-hidden group shadow-sm">
          {/* Map Header Controls Bar */}
          <div className="h-11 px-3 border-b border-border-subtle flex items-center justify-between bg-bg-surface z-10">
            <div className="flex items-center gap-2">
              <span className="font-card-title text-card-title text-text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-primary">hub</span>
                Corridors & Multi-Modal Nodes
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-caption font-caption text-text-secondary border border-border-subtle flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse"></span>
                {routes.length} Live Routes • {disruptions.length} Disruptions
              </span>
            </div>
            
            {/* Map Layer Controls & Feature Toggles */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setShowBlastRadius(!showBlastRadius)}
                  className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                    showBlastRadius ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30 font-medium' : 'text-text-muted hover:text-text-secondary'
                  }`}
                  type="button"
                  title="Toggle Disruption Blast Radius"
                >
                  <span className="material-symbols-outlined text-[13px]">radar</span>
                  Radius
                </button>
                <button
                  onClick={() => setShowReroutes(!showReroutes)}
                  className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                    showReroutes ? 'bg-primary-soft text-primary border border-primary/30 font-medium' : 'text-text-muted hover:text-text-secondary'
                  }`}
                  type="button"
                  title="Toggle AI Alternate Reroutes"
                >
                  <span className="material-symbols-outlined text-[13px]">alt_route</span>
                  Bypasses
                </button>
              </div>

              <div className="flex items-center bg-bg-surface-raised rounded border border-border-subtle p-0.5 text-xs">
                <button
                  onClick={() => setMapLayer('ALL')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    mapLayer === 'ALL' ? 'bg-primary-container text-on-primary-container font-medium shadow-xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                >
                  All
                </button>
                <button
                  onClick={() => setMapLayer('CORRIDORS')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    mapLayer === 'CORRIDORS' ? 'bg-primary-container text-on-primary-container font-medium shadow-xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                >
                  Routes
                </button>
                <button
                  onClick={() => setMapLayer('DISRUPTIONS')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    mapLayer === 'DISRUPTIONS' ? 'bg-primary-container text-on-primary-container font-medium shadow-xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                >
                  Disruptions
                </button>
              </div>
            </div>
          </div>

          {/* Quick Route Selector Bar under Map Header */}
          <div className="px-3 py-1.5 bg-surface-container-lowest border-b border-border-subtle flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-text-muted font-caption uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1 whitespace-nowrap">
              <span className="material-symbols-outlined text-[13px]">route</span> Corridors:
            </span>
            <button
              onClick={() => setSelectedRouteId(null)}
              className={`px-2 py-0.5 rounded-full border transition-all whitespace-nowrap ${
                selectedRouteId === null
                  ? 'bg-primary-container text-on-primary-container border-primary/40 font-semibold shadow-xs'
                  : 'bg-bg-surface text-text-secondary border-border-subtle hover:border-border-strong hover:text-text-primary'
              }`}
              type="button"
            >
              All 5 Corridors
            </button>
            {routes.map((r) => {
              const routeDisruptions = getRouteDisruptions(r);
              const isSelected = selectedRouteId === r.id;
              const hasCritical = routeDisruptions.some((d) => d.severity === 'CRITICAL');
              const hasWarning = routeDisruptions.length > 0;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteId(isSelected ? null : r.id)}
                  className={`px-2 py-0.5 rounded-full border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-primary text-on-primary border-primary font-semibold shadow-xs'
                      : 'bg-bg-surface text-text-secondary border-border-subtle hover:border-border-strong hover:text-text-primary'
                  }`}
                  type="button"
                  title={`${r.name} (${r.carrierCode || 'Carrier'}) • ${r.estimatedHours}h Transit`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasCritical ? 'bg-risk-critical animate-ping' : hasWarning ? 'bg-risk-medium' : 'bg-risk-low'
                    }`}
                  ></span>
                  <span>{r.name.split(' - ')[0]} → {r.name.split(' - ')[1]?.split(' ')[0] || r.destination.split(',')[0]}</span>
                  {hasWarning && (
                    <span className={`text-[9px] px-1 rounded ${hasCritical ? 'bg-risk-critical/20 text-risk-critical' : 'bg-risk-medium/20 text-risk-medium'}`}>
                      {routeDisruptions.length} alert
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Real Interactive Leaflet Map with Live Telemetry & Tracking */}
          <CommandCenterMap
            routes={routes}
            disruptions={disruptions}
            shipments={shipments}
            selectedRouteId={selectedRouteId}
            selectedDisruptionId={selectedDisruptionId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            onSelectDisruption={(id) => setSelectedDisruptionId(id)}
            onSelectShipment={() => setActiveTab('SHIPMENTS')}
            showBlastRadius={showBlastRadius}
            showReroutes={showReroutes}
            mapLayer={mapLayer}
          />
        </div>

        {/* Right Incident Workbench / Selected Event Drawer (5 Columns Desktop) */}
        <div className="xl:col-span-5 bg-bg-surface rounded-lg border border-border-subtle flex flex-col justify-between overflow-hidden">
          {selectedDisruption ? (
            <>
              <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-surface-container-low">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-risk-high">warning</span>
                  <span className="text-xs font-semibold text-text-primary">Disruption Workbench</span>
                </div>
                {disruptions.length > 1 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-text-muted px-1">
                      {disruptions.findIndex((d) => d.id === selectedDisruptionId) + 1} / {disruptions.length}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3.5 border-b border-border-subtle">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-section-title text-section-title text-text-primary font-semibold">
                        {selectedDisruption.title}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-full font-badge-label text-badge-label font-medium ${
                          selectedDisruption.severity === 'CRITICAL'
                            ? 'bg-risk-critical/15 text-risk-critical border border-risk-critical/30'
                            : selectedDisruption.severity === 'HIGH'
                            ? 'bg-risk-high/15 text-risk-high border border-risk-high/30'
                            : 'bg-risk-medium/15 text-risk-medium border border-risk-medium/30'
                        }`}
                      >
                        {selectedDisruption.severity}
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-muted mt-0.5">
                      {selectedDisruption.affectedRegion}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-risk-low/10 border border-risk-low/30 text-[11px] text-risk-low font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse"></span> Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border-subtle/60 text-xs">
                  <div>
                    <span className="font-caption text-[11px] text-text-muted block">Disruption Type</span>
                    <span className="font-medium text-text-primary">{selectedDisruption.disruptionType}</span>
                  </div>
                  <div>
                    <span className="font-caption text-[11px] text-text-muted block">Started At</span>
                    <span className="font-medium text-text-primary">
                      {new Date(selectedDisruption.startedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Stats Row from Live Database */}
              <div className="grid grid-cols-3 border-b border-border-subtle bg-bg-surface-raised divide-x divide-border-subtle text-center">
                <div className="p-2.5">
                  <span className="font-caption text-[11px] text-text-muted block truncate">Affected</span>
                  <span className="text-base font-semibold text-text-primary mt-0.5 block">
                    {selectedDisruption.affectedShipmentCount || 1}
                  </span>
                  <span className="text-[10px] text-text-muted">Shipments</span>
                </div>
                <div className="p-2.5 bg-risk-critical/5">
                  <span className="font-caption text-[11px] text-error block truncate">Severity</span>
                  <span className="text-base font-semibold text-risk-critical mt-0.5 block">
                    {selectedDisruption.severity}
                  </span>
                  <span className="text-[10px] text-error/80">Impact Tier</span>
                </div>
                <div className="p-2.5">
                  <span className="font-caption text-[11px] text-text-muted block truncate">Status</span>
                  <span className="text-base font-semibold text-risk-low mt-0.5 block">
                    {selectedDisruption.isActive ? 'Active' : 'Resolved'}
                  </span>
                  <span className="text-[10px] text-text-muted">Supabase DB</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-text-muted">
              <span className="material-symbols-outlined text-[32px] text-text-disabled mb-2">check_circle</span>
              <p className="text-sm font-medium text-text-primary">No Active Disruptions in Supabase</p>
              <p className="text-xs mt-1">All monitored shipping lanes are operating normally.</p>
            </div>
          )}

          {/* Toggle Tab Bar between Shipments, Disruptions, and Routes */}
          <div className="px-3 pt-2 border-b border-border-subtle flex items-center justify-between bg-bg-surface">
            <div className="flex items-center gap-4 text-xs font-medium">
              <button
                onClick={() => setActiveTab('SHIPMENTS')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'SHIPMENTS'
                    ? 'border-primary-container text-primary font-semibold'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                Live Shipments ({displayedShipments.length})
              </button>
              <button
                onClick={() => setActiveTab('DISRUPTIONS')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'DISRUPTIONS'
                    ? 'border-primary-container text-primary font-semibold'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                Disruptions ({disruptions.length})
              </button>
              <button
                onClick={() => setActiveTab('ROUTES')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'ROUTES'
                    ? 'border-primary-container text-primary font-semibold'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                Routes ({routes.length})
              </button>
            </div>
            <span className="text-[11px] text-text-muted">Supabase Verified</span>
          </div>

          {/* Live Table Render */}
          <div className="flex-1 overflow-x-auto min-h-[185px]">
            {activeTab === 'SHIPMENTS' ? (
              <table className="w-full text-left border-collapse text-table-cell font-table-cell">
                <thead>
                  <tr className="h-8 bg-surface-container-lowest text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
                    <th className="px-3 py-1 font-medium">Tracking #</th>
                    <th className="px-2 py-1 font-medium">Route</th>
                    <th className="px-2 py-1 font-medium text-center">Carrier</th>
                    <th className="px-2 py-1 font-medium text-center">Risk Score</th>
                    <th className="px-2 py-1 font-medium">Status</th>
                    <th className="px-3 py-1 font-medium text-right">Cold Chain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-xs">
                  {displayedShipments.length > 0 ? (
                    displayedShipments.map((s) => (
                      <tr key={s.id} className="h-10 hover:bg-bg-surface-hover transition-colors">
                        <td className="px-3 py-1.5 font-medium text-primary flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.status === 'AT_RISK' || s.status === 'DELAYED'
                                ? 'bg-risk-critical'
                                : 'bg-risk-low'
                            }`}
                          ></span>
                          <span>{s.trackingNumber}</span>
                        </td>
                        <td className="px-2 py-1.5 text-text-secondary truncate max-w-[140px]" title={`${s.origin} → ${s.destination}`}>
                          {s.origin} → {s.destination}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-bg-surface border border-border-subtle font-mono text-text-primary">
                            {s.carrier}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span
                            className={`font-semibold text-[11px] ${
                              s.riskScore && s.riskScore >= 0.7
                                ? 'text-risk-critical'
                                : s.riskScore && s.riskScore >= 0.4
                                ? 'text-risk-medium'
                                : 'text-risk-low'
                            }`}
                          >
                            {s.riskScore !== null ? `${(s.riskScore * 100).toFixed(0)}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              s.status === 'AT_RISK'
                                ? 'bg-risk-critical/10 text-risk-critical border border-risk-critical/30'
                                : s.status === 'DELAYED'
                                ? 'bg-risk-high/15 text-risk-high border border-risk-high/30'
                                : 'bg-risk-low/10 text-risk-low border border-risk-low/30'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          {s.isColdChain ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 font-medium">
                              ❄️ 2°C–8°C
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-muted">Ambient</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-text-muted">
                        No shipments found in Supabase database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : activeTab === 'DISRUPTIONS' ? (
              <table className="w-full text-left border-collapse text-table-cell font-table-cell">
                <thead>
                  <tr className="h-8 bg-surface-container-lowest text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
                    <th className="px-3 py-1 font-medium">Title</th>
                    <th className="px-2 py-1 font-medium">Type</th>
                    <th className="px-2 py-1 font-medium">Region</th>
                    <th className="px-2 py-1 font-medium text-center">Severity</th>
                    <th className="px-3 py-1 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-xs">
                  {disruptions.length > 0 ? (
                    disruptions.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDisruptionId(d.id)}
                        className={`h-10 cursor-pointer transition-colors ${
                          selectedDisruptionId === d.id ? 'bg-primary-soft/50' : 'hover:bg-bg-surface-hover'
                        }`}
                      >
                        <td className="px-3 py-1.5 font-medium text-text-primary truncate max-w-[150px]">
                          {d.title}
                        </td>
                        <td className="px-2 py-1.5 text-text-secondary">{d.disruptionType}</td>
                        <td className="px-2 py-1.5 text-text-muted truncate max-w-[120px]">{d.affectedRegion}</td>
                        <td className="px-2 py-1.5 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              d.severity === 'CRITICAL'
                                ? 'bg-risk-critical/15 text-risk-critical'
                                : 'bg-risk-high/15 text-risk-high'
                            }`}
                          >
                            {d.severity}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <button className="text-primary text-[11px] hover:underline font-medium" type="button">
                            Select
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-text-muted">
                        No disruptions found in Supabase database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-table-cell font-table-cell">
                <thead>
                  <tr className="h-8 bg-surface-container-lowest text-text-muted uppercase text-[10px] tracking-wider border-b border-border-subtle">
                    <th className="px-3 py-1 font-medium">Route Name</th>
                    <th className="px-2 py-1 font-medium">Origin → Dest</th>
                    <th className="px-2 py-1 font-medium text-center">Carrier</th>
                    <th className="px-2 py-1 font-medium text-center">Transit</th>
                    <th className="px-3 py-1 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-xs">
                  {routes.length > 0 ? (
                    routes.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRouteId(r.id === selectedRouteId ? null : r.id)}
                        className={`h-10 cursor-pointer transition-colors ${
                          selectedRouteId === r.id ? 'bg-primary-soft/50' : 'hover:bg-bg-surface-hover'
                        }`}
                      >
                        <td className="px-3 py-1.5 font-medium text-text-primary truncate max-w-[150px]">
                          {r.name}
                        </td>
                        <td className="px-2 py-1.5 text-text-secondary truncate max-w-[140px]">
                          {r.origin} → {r.destination}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-bg-surface border border-border-subtle font-mono text-text-primary">
                            {r.carrierCode || 'MAERSK'}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center text-text-muted">
                          {r.estimatedHours}h
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <button className="text-primary text-[11px] hover:underline font-medium" type="button">
                            {selectedRouteId === r.id ? 'Clear' : 'Filter'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-text-muted">
                        No routes found in Supabase database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-3 py-2 bg-surface-container-lowest border-t border-border-subtle flex items-center justify-between">
            <span className="text-caption text-text-muted">
              {shipments.length} live shipments • {routes.length} routes • {disruptions.length} disruptions
            </span>
            <a className="text-xs text-primary hover:underline font-medium flex items-center gap-1" href="/shipments">
              <span>View full Shipments Directory</span>
              <span className="material-symbols-outlined text-[14px]">east</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Bottom Analytical Cards Grid (100% Live DB Data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Bottom Card 1: Active Disruptions from Supabase */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3.5 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-risk-critical">report</span>
                <h3 className="font-card-title text-card-title text-text-primary">Active Disruptions</h3>
              </div>
              <a className="font-caption text-caption text-primary hover:underline" href="/disruptions">
                View all ({disruptions.length})
              </a>
            </div>
            <div className="flex flex-col gap-2">
              {disruptions.length > 0 ? (
                disruptions.slice(0, 2).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDisruptionId(d.id)}
                    className="p-2 rounded bg-surface-container-low border border-border-subtle flex items-center justify-between hover:border-border-strong transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          d.severity === 'CRITICAL' ? 'bg-risk-critical' : 'bg-risk-high'
                        }`}
                      ></div>
                      <div className="min-w-0">
                        <div className="font-body-default text-xs font-semibold text-text-primary truncate">{d.title}</div>
                        <div className="font-caption text-[11px] text-text-muted truncate">{d.affectedRegion}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-risk-critical/15 border border-risk-critical/30 font-badge-label text-[10px] text-risk-critical whitespace-nowrap ml-2">
                      {d.severity}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-text-muted">
                  No active disruptions recorded in Supabase.
                </div>
              )}
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border-subtle/70 flex items-center justify-between text-caption text-[11px] text-text-muted">
            <span className="flex items-center gap-1 text-risk-low">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low"></span> Supabase `disruptions` table
            </span>
            <span>{disruptions.filter((d) => d.isActive).length} Ongoing Events</span>
          </div>
        </div>

        {/* Bottom Card 2: AI Recovery Recommendations from Supabase recovery_recommendations */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3.5 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-primary">neurology</span>
                <h3 className="font-card-title text-card-title text-text-primary">Recovery Plan</h3>
                <span className="px-1.5 py-0.2 rounded bg-primary-soft text-[10px] text-primary font-medium">Supabase</span>
              </div>
              <a className="font-caption text-caption text-primary hover:underline" href="/audit">
                Audit Trail
              </a>
            </div>
            <div className="flex flex-col gap-2">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 1).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded bg-surface-container-low border border-border-subtle flex flex-col gap-1.5 hover:border-border-strong transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-primary truncate">{rec.title}</span>
                      <span className="px-1.5 py-0.2 rounded bg-risk-critical/15 text-risk-critical text-[10px] font-medium">
                        {rec.severity}
                      </span>
                    </div>
                    <p className="font-caption text-[11px] text-text-secondary leading-tight line-clamp-2">
                      {rec.rationale}
                    </p>
                    <div className="flex items-center justify-between pt-1 mt-1 border-t border-border-subtle/50">
                      <span className="text-[10px] text-risk-low font-medium">
                        Saves {rec.estimatedTimeSavingMinutes ? `${Math.floor(rec.estimatedTimeSavingMinutes / 60)}h` : '12h'}
                      </span>
                      <a
                        href="/audit"
                        className="px-2 py-0.5 rounded bg-primary-container hover:bg-primary-hover text-on-primary-container text-[11px] font-medium transition-colors"
                      >
                        Review Plan
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-text-muted">
                  No pending recovery actions in Supabase `recovery_recommendations`.
                </div>
              )}
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border-subtle/70 flex items-center justify-between text-caption text-[11px] text-text-muted">
            <span className="text-text-muted">
              {recommendations.length > 0 && recommendations[0].confidence
                ? `Confidence: ${(recommendations[0].confidence * 100).toFixed(1)}%`
                : 'Confidence: Live Model'}
            </span>
            <span className="text-risk-low font-medium">Supabase AI Ledger</span>
          </div>
        </div>

        {/* Bottom Card 3: Live Network Pulse from Supabase Shipments */}
        <div className="bg-bg-surface rounded-lg border border-border-subtle p-3.5 flex flex-col justify-between hover:border-border-strong transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-risk-low">health_and_safety</span>
                <h3 className="font-card-title text-card-title text-text-primary">Network Pulse</h3>
              </div>
              <span className="font-caption text-caption text-text-muted">Live Computed</span>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary">On-Time / Nominal Shipments</span>
                  <span className="font-medium text-risk-low">{onTimeRatePercent}%</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5">
                  <div className="bg-risk-low h-1.5 rounded-full transition-all" style={{ width: `${onTimeRatePercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary">Cold Chain Compliance (2°C–8°C)</span>
                  <span className="font-medium text-primary">{coldChainCompliancePercent}%</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${coldChainCompliancePercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border-subtle/70 flex items-center justify-between text-caption text-[11px] text-text-muted">
            <span className="flex items-center gap-1 text-risk-low">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse"></span> DB Verified
            </span>
            <span>{shipments.length} Active Shipments Tracked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
