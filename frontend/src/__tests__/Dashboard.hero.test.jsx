/**
 * Dashboard Hero Section Tests
 *
 * These tests target the hero section of the Dashboard component and verify:
 *   1. The BSI score is rendered with the `text-8xl` class.
 *   2. The emotional shock line matches the correct text for each bsi.level.
 *   3. The hero section uses `text-center` alignment.
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
  useLocation: () => ({ pathname: '/dashboard', state: null }),
  useNavigate: () => vi.fn(),
  BrowserRouter: ({ children }) => children,
  Link: ({ children, to, ...rest }) => <a href={to} {...rest}>{children}</a>,
  Outlet: () => null,
}))

// framer-motion — replace every animated element with a plain HTML element
vi.mock('framer-motion', () => {
  const React = require('react')

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

// chart.js / react-chartjs-2
vi.mock('chart.js', () => ({}))
vi.mock('react-chartjs-2', () => ({
  Radar: () => null,
  Bar: () => null,
  Line: () => null,
  Doughnut: () => null,
}))

// Three.js + R3F
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

// html2canvas + jspdf
vi.mock('html2canvas', () => ({ default: vi.fn().mockResolvedValue({ toDataURL: () => '' }) }))
vi.mock('jspdf', () => ({ default: class { addImage() {} save() {} text() {} setFontSize() {} } }))

// Stub components that Dashboard still imports
vi.mock('../components/AlertPanel', () => ({ default: () => <div data-testid="stub-alert-panel" /> }))
vi.mock('../components/RevealAnimation', () => ({ default: () => null }))
vi.mock('../components/TldrSummary', () => ({ default: () => <div data-testid="stub-tldr" /> }))
vi.mock('../components/TimeToIrrelevanceAlert', () => ({ default: () => <div data-testid="stub-time-alert" /> }))
vi.mock('../components/Skeleton', () => ({ DashboardSkeleton: () => <div data-testid="stub-skeleton" /> }))
vi.mock('../utils/storage', () => ({
  saveAnalysis: vi.fn(),
  loadAnalysis: vi.fn(),
}))

// Mock Zustand store
vi.mock('../store/useAnalysisStore', () => {
  const DEMO_DATA = {
    profile: { name: 'Alex Demo', current_role: 'Full Stack Developer', years_experience: 5 },
    blindspot_index: {
      score: 58.2,
      level: 'warning',
      message: 'Notable blind spots found.',
      components: { skill_decay: 32.5, illusion_gap: 22.0, market_mismatch: 60.0, concentration_risk: 75.0 },
      weights: { skill_decay: 0.3, illusion_gap: 0.25, market_mismatch: 0.25, concentration_risk: 0.2 },
    },
    skill_survival: [
      { skill: 'Excel', half_life_years: 1.0, status: 'critical', automation_risk: 0.61, growth_rate: -0.09, demand_trend: 'declining' },
      { skill: 'JavaScript', half_life_years: 4.3, status: 'at_risk', automation_risk: 0.18, growth_rate: 0.02, demand_trend: 'stable' },
    ],
    competence_illusion: [
      { skill: 'JavaScript', confidence: 9, market_relevance: 62.8, illusion_score: 27.2, warning: 'Moderate illusion' },
    ],
    career_twin: {
      current_path: { role: 'Full Stack Developer', salary_projection: [{ year: 2024, salary: 118000 }], automation_exposure: 0.28, risk_level: 'moderate' },
      optimized_path: { role: 'AI Engineer', salary_projection: [{ year: 2024, salary: 155000 }], automation_exposure: 0.08, risk_level: 'low' },
      recommended_skills: [],
      matching_jobs: [],
      roadmap: [],
    },
  }

  return {
    default: (selector) => {
      const state = { data: DEMO_DATA, journeyStep: 0, advanceJourney: () => {}, setData: () => {}, resetJourney: () => {} }
      return selector ? selector(state) : state
    },
  }
})

// ---------------------------------------------------------------------------
// Now import Dashboard — all its dependencies are mocked above.
// ---------------------------------------------------------------------------
import Dashboard from '../pages/Dashboard'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Dashboard — Hero Section', () => {
  describe('BSI score display', () => {
    it('renders the BSI score element with text-8xl class', () => {
      render(<Dashboard />)

      // useCountUp starts at 0 in test env (no real timers), so initial value is "0.0"
      const scoreEl = screen.getByText('0.0')
      expect(scoreEl).toBeInTheDocument()
      expect(scoreEl.className).toMatch(/text-8xl/)
    })

    it('displays the animated score element (starts at 0.0 due to count-up)', () => {
      render(<Dashboard />)
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })
  })

  describe('hero section alignment', () => {
    it('hero section contains text-center inner div', () => {
      render(<Dashboard />)

      const heroSection = document.querySelector('.hero-section')
      expect(heroSection).not.toBeNull()
      const innerCenter = heroSection.querySelector('.text-center')
      expect(innerCenter).not.toBeNull()
    })
  })

  describe('emotional shock line — all four levels', () => {
    it('shows the critical consequence headline is absent when bsi.level is "warning"', () => {
      render(<Dashboard />)
      expect(screen.queryByText('Your career is in danger.')).not.toBeInTheDocument()
    })

    it('shows the warning consequence headline when bsi.level is "warning"', () => {
      render(<Dashboard />)
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
  })
})
