/**
 * Iceberg2D Component Tests — RED phase
 *
 * These tests verify:
 *   1. The component renders "SAFE ZONE" and "RISK ZONE" section labels.
 *   2. Skills with status "thriving" or "stable" are placed above water.
 *   3. Skills with status "at_risk" or "critical" are placed below water.
 *   4. Edge cases: empty data, all skills above water, all skills below water.
 *
 * Because Iceberg2D renders entirely inside an <svg>, we rely on SVG text
 * elements and data-testid attributes where possible.  Some assertions on SVG
 * text content use `textContent` matching via the DOM directly.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import React from 'react'

// framer-motion mock — replaces motion.* with plain SVG/HTML equivalents.
// Important: motion.g, motion.path, motion.line, motion.circle are SVG tags,
// so we must render the correct element type.
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

  // SVG tags that motion.* can wrap — must be rendered as SVG elements
  const SVG_TAGS = new Set(['svg', 'g', 'path', 'circle', 'rect', 'line', 'text', 'polyline'])

  function makeComponent(tag) {
    return React.forwardRef(({ children, ...props }, ref) => {
      const cleanProps = stripFramerProps(props)
      // pathLength is a framer-specific animation prop on SVG paths — strip it
      delete cleanProps.pathLength
      return React.createElement(tag, { ref, ...cleanProps }, children)
    })
  }

  const motion = new Proxy({}, { get(_, tag) { return makeComponent(tag) } })

  return {
    motion,
    AnimatePresence: ({ children }) => children ?? null,
    useAnimation: () => ({ start: vi.fn() }),
    useMotionValue: (v) => ({ get: () => v, set: vi.fn() }),
  }
})

import Iceberg2D from '../components/Iceberg2D'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const THRIVING_SKILL = { skill: 'TypeScript', half_life_years: 7.0, status: 'thriving', automation_risk: 0.1, demand_trend: 'growing' }
const STABLE_SKILL   = { skill: 'Python',     half_life_years: 5.5, status: 'stable',   automation_risk: 0.15, demand_trend: 'stable' }
const AT_RISK_SKILL  = { skill: 'React',      half_life_years: 3.0, status: 'at_risk',  automation_risk: 0.22, demand_trend: 'stable' }
const CRITICAL_SKILL = { skill: 'Excel',      half_life_years: 1.2, status: 'critical', automation_risk: 0.7,  demand_trend: 'declining' }

const ALL_STATUSES = [THRIVING_SKILL, STABLE_SKILL, AT_RISK_SKILL, CRITICAL_SKILL]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns all <text> SVG elements inside the rendered container as an array
 * of their textContent strings, in document order.
 */
function getSvgTextContents(container) {
  return Array.from(container.querySelectorAll('text'))
    .map((el) => el.textContent.trim())
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// Tests — section labels
// ---------------------------------------------------------------------------

describe('Iceberg2D — section labels', () => {
  it('renders "SAFE ZONE" label', () => {
    const { container } = render(<Iceberg2D survivalData={ALL_STATUSES} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('SAFE ZONE')
  })

  it('renders "RISK ZONE" label', () => {
    const { container } = render(<Iceberg2D survivalData={ALL_STATUSES} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('RISK ZONE')
  })
})

// ---------------------------------------------------------------------------
// Tests — skill placement
// ---------------------------------------------------------------------------

describe('Iceberg2D — skill placement above/below water line', () => {
  it('renders the thriving skill name in the SVG', () => {
    const { container } = render(<Iceberg2D survivalData={ALL_STATUSES} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('TypeScript')
  })

  it('renders the stable skill name in the SVG', () => {
    const { container } = render(<Iceberg2D survivalData={ALL_STATUSES} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('Python')
  })

  it('renders the at_risk skill name in the SVG', () => {
    const { container } = render(<Iceberg2D survivalData={ALL_STATUSES} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('React')
  })

  it('renders the critical skill name in the SVG', () => {
    const { container } = render(<Iceberg2D survivalData={ALL_STATUSES} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('Excel')
  })

  it('above-water skills (thriving, stable) appear before "RISK ZONE" label in DOM order', () => {
    /**
     * We verify that the SVG text element for "TypeScript" (thriving) appears
     * BEFORE the text element for "Excel" (critical) in the DOM, confirming
     * the above/below split is wired to the correct data partitions.
     */
    const { container } = render(<Iceberg2D survivalData={ALL_STATUSES} />)

    const allTextEls = Array.from(container.querySelectorAll('text'))
    const textContents = allTextEls.map((el) => el.textContent.trim())

    const tsIndex    = textContents.findIndex((t) => t === 'TypeScript')
    const excelIndex = textContents.findIndex((t) => t === 'Excel')

    expect(tsIndex).toBeGreaterThan(-1)
    expect(excelIndex).toBeGreaterThan(-1)

    // TypeScript (above water / thriving) must appear earlier in DOM than
    // Excel (below water / critical)
    expect(tsIndex).toBeLessThan(excelIndex)
  })

  it('below-water skills (at_risk, critical) appear after above-water skills in DOM order', () => {
    const { container } = render(<Iceberg2D survivalData={ALL_STATUSES} />)

    const allTextEls = Array.from(container.querySelectorAll('text'))
    const textContents = allTextEls.map((el) => el.textContent.trim())

    const pythonIndex = textContents.findIndex((t) => t === 'Python')   // stable
    const reactIndex  = textContents.findIndex((t) => t === 'React')    // at_risk

    expect(pythonIndex).toBeGreaterThan(-1)
    expect(reactIndex).toBeGreaterThan(-1)

    // Python (above water / stable) must appear earlier than React (at_risk)
    expect(pythonIndex).toBeLessThan(reactIndex)
  })

  it('all 4 skill names are present in the rendered SVG', () => {
    const { container } = render(<Iceberg2D survivalData={ALL_STATUSES} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('TypeScript')
    expect(texts).toContain('Python')
    expect(texts).toContain('React')
    expect(texts).toContain('Excel')
  })
})

// ---------------------------------------------------------------------------
// Tests — legend
// ---------------------------------------------------------------------------

describe('Iceberg2D — status legend', () => {
  it('renders a "Thriving" legend entry when a thriving skill is present', () => {
    render(<Iceberg2D survivalData={[THRIVING_SKILL]} />)

    // The legend uses a span with the status label
    expect(screen.getByText(/Thriving \(\d+\)/)).toBeInTheDocument()
  })

  it('renders a "Critical" legend entry when a critical skill is present', () => {
    render(<Iceberg2D survivalData={[CRITICAL_SKILL]} />)

    expect(screen.getByText(/Critical \(\d+\)/)).toBeInTheDocument()
  })

  it('does not render a legend entry for a status with 0 matching skills', () => {
    // Only thriving skill — "Critical" entry should be absent
    render(<Iceberg2D survivalData={[THRIVING_SKILL]} />)

    expect(screen.queryByText(/Critical \(\d+\)/)).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests — edge cases
// ---------------------------------------------------------------------------

describe('Iceberg2D — edge cases', () => {
  it('renders without crashing when survivalData is empty', () => {
    expect(() => render(<Iceberg2D survivalData={[]} />)).not.toThrow()
  })

  it('renders section labels even when survivalData is empty', () => {
    const { container } = render(<Iceberg2D survivalData={[]} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('SAFE ZONE')
    expect(texts).toContain('RISK ZONE')
  })

  it('handles all skills being above water (thriving/stable only)', () => {
    const data = [THRIVING_SKILL, STABLE_SKILL]
    const { container } = render(<Iceberg2D survivalData={data} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('TypeScript')
    expect(texts).toContain('Python')
    // No at_risk or critical skills present
    expect(texts).not.toContain('Excel')
  })

  it('handles all skills being below water (at_risk/critical only)', () => {
    const data = [AT_RISK_SKILL, CRITICAL_SKILL]
    const { container } = render(<Iceberg2D survivalData={data} />)

    const texts = getSvgTextContents(container)
    expect(texts).toContain('React')
    expect(texts).toContain('Excel')
    // No thriving or stable skills present
    expect(texts).not.toContain('TypeScript')
    expect(texts).not.toContain('Python')
  })

  it('truncates skill names longer than 14 characters', () => {
    const longSkill = {
      skill: 'Very Long Skill Name Here',
      half_life_years: 3.0,
      status: 'thriving',
      automation_risk: 0.1,
      demand_trend: 'growing',
    }
    const { container } = render(<Iceberg2D survivalData={[longSkill]} />)

    const texts = getSvgTextContents(container)
    // Source truncates to 12 chars + '...' when skill.skill.length > 14
    expect(texts).toContain('Very Long Sk...')
  })

  it('renders a single skill without crashing', () => {
    expect(() => render(<Iceberg2D survivalData={[THRIVING_SKILL]} />)).not.toThrow()
  })
})
