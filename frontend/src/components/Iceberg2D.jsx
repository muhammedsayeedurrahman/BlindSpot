import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  thriving: { color: '#39ff14', glow: 'rgba(57, 255, 20, 0.25)', label: 'Thriving' },
  stable: { color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.25)', label: 'Stable' },
  at_risk: { color: '#ff6a00', glow: 'rgba(255, 106, 0, 0.25)', label: 'At Risk' },
  critical: { color: '#ff2d7c', glow: 'rgba(255, 45, 124, 0.25)', label: 'Critical' },
}

function SkillPill({ skill, x, y, index, isAbove }) {
  const [hovered, setHovered] = useState(false)
  const config = STATUS_CONFIG[skill.status] || STATUS_CONFIG.stable
  const delay = 0.4 + index * 0.08

  return (
    <motion.g
      initial={{ opacity: 0, y: isAbove ? 10 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'default' }}
    >
      {/* Pill background */}
      <rect
        x={x - 48}
        y={y - 12}
        width={96}
        height={24}
        rx={12}
        fill={hovered ? config.glow : `${config.color}15`}
        stroke={config.color}
        strokeWidth={hovered ? 1.5 : 0.8}
        opacity={hovered ? 1 : 0.8}
        style={{
          filter: hovered ? `drop-shadow(0 0 8px ${config.glow})` : 'none',
          transition: 'all 0.2s ease',
        }}
      />

      {/* Skill name */}
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={config.color}
        fontSize="10"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {skill.skill.length > 14 ? skill.skill.slice(0, 12) + '...' : skill.skill}
      </text>

      {/* Hover tooltip */}
      {hovered && (
        <g>
          <rect
            x={x - 72}
            y={isAbove ? y - 50 : y + 20}
            width={144}
            height={34}
            rx={6}
            fill="rgba(15, 23, 42, 0.95)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          <text
            x={x}
            y={isAbove ? y - 38 : y + 32}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={config.color}
            fontSize="9"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {config.label} — {skill.half_life_years?.toFixed(1) || '?'}yr half-life
          </text>
          <text
            x={x}
            y={isAbove ? y - 24 : y + 46}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="8"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {skill.demand_trend ? `Trend: ${skill.demand_trend}` : ''}
            {skill.automation_risk ? ` · Auto risk: ${(skill.automation_risk * 100).toFixed(0)}%` : ''}
          </text>
        </g>
      )}
    </motion.g>
  )
}

function RisingBubble({ x, delay, size, duration }) {
  return (
    <motion.circle
      cx={x}
      r={size}
      fill="rgba(0, 240, 255, 0.12)"
      stroke="rgba(0, 240, 255, 0.2)"
      strokeWidth="0.5"
      initial={{ cy: 400, opacity: 0 }}
      animate={{
        cy: [400, 250],
        opacity: [0, 0.6, 0],
      }}
      transition={{
        delay,
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

export default function Iceberg2D({ survivalData }) {
  const { above, below } = useMemo(() => ({
    above: survivalData.filter((s) => s.status === 'thriving' || s.status === 'stable'),
    below: survivalData.filter((s) => s.status === 'at_risk' || s.status === 'critical'),
  }), [survivalData])

  const PILLS_PER_ROW = 3
  const PILL_SPACING = 160
  const CENTER_X = 300
  const ROW_HEIGHT = 36

  // Position pills in grid rows
  const positionPills = (items, baseY) =>
    items.map((_, i) => {
      const row = Math.floor(i / PILLS_PER_ROW)
      const col = i % PILLS_PER_ROW
      const itemsInRow = Math.min(PILLS_PER_ROW, items.length - row * PILLS_PER_ROW)
      const rowStartX = CENTER_X - ((itemsInRow - 1) * PILL_SPACING) / 2
      return { x: rowStartX + col * PILL_SPACING, y: baseY + row * ROW_HEIGHT }
    })

  const abovePositions = useMemo(() => positionPills(above, 90), [above])
  const belowPositions = useMemo(() => positionPills(below, 290), [below])

  const BUBBLE_COUNT = 12

  // Generate bubble positions
  const bubbles = useMemo(() =>
    Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
      x: 100 + Math.random() * 400,
      delay: Math.random() * 6,
      size: 1.5 + Math.random() * 3,
      duration: 4 + Math.random() * 4,
    })), [])

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 600 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Water gradient */}
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 240, 255, 0.03)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.4)" />
          </linearGradient>
          {/* Iceberg gradient above */}
          <linearGradient id="iceAbove" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 240, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(0, 240, 255, 0.02)" />
          </linearGradient>
          {/* Iceberg gradient below */}
          <linearGradient id="iceBelow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(180, 74, 255, 0.05)" />
            <stop offset="100%" stopColor="rgba(255, 45, 124, 0.08)" />
          </linearGradient>
        </defs>

        {/* Sky / above water area */}
        <rect x="0" y="0" width="600" height="230" fill="transparent" />

        {/* Water area */}
        <rect x="0" y="230" width="600" height="190" fill="url(#waterGrad)" />

        {/* Iceberg shape — above water (small tip) */}
        <motion.path
          d="M 240 230 L 280 145 L 320 135 L 360 155 L 370 230 Z"
          fill="url(#iceAbove)"
          stroke="rgba(0, 240, 255, 0.2)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Iceberg shape — below water (much larger) */}
        <motion.path
          d="M 210 230 L 170 290 L 150 350 L 200 400 L 300 415 L 400 400 L 450 350 L 430 290 L 390 230 Z"
          fill="url(#iceBelow)"
          stroke="rgba(180, 74, 255, 0.15)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        />

        {/* Water line — dashed horizontal */}
        <motion.line
          x1="30" y1="230" x2="570" y2="230"
          stroke="rgba(0, 240, 255, 0.35)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Water line label — left */}
        <text x="38" y="225" fill="rgba(0, 240, 255, 0.5)" fontSize="9" fontFamily="Inter, system-ui, sans-serif" fontWeight="500">
          VISIBLE
        </text>
        <text x="38" y="244" fill="rgba(180, 74, 255, 0.5)" fontSize="9" fontFamily="Inter, system-ui, sans-serif" fontWeight="500">
          HIDDEN
        </text>

        {/* Rising bubbles */}
        {bubbles.map((b, i) => (
          <RisingBubble key={i} {...b} />
        ))}

        {/* Above water skill pills */}
        {above.map((skill, i) => (
          <SkillPill
            key={skill.skill}
            skill={skill}
            x={abovePositions[i]?.x || 300}
            y={abovePositions[i]?.y || 100}
            index={i}
            isAbove
          />
        ))}

        {/* Below water skill pills */}
        {below.map((skill, i) => (
          <SkillPill
            key={skill.skill}
            skill={skill}
            x={belowPositions[i]?.x || 300}
            y={belowPositions[i]?.y || 300}
            index={i + above.length}
            isAbove={false}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end pointer-events-none">
        <div className="flex items-center gap-3 text-xs flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = survivalData.filter((s) => s.status === key).length
            if (count === 0) return null
            return (
              <span key={key} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                />
                <span className="theme-text-tertiary">
                  {cfg.label} ({count})
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
