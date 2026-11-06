// Position-based IDs used before schema v2 (default list order as of commit 62fd613).
// Saved workouts from that version reference these. Do not edit unless correcting a mapping.
export const LEGACY_ID_MAP = {
  default_0: 'bench-press',
  default_1: 'incline-bench',
  default_2: 'dumbbell-bench',
  default_3: 'incline-dumbbell',
  default_4: 'pec-fly',
  default_5: 'shoulder-press',
  default_6: 'machine-lateral-raise', // was "Lat Raise Machine"
  default_7: 'cable-lateral-raise', // was "Lat Raise Cable"
  default_8: 'sa-tricep-extension', // was "Tricep Extension"
  default_9: 'tricep-rope',
  default_10: 'jm-press',
  default_11: 'legacy-tricep-machine', // "Tricep Machine" — removed from defaults
  default_12: 'lying-curl',
  default_13: 'lying-hammer-curl',
  default_14: 'straight-bar-curl',
  default_15: 'reverse-curl',
  default_16: 'rope-hammer-curl',
  default_17: 'behind-curl',
  default_18: 'pull-up',
  default_19: 'lat-pulldown',
  default_20: 'lat-pullover',
  default_21: 'lower-row',
  default_22: 'upper-row',
  default_23: 'kelso',
  default_24: 'rear-delt-fly',
  default_25: 'face-pull',
  default_26: 'squat',
  default_27: 'leg-press',
  default_28: 'rdl',
  default_29: 'leg-extension',
  default_30: 'leg-curl',
  default_31: 'calf-raises',
  default_32: 'hip-abductor',
  default_33: 'hip-adductor',
}

// Defaults that were dropped from the list. If any saved data still references one,
// the migration re-creates it as a custom exercise so its history isn't lost.
export const REMOVED_DEFAULTS = [
  { id: 'legacy-tricep-machine', name: 'Tricep Machine', category: 'Tricep', equipment: 'Machine', type: 'Isolation' },
  // Removed in schema v3
  { id: 'lying-hammer-curl', name: 'Lying Hammer Curl', category: 'Bicep', equipment: 'Dumbbell', type: 'Isolation' },
  { id: 'straight-bar-curl', name: 'Straight Bar Curl', category: 'Bicep', equipment: 'Barbell', type: 'Isolation' },
  { id: 'rope-hammer-curl', name: 'Rope Hammer Curl', category: 'Bicep', equipment: 'Cable', type: 'Isolation' },
  { id: 'behind-curl', name: 'Behind Curl', category: 'Bicep', equipment: 'Cable', type: 'Isolation' },
  { id: 'lat-pullover', name: 'Lat Pullover', category: 'Back', equipment: 'Cable', type: 'Isolation' },
  { id: 'face-pull', name: 'Face Pull', category: 'Back', equipment: 'Cable', type: 'Compound' },
  { id: 'squat', name: 'Squat', category: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { id: 'rdl', name: 'RDL', category: 'Legs', equipment: 'Barbell', type: 'Compound' },
]
