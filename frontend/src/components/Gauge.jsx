import { motion } from 'framer-motion'

const LEVEL_COLORS = {
  healthy: '#34D399',
  moderate: '#38BDF8',
  warning: '#FB923C',
  critical: '#FB7185',
}

const LEVEL_BG = {
  healthy: 'rgba(52, 211, 153, 0.08)',
  moderate: 'rgba(56, 189, 248, 0.08)',
  warning: 'rgba(251, 146, 60, 0.08)',
  critical: 'rgba(251, 113, 133, 0.08)',
}

const LEVEL_LABELS = {
  healthy: 'LOW RISK',
  moderate: 'MODERATE',
  warning: 'HIGH RISK',
  critical: 'CRITICAL RISK',
}

const INSIGHT_TEXT = {
  healthy: 'Your career foundation is solid. Continue monitoring for emerging trends.',
  moderate: 'Some areas need attention. Consider strategic upskilling in flagged domains.',
  warning: 'Significant blind spots detected. Prioritize the top risk factors below.',
  critical: 'Urgent action required. Multiple career vulnerabilities demand immediate attention.',
}

// Arc segment colors from green (low) to red (high risk)
const SEGMENT_COLORS = [
  { offset: 0, color: '#34D399' },
  { offset: 0.25, color: '#38BDF8' },
  { offset: 0.5, color: '#FB923C' },
  { offset: 0.75, color: '#FB7185' },
]

export default function Gauge({ score, level }) {
  const color = LEVEL_COLORS[level] || LEVEL_COLORS.moderate
  const bgColor = LEVEL_BG[level] || LEVEL_BG.moderate
  const riskLabel = LEVEL_LABELS[level] || LEVEL_LABELS.moderate
  const insightText = INSIGHT_TEXT[level] || INSIGHT_TEXT.moderate
  const rotation = (score / 100) * 180 - 90
  const circumference = Math.PI * 110
  const progress = (score / 100) * circumference

  const ticks = [0, 25, 50, 75, 100]

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative gauge-bounce"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
      >
        <svg viewBox="0 0 260 155" className="w-64 h-[9.5rem]">
          <defs>
            <linearGradient id="gaugeGradientMulti" x1="0%" y1="0%" x2="100%" y2="0%">
              {SEGMENT_COLORS.map((seg) => (
                <stop key={seg.offset} offset={`${seg.offset * 100}%`} stopColor={seg.color} />
              ))}
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowStrong">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background arc */}
          <path
            d="M 25 140 A 110 110 0 0 1 235 140"
            fill="none"
            stroke="var(--gauge-bg)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Multi-segment gradient arc (full, faded) */}
          <path
            d="M 25 140 A 110 110 0 0 1 235 140"
            fill="none"
            stroke="url(#gaugeGradientMulti)"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.12"
          />

          {/* Segment divider marks */}
          {[25, 50, 75].map((pct) => {
            const angle = ((pct / 100) * 180 - 180) * (Math.PI / 180)
            const cx = 130, cy = 140, r = 110
            const x1 = cx + (r - 12) * Math.cos(angle)
            const y1 = cy + (r - 12) * Math.sin(angle)
            const x2 = cx + (r + 4) * Math.cos(angle)
            const y2 = cy + (r + 4) * Math.sin(angle)
            return (
              <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
            )
          })}

          {/* Active progress arc */}
          <motion.path
            d="M 25 140 A 110 110 0 0 1 235 140"
            fill="none"
            stroke="url(#gaugeGradientMulti)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            filter="url(#glowStrong)"
          />

          {/* Tick marks + labels */}
          {ticks.map((tick) => {
            const angle = ((tick / 100) * 180 - 180) * (Math.PI / 180)
            const r = 110, cx = 130, cy = 140
            const x1 = cx + (r - 10) * Math.cos(angle)
            const y1 = cy + (r - 10) * Math.sin(angle)
            const x2 = cx + (r + 2) * Math.cos(angle)
            const y2 = cy + (r + 2) * Math.sin(angle)
            const lx = cx + (r + 16) * Math.cos(angle)
            const ly = cy + (r + 16) * Math.sin(angle)
            return (
              <g key={tick}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="var(--text-muted)" strokeWidth="1.5" />
                <text x={lx} y={ly} fill="var(--text-muted)"
                  fontSize="8" textAnchor="middle" dominantBaseline="middle"
                  fontFamily="Inter, sans-serif">
                  {tick}
                </text>
              </g>
            )
          })}

          {/* Needle */}
          <motion.g
            style={{ transformOrigin: '130px 140px' }}
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <line x1="130" y1="140" x2="130" y2="48"
              stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <line x1="130" y1="140" x2="130" y2="52"
              stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </motion.g>

          {/* Center hub */}
          <circle cx="130" cy="140" r="6" fill={color} opacity="0.9" />
          <circle cx="130" cy="140" r="10" fill={color} opacity="0.12" />
        </svg>
      </motion.div>

      {/* Score display */}
      <motion.div
        className="text-center -mt-2 px-8 py-3 rounded-xl"
        style={{ backgroundColor: bgColor }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        <div className="score-pulse">
          <span className="text-[64px] leading-none font-black font-mono" style={{ color }}>
            {score.toFixed(0)}
          </span>
          <span className="text-lg ml-1 theme-text-muted">/100</span>
        </div>
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mt-1"
          style={{ color }}
        >
          {riskLabel}
        </p>
      </motion.div>

      {/* Insight text */}
      <motion.p
        className="text-center theme-text-tertiary text-xs mt-3 max-w-[280px] leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {insightText}
      </motion.p>
    </div>
  )
}
