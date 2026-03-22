/**
 * RoadmapTimeline — Phase-based career timeline (renders above existing Roadmap)
 * Transforms existing quarterly roadmap into 4 phases client-side.
 * === NEW: Roadmap timeline component (delete file to remove) ===
 */
import { motion, useInView } from 'framer-motion'
import { useRef, useMemo } from 'react'

const PHASE_CONFIG = [
  { label: 'Foundation Gaps', tag: 'Current', color: '#ff2d7c', quarter: 'Q1' },
  { label: 'Core Competencies', tag: 'Q2', color: '#ff6a00', quarter: 'Q2' },
  { label: 'Advanced Skills', tag: 'Q3', color: '#b44aff', quarter: 'Q3' },
  { label: 'Career Ready', tag: 'Q4', color: '#39ff14', quarter: 'Q4' },
]

function PhaseCard({ phase, items, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ y: 30, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="relative pl-10 pb-6"
    >
      {/* Circle marker */}
      <motion.div
        className="absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
        style={{ borderColor: phase.color, color: phase.color, backgroundColor: `${phase.color}15` }}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.2 }}
      >
        {index + 1}
      </motion.div>

      <div className="glass-card-premium rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-semibold theme-text">{phase.label}</h4>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
          >
            {phase.tag}
          </span>
          <span className="text-[10px] theme-text-muted ml-auto">~3 months</span>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {items.map((item, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-lg border ${
                  item.priority === 'high'
                    ? 'border-neon-pink/30 bg-neon-pink/8 text-neon-pink'
                    : 'border-neon-cyan/30 bg-neon-cyan/8 text-neon-cyan'
                }`}
              >
                {item.skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs theme-text-muted italic">Complete earlier phases first</p>
        )}

        {items.length > 0 && items[0].milestone && (
          <p className="text-[11px] theme-text-muted mt-2">
            Milestone: {items[0].milestone}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function ThisWeekFocus({ items }) {
  const topItems = items.slice(0, 3)
  if (topItems.length === 0) return null

  return (
    <div
      className="sticky top-20 rounded-xl p-4 border"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-default)',
      }}
    >
      <h4 className="text-xs font-bold uppercase tracking-wider text-neon-cyan mb-3">
        This Week&apos;s Focus
      </h4>
      <div className="space-y-2">
        {topItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-neon-cyan/10 text-neon-cyan text-[10px] font-bold flex-shrink-0">
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium theme-text truncate">{item.skill}</p>
              <p className="text-[10px] theme-text-muted truncate">{item.milestone}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function RoadmapTimeline({ roadmap }) {
  if (!roadmap?.length) return null

  // Group roadmap items by quarter
  const phases = useMemo(() => {
    const grouped = { Q1: [], Q2: [], Q3: [], Q4: [] }
    for (const item of roadmap) {
      const q = item.quarter || 'Q1'
      if (grouped[q]) grouped[q].push(item)
    }
    return PHASE_CONFIG.map((phase, i) => ({
      ...phase,
      items: grouped[phase.quarter] || [],
    }))
  }, [roadmap])

  const q1Items = phases[0]?.items || []

  // Completion: items with milestones marked done vs total
  const totalItems = roadmap.length
  const completionPct = 0 // Fresh — 0% complete (user hasn't started)

  return (
    <div>
      {/* Completion progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium theme-text-tertiary">Roadmap Progress</span>
          <span className="text-xs font-mono text-neon-cyan">{completionPct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-quaternary)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00f0ff, #39ff14)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-neon-pink via-neon-purple to-neon-green" />

          {phases.map((phase, i) => (
            <PhaseCard key={phase.quarter} phase={phase} items={phase.items} index={i} />
          ))}
        </div>

        {/* This Week's Focus sidebar */}
        <div className="hidden lg:block">
          <ThisWeekFocus items={q1Items} />
        </div>
      </div>
    </div>
  )
}
