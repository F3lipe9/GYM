## Change 2: Always Suggest a Weight

### Summary
The progression badge now always shows a weight suggestion for every exercise, based on performance in the most recent session for that exercise. Previously it only flagged when all sets hit 10 reps.

### Rule
Evaluation is based on the **worst top-weight set** in the most recent session for that exercise:

| Condition | Suggestion |
|---|---|
| Every top-weight set ≥ 10 reps | Current top weight + 5 lbs |
| Every top-weight set ≥ 5 reps (but not all ≥ 10) | Same weight |
| Any top-weight set < 5 reps | Current top weight − 5 lbs |

### Definitions
- **Top weight**: highest weight logged across all sets for that exercise in that session
- **Top-weight sets**: only sets logged at the top weight (drop portions ignored)
- **Most recent session**: the last workout date on which that exercise was logged
- **No floor**: suggestion can go below any previously used weight

### Implementation

**Update `progression.js`:**

```js
// Current (only flags at 10 reps)
function getProgressionFlags(workouts, exercises) { ... }

// Replace with:
function getSuggestions(workouts, exercises) {
  // For each exercise:
  // 1. Find most recent workout containing that exercise
  // 2. Get all sets for that exercise in that workout
  // 3. Identify top weight (Math.max of all set weights)
  // 4. Filter to top-weight sets only
  // 5. Find worst set (Math.min of reps across top-weight sets)
  // 6. Apply rule:
  //    worstReps >= 10 → suggest topWeight + 5
  //    worstReps >= 5  → suggest topWeight
  //    worstReps < 5   → suggest topWeight - 5
  // 7. Return map of { exerciseId → suggestedWeight }
}
```

**Update `LogWorkout.jsx`:**
- Call `getSuggestions()` on mount
- For each exercise added to the workout, check if it has a suggestion
- If suggestion exists → render 🔺 badge with suggested weight
- Badge shows on first set input for that exercise, before the user logs anything

**Badge display (all cases):**
- Exercise has no prior workout → no badge (nothing to base suggestion on)
- Exercise has prior workout → always show badge with suggested weight