import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { runMigrations } from './utils/migrations'

// Must run before the first render: screens read localStorage in their initial state.
runMigrations()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
