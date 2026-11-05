import Sheet from './Sheet'
import styles from './TemplatePicker.module.css'

// Sheet listing saved splits; tapping one calls onPick(template).
export default function TemplatePicker({ open, templates, exercises, onPick, onClose }) {
  const nameOf = (id) => exercises.find((e) => e.id === id)?.name
  const sorted = [...templates].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <Sheet open={open} title="Start from split" onClose={onClose}>
      {sorted.length === 0 && (
        <p className={styles.empty}>
          No splits yet. Build a session and tap SAVE AS SPLIT.
        </p>
      )}
      {sorted.map((t) => {
        const names = t.exercises.map((e) => nameOf(e.exerciseId)).filter(Boolean)
        const preview = names.slice(0, 3).join(' · ') + (names.length > 3 ? ` +${names.length - 3}` : '')
        return (
          <button key={t.id} className={styles.row} onClick={() => onPick(t)}>
            <div className={styles.rowTop}>
              <span className={styles.name}>{t.name.toUpperCase()}</span>
              <span className={styles.count}>
                {t.exercises.length} {t.exercises.length === 1 ? 'exercise' : 'exercises'}
              </span>
            </div>
            {preview && <span className={styles.preview}>{preview}</span>}
          </button>
        )
      })}
    </Sheet>
  )
}
