import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Gauge from '../components/Gauge'
import Iceberg from '../components/Iceberg'
import SkillSurvivalChart from '../components/SkillSurvivalChart'
import IllusionChart from '../components/IllusionChart'
import CareerTwin from '../components/CareerTwin'
import Roadmap from '../components/Roadmap'
import AlertPanel from '../components/AlertPanel'

// Demo data used when no API result is provided
const DEMO_DATA = {
  profile: {
    name: 'Alex Demo',
    current_role: 'Full Stack Developer',
    years_experience: 5,
  },
  blindspot_index: {
    score: 58.2,
    level: 'warning',
    message: 'Notable blind spots found. Consider upskilling in emerging areas.',
    components: {
      skill_decay: 32.5,
      illusion_gap: 22.0,
      market_mismatch: 60.0,
      concentration_risk: 75.0,
    },
    weights: { skill_decay: 0.3, illusion_gap: 0.25, market_mismatch: 0.25, concentration_risk: 0.2 },
  },
  skill_survival: [
    { skill: 'Excel', half_life_years: 1.5, status: 'critical', automation_risk: 0.6, growth_rate: -0.1, demand_trend: 'declining' },
    { skill: 'JavaScript', half_life_years: 4.3, status: 'at_risk', automation_risk: 0.18, growth_rate: 0.02, demand_trend: 'stable' },
    { skill: 'React', half_life_years: 3.6, status: 'at_risk', automation_risk: 0.2, growth_rate: 0.01, demand_trend: 'stable' },
    { skill: 'SQL', half_life_years: 2.6, status: 'at_risk', automation_risk: 0.25, growth_rate: -0.02, demand_trend: 'stable' },
    { skill: 'Python', half_life_years: 6.3, status: 'stable', automation_risk: 0.15, growth_rate: 0.04, demand_trend: 'stable' },
    { skill: 'TypeScript', half_life_years: 69.3, status: 'thriving', automation_risk: 0.12, growth_rate: 0.12, demand_trend: 'stable' },
  ],
  competence_illusion: [
    { skill: 'JavaScript', confidence: 9, market_relevance: 62.8, illusion_score: 27.2, warning: 'Moderate illusion: JavaScript confidence may not match future market value' },
    { skill: 'React', confidence: 8, market_relevance: 74.0, illusion_score: 6.0, warning: null },
    { skill: 'Excel', confidence: 7, market_relevance: 49.0, illusion_score: 21.0, warning: 'Moderate illusion: Excel confidence may not match future market value' },
    { skill: 'SQL', confidence: 7, market_relevance: 76.8, illusion_score: 0, warning: null },
    { skill: 'Python', confidence: 6, market_relevance: 86.8, illusion_score: 0, warning: null },
    { skill: 'TypeScript', confidence: 5, market_relevance: 86.2, illusion_score: 0, warning: null },
  ],
  career_twin: {
    current_path: {
      role: 'Full Stack Developer',
      salary_projection: [
        { year: 2024, salary: 118000 },
        { year: 2025, salary: 117200 },
        { year: 2026, salary: 116400 },
        { year: 2027, salary: 115000 },
      ],
      automation_exposure: 0.28,
      risk_level: 'moderate',
    },
    optimized_path: {
      role: 'AI Engineer',
      salary_projection: [
        { year: 2024, salary: 150000 },
        { year: 2025, salary: 162000 },
        { year: 2026, salary: 170000 },
        { year: 2027, salary: 185000 },
      ],
      automation_exposure: 0.08,
      risk_level: 'low',
    },
    recommended_skills: [
      { skill: 'Prompt Engineering', priority: 'high', growth_rate: 0.45, category: 'AI/ML' },
      { skill: 'LLM Fine-tuning', priority: 'high', growth_rate: 0.5, category: 'AI/ML' },
      { skill: 'Deep Learning', priority: 'high', growth_rate: 0.3, category: 'AI/ML' },
      { skill: 'Cloud Architecture', priority: 'medium', growth_rate: 0.15, category: 'Infrastructure' },
    ],
    matching_jobs: [
      { title: 'Full Stack Developer', company: 'WebScale', match_percentage: 75, missing_skills: ['Next.js'], salary_range: [110000, 140000] },
      { title: 'Frontend Architect', company: 'PixelPerfect', match_percentage: 50, missing_skills: ['Next.js', 'UI/UX Design'], salary_range: [125000, 155000] },
      { title: 'Data Scientist', company: 'InsightAI', match_percentage: 50, missing_skills: ['Machine Learning', 'Data Analysis'], salary_range: [120000, 155000] },
    ],
    roadmap: [
      { quarter: 'Q1 2025', skill: 'Prompt Engineering', priority: 'high', action: 'Learn Prompt Engineering through projects and courses', milestone: 'Build a project using Prompt Engineering' },
      { quarter: 'Q2 2025', skill: 'LLM Fine-tuning', priority: 'high', action: 'Learn LLM Fine-tuning through projects and courses', milestone: 'Build a project using LLM Fine-tuning' },
      { quarter: 'Q3 2025', skill: 'Deep Learning', priority: 'high', action: 'Learn Deep Learning through projects and courses', milestone: 'Build a project using Deep Learning' },
      { quarter: 'Q4 2025', skill: 'Cloud Architecture', priority: 'medium', action: 'Learn Cloud Architecture through projects and courses', milestone: 'Build a project using Cloud Architecture' },
    ],
  },
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state?.data || DEMO_DATA

  const { profile, blindspot_index: bsi, skill_survival, competence_illusion, career_twin } = data

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeIn} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">BlindSpot</span>{' '}
            <span className="text-white/60 font-light">Dashboard</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {profile.name} &bull; {profile.current_role} &bull; {profile.years_experience}y exp
          </p>
        </div>
        <button onClick={() => navigate('/onboarding')} className="btn-secondary text-sm">
          Re-analyze
        </button>
      </motion.div>

      {/* Alert Panel */}
      <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
        <AlertPanel bsi={bsi} illusions={competence_illusion} survival={skill_survival} />
      </motion.div>

      {/* BSI Score + Iceberg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="glass-card neon-border p-6">
          <h2 className="text-lg font-semibold mb-4 text-white/80">BlindSpot Index</h2>
          <Gauge score={bsi.score} level={bsi.level} />
          <p className="text-center text-white/50 text-sm mt-4">{bsi.message}</p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {Object.entries(bsi.components).map(([key, val]) => (
              <div key={key} className="bg-dark-700/50 rounded-lg p-3">
                <p className="text-xs text-white/40 capitalize">{key.replace('_', ' ')}</p>
                <p className="text-lg font-bold text-neon-cyan">{val.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="glass-card neon-border p-6">
          <h2 className="text-lg font-semibold mb-4 text-white/80">Skill Iceberg</h2>
          <div className="h-80">
            <Iceberg survivalData={skill_survival} />
          </div>
          <p className="text-center text-white/40 text-xs mt-2">
            Above water = thriving skills &bull; Below = at risk
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="glass-card neon-border p-6">
          <h2 className="text-lg font-semibold mb-4 text-white/80">Skill Half-Life</h2>
          <SkillSurvivalChart data={skill_survival} />
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.5 }} className="glass-card neon-border p-6">
          <h2 className="text-lg font-semibold mb-4 text-white/80">Competence Illusion</h2>
          <IllusionChart data={competence_illusion} />
        </motion.div>
      </div>

      {/* Career Twin */}
      <motion.div {...fadeIn} transition={{ delay: 0.6 }} className="glass-card neon-border p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 text-white/80">Career Twin Projection</h2>
        <CareerTwin data={career_twin} />
      </motion.div>

      {/* Roadmap */}
      <motion.div {...fadeIn} transition={{ delay: 0.7 }} className="glass-card neon-border p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 text-white/80">Upskilling Roadmap</h2>
        <Roadmap data={career_twin.roadmap} jobs={career_twin.matching_jobs} />
      </motion.div>

      {/* Footer */}
      <div className="text-center py-8 text-white/20 text-xs">
        BlindSpot AI &mdash; Hackathon Demo
      </div>
    </div>
  )
}
