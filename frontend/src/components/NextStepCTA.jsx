import { motion } from 'framer-motion'

export default function NextStepCTA({ twin, survival, delay = 0 }) {
  const topSkill = twin?.recommended_skills?.[0]
  const criticalSkills = survival.filter((s) => s.status === 'critical')
  const optimizedRole = twin?.optimized_path?.role
  const currentSalary = twin?.current_path?.salary_projection?.at(-1)?.salary || 0
  const optimizedSalary = twin?.optimized_path?.salary_projection?.at(-1)?.salary || 0
  const salaryDelta = optimizedSalary - currentSalary

  if (!topSkill) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium neon-border relative overflow-hidden"
    >
      {/* Accent gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 80% 50%, rgba(52,211,153,0.08), transparent 60%)',
        }}
      />

      <div className="relative z-10 p-8 md:p-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-neon-green">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-neon-green">What Should I Do Next?</span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold theme-text mb-2">
          Start learning <span className="text-neon-green">{topSkill.skill}</span> this quarter
        </h3>
        <p className="text-sm theme-text-tertiary leading-relaxed mb-6 max-w-xl">
          {topSkill.skill} is the highest-impact skill for your career trajectory.
          {optimizedRole && ` It's essential for transitioning to ${optimizedRole}`}
          {salaryDelta > 0 && `, which could unlock +$${(salaryDelta / 1000).toFixed(0)}k in annual salary`}.
          {criticalSkills.length > 0 && ` Meanwhile, ${criticalSkills.map((s) => s.skill).join(', ')} ${criticalSkills.length === 1 ? 'needs' : 'need'} urgent attention.`}
        </p>

        <div className="flex flex-wrap gap-3">
          {(twin?.recommended_skills ?? []).slice(0, 4).map((skill, i) => (
            <motion.span
              key={skill.skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.1 + i * 0.08 }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                i === 0
                  ? 'bg-neon-green/10 text-neon-green border-neon-green/30'
                  : 'theme-text-tertiary border-[var(--border-default)]'
              }`}
            >
              {skill.priority === 'high' && <span className="mr-1">!</span>}
              {skill.skill}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
