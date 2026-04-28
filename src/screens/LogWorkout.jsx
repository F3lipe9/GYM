import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getPRs } from '../utils/prs'
import { getProgressionFlags, getSuggestedWeight } from '../utils/progression'
import SetRow from '../components/SetRow'
import ProgressionBadge from '../components/ProgressionBadge'
import styles from './LogWorkout.module.css'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function newSet() {
  return { weight: '', reps: '', done: false }
}

export default function LogWorkout() {
  const { state, dispatch } = useApp()
  const [date, setDate] = useState(todayISO)
  const [entries, setEntries] = useState([])
  const [showPicker, setShowPicker] = useState(false)

  const prs = getPRs(state.workouts)
  const progressionFlags = getProgressionFlags(state.workouts)
  const addedIds = new Set(entries.map((e) => e.exerciseId))

  function addExercise(exerciseId) {
    if (!exerciseId || addedIds.has(exerciseId)) return
    setEntries((prev) => [...prev, { exerciseId, sets: [newSet()] }])
    setShowPicker(false)
  }

  function updateSet(ei, si, updated) {
    setEntries((prev) =>
      prev.map((e, i) =>
        i !== ei ? e : { ...e, sets: e.sets.map((s, j) => (j === si ? updated : s)) }
      )
    )
  }

  function addSet(ei) {
    setEntries((prev) =>
      prev.map((e, i) => (i !== ei ? e : { ...e, sets: [...e.sets, newSet()] }))
    )
  }

  function removeExercise(ei) {
    setEntries((prev) => prev.filter((_, i) => i !== ei))
  }

  function finishWorkout() {
    const doneSets = entries
      .map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets
          .filter((s) => s.weight !== '' && s.reps !== '')
          .map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })),
      }))
      .filter((e) => e.sets.length > 0)

    if (!doneSets.length) return
    dispatch({ type: 'ADD_WORKOUT', payload: { id: makeId(), date, exercises: doneSets } })
    setEntries([])
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Today's Session</h1>
          <p className={styles.date}>{formatDate(date)}</p>
        </div>
        <label className={styles.calBtn} aria-label="Pick date">
          <CalendarIcon />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.hiddenDate}
          />
        </label>
      </div>

      {entries.map((entry, ei) => {
        const ex = state.exercises.find((e) => e.id === entry.exerciseId)
        const firstUndoneIdx = entry.sets.findIndex((s) => !s.done)
        const currentPR = prs[entry.exerciseId]?.weight ?? 0

        const qualifies = progressionFlags.has(entry.exerciseId)
        const suggested = qualifies ? getSuggestedWeight(state.workouts, entry.exerciseId) : null

        return (
          <ExerciseCard
            key={entry.exerciseId}
            name={ex?.name ?? entry.exerciseId}
            sets={entry.sets}
            firstUndoneIdx={firstUndoneIdx}
            currentPR={currentPR}
            suggestedWeight={suggested}
            onUpdateSet={(si, updated) => updateSet(ei, si, updated)}
            onAddSet={() => addSet(ei)}
            onRemove={() => removeExercise(ei)}
          />
        )
      })}

      {entries.length === 0 && !showPicker && (
        <div className={styles.emptyState}>
          <DumbbellEmptyIcon />
          <p className={styles.emptyTitle}>Ready to train?</p>
          <p className={styles.emptyHint}>Tap ADD EXERCISE to start building your session.</p>
        </div>
      )}

      {showPicker && (
        <select
          className={styles.exSelect}
          onChange={(e) => { addExercise(e.target.value); e.target.value = '' }}
          defaultValue=""
          autoFocus
          onBlur={() => setShowPicker(false)}
        >
          <option value="" disabled>Select exercise…</option>
          {state.exercises
            .filter((ex) => !addedIds.has(ex.id))
            .map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
        </select>
      )}

      <button className={styles.addExBtn} onClick={() => setShowPicker((v) => !v)}>
        <span className={styles.addExIcon}>⊕</span> ADD EXERCISE
      </button>

      {entries.length > 0 && (
        <button className={styles.finishBtn} onClick={finishWorkout}>
          FINISH WORKOUT
        </button>
      )}
    </div>
  )
}

function ExerciseCard({ name, sets, firstUndoneIdx, currentPR, suggestedWeight, onUpdateSet, onAddSet, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.exNameWrap}>
          <span className={styles.exName}>{name.toUpperCase()}</span>
          {suggestedWeight !== null && <ProgressionBadge suggestedWeight={suggestedWeight} />}
        </div>
        <div className={styles.menuWrap}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen((v) => !v)}>···</button>
          {menuOpen && (
            <div className={styles.menu}>
              <button onClick={() => { onRemove(); setMenuOpen(false) }}>Remove exercise</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.colHeaders}>
        <span>SET</span>
        <span>LBS</span>
        <span>REPS</span>
        <span>✓</span>
      </div>

      <div className={styles.sets}>
        {sets.map((set, si) => (
          <SetRow
            key={si}
            index={si}
            set={set}
            isActive={si === firstUndoneIdx}
            currentPR={currentPR}
            onChange={(updated) => onUpdateSet(si, updated)}
          />
        ))}
      </div>

      <button className={styles.addSetBtn} onClick={onAddSet}>+ ADD SET</button>
    </div>
  )
}

function DumbbellEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
