import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PROVIDER_SEARCH = {
  'Coursera': (title) => `https://www.coursera.org/search?query=${encodeURIComponent(title)}`,
  'Udemy': (title) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(title)}`,
  'freeCodeCamp': () => 'https://www.freecodecamp.org/learn/',
  'DeepLearning.AI': () => 'https://www.deeplearning.ai/courses/',
  'Frontend Masters': (title) => `https://frontendmasters.com/?q=${encodeURIComponent(title)}`,
  'LinkedIn Learning': (title) => `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(title)}`,
  'Pluralsight': (title) => `https://www.pluralsight.com/search?q=${encodeURIComponent(title)}`,
  "O'Reilly": (title) => `https://www.oreilly.com/search/?q=${encodeURIComponent(title)}`,
  'Linux Foundation': (title) => `https://training.linuxfoundation.org/training/?search=${encodeURIComponent(title)}`,
  'Interaction Design Foundation': () => 'https://www.interaction-design.org/courses',
}

function getCourseUrl(course) {
  if (course.url) return course.url
  const builder = PROVIDER_SEARCH[course.provider]
  if (builder) return builder(course.title)
  return `https://www.google.com/search?q=${encodeURIComponent(`${course.title} ${course.provider}`)}`
}

const DIFFICULTY_COLORS = {
  beginner: { bg: 'bg-neon-green/10', text: 'text-neon-green', border: 'border-neon-green/30' },
  intermediate: { bg: 'bg-neon-cyan/10', text: 'text-neon-cyan', border: 'border-neon-cyan/30' },
  advanced: { bg: 'bg-neon-purple/10', text: 'text-neon-purple', border: 'border-neon-purple/30' },
}

const PRIORITY_COLORS = {
  high: 'text-neon-pink',
  medium: 'text-neon-orange',
}

function CourseCard({ course }) {
  const diff = DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.intermediate
  const url = getCourseUrl(course)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer group"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold theme-text leading-snug group-hover:text-neon-cyan transition-colors">
            {course.title}
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 inline-block ml-1 opacity-0 group-hover:opacity-60 transition-opacity">
              <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
            </svg>
          </h4>
          <p className="text-xs theme-text-tertiary mt-0.5">{course.provider}</p>
        </div>
        {course.free && (
          <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neon-green/10 text-neon-green border border-neon-green/30 uppercase">
            Free
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${diff.bg} ${diff.text} border ${diff.border}`}>
          {course.difficulty}
        </span>
        <span className="text-[10px] theme-text-muted">{course.estimated_hours}h</span>
        <span className="text-[10px] text-neon-orange/70">{'*'.repeat(Math.round(course.rating))}</span>
        <span className="text-[10px] theme-text-muted">{course.rating}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {course.topics.slice(0, 4).map((topic) => (
          <span key={topic} className="px-1.5 py-0.5 rounded text-[10px] theme-text-tertiary" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            {topic}
          </span>
        ))}
        {course.topics.length > 4 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] theme-text-muted">
            +{course.topics.length - 4}
          </span>
        )}
      </div>
    </a>
  )
}

function SkillGroup({ recommendation, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const priorityColor = PRIORITY_COLORS[recommendation.priority] || 'text-white/60'

  return (
    <div className="glass-card overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neon-cyan">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold theme-text">{recommendation.skill}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium theme-text-tertiary" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                {recommendation.context}
              </span>
            </div>
            <p className="text-xs theme-text-muted mt-0.5 truncate">{recommendation.reason}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[10px] font-bold uppercase ${priorityColor}`}>
            {recommendation.priority}
          </span>
          <motion.svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 theme-text-muted"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendation.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CourseRecommendations({ data }) {
  if (!data || data.length === 0) return null

  // Sort by priority: high first, then medium
  const sorted = [...data].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return (order[a.priority] ?? 2) - (order[b.priority] ?? 2)
  })

  return (
    <div className="space-y-3">
      {/* Top picks summary */}
      {sorted.length > 0 && (
        <div className="glass-card p-4 mb-4" style={{ border: '1px solid var(--border-subtle)' }}>
          <h4 className="text-xs font-bold uppercase tracking-wider theme-text-tertiary mb-3">
            Top Recommended Courses
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sorted
              .flatMap((rec) =>
                rec.courses.slice(0, 1).map((course) => ({ ...course, forSkill: rec.skill }))
              )
              .slice(0, 3)
              .map((course) => (
                <a
                  key={course.id}
                  href={getCourseUrl(course)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] group"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-neon-cyan">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold theme-text group-hover:text-neon-cyan transition-colors leading-snug">
                      {course.title}
                    </p>
                    <p className="text-[10px] theme-text-muted mt-0.5">
                      {course.provider} &middot; For <span className="text-neon-cyan">{course.forSkill}</span>
                    </p>
                  </div>
                </a>
              ))}
          </div>
        </div>
      )}

      {/* All skill groups — first 2 expanded by default */}
      {sorted.map((rec, i) => (
        <SkillGroup key={rec.skill} recommendation={rec} defaultExpanded={i < 2} />
      ))}
    </div>
  )
}
