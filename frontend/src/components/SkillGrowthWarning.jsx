import { motion } from 'framer-motion'

export default function SkillGrowthWarning({ skill, alignments }) {
  if (!alignments || alignments.length < 3) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium p-4 border border-neon-orange/30"
      style={{ boxShadow: '0 0 20px rgba(251, 146, 60, 0.06)' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-neon-orange/10 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neon-orange">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neon-orange mb-1">
            {skill} is limiting {alignments.length} careers
          </p>
          <p className="text-xs theme-text-muted mb-2">
            This skill appears as a missing requirement for multiple career paths. Upgrading it would unlock the most opportunities.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {alignments.map((a) => (
              <span
                key={a.role}
                className="px-2 py-0.5 rounded text-[10px] border border-neon-orange/20 text-neon-orange/80"
              >
                {a.role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
