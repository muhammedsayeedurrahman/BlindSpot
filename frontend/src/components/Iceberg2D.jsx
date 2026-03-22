import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  thriving: { color: '#34D399', glow: 'rgba(52, 211, 153, 0.25)', label: 'Thriving' },
  stable: { color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.25)', label: 'Stable' },
  at_risk: { color: '#FB923C', glow: 'rgba(251, 146, 60, 0.25)', label: 'At Risk' },
  critical: { color: '#FB7185', glow: 'rgba(251, 113, 133, 0.25)', label: 'Critical' },
}

const WATER_Y = 240
const VIEW_W = 700
const VIEW_H = 480
const CENTER_X = VIEW_W / 2

/* ── Crystalline iceberg paths ─────────────────────────────── */
const ICE_ABOVE = `M ${CENTER_X - 55} ${WATER_Y}
  L ${CENTER_X - 40} ${WATER_Y - 30}
  L ${CENTER_X - 28} ${WATER_Y - 58}
  L ${CENTER_X - 8} ${WATER_Y - 98}
  L ${CENTER_X + 5} ${WATER_Y - 95}
  L ${CENTER_X + 22} ${WATER_Y - 72}
  L ${CENTER_X + 42} ${WATER_Y - 38}
  L ${CENTER_X + 60} ${WATER_Y} Z`

const ICE_BELOW = `M ${CENTER_X - 80} ${WATER_Y}
  L ${CENTER_X - 105} ${WATER_Y + 28}
  L ${CENTER_X - 130} ${WATER_Y + 65}
  L ${CENTER_X - 145} ${WATER_Y + 105}
  L ${CENTER_X - 138} ${WATER_Y + 148}
  L ${CENTER_X - 115} ${WATER_Y + 178}
  L ${CENTER_X - 75} ${WATER_Y + 200}
  L ${CENTER_X - 30} ${WATER_Y + 215}
  L ${CENTER_X + 10} ${WATER_Y + 218}
  L ${CENTER_X + 55} ${WATER_Y + 210}
  L ${CENTER_X + 95} ${WATER_Y + 192}
  L ${CENTER_X + 125} ${WATER_Y + 165}
  L ${CENTER_X + 142} ${WATER_Y + 130}
  L ${CENTER_X + 140} ${WATER_Y + 90}
  L ${CENTER_X + 120} ${WATER_Y + 50}
  L ${CENTER_X + 95} ${WATER_Y + 22}
  L ${CENTER_X + 75} ${WATER_Y} Z`

/* Internal facet lines for crystal structure */
const FACET_LINES = [
  { x1: CENTER_X - 8, y1: WATER_Y - 98, x2: CENTER_X - 40, y2: WATER_Y, o: 0.12 },
  { x1: CENTER_X - 8, y1: WATER_Y - 98, x2: CENTER_X + 42, y2: WATER_Y - 38, o: 0.08 },
  { x1: CENTER_X + 5, y1: WATER_Y - 95, x2: CENTER_X - 28, y2: WATER_Y - 58, o: 0.06 },
  { x1: CENTER_X - 80, y1: WATER_Y, x2: CENTER_X - 30, y2: WATER_Y + 215, o: 0.06 },
  { x1: CENTER_X + 75, y1: WATER_Y, x2: CENTER_X + 10, y2: WATER_Y + 218, o: 0.06 },
  { x1: CENTER_X - 105, y1: WATER_Y + 28, x2: CENTER_X + 55, y2: WATER_Y + 210, o: 0.04 },
  { x1: CENTER_X - 145, y1: WATER_Y + 105, x2: CENTER_X + 95, y2: WATER_Y + 192, o: 0.04 },
  { x1: CENTER_X - 130, y1: WATER_Y + 65, x2: CENTER_X - 75, y2: WATER_Y + 200, o: 0.05 },
  { x1: CENTER_X + 120, y1: WATER_Y + 50, x2: CENTER_X + 125, y2: WATER_Y + 165, o: 0.05 },
]

/* ── Reflection path (flipped above-water, compressed) ─────── */
const ICE_REFLECTION = `M ${CENTER_X - 55} ${WATER_Y}
  L ${CENTER_X - 40} ${WATER_Y + 9}
  L ${CENTER_X - 28} ${WATER_Y + 17}
  L ${CENTER_X - 8} ${WATER_Y + 29}
  L ${CENTER_X + 5} ${WATER_Y + 28}
  L ${CENTER_X + 22} ${WATER_Y + 21}
  L ${CENTER_X + 42} ${WATER_Y + 11}
  L ${CENTER_X + 60} ${WATER_Y} Z`

/* ── SkillPill with floating animation + connection line ───── */
function SkillPill({ skill, x, y, index, isAbove, icebergEdgeY }) {
  const [hovered, setHovered] = useState(false)
  const config = STATUS_CONFIG[skill.status] || STATUS_CONFIG.stable
  const delay = 0.3 + index * 0.05

  const label = skill.skill.length > 14 ? skill.skill.slice(0, 12) + '...' : skill.skill
  const pillWidth = Math.min(115, Math.max(72, label.length * 7 + 28))
  const halfW = pillWidth / 2

  // Depth fog: pills further below water become more transparent
  const depthFactor = isAbove ? 1 : Math.max(0.45, 1 - (y - WATER_Y) / (VIEW_H - WATER_Y) * 0.7)
  const floatClass = `iceberg-pill-float-${(index % 4) + 1}`

  return (
    <motion.g
      initial={{ opacity: 0, y: isAbove ? 10 : -10 }}
      animate={{ opacity: depthFactor, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
      className={floatClass}
    >
      {/* Connection line to iceberg */}
      <line
        x1={x}
        y1={y}
        x2={CENTER_X + (x > CENTER_X ? 20 : -20)}
        y2={icebergEdgeY}
        stroke={config.color}
        strokeWidth="0.4"
        strokeDasharray="3 5"
        opacity={hovered ? 0.35 : 0.12}
        style={{ transition: 'opacity 0.3s ease' }}
      />

      {/* Glow behind pill on hover */}
      {hovered && (
        <ellipse
          cx={x} cy={y} rx={halfW + 6} ry={16}
          fill={config.glow} opacity={0.4}
          style={{ filter: 'blur(6px)' }}
        />
      )}

      {/* Pill background */}
      <rect
        x={x - halfW} y={y - 12} width={pillWidth} height={24} rx={12}
        fill={hovered ? `${config.color}28` : `${config.color}10`}
        stroke={config.color}
        strokeWidth={hovered ? 1.4 : 0.5}
        opacity={hovered ? 1 : 0.9}
        style={{ transition: 'all 0.2s ease' }}
      />

      {/* Status dot with pulsing glow */}
      <circle
        cx={x - halfW + 12} cy={y} r={3}
        fill={config.color}
        style={{ filter: `drop-shadow(0 0 3px ${config.color})` }}
      />
      {hovered && (
        <circle
          cx={x - halfW + 12} cy={y} r={5}
          fill="none" stroke={config.color} strokeWidth="0.6"
          opacity={0.5}
        />
      )}

      {/* Skill name */}
      <text
        x={x + 2} y={y + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill={hovered ? '#ffffff' : config.color}
        fontSize="9.5" fontWeight="600"
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
            x={x - 75} y={isAbove ? y - 52 : y + 20}
            width={150} height={36} rx={6}
            fill="rgba(8, 12, 28, 0.95)"
            stroke={`${config.color}35`} strokeWidth="0.8"
            style={{ filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.4))' }}
          />
          <text
            x={x} y={isAbove ? y - 39 : y + 33}
            textAnchor="middle" dominantBaseline="middle"
            fill={config.color} fontSize="9" fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {config.label} — {skill.half_life_years?.toFixed(1) || '?'}yr half-life
          </text>
          <text
            x={x} y={isAbove ? y - 27 : y + 45}
            textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)" fontSize="7.5"
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

/* ── SVG Definitions (gradients + filters) ─────────────────── */
function SvgDefs() {
  return (
    <defs>
      {/* Water gradient — 5-stop depth */}
      <linearGradient id="waterGrad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(0, 60, 100, 0.06)" />
        <stop offset="20%" stopColor="rgba(0, 45, 80, 0.12)" />
        <stop offset="50%" stopColor="rgba(5, 25, 55, 0.22)" />
        <stop offset="80%" stopColor="rgba(8, 15, 40, 0.32)" />
        <stop offset="100%" stopColor="rgba(10, 10, 30, 0.42)" />
      </linearGradient>

      {/* Ice above — frosted cyan */}
      <linearGradient id="iceAbove2" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="rgba(180, 230, 255, 0.22)" />
        <stop offset="40%" stopColor="rgba(56, 189, 248, 0.14)" />
        <stop offset="100%" stopColor="rgba(100, 220, 255, 0.06)" />
      </linearGradient>

      {/* Ice below — deep rose to coral */}
      <linearGradient id="iceBelow2" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="rgba(120, 60, 100, 0.06)" />
        <stop offset="40%" stopColor="rgba(251, 113, 133, 0.10)" />
        <stop offset="100%" stopColor="rgba(200, 80, 120, 0.16)" />
      </linearGradient>

      {/* Wave fill gradient */}
      <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(56, 189, 248, 0.08)" />
        <stop offset="100%" stopColor="rgba(56, 189, 248, 0.0)" />
      </linearGradient>

      {/* Frost glass filter */}
      <filter id="frostGlass" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
        <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.6"
          specularExponent="15" result="spec">
          <fePointLight x="350" y="100" z="200" />
        </feSpecularLighting>
        <feComposite in="SourceGraphic" in2="spec" operator="arithmetic"
          k1="0" k2="1" k3="0.15" k4="0" />
      </filter>

      {/* Ice glow */}
      <filter id="iceGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Underwater distortion */}
      <filter id="underwaterDistort" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.008"
          numOctaves="3" seed="42" result="noise">
          <animate attributeName="seed" values="42;100;42" dur="8s" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
      </filter>

      {/* Caustic light pattern */}
      <filter id="causticPattern" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="turbulence" baseFrequency="0.03 0.04"
          numOctaves="2" seed="5" result="turb">
          <animate attributeName="baseFrequency" values="0.03 0.04;0.04 0.03;0.03 0.04"
            dur="6s" repeatCount="indefinite" />
        </feTurbulence>
        <feColorMatrix in="turb" type="luminanceToAlpha" result="alpha" />
        <feComposite in="SourceGraphic" in2="alpha" operator="in" result="caustics" />
        <feBlend in="SourceGraphic" in2="caustics" mode="screen" />
      </filter>

      {/* Clip for underwater region */}
      <clipPath id="underwaterClip">
        <rect x="0" y={WATER_Y} width={VIEW_W} height={VIEW_H - WATER_Y} />
      </clipPath>
    </defs>
  )
}

/* ── Animated wave surface ─────────────────────────────────── */
function AnimatedWaves() {
  const waves = useMemo(() => {
    const makeWave = (amp, freq, yBase) => {
      const pts = []
      for (let x = -20; x <= VIEW_W + 20; x += 3) {
        const y = yBase + Math.sin(x / freq) * amp
        pts.push(`${x},${y.toFixed(1)}`)
      }
      const line = `M ${pts[0]} ${pts.slice(1).map(p => `L ${p}`).join(' ')}`
      const fill = `${line} L ${VIEW_W + 20},${yBase + 30} L -20,${yBase + 30} Z`
      return { line, fill }
    }
    return [
      makeWave(3.5, 80, WATER_Y - 2),
      makeWave(2.5, 60, WATER_Y),
      makeWave(1.8, 110, WATER_Y + 2),
    ]
  }, [])

  return (
    <g>
      {waves.map((w, i) => (
        <g key={i}>
          <path d={w.fill} fill="url(#waveFill)" opacity={0.5 - i * 0.12}>
            <animateTransform attributeName="transform" type="translate"
              values={`0,0; ${12 + i * 6},${i % 2 === 0 ? 1.5 : -1}; 0,0`}
              dur={`${3 + i * 2}s`} repeatCount="indefinite" />
          </path>
          <path d={w.line} fill="none"
            stroke={`rgba(56, 189, 248, ${0.35 - i * 0.08})`}
            strokeWidth="0.8">
            <animateTransform attributeName="transform" type="translate"
              values={`0,0; ${12 + i * 6},${i % 2 === 0 ? 1.5 : -1}; 0,0`}
              dur={`${3 + i * 2}s`} repeatCount="indefinite" />
          </path>
        </g>
      ))}
    </g>
  )
}

/* ── Underwater light rays ─────────────────────────────────── */
function LightRays() {
  const rays = [
    { x: 150, w: 35, delay: 0, dur: 7 },
    { x: 250, w: 50, delay: 1.5, dur: 6 },
    { x: CENTER_X, w: 60, delay: 0.5, dur: 8 },
    { x: 450, w: 45, delay: 2, dur: 6.5 },
    { x: 550, w: 30, delay: 3, dur: 7.5 },
  ]
  return (
    <g clipPath="url(#underwaterClip)">
      {rays.map((r, i) => (
        <motion.polygon
          key={i}
          points={`${r.x},${WATER_Y} ${r.x - r.w},${VIEW_H} ${r.x + r.w},${VIEW_H}`}
          fill="rgba(56, 189, 248, 0.018)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ delay: r.delay, duration: r.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </g>
  )
}

/* ── Bubbles (3 size tiers) ────────────────────────────────── */
function Bubbles() {
  const bubbles = useMemo(() => {
    const list = []
    // Tiny bubbles
    for (let i = 0; i < 10; i++) {
      list.push({ x: 80 + i * 58, r: 0.8 + (i % 3) * 0.4, delay: i * 0.7, dur: 4 + (i % 3) * 1.5, drift: (i % 2 === 0 ? 1 : -1) * 3 })
    }
    // Medium bubbles
    for (let i = 0; i < 7; i++) {
      list.push({ x: 120 + i * 72, r: 2 + (i % 2) * 0.8, delay: i * 1.1, dur: 6 + (i % 3), drift: (i % 2 === 0 ? -1 : 1) * 5 })
    }
    // Large bubbles
    for (let i = 0; i < 3; i++) {
      list.push({ x: 200 + i * 150, r: 3.5 + i * 0.5, delay: i * 2.5, dur: 8 + i, drift: (i % 2 === 0 ? 1 : -1) * 8 })
    }
    return list
  }, [])

  return (
    <g clipPath="url(#underwaterClip)">
      {bubbles.map((b, i) => (
        <motion.circle
          key={`b-${i}`}
          cx={b.x}
          r={b.r}
          fill={`rgba(56, 189, 248, ${b.r > 3 ? 0.05 : b.r > 1.5 ? 0.06 : 0.04})`}
          stroke={`rgba(56, 189, 248, ${b.r > 3 ? 0.12 : 0.08})`}
          strokeWidth="0.4"
          initial={{ cy: VIEW_H - 10, opacity: 0 }}
          animate={{
            cy: [VIEW_H - 10, WATER_Y + 8],
            opacity: [0, 0.5, 0],
            cx: [b.x, b.x + b.drift, b.x],
          }}
          transition={{ delay: b.delay, duration: b.dur, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </g>
  )
}

/* ── Above-water sparkles ──────────────────────────────────── */
function Sparkles() {
  const sparks = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => ({
      cx: CENTER_X - 50 + i * 18,
      cy: WATER_Y - 40 - (i % 3) * 25,
      delay: i * 0.8,
    })), [])

  return (
    <g>
      {sparks.map((s, i) => (
        <motion.circle
          key={`sp-${i}`}
          cx={s.cx} cy={s.cy} r={1}
          fill="rgba(200, 235, 255, 0.6)"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ delay: s.delay, duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </g>
  )
}

/* ── Foam particles near waterline ─────────────────────────── */
function WaterFoam() {
  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      cx: 100 + i * 70 + (i % 3) * 20,
      cy: WATER_Y - 1 + (i % 3) * 3,
      r: 1.2 + (i % 2) * 0.6,
    })), [])

  return (
    <g>
      {particles.map((p, i) => (
        <motion.circle
          key={`foam-${i}`}
          cx={p.cx} cy={p.cy} r={p.r}
          fill="rgba(200, 230, 255, 0.12)"
          animate={{ opacity: [0.1, 0.25, 0.1], cx: [p.cx, p.cx + 8, p.cx] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </g>
  )
}

/* ── Main component ────────────────────────────────────────── */
export default function Iceberg2D({ survivalData }) {
  const { above, below } = useMemo(() => ({
    above: survivalData.filter((s) => s.status === 'thriving' || s.status === 'stable'),
    below: survivalData.filter((s) => s.status === 'at_risk' || s.status === 'critical'),
  }), [survivalData])

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

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <SvgDefs />

        {/* Sky area — transparent */}
        <rect x="0" y="0" width={VIEW_W} height={WATER_Y} fill="transparent" />

        {/* Water area — rich depth gradient */}
        <rect x="0" y={WATER_Y - 2} width={VIEW_W} height={VIEW_H - WATER_Y + 2}
          fill="url(#waterGrad2)" />

        {/* Underwater light rays */}
        <LightRays />

        {/* Iceberg — below water body (rendered first, behind above-water) */}
        <motion.path
          d={ICE_BELOW}
          fill="url(#iceBelow2)"
          stroke="rgba(251, 113, 133, 0.12)"
          strokeWidth="0.8"
          strokeLinejoin="bevel"
          filter="url(#causticPattern)"
          clipPath="url(#underwaterClip)"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${CENTER_X}px ${WATER_Y + 110}px` }}
        />

        {/* Below-water facet lines */}
        {FACET_LINES.slice(3).map((f, i) => (
          <motion.line
            key={`fb-${i}`}
            x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2}
            stroke="rgba(251, 113, 133, 0.08)"
            strokeWidth="0.5"
            clipPath="url(#underwaterClip)"
            initial={{ opacity: 0 }}
            animate={{ opacity: f.o }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
          />
        ))}

        {/* Water surface reflection of tip */}
        <path
          d={ICE_REFLECTION}
          fill="rgba(56, 189, 248, 0.04)"
          clipPath="url(#underwaterClip)"
          style={{ filter: 'blur(2px)' }}
          opacity={0.08}
        />

        {/* Rising bubbles */}
        <Bubbles />

        {/* Iceberg — above water crystalline tip */}
        <motion.path
          d={ICE_ABOVE}
          fill="url(#iceAbove2)"
          stroke="rgba(180, 230, 255, 0.25)"
          strokeWidth="0.8"
          strokeLinejoin="bevel"
          filter="url(#frostGlass)"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${CENTER_X}px ${WATER_Y}px` }}
        />

        {/* Above-water facet lines */}
        {FACET_LINES.slice(0, 3).map((f, i) => (
          <motion.line
            key={`fa-${i}`}
            x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2}
            stroke="rgba(180, 230, 255, 0.15)"
            strokeWidth="0.4"
            initial={{ opacity: 0 }}
            animate={{ opacity: f.o }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
          />
        ))}

        {/* Sparkles on ice above water */}
        <Sparkles />

        {/* Animated wave surface */}
        <AnimatedWaves />

        {/* Foam near waterline */}
        <WaterFoam />

        {/* Water line — primary dashed */}
        <motion.line
          x1="30" y1={WATER_Y} x2={VIEW_W - 30} y2={WATER_Y}
          stroke="rgba(56, 189, 248, 0.2)"
          strokeWidth="0.8"
          strokeDasharray="10 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Zone labels */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* SAFE ZONE */}
          <rect x="40" y={WATER_Y - 30} width="88" height="22" rx="4"
            fill="rgba(56, 189, 248, 0.06)"
            stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.5" />
          <text x="84" y={WATER_Y - 18} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(56, 189, 248, 0.7)"
            fontSize="7.5" fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700" letterSpacing="1.8">
            SAFE ZONE
          </text>

          {/* RISK ZONE */}
          <rect x="40" y={WATER_Y + 8} width="88" height="22" rx="4"
            fill="rgba(251, 113, 133, 0.06)"
            stroke="rgba(251, 113, 133, 0.12)" strokeWidth="0.5" />
          <text x="84" y={WATER_Y + 20} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(251, 113, 133, 0.7)"
            fontSize="7.5" fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700" letterSpacing="1.8">
            RISK ZONE
          </text>
        </motion.g>

        {/* Above water skill pills */}
        {above.map((skill, i) => (
          <SkillPill
            key={skill.skill}
            skill={skill}
            x={abovePositions[i]?.x || CENTER_X}
            y={abovePositions[i]?.y || 80}
            index={i}
            isAbove
            icebergEdgeY={WATER_Y - 35}
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
            icebergEdgeY={WATER_Y + 40}
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
