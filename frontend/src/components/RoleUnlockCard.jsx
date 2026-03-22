import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useJourneyStore from '../store/useJourneyStore'
import JobLinks from './JobLinks'

function ScoreRing({ score, size = 56, locked = false }) {
  const color = locked ? '#64748B' : score >= 60 ? '#34D399' : score >= 40 ? '#38BDF8' : '#FB923C'
  const pct = Math.min(score, 100)
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: locked
          ? 'conic-gradient(#475569 100%, #475569 100%)'
          : `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.06) ${pct * 3.6}deg)`,
        padding: 3,
        opacity: locked ? 0.5 : 1,
      }}
    >
      <div
        className="rounded-full w-full h-full flex items-center justify-center"
        style={{ background: 'var(--card-bg, #0F172A)' }}
      >
        {locked ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="text-sm font-bold font-mono" style={{ color }}>{score}%</span>
        )}
      </div>
    </div>
  )
}

export default function RoleUnlockCard({ role, matchScore, missingSkills, salaryRange, growthTrend, category, index = 0 }) {
  const navigate = useNavigate()
  const completedSkills = useJourneyStore((s) => s.completedSkills)

  const learnedMissing = missingSkills.filter((s) => completedSkills.includes(s))
  const remaining = missingSkills.filter((s) => !completedSkills.includes(s))
  const progress = missingSkills.length > 0 ? learnedMissing.length / missingSkills.length : 1
  const isUnlocked = remaining.length === 0
  const isInProgress = learnedMissing.length > 0 && remaining.length > 0

  const categoryColors = {
    'AI/ML': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Engineering': 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30',
    'Data': 'bg-neon-green/10 text-neon-green border-neon-green/30',
    'Infrastructure': 'bg-neon-orange/10 text-neon-orange border-neon-orange/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isUnlocked ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={isUnlocked ? () => navigate('/roadmap') : undefined}
      className={`glass-card-premium neon-border p-5 relative overflow-hidden ${
        isUnlocked ? 'cursor-pointer' : ''
      } ${!isUnlocked && !isInProgress ? 'opacity-60' : ''}`}
    >
      {/* Unlock status badge */}
      {isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/30"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-neon-green">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] font-bold text-neon-green uppercase tracking-wider">Job Ready</span>
        </motion.div>
      )}

      <div className="flex items-start gap-4 mb-3">
        <ScoreRing score={matchScore} size={52} locked={!isUnlocked && !isInProgress} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold mb-1 ${isUnlocked ? 'theme-text' : 'theme-text-tertiary'}`}>
            {role}
          </h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${categoryColors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
            {category}
          </span>
        </div>
      </div>

      {/* Salary & Growth */}
      <div className="flex items-center justify-between text-[11px] theme-text-tertiary mb-3">
        <span>${(salaryRange[0] / 1000).toFixed(0)}k &ndash; ${(salaryRange[1] / 1000).toFixed(0)}k</span>
        <span className={`font-medium ${growthTrend > 0 ? 'text-neon-green' : 'text-neon-orange'}`}>
          {growthTrend > 0 ? '\u2191' : '\u2193'}{(Math.abs(growthTrend) * 100).toFixed(0)}% growth
        </span>
      </div>

      {/* Progress bar for in-progress */}
      {isInProgress && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] theme-text-muted mb-1">
            <span>{learnedMissing.length}/{missingSkills.length} skills learned</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-quaternary)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #38BDF8, #34D399)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Missing skills (locked state) */}
      {remaining.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-wider theme-text-muted mb-1.5">
            {isInProgress ? 'Remaining skills' : `Learn ${remaining.length} skill${remaining.length !== 1 ? 's' : ''} to unlock`}
          </p>
          <div className="flex flex-wrap gap-1">
            {remaining.map((skill) => (
              <span
                key={skill}
                className="px-1.5 py-0.5 rounded text-[10px] border border-[var(--border-default)] theme-text-muted"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job links for unlocked roles */}
      {isUnlocked && (
        <div onClick={(e) => e.stopPropagation()} className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
          <JobLinks role={role} />
        </div>
      )}
    </motion.div>
  )
}
