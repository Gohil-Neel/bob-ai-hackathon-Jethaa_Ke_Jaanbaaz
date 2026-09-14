import PageHeader from '../components/PageHeader'
import styles from './PlaceholderPage.module.css'

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Operational analytics, disruption history, cold-chain compliance summaries, and fleet utilization reports."
      />
      <div className={styles.placeholderPanel}>
        <div className={styles.icon}>📊</div>
        <h2 className={styles.title}>Reports &amp; Analytics</h2>
        <p className={styles.description}>
          Planned report types:
        </p>
        <ul className={styles.featureList}>
          <li>Disruption history and impact analysis</li>
          <li>Cold-chain compliance summary</li>
          <li>Fleet utilization report</li>
          <li>Shipment on-time performance</li>
          <li>Alert resolution time</li>
        </ul>
        <div className={styles.phaseBadge}>Phase 4+ — Analytics</div>
      </div>
    </div>
  )
}
