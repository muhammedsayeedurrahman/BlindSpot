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
    { skill: 'Excel', half_life_years: 1.0, status: 'critical', automation_risk: 0.61, growth_rate: -0.09, demand_trend: 'declining' },
    { skill: 'JavaScript', half_life_years: 4.3, status: 'at_risk', automation_risk: 0.18, growth_rate: 0.02, demand_trend: 'stable' },
    { skill: 'React', half_life_years: 3.6, status: 'at_risk', automation_risk: 0.21, growth_rate: 0.01, demand_trend: 'stable' },
    { skill: 'SQL', half_life_years: 2.6, status: 'at_risk', automation_risk: 0.24, growth_rate: -0.02, demand_trend: 'stable' },
    { skill: 'Python', half_life_years: 6.3, status: 'stable', automation_risk: 0.14, growth_rate: 0.04, demand_trend: 'stable' },
    { skill: 'TypeScript', half_life_years: 10.0, status: 'stable', automation_risk: 0.12, growth_rate: 0.12, demand_trend: 'stable' },
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
    career_alignments: [
      { role: 'AI Engineer', category: 'AI/ML', match_score: 68, missing_skills: ['Prompt Engineering', 'LLM Fine-tuning', 'Deep Learning'], missing_count: 3, salary_range: [150000, 175000], growth_trend: 0.28, automation_exposure: 0.08 },
      { role: 'ML Engineer', category: 'AI/ML', match_score: 55, missing_skills: ['Deep Learning', 'LLM Fine-tuning', 'Cloud Architecture'], missing_count: 3, salary_range: [145000, 165000], growth_trend: 0.22, automation_exposure: 0.10 },
      { role: 'Full Stack Developer', category: 'Engineering', match_score: 52, missing_skills: ['Next.js', 'Cloud Architecture'], missing_count: 2, salary_range: [125000, 145000], growth_trend: 0.08, automation_exposure: 0.20 },
      { role: 'Data Scientist', category: 'Data', match_score: 45, missing_skills: ['Machine Learning', 'Deep Learning', 'Statistics'], missing_count: 3, salary_range: [130000, 150000], growth_trend: 0.12, automation_exposure: 0.18 },
      { role: 'Platform Engineer', category: 'Infrastructure', match_score: 38, missing_skills: ['Docker', 'Terraform', 'Kubernetes'], missing_count: 3, salary_range: [135000, 155000], growth_trend: 0.18, automation_exposure: 0.12 },
    ],
    roadmap: [
      { quarter: 'Q1 2025', skill: 'Prompt Engineering', priority: 'high', action: 'Learn Prompt Engineering through projects and courses', milestone: 'Build a project using Prompt Engineering' },
      { quarter: 'Q2 2025', skill: 'LLM Fine-tuning', priority: 'high', action: 'Learn LLM Fine-tuning through projects and courses', milestone: 'Build a project using LLM Fine-tuning' },
      { quarter: 'Q3 2025', skill: 'Deep Learning', priority: 'high', action: 'Learn Deep Learning through projects and courses', milestone: 'Build a project using Deep Learning' },
      { quarter: 'Q4 2025', skill: 'Cloud Architecture', priority: 'medium', action: 'Learn Cloud Architecture through projects and courses', milestone: 'Build a project using Cloud Architecture' },
    ],
  },
  evolution_paths: [
    {
      skill: 'Excel',
      paths: [
        { type: 'upgrade', label: 'Advanced Excel', skills: ['Power Query', 'VBA', 'DAX'], months: 2 },
        { type: 'expand', label: 'Data Tools', skills: ['SQL', 'Power BI', 'Tableau'], months: 4 },
        { type: 'career', label: 'Data Analyst', role: 'Data Analyst', skills: ['SQL', 'Python', 'Statistics', 'Data Visualization'], months: 8 },
      ],
    },
    {
      skill: 'JavaScript',
      paths: [
        { type: 'upgrade', label: 'Modern JavaScript', skills: ['ES2024+', 'Web APIs', 'Performance Optimization'], months: 2 },
        { type: 'expand', label: 'Full Stack JS', skills: ['TypeScript', 'Node.js', 'Next.js'], months: 4 },
        { type: 'career', label: 'AI Engineer', role: 'AI Engineer', skills: ['TypeScript', 'LangChain', 'Prompt Engineering', 'Vector DBs'], months: 8 },
      ],
    },
    {
      skill: 'SQL',
      paths: [
        { type: 'upgrade', label: 'Advanced SQL', skills: ['Window Functions', 'CTEs', 'Query Optimization'], months: 2 },
        { type: 'expand', label: 'Data Engineering', skills: ['dbt', 'Airflow', 'Spark'], months: 5 },
        { type: 'career', label: 'Data Engineer', role: 'Data Engineer', skills: ['Python', 'dbt', 'Kafka', 'Cloud Data Warehouses'], months: 9 },
      ],
    },
  ],
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

export default DEMO_DATA
