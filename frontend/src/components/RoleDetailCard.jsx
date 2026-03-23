import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useJourneyStore from '../store/useJourneyStore'
import JobLinks from './JobLinks'

const CATEGORY_COLORS = {
  'AI/ML': { bg: 'rgba(168,85,247,0.10)', text: '#A855F7', border: 'rgba(168,85,247,0.30)' },
  'Engineering': { bg: 'rgba(56,189,248,0.10)', text: '#38BDF8', border: 'rgba(56,189,248,0.30)' },
  'Data': { bg: 'rgba(52,211,153,0.10)', text: '#34D399', border: 'rgba(52,211,153,0.30)' },
  'Infrastructure': { bg: 'rgba(251,146,60,0.10)', text: '#FB923C', border: 'rgba(251,146,60,0.30)' },
}

const DEFAULT_CAT = { bg: 'rgba(100,116,139,0.10)', text: '#94A3B8', border: 'rgba(100,116,139,0.30)' }

function ScoreRing({ score, size = 56 }) {
  const color = score >= 60 ? '#34D399' : score >= 40 ? '#38BDF8' : '#FB923C'
  const pct = Math.min(score, 100)
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.06) ${pct * 3.6}deg)`,
        padding: 3,
      }}
    >
      <div
        className="rounded-full w-full h-full flex items-center justify-center"
        style={{ background: 'var(--card-bg, #0F172A)' }}
      >
        <span className="text-sm font-bold font-mono" style={{ color }}>{score}%</span>
      </div>
    </div>
  )
}

function AutomationRiskBar({ risk }) {
  const pct = Math.round(risk * 100)
  const color = pct >= 60 ? '#FB7185' : pct >= 30 ? '#FBBF24' : '#34D399'
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] theme-text-muted whitespace-nowrap">Automation</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-quaternary)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{pct}%</span>
    </div>
  )
}

function SkeletonBlock() {
  return (
    <div className="space-y-3 mt-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
        >
          <div className="h-3 rounded-full mb-2" style={{ backgroundColor: 'var(--bg-quaternary)', width: i === 0 ? '90%' : i === 1 ? '75%' : '60%' }} />
        </motion.div>
      ))}
    </div>
  )
}

function DetailSection({ icon, label, children, color = '#38BDF8' }) {
  return (
    <div className="flex gap-3 py-2">
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
        style={{ backgroundColor: `${color}15` }}
      >
        <span style={{ color }} className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color }}>{label}</p>
        <p className="text-sm theme-text-secondary leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

export default function RoleDetailCard({
  role,
  matchScore,
  missingSkills,
  salaryRange,
  growthTrend,
  category,
  automationRisk,
  index = 0,
  details = null,
  isLoadingDetails = false,
  onExpand,
  defaultExpanded = false,
  isHero = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const completedSkills = useJourneyStore((s) => s.completedSkills)

  const learnedMissing = missingSkills.filter((s) => completedSkills.includes(s))
  const remaining = missingSkills.filter((s) => !completedSkills.includes(s))
  const progress = missingSkills.length > 0 ? learnedMissing.length / missingSkills.length : 1
  const isUnlocked = remaining.length === 0

  const catStyle = CATEGORY_COLORS[category] || DEFAULT_CAT

  const handleClick = () => {
    const nextExpanded = !expanded
    setExpanded(nextExpanded)
    if (nextExpanded && onExpand) {
      onExpand(role)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-card-premium neon-border overflow-hidden cursor-pointer transition-shadow duration-300 ${
        isHero ? 'col-span-full' : ''
      } ${expanded ? 'ring-1' : ''}`}
      style={expanded ? { ringColor: catStyle.border } : undefined}
      onClick={handleClick}
      layout
    >
      <div className="p-5">
        {/* Compact state — always visible */}
        <div className="flex items-start gap-4">
          <ScoreRing score={matchScore} size={isHero ? 64 : 52} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className={`font-semibold theme-text ${isHero ? 'text-lg' : 'text-base'}`}>{role}</h3>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                style={{ backgroundColor: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}
              >
                {category}
              </span>
              {isUnlocked && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neon-green/10 text-neon-green border border-neon-green/30 flex items-center gap-1">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Ready
                </span>
              )}
            </div>

            {/* Salary & Growth row */}
            <div className="flex items-center gap-3 text-[11px] theme-text-tertiary">
              <span>${(salaryRange[0] / 1000).toFixed(0)}k &ndash; ${(salaryRange[1] / 1000).toFixed(0)}k</span>
              <span className={`font-medium ${growthTrend > 0 ? 'text-neon-green' : 'text-neon-orange'}`}>
                {growthTrend > 0 ? '\u2191' : '\u2193'}{(Math.abs(growthTrend) * 100).toFixed(0)}% growth
              </span>
            </div>
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 mt-2"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 theme-text-muted">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </div>

        {/* Automation risk bar */}
        {automationRisk != null && (
          <div className="mt-3">
            <AutomationRiskBar risk={automationRisk} />
          </div>
        )}

        {/* Missing skills count (compact) */}
        {!expanded && remaining.length > 0 && (
          <div className="mt-3 text-[11px] theme-text-muted">
            {remaining.length} skill{remaining.length !== 1 ? 's' : ''} to unlock &middot; Tap to explore
          </div>
        )}

        {/* Progress bar for in-progress */}
        {learnedMissing.length > 0 && remaining.length > 0 && (
          <div className="mt-3">
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

        {/* Expanded state */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-t border-[var(--border-subtle)] mt-4 pt-4 space-y-1">
                {/* AI-generated sections */}
                {isLoadingDetails && !details && <SkeletonBlock />}

                {details && (
                  <>
                    <DetailSection icon="📋" label="What You'll Do" color="#38BDF8">
                      {details.description}
                    </DetailSection>

                    <DetailSection icon="🚀" label="Why This Is Exciting" color="#A78BFA">
                      {details.excitement}
                    </DetailSection>

                    <DetailSection icon="🧠" label="Who Thrives Here" color="#34D399">
                      {details.personality_fit}
                    </DetailSection>
                  </>
                )}

                {/* Missing skills with full detail */}
                {remaining.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold theme-text-muted mb-2">
                      Skills to Unlock ({remaining.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {remaining.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 rounded-lg text-[11px] border border-[var(--border-default)] theme-text-muted"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learned skills */}
                {learnedMissing.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neon-green mb-2">
                      Skills Completed ({learnedMissing.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {learnedMissing.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border border-neon-green/30 bg-neon-green/10 text-neon-green"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job links */}
                <div className="pt-3 mt-1 border-t border-[var(--border-subtle)]">
                  <p className="text-[10px] uppercase tracking-wider font-bold mb-2 pt-3" style={{ color: '#22D3EE' }}>
                    Find Jobs
                  </p>
                  <JobLinks role={role} category={category} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
