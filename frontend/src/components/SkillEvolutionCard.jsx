import { motion } from 'framer-motion'
import useJourneyStore from '../store/useJourneyStore'

const PATH_STYLES = {
  upgrade: {
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.3)',
    label: 'Upgrade',
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

export default function SkillEvolutionCard({ skill, paths, delay = 0 }) {
  const evolutionChoices = useJourneyStore((s) => s.evolutionChoices)
  const setEvolutionChoice = useJourneyStore((s) => s.setEvolutionChoice)

  const selectedType = evolutionChoices[skill]?.type || null

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

      <p className="text-xs theme-text-muted mb-3">Choose how to evolve this skill:</p>

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
    </motion.div>
  )
}
