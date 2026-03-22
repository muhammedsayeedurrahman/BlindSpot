import { useState, useEffect } from 'react'
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

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

        <NarrativeDivider label="Action Plan" delay={0.08} />

        {/* Roadmap Timeline */}
        {roadmap?.length > 0 && (
          <CollapsibleSection
            title="Quarter-by-Quarter Timeline"
            subtitle="Your upskilling roadmap with milestones"
            delay={0.12}
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
            delay={0.16}
            defaultOpen={false}
            exportSection
          >
            <Roadmap data={roadmap} jobs={jobs} />
          </CollapsibleSection>
        )}

        <NarrativeDivider label="Learning Resources" delay={0.2} />

        {/* Course Recommendations */}
        {courses?.length > 0 && (
          <CollapsibleSection
            title="Recommended Courses"
            subtitle="Curated learning resources for your highest-priority skills"
            delay={0.24}
            defaultOpen
            exportSection
          >
            <CourseRecommendations data={courses} />
          </CollapsibleSection>
        )}

        {/* CTA to next step */}
        <motion.div
          {...fadeUp(0.28)}
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
