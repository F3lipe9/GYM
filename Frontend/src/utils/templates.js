import { getSuggestions } from './progression'
import { makeId } from './id'

// localStorage key for the in-progress Log Workout session.
export const DRAFT_KEY = 'workout_draft'

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// Build Log Workout entries from a split (template).
// Weight is pre-filled with the suggested weight; reps are left blank.
// Exercises that no longer exist are skipped.
export function buildEntriesFromTemplate(template, workouts, exercises) {
  const suggestions = getSuggestions(workouts)
  const validIds = new Set(exercises.map((e) => e.id))

  return template.exercises
    .filter((t) => validIds.has(t.exerciseId))
    .map((t) => {
      const suggested = suggestions.get(t.exerciseId)
      const weight = suggested != null ? String(suggested) : ''
      return {
        exerciseId: t.exerciseId,
        sets: Array.from({ length: Math.max(1, t.setCount) }, () => ({
          weight,
          reps: '',
          done: false,
        })),
      }
    })
}

// Structure-only snapshot of the current session: exercises + set counts, no weights.
export function exercisesFromEntries(entries) {
  return entries.map((e) => ({ exerciseId: e.exerciseId, setCount: e.sets.length }))
}

export function templateFromEntries(name, entries) {
  return {
    id: makeId('split_'),
    name,
    createdAt: new Date().toISOString(),
    exercises: exercisesFromEntries(entries),
  }
}
