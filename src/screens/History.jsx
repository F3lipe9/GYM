import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Heatmap from '../components/Heatmap'
import styles from './History.module.css'

function calcStreak(workouts) {
  const dates = [...new Set(workouts.map((w) => w.date.slice(0, 10)))].sort().reverse()
  if (!dates.length) return 0
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let cursor = new Date(today)
  for (const d of dates) {
    const expected = cursor.toISOString().slice(0, 10)
    if (d === expected) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function formatDate(dateStr) {
  const workout = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (workout.getTime() === today.getTime()) return 'TODAY'
  if (workout.getTime() === yesterday.getTime()) return 'YESTERDAY'
  return workout.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

function calcVolumeLbs(workout) {
  let total = 0
  for (const ex of workout.exercises) {
    for (const s of ex.sets) total += s.weight * s.reps
  }
  return total
}

function formatVolume(lbs) {
  if (lbs === 0) return null
  return (lbs / 1000).toFixed(1) + 'T'
}

function formatSets(sets) {
  const groups = {}
  for (const s of sets) {
    if (!groups[s.weight]) groups[s.weight] = []
    groups[s.weight].push(s.reps)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([weight, repsList]) => {
      const allSame = repsList.every((r) => r === repsList[0])
      return allSame
        ? `${repsList.length}×${repsList[0]} @ ${weight}`
        : repsList.map((r) => `${r} @ ${weight}`).join(', ')
    })
    .join(' · ')
}

function getWorkoutSummary(workout, exercises) {
  const names = workout.exercises
    .map((ex) => exercises.find((e) => e.id === ex.exerciseId)?.name)
    .filter(Boolean)
  if (names.length === 0) return 'Workout'
  if (names.length <= 2) return names.join(' · ')
  return `${names[0]} · ${names[1]} +${names.length - 2}`
}

export default function History() {
  const { state, dispatch } = useApp()
  const [expanded, setExpanded] = useState(null)

  const sorted = [...state.workouts].sort((a, b) => b.date.localeCompare(a.date))
  const streak = calcStreak(state.workouts)

  return (
    <div className={styles.page}>
      <div className={styles.streakCard}>
        <div className={styles.streakLeft}>
          <span className={styles.streakLabel}>ACTIVE STREAK</span>
          <div className={styles.streakValue}>
            <span className={styles.streakNumber}>{streak}</span>
            <span className={styles.streakDays}>DAYS</span>
          </div>
        </div>
        <div className={styles.streakIconBox}>
          <FlameIcon />
        </div>
      </div>

      <section className={styles.heatmapSection}>
        <h2 className={styles.sectionTitle}>INTENSITY</h2>
        <Heatmap workouts={state.workouts} />
      </section>

      {sorted.length === 0 && (
        <p className={styles.empty}>No workouts logged yet.</p>
      )}

      <div className={styles.workoutList}>
        {sorted.map((workout) => {
          const volume = formatVolume(calcVolumeLbs(workout))
          const dateLabel = formatDate(workout.date)
          const summary = getWorkoutSummary(workout, state.exercises)
          const isOpen = expanded === workout.id

          return (
            <div key={workout.id} className={styles.workoutCard}>
              <button
                className={styles.cardHeader}
                onClick={() => setExpanded(isOpen ? null : workout.id)}
              >
                <div className={styles.cardHeaderLeft}>
                  <span className={styles.cardMeta}>
                    {dateLabel}{volume ? ` · ${volume}` : ''}
                  </span>
                  <span className={styles.cardName}>{summary}</span>
                </div>
                <ChevronIcon open={isOpen} />
              </button>

              {isOpen && (
                <div className={styles.cardDetail}>
                  {workout.exercises.map((entry) => {
                    const ex = state.exercises.find((e) => e.id === entry.exerciseId)
                    return (
                      <div key={entry.exerciseId} className={styles.exerciseRow}>
                        <span className={styles.exName}>{ex?.name ?? entry.exerciseId}</span>
                        <span className={styles.exSets}>{formatSets(entry.sets)}</span>
                      </div>
                    )
                  })}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => {
                      dispatch({ type: 'DELETE_WORKOUT', payload: workout.id })
                      setExpanded(null)
                    }}
                  >
                    Delete workout
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FlameIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c0 0-5 5-5 10a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3-1.5 0-2-2-1-4C11 5 12 2 12 2z" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, color: 'var(--text-muted)', marginTop: 4 }}
    >
      {open
        ? <polyline points="18 15 12 9 6 15" />
        : <polyline points="6 9 12 15 18 9" />}
    </svg>
  )
}
