import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

export default function CollapsibleSection({ title, subtitle, children, defaultOpen = true, delay = 0, exportSection = false, headerExtra = null }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <motion.div
      {...fadeUp(delay)}
      data-export-section={exportSection ? '' : undefined}
      className="glass-card-premium neon-border"
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-6 pb-0 text-left"
        aria-expanded={isOpen}
      >
        <div>
          <h2 className="text-lg font-semibold theme-text">{title}</h2>
          {subtitle && <p className="text-xs theme-text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerExtra && <span onClick={(e) => e.stopPropagation()}>{headerExtra}</span>}
          <motion.svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 theme-text-muted flex-shrink-0"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </motion.svg>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
