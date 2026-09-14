import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-xs ${
      isActive
        ? 'bg-primary-soft text-primary font-semibold border-l-2 border-primary-container'
        : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
    }`;

  return (
    <aside className="fixed left-0 top-0 h-full w-[230px] bg-bg-sidebar border-r border-border-subtle z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-70px)] custom-scrollbar">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-border-subtle bg-bg-sidebar flex-shrink-0 sticky top-0 z-10">
          <img
            alt="SupplyShield AI Logo"
            className="h-7 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvEGrDxLyZoNTS3I0NP9GfmGWdnTT9-HFwaJj1Yt9ViiQzf988VfL2sa4aqjhnxhdipltHpHbs38XhipMwS9B_p4Tw39oSFP2JQPzxGc1UYYBVtlh5Q2kH7Mk_jx4o3QAMbCWe_E37kGKSLnla9-NRawEZHA-wuyyEQmP-nSc9W3uWJB8dRIqI6qvtPPWjt8Ry2luS-qa6LOgdMTAFCkIA4X7jeVXQG1A6Jaj4SiJ2WqIksL_GYMeyIA"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold tracking-wider text-text-primary uppercase truncate">
              SupplyShield AI
            </span>
            <span className="text-[10px] text-text-muted tracking-tight truncate">
              Pharma Control Tower
            </span>
          </div>
        </div>

        {/* ── Section 1: Operations ── */}
        <div className="px-3 pt-3 pb-1">
          <span className="text-[10px] uppercase tracking-wider text-text-disabled font-bold px-2">
            Operations
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          <NavLink to="/dashboard" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">grid_view</span>
              <span className="truncate">Command Center</span>
            </div>
          </NavLink>
          <NavLink to="/map" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">map</span>
              <span className="truncate">Live Tracking Map</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              LIVE
            </span>
          </NavLink>
          <NavLink to="/shipments" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">local_shipping</span>
              <span className="truncate">Shipments</span>
            </div>
          </NavLink>
          <NavLink to="/disruptions" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">warning</span>
              <span className="truncate">Disruptions</span>
            </div>
          </NavLink>
          <NavLink to="/cold-chain" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">ac_unit</span>
              <span className="truncate">Cold Chain</span>
            </div>
          </NavLink>
          <NavLink to="/fleet" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">directions_boat</span>
              <span className="truncate">Fleet</span>
            </div>
          </NavLink>
          <NavLink to="/alerts" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">notifications</span>
              <span className="truncate">Alerts & Triage</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-error-container/40 text-error border border-error/30 font-bold">
              4
            </span>
          </NavLink>
        </nav>

        {/* ── Section 2: Intelligence & Planning ── */}
        <div className="px-3 pt-3 pb-1">
          <span className="text-[10px] uppercase tracking-wider text-text-disabled font-bold px-2">
            Intelligence
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          <NavLink to="/ai-insights" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">neurology</span>
              <span className="truncate">AI Insights & Approval</span>
            </div>
          </NavLink>
          <NavLink to="/simulations" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">alt_route</span>
              <span className="truncate">What-If Simulation</span>
            </div>
          </NavLink>
          <NavLink to="/routes" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">route</span>
              <span className="truncate">Trade Corridors</span>
            </div>
          </NavLink>
          <NavLink to="/inventory" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">inventory_2</span>
              <span className="truncate">Buffer Stock / DOS</span>
            </div>
          </NavLink>
        </nav>

        {/* ── Section 3: Partners & Supply ── */}
        <div className="px-3 pt-3 pb-1">
          <span className="text-[10px] uppercase tracking-wider text-text-disabled font-bold px-2">
            Network & Partners
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          <NavLink to="/carriers" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">apartment</span>
              <span className="truncate">Carriers & SLAs</span>
            </div>
          </NavLink>
          <NavLink to="/suppliers" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">factory</span>
              <span className="truncate">Suppliers (OTIF)</span>
            </div>
          </NavLink>
        </nav>

        {/* ── Section 4: Governance & Settings ── */}
        <div className="px-3 pt-3 pb-1">
          <span className="text-[10px] uppercase tracking-wider text-text-disabled font-bold px-2">
            Governance & Admin
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 px-2 pb-4">
          <NavLink to="/compliance" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">verified</span>
              <span className="truncate">GDP / GxP Compliance</span>
            </div>
          </NavLink>
          <NavLink to="/reports" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">monitoring</span>
              <span className="truncate">Reports & Analytics</span>
            </div>
          </NavLink>
          <NavLink to="/integrations" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">sensors</span>
              <span className="truncate">IoT & ERP Gateways</span>
            </div>
          </NavLink>
          <NavLink to="/notifications" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">campaign</span>
              <span className="truncate">Escalation Rules</span>
            </div>
          </NavLink>
          <NavLink to="/users" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">manage_accounts</span>
              <span className="truncate">Operators & RBAC</span>
            </div>
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[17px]">tune</span>
              <span className="truncate">Settings & Thresholds</span>
            </div>
          </NavLink>
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border-subtle bg-surface-container-lowest flex-shrink-0">
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface-container-low border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-border-subtle"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-surface-container-low" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-text-primary truncate leading-tight">
                Arjun Mehta
              </span>
              <span className="text-[10px] text-text-muted truncate leading-tight">
                Control Tower Lead
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
