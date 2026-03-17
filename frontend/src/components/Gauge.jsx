import { motion } from 'framer-motion'

const LEVEL_COLORS = {
  healthy: '#39ff14',
  moderate: '#00f0ff',
  warning: '#ff6a00',
  critical: '#ff2d7c',
}

export default function Gauge({ score, level }) {
  const color = LEVEL_COLORS[level] || LEVEL_COLORS.moderate
  const rotation = (score / 100) * 180 - 90 // -90 to 90 degrees
  const circumference = Math.PI * 120 // radius 120 semicircle
  const progress = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 260 150" className="w-64 h-36">
        {/* Background arc */}
        <path
          d="M 20 140 A 120 120 0 0 1 240 140"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d="M 20 140 A 120 120 0 0 1 240 140"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        {/* Needle */}
        <motion.line
          x1="130"
          y1="140"
          x2="130"
          y2="40"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transformOrigin: '130px 140px' }}
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {/* Center dot */}
        <circle cx="130" cy="140" r="6" fill={color} />
      </svg>

      <motion.div
        className="text-center -mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-5xl font-black font-mono" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-white/40 text-lg ml-1">/100</span>
        <p
          className="text-sm font-semibold uppercase tracking-wider mt-1"
          style={{ color }}
        >
          {level}
        </p>
      </motion.div>
    </div>
  )
}
