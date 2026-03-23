import { useEffect } from 'react'
import { motion } from 'framer-motion'
import CareerTwin from '../components/CareerTwin'
import CareerAlignment from '../components/CareerAlignment'
import ShareCard from '../components/ShareCard'
import ProgressView from '../components/ProgressView'
import CollapsibleSection from '../components/CollapsibleSection'
import NarrativeDivider from '../components/NarrativeDivider'
import RoleDetailCard from '../components/RoleDetailCard'
import useAnalysisStore from '../store/useAnalysisStore'
import useJourneyStore from '../store/useJourneyStore'
import useRoleDetails from '../hooks/useRoleDetails'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

export default function Opportunities() {
  const data = useAnalysisStore((s) => s.data)
  const advanceJourney = useAnalysisStore((s) => s.advanceJourney)

  const { profile, blindspot_index: bsi, skill_survival, career_twin } = data
  const completedSkills = useJourneyStore((s) => s.completedSkills)
  const { getDetails, isLoading, fetchRoles } = useRoleDetails()

  const alignments = career_twin?.career_alignments || []
  const readyRoles = alignments.filter((a) =>
    a.missing_skills.every((s) => completedSkills.includes(s))
  )
  const learningRoles = alignments.filter((a) =>
    !a.missing_skills.every((s) => completedSkills.includes(s))
  )

  // Mark step 4 as visited
  useEffect(() => {
    advanceJourney(4)
  }, [advanceJourney])

  const handleExpand = (role) => {
    fetchRoles([role])
  }

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
          <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">Opportunities</h1>
          <p className="text-sm theme-text-tertiary">Here's WHERE you're heading</p>
        </motion.div>

        {/* Ready to Apply — unlocked roles */}
        {readyRoles.length > 0 && (
          <>
            <NarrativeDivider label="Ready to Apply" delay={0.04} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {readyRoles.map((item, i) => (
                <RoleDetailCard
                  key={item.role}
                  role={item.role}
                  matchScore={item.match_score}
                  missingSkills={item.missing_skills}
                  salaryRange={item.salary_range}
                  growthTrend={item.growth_trend}
                  category={item.category}
                  automationRisk={item.automation_risk}
                  index={i}
                  details={getDetails(item.role)}
                  isLoadingDetails={isLoading(item.role)}
                  onExpand={handleExpand}
                />
              ))}
            </div>
          </>
        )}

        {/* Keep Learning — locked roles */}
        {learningRoles.length > 0 && (
          <>
            <NarrativeDivider label={readyRoles.length > 0 ? 'Keep Learning' : 'Career Paths'} delay={0.06} />
            <CollapsibleSection
              title={readyRoles.length > 0 ? 'Unlock More Roles' : 'Career Alignment'}
              subtitle={readyRoles.length > 0 ? 'Complete skill quizzes to unlock these careers' : 'Where your skills fit in the future job market'}
              delay={0.08}
              defaultOpen={readyRoles.length === 0}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {learningRoles.map((item, i) => (
                  <RoleDetailCard
                    key={item.role}
                    role={item.role}
                    matchScore={item.match_score}
                    missingSkills={item.missing_skills}
                    salaryRange={item.salary_range}
                    growthTrend={item.growth_trend}
                    category={item.category}
                    automationRisk={item.automation_risk}
                    index={i}
                    details={getDetails(item.role)}
                    isLoadingDetails={isLoading(item.role)}
                    onExpand={handleExpand}
                  />
                ))}
              </div>
            </CollapsibleSection>
          </>
        )}

        {/* Fallback: original alignment if no unlock data */}
        {alignments.length === 0 && career_twin?.career_alignments?.length > 0 && (
          <motion.div {...fadeUp(0.04)}>
            <CareerAlignment alignments={career_twin.career_alignments} />
          </motion.div>
        )}

        <NarrativeDivider label="Your Two Futures" delay={0.12} />

        {/* Career Twin Projection */}
        <CollapsibleSection
          title="Your Two Futures"
          subtitle="Current trajectory vs. what's possible if you act now"
          delay={0.12}
          defaultOpen
          exportSection
        >
          <CareerTwin data={career_twin} />
        </CollapsibleSection>

        <NarrativeDivider label="Share & Track" delay={0.16} />

        {/* Share & Track — 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollapsibleSection
            title="Share Your Score"
            subtitle="Generate a shareable career score card"
            delay={0.2}
            defaultOpen={false}
          >
            <ShareCard bsi={bsi} profile={profile} survival={skill_survival} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Progress Over Time"
            subtitle="Track your BSI score across analyses"
            delay={0.22}
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
