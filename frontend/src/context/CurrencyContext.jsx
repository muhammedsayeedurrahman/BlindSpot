import { createContext, useContext, useState } from 'react'

const CurrencyContext = createContext()

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('INR')

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'USD' ? 'INR' : 'USD'))
  }

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
