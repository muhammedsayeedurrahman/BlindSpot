import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeProfile, fetchSkills, fetchRoles } from '../api'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import SkillQuiz from '../components/SkillQuiz'
import useAnalysisStore from '../store/useAnalysisStore'
import useJourneyStore from '../store/useJourneyStore'

// Fallback data if API is unreachable
const FALLBACK_SKILL_CATEGORIES = {
  'Programming': ['Python', 'JavaScript', 'TypeScript', 'Rust', 'Go', 'SQL'],
  'AI & Data': ['Data Analysis', 'Machine Learning', 'Deep Learning', 'Prompt Engineering', 'LLM Fine-tuning'],
  'Infrastructure': ['Cloud Architecture', 'Kubernetes', 'DevOps', 'Cybersecurity'],
  'Frontend': ['React', 'Next.js', 'UI/UX Design', 'Figma'],
  'Soft Skills': ['Project Management', 'Agile/Scrum', 'Communication', 'Leadership', 'Problem Solving', 'Critical Thinking'],
  'Legacy': ['Excel', 'Manual Testing', 'Data Entry', 'Bookkeeping', 'Technical Writing'],
}

const FALLBACK_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'Data Analyst',
  'ML Engineer', 'AI Engineer', 'DevOps Engineer', 'Cloud Architect',
  'Cybersecurity Analyst', 'Product Manager', 'Project Manager',
  'UX Designer', 'Technical Writer', 'QA Engineer',
]

const STEPS = [
  { id: 'profile', title: 'Your Profile', subtitle: 'Tell us about your current role' },
  { id: 'skills', title: 'Your Skills', subtitle: 'Select the skills you work with' },
  { id: 'confidence', title: 'Confidence Rating', subtitle: 'How confident are you in each skill?' },
  // === NEW: Quiz step (delete line to revert) ===
  { id: 'assessment', title: 'Skill Assessment', subtitle: 'Verify your skills with AI-generated questions' },
]

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function ProgressBar({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex-1 flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-quaternary)' }} />
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #38BDF8, #A78BFA)',
                boxShadow: i <= currentStep ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none',
              }}
              initial={{ width: '0%' }}
              animate={{ width: i <= currentStep ? '100%' : '0%' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <motion.div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              i <= currentStep
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                : 'border'
            }`}
            style={i > currentStep ? {
              backgroundColor: 'var(--bg-quaternary)',
              color: 'var(--text-muted)',
              borderColor: 'var(--border-default)',
            } : undefined}
            whileHover={{ scale: 1.15 }}
            animate={i <= currentStep ? {
              boxShadow: ['0 0 0px rgba(56,189,248,0)', '0 0 12px rgba(56,189,248,0.2)', '0 0 0px rgba(56,189,248,0)'],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {i < currentStep ? (
              <motion.svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-3 h-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <path d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" />
              </motion.svg>
            ) : (
              i + 1
            )}
          </motion.div>
        </div>
      ))}
    </div>
  )
}

function ConfidenceSlider({ skill, value, onChange }) {
  const getColor = (v) => {
    if (v <= 3) return '#FB7185'
    if (v <= 5) return '#FB923C'
    if (v <= 7) return '#38BDF8'
    return '#34D399'
  }
  const color = getColor(value)

  return (
    <motion.div
      className="flex items-center gap-4 py-2.5 px-3 rounded-xl transition-colors"
      whileHover={{
        x: 4,
        backgroundColor: 'var(--bg-tertiary)',
      }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-sm w-40 truncate font-medium theme-text-secondary">{skill}</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} ${((value - 1) / 9) * 100}%, var(--bg-quaternary) ${((value - 1) / 9) * 100}%)`,
          }}
          aria-label={`Confidence in ${skill}`}
        />
      </div>
      <motion.span
        className="font-mono text-sm w-8 text-center font-bold"
        style={{ color }}
        key={value}
        initial={{ scale: 1.3, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.span>
    </motion.div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const setData = useAnalysisStore((s) => s.setData)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState(3)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [confidences, setConfidences] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  // === NEW: Assessment state (delete block to revert) ===
  const [assessmentResults, setAssessmentResults] = useState(null)

  // Dynamic data from API
  const [skillCategories, setSkillCategories] = useState(FALLBACK_SKILL_CATEGORIES)
  const [roles, setRoles] = useState(FALLBACK_ROLES)
  const [dataLoaded, setDataLoaded] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 200)

  // Fetch skills and roles from API on mount
  useEffect(() => {
    let cancelled = false
    async function loadData() {
      try {
        const [skillsData, rolesData] = await Promise.all([
          fetchSkills().catch(() => null),
          fetchRoles().catch(() => null),
        ])

        if (cancelled) return

        if (skillsData && Array.isArray(skillsData)) {
          // Group skills by category
          const grouped = {}
          for (const s of skillsData) {
            const cat = s.category || 'Other'
            if (!grouped[cat]) grouped[cat] = []
            grouped[cat].push(s.skill)
          }
          setSkillCategories(grouped)
        }

        if (rolesData && Array.isArray(rolesData)) {
          setRoles(rolesData.map((r) => r.role))
        }

        setDataLoaded(true)
      } catch {
        // Fallback data is already set
        setDataLoaded(true)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [])

  const allSkills = useMemo(
    () => Object.values(skillCategories).flat(),
    [skillCategories],
  )

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const setConfidence = (skill, value) => {
    setConfidences((prev) => ({ ...prev, [skill]: value }))
  }

  const filteredSkills = useMemo(() => {
    const query = debouncedSearch.toLowerCase()
    if (activeCategory) {
      return (skillCategories[activeCategory] || []).filter((s) =>
        s.toLowerCase().includes(query)
      )
    }
    return allSkills.filter((s) =>
      s.toLowerCase().includes(query)
    )
  }, [debouncedSearch, activeCategory, skillCategories, allSkills])

  const handleSubmit = async (assessmentData = null) => {
    setLoading(true)
    setError(null)
    setFieldErrors({})
    try {
      const profile = {
        name: name || 'Anonymous',
        current_role: role || 'Software Engineer',
        years_experience: experience,
        linkedin_url: linkedinUrl,
        github_username: githubUsername,
        skills: selectedSkills.map((s) => ({
          skill: s,
          confidence: confidences[s] || 5,
        })),
      }
      // === NEW: Include assessment results in analysis request (delete block to revert) ===
      const effectiveAssessment = assessmentData || assessmentResults
      if (effectiveAssessment) {
        profile.assessment_results = effectiveAssessment
      }
      // === END assessment passthrough ===
      const result = await analyzeProfile(profile)
      // === NEW: Pass assessment data to dashboard (delete block to revert) ===
      if (effectiveAssessment) {
        result.assessment_data = effectiveAssessment
      }
      // === END assessment dashboard passthrough ===
      setData(result)
      useAnalysisStore.getState().resetJourney()
      useJourneyStore.getState().resetJourney()
      navigate('/dashboard')
    } catch (err) {
      // Parse structured validation errors from API
      if (err.response?.data?.error) {
        const apiError = err.response.data.error
        if (apiError.details && Array.isArray(apiError.details)) {
          const fErrors = {}
          for (const d of apiError.details) {
            fErrors[d.field] = d.message
          }
          setFieldErrors(fErrors)
        }
        setError(apiError.message || 'Analysis failed')
      } else {
        setError('Failed to analyze profile. Make sure the backend is running on port 5000.')
      }
    } finally {
      setLoading(false)
    }
  }

  const canProceed =
    step === 0 ? role.length > 0 :
    step === 1 ? selectedSkills.length >= 3 :
    step === 2 ? true :
    true

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] animate-aurora-slow"
          style={{ background: isDark ? 'rgba(56,189,248,0.04)' : 'rgba(14,165,233,0.05)' }}
        />
        <div
          className="absolute top-1/4 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px] animate-aurora"
          style={{ background: isDark ? 'rgba(167,139,250,0.03)' : 'rgba(124,58,237,0.03)' }}
        />
      </div>

      <motion.div
        className="glass-card-premium p-6 md:p-8 max-w-2xl w-full relative z-10"
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <ProgressBar currentStep={step} totalSteps={STEPS.length} />

        <AnimatePresence mode="popLayout">
          {/* Step 1: Profile */}
          {step === 0 && (
            <motion.div
              key="profile"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <h2 className="text-2xl font-bold mb-1 theme-text">{STEPS[0].title}</h2>
              <p className="theme-text-tertiary mb-6 text-sm">{STEPS[0].subtitle}</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium theme-text-tertiary mb-1.5 uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full theme-input rounded-xl px-4 py-3 placeholder:opacity-30 focus:outline-none transition-all border"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium theme-text-tertiary mb-1.5 uppercase tracking-wider">
                    Current Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full theme-input rounded-xl px-4 py-3 focus:outline-none transition-all border"
                  >
                    <option value="">Select your role...</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {fieldErrors['current_role'] && (
                    <p className="text-xs text-neon-pink mt-1">{fieldErrors['current_role']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium theme-text-tertiary mb-1.5 uppercase tracking-wider">
                    Years of Experience
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #38BDF8 ${(experience / 20) * 100}%, var(--bg-quaternary) ${(experience / 20) * 100}%)`,
                      }}
                      aria-label="Years of experience"
                    />
                    <motion.span
                      className="text-neon-cyan font-mono font-bold text-lg w-10 text-center"
                      key={experience}
                      initial={{ scale: 1.3, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      {experience}
                    </motion.span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium theme-text-tertiary mb-1.5 uppercase tracking-wider">
                      LinkedIn URL <span className="theme-text-muted">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full theme-input rounded-xl px-4 py-3 placeholder:opacity-30 focus:outline-none transition-all text-sm border"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium theme-text-tertiary mb-1.5 uppercase tracking-wider">
                      GitHub Username <span className="theme-text-muted">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="username"
                      className="w-full theme-input rounded-xl px-4 py-3 placeholder:opacity-30 focus:outline-none transition-all text-sm border"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills */}
          {step === 1 && (
            <motion.div
              key="skills"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <h2 className="text-2xl font-bold mb-1 theme-text">{STEPS[1].title}</h2>
              <p className="theme-text-tertiary mb-4 text-sm">{STEPS[1].subtitle}</p>

              {/* Search */}
              <div className="relative mb-4">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted"
                >
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills..."
                  className="w-full theme-input rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:opacity-30 focus:outline-none transition-all border"
                />
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <motion.button
                  onClick={() => setActiveCategory(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === null
                      ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_10px_rgba(56,189,248,0.08)]'
                      : 'border'
                  }`}
                  style={activeCategory !== null ? {
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-tertiary)',
                    borderColor: 'transparent',
                  } : undefined}
                >
                  All
                </motion.button>
                {Object.keys(skillCategories).map((cat) => (
                  <motion.button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_10px_rgba(56,189,248,0.08)]'
                        : 'border'
                    }`}
                    style={activeCategory !== cat ? {
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-tertiary)',
                      borderColor: 'transparent',
                    } : undefined}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>

              {/* Skills grid */}
              <div
                className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1"
                role="group"
                aria-label="Available skills"
              >
                {filteredSkills.map((skill, i) => (
                  <motion.button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        toggleSkill(skill)
                      }
                    }}
                    role="checkbox"
                    aria-checked={selectedSkills.includes(skill)}
                    aria-label={`${skill}${selectedSkills.includes(skill) ? ' (selected)' : ''}`}
                    whileTap={{ scale: 0.93 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 ${
                      selectedSkills.includes(skill)
                        ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 shadow-[0_0_12px_rgba(56,189,248,0.12)]'
                        : 'border'
                    }`}
                    style={!selectedSkills.includes(skill) ? {
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-tertiary)',
                      borderColor: 'var(--border-subtle)',
                    } : undefined}
                  >
                    {selectedSkills.includes(skill) && (
                      <motion.span
                        className="mr-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                        aria-hidden="true"
                      >
                        &#10003;
                      </motion.span>
                    )}
                    {skill}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm" style={{ color: 'rgba(var(--neon-cyan-rgb), 0.6)' }}>
                  <motion.span
                    key={selectedSkills.length}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="inline-block"
                  >
                    {selectedSkills.length}
                  </motion.span>
                  {' '}selected
                  {selectedSkills.length < 3 && (
                    <span className="theme-text-muted"> (min 3)</span>
                  )}
                </p>
                {selectedSkills.length > 0 && (
                  <button
                    onClick={() => setSelectedSkills([])}
                    className="text-xs theme-text-muted hover:theme-text-secondary transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {fieldErrors['skills'] && (
                <p className="text-xs text-neon-pink mt-2">{fieldErrors['skills']}</p>
              )}
            </motion.div>
          )}

          {/* Step 3: Confidence */}
          {step === 2 && (
            <motion.div
              key="confidence"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <h2 className="text-2xl font-bold mb-1 theme-text">{STEPS[2].title}</h2>
              <p className="theme-text-tertiary mb-6 text-sm">{STEPS[2].subtitle}</p>

              <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
                {selectedSkills.map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ConfidenceSlider
                      skill={skill}
                      value={confidences[skill] || 5}
                      onChange={(v) => setConfidence(skill, v)}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-6 text-[10px] theme-text-muted uppercase tracking-wider">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-pink" /> Low</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-orange" /> Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-cyan" /> Good</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-green" /> Expert</span>
              </div>
            </motion.div>
          )}

          {/* === NEW: Step 4: AI Skill Assessment (delete block to revert) === */}
          {step === 3 && (
            <motion.div
              key="assessment"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <SkillQuiz
                skills={selectedSkills.map((s) => ({
                  skill: s,
                  confidence: confidences[s] || 5,
                }))}
                onComplete={(results) => {
                  setAssessmentResults(results)
                  handleSubmit(results)
                }}
                onSkip={() => handleSubmit(null)}
              />
            </motion.div>
          )}
          {/* === END Step 4 === */}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl border border-neon-pink/30 bg-neon-pink/5"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neon-pink flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-neon-pink/80">{error}</p>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <motion.button
            whileHover={{ scale: 1.03, x: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors micro-press"
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-tertiary)',
            }}
          >
            {step > 0 ? 'Back' : 'Home'}
          </motion.button>

          {/* === MODIFIED: Navigation updated for 4-step flow === */}
          {step < 2 ? (
            <motion.button
              whileHover={{ scale: 1.03, x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="btn-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Continue</span>
            </motion.button>
          ) : step === 2 ? (
            <motion.button
              whileHover={{ scale: 1.03, x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(3)}
              className="btn-primary text-sm"
            >
              <span className="relative z-10">Verify Skills</span>
            </motion.button>
          ) : step === 3 && loading ? (
            <motion.button
              disabled
              className="btn-primary text-sm disabled:opacity-30 relative"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                </svg>
                Analyzing...
              </span>
            </motion.button>
          ) : null}
          {/* === END Modified navigation === */}
        </div>
      </motion.div>
    </div>
  )
}
