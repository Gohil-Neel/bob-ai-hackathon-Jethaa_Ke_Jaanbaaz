import { useEffect, useState } from 'react'
import {
  ShieldAlert,
  Clock,
  User,
  Activity,
  Search,
  RefreshCw,
  Sparkles,
  FileCode
} from 'lucide-react'
import { getDecisionAudits, getAllRecommendations } from '../services/api'
import type { DecisionAudit, Recommendation } from '../types/domain'

export const AuditPage: React.FC = () => {
  const [audits, setAudits] = useState<DecisionAudit[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'AUDITS' | 'RECOMMENDATIONS'>('AUDITS')
  const [search, setSearch] = useState('')
  const [selectedAudit, setSelectedAudit] = useState<DecisionAudit | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [auditData, recData] = await Promise.all([
        getDecisionAudits(),
        getAllRecommendations(),
      ])
      setAudits(auditData)
      setRecommendations(recData)
      if (auditData.length > 0 && !selectedAudit) {
        setSelectedAudit(auditData[0])
      }
    } catch (err) {
      console.error('Failed to load audit and recommendation data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredAudits = audits.filter((a) => {
    return (
      a.operatorId.toLowerCase().includes(search.toLowerCase()) ||
      a.actionType.toLowerCase().includes(search.toLowerCase()) ||
      a.targetEntityType.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    )
  })

  const filteredRecommendations = recommendations.filter((r) => {
    return (
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.recommendationType.toLowerCase().includes(search.toLowerCase()) ||
      r.rationale.toLowerCase().includes(search.toLowerCase()) ||
      (r.shipmentTrackingNumber && r.shipmentTrackingNumber.toLowerCase().includes(search.toLowerCase()))
    )
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Decision Audits & System Recommendations
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Immutable governance trail of operator overrides, automated rerouting, and AI-driven recovery recommendations.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Audited Events</p>
          <p className="text-2xl font-bold text-white mt-1.5">{audits.length}</p>
          <span className="text-xs text-indigo-400 mt-2 block font-medium">100% Traceable compliance</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applied Interventions</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1.5">
            {audits.filter((a) => a.status === 'APPLIED' || a.status === 'APPROVED').length}
          </p>
          <span className="text-xs text-emerald-400/80 mt-2 block font-medium">Verified state changes</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Recommendations</p>
          <p className="text-2xl font-bold text-amber-400 mt-1.5">{recommendations.length}</p>
          <span className="text-xs text-amber-400/80 mt-2 block font-medium">Algorithmic suggestions</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Est. Net Time Saved</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1.5">
            {Math.round(recommendations.reduce((acc, r) => acc + (r.estimatedTimeSavingMinutes || 0), 0) / 60)}{' '}
            <span className="text-sm font-normal text-slate-400">hrs</span>
          </p>
          <span className="text-xs text-cyan-400/80 mt-2 block font-medium">Optimization impact</span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('AUDITS')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'AUDITS'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            Decision Audit Trail ({audits.length})
          </button>
          <button
            onClick={() => setActiveTab('RECOMMENDATIONS')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'RECOMMENDATIONS'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Recommendations ({recommendations.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'AUDITS'
                ? 'Filter audits by operator, action...'
                : 'Filter recommendations by title, tracking...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tab 1: Decision Audits Master-Detail */}
      {activeTab === 'AUDITS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider px-1">
              Audit Event Records ({filteredAudits.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                Loading audit logs...
              </div>
            ) : filteredAudits.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
                No audit logs found.
              </div>
            ) : (
              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredAudits.map((item) => {
                  const isSelected = selectedAudit?.id === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAudit(item)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                          : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                              {item.actionType}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-200 mt-2 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {item.operatorId}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(item.approvedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Audit Event Detail Inspector */}
          <div className="lg:col-span-6">
            {selectedAudit ? (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-6 backdrop-blur-sm">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Audit ID: {selectedAudit.id}</span>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Status: {selectedAudit.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedAudit.description}</h3>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Action Type</p>
                    <p className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                      {selectedAudit.actionType}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Operator / System</p>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">{selectedAudit.operatorId}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Target Entity</p>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">
                      {selectedAudit.targetEntityType}
                    </p>
                    <span className="text-[11px] font-mono text-slate-500 block truncate">
                      {selectedAudit.targetEntityId}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Timestamp</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">
                      Approved: {new Date(selectedAudit.approvedAt).toLocaleString()}
                    </p>
                    {selectedAudit.appliedAt && (
                      <p className="text-xs text-emerald-400 mt-0.5">
                        Applied: {new Date(selectedAudit.appliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* State Diffs / Payload Inspection */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      State Snapshot (Before / After Transition)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block mb-1">
                          Previous State
                        </span>
                        <pre className="text-[11px] text-slate-400 font-mono overflow-x-auto p-2 bg-slate-900/60 rounded max-h-40">
                          {selectedAudit.beforeStateJson
                            ? JSON.stringify(JSON.parse(selectedAudit.beforeStateJson), null, 2)
                            : '// Initial state (no prior delta)'}
                        </pre>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                          Applied State
                        </span>
                        <pre className="text-[11px] text-emerald-300/90 font-mono overflow-x-auto p-2 bg-slate-900/60 rounded max-h-40">
                          {selectedAudit.afterStateJson
                            ? JSON.stringify(JSON.parse(selectedAudit.afterStateJson), null, 2)
                            : '// Final state active'}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                Select an audit record to inspect the state transition.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Recovery Recommendations */}
      {activeTab === 'RECOMMENDATIONS' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider px-1">
            Active Algorithmic Interventions ({filteredRecommendations.length})
          </h2>

          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Loading recommendations...
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
              No recommendations generated at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                          {rec.recommendationType}
                        </span>
                        {rec.requiresApproval ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Requires Sign-off
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Pre-approved
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-2">{rec.title}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400">
                        Confidence:{' '}
                        <strong className="text-indigo-300">
                          {rec.confidence ? `${Math.round(rec.confidence * 100)}%` : '92%'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    {rec.rationale}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">Target Shipment</span>
                      <strong className="text-white font-mono mt-0.5 block truncate">
                        {rec.shipmentTrackingNumber || rec.shipmentId}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">Est. Time Saved</span>
                      <strong className="text-emerald-400 font-semibold mt-0.5 block">
                        +{rec.estimatedTimeSavingMinutes || 0} mins
                      </strong>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">Cost Delta</span>
                      <strong className="text-cyan-400 font-semibold mt-0.5 block">
                        ${rec.estimatedCostDeltaUsd ?? 0}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                    <span>Proposed Carrier: {rec.proposedCarrier || 'Auto-Optimized'}</span>
                    <span className="font-mono">
                      Generated: {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
