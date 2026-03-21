import { useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import Gauge from '../components/Gauge'
import Iceberg from '../components/Iceberg'
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
import { saveAnalysis, loadAnalysis } from '../utils/storage'

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
  ai_insights: {
    source: 'rule_based',
    insights: [
      { key: 'career_direction', title: 'Career Direction', icon: 'compass', text: 'Your career trajectory has notable blind spots (BSI: 58). The path from Full Stack Developer to AI Engineer is achievable and would strengthen your market position significantly.' },
      { key: 'skill_gaps', title: 'Skill Gap Analysis', icon: 'target', text: '4 skills are showing signs of market erosion. While not yet critical, JavaScript, React, SQL should be supplemented with Prompt Engineering, LLM Fine-tuning to maintain competitiveness.' },
      { key: 'market_positioning', title: 'Market Positioning', icon: 'chart', text: 'Your skill portfolio has limited overlap (40%) with the top demanded skills in the market. Focus on high-growth areas like Prompt Engineering, LLM Fine-tuning to close this gap.' },
      { key: 'action_items', title: 'Immediate Action Items', icon: 'lightning', text: 'Re-evaluate your confidence in JavaScript — there\'s a 27-point gap between your confidence and market reality. Start with Prompt Engineering this quarter and aim to complete a portfolio project within 3 months.' },
    ],
  },
  benchmarks: {
    user_scores: { skill_breadth: 75, automation_readiness: 72, market_alignment: 40, growth_potential: 35, salary_position: 48 },
    industry_avg: { skill_breadth: 60, automation_readiness: 55, market_alignment: 50, growth_potential: 50, salary_position: 50 },
    summary: "You're above average in Skill Breadth, Automation Readiness, but below in Market Alignment, Growth Potential.",
  },
  course_recommendations: [
    {
      skill: 'Prompt Engineering', priority: 'high', context: 'AI & Machine Learning',
      reason: 'Your target role AI Engineer requires Prompt Engineering proficiency with a AI & Machine Learning focus.',
      courses: [
        { id: 20, title: 'Prompt Engineering for Developers', provider: 'DeepLearning.AI', difficulty: 'beginner', estimated_hours: 8, topics: ['prompt patterns', 'chain-of-thought', 'few-shot learning', 'API integration'], rating: 4.8, free: true },
        { id: 21, title: 'Advanced Prompt Engineering & LLM Applications', provider: 'Coursera', difficulty: 'intermediate', estimated_hours: 20, topics: ['RAG', 'agents', 'evaluation', 'production prompts', 'guardrails'], rating: 4.6, free: false },
      ],
    },
    {
      skill: 'LLM Fine-tuning', priority: 'high', context: 'AI & Machine Learning',
      reason: 'Your target role AI Engineer requires LLM Fine-tuning proficiency with a AI & Machine Learning focus.',
      courses: [
        { id: 22, title: 'LLM Fine-tuning with Hugging Face', provider: 'DeepLearning.AI', difficulty: 'advanced', estimated_hours: 15, topics: ['LoRA', 'QLoRA', 'PEFT', 'training data', 'evaluation metrics'], rating: 4.7, free: true },
        { id: 23, title: 'Production LLM Fine-tuning & Deployment', provider: 'Udemy', difficulty: 'advanced', estimated_hours: 25, topics: ['RLHF', 'model serving', 'optimization', 'cost management', 'monitoring'], rating: 4.5, free: false },
      ],
    },
    {
      skill: 'Deep Learning', priority: 'high', context: 'AI & Machine Learning',
      reason: 'Your target role AI Engineer requires Deep Learning proficiency with a AI & Machine Learning focus.',
      courses: [
        { id: 18, title: 'Deep Learning Specialization', provider: 'Coursera', difficulty: 'advanced', estimated_hours: 80, topics: ['CNNs', 'RNNs', 'transformers', 'GANs', 'transfer learning'], rating: 4.9, free: false },
        { id: 19, title: 'PyTorch for Deep Learning', provider: 'Udemy', difficulty: 'advanced', estimated_hours: 35, topics: ['PyTorch', 'neural networks', 'computer vision', 'NLP', 'deployment'], rating: 4.6, free: false },
      ],
    },
  ],
}

const COMPONENT_LABELS = {
  skill_decay: { label: 'Skill Decay', icon: '30%', color: 'text-neon-orange' },
  illusion_gap: { label: 'Illusion Gap', icon: '25%', color: 'text-neon-purple' },
  market_mismatch: { label: 'Market Mismatch', icon: '25%', color: 'text-neon-pink' },
  concentration_risk: { label: 'Concentration Risk', icon: '20%', color: 'text-neon-cyan' },
}


function ComponentBar({ name, value }) {
  const meta = COMPONENT_LABELS[name] || { label: name, icon: '', color: 'theme-text' }
  const barColor = value > 60 ? 'bg-neon-pink' : value > 35 ? 'bg-neon-orange' : 'bg-neon-green'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs theme-text-tertiary">{meta.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] theme-text-muted">{meta.icon}</span>
          <span className={`text-sm font-bold font-mono ${meta.color}`}>{value.toFixed(1)}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-quaternary)' }}>
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ boxShadow: '0 0 8px currentColor' }}
        />
      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold theme-text">{title}</h2>
      {subtitle && <p className="text-xs theme-text-muted mt-0.5">{subtitle}</p>}
    </div>
  )
}

/* ── Stagger animation variants ────────────────────────────── */
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

  const { profile, blindspot_index: bsi, skill_survival, competence_illusion, career_twin } = data

  const thriving = skill_survival.filter((s) => s.status === 'thriving').length
  const atRisk = skill_survival.filter((s) => s.status === 'at_risk' || s.status === 'critical').length

  const handleSave = useCallback(() => {
    saveAnalysis(data)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }, [data])

  const handleLoadHistory = useCallback((id) => {
    const loaded = loadAnalysis(id)
    if (loaded) setData(loaded)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
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
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <ThemeToggle />
            <CurrencyToggle />
            <ExportButton profileName={profile.name} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-colors micro-press"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-tertiary)',
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
              </svg>
              Save
            </motion.button>
            <AnalysisHistory onLoad={handleLoadHistory} />
            <button
              onClick={() => navigate('/onboarding')}
              className="px-4 py-2 rounded-lg text-xs font-medium border transition-colors micro-press"
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Profile header + quick stats */}
        <motion.div {...fadeUp(0)} data-export-section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold theme-text">
              {profile.name}
            </h1>
            <p className="text-sm mt-0.5 theme-text-tertiary">
              {profile.current_role} &bull; {profile.years_experience} years experience
            </p>
          </div>
          <div className="flex items-center gap-4">
            {[
              { value: thriving, label: 'Thriving', color: 'text-neon-green' },
              { value: atRisk, label: 'At Risk', color: 'text-neon-orange' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.08, y: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="stat-card"
              >
                <p className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] theme-text-muted uppercase">{stat.label}</p>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ scale: 1.08, y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="stat-card"
            >
              <p className="text-lg font-bold font-mono" style={{ color: bsi.level === 'critical' ? '#ff2d7c' : bsi.level === 'warning' ? '#ff6a00' : '#39ff14' }}>
                {bsi.score.toFixed(0)}
              </p>
              <p className="text-[10px] theme-text-muted uppercase">BSI Score</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Alert Panel */}
        <motion.div {...fadeUp(0.08)}>
          <AlertPanel bsi={bsi} illusions={competence_illusion} survival={skill_survival} />
        </motion.div>

        {/* AI Insights */}
        {data.ai_insights && (
          <motion.div {...fadeUp(0.12)} data-export-section className="glass-card-premium neon-border p-6">
              <SectionHeader title="AI Career Insights" subtitle="Personalized intelligence from your analysis" />
              <AIInsights data={data.ai_insights} />
            </motion.div>
        )}

        {/* BSI Score + Iceberg */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <motion.div {...fadeUp(0.16)} data-export-section className="glass-card-premium neon-border p-6 h-full">
              <SectionHeader title="BlindSpot Index" subtitle="Career vulnerability composite score" />
              <Gauge score={bsi.score} level={bsi.level} />
              <p className="text-center theme-text-tertiary text-xs mt-4 leading-relaxed">{bsi.message}</p>

              <div className="mt-6 space-y-3">
                {Object.entries(bsi.components).map(([key, val]) => (
                  <ComponentBar key={key} name={key} value={val} />
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <motion.div {...fadeUp(0.2)} data-export-section className="glass-card-premium neon-border p-6 h-full">
              <SectionHeader title="Skill Iceberg" subtitle="Above water = thriving &bull; Below = at risk" />
              <div className="h-[400px] -mx-2">
                <Iceberg survivalData={skill_survival} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Benchmark */}
        {data.benchmarks && (
          <motion.div {...fadeUp(0.24)} data-export-section className="glass-card-premium neon-border p-6">
            <SectionHeader title="Industry Benchmark" subtitle="Your profile vs. industry average across 5 dimensions" />
            <BenchmarkComparison data={data.benchmarks} />
          </motion.div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div {...fadeUp(0.28)} data-export-section className="glass-card-premium neon-border p-6 h-full">
            <SectionHeader title="Skill Half-Life" subtitle="Years until 50% market value loss" />
            <SkillSurvivalChart data={skill_survival} />
          </motion.div>

          <motion.div {...fadeUp(0.32)} data-export-section className="glass-card-premium neon-border p-6 h-full">
            <SectionHeader title="Competence Illusion" subtitle="Confidence vs. actual market relevance" />
            <IllusionChart data={competence_illusion} />
          </motion.div>
        </div>

        {/* Career Twin */}
        <motion.div {...fadeUp(0.36)} data-export-section className="glass-card-premium neon-border p-6">
          <SectionHeader title="Career Twin Projection" subtitle="Current path vs. optimized trajectory" />
          <CareerTwin data={career_twin} />
        </motion.div>

        {/* Roadmap */}
        <motion.div {...fadeUp(0.4)} data-export-section className="glass-card-premium neon-border p-6">
          <SectionHeader title="Upskilling Roadmap" subtitle="Quarter-by-quarter learning plan + job matches" />
          <Roadmap data={career_twin.roadmap} jobs={career_twin.matching_jobs} />
        </motion.div>

        {/* Course Recommendations */}
        {data.course_recommendations && data.course_recommendations.length > 0 && (
          <motion.div {...fadeUp(0.44)} data-export-section className="glass-card-premium neon-border p-6">
            <SectionHeader title="Recommended Courses" subtitle="Context-aware learning resources for your target role" />
            <CourseRecommendations data={data.course_recommendations} />
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <div className="section-divider mb-6" />
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
            BlindSpot AI — Career Intelligence Platform
          </span>
        </div>
      </div>
    </div>
  )
}
