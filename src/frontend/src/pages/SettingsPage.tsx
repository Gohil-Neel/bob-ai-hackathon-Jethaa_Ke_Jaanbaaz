import PageHeader from '../components/PageHeader'
import styles from './PlaceholderPage.module.css'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Application configuration, alert thresholds, sensor policies, and integration settings."
      />
      <div className={styles.placeholderPanel}>
        <div className={styles.icon}>⚙</div>
        <h2 className={styles.title}>Settings</h2>
        <p className={styles.description}>
          Planned settings:
        </p>
        <ul className={styles.featureList}>
          <li>Cold-chain alert thresholds per shipment type</li>
          <li>Disruption severity escalation policy</li>
          <li>Notification preferences</li>
          <li>API connection configuration</li>
          <li>User and role management</li>
        </ul>
        <div className={styles.phaseBadge}>Phase 4+ — Configuration</div>
      </div>
    </div>
  )
}
