import { motion } from 'framer-motion'

const BSI_THRESHOLDS = { CRITICAL: 70, WARNING: 50, MODERATE: 30 }
const MONTHS_MIN = 6
const URGENCY_THRESHOLD_MONTHS = 18
const CRITICAL_SKILL_PENALTY_MONTHS = 3
const AT_RISK_SKILL_PENALTY_MONTHS = 1

function estimateMonthsToIrrelevance(bsiScore, criticalCount, atRiskCount) {
  let base
  if (bsiScore >= BSI_THRESHOLDS.CRITICAL) {
    base = Math.round(12 + (100 - bsiScore) * 0.3)
  } else if (bsiScore >= BSI_THRESHOLDS.WARNING) {
    base = Math.round(18 + (BSI_THRESHOLDS.CRITICAL - bsiScore) * 0.6)
  } else if (bsiScore >= BSI_THRESHOLDS.MODERATE) {
    base = Math.round(30 + (BSI_THRESHOLDS.WARNING - bsiScore) * 1.2)
  } else {
    base = Math.round(54 + (BSI_THRESHOLDS.MODERATE - bsiScore) * 2)
  }
  return Math.max(MONTHS_MIN, base - criticalCount * CRITICAL_SKILL_PENALTY_MONTHS - atRiskCount * AT_RISK_SKILL_PENALTY_MONTHS)
}

export default function TimeToIrrelevanceAlert({ bsi, survival }) {
  const criticalCount = survival.filter((s) => s.status === 'critical').length
  const atRiskCount = survival.filter((s) => s.status === 'at_risk').length
  const avgHalfLife = survival.reduce((sum, s) => sum + s.half_life_years, 0) / survival.length

  if (bsi.score < BSI_THRESHOLDS.MODERATE) return null

  const months = estimateMonthsToIrrelevance(bsi.score, criticalCount, atRiskCount)
  const isUrgent = months <= URGENCY_THRESHOLD_MONTHS

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={`alert-pulse flex items-center gap-4 px-5 py-4 rounded-xl border ${
        isUrgent
          ? 'border-neon-pink/40 bg-neon-pink/8'
          : 'border-neon-orange/30 bg-neon-orange/5'
      }`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
        isUrgent ? 'bg-neon-pink/15 text-neon-pink' : 'bg-neon-orange/15 text-neon-orange'
      }`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${isUrgent ? 'text-neon-pink' : 'text-neon-orange'}`}>
          ~{months} months to irrelevance
        </p>
        <p className="text-xs theme-text-tertiary mt-0.5 leading-relaxed">
          At current trajectory, {criticalCount > 0 ? `${criticalCount} critical skill${criticalCount > 1 ? 's' : ''} and ` : ''}
          {atRiskCount > 0 ? `${atRiskCount} at-risk skill${atRiskCount > 1 ? 's' : ''} ` : 'your skill portfolio '}
          will significantly erode your market value. Average skill half-life: {avgHalfLife.toFixed(1)} years.
        </p>
      </div>
      <div className={`hidden sm:block text-3xl font-black font-mono ${isUrgent ? 'text-neon-pink' : 'text-neon-orange'}`}
        style={{ opacity: 0.7 }}
      >
        {months}mo
      </div>
    </motion.div>
  )
}
