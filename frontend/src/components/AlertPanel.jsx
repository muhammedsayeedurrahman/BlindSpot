import { motion } from 'framer-motion'

export default function AlertPanel({ bsi, illusions, survival }) {
  const alerts = []

  // BSI level alert
  if (bsi.level === 'critical') {
    alerts.push({
      type: 'critical',
      message: `BlindSpot Index is ${bsi.score.toFixed(1)} — ${bsi.message}`,
    })
  } else if (bsi.level === 'warning') {
    alerts.push({
      type: 'warning',
      message: `BlindSpot Index is ${bsi.score.toFixed(1)} — ${bsi.message}`,
    })
  }

  // Critical skills
  const criticalSkills = survival.filter((s) => s.status === 'critical')
  if (criticalSkills.length > 0) {
    alerts.push({
      type: 'critical',
      message: `${criticalSkills.map((s) => s.skill).join(', ')} ${
        criticalSkills.length > 1 ? 'have' : 'has'
      } critical half-life (< 2 years)`,
    })
  }

  // Illusion warnings
  const illusionWarnings = illusions.filter((i) => i.illusion_score > 15)
  if (illusionWarnings.length > 0) {
    alerts.push({
      type: 'warning',
      message: `Competence illusion detected in ${illusionWarnings
        .map((i) => i.skill)
        .join(', ')} — confidence exceeds market value`,
    })
  }

  if (alerts.length === 0) return null

  const STYLES = {
    critical: 'border-neon-pink/40 bg-neon-pink/5',
    warning: 'border-neon-orange/40 bg-neon-orange/5',
    info: 'border-neon-cyan/40 bg-neon-cyan/5',
  }

  const ICONS = {
    critical: '!!',
    warning: '!',
    info: 'i',
  }

  const ICON_COLORS = {
    critical: 'text-neon-pink',
    warning: 'text-neon-orange',
    info: 'text-neon-cyan',
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${STYLES[alert.type]}`}
        >
          <span
            className={`font-mono font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full border ${ICON_COLORS[alert.type]} border-current`}
          >
            {ICONS[alert.type]}
          </span>
          <p className="text-sm text-white/80">{alert.message}</p>
        </motion.div>
      ))}
    </div>
  )
}
