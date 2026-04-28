import styles from './SetRow.module.css'

export default function SetRow({ index, set, isActive, currentPR, onChange }) {
  const isPR = set.weight !== '' && Number(set.weight) > currentPR

  function toggleDone() {
    if (set.weight !== '' && set.reps !== '') {
      onChange({ ...set, done: !set.done })
    }
  }

  return (
    <div className={`${styles.row} ${isActive ? styles.active : ''} ${set.done ? styles.isDone : ''}`}>
      <span className={`${styles.num} ${isActive ? styles.numActive : ''}`}>{index + 1}</span>
      <input
        type="number"
        inputMode="decimal"
        placeholder="-"
        value={set.weight}
        onChange={(e) => onChange({ ...set, weight: e.target.value })}
        className={`${styles.input} ${isActive ? styles.inputActive : ''}`}
      />
      <input
        type="number"
        inputMode="numeric"
        placeholder="-"
        value={set.reps}
        onChange={(e) => onChange({ ...set, reps: e.target.value })}
        className={`${styles.input} ${isActive ? styles.inputActive : ''}`}
      />
      <div className={styles.checkWrap}>
        {isPR && <span className={styles.prBadge}>↑ PR</span>}
        <button
          className={`${styles.checkBtn} ${set.done ? styles.checkDone : ''}`}
          onClick={toggleDone}
          aria-label={set.done ? 'Unmark set' : 'Mark set done'}
        >
          <CheckIcon />
        </button>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
