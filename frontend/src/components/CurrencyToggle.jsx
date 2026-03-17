import { motion } from 'framer-motion'
import { useCurrency } from '../context/CurrencyContext'

const options = [
  { key: 'USD', label: 'USD' },
  { key: 'INR', label: 'INR' },
]

export default function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency()

  return (
    <div className="inline-flex items-center bg-dark-800/80 backdrop-blur-sm border border-white/10 rounded-lg p-0.5 text-xs">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={currency !== opt.key ? toggleCurrency : undefined}
          className="relative px-3 py-1.5 rounded-md font-medium transition-colors"
        >
          {currency === opt.key && (
            <motion.div
              layoutId="currency-pill"
              className="absolute inset-0 bg-neon-cyan/15 border border-neon-cyan/40 rounded-md"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 ${
              currency === opt.key ? 'text-neon-cyan' : 'text-white/40'
            }`}
          >
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  )
}
