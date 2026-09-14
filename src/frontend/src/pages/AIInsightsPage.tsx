import PageHeader from '../components/PageHeader'
import styles from './PlaceholderPage.module.css'

export default function AIInsightsPage() {
  return (
    <div>
      <PageHeader
        title="AI Insights"
        description="AI-powered explanations and recommendations powered by IBM watsonx.ai and Granite models."
      />
      <div className={styles.placeholderPanel}>
        <div className={styles.icon}>🤖</div>
        <h2 className={styles.title}>IBM watsonx.ai Integration</h2>
        <p className={styles.description}>
          This screen will display AI-generated explanations and recommendations for:
        </p>
        <ul className={styles.featureList}>
          <li>Shipment disruption analysis</li>
          <li>Rerouting recommendations with evidence</li>
          <li>Fleet redeployment justifications</li>
          <li>Cold-chain excursion explanations</li>
          <li>What-If scenario summaries</li>
        </ul>
        <div className={styles.phaseBadge}>Phase 5+ — watsonx.ai Integration</div>
        <p className={styles.note}>
          AI explanations will always be grounded in verified application data.
          The system will never invent operational facts.
        </p>
      </div>
    </div>
  )
}
