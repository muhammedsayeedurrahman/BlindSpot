import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring, useScroll, useInView } from 'framer-motion'
import { useRef, useEffect, useCallback, useState } from 'react'
import { listAnalyses, loadAnalysis } from '../utils/storage'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'

/* ── Feature cards data ─────────────────────────────────────── */
const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
        <path d="M8 2l1 3M16 2l-1 3" strokeLinecap="round" />
      </svg>
    ),
    title: 'BlindSpot Index',
    desc: 'A single 0-100 score revealing hidden career vulnerabilities across skill decay, market mismatch, and concentration risk.',
    color: '#38BDF8',
    gradient: 'from-[rgba(56,189,248,0.15)] to-transparent',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 2L8 8l-6 1 4 4-1 6 5-3 5 3-1-6 4-4-6-1z" />
      </svg>
    ),
    title: 'Skill Iceberg',
    desc: 'Interactive 3D visualization separating your thriving skills from those silently eroding beneath the surface.',
    color: '#A78BFA',
    gradient: 'from-[rgba(167,139,250,0.15)] to-transparent',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v6M12 16v.01" strokeLinecap="round" />
      </svg>
    ),
    title: 'Skill Half-Life',
    desc: 'Precisely how many years before each skill loses 50% market value. Know when to upskill, not if.',
    color: '#FB923C',
    gradient: 'from-[rgba(251,146,60,0.15)] to-transparent',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Career Twin',
    desc: 'See two futures side-by-side: your current trajectory vs. an AI-optimized path with salary projections.',
    color: '#34D399',
    gradient: 'from-[rgba(52,211,153,0.15)] to-transparent',
  },
]

const stats = [
  { value: '90+', label: 'Skills Tracked' },
  { value: '35', label: 'Career Roles' },
  { value: '3yr', label: 'Salary Projections' },
  { value: '7', label: 'AI Engines' },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Frontend Developer',
    text: 'BlindSpot revealed I was over-investing in jQuery while missing the AI wave. Pivoted to ML and got a 40% raise.',
    bsi: 62,
    color: '#FB923C',
  },
  {
    name: 'Marcus Rivera',
    role: 'Data Analyst',
    text: 'The competence illusion detector was eye-opening. I rated myself 9/10 in Excel while the market had moved to Python.',
    bsi: 71,
    color: '#FB7185',
  },
  {
    name: 'Priya Patel',
    role: 'DevOps Engineer',
    text: 'My BSI dropped from 45 to 22 after following the roadmap for 6 months. The salary projections were spot-on.',
    bsi: 22,
    color: '#34D399',
  },
]

/* ── Animated grid background ──────────────────────────────── */
function GridBackground() {
  const canvasRef = useRef(null)
  const { isDark } = useTheme()

  const draw = useCallback((canvas) => {
    const ctx = canvas.getContext('2d')
    const w = canvas.width = window.innerWidth
    const h = canvas.height = window.innerHeight
    const gridSize = 60
    const time = Date.now() * 0.001

    ctx.clearRect(0, 0, w, h)

    const lineColor = isDark ? 'rgba(56, 189, 248, 0.03)' : 'rgba(14, 165, 233, 0.03)'
    const dotColor = isDark ? [56, 189, 248] : [14, 165, 233]

    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    for (let x = 0; x < w; x += gridSize) {
      for (let y = 0; y < h; y += gridSize) {
        const dist = Math.sqrt((x - w / 2) ** 2 + (y - h / 2) ** 2)
        const pulse = Math.sin(dist * 0.005 - time) * 0.5 + 0.5
        const opacity = Math.max(0, 0.15 - dist * 0.0002) * pulse
        if (opacity > 0.01) {
          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${dotColor.join(',')}, ${opacity})`
          ctx.fill()
        }
      }
    }
  }, [isDark])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let animId
    const animate = () => {
      draw(canvas)
      animId = requestAnimationFrame(animate)
    }
    animate()
    const handleResize = () => draw(canvas)
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  )
}

/* ── 3D Tilt Card wrapper ──────────────────────────────────── */
function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 20 })

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    x.set(px)
    y.set(py)
  }, [x, y])

  const handleLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Animated counter ──────────────────────────────────────── */
function StatCounter({ value, label, delay }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center group"
    >
      <motion.div
        className="text-3xl md:text-4xl font-black font-mono gradient-text-animated"
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {value}
      </motion.div>
      <div className="text-xs theme-text-tertiary mt-1 uppercase tracking-wider group-hover:text-[rgb(var(--neon-cyan-rgb))] transition-colors duration-300">
        {label}
      </div>
    </motion.div>
  )
}

/* ── Feature card with holographic effect ──────────────────── */
function FeatureCard({ feature, index }) {
  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 5 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ delay: 0.1 + index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="group relative glass-card-premium p-6 overflow-hidden cursor-default h-full"
      >
        {/* Gradient overlay on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
        />

        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-70 transition-opacity duration-500"
          style={{ background: `linear-gradient(to right, transparent, ${feature.color}, transparent)` }}
        />

        {/* Bottom shimmer */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-30 transition-opacity duration-700"
          style={{ background: `linear-gradient(to right, transparent, ${feature.color}, transparent)` }}
        />

        {/* Scanning line on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden"
        >
          <div
            className="absolute left-0 right-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${feature.color}40, transparent)`,
              animation: 'scan-line 3s linear infinite',
            }}
          />
        </div>

        <div className="relative z-10">
          <motion.div
            className="mb-4 transition-all duration-300 group-hover:scale-110"
            style={{ color: feature.color }}
            whileHover={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 0.5 }}
          >
            {feature.icon}
          </motion.div>
          <h3 className="text-lg font-bold theme-text mb-2 group-hover:text-white transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-sm theme-text-tertiary leading-relaxed group-hover:theme-text-secondary transition-colors duration-300">
            {feature.desc}
          </p>
        </div>

        {/* Corner accent with morph */}
        <div
          className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 animate-morph"
          style={{ background: `radial-gradient(circle, ${feature.color}, transparent)` }}
        />
      </motion.div>
    </TiltCard>
  )
}

/* ── Previous analyses from localStorage ──────────────────── */
function PreviousAnalyses({ navigate }) {
  const analyses = listAnalyses()
  if (analyses.length === 0) return null

  const handleLoad = (id) => {
    const data = loadAnalysis(id)
    if (data) navigate('/dashboard', { state: { data } })
  }

  const getBsiColor = (score) => {
    if (score >= 70) return '#FB7185'
    if (score >= 45) return '#FB923C'
    if (score >= 25) return '#38BDF8'
    return '#34D399'
  }

  return (
    <section className="px-6 py-16">
      <div className="section-divider mb-16" />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold theme-text mb-3">
            Previous <span className="gradient-text">Analyses</span>
          </h2>
          <p className="theme-text-tertiary text-sm">Pick up where you left off</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.slice(0, 6).map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
              onClick={() => handleLoad(a.id)}
              className="glass-card p-4 text-left hover-glow transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium theme-text truncate">{a.name}</span>
                <span className="font-mono text-sm font-bold" style={{ color: getBsiColor(a.bsiScore) }}>
                  {a.bsiScore.toFixed(0)}
                </span>
              </div>
              <p className="text-xs theme-text-muted">{a.role}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>
                {new Date(a.date).toLocaleDateString()}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

/* ── Floating badge with pulse ─────────────────────────────── */
function FloatingBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card mb-8 animate-float-slow"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
      </span>
      <span className="text-xs font-medium tracking-wide" style={{ color: 'rgb(var(--neon-cyan-rgb))' }}>
        AI-Powered Career Intelligence
      </span>
    </motion.div>
  )
}

/* ── Process step card ─────────────────────────────────────── */
function ProcessStep({ item, index }) {
  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 5 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative text-center glass-card-premium p-6 group"
      >
        <motion.div
          className="text-5xl font-black font-mono mb-3 opacity-15"
          style={{ color: item.color }}
          whileInView={{ opacity: [0, 0.15] }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 + 0.3, duration: 0.8 }}
        >
          {item.step}
        </motion.div>
        <h3 className="text-base font-bold theme-text mb-2">{item.title}</h3>
        <p className="text-sm theme-text-tertiary leading-relaxed">{item.desc}</p>

        {/* Glow dot with pulse ring */}
        <div
          className="absolute top-3 right-3 w-2 h-2 rounded-full animate-breathe pulse-dot"
          style={{ backgroundColor: item.color, color: item.color }}
        />

        {/* Connection line to next step */}
        {index < 2 && (
          <div className="hidden md:block absolute -right-3 top-1/2 w-6 h-px" style={{
            background: `linear-gradient(to right, ${item.color}40, transparent)`,
          }} />
        )}
      </motion.div>
    </TiltCard>
  )
}

/* ── Landing page ──────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Theme Toggle — fixed top-right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative flex-1 flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden"
      >
        <GridBackground />

        {/* Hero gradient overlay */}
        <div className="absolute inset-0 hero-glow pointer-events-none" />

        {/* Background glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[120px] animate-aurora-slow"
             style={{ background: isDark ? 'rgba(56,189,248,0.06)' : 'rgba(14,165,233,0.06)' }} />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] animate-aurora"
             style={{ background: isDark ? 'rgba(167,139,250,0.05)' : 'rgba(124,58,237,0.05)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-morph"
             style={{ background: isDark ? 'rgba(251,113,133,0.04)' : 'rgba(200,30,100,0.03)' }} />

        <motion.div
          initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-4xl"
        >
          <FloatingBadge />

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tight">
            <motion.span
              className="gradient-text-animated inline-block"
              style={{ backgroundSize: '300% 100%' }}
            >
              BlindSpot
            </motion.span>
            <motion.span
              className="block text-2xl sm:text-3xl md:text-4xl font-light mt-4 tracking-normal"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              See what the market sees — before it&apos;s too late
            </motion.span>
          </h1>

          <motion.p
            className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-tertiary)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Uncover hidden gaps in your career trajectory. AI-powered analysis of skill decay,
            competence illusions, and future-proof pathways — personalized for your exact profile.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <motion.button
              whileHover={{
                scale: 1.06,
                boxShadow: '0 16px 50px rgba(56, 189, 248, 0.35)',
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/onboarding')}
              className="btn-primary text-base md:text-lg group"
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                Analyze My Career
                <motion.svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </motion.svg>
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-base md:text-lg"
            >
              View Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="relative z-10 mt-16 flex items-center gap-8 md:gap-16"
        >
          {stats.map((s, i) => (
            <StatCounter key={s.label} value={s.value} label={s.label} delay={1.0 + i * 0.1} />
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest theme-text-muted">Scroll</span>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 theme-text-muted">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* How It Works — Features */}
      <section className="px-6 py-20">
        <div className="section-divider mb-16" />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold theme-text mb-4"
            >
              Four engines. One{' '}
              <span className="text-holographic">career intelligence</span>{' '}
              platform.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="theme-text-tertiary text-sm max-w-xl mx-auto"
            >
              Each module works independently and together to give you the complete picture of your career health.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Process Steps */}
      <section className="px-6 py-20">
        <div className="section-divider mb-16" />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold theme-text mb-4"
            >
              Three steps to <span className="text-holographic">career clarity</span>
            </motion.h2>
            <p className="theme-text-tertiary text-sm">No signup. No credit card. Results in 2 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Input Your Profile', desc: 'Select your role, skills, and rate your confidence in each one.', color: '#38BDF8' },
              { step: '02', title: 'AI Analyzes Gaps', desc: 'Four engines scan skill decay, market mismatch, illusions, and risk concentration.', color: '#A78BFA' },
              { step: '03', title: 'Get Your Roadmap', desc: 'See your BlindSpot Index, career twin projection, and a quarter-by-quarter upskilling plan.', color: '#34D399' },
            ].map((item, i) => (
              <ProcessStep key={item.step} item={item} index={i} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="px-6 py-20">
        <div className="section-divider mb-16" />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold theme-text mb-4"
            >
              Trusted by <span className="text-holographic">professionals</span> worldwide
            </motion.h2>
            <p className="theme-text-tertiary text-sm">Real results from real career pivots.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TiltCard key={t.name}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="glass-card-premium p-6 h-full group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium theme-text">{t.name}</p>
                      <p className="text-xs theme-text-muted">{t.role}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] theme-text-muted">BSI</span>
                      <span className="font-mono text-sm font-bold" style={{ color: t.color }}>
                        {t.bsi}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm theme-text-tertiary leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Previous Analyses */}
      <PreviousAnalyses navigate={navigate} />

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="section-divider mb-16" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold theme-text mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Stop guessing. Start <span className="text-holographic">knowing</span>.
          </motion.h2>
          <p className="theme-text-tertiary mb-10 text-sm">
            Takes 2 minutes. No signup required. Get your BlindSpot Index instantly.
          </p>
          <motion.button
            whileHover={{
              scale: 1.06,
              boxShadow: '0 16px 50px rgba(56, 189, 248, 0.35)',
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/onboarding')}
            className="btn-primary text-lg"
          >
            <span className="relative z-10">Get My BlindSpot Score</span>
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-xs" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <div className="section-divider mb-10" />
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <p className="text-base font-bold gradient-text-animated inline-block" style={{ backgroundSize: '300% 100%' }}>
                BlindSpot AI
              </p>
              <p className="mt-1 theme-text-tertiary">Career Intelligence Platform</p>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/onboarding')} className="theme-text-tertiary hover:theme-text transition-colors">
                Get Started
              </button>
              <button onClick={() => navigate('/dashboard')} className="theme-text-tertiary hover:theme-text transition-colors">
                Demo
              </button>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="theme-text-tertiary hover:theme-text transition-colors">
                GitHub
              </a>
            </div>
          </div>
          <div className="text-center" style={{ color: 'var(--text-faint)' }}>
            <p>Powered by data from 90+ skills, 35 career roles, and real market analytics</p>
            <p className="mt-1">Built with open-source tools. No signup required.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
