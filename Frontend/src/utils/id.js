export function makeId(prefix = '') {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
