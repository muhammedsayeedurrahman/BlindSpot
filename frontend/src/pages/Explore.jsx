import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import NarrativeDivider from '../components/NarrativeDivider'
import RoleDetailCard from '../components/RoleDetailCard'
import useAnalysisStore from '../store/useAnalysisStore'
import useRoleDetails from '../hooks/useRoleDetails'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

export default function Explore() {
  const navigate = useNavigate()
  const data = useAnalysisStore((s) => s.data)
  const advanceJourney = useAnalysisStore((s) => s.advanceJourney)
  const prefetchedRef = useRef(false)

  const alignments = data?.career_twin?.career_alignments || []
  const { getDetails, isLoading, fetchRoles } = useRoleDetails()

  const heroRole = alignments[0] || null
  const gridRoles = alignments.slice(1)

  useEffect(() => {
    advanceJourney(2)
  }, [advanceJourney])

  // Prefetch hero card immediately
  useEffect(() => {
    if (heroRole) {
      fetchRoles([heroRole.role])
    }
  }, [heroRole, fetchRoles])

  // Prefetch top 3 after 2s delay
  useEffect(() => {
    if (prefetchedRef.current || alignments.length <= 1) return
    const timer = setTimeout(() => {
      const top3 = alignments.slice(1, 4).map((a) => a.role)
      if (top3.length > 0) {
        fetchRoles(top3)
      }
      prefetchedRef.current = true
    }, 2000)
    return () => clearTimeout(timer)
  }, [alignments, fetchRoles])

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

        <motion.div {...fadeUp(0)}>
          <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">Explore Careers</h1>
          <p className="text-sm theme-text-tertiary">Discover roles that align with your skills and growth potential</p>
        </motion.div>

        {alignments.length > 0 ? (
          <>
            {/* Hero card — best match */}
            {heroRole && (
              <>
                <NarrativeDivider label="Best Match" delay={0.04} />
                <RoleDetailCard
                  role={heroRole.role}
                  matchScore={heroRole.match_score}
                  missingSkills={heroRole.missing_skills}
                  salaryRange={heroRole.salary_range}
                  growthTrend={heroRole.growth_trend}
                  category={heroRole.category}
                  automationRisk={heroRole.automation_risk}
                  index={0}
                  isHero
                  defaultExpanded
                  details={getDetails(heroRole.role)}
                  isLoadingDetails={isLoading(heroRole.role)}
                  onExpand={handleExpand}
                />
              </>
            )}

            {/* Grid — remaining cards */}
            {gridRoles.length > 0 && (
              <>
                <NarrativeDivider label="More Careers" delay={0.08} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gridRoles.map((item, i) => (
                    <RoleDetailCard
                      key={item.role}
                      role={item.role}
                      matchScore={item.match_score}
                      missingSkills={item.missing_skills}
                      salaryRange={item.salary_range}
                      growthTrend={item.growth_trend}
                      category={item.category}
                      automationRisk={item.automation_risk}
                      index={i + 1}
                      details={getDetails(item.role)}
                      isLoadingDetails={isLoading(item.role)}
                      onExpand={handleExpand}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <motion.div {...fadeUp(0.08)} className="glass-card-premium p-8 text-center">
            <p className="theme-text-tertiary">No career alignments available. Complete your analysis first.</p>
          </motion.div>
        )}

        {/* CTA to next step */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex justify-center pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(56, 189, 248, 0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/roadmap')}
            className="btn-primary text-base group"
          >
            <span className="relative z-10 flex items-center gap-2">
              See Your Roadmap
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

        <div className="text-center py-8">
          <div className="section-divider mb-6" />
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
            BlindSpot AI &mdash; Career Warning System
          </span>
        </div>
      </div>
    </motion.div>
  )
}
