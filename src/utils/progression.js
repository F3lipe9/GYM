// Returns a Set of exerciseIds that qualify for weight progression.
// An exercise qualifies when ALL sets at its top weight have reps >= 10.
export function getProgressionFlags(workouts) {
  const flags = new Set()

  for (const workout of workouts) {
    for (const entry of workout.exercises) {
      const weights = entry.sets.map((s) => s.weight)
      const topWeight = Math.max(...weights)
      const topSets = entry.sets.filter((s) => s.weight === topWeight)
      if (topSets.length > 0 && topSets.every((s) => s.reps >= 10)) {
        flags.add(entry.exerciseId)
      }
    }
  }

  return flags
}

// Returns suggested next weight for an exercise given its workout history.
export function getSuggestedWeight(workouts, exerciseId) {
  for (let i = workouts.length - 1; i >= 0; i--) {
    const entry = workouts[i].exercises.find((e) => e.exerciseId === exerciseId)
    if (!entry) continue
    const topWeight = Math.max(...entry.sets.map((s) => s.weight))
    return topWeight + 5
  }
  return null
}
