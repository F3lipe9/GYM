import styles from './ProgressionBadge.module.css'

export default function ProgressionBadge({ suggestedWeight }) {
  return (
    <span className={styles.badge}>
      🔺 Suggested: {suggestedWeight} lbs
    </span>
  )
}
