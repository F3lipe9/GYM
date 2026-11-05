// Every default has a fixed, hand-written `id`. Workouts and splits store these
// IDs, so NEVER change or reuse one — reordering, adding or removing entries is safe.
// Removing a default? Add it to REMOVED_DEFAULTS in legacyIdMap.js so history is kept.
export const DEFAULT_EXERCISES = [
  { id: 'pec-fly', name: 'Pec Fly', category: 'Chest', equipment: 'Machine', type: 'Isolation' },
  { id: 'incline-bench', name: 'Incline Bench', category: 'Chest', equipment: 'Barbell', type: 'Compound' },
  { id: 'smith-incline-bench', name: 'Smith Incline Bench', category: 'Chest', equipment: 'Smith', type: 'Compound' },
  { id: 'low-to-high-cable-fly', name: 'Low To High Cable Fly', category: 'Chest', equipment: 'Cable', type: 'Isolation' },
  { id: 'bench-press', name: 'Bench Press', category: 'Chest', equipment: 'Barbell', type: 'Compound' },
  { id: 'dumbbell-bench', name: 'Dumbbell Bench', category: 'Chest', equipment: 'Dumbbell', type: 'Compound' },
  { id: 'incline-dumbbell', name: 'Incline Dumbbell', category: 'Chest', equipment: 'Dumbbell', type: 'Compound' },

  { id: 'shoulder-press', name: 'Shoulder Press', category: 'Shoulder', equipment: 'Dumbbell', type: 'Compound' },
  { id: 'smith-shoulder-press', name: 'Smith Shoulder Press', category: 'Shoulder', equipment: 'Smith', type: 'Compound' },
  { id: 'machine-lateral-raise', name: 'Machine Lateral Raise', category: 'Shoulder', equipment: 'Machine', type: 'Isolation' },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', category: 'Shoulder', equipment: 'Cable', type: 'Isolation' },
  { id: 'cable-front-raise', name: 'Cable Front Raise', category: 'Shoulder', equipment: 'Cable', type: 'Isolation' },

  { id: 'sa-tricep-extension', name: 'S/A Tricep Extension', category: 'Tricep', equipment: 'Cable', type: 'Isolation' },
  { id: 'sa-overhead-extension', name: 'S/A Overhead Extension', category: 'Tricep', equipment: 'Cable', type: 'Isolation' },
  { id: 'tricep-rope', name: 'Tricep Rope', category: 'Tricep', equipment: 'Cable', type: 'Isolation' },
  { id: 'jm-press', name: 'JM Press', category: 'Tricep', equipment: 'Machine', type: 'Isolation' },
  { id: 'dips', name: 'Dips', category: 'Tricep', equipment: 'Machine', type: 'Isolation' },

  { id: 'lying-curl', name: 'Lying Curl', category: 'Bicep', equipment: 'Dumbbell', type: 'Isolation' },
  { id: 'lying-hammer-curl', name: 'Lying Hammer Curl', category: 'Bicep', equipment: 'Dumbbell', type: 'Isolation' },
  { id: 'straight-bar-curl', name: 'Straight Bar Curl', category: 'Bicep', equipment: 'Barbell', type: 'Isolation' },
  { id: 'reverse-curl', name: 'Reverse Curl', category: 'Bicep', equipment: 'Cable', type: 'Isolation' },
  { id: 'rope-hammer-curl', name: 'Rope Hammer Curl', category: 'Bicep', equipment: 'Cable', type: 'Isolation' },
  { id: 'behind-curl', name: 'Behind Curl', category: 'Bicep', equipment: 'Cable', type: 'Isolation' },

  { id: 'pull-up', name: 'Pull Up', category: 'Back', equipment: 'Free', type: 'Compound' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'Back', equipment: 'Machine', type: 'Compound' },
  { id: 'lat-pullover', name: 'Lat Pullover', category: 'Back', equipment: 'Cable', type: 'Isolation' },
  { id: 'lower-row', name: 'Lower Row', category: 'Back', equipment: 'Machine', type: 'Compound' },
  { id: 'upper-row', name: 'Upper Row', category: 'Back', equipment: 'Machine', type: 'Compound' },
  { id: 'kelso', name: 'Kelso', category: 'Back', equipment: 'Machine', type: 'Isolation' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', category: 'Back', equipment: 'Machine', type: 'Isolation' },
  { id: 'face-pull', name: 'Face Pull', category: 'Back', equipment: 'Cable', type: 'Compound' },

  { id: 'squat', name: 'Squat', category: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { id: 'leg-press', name: 'Leg Press', category: 'Legs', equipment: 'Machine', type: 'Compound' },
  { id: 'rdl', name: 'RDL', category: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { id: 'leg-curl', name: 'Leg Curl', category: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { id: 'calf-raises', name: 'Calf Raises', category: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { id: 'hip-abductor', name: 'Hip Abductor', category: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { id: 'hip-adductor', name: 'Hip Adductor', category: 'Legs', equipment: 'Machine', type: 'Isolation' },
].map((ex) => ({
  isDefault: true,
  createdAt: new Date(0).toISOString(),
  ...ex,
}))
