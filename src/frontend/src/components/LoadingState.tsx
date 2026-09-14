import styles from './LoadingState.module.css'

interface LoadingStateProps {
  label?: string
}

export default function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  )
}
