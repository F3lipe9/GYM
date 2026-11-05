import { createContext, useContext, useReducer, useEffect } from 'react'
import { load, save } from '../utils/storage'
import { DEFAULT_EXERCISES } from '../data/defaultExercises'

const AppContext = createContext(null)

const initialState = {
  workouts: [],
  exercises: [],
  bodyweight: [],
  templates: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload
    case 'ADD_WORKOUT':
      return { ...state, workouts: [...state.workouts, action.payload] }
    case 'DELETE_WORKOUT':
      return { ...state, workouts: state.workouts.filter((w) => w.id !== action.payload) }
    case 'ADD_EXERCISE':
      return { ...state, exercises: [...state.exercises, action.payload] }
    case 'DELETE_EXERCISE':
      return { ...state, exercises: state.exercises.filter((e) => e.id !== action.payload) }
    case 'LOG_BODYWEIGHT':
      return { ...state, bodyweight: [...state.bodyweight, action.payload] }
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.payload] }
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map((t) => (t.id === action.payload.id ? action.payload : t)),
      }
    case 'DELETE_TEMPLATE':
      return { ...state, templates: state.templates.filter((t) => t.id !== action.payload) }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const workouts = load('workouts', [])
    const stored = load('exercises', null)
    const customExercises = Array.isArray(stored) ? stored.filter((e) => !e.isDefault) : []
    const exercises = [...DEFAULT_EXERCISES, ...customExercises]
    const bodyweight = load('bodyweight', [])
    const templates = load('templates', [])
    dispatch({ type: 'INIT', payload: { workouts, exercises, bodyweight, templates } })
  }, [])

  useEffect(() => { save('workouts', state.workouts) }, [state.workouts])
  useEffect(() => { save('exercises', state.exercises) }, [state.exercises])
  useEffect(() => { save('bodyweight', state.bodyweight) }, [state.bodyweight])
  useEffect(() => { save('templates', state.templates) }, [state.templates])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
