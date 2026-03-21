import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useState, useCallback } from 'react'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    toggleTheme()
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating, toggleTheme])

  return (
    <motion.button
      onClick={handleToggle}
      className="relative w-11 h-11 rounded-xl flex items-center justify-center
                 border theme-border hover:theme-border-hover
                 theme-surface transition-all duration-300 overflow-hidden group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.88 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Background glow ring on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(255,200,50,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(100,100,220,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Rotating glow ring on hover */}
      <div
        className="absolute inset-[-1px] rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{
          background: isDark
            ? 'conic-gradient(from 0deg, transparent, rgba(255,200,50,0.2), transparent, rgba(255,150,50,0.15), transparent)'
            : 'conic-gradient(from 0deg, transparent, rgba(100,100,220,0.2), transparent, rgba(80,80,200,0.15), transparent)',
          animation: 'spin 3s linear infinite',
        }}
      />

      {/* Inner background */}
      <div className="absolute inset-[1px] rounded-[10px] theme-surface" />

      {/* Toggle burst particles */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <motion.div
                key={`particle-${angle}`}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: isDark ? '#fbbf24' : '#818cf8',
                }}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: 0.8,
                }}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * 18,
                  y: Math.sin((angle * Math.PI) / 180) * 18,
                  scale: 0,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            className="relative z-10"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-amber-400">
              {/* Sun core with glow */}
              <motion.circle
                cx="12" cy="12" r="4"
                fill="currentColor"
                animate={{ r: [4, 4.3, 4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Rays */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180
                return (
                  <motion.line
                    key={angle}
                    x1={12 + Math.cos(rad) * 6}
                    y1={12 + Math.sin(rad) * 6}
                    x2={12 + Math.cos(rad) * 8.5}
                    y2={12 + Math.sin(rad) * 8.5}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ delay: 0.1 + angle * 0.0005, duration: 0.25 }}
                  />
                )
              })}
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            className="relative z-10"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-indigo-400">
              <motion.path
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                fill="currentColor"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4 }}
              />
              {/* Stars around moon */}
              {[
                { cx: 18, cy: 5, r: 0.8 },
                { cx: 20, cy: 9, r: 0.6 },
                { cx: 16, cy: 3, r: 0.5 },
              ].map((star, i) => (
                <motion.circle
                  key={i}
                  cx={star.cx}
                  cy={star.cy}
                  r={star.r}
                  fill="currentColor"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.3, 0.8, 0.3], scale: 1 }}
                  transition={{
                    opacity: { duration: 2, repeat: Infinity, delay: i * 0.3 },
                    scale: { delay: 0.2 + i * 0.1, duration: 0.3 },
                  }}
                />
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
