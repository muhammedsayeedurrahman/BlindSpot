import { useState } from 'react'
import { motion } from 'framer-motion'

const SEVERITY_HIGH_THRESHOLD = 60
const SEVERITY_MEDIUM_THRESHOLD = 35

const RISK_META = {
  skill_decay: {
    label: 'Skill Decay',
    weight: '30%',
    description: 'How quickly your current skills are losing market relevance',
    tooltip: 'Based on half-life analysis of each skill vs. market demand trends',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M13 17l5-5-5-5M6 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),

    glowColor: 'rgba(255, 106, 0, 0.15)',
    barColor: 'bg-neon-orange',
    textColor: 'text-neon-orange',
  },
  illusion_gap: {
    label: 'Illusion Gap',
    weight: '25%',
    description: 'Gap between perceived competence and actual market value',
    tooltip: 'Compares self-rated confidence against market relevance scores',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
      </svg>
    ),

    glowColor: 'rgba(180, 74, 255, 0.15)',
    barColor: 'bg-neon-purple',
    textColor: 'text-neon-purple',
  },
  market_mismatch: {
    label: 'Market Mismatch',
    weight: '25%',
    description: 'How far your skill portfolio drifts from top market demands',
    tooltip: 'Measures overlap between your skills and the most in-demand skills for your target role',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-8 4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),

    glowColor: 'rgba(255, 45, 124, 0.15)',
    barColor: 'bg-neon-pink',
    textColor: 'text-neon-pink',
  },
  concentration_risk: {
    label: 'Concentration Risk',
    weight: '20%',
    description: 'Over-reliance on a narrow set of skills or single domain',
    tooltip: 'Lower diversity in skill categories increases vulnerability to market shifts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),

    glowColor: 'rgba(0, 240, 255, 0.15)',
    barColor: 'bg-neon-cyan',
    textColor: 'text-neon-cyan',
  },
}

function RiskCard({ name, value, index }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const meta = RISK_META[name]
  if (!meta) return null

  const severity = value > SEVERITY_HIGH_THRESHOLD ? 'High' : value > SEVERITY_MEDIUM_THRESHOLD ? 'Medium' : 'Low'
  const severityColor = value > SEVERITY_HIGH_THRESHOLD ? 'text-neon-pink' : value > SEVERITY_MEDIUM_THRESHOLD ? 'text-neon-orange' : 'text-neon-green'
  const barColor = value > SEVERITY_HIGH_THRESHOLD ? 'bg-neon-pink' : value > SEVERITY_MEDIUM_THRESHOLD ? 'bg-neon-orange' : 'bg-neon-green'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        scale: 1.01,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 20px ' + meta.glowColor,
      }}
      className="relative p-4 rounded-xl cursor-default transition-all duration-300"
      style={{
        background: 'rgba(30,30,50,0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-lg text-[11px] whitespace-nowrap"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-secondary)',
          }}
        >
          {meta.tooltip}
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.textColor}`}
            style={{ background: meta.glowColor }}
          >
            {meta.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold theme-text">{meta.label}</h4>
            <p className="text-[10px] theme-text-muted">Weight: {meta.weight}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold font-mono ${meta.textColor}`}>
            {value.toFixed(0)}
          </span>
          <p className={`text-[10px] font-medium ${severityColor}`}>{severity}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-quaternary)' }}>
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 1.2, delay: 0.5 + index * 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ boxShadow: '0 0 10px currentColor' }}
        />
      </div>

      <p className="text-[11px] theme-text-tertiary mt-2 leading-relaxed">{meta.description}</p>
    </motion.div>
  )
}

export default function RiskCards({ components }) {
  const entries = Object.entries(components)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {entries.map(([key, value], i) => (
        <RiskCard key={key} name={key} value={value} index={i} />
      ))}
    </div>
  )
}
