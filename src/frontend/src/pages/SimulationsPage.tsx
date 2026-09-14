import PageHeader from '../components/PageHeader'
import styles from './PlaceholderPage.module.css'

export default function SimulationsPage() {
  return (
    <div>
      <PageHeader
        title="What-If Simulation"
        description="Evaluate alternative routes, carriers, and fleet configurations without affecting live operations."
      />
      <div className={styles.placeholderPanel}>
        <div className={styles.icon}>⚙</div>
        <h2 className={styles.title}>What-If Simulation Engine</h2>
        <p className={styles.description}>
          This screen will allow operators to simulate:
        </p>
        <ul className={styles.featureList}>
          <li>Route alternatives for disrupted shipments</li>
          <li>Carrier substitutions</li>
          <li>Fleet redeployment scenarios</li>
          <li>ETA, cost, and risk comparisons</li>
        </ul>
        <div className={styles.phaseBadge}>Phase 6+ — Simulation Engine</div>
        <p className={styles.note}>
          Simulations never mutate live operational state.
          Applying a simulation result requires explicit operator confirmation and creates an audit record.
        </p>
      </div>
    </div>
  )
}
