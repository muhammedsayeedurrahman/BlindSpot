import { motion, AnimatePresence } from 'framer-motion'
import useJourneyStore from '../store/useJourneyStore'

const PATH_STYLES = {
  upgrade: {
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.3)',
    label: 'Upgrade',
    description: 'Deepen your expertise in this skill',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
      </svg>
    ),
  },
  expand: {
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.08)',
    border: 'rgba(56, 189, 248, 0.3)',
    label: 'Expand',
    description: 'Branch into related tools and technologies',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 0l1.062 1.06A.75.75 0 116.11 5.173L5.05 4.11a.75.75 0 010-1.06zm9.9 0a.75.75 0 010 1.06l-1.06 1.062a.75.75 0 01-1.062-1.061l1.061-1.06a.75.75 0 011.06 0zM10 7a3 3 0 100 6 3 3 0 000-6zm-6.25 2.25a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zm12.5 0a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM6.11 14.827a.75.75 0 10-1.06 1.06l1.06 1.062a.75.75 0 001.06-1.061l-1.06-1.06zm7.78 0a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.062l-1.06-1.061a.75.75 0 010-1.061zM10 16a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 16z" />
      </svg>
    ),
  },
  career: {
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.08)',
    border: 'rgba(167, 139, 250, 0.3)',
    label: 'Career Pivot',
    description: 'Transform this skill into a new career direction',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.312.312a7 7 0 0011.712-3.138.75.75 0 00-1.06-.18zm-1.024-7.848a.75.75 0 00-1.06.18A5.5 5.5 0 014.688 8.576l.312.311H2.567a.75.75 0 000 1.5h3.634a.75.75 0 00.75-.75V6.003a.75.75 0 00-1.5 0v2.033l-.312-.312A7 7 0 0116.85 10.86a.75.75 0 001.06.18.75.75 0 00.18-1.06 7.001 7.001 0 00-3.802-6.404z" clipRule="evenodd" />
      </svg>
    ),
  },
}

function PathOption({ path, isSelected, onSelect }) {
  const style = PATH_STYLES[path.type] || PATH_STYLES.upgrade

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="flex-1 min-w-[140px] p-3 rounded-xl border text-left transition-all relative overflow-hidden"
      style={{
        borderColor: isSelected ? style.color : style.border,
        backgroundColor: isSelected ? style.bg : 'transparent',
        boxShadow: isSelected ? `0 0 20px ${style.color}15` : 'none',
      }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: style.color }}
        >
          <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}

      <div className="flex items-center gap-2 mb-2" style={{ color: style.color }}>
        {style.icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{style.label}</span>
      </div>

      <p className="text-sm font-semibold theme-text mb-2">{path.label}</p>

      <div className="flex flex-wrap gap-1 mb-2">
        {path.skills.slice(0, 3).map((s) => (
          <span
            key={s}
            className="px-1.5 py-0.5 rounded text-[10px] border"
            style={{ borderColor: `${style.color}30`, color: style.color }}
          >
            {s}
          </span>
        ))}
        {path.skills.length > 3 && (
          <span className="text-[10px] theme-text-muted">+{path.skills.length - 3}</span>
        )}
      </div>

      <p className="text-[10px] theme-text-muted">{path.months} months</p>
    </motion.button>
  )
}

function SelectedPathDetail({ skill, path, onStartQuiz }) {
  const style = PATH_STYLES[path.type] || PATH_STYLES.upgrade
  const completedSkills = useJourneyStore((s) => s.completedSkills)
  const quizScores = useJourneyStore((s) => s.quizScores)

  const learnedCount = path.skills.filter((s) => completedSkills.includes(s)).length
  const progress = path.skills.length > 0 ? learnedCount / path.skills.length : 0
  const allDone = learnedCount === path.skills.length

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-4 pt-4 border-t" style={{ borderColor: `${style.color}20` }}>
        {/* Path description */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: style.bg, color: style.color }}>
            {style.icon}
          </div>
          <div>
            <p className="text-xs font-semibold theme-text">{path.label}</p>
            <p className="text-[10px] theme-text-muted">{style.description}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] theme-text-muted mb-1">
            <span>{learnedCount}/{path.skills.length} skills verified</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-quaternary)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: style.color }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Skills checklist */}
        <div className="space-y-1.5 mb-4">
          {path.skills.map((s, i) => {
            const isCompleted = completedSkills.includes(s)
            const score = quizScores[s]
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center justify-between py-1.5 px-2.5 rounded-lg"
                style={{ backgroundColor: isCompleted ? `${style.color}08` : 'var(--bg-tertiary)' }}
              >
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: style.color }}>
                      <svg viewBox="0 0 20 20" fill="white" className="w-2.5 h-2.5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border" style={{ borderColor: `${style.color}40` }} />
                  )}
                  <span className={`text-xs ${isCompleted ? 'theme-text line-through opacity-60' : 'theme-text-secondary'}`}>
                    {s}
                  </span>
                </div>
                {score && (
                  <span className="text-[10px] font-mono" style={{ color: score.score >= 70 ? '#34D399' : '#FB923C' }}>
                    {score.score.toFixed(0)}%
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-3 mb-4 px-2.5">
          <div className="flex items-center gap-1.5 text-[10px] theme-text-muted">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
            <span>{path.months} months estimated</span>
          </div>
          {path.role && (
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: style.color }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Target: {path.role}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {!allDone ? (
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: `0 8px 24px ${style.color}25` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onStartQuiz(skill, path)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${style.color}, ${style.color}CC)` }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Verify Skills ({learnedCount}/{path.skills.length} done)
            </motion.button>
          ) : (
            <div className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2"
              style={{ backgroundColor: `${style.color}15`, color: style.color }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              All skills verified — Path complete!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function SkillEvolutionCard({ skill, paths, delay = 0, onStartQuiz }) {
  const evolutionChoices = useJourneyStore((s) => s.evolutionChoices)
  const setEvolutionChoice = useJourneyStore((s) => s.setEvolutionChoice)

  const selectedPath = evolutionChoices[skill] || null
  const selectedType = selectedPath?.type || null

  if (!paths || paths.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium neon-border p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-neon-orange/10 text-neon-orange border border-neon-orange/30">
          At Risk
        </span>
        <h3 className="text-sm font-semibold theme-text">{skill}</h3>
      </div>

      <p className="text-xs theme-text-muted mb-3">
        {selectedType ? 'You chose a path — verify your skills to progress:' : 'Choose how to evolve this skill:'}
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        {paths.map((path) => (
          <PathOption
            key={path.type}
            path={path}
            isSelected={selectedType === path.type}
            onSelect={() => setEvolutionChoice(skill, path)}
          />
        ))}
      </div>

      {/* Expanded detail after selection */}
      <AnimatePresence>
        {selectedPath && (
          <SelectedPathDetail
            skill={skill}
            path={selectedPath}
            onStartQuiz={onStartQuiz || (() => {})}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
