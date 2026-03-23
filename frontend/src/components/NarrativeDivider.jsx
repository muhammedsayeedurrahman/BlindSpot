import { motion } from 'framer-motion'

export default function NarrativeDivider({ label, delay = 0 }) {
  return (
    <motion.div
      className="flex items-center gap-4 py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex-1 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(var(--neon-cyan-rgb), 0.15), transparent)',
      }} />
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] theme-text-muted whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(var(--neon-cyan-rgb), 0.15), transparent)',
      }} />
    </motion.div>
  )
}
