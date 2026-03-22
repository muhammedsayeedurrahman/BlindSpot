/**
 * RevealAnimation — Dramatic "Blind Spot Reveal" entrance animation
 * Shows scan line, text sequence, BSI score count-up, risk level flash.
 * Only shows on initial dashboard load (controlled by parent).
 * === NEW: Reveal animation component (delete file to remove) ===
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LEVEL_COLORS = {
  critical: '#ff2d7c',
  warning: '#ff6a00',
  moderate: '#00f0ff',
  healthy: '#39ff14',
}

const LEVEL_LABELS = {
  critical: 'CRITICAL RISK',
  warning: 'HIGH RISK',
  moderate: 'MODERATE RISK',
  healthy: 'LOW RISK',
}

const TEXT_SEQUENCE = [
  'Scanning your career...',
  'Analyzing your skills...',
  'Detecting hidden risks...',
]

export default function RevealAnimation({ score, level, onComplete, hasAssessment }) {
  const [phase, setPhase] = useState('scan')      // scan → text → score → risk → done
  const [textIndex, setTextIndex] = useState(0)
  const [displayScore, setDisplayScore] = useState(0)

  const color = LEVEL_COLORS[level] || LEVEL_COLORS.moderate
  const label = LEVEL_LABELS[level] || LEVEL_LABELS.moderate

  const finish = useCallback(() => {
    setPhase('done')
    onComplete()
  }, [onComplete])

  // Handle skip (click or keypress)
  useEffect(() => {
    const handleSkip = () => finish()
    window.addEventListener('keydown', handleSkip)
    return () => window.removeEventListener('keydown', handleSkip)
  }, [finish])

  // Phase progression
  useEffect(() => {
    if (phase === 'done') return

    const timers = []

    // Phase 1: Scan line (0-1s)
    timers.push(setTimeout(() => setPhase('text'), 1000))

    // Phase 2: Text sequence (1-3.4s)
    timers.push(setTimeout(() => setTextIndex(0), 1000))
    timers.push(setTimeout(() => setTextIndex(1), 1800))
    timers.push(setTimeout(() => setTextIndex(2), 2600))

    // Phase 3: Score count-up (3.4-5.4s)
    timers.push(setTimeout(() => setPhase('score'), 3400))

    // Phase 4: Risk level flash (5.4-6s)
    timers.push(setTimeout(() => setPhase('risk'), 5400))

    // Phase 5: Done (6.5s)
    timers.push(setTimeout(() => finish(), 6500))

    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Score count-up animation
  useEffect(() => {
    if (phase !== 'score' && phase !== 'risk') return
    const duration = 2000
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(score * eased * 10) / 10)
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [phase, score])

  if (phase === 'done') return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
      onClick={finish}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Scan line */}
      {phase === 'scan' && (
        <motion.div
          className="absolute left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            boxShadow: `0 0 20px ${color}60`,
          }}
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      )}

      {/* Text sequence */}
      <AnimatePresence mode="wait">
        {phase === 'text' && (
          <motion.p
            key={textIndex}
            className="text-xl md:text-2xl font-medium text-center px-8"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {TEXT_SEQUENCE[textIndex]}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Score count-up */}
      {(phase === 'score' || phase === 'risk') && (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="text-7xl md:text-[120px] font-black font-mono leading-none"
              style={{
                color,
                filter: `drop-shadow(0 0 40px ${color}60)`,
              }}
            >
              {displayScore.toFixed(1)}
            </span>
          </motion.div>

          {/* Risk level flash */}
          {phase === 'risk' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <p
                className="text-lg md:text-2xl font-bold uppercase tracking-[0.3em] mt-4"
                style={{ color }}
              >
                {label}
              </p>
              {hasAssessment && score >= 45 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm mt-3 text-white/60"
                >
                  AI-Verified Assessment
                </motion.p>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Skip hint */}
      <motion.p
        className="absolute bottom-8 text-xs text-white/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Click or press any key to skip
      </motion.p>
    </motion.div>
  )
}
