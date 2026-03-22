import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Gauge from '../components/Gauge'
import RiskCards from '../components/RiskCards'
import Iceberg from '../components/Iceberg'
import Iceberg2D from '../components/Iceberg2D'
import SkillSurvivalChart from '../components/SkillSurvivalChart'
import IllusionChart from '../components/IllusionChart'
import AIInsights from '../components/AIInsights'
import BenchmarkComparison from '../components/BenchmarkComparison'
import AssessmentResults from '../components/AssessmentResults'
import VerificationInsight from '../components/VerificationInsight'
import NarrativeDivider from '../components/NarrativeDivider'
import CollapsibleSection from '../components/CollapsibleSection'
import SkillEvolutionCard from '../components/SkillEvolutionCard'
import SkillGrowthWarning from '../components/SkillGrowthWarning'
import ExplainButton from '../components/ExplainButton'
import useAnalysisStore from '../store/useAnalysisStore'

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold theme-text">{title}</h2>
      {subtitle && <p className="text-xs theme-text-muted mt-0.5">{subtitle}</p>}
    </div>
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

export default function Analysis() {
  const navigate = useNavigate()
  const data = useAnalysisStore((s) => s.data)
  const advanceJourney = useAnalysisStore((s) => s.advanceJourney)
  const [icebergMode, setIcebergMode] = useState('2d')

  const { blindspot_index: bsi, skill_survival, competence_illusion, evolution_paths } = data
  const assessmentData = data.assessment_data || null
  const isAiVerified = data.ai_verified || bsi?.ai_verified || false

  // Mark step 1 as visited
  useEffect(() => {
    advanceJourney(1)
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
          <h1 className="text-2xl md:text-3xl font-bold theme-text mb-1">The Evidence</h1>
          <p className="text-sm theme-text-tertiary">Here's WHY your score is what it is</p>
        </motion.div>

        <NarrativeDivider label="Vulnerabilities" delay={0.04} />

        {/* Risk Factor Cards */}
        <motion.div {...fadeUp(0.08)} data-export-section className="glass-card-premium neon-border p-6">
          <div className="flex items-center justify-between">
            <SectionHeader title="Your Vulnerabilities" subtitle="Where your career is most exposed" />
            <ExplainButton contextType="skill_risk" data={{ score: bsi.score, level: bsi.level, components: bsi.components }} />
          </div>
          <RiskCards components={bsi.components} />
        </motion.div>

        {/* Skill Growth Warnings */}
        {(() => {
          const alignments = data?.career_twin?.career_alignments || []
          if (alignments.length === 0) return null
          // Count how many career alignments each missing skill blocks
          const skillBlockCount = {}
          for (const a of alignments) {
            for (const s of a.missing_skills) {
              if (!skillBlockCount[s]) skillBlockCount[s] = []
              skillBlockCount[s].push(a)
            }
          }
          const limitingSkills = Object.entries(skillBlockCount).filter(([, roles]) => roles.length >= 3)
          if (limitingSkills.length === 0) return null
          return (
            <motion.div {...fadeUp(0.1)} className="space-y-3">
              {limitingSkills.map(([skill, roles]) => (
                <SkillGrowthWarning key={skill} skill={skill} alignments={roles} />
              ))}
            </motion.div>
          )
        })()}

        {/* Skill Iceberg */}
        <motion.div {...fadeUp(0.12)} data-export-section className="glass-card-premium neon-border p-6">
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

        <NarrativeDivider label="Deep Analysis" delay={0.16} />

        {/* Skill Analysis — 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollapsibleSection
            title="Skill Half-Life"
            subtitle="Years until 50% market value loss"
            delay={0.2}
            defaultOpen
            exportSection
          >
            <SkillSurvivalChart data={skill_survival} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Competence Illusion"
            subtitle="Confidence vs. actual market relevance"
            delay={0.22}
            defaultOpen
            exportSection
          >
            <IllusionChart data={competence_illusion} />
          </CollapsibleSection>
        </div>

        {/* Score Breakdown */}
        <CollapsibleSection
          title="Score Breakdown"
          subtitle="Career vulnerability score and industry comparison"
          delay={0.26}
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

        {/* AI Insights + Assessment */}
        {(data.ai_insights || assessmentData) && (
          <CollapsibleSection
            title="AI Insights"
            subtitle="Personalized intelligence, skill verification, and assessment"
            delay={0.3}
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

        {/* Skill Evolution Paths */}
        {(() => {
          const atRiskSkills = (skill_survival || []).filter(
            (s) => s.status === 'critical' || s.status === 'at_risk' || s.half_life_years < 3
          )
          const illusionSkills = (competence_illusion || []).filter((s) => s.illusion_score > 15)
          const atRiskNames = new Set([
            ...atRiskSkills.map((s) => s.skill),
            ...illusionSkills.map((s) => s.skill),
          ])
          const paths = evolution_paths || []
          const relevantPaths = paths.filter((p) => atRiskNames.has(p.skill))

          if (relevantPaths.length === 0) return null
          return (
            <>
              <NarrativeDivider label="Choose Your Path" delay={0.34} />
              <CollapsibleSection
                title="Skill Evolution"
                subtitle="Choose how to grow each at-risk skill"
                delay={0.38}
                defaultOpen
              >
                <div className="space-y-4">
                  {relevantPaths.map((ep, i) => (
                    <SkillEvolutionCard
                      key={ep.skill}
                      skill={ep.skill}
                      paths={ep.paths}
                      delay={0.02 * i}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            </>
          )
        })()}

        {/* CTA to next step */}
        <motion.div
          {...fadeUp(0.42)}
          className="flex justify-center pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(56, 189, 248, 0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/explore')}
            className="btn-primary text-base group"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Careers
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
