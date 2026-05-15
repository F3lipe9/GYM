// Returns a Map of { exerciseId → suggestedWeight } based on each exercise's most recent session.
// Rules applied to worst (min reps) top-weight set:
//   all top-weight sets >= 10 reps → topWeight + 5
//   all top-weight sets >= 5 reps  → topWeight (same)
//   any top-weight set  < 5 reps   → topWeight - 5
export function getSuggestions(workouts) {
  const seen = new Map()

  for (let i = workouts.length - 1; i >= 0; i--) {
    for (const entry of workouts[i].exercises) {
      if (seen.has(entry.exerciseId)) continue

      const topWeight = Math.max(...entry.sets.map((s) => s.weight))
      const topSets = entry.sets.filter((s) => s.weight === topWeight)
      const worstReps = Math.min(...topSets.map((s) => s.reps))

      let suggested
      if (worstReps >= 10) {
        suggested = topWeight + 5
      } else if (worstReps >= 5) {
        suggested = topWeight
      } else {
        suggested = topWeight - 5
      }

      seen.set(entry.exerciseId, suggested)
    }
  }

  return seen
}
