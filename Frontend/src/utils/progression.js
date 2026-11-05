// Returns a Map of { exerciseId → { suggested, topWeight } } based on each exercise's most recent session.
// Rules applied to worst (min reps) top-weight set:
//   all top-weight sets >= 10 reps → topWeight + 5
//   all top-weight sets >= 5 reps  → topWeight (same)
//   any top-weight set  < 5 reps   → topWeight - 5 (never below 0)
export function getSuggestionDetails(workouts) {
  const seen = new Map()

  for (let i = workouts.length - 1; i >= 0; i--) {
    for (const entry of workouts[i].exercises) {
      if (seen.has(entry.exerciseId) || entry.sets.length === 0) continue

      const topWeight = Math.max(...entry.sets.map((s) => s.weight))
      const topSets = entry.sets.filter((s) => s.weight === topWeight)
      const worstReps = Math.min(...topSets.map((s) => s.reps))

      let suggested
      if (worstReps >= 10) {
        suggested = topWeight + 5
      } else if (worstReps >= 5) {
        suggested = topWeight
      } else {
        suggested = Math.max(0, topWeight - 5)
      }

      seen.set(entry.exerciseId, { suggested, topWeight })
    }
  }

  return seen
}

// Returns a Map of { exerciseId → suggestedWeight }.
export function getSuggestions(workouts) {
  const out = new Map()
  for (const [id, { suggested }] of getSuggestionDetails(workouts)) out.set(id, suggested)
  return out
}
