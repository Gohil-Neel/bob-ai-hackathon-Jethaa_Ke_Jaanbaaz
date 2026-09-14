import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-[230px] bg-bg-sidebar border-r border-border-subtle z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        <div className="h-14 px-4 flex items-center gap-3 border-b border-border-subtle bg-bg-sidebar">
          <img
            alt="SupplyShield AI Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvEGrDxLyZoNTS3I0NP9GfmGWdnTT9-HFwaJj1Yt9ViiQzf988VfL2sa4aqjhnxhdipltHpHbs38XhipMwS9B_p4Tw39oSFP2JQPzxGc1UYYBVtlh5Q2kH7Mk_jx4o3QAMbCWe_E37kGKSLnla9-NRawEZHA-wuyyEQmP-nSc9W3uWJB8dRIqI6qvtPPWjt8Ry2luS-qa6LOgdMTAFCkIA4X7jeVXQG1A6Jaj4SiJ2WqIksL_GYMeyIA"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold tracking-wider text-text-primary uppercase truncate font-page-title">
              SupplyShield AI
            </span>
            <span className="font-caption text-caption text-text-muted tracking-tight truncate">
              Control Tower
            </span>
          </div>
        </div>
        <div className="px-3 pt-3 pb-1">
          <span className="font-caption text-caption uppercase tracking-wider text-text-disabled font-medium px-2">
            Navigation
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors font-medium ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            <span className="truncate">Command Center</span>
          </NavLink>
          <NavLink
            to="/shipments"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            <span className="truncate">Shipments</span>
          </NavLink>
          <NavLink
            to="/fleet"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">directions_boat</span>
            <span className="truncate">Fleet</span>
          </NavLink>
          <NavLink
            to="/disruptions"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span className="truncate">Disruptions</span>
          </NavLink>
          <NavLink
            to="/cold-chain"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">ac_unit</span>
            <span className="truncate">Cold Chain</span>
          </NavLink>
          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span className="truncate">Alerts</span>
            </div>
            <span className="font-caption text-caption px-1.5 py-0.5 rounded-full bg-error-container/40 text-error border border-error/30 font-medium leading-none">
              5
            </span>
          </NavLink>
          <NavLink
            to="/ai-insights"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">neurology</span>
            <span className="truncate">AI Insights</span>
          </NavLink>
          <NavLink
            to="/simulations"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">alt_route</span>
            <span className="truncate">What-If Simulation</span>
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">monitoring</span>
            <span className="truncate">Reports</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary border-l-2 border-primary-container font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-on-surface border-l-2 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span className="truncate">Settings</span>
          </NavLink>
        </nav>
      </div>
      <div className="p-3 border-t border-border-subtle bg-surface-container-lowest">
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-border-subtle hover:border-border-strong transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-border-subtle"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLPOMCOxF6SyH-u8HYYxWSeFF2z1RVaK_dJAC4httBxASNGbFlQeRGjUuzEc8ohUNHXWqRvSo7cLeoZa_G4Lo-NJiddvX2oFJZuJLm6yt7jCBy7JaZPz0JEeFSpJpZZk0am0cApuer18G7iI9Xbnq4O8iLenbLb5asC9C7pM1qmNxRx805kGBdLbSM051NSgTbspXCWKcQh4odniSh20FOtIEmEP7VD5lWqNTdUBsQ_BRcv-PcM53JJw"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-risk-low ring-2 ring-surface-container-low"></span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-card-title text-card-title text-text-primary truncate">
                Operator
              </span>
              <span className="font-caption text-caption text-text-muted truncate">
                Control Tower Lead
              </span>
            </div>
          </div>
          <button
            aria-label="Sign out"
            className="text-text-muted hover:text-text-primary p-1 rounded transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
