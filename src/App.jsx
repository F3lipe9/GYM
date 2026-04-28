import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import LogWorkout from './screens/LogWorkout'
import History from './screens/History'
import Progress from './screens/Progress'
import Exercises from './screens/Exercises'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/gym">
        <div className="app">
          <TopBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LogWorkout />} />
              <Route path="/history" element={<History />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/exercises" element={<Exercises />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
