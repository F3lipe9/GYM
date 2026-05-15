## Change 1: Draft Workout Persistence

### Summary
An in-progress workout is saved to localStorage as a draft in real time. Navigating away from the Log Workout screen does not clear it. The draft is only cleared when the user explicitly submits or deletes the workout.

### Behavior
- User starts logging a workout → draft is written to localStorage immediately
- User switches to History, Progress, or Exercises → draft is preserved
- User returns to Log Workout → draft is restored exactly as left
- User taps Submit → workout is saved to `workouts[]`, draft is cleared
- User taps Delete → draft is cleared, nothing saved
- Only one draft exists at a time

### Implementation

**Storage:**
Add a new localStorage key:
```js
draft_workout: {
  date,
  exercises: [
    {
      exerciseId,
      sets: [{ weight, reps }]
    }
  ]
}
```

**Logic:**
- In `LogWorkout.jsx`, on every state change (add set, update reps, update weight, add exercise) → write draft to localStorage via `saveDraft(draft)`
- On component mount → check localStorage for existing draft via `loadDraft()`, if found restore it into local state
- On submit → call `saveWorkout(workout)`, then `clearDraft()`
- On delete → call `clearDraft()`, reset local state

**Utilities to add in `storage.js`:**
```js
saveDraft(draft)   // writes draft_workout to localStorage
loadDraft()        // returns draft_workout or null
clearDraft()       // removes draft_workout from localStorage
```

---
