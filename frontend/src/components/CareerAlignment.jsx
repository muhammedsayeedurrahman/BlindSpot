import { motion } from 'framer-motion'

function scoreColor(score) {
  if (score >= 60) return { ring: '#34D399', text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30' }
  if (score >= 40) return { ring: '#38BDF8', text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/30' }
  return { ring: '#FB923C', text: 'text-neon-orange', bg: 'bg-neon-orange/10', border: 'border-neon-orange/30' }
}

function ScoreRing({ score, size = 56 }) {
  const { ring } = scoreColor(score)
  const pct = Math.min(score, 100)
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${ring} ${pct * 3.6}deg, rgba(255,255,255,0.06) ${pct * 3.6}deg)`,
        padding: 3,
      }}
    >
      <div className="rounded-full w-full h-full flex items-center justify-center"
        style={{ background: 'var(--card-bg, #0F172A)' }}
      >
        <span className="text-sm font-bold font-mono" style={{ color: ring }}>{score}%</span>
      </div>
    </div>
  )
}

function GrowthArrow({ trend }) {
  const isPositive = trend > 0
  return (
    <span className={`text-[11px] font-medium ${isPositive ? 'text-neon-green' : 'text-neon-orange'}`}>
      {isPositive ? '\u2191' : '\u2193'}{(Math.abs(trend) * 100).toFixed(0)}%
    </span>
  )
}

function HeroCard({ item, delay }) {
  const colors = scoreColor(item.match_score)
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-card-premium neon-border relative overflow-hidden p-6 md:p-8`}
    >
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 30%, ${colors.ring}12, transparent 60%)` }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5">
        <ScoreRing score={item.match_score} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors.text} ${colors.bg} ${colors.border} border`}>
              Best Match
            </span>
            <span className="text-[10px] theme-text-muted">{item.category}</span>
          </div>
          <h3 className="text-xl font-bold theme-text mb-2">{item.role}</h3>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs theme-text-tertiary mb-3">
            <span>${(item.salary_range[0] / 1000).toFixed(0)}k – ${(item.salary_range[1] / 1000).toFixed(0)}k</span>
            <span className="flex items-center gap-1">Growth <GrowthArrow trend={item.growth_trend} /></span>
            <span>Auto. risk {(item.automation_exposure * 100).toFixed(0)}%</span>
          </div>

          {item.missing_skills.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider theme-text-muted mb-1.5">Skills to learn</p>
              <div className="flex flex-wrap gap-1.5">
                {item.missing_skills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 rounded text-[11px] border border-[var(--border-default)] theme-text-secondary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CompactCard({ item, index, delay }) {
  const colors = scoreColor(item.match_score)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium neon-border p-4"
    >
      <div className="flex items-center gap-3">
        <ScoreRing score={item.match_score} size={48} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold theme-text truncate">{item.role}</p>
          <p className="text-[10px] theme-text-muted">{item.category}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] theme-text-tertiary">
        <span>${(item.salary_range[0] / 1000).toFixed(0)}k–${(item.salary_range[1] / 1000).toFixed(0)}k</span>
        <span className="flex items-center gap-1">
          <GrowthArrow trend={item.growth_trend} />
        </span>
        <span>{item.missing_count} skill{item.missing_count !== 1 ? 's' : ''} gap</span>
      </div>
    </motion.div>
  )
}

export default function CareerAlignment({ alignments }) {
  if (!alignments || alignments.length === 0) return null

  const [hero, ...rest] = alignments
  const baseDelay = 0.1

  return (
    <div className="space-y-4">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: baseDelay, duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-neon-cyan">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" strokeLinecap="round" />
            <path d="M2 12h20" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold theme-text">Career Alignment</h2>
          <p className="text-xs theme-text-muted">Where your skills fit in the future job market</p>
        </div>
      </motion.div>

      {/* Hero — top match full width */}
      <HeroCard item={hero} delay={baseDelay + 0.08} />

      {/* Grid — cards 2-5 */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rest.map((item, i) => (
            <CompactCard
              key={item.role}
              item={item}
              index={i + 1}
              delay={baseDelay + 0.16 + i * 0.08}
            />
          ))}
        </div>
      )}
    </div>
  )
}
