import { useState } from 'react'
import { load, save } from '../utils/storage'

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => load(key, initialValue))

  function setValue(value) {
    const next = typeof value === 'function' ? value(stored) : value
    setStored(next)
    save(key, next)
  }

  return [stored, setValue]
}
