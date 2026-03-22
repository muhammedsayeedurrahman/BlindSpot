import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchExplanation } from '../api'

export default function ExplainButton({ contextType, data }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [error, setError] = useState(false)
  const popoverRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleClick = async () => {
    if (open) {
      setOpen(false)
      return
    }

    setOpen(true)

    // Already fetched — use cache
    if (explanation) return

    setLoading(true)
    setError(false)
    try {
      const result = await fetchExplanation(contextType, data)
      setExplanation(result.explanation)
    } catch {
      setError(true)
      setExplanation('Explanation unavailable right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="text-[10px] font-medium px-2 py-1 rounded-lg border transition-all"
        style={{
          borderColor: open ? 'rgba(167, 139, 250, 0.4)' : 'var(--border-subtle)',
          color: open ? '#A78BFA' : 'var(--text-muted)',
          backgroundColor: open ? 'rgba(167, 139, 250, 0.08)' : 'transparent',
        }}
        aria-label="Explain why"
      >
        Why?
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-72 p-3 rounded-xl border shadow-xl"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-default)',
              right: 0,
            }}
          >
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-3 rounded-full"
                    style={{ backgroundColor: 'var(--bg-quaternary)', width: `${80 - i * 15}%` }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            ) : (
              <p className={`text-xs leading-relaxed ${error ? 'theme-text-muted' : 'theme-text-secondary'}`}>
                {explanation}
              </p>
            )}

            {/* Arrow */}
            <div
              className="absolute -top-1.5 right-4 w-3 h-3 rotate-45 border-l border-t"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-default)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
