import { useState, useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Gauge from '../components/Gauge'
import RiskCards from '../components/RiskCards'
import Iceberg from '../components/Iceberg'
import Iceberg2D from '../components/Iceberg2D'
import SkillSurvivalChart from '../components/SkillSurvivalChart'
import IllusionChart from '../components/IllusionChart'
import CareerTwin from '../components/CareerTwin'
import Roadmap from '../components/Roadmap'
import AlertPanel from '../components/AlertPanel'
import CurrencyToggle from '../components/CurrencyToggle'
import ThemeToggle from '../components/ThemeToggle'
import AIInsights from '../components/AIInsights'
import BenchmarkComparison from '../components/BenchmarkComparison'
import CourseRecommendations from '../components/CourseRecommendations'
import ExportButton from '../components/ExportButton'
import AnalysisHistory from '../components/AnalysisHistory'
import ShareCard from '../components/ShareCard'
import ProgressView from '../components/ProgressView'
import { DashboardSkeleton } from '../components/Skeleton'
import { saveAnalysis, loadAnalysis } from '../utils/storage'
import DEMO_DATA from '../data/demoData'
// === NEW: Assessment + Roadmap + Reveal imports (delete block to revert) ===
import AssessmentResults from '../components/AssessmentResults'
import VerificationInsight from '../components/VerificationInsight'
import RoadmapTimeline from '../components/RoadmapTimeline'
import RevealAnimation from '../components/RevealAnimation'
import CareerAlignment from '../components/CareerAlignment'
// === END new imports ===

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

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold theme-text">{title}</h2>
      {subtitle && <p className="text-xs theme-text-muted mt-0.5">{subtitle}</p>}
    </div>
  )
}

function CollapsibleSection({ title, subtitle, children, defaultOpen = true, delay = 0, exportSection = false }) {
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
        <motion.svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 theme-text-muted flex-shrink-0"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </motion.svg>
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

function TldrSummary({ bsi, survival, twin, illusion }) {
  const criticalSkills = survival.filter((s) => s.status === 'critical')
  const atRiskSkills = survival.filter((s) => s.status === 'at_risk')
  const topIllusion = illusion.find((s) => s.illusion_score > 15)
  const optimizedRole = twin?.optimized_path?.role
  const currentSalary = twin?.current_path?.salary_projection?.at(-1)?.salary || 0
  const optimizedSalary = twin?.optimized_path?.salary_projection?.at(-1)?.salary || 0
  const salaryUplift = optimizedSalary - currentSalary

  const bsiBullet = bsi.level === 'critical'
    ? { icon: '!', color: 'text-neon-pink', bg: 'bg-neon-pink/10', text: `Critical BSI score of ${bsi.score.toFixed(0)} — significant career blind spots detected` }
    : bsi.level === 'warning'
      ? { icon: '!', color: 'text-neon-orange', bg: 'bg-neon-orange/10', text: `BSI score ${bsi.score.toFixed(0)} — notable blind spots need attention` }
      : { icon: '\u2713', color: 'text-neon-green', bg: 'bg-neon-green/10', text: `BSI score ${bsi.score.toFixed(0)} — your career foundation is solid` }

  const skillBullet = criticalSkills.length > 0
    ? { icon: '\u2193', color: 'text-neon-pink', bg: 'bg-neon-pink/10', text: `${criticalSkills.map((s) => s.skill).join(', ')} ${criticalSkills.length === 1 ? 'is' : 'are'} in critical decay (<2 years of relevance)` }
    : atRiskSkills.length > 0
      ? { icon: '\u2193', color: 'text-neon-orange', bg: 'bg-neon-orange/10', text: `${atRiskSkills.length} skill${atRiskSkills.length > 1 ? 's' : ''} at risk: ${atRiskSkills.slice(0, 3).map((s) => s.skill).join(', ')}` }
      : null

  const illusionBullet = topIllusion
    ? { icon: '?', color: 'text-neon-purple', bg: 'bg-neon-purple/10', text: `Confidence in ${topIllusion.skill} exceeds market reality by ${topIllusion.illusion_score.toFixed(0)} points` }
    : null

  const salaryBullet = optimizedRole && salaryUplift > 0
    ? { icon: '\u2191', color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', text: `Upskilling toward ${optimizedRole} could unlock +$${(salaryUplift / 1000).toFixed(0)}k in annual salary` }
    : null

  const bullets = [bsiBullet, skillBullet, illusionBullet, salaryBullet].filter(Boolean)

  return (
    <motion.div {...fadeUp(0.04)} className="glass-card-premium neon-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neon-cyan">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold theme-text">TL;DR</h2>
          <p className="text-xs theme-text-muted">Key findings at a glance</p>
        </div>
      </div>
      <div className="space-y-3">
        {bullets.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-start gap-3"
          >
            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${b.color} ${b.bg}`}>
              {b.icon}
            </span>
            <p className="text-sm theme-text-secondary leading-relaxed">{b.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

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

function TimeToIrrelevanceAlert({ bsi, survival }) {
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

function IcebergToggle({ mode, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle('2d')}
        className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
          mode === '2d'
            ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
            : 'theme-text-muted border border-transparent hover:border-[var(--border-default)]'
        }`}
      >
        2D View
      </button>
      <button
        onClick={() => onToggle('3d')}
        className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
          mode === '3d'
            ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
            : 'theme-text-muted border border-transparent hover:border-[var(--border-default)]'
        }`}
      >
        3D View
      </button>
    </div>
  )
}

/* "What Should I Do Next?" — The product moment */
function NextStepCTA({ twin, survival, delay = 0 }) {
  const topSkill = twin?.recommended_skills?.[0]
  const criticalSkills = survival.filter((s) => s.status === 'critical')
  const optimizedRole = twin?.optimized_path?.role
  const currentSalary = twin?.current_path?.salary_projection?.at(-1)?.salary || 0
  const optimizedSalary = twin?.optimized_path?.salary_projection?.at(-1)?.salary || 0
  const salaryDelta = optimizedSalary - currentSalary

  if (!topSkill) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium neon-border relative overflow-hidden"
    >
      {/* Accent gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 80% 50%, rgba(52,211,153,0.08), transparent 60%)',
        }}
      />

      <div className="relative z-10 p-8 md:p-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-neon-green">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-neon-green">What Should I Do Next?</span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold theme-text mb-2">
          Start learning <span className="text-neon-green">{topSkill.skill}</span> this quarter
        </h3>
        <p className="text-sm theme-text-tertiary leading-relaxed mb-6 max-w-xl">
          {topSkill.skill} is the highest-impact skill for your career trajectory.
          {optimizedRole && ` It's essential for transitioning to ${optimizedRole}`}
          {salaryDelta > 0 && `, which could unlock +$${(salaryDelta / 1000).toFixed(0)}k in annual salary`}.
          {criticalSkills.length > 0 && ` Meanwhile, ${criticalSkills.map((s) => s.skill).join(', ')} ${criticalSkills.length === 1 ? 'needs' : 'need'} urgent attention.`}
        </p>

        <div className="flex flex-wrap gap-3">
          {(twin?.recommended_skills ?? []).slice(0, 4).map((skill, i) => (
            <motion.span
              key={skill.skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.1 + i * 0.08 }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                i === 0
                  ? 'bg-neon-green/10 text-neon-green border-neon-green/30'
                  : 'theme-text-tertiary border-[var(--border-default)]'
              }`}
            >
              {skill.priority === 'high' && <span className="mr-1">!</span>}
              {skill.skill}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* Narrative section divider with label */
function NarrativeDivider({ label, delay = 0 }) {
  return (
    <motion.div
      className="flex items-center gap-4 py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex-1 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(var(--neon-cyan-rgb), 0.15), transparent)',
      }} />
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] theme-text-muted whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(var(--neon-cyan-rgb), 0.15), transparent)',
      }} />
    </motion.div>
  )
}

/* Action Plan — tabbed section merging Timeline, Jobs, and Courses */
function ActionPlanTabs({ roadmap, jobs, courses, delay = 0 }) {
  const [tab, setTab] = useState('timeline')
  const hasTimeline = roadmap?.length > 0
  const hasJobs = roadmap && jobs?.length > 0
  const hasCourses = courses?.length > 0

  if (!hasTimeline && !hasJobs && !hasCourses) return null

  const tabs = [
    hasTimeline && { key: 'timeline', label: 'Timeline' },
    hasJobs && { key: 'jobs', label: 'Jobs' },
    hasCourses && { key: 'courses', label: 'Courses' },
  ].filter(Boolean)

  // Default to first available tab
  const activeTab = tabs.find((t) => t.key === tab) ? tab : tabs[0]?.key

  return (
    <CollapsibleSection
      title="Action Plan"
      subtitle="Your roadmap, job matches, and learning resources"
      delay={delay}
      defaultOpen={false}
      exportSection
    >
      {/* Tab buttons */}
      <div className="flex gap-1 mb-5 p-0.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-default)] w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === t.key
                ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                : 'theme-text-muted border border-transparent hover:border-[var(--border-default)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'timeline' && hasTimeline && (
        <RoadmapTimeline roadmap={roadmap} />
      )}
      {activeTab === 'jobs' && hasJobs && (
        <Roadmap data={roadmap} jobs={jobs} />
      )}
      {activeTab === 'courses' && hasCourses && (
        <CourseRecommendations data={courses} />
      )}
    </CollapsibleSection>
  )
}

/* Stagger animation variants */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState(() => location.state?.data || DEMO_DATA)
  const [saveToast, setSaveToast] = useState(false)
  const [isLoading] = useState(false)
  const [icebergMode, setIcebergMode] = useState('2d')
  // === NEW: Reveal animation + assessment state (delete block to revert) ===
  const [showReveal, setShowReveal] = useState(() => !!location.state?.data)
  const assessmentData = data.assessment_data || null
  const isAiVerified = data.ai_verified || data.blindspot_index?.ai_verified || false
  // === END reveal + assessment state ===

  const { profile, blindspot_index: bsi, skill_survival, competence_illusion, career_twin } = data

  const animatedScore = useCountUp(bsi.score, 2200)
  const criticalSkills = skill_survival.filter((s) => s.status === 'critical')
  const atRiskSkills = skill_survival.filter((s) => s.status === 'at_risk')
  const consequence = CONSEQUENCE_COPY[bsi.level] || CONSEQUENCE_COPY.moderate

  const handleSave = useCallback(() => {
    saveAnalysis(data)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), TOAST_DURATION_MS)
  }, [data])

  const handleLoadHistory = useCallback((id) => {
    const loaded = loadAnalysis(id)
    if (loaded) setData(loaded)
  }, [])

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
      {/* === NEW: Reveal Animation (delete block to revert) === */}
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
      {/* === END Reveal Animation === */}

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 nav-glass" role="navigation" aria-label="Dashboard navigation">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-lg font-bold gradient-text-animated hover:opacity-80 transition-opacity"
              style={{ backgroundSize: '300% 100%' }}
            >
              BlindSpot
            </button>
            <span className="hidden sm:inline" style={{ color: 'var(--text-muted)' }}>|</span>
            <span className="text-sm hidden sm:inline theme-text-tertiary">Dashboard</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            <ThemeToggle />
            <CurrencyToggle />
            <ExportButton profileName={profile.name} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              aria-label="Save analysis"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-medium border transition-colors micro-press"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-tertiary)',
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
              </svg>
              <span className="hidden sm:inline">Save</span>
            </motion.button>
            <AnalysisHistory onLoad={handleLoadHistory} />
            <button
              onClick={() => navigate('/onboarding')}
              className="px-3 sm:px-4 py-2 rounded-lg text-xs font-medium border transition-colors micro-press"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-tertiary)',
              }}
            >
              Re-analyze
            </button>
          </div>
        </div>
      </nav>

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
          {/* Layered depth: radial glow background (Layer 0) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${LEVEL_COLOR_MAP[bsi.level] || '#38BDF8'}18, transparent 55%),
                           radial-gradient(circle at 30% 80%, rgba(167,139,250,0.06), transparent 50%),
                           radial-gradient(circle at 70% 80%, rgba(52,211,153,0.04), transparent 50%)`,
            }}
          />

          {/* Content (Layer 1) */}
          <div className="relative z-10 py-12 md:py-16 px-8 md:px-12 text-center">
            <motion.p
              className="text-xs theme-text-muted uppercase tracking-[0.2em] mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {profile.name} &bull; {profile.current_role} &bull; {profile.years_experience}yr experience
            </motion.p>

            {/* THE SCORE — The center of everything */}
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

            {/* EMOTIONAL CONSEQUENCE — This is what judges remember */}
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

        {/* THE WARNING — Time-to-Irrelevance, unmissable */}
        <TimeToIrrelevanceAlert bsi={bsi} survival={skill_survival} />

        {/* Alert Panel — Critical warnings */}
        <motion.div {...fadeUp(0.12)}>
          <AlertPanel bsi={bsi} illusions={competence_illusion} survival={skill_survival} />
        </motion.div>

        {/* ═══════════════════════════════════════════════════
           ACT 2: THE EVIDENCE — Show proof, guide the eye
           ═══════════════════════════════════════════════════ */}
        <NarrativeDivider label="The Evidence" delay={0.14} />

        {/* Risk Factor Cards — Your top vulnerabilities */}
        <motion.div {...fadeUp(0.16)} data-export-section className="glass-card-premium neon-border p-6">
          <SectionHeader title="Your Vulnerabilities" subtitle="Where your career is most exposed" />
          <RiskCards components={bsi.components} />
        </motion.div>

        {/* Skill Iceberg — Signature visualization */}
        <motion.div {...fadeUp(0.2)} data-export-section className="glass-card-premium neon-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold theme-text">What the Market Sees</h2>
              <p className="text-xs theme-text-muted mt-0.5">Your visible skills vs. what's silently eroding beneath the surface</p>
            </div>
            <IcebergToggle mode={icebergMode} onToggle={setIcebergMode} />
          </div>
          <div className={icebergMode === '3d' ? 'h-[420px] -mx-2' : 'min-h-[420px]'}>
            {icebergMode === '2d' ? (
              <Iceberg2D survivalData={skill_survival} />
            ) : (
              <Iceberg survivalData={skill_survival} />
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════
           ACT 3: THE PATH FORWARD — Action, not just data
           ═══════════════════════════════════════════════════ */}
        <NarrativeDivider label="Your Path Forward" delay={0.24} />

        {/* What Should I Do Next? — THE product moment */}
        <NextStepCTA twin={career_twin} survival={skill_survival} delay={0.26} />

        {/* Career Alignment — Where do you fit in the future? */}
        {career_twin?.career_alignments?.length > 0 && (
          <CareerAlignment alignments={career_twin.career_alignments} />
        )}

        {/* Career Twin Projection — Two futures side by side */}
        <CollapsibleSection
          title="Your Two Futures"
          subtitle="Current trajectory vs. what's possible if you act now"
          delay={0.3}
          exportSection
        >
          <CareerTwin data={career_twin} />
        </CollapsibleSection>

        {/* ═══════════════════════════════════════════════════
           ACT 4: THE DEEP DIVE — For the curious (collapsed)
           ═══════════════════════════════════════════════════ */}
        <NarrativeDivider label="Deep Dive" delay={0.34} />

        {/* ── Group 1: AI Insights (insights + assessment + verification) ── */}
        {(data.ai_insights || assessmentData) && (
          <CollapsibleSection
            title="AI Insights"
            subtitle="Personalized intelligence, skill verification, and assessment"
            delay={0.36}
            defaultOpen={false}
            exportSection
          >
            <div className="space-y-6">
              {data.ai_insights && <AIInsights data={data.ai_insights} />}
              {assessmentData && (
                <>
                  <div className="section-divider" />
                  <AssessmentResults assessmentData={assessmentData} />
                  <VerificationInsight
                    assessmentData={assessmentData}
                    bsiComponents={bsi.components}
                  />
                </>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* ── Group 2: Score Breakdown (BSI Gauge + Benchmark) ── */}
        <CollapsibleSection
          title="Score Breakdown"
          subtitle="Career vulnerability score and industry comparison"
          delay={0.4}
          defaultOpen={false}
          exportSection
        >
          <div className="space-y-6">
            <div className="flex justify-center">
              <Gauge score={bsi.score} level={bsi.level} />
            </div>
            {isAiVerified && (
              <div className="flex justify-center">
                <motion.div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5"
                  animate={{
                    boxShadow: [
                      '0 0 0px rgba(56,189,248,0)',
                      '0 0 12px rgba(56,189,248,0.3)',
                      '0 0 0px rgba(56,189,248,0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-neon-cyan">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider">AI Verified</span>
                </motion.div>
              </div>
            )}
            {data.benchmarks && (
              <>
                <div className="section-divider" />
                <BenchmarkComparison data={data.benchmarks} />
              </>
            )}
          </div>
        </CollapsibleSection>

        {/* ── Group 3: Skill Analysis (Half-Life + Illusion) — existing 2-col grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollapsibleSection
            title="Skill Half-Life"
            subtitle="Years until 50% market value loss"
            delay={0.44}
            defaultOpen={false}
            exportSection
          >
            <SkillSurvivalChart data={skill_survival} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Competence Illusion"
            subtitle="Confidence vs. actual market relevance"
            delay={0.46}
            defaultOpen={false}
            exportSection
          >
            <IllusionChart data={competence_illusion} />
          </CollapsibleSection>
        </div>

        {/* ── Group 4: Action Plan (Timeline / Jobs / Courses — tabbed) ── */}
        <ActionPlanTabs
          roadmap={career_twin?.roadmap}
          jobs={career_twin?.matching_jobs}
          courses={data.course_recommendations}
          delay={0.48}
        />

        {/* ── Group 5: Share & Track — existing 2-col grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollapsibleSection
            title="Share Your Score"
            subtitle="Generate a shareable career score card"
            delay={0.54}
            defaultOpen={false}
          >
            <ShareCard bsi={bsi} profile={profile} survival={skill_survival} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Progress Over Time"
            subtitle="Track your BSI score across analyses"
            delay={0.56}
            defaultOpen={false}
          >
            <ProgressView />
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="section-divider mb-6" />
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
            BlindSpot AI — Career Warning System
          </span>
        </div>
      </div>
    </motion.div>
  )
}
