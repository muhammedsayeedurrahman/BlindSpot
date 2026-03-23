import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

/* ── Status configuration ──────────────────────────────────── */
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

/* ── Crystalline iceberg geometry ──────────────────────────── */
const ABOVE_PATH =
  'M305,240 L318,205 L332,175 L348,152 L358,148 L370,158 L388,190 L405,218 L415,240 Z'
const BELOW_PATH =
  'M265,240 L250,278 L232,318 L225,360 L235,398 L260,425 L298,446 L350,456 L402,446 L440,425 L465,398 L475,360 L468,318 L450,278 L435,240 Z'
// Flipped reflection of above-water tip (y' = 240 + (240 - y) * 0.3)
const REFLECT_PATH =
  'M305,240 L318,250.5 L332,259.5 L348,266.4 L358,267.6 L370,264.6 L388,255 L405,246.6 L415,240 Z'

const ABOVE_FACETS = [
  [305, 240, 358, 148],
  [415, 240, 358, 148],
  [332, 175, 388, 190],
]
const BELOW_FACETS = [
  [265, 240, 350, 456],
  [435, 240, 350, 456],
  [250, 278, 450, 278],
  [232, 318, 468, 318],
  [225, 360, 475, 360],
  [235, 398, 465, 398],
  [260, 425, 440, 425],
  [298, 446, 250, 278],
  [402, 446, 450, 278],
]
const CAUSTIC_SPOTS = [
  { cx: 315, cy: 340, rx: 28, ry: 18, delay: 0 },
  { cx: 370, cy: 380, rx: 22, ry: 14, delay: 1.5 },
  { cx: 395, cy: 310, rx: 18, ry: 22, delay: 3 },
  { cx: 335, cy: 415, rx: 32, ry: 16, delay: 2 },
  { cx: 380, cy: 440, rx: 20, ry: 12, delay: 4 },
]

/* ── Enhanced Skill Pill ───────────────────────────────────── */
function SkillPill({ skill, x, y, index, isAbove }) {
  const [hovered, setHovered] = useState(false)
  const config = STATUS_CONFIG[skill.status] || STATUS_CONFIG.stable
  const delay = 0.3 + index * 0.05

  const label = skill.skill.length > 14 ? skill.skill.slice(0, 12) + '...' : skill.skill
  const pillWidth = Math.min(115, Math.max(72, label.length * 7 + 28))
  const halfW = pillWidth / 2

  // Depth fog: pills deeper below water become more transparent
  const depthOpacity = isAbove
    ? 1
    : Math.max(0.55, 1 - ((y - WATER_Y) / (VIEW_H - WATER_Y)) * 0.55)

  // Connection line target (nearest iceberg edge)
  const iceEdgeX = CENTER_X + (x > CENTER_X ? 30 : -30) * (isAbove ? 0.6 : 1)
  const iceEdgeY = isAbove ? WATER_Y - 15 : WATER_Y + 25
  const floatDur = 3 + (index % 5) * 0.6

  return (
    <motion.g
      initial={{ opacity: 0, y: isAbove ? 10 : -10 }}
      animate={{ opacity: depthOpacity, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Floating animation wrapper */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0;0,-2;0,0"
          dur={`${floatDur}s`}
          repeatCount="indefinite"
        />

        {/* Connection line to iceberg */}
        <line
          x1={x} y1={y} x2={iceEdgeX} y2={iceEdgeY}
          stroke={config.color}
          strokeWidth="0.4"
          strokeDasharray="3 5"
          opacity={hovered ? 0.35 : 0.1}
          style={{ transition: 'opacity 0.3s ease' }}
        />

        {/* Glow on hover */}
        {hovered && (
          <ellipse
            cx={x} cy={y} rx={halfW + 6} ry={17}
            fill={config.glow} opacity={0.5}
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
          cx={x - halfW + 12} cy={y} r={2.5}
          fill={config.color}
          style={{ filter: `drop-shadow(0 0 3px ${config.color})` }}
        >
          <animate
            attributeName="r" values="2.5;3.2;2.5"
            dur="2.5s" repeatCount="indefinite"
          />
        </circle>

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
              {skill.automation_risk
                ? ` · Risk: ${(skill.automation_risk * 100).toFixed(0)}%`
                : ''}
            </text>
          </motion.g>
        )}
      </g>
    </motion.g>
  )
}

/* ── Main Component ────────────────────────────────────────── */
export default function Iceberg2D({ survivalData }) {
  const { above, below } = useMemo(
    () => ({
      above: survivalData.filter(
        (s) => s.status === 'thriving' || s.status === 'stable'
      ),
      below: survivalData.filter(
        (s) => s.status === 'at_risk' || s.status === 'critical'
      ),
    }),
    [survivalData]
  )

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

  // Enhanced bubble system — 20 bubbles in 3 size tiers
  const bubbles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const tier = i < 10 ? 'tiny' : i < 16 ? 'medium' : 'large'
        return {
          x: 80 + (i / 20) * (VIEW_W - 160) + (((i * 37) % 50) - 25),
          delay: (i * 0.45) % 9,
          size:
            tier === 'tiny'
              ? 0.8 + (i % 3) * 0.4
              : tier === 'medium'
                ? 2 + (i % 3) * 0.5
                : 3 + (i % 2),
          duration:
            tier === 'tiny'
              ? 4 + (i % 3)
              : tier === 'medium'
                ? 6 + (i % 2) * 2
                : 8 + (i % 2) * 2,
          drift: (i % 2 === 0 ? 1 : -1) * (1 + (i % 4)),
          opacity: tier === 'large' ? 0.5 : tier === 'medium' ? 0.35 : 0.2,
        }
      }),
    []
  )

  // Above-water sparkle dots
  const sparkles = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        x: 220 + (i / 7) * 260,
        y: 110 + (i % 3) * 35 + ((i * 13) % 25),
        delay: i * 1.1,
        dur: 2 + (i % 3) * 0.8,
      })),
    []
  )

  // 5 light rays instead of 3
  const lightRays = useMemo(
    () => [
      { x: 170, width: 35, delay: 0 },
      { x: 265, width: 48, delay: 1.5 },
      { x: CENTER_X, width: 55, delay: 3 },
      { x: 435, width: 48, delay: 4.5 },
      { x: 530, width: 35, delay: 2 },
    ],
    []
  )

  // Animated filled waves (2x width for seamless CSS drift)
  const waveData = useMemo(() => {
    const makeWave = (amp, freq, phase) => {
      const pts = []
      for (let x = 0; x <= VIEW_W * 2; x += 3) {
        pts.push(
          `${x},${(WATER_Y + Math.sin(x / freq + phase) * amp).toFixed(1)}`
        )
      }
      return `M ${pts[0]} ${pts.slice(1).map((p) => `L ${p}`).join(' ')} L ${VIEW_W * 2},${VIEW_H} L 0,${VIEW_H} Z`
    }
    return [
      { d: makeWave(3, 85, 0), fill: 'rgba(56, 189, 248, 0.06)', dur: '7s' },
      {
        d: makeWave(2.5, 65, 1.5),
        fill: 'rgba(56, 189, 248, 0.04)',
        dur: '5s',
      },
      {
        d: makeWave(1.8, 110, 3),
        fill: 'rgba(56, 170, 220, 0.03)',
        dur: '3s',
      },
    ]
  }, [])

  // Wave stroke lines at surface
  const waveStrokes = useMemo(() => {
    const makeStroke = (amp, freq, phase, yOff) => {
      const pts = []
      for (let x = 0; x <= VIEW_W * 2; x += 2) {
        pts.push(
          `${x},${(WATER_Y + yOff + Math.sin(x / freq + phase) * amp).toFixed(1)}`
        )
      }
      return `M ${pts[0]} ${pts.slice(1).map((p) => `L ${p}`).join(' ')}`
    }
    return [
      {
        d: makeStroke(2.5, 85, 0, -1),
        color: 'rgba(56, 189, 248, 0.3)',
        dur: '7s',
      },
      {
        d: makeStroke(2, 65, 1.5, 1),
        color: 'rgba(56, 189, 248, 0.18)',
        dur: '5s',
      },
      {
        d: makeStroke(1.5, 110, 3, 3),
        color: 'rgba(56, 170, 220, 0.1)',
        dur: '3s',
      },
    ]
  }, [])

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Rich 5-stop underwater gradient */}
          <linearGradient id="waterGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 60, 100, 0.03)" />
            <stop offset="25%" stopColor="rgba(0, 40, 80, 0.08)" />
            <stop offset="50%" stopColor="rgba(0, 25, 55, 0.18)" />
            <stop offset="75%" stopColor="rgba(5, 15, 40, 0.28)" />
            <stop offset="100%" stopColor="rgba(8, 8, 25, 0.4)" />
          </linearGradient>

          {/* Crystalline ice gradient — above water */}
          <linearGradient id="iceAbove2" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="rgba(180, 230, 255, 0.28)" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.15)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.05)" />
          </linearGradient>

          {/* Crystalline ice gradient — below water */}
          <linearGradient id="iceBelow2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(120, 60, 120, 0.05)" />
            <stop offset="35%" stopColor="rgba(200, 80, 120, 0.08)" />
            <stop offset="65%" stopColor="rgba(251, 113, 133, 0.1)" />
            <stop offset="100%" stopColor="rgba(251, 113, 133, 0.16)" />
          </linearGradient>

          {/* Ice glow filter — blur + merge */}
          <filter id="iceGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="3"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Underwater shimmer — static displacement */}
          <filter id="waterShimmer" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
            />
          </filter>

          {/* Underwater clip region */}
          <clipPath id="underwaterClip">
            <rect
              x="0"
              y={WATER_Y}
              width={VIEW_W}
              height={VIEW_H - WATER_Y}
            />
          </clipPath>
        </defs>

        {/* Sky area */}
        <rect x="0" y="0" width={VIEW_W} height={WATER_Y} fill="transparent" />

        {/* Water area — rich multi-stop gradient */}
        <rect
          x="0"
          y={WATER_Y - 2}
          width={VIEW_W}
          height={VIEW_H - WATER_Y + 2}
          fill="url(#waterGrad2)"
        />

        {/* Underwater light rays — 5 shimmer beams */}
        {lightRays.map((ray, i) => (
          <motion.polygon
            key={`ray-${i}`}
            points={`${ray.x},${WATER_Y} ${ray.x - ray.width},${VIEW_H} ${ray.x + ray.width},${VIEW_H}`}
            fill="rgba(56, 189, 248, 0.018)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              delay: ray.delay,
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Caustic dappled light spots on iceberg body */}
        {CAUSTIC_SPOTS.map((c, i) => (
          <ellipse
            key={`caustic-${i}`}
            cx={c.cx}
            cy={c.cy}
            rx={c.rx}
            ry={c.ry}
            fill="rgba(56, 189, 248, 0.025)"
            clipPath="url(#underwaterClip)"
          >
            <animate
              attributeName="opacity"
              values="0.01;0.05;0.01"
              dur="4s"
              begin={`${c.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="rx"
              values={`${c.rx};${c.rx + 5};${c.rx}`}
              dur="5s"
              begin={`${c.delay}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        ))}

        {/* Crystalline iceberg — above water tip */}
        <motion.path
          d={ABOVE_PATH}
          fill="url(#iceAbove2)"
          stroke="rgba(180, 230, 255, 0.35)"
          strokeWidth="0.8"
          strokeLinejoin="bevel"
          filter="url(#iceGlow)"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${CENTER_X}px ${WATER_Y}px` }}
        />

        {/* Above water facet lines */}
        {ABOVE_FACETS.map(([x1, y1, x2, y2], i) => (
          <motion.line
            key={`af-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(180, 230, 255, 0.18)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
          />
        ))}

        {/* Crystalline iceberg — below water body */}
        <motion.path
          d={BELOW_PATH}
          fill="url(#iceBelow2)"
          stroke="rgba(251, 113, 133, 0.12)"
          strokeWidth="0.8"
          strokeLinejoin="bevel"
          filter="url(#waterShimmer)"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.15,
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ transformOrigin: `${CENTER_X}px ${WATER_Y}px` }}
        />

        {/* Below water facet lines — crystal structure */}
        {BELOW_FACETS.map(([x1, y1, x2, y2], i) => (
          <motion.line
            key={`bf-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`rgba(251, 113, 133, ${0.04 + (i % 3) * 0.012})`}
            strokeWidth="0.4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.07, duration: 0.8 }}
          />
        ))}

        {/* Water line reflection — faint mirrored above-water tip */}
        <path
          d={REFLECT_PATH}
          fill="rgba(180, 230, 255, 0.04)"
          stroke="rgba(180, 230, 255, 0.06)"
          strokeWidth="0.3"
          style={{ filter: 'blur(1.5px)' }}
          clipPath="url(#underwaterClip)"
        />

        {/* Animated filled waves (clipped to underwater) */}
        {waveData.map((wave, i) => (
          <g key={`wf-${i}`} clipPath="url(#underwaterClip)">
            <path
              d={wave.d}
              fill={wave.fill}
              className="iceberg-wave-drift"
              style={{ animationDuration: wave.dur }}
            />
          </g>
        ))}

        {/* Animated wave stroke lines at surface */}
        {waveStrokes.map((wave, i) => (
          <path
            key={`ws-${i}`}
            d={wave.d}
            stroke={wave.color}
            strokeWidth="1"
            fill="none"
            className="iceberg-wave-drift"
            style={{ animationDuration: wave.dur }}
          />
        ))}

        {/* Water line — primary dashed */}
        <motion.line
          x1="30"
          y1={WATER_Y}
          x2={VIEW_W - 30}
          y2={WATER_Y}
          stroke="rgba(56, 189, 248, 0.25)"
          strokeWidth="1"
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
          <rect
            x="40"
            y={WATER_Y - 30}
            width="88"
            height="22"
            rx="4"
            fill="rgba(56, 189, 248, 0.06)"
            stroke="rgba(56, 189, 248, 0.12)"
            strokeWidth="0.5"
          />
          <text
            x="84"
            y={WATER_Y - 18}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(56, 189, 248, 0.7)"
            fontSize="7.5"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            letterSpacing="1.8"
          >
            SAFE ZONE
          </text>

          <rect
            x="40"
            y={WATER_Y + 8}
            width="88"
            height="22"
            rx="4"
            fill="rgba(251, 113, 133, 0.06)"
            stroke="rgba(251, 113, 133, 0.12)"
            strokeWidth="0.5"
          />
          <text
            x="84"
            y={WATER_Y + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(251, 113, 133, 0.7)"
            fontSize="7.5"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            letterSpacing="1.8"
          >
            RISK ZONE
          </text>
        </motion.g>

        {/* Above water sparkles — light catching ice */}
        {sparkles.map((s, i) => (
          <circle
            key={`sparkle-${i}`}
            cx={s.x}
            cy={s.y}
            r="1"
            fill="rgba(180, 230, 255, 0.5)"
          >
            <animate
              attributeName="opacity"
              values="0;0.7;0"
              dur={`${s.dur}s`}
              begin={`${s.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="0.5;1.8;0.5"
              dur={`${s.dur}s`}
              begin={`${s.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Rising bubbles — 20 in 3 size tiers with drift */}
        {bubbles.map((b, i) => (
          <motion.circle
            key={`bubble-${i}`}
            cx={b.x}
            r={b.size}
            fill={`rgba(56, 189, 248, ${b.size > 2 ? 0.08 : 0.04})`}
            stroke={`rgba(56, 189, 248, ${b.size > 2 ? 0.15 : 0.08})`}
            strokeWidth="0.5"
            initial={{ cy: VIEW_H - 20, opacity: 0 }}
            animate={{
              cy: [VIEW_H - 20, WATER_Y + 5],
              opacity: [0, b.opacity, 0],
              cx: [b.x, b.x + b.drift, b.x],
            }}
            transition={{
              delay: b.delay,
              duration: b.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
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
                  style={{
                    backgroundColor: cfg.color,
                    boxShadow: `0 0 6px ${cfg.color}`,
                  }}
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
