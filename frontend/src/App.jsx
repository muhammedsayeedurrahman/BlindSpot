import { Routes, Route } from 'react-router-dom'
import { CurrencyProvider } from './context/CurrencyContext'
import { ThemeProvider } from './context/ThemeContext'
import FloatingOrbs from './components/FloatingOrbs'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import Explore from './pages/Explore'
import RoadmapPage from './pages/RoadmapPage'
import Opportunities from './pages/Opportunities'
import JourneyLayout from './layouts/JourneyLayout'

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <div className="min-h-screen theme-bg relative transition-colors duration-500">
          <a href="#main-content" className="skip-link">Skip to content</a>
          <FloatingOrbs />
          <div className="relative z-10" id="main-content" role="main">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/onboarding" element={<Onboarding />} />
              {/* Journey routes — wrapped in JourneyLayout with sidebar */}
              <Route element={<JourneyLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/opportunities" element={<Opportunities />} />
              </Route>
            </Routes>
          </div>
        </div>
      </CurrencyProvider>
    </ThemeProvider>
  )
}
