// Returns [{ date, volume }] for a given exercise sorted oldest → newest.
// Volume per day = sum of (weight × reps) across all sets; multiple workouts
// on the same date are combined into one point.
export function getVolumeOverTime(workouts, exerciseId) {
  const byDate = new Map()
  for (const w of workouts) {
    for (const e of w.exercises) {
      if (e.exerciseId !== exerciseId) continue
      const volume = e.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
      byDate.set(w.date, (byDate.get(w.date) ?? 0) + volume)
    }
  }
  return [...byDate.entries()]
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
