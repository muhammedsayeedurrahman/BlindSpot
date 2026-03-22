/**
 * AssessmentResults — Verification badges and skill accuracy display
 * Only renders if assessment_data is present.
 * === NEW: Assessment results component (delete file to remove) ===
 */
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  verified: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Verified',
    color: 'text-neon-green',
    bg: 'bg-neon-green/12',
    border: 'border-neon-green/30',
    pillBg: 'bg-neon-green/15',
  },
  overconfident: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Overconfident',
    color: 'text-neon-pink',
    bg: 'bg-neon-pink/12',
    border: 'border-neon-pink/30',
    pillBg: 'bg-neon-pink/15',
  },
  hidden_strength: {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Hidden Strength',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/12',
    border: 'border-neon-cyan/30',
    pillBg: 'bg-neon-cyan/15',
  },
}

function MiniGauge({ accuracy }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (accuracy / 100) * circumference
  const color = accuracy >= 70 ? '#39ff14' : accuracy >= 40 ? '#ff6a00' : '#ff2d7c'

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="var(--bg-quaternary)"
          strokeWidth="6"
        />
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold font-mono" style={{ color }}>
          {accuracy.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

export default function AssessmentResults({ assessmentData }) {
  if (!assessmentData || !assessmentData.per_skill) return null

  const { per_skill, overall_accuracy, verification_gap } = assessmentData

  return (
    <div>
      {/* Header with AI Verified badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MiniGauge accuracy={overall_accuracy} />
          <div className="ml-2">
            <p className="text-sm font-semibold theme-text">Overall Accuracy</p>
            <p className="text-xs theme-text-muted">
              {verification_gap > 0
                ? `+${verification_gap.toFixed(1)} overconfidence gap`
                : `${verification_gap.toFixed(1)} verification gap`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-neon-cyan">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider">AI Verified</span>
        </div>
      </div>

      {/* Skill pills grid */}
      <div className="flex flex-wrap gap-2">
        {per_skill.map((s, i) => {
          const config = STATUS_CONFIG[s.status] || STATUS_CONFIG.verified
          return (
            <motion.div
              key={s.skill}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.1 * i,
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${config.color} ${config.bg} ${config.border}`}
            >
              {config.icon}
              <span>{s.skill}</span>
              <span className="font-mono opacity-70">{s.verified_score.toFixed(0)}%</span>
            </motion.div>
          )
        })}
      </div>

      {/* Verification impact line */}
      {verification_gap > 5 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs mt-4 theme-text-muted"
        >
          AI Verification Impact:{' '}
          <motion.span
            className="text-neon-pink font-bold"
            animate={{
              textShadow: [
                '0 0 0px rgba(255,45,124,0)',
                '0 0 8px rgba(255,45,124,0.5)',
                '0 0 0px rgba(255,45,124,0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            +{Math.round(verification_gap * 0.2)} risk points
          </motion.span>
          {' '}added to BSI
        </motion.p>
      )}
    </div>
  )
}
