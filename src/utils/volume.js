// Returns [{ date, volume }] for a given exercise sorted oldest → newest.
// Volume per session = sum of (weight × reps) across all sets.
export function getVolumeOverTime(workouts, exerciseId) {
  return workouts
    .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
    .map((w) => {
      const entry = w.exercises.find((e) => e.exerciseId === exerciseId)
      const volume = entry.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
      return { date: w.date, volume }
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}
