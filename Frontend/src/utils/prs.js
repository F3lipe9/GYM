// Returns a map of exerciseId → { weight, reps, date }
export function getPRs(workouts) {
  const prs = {}

  for (const workout of workouts) {
    for (const entry of workout.exercises) {
      const topWeight = Math.max(...entry.sets.map((s) => s.weight))
      const prev = prs[entry.exerciseId]
      if (!prev || topWeight > prev.weight) {
        const topSet = entry.sets.find((s) => s.weight === topWeight)
        prs[entry.exerciseId] = { weight: topWeight, reps: topSet.reps, date: workout.date }
      }
    }
  }

  return prs
}
