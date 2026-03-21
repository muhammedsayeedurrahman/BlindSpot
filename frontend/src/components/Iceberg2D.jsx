import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  thriving: { color: '#39ff14', glow: 'rgba(57, 255, 20, 0.3)', label: 'Thriving' },
  stable: { color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.3)', label: 'Stable' },
  at_risk: { color: '#ff6a00', glow: 'rgba(255, 106, 0, 0.3)', label: 'At Risk' },
  critical: { color: '#ff2d7c', glow: 'rgba(255, 45, 124, 0.3)', label: 'Critical' },
}

const WATER_Y = 240
const VIEW_W = 700
const VIEW_H = 480
const CENTER_X = VIEW_W / 2

function SkillPill({ skill, x, y, index, isAbove }) {
  const [hovered, setHovered] = useState(false)
  const config = STATUS_CONFIG[skill.status] || STATUS_CONFIG.stable
  const delay = 0.3 + index * 0.05

  const label = skill.skill.length > 14 ? skill.skill.slice(0, 12) + '...' : skill.skill
  const pillWidth = Math.min(115, Math.max(72, label.length * 7 + 28))
  const halfW = pillWidth / 2

  return (
    <motion.g
      initial={{ opacity: 0, y: isAbove ? 10 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow behind pill on hover */}
      {hovered && (
        <ellipse
          cx={x}
          cy={y}
          rx={halfW + 4}
          ry={15}
          fill={config.glow}
          opacity={0.35}
          style={{ filter: 'blur(5px)' }}
        />
      )}

      {/* Pill background */}
      <rect
        x={x - halfW}
        y={y - 12}
        width={pillWidth}
        height={24}
        rx={12}
        fill={hovered ? `${config.color}28` : `${config.color}10`}
        stroke={config.color}
        strokeWidth={hovered ? 1.4 : 0.5}
        opacity={hovered ? 1 : 0.9}
        style={{ transition: 'all 0.2s ease' }}
      />

      {/* Status dot */}
      <circle
        cx={x - halfW + 12}
        cy={y}
        r={2.5}
        fill={config.color}
        style={{ filter: `drop-shadow(0 0 2px ${config.color})` }}
      />

      {/* Skill name */}
      <text
        x={x + 2}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={hovered ? '#ffffff' : config.color}
        fontSize="9.5"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="0.2"
        style={{ transition: 'fill 0.2s ease' }}
      >
        {label}
      </text>

      {/* Hover tooltip */}
      {hovered && (
        <motion.g
          initial={{ opacity: 0, y: isAbove ? 3 : -3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
        >
          <rect
            x={x - 75}
            y={isAbove ? y - 52 : y + 20}
            width={150}
            height={36}
            rx={6}
            fill="rgba(8, 12, 28, 0.95)"
            stroke={`${config.color}35`}
            strokeWidth="0.8"
            style={{ filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.4))' }}
          />
          <text
            x={x}
            y={isAbove ? y - 39 : y + 33}
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
            y={isAbove ? y - 27 : y + 45}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="7.5"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {skill.demand_trend ? `Trend: ${skill.demand_trend}` : ''}
            {skill.automation_risk ? ` · Risk: ${(skill.automation_risk * 100).toFixed(0)}%` : ''}
          </text>
        </motion.g>
      )}
    </motion.g>
  )
}

function WavePath({ id, amplitude, frequency, opacity, yBase, color }) {
  const d = useMemo(() => {
    const points = []
    for (let x = 0; x <= VIEW_W; x += 2) {
      const y = yBase + Math.sin((x / frequency) + id * 1.5) * amplitude
      points.push(`${x},${y.toFixed(1)}`)
    }
    return `M ${points[0]} ${points.slice(1).map(p => `L ${p}`).join(' ')}`
  }, [yBase, amplitude, frequency, id])

  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth="1"
      fill="none"
      opacity={opacity}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
    />
  )
}

function RisingBubble({ x, delay, size, duration }) {
  return (
    <motion.circle
      cx={x}
      r={size}
      fill="rgba(0, 240, 255, 0.06)"
      stroke="rgba(0, 240, 255, 0.12)"
      strokeWidth="0.5"
      initial={{ cy: VIEW_H - 20, opacity: 0 }}
      animate={{
        cy: [VIEW_H - 20, WATER_Y + 5],
        opacity: [0, 0.4, 0],
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

function LightRay({ x, delay, width }) {
  return (
    <motion.polygon
      points={`${x},${WATER_Y} ${x - width},${VIEW_H} ${x + width},${VIEW_H}`}
      fill="rgba(0, 240, 255, 0.012)"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{
        delay,
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export default function Iceberg2D({ survivalData }) {
  const { above, below } = useMemo(() => ({
    above: survivalData.filter((s) => s.status === 'thriving' || s.status === 'stable'),
    below: survivalData.filter((s) => s.status === 'at_risk' || s.status === 'critical'),
  }), [survivalData])

  // Dynamic layout — adapt pills per row to skill count
  const abovePPR = above.length > 6 ? 4 : 3
  const belowPPR = below.length > 6 ? 4 : 3
  const aboveSpacing = above.length > 6 ? 140 : 160
  const belowSpacing = below.length > 6 ? 140 : 160
  const ROW_HEIGHT = 36

  const positionPills = (items, baseY, ppr, spacing) =>
    items.map((_, i) => {
      const row = Math.floor(i / ppr)
      const col = i % ppr
      const itemsInRow = Math.min(ppr, items.length - row * ppr)
      const rowStartX = CENTER_X - ((itemsInRow - 1) * spacing) / 2
      return { x: rowStartX + col * spacing, y: baseY + row * ROW_HEIGHT }
    })

  const abovePositions = useMemo(
    () => positionPills(above, 55, abovePPR, aboveSpacing),
    [above, abovePPR, aboveSpacing]
  )
  const belowPositions = useMemo(
    () => positionPills(below, 295, belowPPR, belowSpacing),
    [below, belowPPR, belowSpacing]
  )

  const bubbles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      x: 100 + (i / 14) * (VIEW_W - 200) + (i % 3) * 15,
      delay: (i * 0.6) % 8,
      size: 1 + (i % 4) * 0.7,
      duration: 5 + (i % 3) * 2,
    })), [])

  const lightRays = useMemo(() => [
    { x: 200, delay: 0, width: 45 },
    { x: CENTER_X, delay: 2, width: 55 },
    { x: 500, delay: 4, width: 40 },
  ], [])

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="waterGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 50, 90, 0.04)" />
            <stop offset="40%" stopColor="rgba(0, 30, 60, 0.12)" />
            <stop offset="100%" stopColor="rgba(10, 10, 30, 0.35)" />
          </linearGradient>

          <linearGradient id="iceAbove2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 240, 255, 0.15)" />
            <stop offset="50%" stopColor="rgba(0, 220, 240, 0.08)" />
            <stop offset="100%" stopColor="rgba(0, 240, 255, 0.03)" />
          </linearGradient>

          <linearGradient id="iceBelow2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(180, 40, 100, 0.05)" />
            <stop offset="50%" stopColor="rgba(255, 45, 124, 0.08)" />
            <stop offset="100%" stopColor="rgba(255, 45, 124, 0.14)" />
          </linearGradient>

          <filter id="iceGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="waterShimmer" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>

        {/* Sky area */}
        <rect x="0" y="0" width={VIEW_W} height={WATER_Y} fill="transparent" />

        {/* Water area */}
        <rect x="0" y={WATER_Y - 2} width={VIEW_W} height={VIEW_H - WATER_Y + 2} fill="url(#waterGrad2)" />

        {/* Underwater light rays */}
        {lightRays.map((ray, i) => (
          <LightRay key={i} {...ray} />
        ))}

        {/* Iceberg — above water tip */}
        <motion.path
          d={`M ${CENTER_X - 60} ${WATER_Y} C ${CENTER_X - 55} ${WATER_Y - 25}, ${CENTER_X - 30} ${WATER_Y - 75}, ${CENTER_X - 10} ${WATER_Y - 95} C ${CENTER_X} ${WATER_Y - 102}, ${CENTER_X + 12} ${WATER_Y - 98}, ${CENTER_X + 20} ${WATER_Y - 90} C ${CENTER_X + 40} ${WATER_Y - 68}, ${CENTER_X + 58} ${WATER_Y - 22}, ${CENTER_X + 65} ${WATER_Y} Z`}
          fill="url(#iceAbove2)"
          stroke="rgba(0, 240, 255, 0.2)"
          strokeWidth="0.8"
          strokeLinejoin="round"
          filter="url(#iceGlow)"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Iceberg — below water body (much larger) */}
        <motion.path
          d={`M ${CENTER_X - 90} ${WATER_Y} C ${CENTER_X - 115} ${WATER_Y + 35}, ${CENTER_X - 145} ${WATER_Y + 80}, ${CENTER_X - 150} ${WATER_Y + 110} C ${CENTER_X - 155} ${WATER_Y + 140}, ${CENTER_X - 140} ${WATER_Y + 165}, ${CENTER_X - 110} ${WATER_Y + 185} C ${CENTER_X - 70} ${WATER_Y + 205}, ${CENTER_X - 20} ${WATER_Y + 215}, ${CENTER_X} ${WATER_Y + 218} C ${CENTER_X + 20} ${WATER_Y + 215}, ${CENTER_X + 70} ${WATER_Y + 205}, ${CENTER_X + 110} ${WATER_Y + 185} C ${CENTER_X + 140} ${WATER_Y + 165}, ${CENTER_X + 155} ${WATER_Y + 140}, ${CENTER_X + 150} ${WATER_Y + 110} C ${CENTER_X + 145} ${WATER_Y + 80}, ${CENTER_X + 115} ${WATER_Y + 35}, ${CENTER_X + 90} ${WATER_Y} Z`}
          fill="url(#iceBelow2)"
          stroke="rgba(255, 45, 124, 0.1)"
          strokeWidth="0.8"
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Inner detail line — below water */}
        <motion.path
          d={`M ${CENTER_X - 70} ${WATER_Y + 20} C ${CENTER_X - 90} ${WATER_Y + 55}, ${CENTER_X - 110} ${WATER_Y + 100}, ${CENTER_X - 100} ${WATER_Y + 145} C ${CENTER_X - 85} ${WATER_Y + 175}, ${CENTER_X} ${WATER_Y + 190}, ${CENTER_X + 85} ${WATER_Y + 175} C ${CENTER_X + 100} ${WATER_Y + 145}, ${CENTER_X + 110} ${WATER_Y + 100}, ${CENTER_X + 90} ${WATER_Y + 55} C ${CENTER_X + 80} ${WATER_Y + 35}, ${CENTER_X + 70} ${WATER_Y + 20}, ${CENTER_X + 70} ${WATER_Y + 20}`}
          fill="none"
          stroke="rgba(255, 45, 124, 0.05)"
          strokeWidth="0.6"
          strokeDasharray="4 10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />

        {/* Water surface waves */}
        <WavePath id={0} amplitude={2} frequency={85} opacity={0.35} yBase={WATER_Y - 1} color="rgba(0, 240, 255, 0.35)" />
        <WavePath id={1} amplitude={1.5} frequency={65} opacity={0.2} yBase={WATER_Y + 1} color="rgba(0, 240, 255, 0.2)" />
        <WavePath id={2} amplitude={1} frequency={110} opacity={0.12} yBase={WATER_Y + 3} color="rgba(0, 200, 220, 0.12)" />

        {/* Water line — primary dashed */}
        <motion.line
          x1="30" y1={WATER_Y} x2={VIEW_W - 30} y2={WATER_Y}
          stroke="rgba(0, 240, 255, 0.25)"
          strokeWidth="1"
          strokeDasharray="10 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Zone labels — positioned clearly on either side of water line */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* SAFE ZONE label — above water, left side */}
          <rect x="40" y={WATER_Y - 30} width="88" height="22" rx="4"
            fill="rgba(0, 240, 255, 0.06)"
            stroke="rgba(0, 240, 255, 0.12)"
            strokeWidth="0.5"
          />
          <text x="84" y={WATER_Y - 18} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(0, 240, 255, 0.7)"
            fontSize="7.5" fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700" letterSpacing="1.8"
          >
            SAFE ZONE
          </text>

          {/* RISK ZONE label — below water, left side */}
          <rect x="40" y={WATER_Y + 8} width="88" height="22" rx="4"
            fill="rgba(255, 45, 124, 0.06)"
            stroke="rgba(255, 45, 124, 0.12)"
            strokeWidth="0.5"
          />
          <text x="84" y={WATER_Y + 20} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255, 45, 124, 0.7)"
            fontSize="7.5" fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700" letterSpacing="1.8"
          >
            RISK ZONE
          </text>
        </motion.g>

        {/* Rising bubbles */}
        {bubbles.map((b, i) => (
          <RisingBubble key={`bubble-${i}`} {...b} />
        ))}

        {/* Above water skill pills */}
        {above.map((skill, i) => (
          <SkillPill
            key={skill.skill}
            skill={skill}
            x={abovePositions[i]?.x || CENTER_X}
            y={abovePositions[i]?.y || 80}
            index={i}
            isAbove
          />
        ))}

        {/* Below water skill pills */}
        {below.map((skill, i) => (
          <SkillPill
            key={skill.skill}
            skill={skill}
            x={belowPositions[i]?.x || CENTER_X}
            y={belowPositions[i]?.y || 310}
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
