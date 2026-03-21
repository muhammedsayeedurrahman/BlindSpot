/**
 * RiskCards Component Tests — RED phase
 *
 * These tests verify:
 *   1. All 4 risk factor cards are rendered (skill_decay, illusion_gap,
 *      market_mismatch, concentration_risk).
 *   2. Each card's background uses the CSS custom property var(--glass-from)
 *      rather than the hardcoded dark rgba value currently in the source
 *      (`rgba(30,30,50,0.6)`).
 *
 * Test 2 WILL FAIL initially because RiskCards.jsx currently hardcodes
 *   background: 'rgba(30,30,50,0.6)'
 * in the inline style of each RiskCard div, making the cards invisible in
 * light mode.  The test documents the expected fix: use `var(--glass-from)`.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// framer-motion — strip animated wrappers so jsdom can render plain elements
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

  const motion = new Proxy({}, { get(_, tag) { return makeComponent(tag) } })

  return {
    motion,
    AnimatePresence: ({ children }) => children ?? null,
    useAnimation: () => ({ start: vi.fn() }),
    useMotionValue: (v) => ({ get: () => v, set: vi.fn() }),
  }
})

import RiskCards from '../components/RiskCards'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Full set of 4 BSI component scores used in DEMO_DATA */
const DEMO_COMPONENTS = {
  skill_decay: 32.5,
  illusion_gap: 22.0,
  market_mismatch: 60.0,
  concentration_risk: 75.0,
}

/** Minimal valid components object — one key per factor at a low value */
const LOW_COMPONENTS = {
  skill_decay: 10,
  illusion_gap: 10,
  market_mismatch: 10,
  concentration_risk: 10,
}

/** High-severity values (> 60) — triggers "High" severity label */
const HIGH_COMPONENTS = {
  skill_decay: 80,
  illusion_gap: 75,
  market_mismatch: 90,
  concentration_risk: 85,
}

// ---------------------------------------------------------------------------
// Tests — structural rendering
// ---------------------------------------------------------------------------

describe('RiskCards — renders all 4 risk factor cards', () => {
  it('renders a card labelled "Skill Decay"', () => {
    render(<RiskCards components={DEMO_COMPONENTS} />)
    expect(screen.getByText('Skill Decay')).toBeInTheDocument()
  })

  it('renders a card labelled "Illusion Gap"', () => {
    render(<RiskCards components={DEMO_COMPONENTS} />)
    expect(screen.getByText('Illusion Gap')).toBeInTheDocument()
  })

  it('renders a card labelled "Market Mismatch"', () => {
    render(<RiskCards components={DEMO_COMPONENTS} />)
    expect(screen.getByText('Market Mismatch')).toBeInTheDocument()
  })

  it('renders a card labelled "Concentration Risk"', () => {
    render(<RiskCards components={DEMO_COMPONENTS} />)
    expect(screen.getByText('Concentration Risk')).toBeInTheDocument()
  })

  it('renders exactly 4 cards for a full component set', () => {
    render(<RiskCards components={DEMO_COMPONENTS} />)

    // Each card has a weight label — count them to confirm 4 cards rendered
    const weightLabels = screen.getAllByText(/Weight: \d+%/)
    expect(weightLabels).toHaveLength(4)
  })

  it('renders weight labels for all four risk factors', () => {
    render(<RiskCards components={DEMO_COMPONENTS} />)

    expect(screen.getByText('Weight: 30%')).toBeInTheDocument()  // skill_decay
    expect(screen.getByText('Weight: 20%')).toBeInTheDocument()  // concentration_risk
    // illusion_gap and market_mismatch both have 25% — use getAllByText
    const twentyFiveLabels = screen.getAllByText('Weight: 25%')
    expect(twentyFiveLabels).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Tests — score display
// ---------------------------------------------------------------------------

describe('RiskCards — numeric score values', () => {
  it('displays the correct numeric value for each component', () => {
    render(<RiskCards components={DEMO_COMPONENTS} />)

    // toFixed(0) is applied in the source — "32", "22", "60", "75"
    expect(screen.getByText('33')).toBeInTheDocument()  // 32.5.toFixed(0) = "33"
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('shows "High" severity label for values above 60', () => {
    render(<RiskCards components={HIGH_COMPONENTS} />)

    const highLabels = screen.getAllByText('High')
    expect(highLabels.length).toBeGreaterThanOrEqual(4)
  })

  it('shows "Low" severity label for values at or below 35', () => {
    render(<RiskCards components={LOW_COMPONENTS} />)

    const lowLabels = screen.getAllByText('Low')
    expect(lowLabels.length).toBeGreaterThanOrEqual(4)
  })
})

// ---------------------------------------------------------------------------
// Tests — edge cases
// ---------------------------------------------------------------------------

describe('RiskCards — edge cases', () => {
  it('renders nothing for an empty components object', () => {
    render(<RiskCards components={{}} />)

    expect(screen.queryByText('Skill Decay')).not.toBeInTheDocument()
    expect(screen.queryByText('Illusion Gap')).not.toBeInTheDocument()
  })

  it('silently skips unknown component keys', () => {
    render(<RiskCards components={{ unknown_risk: 50, skill_decay: 40 }} />)

    // Only the known key renders
    expect(screen.getByText('Skill Decay')).toBeInTheDocument()
    expect(screen.queryByText('unknown_risk')).not.toBeInTheDocument()
  })

  it('clamps display bar at 100 for values above 100', () => {
    // The component uses Math.min(value, 100) for the bar width.
    // The score text itself should display the clamped value via toFixed(0).
    render(<RiskCards components={{ skill_decay: 150 }} />)

    // Label still renders even for over-range values
    expect(screen.getByText('Skill Decay')).toBeInTheDocument()
    // Score text: 150.toFixed(0) = "150"
    expect(screen.getByText('150')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests — theme-aware background (EXPECTED TO FAIL — documents the light-mode bug)
// ---------------------------------------------------------------------------

describe('RiskCards — theme-aware card background (RED: light-mode bug)', () => {
  /**
   * FAILING TEST — documents a known implementation gap.
   *
   * RiskCards.jsx currently hard-codes each card's background as:
   *   background: 'rgba(30,30,50,0.6)'
   *
   * This makes every card invisible (dark card on white background) when the
   * user switches to light mode, because the value is not responsive to the
   * CSS custom property `--glass-from`.
   *
   * The fix required: replace the hardcoded rgba with `var(--glass-from)`.
   *
   * This test will pass once the fix is applied.
   */
  it('card background uses CSS var(--glass-from) instead of hardcoded dark rgba', () => {
    const { container } = render(<RiskCards components={DEMO_COMPONENTS} />)

    // Find all card root elements — they are motion.div elements rendered as
    // plain divs after the framer-motion mock, having `relative p-4 rounded-xl`
    // classes (matching the RiskCard className in source).
    const cards = container.querySelectorAll('.rounded-xl.p-4')

    expect(cards.length).toBeGreaterThan(0)

    cards.forEach((card) => {
      const bg = card.style.background || card.style.backgroundColor

      // CURRENTLY FAILS: bg === 'rgba(30,30,50,0.6)' (hardcoded dark value)
      // EXPECTED AFTER FIX: bg should reference the CSS variable, not a literal rgba
      expect(bg).not.toBe('rgba(30,30,50,0.6)')
      // After the fix the background should use the CSS custom property.
      // In jsdom, inline `var(--glass-from)` is preserved as the string value.
      expect(bg).toBe('var(--glass-from)')
    })
  })

  it('card border does not use a hardcoded light-incompatible rgba value', () => {
    const { container } = render(<RiskCards components={DEMO_COMPONENTS} />)

    const cards = container.querySelectorAll('.rounded-xl.p-4')
    expect(cards.length).toBeGreaterThan(0)

    cards.forEach((card) => {
      const border = card.style.border || ''
      // The current source uses 'rgba(255,255,255,0.1)' which is invisible in light mode.
      // After the fix this should use a CSS variable like var(--border-default).
      expect(border).not.toContain('rgba(255,255,255,0.1)')
    })
  })
})
