import { motion } from 'framer-motion'
import { useCurrency } from '../context/CurrencyContext'

const options = [
  { key: 'USD', label: 'USD' },
  { key: 'INR', label: 'INR' },
]

export default function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency()

  return (
    <div
      className="inline-flex items-center backdrop-blur-sm rounded-lg p-0.5 text-xs border"
      role="radiogroup"
      aria-label="Currency selection"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-default)',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={currency !== opt.key ? toggleCurrency : undefined}
          role="radio"
          aria-checked={currency === opt.key}
          aria-label={`Show salaries in ${opt.key}`}
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
              currency === opt.key ? 'text-neon-cyan' : ''
            }`}
            style={currency !== opt.key ? { color: 'var(--text-tertiary)' } : undefined}
          >
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  )
}
