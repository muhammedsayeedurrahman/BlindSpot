import { motion } from 'framer-motion'

const ALERT_CONFIG = {
  critical: {
    border: 'border-neon-pink/30',
    bg: 'bg-neon-pink/5',
    iconBg: 'bg-neon-pink/15',
    iconColor: 'text-neon-pink',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  warning: {
    border: 'border-neon-orange/30',
    bg: 'bg-neon-orange/5',
    iconBg: 'bg-neon-orange/15',
    iconColor: 'text-neon-orange',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    border: 'border-neon-cyan/30',
    bg: 'bg-neon-cyan/5',
    iconBg: 'bg-neon-cyan/15',
    iconColor: 'text-neon-cyan',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
    ),
  },
}

export default function AlertPanel({ bsi, illusions, survival }) {
  const alerts = []

  if (bsi.level === 'critical') {
    alerts.push({
      type: 'critical',
      title: 'Critical Career Risk',
      message: `BlindSpot Index is ${bsi.score.toFixed(1)} — ${bsi.message}`,
    })
  } else if (bsi.level === 'warning') {
    alerts.push({
      type: 'warning',
      title: 'Career Warning',
      message: `BlindSpot Index is ${bsi.score.toFixed(1)} — ${bsi.message}`,
    })
  }

  const criticalSkills = survival.filter((s) => s.status === 'critical')
  if (criticalSkills.length > 0) {
    alerts.push({
      type: 'critical',
      title: 'Critical Skills Expiring',
      message: `${criticalSkills.map((s) => s.skill).join(', ')} ${
        criticalSkills.length > 1 ? 'have' : 'has'
      } critical half-life (< 2 years). Immediate upskilling recommended.`,
    })
  }

  const illusionWarnings = illusions.filter((i) => i.illusion_score > 15)
  if (illusionWarnings.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Competence Illusion Detected',
      message: `Your confidence in ${illusionWarnings
        .map((i) => i.skill)
        .join(', ')} exceeds actual market value. Re-calibrate expectations.`,
    })
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const config = ALERT_CONFIG[alert.type]
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 4, transition: { duration: 0.2 } }}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${config.border} ${config.bg}`}
          >
            <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg ${config.iconBg} ${config.iconColor} flex items-center justify-center`}>
              {config.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold theme-text-secondary mb-0.5">{alert.title}</p>
              <p className="text-sm theme-text-tertiary leading-relaxed">{alert.message}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
