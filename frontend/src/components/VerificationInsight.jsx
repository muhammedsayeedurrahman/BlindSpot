/**
 * VerificationInsight — Personalized coaching based on quiz vs. self-report gap
 * The "aha moment" card that makes judges say "wow"
 * === NEW: Verification insight component (delete file to remove) ===
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function CountUp({ target, duration = 1200 }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(target * progress * 10) / 10)
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value.toFixed(1)}</span>
}

function GapTooltip({ children }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help border-b border-dotted border-current"
      >
        {children}
      </span>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-[10px] w-48 text-center z-10"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
          }}
        >
          This is the gap between your self-reported confidence and quiz performance
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}
          />
        </motion.div>
      )}
    </span>
  )
}

export default function VerificationInsight({ assessmentData, bsiComponents }) {
  if (!assessmentData || !assessmentData.per_skill) return null

  const { per_skill, verification_gap } = assessmentData

  // Find the most interesting skill (largest gap)
  const topOverconfident = per_skill.find((s) => s.status === 'overconfident')
  const topHiddenStrength = per_skill.find((s) => s.status === 'hidden_strength')

  if (!topOverconfident && !topHiddenStrength && Math.abs(verification_gap) < 5) return null

  const riskPoints = Math.round(Math.max(0, verification_gap) * 0.2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative rounded-2xl p-[1px] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #00f0ff, #b44aff, #ff2d7c)',
      }}
    >
      {/* Pulsating glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: [
            '0 0 15px rgba(0,240,255,0.3)',
            '0 0 25px rgba(0,240,255,0.5)',
            '0 0 15px rgba(0,240,255,0.3)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div
        className="relative rounded-2xl p-6"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neon-cyan">
              <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.75.75h2.5a.75.75 0 00.75-.75v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.563 7.563 0 01-2.274 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold theme-text">AI Verification Insight</h3>
            <p className="text-[10px] theme-text-muted">What your assessment reveals</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Overconfident finding */}
          {topOverconfident && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-neon-pink/5 border border-neon-pink/20"
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 text-neon-pink bg-neon-pink/15">!</span>
              <p className="text-sm theme-text-secondary leading-relaxed">
                You rated yourself{' '}
                <span className="text-neon-pink font-bold">{(topOverconfident.self_reported / 10).toFixed(0)}/10</span>
                {' '}in {topOverconfident.skill}... but scored{' '}
                <span className="text-neon-pink font-bold">{topOverconfident.verified_score.toFixed(0)}%</span>
                {' '}on the assessment. This{' '}
                <GapTooltip>
                  <span className="text-neon-pink font-bold">
                    {Math.abs(topOverconfident.gap).toFixed(0)}% overconfidence gap
                  </span>
                </GapTooltip>
                {riskPoints > 0 && (
                  <>
                    {' '}is{' '}
                    <motion.span
                      className="text-neon-pink font-bold"
                      animate={{
                        textShadow: [
                          '0 0 0px rgba(255,45,124,0)',
                          '0 0 8px rgba(255,45,124,0.6)',
                          '0 0 0px rgba(255,45,124,0)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      adding +<CountUp target={riskPoints} /> risk points
                    </motion.span>
                    {' '}to your BlindSpot Index.
                  </>
                )}
              </p>
            </motion.div>
          )}

          {/* Hidden strength finding */}
          {topHiddenStrength && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20"
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 text-neon-cyan bg-neon-cyan/15">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                </svg>
              </span>
              <p className="text-sm theme-text-secondary leading-relaxed">
                <span className="text-neon-cyan font-bold">Hidden strength detected:</span>
                {' '}You rated {topHiddenStrength.skill}{' '}
                <span className="text-neon-cyan font-bold">{(topHiddenStrength.self_reported / 10).toFixed(0)}/10</span>,
                {' '}but scored{' '}
                <span className="text-neon-cyan font-bold">{topHiddenStrength.verified_score.toFixed(0)}%</span>
                {' '}&mdash; you&apos;re better than you think!
              </p>
            </motion.div>
          )}

          {/* Verification gap summary */}
          {bsiComponents?.verification_gap !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-between pt-2 border-t"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-xs theme-text-muted">Verification Gap Contribution</span>
              <span className="text-sm font-mono font-bold text-neon-purple">
                <CountUp target={bsiComponents.verification_gap} /> pts
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
