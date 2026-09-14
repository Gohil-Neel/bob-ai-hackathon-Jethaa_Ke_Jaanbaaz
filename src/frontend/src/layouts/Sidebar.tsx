import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

interface NavItem {
  to: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { to: '/dashboard',    label: 'Command Center',     icon: '⬡' },
  { to: '/shipments',    label: 'Shipments',          icon: '📦' },
  { to: '/disruptions',  label: 'Disruptions',        icon: '⚠' },
  { to: '/fleet',        label: 'Fleet',              icon: '🚛' },
  { to: '/cold-chain',   label: 'Cold Chain',         icon: '❄' },
  { to: '/alerts',       label: 'Alerts',             icon: '🔔' },
  { to: '/ai-insights',  label: 'AI Insights',        icon: '🤖' },
  { to: '/simulations',  label: 'What-If Simulation', icon: '⚙' },
  { to: '/reports',      label: 'Reports',            icon: '📊' },
  { to: '/settings',     label: 'Settings',           icon: '⚙' },
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Logo / Branding */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>SS</div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>SupplyShield</span>
          <span className={styles.brandSub}>AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.footerText}>v0.1.0 · Phase 2</span>
      </div>
    </aside>
  )
}
