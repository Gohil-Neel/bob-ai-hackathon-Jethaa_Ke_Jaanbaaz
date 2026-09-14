import styles from './EmptyState.module.css'

interface EmptyStateProps {
  title?: string
  description?: string
}

export default function EmptyState({
  title = 'No data',
  description = 'Nothing to display here yet.',
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon} aria-hidden="true">○</div>
      <span className={styles.title}>{title}</span>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  )
}
