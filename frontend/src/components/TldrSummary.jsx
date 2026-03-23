import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

function ExpandableDetail({ children, isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-2 ml-9 space-y-1.5">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DetailRow({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="theme-text-muted">{label}:</span>
      <span className={`font-medium ${color || 'theme-text-secondary'}`}>{value}</span>
    </div>
  )
}

function SkillDetailCard({ skill }) {
  const riskPercent = ((skill.automation_risk || 0) * 100).toFixed(0)
  const halfLife = skill.half_life_years?.toFixed(1)
  const trendLabel =
    skill.demand_trend === 'declining' ? 'Declining' :
    skill.demand_trend === 'stable' ? 'Stable' : 'Growing'
  const trendColor =
    skill.demand_trend === 'declining' ? 'text-neon-pink' :
    skill.demand_trend === 'stable' ? 'text-neon-orange' : 'text-neon-green'

  return (
    <div className="glass-card p-2.5 rounded-lg">
      <p className="text-xs font-semibold theme-text mb-1">{skill.skill}</p>
      <div className="grid grid-cols-3 gap-1">
        <DetailRow label="Risk" value={`${riskPercent}%`} color="text-neon-pink" />
        <DetailRow label="Half-life" value={`${halfLife}y`} color={halfLife < 2 ? 'text-neon-pink' : 'text-neon-orange'} />
        <DetailRow label="Trend" value={trendLabel} color={trendColor} />
      </div>
    </div>
  )
}

export default function TldrSummary({ bsi, survival, twin, illusion }) {
  const [expanded, setExpanded] = useState(null)

  const criticalSkills = survival.filter((s) => s.status === 'critical')
  const atRiskSkills = survival.filter((s) => s.status === 'at_risk')
  const topIllusions = illusion.filter((s) => s.illusion_score > 15)
  const topIllusion = topIllusions[0]
  const optimizedRole = twin?.optimized_path?.role
  const recommendedSkills = twin?.recommended_skills || []
  const currentSalary = twin?.current_path?.salary_projection?.at(-1)?.salary || 0
  const optimizedSalary = twin?.optimized_path?.salary_projection?.at(-1)?.salary || 0
  const salaryUplift = optimizedSalary - currentSalary
  const components = bsi.components || {}

  const bsiBullet = bsi.level === 'critical'
    ? { id: 'bsi', icon: '!', color: 'text-neon-pink', bg: 'bg-neon-pink/10', text: `Critical BSI score of ${bsi.score.toFixed(0)} — significant career blind spots detected` }
    : bsi.level === 'warning'
      ? { id: 'bsi', icon: '!', color: 'text-neon-orange', bg: 'bg-neon-orange/10', text: `BSI score ${bsi.score.toFixed(0)} — notable blind spots need attention` }
      : { id: 'bsi', icon: '\u2713', color: 'text-neon-green', bg: 'bg-neon-green/10', text: `BSI score ${bsi.score.toFixed(0)} — your career foundation is solid` }

  const allAtRisk = [...criticalSkills, ...atRiskSkills]
  const skillBullet = criticalSkills.length > 0
    ? { id: 'skills', icon: '\u2193', color: 'text-neon-pink', bg: 'bg-neon-pink/10', text: `${criticalSkills.map((s) => s.skill).join(', ')} ${criticalSkills.length === 1 ? 'is' : 'are'} in critical decay (<2 years of relevance)` }
    : atRiskSkills.length > 0
      ? { id: 'skills', icon: '\u2193', color: 'text-neon-orange', bg: 'bg-neon-orange/10', text: `${atRiskSkills.length} skill${atRiskSkills.length > 1 ? 's' : ''} at risk: ${atRiskSkills.slice(0, 3).map((s) => s.skill).join(', ')}` }
      : null

  const illusionBullet = topIllusion
    ? { id: 'illusion', icon: '?', color: 'text-neon-purple', bg: 'bg-neon-purple/10', text: `Confidence in ${topIllusion.skill} exceeds market reality by ${topIllusion.illusion_score.toFixed(0)} points` }
    : null

  const salaryBullet = optimizedRole && salaryUplift > 0
    ? { id: 'salary', icon: '\u2191', color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', text: `Upskilling toward ${optimizedRole} could unlock +$${(salaryUplift / 1000).toFixed(0)}k in annual salary` }
    : null

  const bullets = [bsiBullet, skillBullet, illusionBullet, salaryBullet].filter(Boolean)

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id))

  return (
    <motion.div {...fadeUp(0.04)} className="glass-card-premium neon-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neon-cyan">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold theme-text">TL;DR</h2>
          <p className="text-xs theme-text-muted">Key findings at a glance — click to expand</p>
        </div>
      </div>
      <div className="space-y-2">
        {bullets.map((b, i) => (
          <div key={b.id}>
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-start gap-3 w-full text-left group cursor-pointer rounded-lg p-1.5 -m-1.5 hover:bg-white/5 transition-colors"
              onClick={() => toggle(b.id)}
            >
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${b.color} ${b.bg}`}>
                {b.icon}
              </span>
              <p className="text-sm theme-text-secondary leading-relaxed flex-1">{b.text}</p>
              <span className={`text-xs theme-text-muted transition-transform flex-shrink-0 mt-0.5 ${expanded === b.id ? 'rotate-180' : ''}`}>
                &#9662;
              </span>
            </motion.button>

            {/* BSI breakdown */}
            {b.id === 'bsi' && (
              <ExpandableDetail isOpen={expanded === 'bsi'}>
                <p className="text-xs font-medium theme-text-muted mb-1.5">Score breakdown:</p>
                {Object.entries(components).map(([key, val]) => {
                  const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                  const barColor = val > 60 ? 'bg-neon-pink' : val > 35 ? 'bg-neon-orange' : 'bg-neon-green'
                  return (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className="w-28 theme-text-muted truncate">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(val, 100)}%` }} />
                      </div>
                      <span className="w-8 text-right theme-text-secondary">{val.toFixed(0)}</span>
                    </div>
                  )
                })}
              </ExpandableDetail>
            )}

            {/* Skills at risk — details + remediation */}
            {b.id === 'skills' && (
              <ExpandableDetail isOpen={expanded === 'skills'}>
                <p className="text-xs font-medium theme-text-muted mb-1.5">Your skills at risk:</p>
                <div className="space-y-1.5">
                  {allAtRisk.map((s) => (
                    <SkillDetailCard key={s.skill} skill={s} />
                  ))}
                </div>
                {recommendedSkills.length > 0 && (
                  <div className="mt-3 glass-card p-2.5 rounded-lg border border-neon-green/20">
                    <p className="text-xs font-semibold text-neon-green mb-1">How to fix this:</p>
                    <ul className="space-y-1">
                      {recommendedSkills.slice(0, 3).map((r) => (
                        <li key={r.skill} className="text-xs theme-text-secondary flex items-start gap-1.5">
                          <span className="text-neon-green mt-0.5">+</span>
                          <span>
                            Learn <strong className="theme-text">{r.skill}</strong>
                            {r.growth_rate ? ` (${(r.growth_rate * 100).toFixed(0)}% growth)` : ''}
                            {r.demand_2027 ? ` — projected demand: ${(r.demand_2027 * 100).toFixed(0)}%` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </ExpandableDetail>
            )}

            {/* Illusion details */}
            {b.id === 'illusion' && (
              <ExpandableDetail isOpen={expanded === 'illusion'}>
                <p className="text-xs font-medium theme-text-muted mb-1.5">Confidence vs reality:</p>
                {topIllusions.map((s) => (
                  <div key={s.skill} className="glass-card p-2.5 rounded-lg">
                    <p className="text-xs font-semibold theme-text mb-1">{s.skill}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <DetailRow label="Your confidence" value={`${s.confidence}/10`} color="text-neon-purple" />
                      <DetailRow label="Market reality" value={`${s.market_relevance?.toFixed(0)}%`} color="text-neon-orange" />
                      <DetailRow label="Gap" value={`${s.illusion_score.toFixed(0)}pts`} color="text-neon-pink" />
                    </div>
                    {s.warning && <p className="text-xs theme-text-muted mt-1 italic">{s.warning}</p>}
                  </div>
                ))}
              </ExpandableDetail>
            )}

            {/* Salary uplift details */}
            {b.id === 'salary' && (
              <ExpandableDetail isOpen={expanded === 'salary'}>
                <div className="glass-card p-2.5 rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div>
                      <p className="theme-text-muted">Current path</p>
                      <p className="font-semibold theme-text">{twin?.current_path?.role || 'Current Role'}</p>
                      <p className="text-neon-orange">${(currentSalary / 1000).toFixed(0)}k/yr</p>
                    </div>
                    <span className="text-neon-cyan font-bold text-lg px-3">&rarr;</span>
                    <div className="text-right">
                      <p className="theme-text-muted">Optimized path</p>
                      <p className="font-semibold theme-text">{optimizedRole}</p>
                      <p className="text-neon-green">${(optimizedSalary / 1000).toFixed(0)}k/yr</p>
                    </div>
                  </div>
                  {recommendedSkills.length > 0 && (
                    <p className="text-xs theme-text-muted">
                      Key skills needed: {recommendedSkills.slice(0, 3).map((r) => r.skill).join(', ')}
                    </p>
                  )}
                </div>
              </ExpandableDetail>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
