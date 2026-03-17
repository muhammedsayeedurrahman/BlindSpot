import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeProfile } from '../api'

const AVAILABLE_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go', 'SQL',
  'Data Analysis', 'Machine Learning', 'Deep Learning', 'Prompt Engineering',
  'LLM Fine-tuning', 'Cloud Architecture', 'Kubernetes', 'DevOps',
  'Cybersecurity', 'React', 'Next.js', 'UI/UX Design', 'Figma',
  'Project Management', 'Agile/Scrum', 'Communication', 'Leadership',
  'Problem Solving', 'Critical Thinking', 'Excel', 'Manual Testing',
  'Data Entry', 'Bookkeeping', 'Technical Writing',
]

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'Data Analyst',
  'ML Engineer', 'AI Engineer', 'DevOps Engineer', 'Cloud Architect',
  'Cybersecurity Analyst', 'Product Manager', 'Project Manager',
  'UX Designer', 'Technical Writer', 'QA Engineer',
]

const STEPS = ['profile', 'skills', 'confidence']

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState(3)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [confidences, setConfidences] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const setConfidence = (skill, value) => {
    setConfidences((prev) => ({ ...prev, [skill]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const profile = {
        name: name || 'Anonymous',
        current_role: role || 'Software Engineer',
        years_experience: experience,
        skills: selectedSkills.map((s) => ({
          skill: s,
          confidence: confidences[s] || 5,
        })),
      }
      const result = await analyzeProfile(profile)
      navigate('/dashboard', { state: { data: result } })
    } catch (err) {
      setError('Failed to analyze profile. Make sure the backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const canProceed =
    step === 0 ? role.length > 0 :
    step === 1 ? selectedSkills.length >= 3 :
    true

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        className="glass-card neon-border p-8 max-w-2xl w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-neon-cyan' : 'bg-dark-600'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-neon-cyan/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1">Current Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan/50 focus:outline-none"
                  >
                    <option value="">Select your role...</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1">
                    Years of Experience: {experience}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-2">Select your skills</h2>
              <p className="text-white/50 mb-6 text-sm">Choose at least 3 skills you work with</p>

              <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
                {AVAILABLE_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedSkills.includes(skill)
                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                        : 'bg-dark-700 text-white/60 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <p className="text-neon-cyan/60 text-sm mt-4">
                {selectedSkills.length} selected
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="confidence"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-2">Rate your confidence</h2>
              <p className="text-white/50 mb-6 text-sm">How confident are you in each skill? (1-10)</p>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedSkills.map((skill) => (
                  <div key={skill} className="flex items-center gap-4">
                    <span className="text-sm text-white/80 w-40 truncate">{skill}</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={confidences[skill] || 5}
                      onChange={(e) => setConfidence(skill, Number(e.target.value))}
                      className="flex-1 accent-neon-cyan"
                    />
                    <span className="text-neon-cyan font-mono text-sm w-6 text-right">
                      {confidences[skill] || 5}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-neon-pink text-sm mt-4">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
            className="btn-secondary text-sm"
          >
            {step > 0 ? 'Back' : 'Home'}
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary text-sm disabled:opacity-40"
            >
              {loading ? 'Analyzing...' : 'Reveal My BlindSpots'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
