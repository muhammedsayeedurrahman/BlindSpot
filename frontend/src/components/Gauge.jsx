import { motion } from 'framer-motion'

const LEVEL_COLORS = {
  healthy: '#39ff14',
  moderate: '#00f0ff',
  warning: '#ff6a00',
  critical: '#ff2d7c',
}

const LEVEL_BG = {
  healthy: 'rgba(57, 255, 20, 0.08)',
  moderate: 'rgba(0, 240, 255, 0.08)',
  warning: 'rgba(255, 106, 0, 0.08)',
  critical: 'rgba(255, 45, 124, 0.08)',
}

export default function Gauge({ score, level }) {
  const color = LEVEL_COLORS[level] || LEVEL_COLORS.moderate
  const bgColor = LEVEL_BG[level] || LEVEL_BG.moderate
  const rotation = (score / 100) * 180 - 90
  const circumference = Math.PI * 110
  const progress = (score / 100) * circumference

  const ticks = [0, 25, 50, 75, 100]

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
      >
        <svg viewBox="0 0 260 155" className="w-60 h-36">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#39ff14" />
              <stop offset="35%" stopColor="#00f0ff" />
              <stop offset="65%" stopColor="#ff6a00" />
              <stop offset="100%" stopColor="#ff2d7c" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Gradient background (full arc) */}
          <path
            d="M 25 140 A 110 110 0 0 1 235 140"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.15"
          />

          {/* Progress arc */}
          <motion.path
            d="M 25 140 A 110 110 0 0 1 235 140"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            filter="url(#glow)"
          />

          {/* Tick marks */}
          {ticks.map((tick) => {
            const angle = ((tick / 100) * 180 - 180) * (Math.PI / 180)
            const r = 110
            const cx = 130
            const cy = 140
            const x1 = cx + (r - 10) * Math.cos(angle)
            const y1 = cy + (r - 10) * Math.sin(angle)
            const x2 = cx + (r + 2) * Math.cos(angle)
            const y2 = cy + (r + 2) * Math.sin(angle)
            const lx = cx + (r + 14) * Math.cos(angle)
            const ly = cy + (r + 14) * Math.sin(angle)
            return (
              <g key={tick}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="var(--text-muted)"
                  strokeWidth="1.5"
                />
                <text
                  x={lx} y={ly}
                  fill="var(--text-muted)"
                  fontSize="8"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
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
            <line
              x1="130" y1="140" x2="130" y2="50"
              stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round"
              opacity="0.8"
            />
            <line
              x1="130" y1="140" x2="130" y2="55"
              stroke={color} strokeWidth="1" strokeLinecap="round"
              opacity="0.5"
            />
          </motion.g>

          {/* Center dot with glow */}
          <circle cx="130" cy="140" r="5" fill={color} opacity="0.9" />
          <circle cx="130" cy="140" r="8" fill={color} opacity="0.15" />
        </svg>
      </motion.div>

      <motion.div
        className="text-center -mt-1 px-6 py-3 rounded-xl"
        style={{ backgroundColor: bgColor }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        <span className="text-4xl font-black font-mono" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-base ml-1 theme-text-muted">/100</span>
        <p
          className="text-xs font-semibold uppercase tracking-widest mt-0.5"
          style={{ color }}
        >
          {level}
        </p>
      </motion.div>
    </div>
  )
}
