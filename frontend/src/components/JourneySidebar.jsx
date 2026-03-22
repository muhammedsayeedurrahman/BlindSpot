import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { saveAnalysis, loadAnalysis } from '../utils/storage'
import ExportButton from './ExportButton'
import AnalysisHistory from './AnalysisHistory'
import CurrencyToggle from './CurrencyToggle'

const JOURNEY_STEPS = [
  {
    key: 'dashboard',
    path: '/dashboard',
    label: 'Awareness',
    sublabel: 'Your BSI Score',
    stepIndex: 0,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'analysis',
    path: '/analysis',
    label: 'Analysis',
    sublabel: 'Evidence & Risk',
    stepIndex: 1,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 01-.437-.437C3 20.24 3 19.96 3 19.4V3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 14l4-4 4 4 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'explore',
    path: '/explore',
    label: 'Explore',
    sublabel: 'Career Paths',
    stepIndex: 2,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'roadmap',
    path: '/roadmap',
    label: 'Roadmap',
    sublabel: 'Skills & Courses',
    stepIndex: 3,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M12 22c0-3 2.5-5 2.5-8.5a4.5 4.5 0 00-9 0C5.5 17 8 19 8 22" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22h6" strokeLinecap="round" />
        <path d="M12 2v3" strokeLinecap="round" />
        <path d="M4.9 4.9l2.1 2.1M19.1 4.9l-2.1 2.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'opportunities',
    path: '/opportunities',
    label: 'Opportunities',
    sublabel: 'Apply & Track',
    stepIndex: 4,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
  },
]

const LEVEL_COLOR_MAP = {
  critical: '#FB7185',
  warning: '#FB923C',
  healthy: '#34D399',
  moderate: '#38BDF8',
}

const TOAST_DURATION_MS = 2000

export default function JourneySidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const data = useAnalysisStore((s) => s.data)
  const journeyStep = useAnalysisStore((s) => s.journeyStep)
  const setData = useAnalysisStore((s) => s.setData)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [saveToast, setSaveToast] = useState(false)

  const profile = data?.profile
  const bsi = data?.blindspot_index

  const handleSave = useCallback(() => {
    saveAnalysis(data)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), TOAST_DURATION_MS)
  }, [data])

  const handleLoadFromHistory = useCallback((id) => {
    const loaded = loadAnalysis(id)
    if (loaded) setData(loaded)
  }, [setData])

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 pb-3">
        <button
          onClick={() => navigate('/')}
          className="text-lg font-bold gradient-text-animated hover:opacity-80 transition-opacity"
          style={{ backgroundSize: '300% 100%' }}
        >
          BlindSpot
        </button>
      </div>

      {/* Profile chip */}
      {profile && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-xs font-bold">
              {profile.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium theme-text truncate">{profile.name}</p>
              <p className="text-[10px] theme-text-muted truncate">{profile.current_role}</p>
            </div>
          </div>
        </div>
      )}

      {/* BSI score badge */}
      {bsi && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{
              borderColor: `${LEVEL_COLOR_MAP[bsi.level] || '#38BDF8'}30`,
              backgroundColor: `${LEVEL_COLOR_MAP[bsi.level] || '#38BDF8'}08`,
            }}
          >
            <span className="text-lg font-black font-mono" style={{ color: LEVEL_COLOR_MAP[bsi.level] || '#38BDF8' }}>
              {bsi.score?.toFixed(1)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: LEVEL_COLOR_MAP[bsi.level] || '#38BDF8' }}>
              {bsi.level}
            </span>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 h-px bg-[var(--border-subtle)]" />

      {/* Journey steps */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Journey navigation">
        <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] theme-text-muted">
          Journey
        </p>
        {JOURNEY_STEPS.map((step) => {
          const isCurrent = pathname === step.path
          const isUnlocked = journeyStep >= step.stepIndex
          const isCompleted = journeyStep > step.stepIndex

          return (
            <motion.button
              key={step.key}
              onClick={() => {
                if (isUnlocked) {
                  navigate(step.path)
                  setMobileOpen(false)
                }
              }}
              disabled={!isUnlocked}
              whileHover={isUnlocked ? { x: 4 } : undefined}
              whileTap={isUnlocked ? { scale: 0.98 } : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                isCurrent
                  ? 'bg-neon-cyan/10 border border-neon-cyan/20'
                  : isUnlocked
                    ? 'hover:bg-[var(--bg-tertiary)] border border-transparent'
                    : 'opacity-40 cursor-not-allowed border border-transparent'
              }`}
              style={isCurrent ? { boxShadow: '0 0 20px rgba(56,189,248,0.08)' } : undefined}
            >
              {/* Step indicator */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isCurrent
                  ? 'bg-neon-cyan/15 text-neon-cyan'
                  : isCompleted
                    ? 'bg-neon-green/10 text-neon-green'
                    : 'bg-[var(--bg-quaternary)] theme-text-muted'
              }`}>
                {isCompleted && !isCurrent ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>

              {/* Label */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${isCurrent ? 'text-neon-cyan' : 'theme-text'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] theme-text-muted">{step.sublabel}</p>
              </div>

              {/* Current indicator dot */}
              {isCurrent && (
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-neon-cyan flex-shrink-0"
                  animate={{
                    boxShadow: [
                      '0 0 0px rgba(56,189,248,0)',
                      '0 0 8px rgba(56,189,248,0.6)',
                      '0 0 0px rgba(56,189,248,0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-[var(--border-subtle)]" />

      {/* Actions */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            aria-label="Save analysis"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-tertiary)',
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            Save
          </motion.button>
          <ExportButton profileName={profile?.name} />
        </div>
        <div className="flex items-center gap-2">
          <AnalysisHistory onLoad={handleLoadFromHistory} />
          <CurrencyToggle />
        </div>
        <button
          onClick={() => { navigate('/onboarding'); setMobileOpen(false) }}
          className="w-full px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-center"
          style={{
            borderColor: 'var(--border-default)',
            color: 'var(--text-tertiary)',
          }}
        >
          Re-analyze
        </button>
      </div>

      {/* Save toast */}
      {saveToast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-[10px] font-medium text-center"
        >
          Analysis saved
        </motion.div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40 nav-glass border-r border-[var(--border-subtle)]">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 nav-glass border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 theme-text">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          {/* Mobile progress dots */}
          <div className="flex items-center gap-2">
            {JOURNEY_STEPS.map((step) => {
              const isCurrent = pathname === step.path
              const isCompleted = journeyStep > step.stepIndex
              return (
                <div
                  key={step.key}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-neon-cyan shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                      : isCompleted
                        ? 'bg-neon-green/60'
                        : 'bg-[var(--bg-quaternary)]'
                  }`}
                />
              )
            })}
          </div>

          {bsi && (
            <span className="text-sm font-bold font-mono" style={{ color: LEVEL_COLOR_MAP[bsi.level] || '#38BDF8' }}>
              {bsi.score?.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-72 z-50 nav-glass border-r border-[var(--border-subtle)]"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="Close navigation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 theme-text">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
            {sidebarContent}
          </motion.aside>
        </>
      )}
    </>
  )
}
