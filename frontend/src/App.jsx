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
          <FloatingOrbs />
          <div className="relative z-10">
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
