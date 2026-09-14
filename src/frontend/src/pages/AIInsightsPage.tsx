import { useState } from 'react'
import { Link } from 'react-router-dom'

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  time: string
  text?: string
  bulletPoints?: string[]
  badge?: string
}

export default function AIInsightsPage() {
  const [activeView, setActiveView] = useState<'insights' | 'approval'>('insights')
  const [insightSubTab, setInsightSubTab] = useState<'priority' | 'recommendations' | 'root_cause' | 'queries'>('priority')
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'user',
      time: '14:28',
      text: 'What is the single biggest operational risk right now?'
    },
    {
      id: '2',
      sender: 'ai',
      time: 'Just now',
      text: 'The biggest immediate operational risk is NH-48 Solapur-Pune Inundation (Km 194.2):',
      bulletPoints: [
        'Affects 17 transit shipments, including 4 critical pharma/cryo units.',
        'Total ₹2.40 Cr cargo value in imminent danger of SLA and thermal rupture.',
        'Primary critical target: SHP-0117 (Vaccines) has 42 minutes of MKT thermal buffer remaining before irreversible spoilage.'
      ]
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Action / Approval States
  const [chkHos, setChkHos] = useState(true)
  const [chkDryIce, setChkDryIce] = useState(true)
  const [chkFastag, setChkFastag] = useState(true)
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [isDispatched, setIsDispatched] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null)
  const [showThresholdModal, setShowThresholdModal] = useState(false)

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!chatInput.trim()) return

    const userText = chatInput.trim()
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userText
    }
    setChatMessages(prev => [...prev, newMsg])
    setChatInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      let aiResponseText = `Analysis regarding "${userText}":`
      let aiBullets: string[] = []

      if (userText.toLowerCase().includes('solapur') || userText.toLowerCase().includes('nh-48') || userText.toLowerCase().includes('flood')) {
        aiResponseText = 'NH-48 Solapur-Pune corridor status:'
        aiBullets = [
          'Water depth at Km 194.2 measured at 1.2m over tarmac. Standstill speed: 0 km/h.',
          'Recommended bypass via SH-142 Solapur Ridge (+42 km) preserves on-time delivery with 94.8% confidence.',
          'FASTag automated pre-clearance is armed at Plaza 02 for 17 license plates.'
        ]
      } else if (userText.toLowerCase().includes('cold') || userText.toLowerCase().includes('temp') || userText.toLowerCase().includes('cryo') || userText.toLowerCase().includes('vaccine')) {
        aiResponseText = 'Cold Chain Telemetry Synthesis:'
        aiBullets = [
          'Vehicle TRK-203 rear door gasket micro-fracture detected; probe P3 reads +10.4°C.',
          'MKT kinetic buffer: 42 minutes remaining before batch excursion.',
          'Dry-ice intercept van DRY-ICE-VAN-04 is stationed at Toll 4 (14km away) ready for immediate deployment.'
        ]
      } else {
        aiResponseText = 'Operations Copilot synthesized analysis:'
        aiBullets = [
          'Multimodal inference engine scanned 1,248 live nodes across the Western freight grid.',
          'Value under algorithmic guard: ₹4.82 Cr (94.2% protected).',
          'All active prescriptive actions conform to ISO 17025 compliance policies.'
        ]
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          time: 'Just now',
          text: aiResponseText,
          bulletPoints: aiBullets
        }
      ])
    }, 800)
  }

  const handleAuthorizeDispatch = () => {
    setIsAuthorizing(true)
    setTimeout(() => {
      setIsAuthorizing(false)
      setIsDispatched(true)
      setToastMessage({
        title: 'Mitigation Suite Authorized & Dispatched',
        desc: '17 in-cab waypoints transmitted • Dry-ice van dispatched • Apollo Hospital notified',
        type: 'success'
      })
      setTimeout(() => setToastMessage(null), 6000)
    }, 1100)
  }

  return (
    <div className="flex flex-col w-full text-on-surface pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-8 bg-surface-container-high border border-risk-low text-text-primary px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="material-symbols-outlined text-risk-low text-[24px]">
            {toastMessage.type === 'success' ? 'verified' : 'auto_awesome'}
          </span>
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-text-primary">{toastMessage.title}</span>
            <span className="text-[11px] text-text-secondary">{toastMessage.desc}</span>
          </div>
        </div>
      )}

      {/* Top Intelligence Breadcrumb & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-border-subtle">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
              INTELLIGENCE ENGINE
            </span>
            <span className="text-text-disabled text-xs">•</span>
            <span className="font-caption text-caption text-primary tracking-tight font-medium">
              Real-time Algorithmic Operations Copilot
            </span>
          </div>
          <h1 className="font-page-title text-page-title text-text-primary flex items-center gap-2.5">
            AI Insights & Operations Copilot
          </h1>
          <p className="font-body-default text-body-default text-text-secondary">
            Proactive disruption synthesis, multimodal risk prioritization, and decision rationale copiloting powered by watsonx.ai
          </p>
        </div>

        {/* Global Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-container border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-risk-low animate-pulse"></span>
            <span className="font-table-cell text-table-cell text-text-primary font-medium">Inference Engine v4.2 Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-border-subtle text-text-muted font-table-cell text-table-cell">
            <span className="material-symbols-outlined text-[15px] text-primary">bolt</span>
            <span>128ms • Multi-Modal RAG</span>
          </div>

          <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-border-subtle">
            <button
              onClick={() => setActiveView('insights')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeView === 'insights'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Copilot Overview
            </button>
            <button
              onClick={() => setActiveView('approval')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeView === 'approval'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Action Approval Chamber</span>
              <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-ping"></span>
            </button>
          </div>

          <button
            onClick={() => setShowThresholdModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle transition-colors text-xs font-medium cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Configure Anomaly Thresholds</span>
          </button>
        </div>
      </div>

      {/* 4 Dense Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {/* Card 1 */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-start justify-between">
            <span className="font-card-title text-card-title text-text-secondary">Proactive Anomalies Detected</span>
            <span className="p-1.5 rounded-lg bg-error-container/20 text-risk-critical">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">14 Flags</span>
            <span className="font-caption text-caption text-risk-critical flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span> 4 in 30m
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-risk-critical h-full w-[21.4%]" title="3 Critical"></div>
              <div className="bg-risk-medium h-full w-[42.8%]" title="6 High/Watch"></div>
              <div className="bg-risk-low h-full w-[35.8%]" title="5 Optimized"></div>
            </div>
            <div className="flex items-center justify-between mt-1.5 font-caption text-caption text-text-muted">
              <span>3 Critical Tier</span>
              <span>6 Watch • 5 Optimized</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-start justify-between">
            <span className="font-card-title text-card-title text-text-secondary">Value Under Algorithmic Guard</span>
            <span className="p-1.5 rounded-lg bg-primary-soft text-primary">
              <span className="material-symbols-outlined text-[18px]">shield</span>
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">₹4.82 Cr</span>
            <span className="font-badge-label text-badge-label px-1.5 py-0.5 rounded-full bg-risk-low/10 text-risk-low border border-risk-low/30">
              94.2% Protected
            </span>
          </div>
          <div className="mt-2 text-text-muted font-caption text-caption flex items-center justify-between">
            <span>31 Shipments monitored</span>
            <span>4 Active chokepoints</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-start justify-between">
            <span className="font-card-title text-card-title text-text-secondary">Automated Reroute Salvage</span>
            <span className="p-1.5 rounded-lg bg-risk-low/10 text-risk-low">
              <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">₹1,84,500</span>
            <span className="font-badge-label text-badge-label px-1.5 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/30">
              +22.4h SLA
            </span>
          </div>
          <div className="mt-2 text-text-muted font-caption text-caption flex items-center justify-between">
            <span>Saved across 12 approved detours</span>
            <span>Cycle SLA safe</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-start justify-between">
            <span className="font-card-title text-card-title text-text-secondary">Decision Copilot Accuracy</span>
            <span className="p-1.5 rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-kpi-val text-kpi-val text-text-primary">96.4%</span>
            <span className="font-caption text-caption text-text-secondary font-medium">Operator Agree</span>
          </div>
          <div className="mt-2 flex items-center justify-between font-caption text-caption text-text-muted">
            <div className="flex items-center gap-1.5">
              <div className="w-16 bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-container h-full w-[96.4%]"></div>
              </div>
              <span>High Precision</span>
            </div>
            <span>250 Actions</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: PROACTIVE COPILOT & INSIGHTS OVERVIEW */}
      {activeView === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Tabbed Workspace & Detailed Insights */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Tabs Navigation */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-px">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setInsightSubTab('priority')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                    insightSubTab === 'priority'
                      ? 'border-primary-container text-primary'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                  <span>High-Priority Insights (7)</span>
                </button>
                <button
                  onClick={() => setInsightSubTab('recommendations')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                    insightSubTab === 'recommendations'
                      ? 'border-primary-container text-primary'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span>Prescriptive Recommendations (4)</span>
                </button>
                <button
                  onClick={() => setInsightSubTab('root_cause')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                    insightSubTab === 'root_cause'
                      ? 'border-primary-container text-primary'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  <span>Root Cause Intelligence</span>
                </button>
                <button
                  onClick={() => setInsightSubTab('queries')}
                  className={`hidden md:flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                    insightSubTab === 'queries'
                      ? 'border-primary-container text-primary'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">database</span>
                  <span>Operational Queries</span>
                </button>
              </div>
              <div className="flex items-center gap-1 text-text-muted">
                <span className="font-caption text-caption">Sort by Risk Severity</span>
                <span className="material-symbols-outlined text-[16px]">swap_vert</span>
              </div>
            </div>

            {/* Sub-tab 1: High Priority Insights */}
            {insightSubTab === 'priority' && (
              <div className="flex flex-col gap-3.5">
                {/* Urgent Insight Card 1: Disruption Cascade Hazard */}
                <div className="relative overflow-hidden rounded-xl bg-bg-surface border border-risk-critical/30 p-4 shadow-sm hover:border-risk-critical/60 transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-risk-critical"></div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pl-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-caption text-caption px-2 py-0.5 rounded bg-error-container/20 text-risk-critical border border-risk-critical/30 font-semibold tracking-wide">
                        DISRUPTION CASCADE HAZARD
                      </span>
                      <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical font-medium">
                        CRITICAL P0
                      </span>
                      <span className="font-caption text-caption text-text-muted flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        94.8% AI Confidence
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-muted">Detected 8 min ago • Radar Telemetry</span>
                  </div>
                  <div className="pl-2">
                    <h3 className="font-card-title text-card-title text-text-primary text-[15px] mb-1.5 font-semibold">
                      NH-48 Inundation Imminent Backlog: 7 Transit Units approaching Solapur gridlock within 45 min
                    </h3>
                    <p className="font-body-default text-body-default text-text-secondary leading-relaxed mb-3">
                      Satellite radar confirms water level breach <strong className="text-text-primary">+1.2m at Km 194.2</strong>. Delay probability without intervention: <span className="text-risk-critical font-medium">&gt;6.8 hours</span>. Critical consignments include <code className="text-xs px-1.5 py-0.5 rounded bg-surface-container-low text-primary border border-border-subtle">SHP-0117</code> (HPV Vaccines, ₹1.85 Cr) and <code className="text-xs px-1.5 py-0.5 rounded bg-surface-container-low text-primary border border-border-subtle">SHP-0102</code> (Lithium Modules).
                    </p>

                    {/* Impact Metrics Row */}
                    <div className="grid grid-cols-3 gap-2.5 py-2.5 px-3 rounded-lg bg-surface-container-lowest border border-border-subtle mb-3">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-text-muted">Delay Impact</span>
                        <span className="text-xs font-semibold text-risk-critical">+5.8h Expected</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-text-muted">Thermal Hazard</span>
                        <span className="text-xs font-semibold text-risk-high">92% Cryo Excursion</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-text-muted">Financial Penalty Risk</span>
                        <span className="text-xs font-semibold text-text-primary">₹1,42,000 SLA Deficit</span>
                      </div>
                    </div>

                    {/* Proposed Action Banner */}
                    <div className="p-2.5 rounded-lg bg-surface-container-high border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">alt_route</span>
                        <span className="font-caption text-caption text-text-primary leading-snug">
                          <strong className="text-primary">Recommended Action:</strong> Instant batch reroute via <strong>SH-142 Solapur Bypass</strong> (+42km, +₹1,840/truck, ETA preservation 94%).
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <Link
                          to="/simulations"
                          className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-surface-container border border-border-subtle hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-colors inline-block"
                        >
                          Open in What-If
                        </Link>
                        <button
                          onClick={() => setActiveView('approval')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary-container hover:bg-primary-hover text-on-primary-container transition-colors shadow-sm cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Authorize Detour</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Urgent Insight Card 2: Cold Chain Telemetry Drift */}
                <div className="relative overflow-hidden rounded-xl bg-bg-surface border border-risk-medium/30 p-4 shadow-sm hover:border-risk-medium/60 transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-risk-medium"></div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pl-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-caption text-caption px-2 py-0.5 rounded bg-risk-medium/15 text-risk-medium border border-risk-medium/30 font-semibold tracking-wide">
                        COLD CHAIN TELEMETRY DRIFT
                      </span>
                      <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-medium/15 text-risk-medium font-medium">
                        HIGH P1
                      </span>
                      <span className="font-caption text-caption text-text-muted flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        91.2% AI Confidence
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-muted">Vehicle TRK-203 • Sensor P3</span>
                  </div>
                  <div className="pl-2">
                    <h3 className="font-card-title text-card-title text-text-primary text-[15px] mb-1.5 font-semibold">
                      Thermal Bridge Detected: Reefer TRK-203 Rear Door Gasket micro-fracture under Solapur heatwave
                    </h3>
                    <p className="font-body-default text-body-default text-text-secondary leading-relaxed mb-3">
                      Internal reefer cargo temperature shows linear climb rate of <span className="text-risk-medium font-medium">+0.8°C/hr</span>. Probe P3 telemetry is registering <strong className="text-risk-critical">+10.4°C</strong> against critical pharma safety threshold limit of <span className="text-text-primary">+8.0°C</span>. Mean Kinetic Temperature (MKT) remaining buffer is <strong>42 minutes</strong> before batch integrity breach.
                    </p>

                    {/* Telemetry Graph + Parameter Block */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-lg bg-surface-container-lowest border border-border-subtle mb-3 items-center">
                      <div className="md:col-span-8 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-caption text-caption text-text-muted">Reefer Probe P3 Temp Trend vs +8.0°C Ceiling</span>
                          <span className="font-caption text-caption text-risk-critical font-medium">+10.4°C (Excursion)</span>
                        </div>
                        {/* Inline Telemetry SVG Sparkline */}
                        <div className="w-full h-12 relative flex items-center">
                          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 48">
                            <rect fill="rgba(34, 197, 94, 0.08)" height="24" width="400" x="0" y="24"></rect>
                            <line stroke="#f59e0b" strokeDasharray="4 2" strokeWidth="1" x1="0" x2="400" y1="24" y2="24"></line>
                            <path d="M0,38 Q50,36 100,34 T200,30 T280,24 T350,14 L400,8" fill="none" stroke="#ef4444" strokeWidth="2.5"></path>
                            <circle cx="400" cy="8" fill="#ef4444" r="4" stroke="#080d14" strokeWidth="2"></circle>
                          </svg>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-text-disabled mt-1 font-mono">
                          <span>10:00 (+4.2°C)</span>
                          <span>11:00 (+6.1°C)</span>
                          <span>12:00 (+8.0°C Threshold)</span>
                          <span className="text-risk-critical font-medium">Now (+10.4°C)</span>
                        </div>
                      </div>
                      <div className="md:col-span-4 flex flex-col gap-1.5 pl-0 md:pl-3 md:border-l md:border-border-subtle">
                        <div className="flex items-center justify-between">
                          <span className="font-caption text-caption text-text-muted">Remaining Buffer:</span>
                          <span className="font-caption text-caption text-risk-critical font-semibold">42 min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-caption text-caption text-text-muted">Target Consignment:</span>
                          <span className="font-caption text-caption text-text-primary">SHP-0117</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-caption text-caption text-text-muted">Consignment Value:</span>
                          <span className="font-caption text-caption text-text-primary">₹1.85 Cr</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        to="/cold-chain"
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface-container border border-border-subtle hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
                      >
                        Inspect Sensor Telemetry
                      </Link>
                      <button
                        onClick={() => {
                          setToastMessage({
                            title: 'Cryo-Booster Unit Dispatched',
                            desc: 'DRY-ICE-VAN-04 mobilized to intercept TRK-203 at Toll Plaza 4.',
                            type: 'success'
                          })
                          setTimeout(() => setToastMessage(null), 5000)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary-container hover:bg-primary-hover text-on-primary-container transition-colors shadow-sm cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">ac_unit</span>
                        <span>Authorize Cryo-Booster Dispatch</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optimization Opportunity Card 3: Idle Asset Redeployment */}
                <div className="relative overflow-hidden rounded-xl bg-bg-surface border border-border-subtle p-4 shadow-sm hover:border-border-strong transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-info"></div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pl-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-caption text-caption px-2 py-0.5 rounded bg-status-info/15 text-status-info border border-status-info/30 font-semibold tracking-wide">
                        IDLE ASSET REDEPLOYMENT
                      </span>
                      <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-surface-container-high text-status-info font-medium">
                        MEDIUM P2
                      </span>
                      <span className="font-caption text-caption text-text-muted flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        98.1% AI Confidence
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-muted">Solapur Staging Hub</span>
                  </div>
                  <div className="pl-2">
                    <h3 className="font-card-title text-card-title text-text-primary text-[15px] mb-1.5 font-semibold">
                      Cross-Dock Synergy: TRK-115 Idle Reefer stationed at Solapur Depot can salvage stalled cargo SHP-0145
                    </h3>
                    <p className="font-body-default text-body-default text-text-secondary leading-relaxed mb-3">
                      TRK-115 has 18T available certified cold storage capacity, is 100% pre-chilled to +3.5°C, fueled, and driver is compliant within legal 9h shift window. Cross-docking SHP-0145 recovers ETA delivery compliance from a projected 7.2h deficit down to 1.1h.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle/50">
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1 text-risk-low font-medium">
                          <span className="material-symbols-outlined text-[15px]">savings</span>
                          ₹52,000 Saved
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-text-muted">timer</span>
                          -6.1h Delay Reduction
                        </span>
                        <span className="hidden sm:inline text-text-muted">Driver: R. K. Sharma</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/fleet"
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-surface-container border border-border-subtle hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Match Details
                        </Link>
                        <button
                          onClick={() => {
                            setToastMessage({
                              title: 'Asset TRK-115 Assigned',
                              desc: 'Cross-dock reservation confirmed at Solapur Cryo-Facility Bay 02.',
                              type: 'success'
                            })
                            setTimeout(() => setToastMessage(null), 5000)
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md bg-bg-surface-raised border border-primary/40 hover:border-primary text-text-primary transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[15px] text-primary">local_shipping</span>
                          <span>Assign TRK-115</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disruption Cascade Correlation Matrix */}
                <div className="rounded-xl bg-bg-surface border border-border-subtle p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">grid_4x4</span>
                      <h4 className="font-section-title text-section-title text-text-primary text-[14px]">
                        Disruption Cascade Correlation Matrix (Western Corridor)
                      </h4>
                    </div>
                    <span className="font-caption text-caption text-text-muted">Synthesized from 1,248 live nodes</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-table-cell text-table-cell border-collapse">
                      <thead>
                        <tr className="bg-surface-container-lowest text-text-muted text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 rounded-l-md">Active Chokepoint</th>
                          <th className="py-2.5 px-3">Primary Hazard</th>
                          <th className="py-2.5 px-3">Units in Cone</th>
                          <th className="py-2.5 px-3">Vulnerable Cargo Value</th>
                          <th className="py-2.5 px-3">Algorithmic Mitigation</th>
                          <th className="py-2.5 px-3 text-right rounded-r-md">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low text-text-secondary">
                        <tr className="hover:bg-bg-surface-hover transition-colors">
                          <td className="py-2.5 px-3 text-text-primary font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-risk-critical"></span> NH-48 Solapur-Pune
                          </td>
                          <td className="py-2.5 px-3 text-risk-critical">Flash Flooding (1.2m)</td>
                          <td className="py-2.5 px-3 font-mono">17 Trucks</td>
                          <td className="py-2.5 px-3 text-text-primary font-mono font-medium">₹2.40 Cr</td>
                          <td className="py-2.5 px-3 text-primary">Detour via SH-142 Bypass</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical">
                              Action Ready
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-bg-surface-hover transition-colors">
                          <td className="py-2.5 px-3 text-text-primary font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-risk-high"></span> JNPT Terminal Gate 4
                          </td>
                          <td className="py-2.5 px-3 text-risk-high">Customs EDI Server Lag</td>
                          <td className="py-2.5 px-3 font-mono">8 Containers</td>
                          <td className="py-2.5 px-3 text-text-primary font-mono font-medium">₹1.15 Cr</td>
                          <td className="py-2.5 px-3 text-primary">Redirect to CFS Nhava Sheva 2</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-high/15 text-risk-high">
                              Standby
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-bg-surface-hover transition-colors">
                          <td className="py-2.5 px-3 text-text-primary font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-risk-medium"></span> Bengaluru Electronic City
                          </td>
                          <td className="py-2.5 px-3 text-risk-medium">Heavy Urban Congestion</td>
                          <td className="py-2.5 px-3 font-mono">6 Consignments</td>
                          <td className="py-2.5 px-3 text-text-primary font-mono font-medium">₹0.68 Cr</td>
                          <td className="py-2.5 px-3 text-primary">NICE Road Tollway Reroute</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-badge-label text-badge-label px-2 py-0.5 rounded-full bg-risk-low/15 text-risk-low">
                              Resolved
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Prescriptive Recommendations */}
            {insightSubTab === 'recommendations' && (
              <div className="flex flex-col gap-3.5">
                <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-card-title text-card-title text-text-primary">Automated Prescriptive Actions Queue</h4>
                    <span className="font-caption text-caption text-primary font-semibold">4 Actionable Policies</span>
                  </div>
                  <p className="font-body-default text-body-default text-text-secondary mb-4">
                    The watsonx.ai algorithmic engine has scored 4 non-conflicting routing detours for instant batch confirmation.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-border-subtle">
                      <div>
                        <span className="font-table-cell text-table-cell text-text-primary font-semibold">
                          Batch Authorization: 17 Units Detour (SH-142 Solapur)
                        </span>
                        <div className="text-text-muted font-caption text-caption">Estimated ROI: ₹1.84L delay penalties prevented</div>
                      </div>
                      <button
                        onClick={() => setActiveView('approval')}
                        className="px-3 py-1.5 rounded bg-primary-container text-white text-xs font-medium hover:bg-primary-hover cursor-pointer"
                      >
                        Review in Approval Chamber
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-border-subtle">
                      <div>
                        <span className="font-table-cell text-table-cell text-text-primary font-semibold">
                          Dry-Ice Resupply: Toll Plaza 4 Intercept (TRK-203)
                        </span>
                        <div className="text-text-muted font-caption text-caption">200kg food/pharma solid CO2 injection</div>
                      </div>
                      <span className="font-badge-label text-badge-label text-risk-low bg-risk-low/15 px-2 py-0.5 rounded">Ready</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-border-subtle">
                      <div>
                        <span className="font-table-cell text-table-cell text-text-primary font-semibold">
                          JNPT Berth 4 Outbound: CFS Nhava Sheva 2 Buffer Staging
                        </span>
                        <div className="text-text-muted font-caption text-caption">8 containers reassigned to dry-port gate 2</div>
                      </div>
                      <span className="font-badge-label text-badge-label text-risk-medium bg-risk-medium/15 px-2 py-0.5 rounded">Queued</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Root Cause Intelligence */}
            {insightSubTab === 'root_cause' && (
              <div className="flex flex-col gap-3.5">
                <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle">
                  <h4 className="font-card-title text-card-title text-text-primary mb-2">Root Cause Intelligence & Multi-Factor Analysis</h4>
                  <p className="font-body-default text-body-default text-text-secondary leading-relaxed mb-4">
                    Correlating IMD heavy precipitation telemetry with regional catchment drain overflow rates at Solapur Basin (Km 194.2).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-surface-container border border-border-subtle">
                      <div className="text-text-muted font-caption text-caption">Primary Causal Vector</div>
                      <div className="font-semibold text-text-primary mt-1">Ujjani Dam Sluice Release</div>
                      <p className="text-xs text-text-secondary mt-1">45,000 cusecs downstream discharge within 3 hours.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container border border-border-subtle">
                      <div className="text-text-muted font-caption text-caption">Secondary Contributor</div>
                      <div className="font-semibold text-text-primary mt-1">Culvert C-89 Sedimentation</div>
                      <p className="text-xs text-text-secondary mt-1">Drainage efficiency reduced by 78% due to silt buildup.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container border border-border-subtle">
                      <div className="text-text-muted font-caption text-caption">Model Projected Clearance</div>
                      <div className="font-semibold text-risk-critical mt-1">Tomorrow 08:30 AM</div>
                      <p className="text-xs text-text-secondary mt-1">Water level recession rate: -4.2 cm/hr.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 4: Operational Queries */}
            {insightSubTab === 'queries' && (
              <div className="flex flex-col gap-3.5">
                <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle">
                  <h4 className="font-card-title text-card-title text-text-primary mb-2">Structured Operational Query Log</h4>
                  <p className="font-body-default text-body-default text-text-secondary mb-3">
                    Historical SQL-equivalent operational queries generated by natural language copiloting.
                  </p>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded bg-surface-container-lowest text-text-secondary border border-border-subtle">
                      <span className="text-primary">SELECT</span> id, consignee, cargo, temp_c <span className="text-primary">FROM</span> shipments <span className="text-primary">WHERE</span> corridor = 'NH-48' <span className="text-primary">AND</span> status = 'TRANSIT_AT_RISK';
                    </div>
                    <div className="p-2.5 rounded bg-surface-container-lowest text-text-secondary border border-border-subtle">
                      <span className="text-primary">EXECUTE</span> model_bayes_reroute(<span className="text-risk-low">'INC-9398-REC-4'</span>, threshold=0.94);
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Context-Aware AI Copilot Chat Assistant */}
          <div className="lg:col-span-4 flex flex-col rounded-xl bg-bg-surface-raised border border-border-strong overflow-hidden shadow-lg sticky top-20">
            {/* Assistant Header */}
            <div className="p-3.5 bg-bg-surface border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-7 h-7 rounded-lg bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">neurology</span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-risk-low ring-2 ring-bg-surface"></span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-card-title text-card-title text-text-primary truncate">SupplyShield AI</span>
                    <span className="font-caption text-caption px-1.5 py-0.2 rounded bg-primary-soft text-primary font-medium">Copilot</span>
                  </div>
                  <span className="font-caption text-caption text-text-muted truncate">Live Context: 17 Blocked Units • NH-48 Active</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <button
                  onClick={() => setChatMessages([
                    {
                      id: '1',
                      sender: 'user',
                      time: '14:28',
                      text: 'What is the single biggest operational risk right now?'
                    },
                    {
                      id: '2',
                      sender: 'ai',
                      time: 'Just now',
                      text: 'The biggest immediate operational risk is NH-48 Solapur-Pune Inundation (Km 194.2):',
                      bulletPoints: [
                        'Affects 17 transit shipments, including 4 critical pharma/cryo units.',
                        'Total ₹2.40 Cr cargo value in imminent danger of SLA and thermal rupture.'
                      ]
                    }
                  ])}
                  className="p-1 hover:text-text-primary rounded hover:bg-bg-surface-hover transition-colors cursor-pointer"
                  title="Reset conversation"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[17px]">restart_alt</span>
                </button>
              </div>
            </div>

            {/* Dialogue Conversation Container */}
            <div className="p-3.5 flex flex-col gap-3.5 max-h-[440px] overflow-y-auto" id="chat-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.sender === 'user' ? (
                    <div className="max-w-[85%] rounded-lg rounded-tr-xs bg-bg-surface-hover border border-border-subtle px-3 py-2 text-text-primary font-body-default text-body-default">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-w-[95%]">
                      <div className="flex items-center gap-1.5 text-text-muted font-caption text-caption">
                        <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
                        <span>SupplyShield Operations Engine</span>
                        <span>• {msg.time}</span>
                      </div>
                      <div className="p-3 rounded-lg rounded-tl-xs bg-bg-surface border-l-2 border-l-primary border-t border-r border-b border-border-subtle text-text-secondary text-xs leading-relaxed flex flex-col gap-2">
                        <p className="text-text-primary font-medium">{msg.text}</p>
                        {msg.bulletPoints && (
                          <ul className="space-y-1 pl-1">
                            {msg.bulletPoints.map((bp, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-risk-critical leading-none mt-1">•</span>
                                <span>{bp}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-text-muted p-2">
                  <span className="material-symbols-outlined text-[16px] text-primary animate-spin">sync</span>
                  <span>Synthesizing corridor telemetry...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2 border-t border-border-subtle bg-surface-container-lowest flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => { setChatInput('What is the cold chain status for TRK-203?'); }}
                className="px-2 py-1 rounded bg-surface-container text-[11px] text-text-secondary hover:text-text-primary whitespace-nowrap border border-border-subtle cursor-pointer"
              >
                ❄ TRK-203 Cold Status
              </button>
              <button
                onClick={() => { setChatInput('Explain bypass route SH-142'); }}
                className="px-2 py-1 rounded bg-surface-container text-[11px] text-text-secondary hover:text-text-primary whitespace-nowrap border border-border-subtle cursor-pointer"
              >
                🗺 SH-142 Bypass
              </button>
              <button
                onClick={() => { setChatInput('Show carrier demurrage costs'); }}
                className="px-2 py-1 rounded bg-surface-container text-[11px] text-text-secondary hover:text-text-primary whitespace-nowrap border border-border-subtle cursor-pointer"
              >
                💰 Penalty Costs
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-bg-surface border-t border-border-subtle flex items-center gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask operations copilot..."
                className="flex-1 bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 2: AUTONOMOUS RECOMMENDATION APPROVAL & MULTI-PARTY EXECUTION */}
      {activeView === 'approval' && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          {/* Header Banner */}
          <header className="flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-page-title text-page-title text-text-primary">
                    Autonomous Recommendation Approval & Multi-Party Execution
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary font-badge-label text-badge-label border-0">
                    INC-9398-REC-4
                  </span>
                </div>
                <p className="font-body-default text-body-default text-text-secondary">
                  Prescriptive Bayesian triage for Western Corridor hydro-inundation & cold-chain thermal excursion safeguard
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setToastMessage({
                      title: 'Decision Tree Exported',
                      desc: 'Cryptographic PDF decision tree exported for audit archives.',
                      type: 'info'
                    })
                    setTimeout(() => setToastMessage(null), 4000)
                  }}
                  className="h-8 px-3 rounded-lg bg-surface-container hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary font-badge-label text-badge-label transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span>Export Decision Tree</span>
                </button>
                <Link
                  to="/simulations"
                  className="h-8 px-3 rounded-lg bg-surface-container hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary font-badge-label text-badge-label transition-colors flex items-center gap-1.5 shadow-sm inline-flex items-center"
                >
                  <span className="material-symbols-outlined text-[16px]">alt_route</span>
                  <span>Simulate in What-If</span>
                </Link>
              </div>
            </div>

            {/* Telemetry & HITL Meta Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-caption text-caption">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-risk-low/10 text-risk-low font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse"></span>
                <span>96.8% Confidence Score • Bayesian Route-Opt-v4.8</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-risk-medium/10 text-risk-medium font-medium">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                <span>HITL Tier 2 Gate: Mandatory Operator Sign-Off</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-text-muted">
                <span className="material-symbols-outlined text-[14px]">sync</span>
                <span>Live Engine Telemetry: 12ms Sync • Western Corridor Grid</span>
              </div>
            </div>
          </header>

          {/* Incident Banner Context Strip */}
          <div className="p-3 rounded-xl bg-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm border border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-risk-critical/15 text-risk-critical flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">flood</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-card-title text-card-title text-text-primary">Incident: Solapur Highway Inundation (Km 194.2)</span>
                  <span className="px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical font-badge-label text-badge-label">Active Disruption</span>
                </div>
                <span className="font-caption text-caption text-text-secondary">Water depth 1.2m over tarmac • Reefer TRK-203 battery telemetry: alternator efficiency down to 62%</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-caption font-caption">
              <div className="flex flex-col text-right">
                <span className="text-text-muted">Kinetic Cold Buffer</span>
                <span className="text-risk-critical font-semibold">22m 14s remaining</span>
              </div>
              <div className="h-7 w-[1px] bg-surface-variant"></div>
              <div className="flex flex-col text-right">
                <span className="text-text-muted">Payload Impact</span>
                <span className="text-text-primary font-medium">Covaxin / Polio Tier-1 (8,200 Vials)</span>
              </div>
            </div>
          </div>

          {/* Main Workspace (65% / 35%) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Column (65%): Multi-Step Plan + Decision Tree + Heatmap */}
            <div className="xl:col-span-8 flex flex-col gap-5">
              {/* Multi-Step Prescriptive Action Plan */}
              <div className="rounded-xl bg-surface-container p-4 flex flex-col gap-4 shadow-sm border border-border-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <h3 className="font-section-title text-section-title text-text-primary">Multi-Step Prescriptive Action Plan</h3>
                  </div>
                  <span className="font-caption text-caption text-text-muted">Orchestrated sequence • Auto-executable on signature</span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Step 01 */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2.5 shadow-sm border border-border-subtle">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-badge-label text-badge-label font-bold">STEP 01</span>
                        <span className="font-card-title text-card-title text-text-primary">Immediate Solapur Cryo-Booster Intercept</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-risk-critical/15 text-risk-critical font-badge-label text-badge-label flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">timer</span>
                        T-22m Critical Window
                      </span>
                    </div>
                    <p className="font-body-default text-body-default text-text-secondary leading-relaxed">
                      Dispatch dry-ice top-up vehicle from Solapur Cryo-Hub (14km) to meet TRK-203 at Toll Plaza 4 before secondary alternator fails. Supplies 200kg solid CO2 packs directly into pharma compartment.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-caption text-caption text-text-muted">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-text-secondary">local_shipping</span> Intercept Unit: DRY-ICE-VAN-04</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-text-secondary">pin_drop</span> ETA: 16 mins (Toll Plaza 4)</span>
                      </div>
                      <span className="text-risk-low font-medium">Telemetry sync confirmed • Driver on standby</span>
                    </div>
                  </div>

                  {/* Step 02 */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2.5 shadow-sm border border-border-subtle">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-surface-variant text-text-primary font-badge-label text-badge-label font-bold">STEP 02</span>
                        <span className="font-card-title text-card-title text-text-primary">Authorize SH-142 Solapur Ridge Detour</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-risk-low/15 text-risk-low font-badge-label text-badge-label">
                        Elevation +480m AMSL
                      </span>
                    </div>
                    <p className="font-body-default text-body-default text-text-secondary leading-relaxed">
                      Divert 7 convoy units via elevated dry ridge corridor, completely bypassing Km 194.2 underpass flooding. Route length increases by 18.4km but preserves continuous 48km/h velocity and road stability.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-caption text-caption text-text-muted">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-text-secondary">toll</span> FASTag Pre-clearance: Solapur North</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px] text-text-secondary">speed</span> Gradient: 2.1% max</span>
                      </div>
                      <span className="text-primary font-medium">Green Lane Priority Code #9941</span>
                    </div>
                  </div>

                  {/* Step 03 */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2.5 shadow-sm border border-border-subtle">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-surface-variant text-text-primary font-badge-label text-badge-label font-bold">STEP 03</span>
                        <span className="font-card-title text-card-title text-text-primary">Standby Cross-Docking Reservation</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-status-info/15 text-status-info font-badge-label text-badge-label">
                        Contingency Fail-Safe
                      </span>
                    </div>
                    <p className="font-body-default text-body-default text-text-secondary leading-relaxed">
                      Pre-allocate Cryo-Dock Bay 02 at Solapur Regional Center. Reefer unit TRK-115 is powered on to pre-chill to +3.8°C if TRK-203 primary power rail triggers emergency cutoff upon Toll Plaza arrival.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-caption text-caption text-text-muted">
                      <div className="flex items-center gap-3">
                        <span>Hub: Solapur Cryo-Facility Bay 02</span>
                        <span>Standby Crew: Team B (3 technicians)</span>
                      </div>
                      <span className="text-text-secondary font-medium">Reefer 115 Pre-Chill: +3.8°C stable</span>
                    </div>
                  </div>

                  {/* Step 04 */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2.5 shadow-sm border border-border-subtle">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-surface-variant text-text-primary font-badge-label text-badge-label font-bold">STEP 04</span>
                        <span className="font-card-title text-card-title text-text-primary">Automated Carrier & Consignee Broadcast</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-risk-low/15 text-risk-low font-badge-label text-badge-label">
                        Multi-Party Handshake
                      </span>
                    </div>
                    <p className="font-body-default text-body-default text-text-secondary leading-relaxed">
                      Push in-cab turn-by-turn telematic route updates to 7 drivers simultaneously. Issue automated SLA and cold-chain compliance reassurance to Apollo Hospitals Hyderabad receiving team.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-caption text-caption text-text-muted">
                      <div className="flex items-center gap-3">
                        <span>Apollo Logistics SLA: On-Schedule (ETA 22:40)</span>
                        <span>Push API: Webhook & In-Cab IVR Ready</span>
                      </div>
                      <span className="text-primary font-medium">7 Driver Acknowledgments Queued</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Algorithmic Decision Tree & Explainability Matrix */}
              <div className="rounded-xl bg-surface-container p-4 flex flex-col gap-4 shadow-sm border border-border-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">account_tree</span>
                    <h3 className="font-section-title text-section-title text-text-primary">Algorithmic Decision Tree & Explainability</h3>
                  </div>
                  <span className="font-caption text-caption text-text-muted">Model: BayesRoute-Opt-v4.8 • Policy #88219</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low overflow-x-auto border border-border-subtle">
                  <div className="min-w-[580px] flex flex-col gap-4">
                    {/* Level 1 */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="p-3 rounded-lg bg-risk-critical/15 text-risk-critical flex items-center gap-3 flex-1 border border-risk-critical/20">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                        <div>
                          <div className="font-card-title text-card-title text-text-primary">Trigger Event Detected</div>
                          <div className="font-caption text-caption text-risk-critical">NH-48 Km 194.2 Submerged 1.2m • Sensor #WL-94</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-text-muted text-[20px]">arrow_forward</span>
                      <div className="p-3 rounded-lg bg-surface-variant flex items-center gap-3 flex-1 border border-border-subtle">
                        <span className="material-symbols-outlined text-[20px] text-primary">thermostat</span>
                        <div>
                          <div className="font-card-title text-card-title text-text-primary">Kinetic Constraint Check</div>
                          <div className="font-caption text-caption text-text-secondary">TRK-203 Thermal Buffer = 22m until +8.0°C excursion</div>
                        </div>
                      </div>
                    </div>

                    {/* Level 2 Options */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Option A */}
                      <div className="p-3 rounded-lg bg-surface-container flex flex-col justify-between gap-2 opacity-80 border border-border-subtle">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-caption text-caption font-semibold text-text-secondary">OPTION A</span>
                            <span className="font-badge-label text-badge-label text-risk-critical bg-risk-critical/10 px-1.5 rounded">REJECTED</span>
                          </div>
                          <div className="font-card-title text-card-title text-text-primary mt-1">Wait for Recession</div>
                          <p className="font-caption text-caption text-text-muted mt-1">Standstill at NH-48 Km 190 until water drains.</p>
                        </div>
                        <div className="bg-risk-critical/10 p-2 rounded text-caption font-caption text-risk-critical flex flex-col gap-0.5">
                          <span className="font-semibold">Rejection Cause:</span>
                          <span>100% Thermal Spoilage (Excursion in 22m). Net Loss ₹2.40 Cr.</span>
                        </div>
                      </div>

                      {/* Option B */}
                      <div className="p-3 rounded-lg bg-surface-container flex flex-col justify-between gap-2 opacity-80 border border-border-subtle">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-caption text-caption font-semibold text-text-secondary">OPTION B</span>
                            <span className="font-badge-label text-badge-label text-risk-critical bg-risk-critical/10 px-1.5 rounded">REJECTED</span>
                          </div>
                          <div className="font-card-title text-card-title text-text-primary mt-1">Southern Rail Roll-on</div>
                          <p className="font-caption text-caption text-text-muted mt-1">Divert convoy to Kurduvadi Junction rail freight.</p>
                        </div>
                        <div className="bg-risk-critical/10 p-2 rounded text-caption font-caption text-risk-critical flex flex-col gap-0.5">
                          <span className="font-semibold">Rejection Cause:</span>
                          <span>+14.2h Shunting delay. Exceeds Apollo Hospital surgical window.</span>
                        </div>
                      </div>

                      {/* Option C */}
                      <div className="p-3 rounded-lg bg-primary-soft text-text-primary flex flex-col justify-between gap-2 shadow-sm border border-primary/40">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-caption text-caption font-semibold text-primary">OPTION C (RECOMMENDED)</span>
                            <span className="font-badge-label text-badge-label text-risk-low bg-risk-low/20 px-1.5 rounded font-semibold">SELECTED</span>
                          </div>
                          <div className="font-card-title text-card-title text-text-primary mt-1">SH-142 Ridge + Dry Ice</div>
                          <p className="font-caption text-caption text-text-secondary mt-1">Active intercept at Toll 4 + elevated ridge corridor.</p>
                        </div>
                        <div className="bg-primary/15 p-2 rounded text-caption font-caption text-primary flex flex-col gap-0.5">
                          <span className="font-semibold">Selection Score: 96.8%</span>
                          <span>0% Spoilage Risk • +5.3h Net transit advantage vs delay.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (35%): Authorization Chamber & Stakeholder Ledger */}
            <div className="xl:col-span-4 flex flex-col gap-5">
              {/* Operator Authorization Chamber */}
              <div className="rounded-xl bg-surface-container-low p-4 flex flex-col gap-4 shadow-xl border border-primary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">verified</span>
                    <h3 className="font-section-title text-section-title text-text-primary">Operator Authorization Chamber</h3>
                  </div>
                  <span className="font-badge-label text-badge-label text-risk-low bg-risk-low/15 px-2 py-0.5 rounded-full">
                    HITL Active
                  </span>
                </div>

                {/* Operator Badge Card */}
                <div className="p-3 rounded-lg bg-surface-container flex items-center gap-3 border border-border-subtle">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center flex-shrink-0">
                    RC
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-card-title text-card-title text-text-primary truncate">Ramesh C.</span>
                    <span className="font-caption text-caption text-text-muted truncate">Control Tower Lead • Shift A • ID: #OP-8120</span>
                  </div>
                </div>

                {/* Mandatory Checkpoints */}
                <div className="flex flex-col gap-2">
                  <span className="font-caption text-caption uppercase tracking-wider text-text-secondary">
                    Pre-Dispatch Mandatory Checkpoints
                  </span>
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container cursor-pointer hover:bg-bg-surface-hover transition-colors select-none border border-border-subtle">
                    <input
                      checked={chkHos}
                      onChange={e => setChkHos(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-0 bg-surface-container-lowest cursor-pointer"
                      type="checkbox"
                    />
                    <div className="flex flex-col">
                      <span className="font-card-title text-card-title text-text-primary">Driver HOS & Permit Validated</span>
                      <span className="font-caption text-caption text-text-muted">TRK-203 Ramesh Sharma has 3h 18m drive time</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container cursor-pointer hover:bg-bg-surface-hover transition-colors select-none border border-border-subtle">
                    <input
                      checked={chkDryIce}
                      onChange={e => setChkDryIce(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-0 bg-surface-container-lowest cursor-pointer"
                      type="checkbox"
                    />
                    <div className="flex flex-col">
                      <span className="font-card-title text-card-title text-text-primary">Solapur Dry-Ice Inventory Confirmed</span>
                      <span className="font-caption text-caption text-text-muted">200kg pharma-grade dry-ice pellets loaded</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container cursor-pointer hover:bg-bg-surface-hover transition-colors select-none border border-border-subtle">
                    <input
                      checked={chkFastag}
                      onChange={e => setChkFastag(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-0 bg-surface-container-lowest cursor-pointer"
                      type="checkbox"
                    />
                    <div className="flex flex-col">
                      <span className="font-card-title text-card-title text-text-primary">FASTag Escrow Pre-Funded</span>
                      <span className="font-caption text-caption text-text-muted">₹3,600 / vehicle toll budget auto-approved</span>
                    </div>
                  </label>
                </div>

                {/* FIDO2 Biometric Status */}
                <div className="p-2.5 rounded-lg bg-surface-container flex items-center justify-between font-caption text-caption border border-border-subtle">
                  <div className="flex items-center gap-2 text-risk-low">
                    <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                    <span>YubiKey FIDO2 / Biometric Token Paired</span>
                  </div>
                  <span className="text-text-muted">Token: #SS-KEY-994</span>
                </div>

                {/* Authorization Action */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleAuthorizeDispatch}
                    disabled={isAuthorizing || (!chkHos || !chkDryIce || !chkFastag)}
                    className={`w-full py-2.5 px-4 rounded-lg font-card-title text-card-title font-semibold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] cursor-pointer disabled:opacity-50 ${
                      isDispatched
                        ? 'bg-risk-low text-surface-container-lowest'
                        : 'bg-primary-container hover:bg-primary-hover text-on-primary-container shadow-primary-container/30'
                    }`}
                    type="button"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isAuthorizing ? 'animate-spin' : ''}`}>
                      {isAuthorizing ? 'sync' : isDispatched ? 'check_circle' : 'lock_open'}
                    </span>
                    <span>
                      {isAuthorizing
                        ? 'Broadcasting Cryptographic Dispatch...'
                        : isDispatched
                        ? 'Dispatched & Sealed (17 Shipments Live)'
                        : 'Authorize & Dispatch Mitigation Suite (17 Units)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Multi-Party Handshake Status */}
              <div className="rounded-xl bg-surface-container p-4 flex flex-col gap-3 shadow-sm border border-border-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                    <h3 className="font-section-title text-section-title text-text-primary">Multi-Party Handshake Status</h3>
                  </div>
                  <span className="font-caption text-caption text-text-muted">4 Parties Active</span>
                </div>
                <div className="flex flex-col gap-2 font-table-cell text-table-cell">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-border-subtle">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                      <span className="text-text-primary font-medium">NHAI Regional Operations</span>
                    </div>
                    <span className="font-badge-label text-badge-label text-risk-low bg-risk-low/10 px-2 py-0.5 rounded-full">Acknowledged</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-border-subtle">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                      <span className="text-text-primary font-medium">ColdBridge Carrier Dispatch</span>
                    </div>
                    <span className="font-badge-label text-badge-label text-risk-low bg-risk-low/10 px-2 py-0.5 rounded-full">In-Cab Standby</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-border-subtle">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-text-primary font-medium">Apollo Hospitals Receiving</span>
                    </div>
                    <span className="font-badge-label text-badge-label text-primary bg-primary/10 px-2 py-0.5 rounded-full">Notified (SLA OK)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-border-subtle">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-risk-low"></span>
                      <span className="text-text-primary font-medium">New India Marine Underwriter</span>
                    </div>
                    <span className="font-badge-label text-badge-label text-text-muted bg-surface-variant px-2 py-0.5 rounded-full">Audit Log Anchored</span>
                  </div>
                </div>
              </div>

              {/* SHA-256 Audit Anchor */}
              <div className="rounded-xl bg-surface-container p-4 flex flex-col gap-2.5 shadow-sm border border-border-subtle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-text-secondary">enhanced_encryption</span>
                    <h3 className="font-section-title text-section-title text-text-primary">SHA-256 Audit Anchor</h3>
                  </div>
                  <span className="font-caption text-caption text-text-muted">ISO 17025 Compliant</span>
                </div>
                <p className="font-caption text-caption text-text-muted">
                  All sensory inputs, model weights, operator checkpoints, and executed telematics are cryptographically sealed.
                </p>
                <div className="p-2.5 rounded bg-surface-container-lowest font-caption text-caption text-text-secondary font-mono break-all select-all border border-border-subtle">
                  0x8f2a99c7d410bb51e06c3a2f7902d5e2c1409f83ea0162547d2b4bb9e14a82cf
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-muted pt-1">
                  <span>Timestamp: 2026-09-14T17:10:00Z</span>
                  <span className="text-risk-low font-medium">Tamper-Evident Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Thresholds Modal */}
      {showThresholdModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-strong rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                <h3 className="font-section-title text-section-title text-text-primary">AI Anomaly & Threshold Configuration</h3>
              </div>
              <button
                onClick={() => setShowThresholdModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-muted mb-1">
                  Reefer Thermal Excursion Trigger (°C Threshold)
                </label>
                <input
                  type="number"
                  defaultValue="8.0"
                  step="0.1"
                  className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-muted mb-1">
                  SLA Delay Escalation Threshold (Hours)
                </label>
                <input
                  type="number"
                  defaultValue="2.0"
                  step="0.5"
                  className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-muted mb-1">
                  Bayesian Minimum Confidence Gate for Auto-Suggestions (%)
                </label>
                <input
                  type="number"
                  defaultValue="90.0"
                  step="1"
                  className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
              <button
                onClick={() => setShowThresholdModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-low border border-border-subtle text-text-secondary hover:text-text-primary font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowThresholdModal(false)
                  setToastMessage({
                    title: 'Thresholds Updated',
                    desc: 'watsonx.ai inference engine weights recalibrated successfully.',
                    type: 'info'
                  })
                  setTimeout(() => setToastMessage(null), 4000)
                }}
                className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary-container font-medium shadow-md shadow-primary-container/20 cursor-pointer"
              >
                Save & Recalibrate Engine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
