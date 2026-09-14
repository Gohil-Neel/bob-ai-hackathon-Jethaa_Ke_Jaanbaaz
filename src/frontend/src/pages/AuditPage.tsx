/**
 * SupplyShield AI — Decision Audit & Interventions Ledger
 *
 * Immutable governance trail of operator overrides, automated rerouting,
 * and AI-driven recovery recommendations matching Stitch Design System.
 */

import { useEffect, useState } from 'react';
import { getDecisionAudits, getAllRecommendations } from '../services/api';
import type { DecisionAudit, Recommendation } from '../types/domain';

export const AuditPage: React.FC = () => {
  const [audits, setAudits] = useState<DecisionAudit[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'AUDITS' | 'RECOMMENDATIONS'>('AUDITS');
  const [search, setSearch] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<DecisionAudit | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [auditData, recData] = await Promise.all([
        getDecisionAudits(),
        getAllRecommendations(),
      ]);
      setAudits(auditData);
      setRecommendations(recData);
      if (auditData.length > 0 && !selectedAudit) {
        setSelectedAudit(auditData[0]);
      }
    } catch (err) {
      console.error('Failed to load audit and recommendation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAudits = audits.filter((a) => {
    return (
      a.operatorId.toLowerCase().includes(search.toLowerCase()) ||
      a.actionType.toLowerCase().includes(search.toLowerCase()) ||
      a.targetEntityType.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const filteredRecommendations = recommendations.filter((r) => {
    return (
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.recommendationType.toLowerCase().includes(search.toLowerCase()) ||
      r.rationale.toLowerCase().includes(search.toLowerCase()) ||
      (r.shipmentTrackingNumber && r.shipmentTrackingNumber.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-md border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[24px]">gavel</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-section-title text-section-title text-text-primary">
                Decision Audits &amp; System Recommendations
              </span>
              <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">
                100% TRACEABLE
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">
              Immutable governance trail of operator overrides, automated rerouting &amp; AI recovery actions
            </span>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          type="button"
          className="px-3.5 py-2 rounded-lg bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover border border-border-subtle font-badge-label text-badge-label flex items-center gap-1.5 transition-colors self-start xl:self-auto"
        >
          <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
          Refresh Records
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle">
          <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">Total Audited Events</span>
          <span className="font-kpi-val text-kpi-val text-text-primary mt-1">{audits.length}</span>
          <span className="font-caption text-caption text-primary font-medium mt-1">100% Traceable compliance</span>
        </div>

        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle">
          <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">Applied Interventions</span>
          <span className="font-kpi-val text-kpi-val text-risk-low mt-1">
            {audits.filter((a) => a.status === 'APPLIED' || a.status === 'APPROVED').length}
          </span>
          <span className="font-caption text-caption text-risk-low font-medium mt-1">Verified state changes</span>
        </div>

        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle">
          <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">Active Recommendations</span>
          <span className="font-kpi-val text-kpi-val text-risk-high mt-1">{recommendations.length}</span>
          <span className="font-caption text-caption text-risk-high font-medium mt-1">Algorithmic suggestions</span>
        </div>

        <div className="bg-bg-surface p-4 rounded-xl flex flex-col justify-between shadow-sm border border-border-subtle">
          <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">Est. Net Time Saved</span>
          <span className="font-kpi-val text-kpi-val text-primary mt-1">
            {Math.round(recommendations.reduce((acc, r) => acc + (r.estimatedTimeSavingMinutes || 0), 0) / 60)}{' '}
            <span className="text-xs font-normal text-text-muted">hrs</span>
          </span>
          <span className="font-caption text-caption text-primary font-medium mt-1">Optimization impact</span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-border-subtle shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('AUDITS')}
            className={`px-3.5 py-1.5 rounded-lg text-caption font-badge-label font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDITS'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history_edu</span>
            Decision Audit Trail ({audits.length})
          </button>
          <button
            onClick={() => setActiveTab('RECOMMENDATIONS')}
            className={`px-3.5 py-1.5 rounded-lg text-caption font-badge-label font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'RECOMMENDATIONS'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            AI Recommendations ({recommendations.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2 text-text-muted text-[18px]">search</span>
          <input
            type="text"
            placeholder={activeTab === 'AUDITS' ? 'Filter audits...' : 'Filter recommendations...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-text-primary placeholder:text-text-disabled text-caption font-caption outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Audit List Master-Detail */}
      {activeTab === 'AUDITS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            {filteredAudits.map((item) => {
              const isSelected = selectedAudit?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAudit(item)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-surface-container-low border-primary shadow-md'
                      : 'bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-container-lowest'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-surface-container-high">
                        {item.actionType}
                      </span>
                      <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/15 text-risk-low font-semibold">
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <p className="font-card-title text-card-title text-text-primary leading-tight line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-caption font-caption text-text-muted mt-2 pt-2 border-t border-border-subtle">
                    <span>👤 {item.operatorId}</span>
                    <span className="font-mono">{new Date(item.approvedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedAudit && (
            <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-md space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <span className="font-mono text-xs text-text-muted">Audit ID: {selectedAudit.id}</span>
                <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/15 text-risk-low font-bold">
                  {selectedAudit.status}
                </span>
              </div>
              <h3 className="font-section-title text-section-title text-text-primary">{selectedAudit.description}</h3>

              <div className="grid grid-cols-2 gap-3 font-caption text-caption">
                <div className="p-3 rounded-lg bg-bg-surface border border-border-subtle">
                  <div className="text-text-muted">Operator:</div>
                  <div className="font-bold text-text-primary">{selectedAudit.operatorId}</div>
                </div>
                <div className="p-3 rounded-lg bg-bg-surface border border-border-subtle">
                  <div className="text-text-muted">Target Entity:</div>
                  <div className="font-bold text-text-primary">{selectedAudit.targetEntityType} ({selectedAudit.targetEntityId})</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditPage;
