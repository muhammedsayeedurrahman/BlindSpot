import { Routes, Route } from 'react-router-dom'
import { CurrencyProvider } from './context/CurrencyContext'
import { ThemeProvider } from './context/ThemeContext'
import FloatingOrbs from './components/FloatingOrbs'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'

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
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </CurrencyProvider>
    </ThemeProvider>
  )
}
