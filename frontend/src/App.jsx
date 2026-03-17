import { Routes, Route } from 'react-router-dom'
import { CurrencyProvider } from './context/CurrencyContext'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-dark-900">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </CurrencyProvider>
  )
}
