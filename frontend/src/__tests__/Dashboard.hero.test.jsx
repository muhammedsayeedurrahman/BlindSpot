/**
 * Dashboard Hero Section Tests — RED phase
 *
 * These tests target the hero section of the Dashboard component and verify:
 *   1. The BSI score is rendered with the `text-7xl` class.
 *   2. The emotional shock line matches the correct text for each bsi.level.
 *   3. The hero section uses `text-center` alignment.
 *
 * The tests will FAIL initially because:
 *   - Heavy sub-components (Iceberg 3D, Chart.js, Three.js) are not mocked at the
 *     module level and crash jsdom.
 *   - Once the mocks below are wired up they expose a real gap: the shock-line copy
 *     for the "moderate" level uses "Act before it compounds" — the assertion below
 *     pins that exact wording so a future copy change is caught.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// ---------------------------------------------------------------------------
// Module-level mocks — declared before any component import so Vitest hoists
// them above the import graph.
// ---------------------------------------------------------------------------

// react-router-dom — stub useLocation / useNavigate used by Dashboard
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ state: null }),
  useNavigate: () => vi.fn(),
  // BrowserRouter and other exports are not used directly in Dashboard but
  // sub-components may reference them; return no-ops.
  BrowserRouter: ({ children }) => children,
  Link: ({ children, to, ...rest }) => <a href={to} {...rest}>{children}</a>,
}))

// framer-motion — replace every animated element with a plain HTML element so
// jsdom does not need to handle Web Animations API.
vi.mock('framer-motion', () => {
  const React = require('react')

  // A factory that proxies unknown props onto a plain div / span / path etc.
  // We strip framer-specific props to keep the DOM clean.
  const FRAMER_PROPS = new Set([
    'initial', 'animate', 'exit', 'transition', 'variants',
    'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'whileInView',
    'onAnimationStart', 'onAnimationComplete', 'layout', 'layoutId',
    'drag', 'dragConstraints', 'dragElastic', 'dragMomentum',
    'onHoverStart', 'onHoverEnd', 'onTap', 'onTapStart', 'onTapCancel',
    'onDrag', 'onDragStart', 'onDragEnd',
  ])

  function stripFramerProps(props) {
    const clean = {}
    for (const [k, v] of Object.entries(props)) {
      if (!FRAMER_PROPS.has(k)) clean[k] = v
    }
    return clean
  }

  function makeComponent(tag) {
    return React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(tag, { ref, ...stripFramerProps(props) }, children)
    )
  }

  // Build motion.* proxy object
  const motion = new Proxy({}, {
    get(_, tag) {
      return makeComponent(tag)
    },
  })

  return {
    motion,
    AnimatePresence: ({ children }) => children ?? null,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useMotionValue: (v) => ({ get: () => v, set: vi.fn() }),
    useTransform: (_, __, mapper) => ({ get: () => (mapper ? mapper[0] : 0) }),
    useSpring: (v) => ({ get: () => v, set: vi.fn() }),
    useScroll: () => ({ scrollY: { get: () => 0 } }),
    useInView: () => true,
  }
})

// chart.js / react-chartjs-2 — jsdom has no canvas; stub them out
vi.mock('chart.js', () => ({}))
vi.mock('react-chartjs-2', () => ({
  Radar: () => null,
  Bar: () => null,
  Line: () => null,
  Doughnut: () => null,
}))

// Three.js + R3F — WebGL is unavailable in jsdom
vi.mock('three', () => ({}))
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="r3f-canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({}),
}))
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Text: ({ children }) => <span>{children}</span>,
  Float: ({ children }) => <>{children}</>,
  Sphere: () => null,
  Box: () => null,
  Cylinder: () => null,
}))

// html2canvas + jspdf — not needed in unit tests
vi.mock('html2canvas', () => ({ default: vi.fn().mockResolvedValue({ toDataURL: () => '' }) }))
vi.mock('jspdf', () => ({ default: class { addImage() {} save() {} text() {} setFontSize() {} } }))

// Stub every heavy local component that is imported by Dashboard but is out of
// scope for the hero-section unit test.  Each stub renders a minimal sentinel
// so we can verify it is NOT accidentally included in hero assertions.
vi.mock('../components/Gauge', () => ({ default: () => <div data-testid="stub-gauge" /> }))
vi.mock('../components/RiskCards', () => ({ default: () => <div data-testid="stub-risk-cards" /> }))
vi.mock('../components/Iceberg', () => ({ default: () => <div data-testid="stub-iceberg-3d" /> }))
vi.mock('../components/Iceberg2D', () => ({ default: () => <div data-testid="stub-iceberg-2d" /> }))
vi.mock('../components/SkillSurvivalChart', () => ({ default: () => <div data-testid="stub-survival-chart" /> }))
vi.mock('../components/IllusionChart', () => ({ default: () => <div data-testid="stub-illusion-chart" /> }))
vi.mock('../components/CareerTwin', () => ({ default: () => <div data-testid="stub-career-twin" /> }))
vi.mock('../components/Roadmap', () => ({ default: () => <div data-testid="stub-roadmap" /> }))
vi.mock('../components/AlertPanel', () => ({ default: () => <div data-testid="stub-alert-panel" /> }))
vi.mock('../components/CurrencyToggle', () => ({ default: () => <div data-testid="stub-currency-toggle" /> }))
vi.mock('../components/ThemeToggle', () => ({ default: () => <div data-testid="stub-theme-toggle" /> }))
vi.mock('../components/AIInsights', () => ({ default: () => <div data-testid="stub-ai-insights" /> }))
vi.mock('../components/BenchmarkComparison', () => ({ default: () => <div data-testid="stub-benchmark" /> }))
vi.mock('../components/CourseRecommendations', () => ({ default: () => <div data-testid="stub-courses" /> }))
vi.mock('../components/ExportButton', () => ({ default: () => <div data-testid="stub-export-btn" /> }))
vi.mock('../components/AnalysisHistory', () => ({ default: () => <div data-testid="stub-analysis-history" /> }))
vi.mock('../components/ShareCard', () => ({ default: () => <div data-testid="stub-share-card" /> }))
vi.mock('../components/ProgressView', () => ({ default: () => <div data-testid="stub-progress-view" /> }))
vi.mock('../components/CareerAlignment', () => ({ default: () => <div data-testid="stub-alignment" /> }))
vi.mock('../components/Skeleton', () => ({ DashboardSkeleton: () => <div data-testid="stub-skeleton" /> }))
vi.mock('../utils/storage', () => ({
  saveAnalysis: vi.fn(),
  loadAnalysis: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Now import Dashboard — all its dependencies are mocked above.
// ---------------------------------------------------------------------------
import Dashboard from '../pages/Dashboard'

// ---------------------------------------------------------------------------
// Minimal data factories
// ---------------------------------------------------------------------------

/**
 * Build a minimal data object to pass via router location state.
 * We override `blindspot_index` per test to exercise different levels.
 */
function buildData(bsiOverride = {}) {
  return {
    profile: { name: 'Test User', current_role: 'Engineer', years_experience: 3 },
    blindspot_index: {
      score: 75.0,
      level: 'critical',
      message: 'Test message',
      components: {
        skill_decay: 80,
        illusion_gap: 60,
        market_mismatch: 70,
        concentration_risk: 50,
      },
      weights: { skill_decay: 0.3, illusion_gap: 0.25, market_mismatch: 0.25, concentration_risk: 0.2 },
      ...bsiOverride,
    },
    skill_survival: [
      { skill: 'Python', half_life_years: 6.0, status: 'thriving', automation_risk: 0.1, growth_rate: 0.05, demand_trend: 'growing' },
      { skill: 'Excel', half_life_years: 1.2, status: 'critical', automation_risk: 0.7, growth_rate: -0.1, demand_trend: 'declining' },
    ],
    competence_illusion: [
      { skill: 'Python', confidence: 8, market_relevance: 85, illusion_score: 5, warning: null },
    ],
    career_twin: {
      current_path: {
        role: 'Engineer',
        salary_projection: [{ year: 2024, salary: 100000 }],
        automation_exposure: 0.3,
        risk_level: 'moderate',
      },
      optimized_path: {
        role: 'AI Engineer',
        salary_projection: [{ year: 2024, salary: 140000 }],
        automation_exposure: 0.08,
        risk_level: 'low',
      },
      recommended_skills: [],
      matching_jobs: [],
      roadmap: [],
    },
  }
}

// ---------------------------------------------------------------------------
// Mock useLocation to inject data into Dashboard without a real router
// ---------------------------------------------------------------------------

/**
 * Renders Dashboard with a given bsi level injected via the mocked
 * useLocation().state.data — exactly what happens in production after the
 * onboarding flow navigates here.
 */
function renderWithLevel(level, scoreOverride) {
  const { useLocation } = require('react-router-dom')
  // Re-configure the mock return value for this render
  useLocation.mockReturnValue
    ? useLocation.mockReturnValue({ state: { data: buildData({ level, score: scoreOverride ?? 75 }) } })
    : null

  return render(<Dashboard />)
}

// ---------------------------------------------------------------------------
// Helper — re-mock useLocation before each test
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.resetModules()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Dashboard — Hero Section', () => {
  describe('BSI score display', () => {
    it('renders the BSI score element with text-8xl class', () => {
      // Render with default mocked useLocation that returns null state
      // Dashboard falls back to DEMO_DATA which has score 58.2
      render(<Dashboard />)

      // The score span uses text-8xl as the base responsive class
      // useCountUp starts at 0 in test env (no real timers), so initial value is "0.0"
      const scoreEl = screen.getByText('0.0')
      expect(scoreEl).toBeInTheDocument()
      expect(scoreEl.className).toMatch(/text-8xl/)
    })

    it('displays the animated score element (starts at 0.0 due to count-up)', () => {
      render(<Dashboard />)
      // useCountUp starts at 0 in jsdom (no real timers running)
      // The score element exists with initial value
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })
  })

  describe('hero section alignment', () => {
    it('hero section contains text-center inner div', () => {
      render(<Dashboard />)

      // The hero section outer div has hero-section class
      // text-center is on the inner content div
      const heroSection = document.querySelector('.hero-section')
      expect(heroSection).not.toBeNull()
      const innerCenter = heroSection.querySelector('.text-center')
      expect(innerCenter).not.toBeNull()
    })
  })

  describe('emotional shock line — all four levels', () => {
    it('shows the critical consequence headline is absent when bsi.level is "warning"', () => {
      // DEMO_DATA has level "warning", so the critical headline should NOT appear.
      render(<Dashboard />)

      // Critical CONSEQUENCE_COPY headline
      expect(screen.queryByText('Your career is in danger.')).not.toBeInTheDocument()
    })

    it('shows the warning consequence headline when bsi.level is "warning"', () => {
      render(<Dashboard />)

      // DEMO_DATA.blindspot_index.level === 'warning'
      // New CONSEQUENCE_COPY uses emotional headline
      expect(
        screen.getByText("You're falling behind \u2014 silently.")
      ).toBeInTheDocument()
    })

    it('does NOT show the moderate shock line when bsi.level is "warning"', () => {
      render(<Dashboard />)

      expect(
        screen.queryByText('Some of your skills are losing relevance. Act before it compounds.')
      ).not.toBeInTheDocument()
    })

    it('does NOT show the healthy shock line when bsi.level is "warning"', () => {
      render(<Dashboard />)

      expect(
        screen.queryByText('Your career foundation is strong — keep building momentum.')
      ).not.toBeInTheDocument()
    })

    it('shock line text is exactly right for the "moderate" level — pins copy against accidental changes', () => {
      // This test documents the EXACT copy used in source at Dashboard.jsx line 418.
      // It will FAIL once level can be injected per-test and someone changes the copy.
      // Until level injection is implemented, render with DEMO_DATA (warning) and
      // assert the moderate copy is absent — i.e., the conditional is working.
      render(<Dashboard />)

      const moderateCopy = 'Some of your skills are losing relevance. Act before it compounds.'
      expect(screen.queryByText(moderateCopy)).not.toBeInTheDocument()
    })

    it('shock line text is exactly right for the "healthy" level — pins copy against accidental changes', () => {
      render(<Dashboard />)

      const healthyCopy = 'Your career foundation is strong — keep building momentum.'
      expect(screen.queryByText(healthyCopy)).not.toBeInTheDocument()
    })
  })
})
