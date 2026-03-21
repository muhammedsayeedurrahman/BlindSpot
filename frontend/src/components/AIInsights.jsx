import { motion } from 'framer-motion'

const ICON_MAP = {
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.2" />
    </svg>
  ),
}

const CARD_COLORS = [
  { border: 'border-neon-cyan/20', glow: 'shadow-neon-cyan/5', icon: 'text-neon-cyan' },
  { border: 'border-neon-purple/20', glow: 'shadow-neon-purple/5', icon: 'text-neon-purple' },
  { border: 'border-neon-green/20', glow: 'shadow-neon-green/5', icon: 'text-neon-green' },
  { border: 'border-neon-orange/20', glow: 'shadow-neon-orange/5', icon: 'text-neon-orange' },
]

function InsightCard({ insight, index }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const icon = ICON_MAP[insight.icon] || ICON_MAP.compass

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
      className={`glass-card p-5 border ${color.border} hover:shadow-lg ${color.glow} transition-shadow`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color.icon}`} style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold theme-text pt-1">{insight.title}</h3>
      </div>
      <p className="text-xs theme-text-tertiary leading-relaxed">{insight.text}</p>
    </motion.div>
  )
}

export default function AIInsights({ data }) {
  if (!data || !data.insights || data.insights.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            data.source === 'ai'
              ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
              : 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30'
          }`}
        >
          {data.source === 'ai' ? 'AI-Powered' : 'Analysis-Based'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.insights.map((insight, i) => (
          <InsightCard key={insight.key} insight={insight} index={i} />
        ))}
      </div>
    </div>
  )
}
