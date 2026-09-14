import { useLocation } from 'react-router-dom'
import styles from './TopBar.module.css'

const routeTitles: Record<string, string> = {
  '/dashboard':   'Command Center',
  '/shipments':   'Shipments',
  '/disruptions': 'Disruptions',
  '/fleet':       'Fleet',
  '/cold-chain':  'Cold Chain',
  '/alerts':      'Alerts',
  '/ai-insights': 'AI Insights',
  '/simulations': 'What-If Simulation',
  '/reports':     'Reports',
  '/settings':    'Settings',
}

function getPageTitle(pathname: string): string {
  // Exact match first
  if (routeTitles[pathname]) return routeTitles[pathname]
  // Partial match for detail pages (e.g. /shipments/shp-001)
  const base = '/' + pathname.split('/')[1]
  return routeTitles[base] ?? 'SupplyShield AI'
}

export default function TopBar() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.right}>
        <span className={styles.mockBadge} title="Using mock data — Phase 2">
          MOCK DATA
        </span>
        <span className={styles.statusDot} title="System operational" />
        <span className={styles.statusText}>Operational</span>
      </div>
    </header>
  )
}
