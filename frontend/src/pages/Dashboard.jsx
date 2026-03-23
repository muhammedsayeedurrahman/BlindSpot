import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAnalysisStore from '../store/useAnalysisStore'
import AlertPanel from '../components/AlertPanel'
import TldrSummary from '../components/TldrSummary'
import TimeToIrrelevanceAlert from '../components/TimeToIrrelevanceAlert'
import RevealAnimation from '../components/RevealAnimation'
import { DashboardSkeleton } from '../components/Skeleton'
import { saveAnalysis } from '../utils/storage'

/* Count-up animation hook — numbers build up, not just appear */
function useCountUp(end, duration = 2000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    setValue(0)
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(end * eased * 10) / 10)
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])

  return value
}

/* Emotional consequence messaging — shows impact, not data */
const CONSEQUENCE_COPY = {
  critical: {
    headline: 'Your career is in danger.',
    subline: 'Multiple critical vulnerabilities detected. Without action, your market value will erode rapidly.',
  },
  warning: {
    headline: "You're falling behind — silently.",
    subline: 'Your skills are decaying faster than the market demands. The gap is widening every month.',
  },
  moderate: {
    headline: 'Blind spots are forming.',
    subline: 'Some of your skills are losing relevance. Address them now before they compound.',
  },
  healthy: {
    headline: 'You\'re ahead of the curve.',
    subline: 'Your career foundation is strong. Keep building momentum and stay vigilant.',
  },
}

const TOAST_DURATION_MS = 2000

const LEVEL_COLOR_MAP = {
  critical: '#FB7185',
  warning: '#FB923C',
  healthy: '#34D399',
  moderate: '#38BDF8',
}

/* Stagger animation variants */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, advanceJourney } = useAnalysisStore()
  const [saveToast, setSaveToast] = useState(false)
  const [isLoading] = useState(false)
  const [showReveal, setShowReveal] = useState(false)

  const { profile, blindspot_index: bsi, skill_survival, competence_illusion, career_twin } = data
  const assessmentData = data.assessment_data || null

  const animatedScore = useCountUp(bsi.score, 2200)
  const consequence = CONSEQUENCE_COPY[bsi.level] || CONSEQUENCE_COPY.moderate

  useEffect(() => {
    advanceJourney(0)
  }, [advanceJourney])

  const handleSave = useCallback(() => {
    saveAnalysis(data)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), TOAST_DURATION_MS)
  }, [data])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Reveal Animation */}
      <AnimatePresence>
        {showReveal && (
          <RevealAnimation
            key="reveal"
            score={bsi.score}
            level={bsi.level}
            onComplete={() => setShowReveal(false)}
            hasAssessment={!!assessmentData}
          />
        )}
      </AnimatePresence>

      {/* Save toast */}
      {saveToast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-medium backdrop-blur-sm"
        >
          Analysis saved successfully
        </motion.div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* ═══════════════════════════════════════════════════
           ACT 1: THE WAKE-UP CALL — Score dominates everything
           ═══════════════════════════════════════════════════ */}
        <motion.div
          {...fadeUp(0)}
          data-export-section
          className="hero-section glass-card-premium neon-border relative overflow-hidden"
          style={{ minHeight: '420px' }}
        >
          {/* Layered depth: radial glow background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${LEVEL_COLOR_MAP[bsi.level] || '#38BDF8'}18, transparent 55%),
                           radial-gradient(circle at 30% 80%, rgba(167,139,250,0.06), transparent 50%),
                           radial-gradient(circle at 70% 80%, rgba(52,211,153,0.04), transparent 50%)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10 py-12 md:py-16 px-8 md:px-12 text-center">
            <motion.p
              className="text-xs theme-text-muted uppercase tracking-[0.2em] mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {profile.name} &bull; {profile.current_role} &bull; {profile.years_experience}yr experience
            </motion.p>

            {/* THE SCORE */}
            <motion.div
              className="score-pulse mb-2"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                className="text-8xl md:text-[10rem] lg:text-[12rem] font-black font-mono leading-none hero-score-gradient inline-block"
                style={{
                  background: `linear-gradient(135deg, ${LEVEL_COLOR_MAP[bsi.level] || '#38BDF8'}, #A78BFA, ${LEVEL_COLOR_MAP[bsi.level] || '#38BDF8'})`,
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 50px ${LEVEL_COLOR_MAP[bsi.level] || '#38BDF8'}35)`,
                }}
              >
                {animatedScore.toFixed(1)}
              </span>
            </motion.div>

            {/* Risk level badge */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: LEVEL_COLOR_MAP[bsi.level] || '#38BDF8' }}
              />
              <span
                className="text-xs md:text-sm font-bold uppercase tracking-[0.3em]"
                style={{ color: LEVEL_COLOR_MAP[bsi.level] || '#38BDF8' }}
              >
                {bsi.level === 'critical' ? 'CRITICAL RISK' : bsi.level === 'warning' ? 'HIGH RISK' : bsi.level === 'moderate' ? 'MODERATE RISK' : 'LOW RISK'}
              </span>
            </motion.div>

            {/* EMOTIONAL CONSEQUENCE */}
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold max-w-2xl mx-auto leading-tight mb-3"
              style={{ color: 'var(--text-primary)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              {consequence.headline}
            </motion.h2>
            <motion.p
              className="text-sm md:text-base max-w-lg mx-auto leading-relaxed"
              style={{ color: 'var(--text-tertiary)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              {consequence.subline}
            </motion.p>
          </div>
        </motion.div>

        {/* TL;DR Summary */}
        <TldrSummary
          bsi={bsi}
          survival={skill_survival}
          twin={career_twin}
          illusion={competence_illusion}
        />

        {/* Time-to-Irrelevance Warning */}
        <TimeToIrrelevanceAlert bsi={bsi} survival={skill_survival} />

        {/* Alert Panel — Critical warnings */}
        <motion.div {...fadeUp(0.12)}>
          <AlertPanel bsi={bsi} illusions={competence_illusion} survival={skill_survival} />
        </motion.div>

        {/* CTA to explore analysis */}
        <motion.div {...fadeUp(0.16)} className="flex justify-center py-4">
          <motion.button
            whileHover={{ scale: 1.03, x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/analysis')}
            className="btn-primary text-sm group"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Your Analysis
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
