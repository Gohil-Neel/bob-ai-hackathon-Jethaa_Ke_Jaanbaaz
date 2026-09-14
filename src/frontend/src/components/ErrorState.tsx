import styles from './ErrorState.module.css'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon} aria-hidden="true">⚠</div>
      <span className={styles.title}>{title}</span>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
