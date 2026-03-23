import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import RoadmapTimeline from '../components/RoadmapTimeline'
import Roadmap from '../components/Roadmap'
import CourseRecommendations from '../components/CourseRecommendations'
import NextStepCTA from '../components/NextStepCTA'
import CollapsibleSection from '../components/CollapsibleSection'
import NarrativeDivider from '../components/NarrativeDivider'
import ExplainButton from '../components/ExplainButton'
import useAnalysisStore from '../store/useAnalysisStore'
import useJourneyStore from '../store/useJourneyStore'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

const PATH_COLORS = {
  upgrade: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.3)', label: 'Upgrade' },
  expand: { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.3)', label: 'Expand' },
  career: { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.08)', border: 'rgba(167, 139, 250, 0.3)', label: 'Career Pivot' },
}

function ChosenPathsSection({ delay = 0 }) {
  const evolutionChoices = useJourneyStore((s) => s.evolutionChoices)
  const completedSkills = useJourneyStore((s) => s.completedSkills)
  const quizScores = useJourneyStore((s) => s.quizScores)

  const entries = Object.entries(evolutionChoices)
  if (entries.length === 0) return null

  return (
    <CollapsibleSection
      title="Your Chosen Evolution Paths"
      subtitle="Skills you've committed to evolving — track your progress"
      delay={delay}
      defaultOpen
    >
      <div className="space-y-3">
        {entries.map(([skill, path], i) => {
          const style = PATH_COLORS[path.type] || PATH_COLORS.upgrade
          const learnedCount = path.skills.filter((s) => completedSkills.includes(s)).length
          const progress = path.skills.length > 0 ? learnedCount / path.skills.length : 0

          return (
            <motion.div
              key={skill}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-xl border p-4"
              style={{ borderColor: style.border, backgroundColor: style.bg }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                    style={{ color: style.color, borderColor: style.border }}
                  >
                    {style.label}
                  </span>
                  <h4 className="text-sm font-semibold theme-text">{skill}</h4>
                </div>
                <span className="text-xs font-mono" style={{ color: style.color }}>
                  {Math.round(progress * 100)}%
                </span>
              </div>

              <p className="text-xs theme-text-secondary mb-2">{path.label}</p>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--bg-quaternary)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: style.color }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 * i }}
                />
              </div>

              {/* Skill chips */}
              <div className="flex flex-wrap gap-1.5">
                {path.skills.map((s) => {
                  const done = completedSkills.includes(s)
                  const score = quizScores[s]
                  return (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border"
                      style={{
                        borderColor: done ? style.color : `${style.color}30`,
                        backgroundColor: done ? `${style.color}15` : 'transparent',
                        color: done ? style.color : 'var(--text-muted)',
                      }}
                    >
                      {done && (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                      {s}
                      {score && <span className="font-mono">{score.score.toFixed(0)}%</span>}
                    </span>
                  )
                })}
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-1.5 mt-2 text-[10px] theme-text-muted">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
                <span>{path.months} months estimated</span>
                {path.role && (
                  <>
                    <span className="mx-1">|</span>
                    <span style={{ color: style.color }}>Target: {path.role}</span>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </CollapsibleSection>
  )
}

export default function RoadmapPage() {
  const navigate = useNavigate()
  const data = useAnalysisStore((s) => s.data)
  const advanceJourney = useAnalysisStore((s) => s.advanceJourney)

  const { skill_survival, career_twin } = data
  const roadmap = career_twin?.roadmap
  const jobs = career_twin?.matching_jobs
  const courses = data.course_recommendations

  // Mark step 3 as visited
  useEffect(() => {
    advanceJourney(3)
  }, [advanceJourney])

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Page header */}
        <motion.div {...fadeUp(0)}>
          <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">Your Path Forward</h1>
          <p className="text-sm theme-text-tertiary">Here's WHAT to do about it</p>
        </motion.div>

        {/* What Should I Do Next? */}
        <NextStepCTA twin={career_twin} survival={skill_survival} delay={0.04} />

        {/* Chosen Evolution Paths — from user's selections on Analysis page */}
        <NarrativeDivider label="Your Choices" delay={0.06} />
        <ChosenPathsSection delay={0.08} />

        <NarrativeDivider label="Action Plan" delay={0.1} />

        {/* Roadmap Timeline */}
        {roadmap?.length > 0 && (
          <CollapsibleSection
            title="Quarter-by-Quarter Timeline"
            subtitle="Your upskilling roadmap with milestones"
            delay={0.14}
            defaultOpen
            exportSection
            headerExtra={
              <ExplainButton
                contextType="next_step"
                data={{ roadmap: roadmap.slice(0, 2), skills: skill_survival?.slice(0, 3) }}
              />
            }
          >
            <RoadmapTimeline roadmap={roadmap} />
          </CollapsibleSection>
        )}

        {/* Job Matches */}
        {roadmap && jobs?.length > 0 && (
          <CollapsibleSection
            title="Job Matches"
            subtitle="Roles that match your skill profile"
            delay={0.18}
            defaultOpen={false}
            exportSection
          >
            <Roadmap data={roadmap} jobs={jobs} />
          </CollapsibleSection>
        )}

        <NarrativeDivider label="Learning Resources" delay={0.22} />

        {/* Course Recommendations */}
        {courses?.length > 0 && (
          <CollapsibleSection
            title="Recommended Courses"
            subtitle="Curated learning resources for your highest-priority skills"
            delay={0.26}
            defaultOpen
            exportSection
          >
            <CourseRecommendations data={courses} />
          </CollapsibleSection>
        )}

        {/* CTA to next step */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex justify-center pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(56, 189, 248, 0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/opportunities')}
            className="btn-primary text-base group"
          >
            <span className="relative z-10 flex items-center gap-2">
              See Opportunities
              <motion.svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </motion.svg>
            </span>
          </motion.button>
        </motion.div>

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
