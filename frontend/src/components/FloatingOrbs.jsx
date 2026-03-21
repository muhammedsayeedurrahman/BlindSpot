import { memo, useRef, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'

/**
 * Mesmerizing ambient background with:
 * - Anti-gravity floating orbs with morphing shapes
 * - Aurora / northern lights bands
 * - Subtle particle constellation with connecting lines
 * - Mouse-reactive parallax movement
 */
const FloatingOrbs = memo(function FloatingOrbs() {
  const { isDark } = useTheme()
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const particlesRef = useRef([])
  const frameRef = useRef(0)

  const initParticles = useCallback((w, h) => {
    const count = Math.min(Math.floor((w * h) / 25000), 60)
    return Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particlesRef.current = initParticles(canvas.width, canvas.height)
    }
    resize()

    const handleMouse = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const time = frameRef.current * 0.008
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, w, h)

      // --- Aurora bands ---
      const auroraColors = isDark
        ? [
            { r: 0, g: 240, b: 255, a: 0.04 },
            { r: 180, g: 74, b: 255, a: 0.03 },
            { r: 57, g: 255, b: 20, a: 0.02 },
          ]
        : [
            { r: 0, g: 160, b: 200, a: 0.03 },
            { r: 140, g: 50, b: 210, a: 0.02 },
            { r: 40, g: 180, b: 15, a: 0.015 },
          ]

      auroraColors.forEach((c, i) => {
        const yOffset = h * 0.2 + Math.sin(time * 0.3 + i * 2) * h * 0.1
        const parallaxX = (mx - 0.5) * 30 * (i + 1)
        const parallaxY = (my - 0.5) * 15 * (i + 1)

        const grad = ctx.createRadialGradient(
          w * 0.5 + parallaxX + Math.sin(time * 0.5 + i) * w * 0.2,
          yOffset + parallaxY,
          0,
          w * 0.5 + parallaxX,
          yOffset + parallaxY,
          w * 0.5
        )
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${c.a * (1 + Math.sin(time + i) * 0.3)})`)
        grad.addColorStop(1, 'transparent')

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      })

      // --- Floating orbs ---
      const orbData = isDark
        ? [
            { cx: 0.15, cy: 0.2, r: 180, cr: 0, cg: 240, cb: 255, a: 0.06 },
            { cx: 0.75, cy: 0.6, r: 250, cr: 180, cg: 74, cb: 255, a: 0.05 },
            { cx: 0.85, cy: 0.15, r: 150, cr: 255, cg: 45, cb: 124, a: 0.04 },
            { cx: 0.3, cy: 0.8, r: 200, cr: 57, cg: 255, cb: 20, a: 0.035 },
            { cx: 0.55, cy: 0.4, r: 130, cr: 255, cg: 106, cb: 0, a: 0.04 },
          ]
        : [
            { cx: 0.15, cy: 0.2, r: 180, cr: 0, cg: 180, cb: 220, a: 0.05 },
            { cx: 0.75, cy: 0.6, r: 250, cr: 140, cg: 50, cb: 200, a: 0.04 },
            { cx: 0.85, cy: 0.15, r: 150, cr: 200, cg: 30, cb: 100, a: 0.035 },
            { cx: 0.3, cy: 0.8, r: 200, cr: 40, cg: 180, cb: 15, a: 0.03 },
            { cx: 0.55, cy: 0.4, r: 130, cr: 200, cg: 80, cb: 0, a: 0.035 },
          ]

      orbData.forEach((orb, i) => {
        const phase = time * 0.3 + i * 1.5
        const ox = orb.cx * w + Math.sin(phase) * 40 + (mx - 0.5) * 20 * (i % 2 === 0 ? 1 : -1)
        const oy = orb.cy * h + Math.cos(phase * 0.7) * 30 + (my - 0.5) * 15
        const pulse = 1 + Math.sin(time * 0.5 + i * 0.8) * 0.15

        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r * pulse)
        grad.addColorStop(0, `rgba(${orb.cr},${orb.cg},${orb.cb},${orb.a * pulse})`)
        grad.addColorStop(0.5, `rgba(${orb.cr},${orb.cg},${orb.cb},${orb.a * 0.3})`)
        grad.addColorStop(1, 'transparent')

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      })

      // --- Particle constellation (spatial grid for O(n) connections) ---
      const particles = particlesRef.current
      const dotColor = isDark ? [0, 240, 255] : [0, 140, 170]
      const lineColor = isDark ? [0, 240, 255] : [0, 140, 170]
      const connectionDist = 120
      const cellSize = connectionDist

      // Update positions and draw dots
      particles.forEach((p) => {
        p.x += p.vx + (mx - 0.5) * 0.2
        p.y += p.vy + (my - 0.5) * 0.15

        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        const twinkle = 0.5 + Math.sin(time * 2 + p.phase) * 0.5
        const alpha = p.opacity * twinkle

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dotColor.join(',')},${alpha})`
        ctx.fill()
      })

      // Build spatial grid then check only neighboring cells
      const cols = Math.ceil(w / cellSize) + 1
      const grid = new Map()
      particles.forEach((p, i) => {
        const key = (Math.floor(p.x / cellSize)) + (Math.floor(p.y / cellSize)) * cols
        if (!grid.has(key)) grid.set(key, [])
        grid.get(key).push(i)
      })

      ctx.lineWidth = 0.5
      const distSq = connectionDist * connectionDist
      const checked = new Set()
      grid.forEach((cell, key) => {
        const gx = key % cols
        const gy = Math.floor(key / cols)
        // Check own cell + 4 neighbors (right, bottom-left, bottom, bottom-right) to avoid duplicates
        const neighbors = [key, gx + 1 + gy * cols, (gx - 1) + (gy + 1) * cols, gx + (gy + 1) * cols, (gx + 1) + (gy + 1) * cols]
        for (const nk of neighbors) {
          const nCell = grid.get(nk)
          if (!nCell) continue
          for (const i of cell) {
            for (const j of nCell) {
              if (i >= j) continue
              const pairKey = i * particles.length + j
              if (checked.has(pairKey)) continue
              checked.add(pairKey)
              const dx = particles[i].x - particles[j].x
              const dy = particles[i].y - particles[j].y
              const d2 = dx * dx + dy * dy
              if (d2 < distSq) {
                const alpha = (1 - Math.sqrt(d2) / connectionDist) * 0.08
                ctx.beginPath()
                ctx.moveTo(particles[i].x, particles[i].y)
                ctx.lineTo(particles[j].x, particles[j].y)
                ctx.strokeStyle = `rgba(${lineColor.join(',')},${alpha})`
                ctx.stroke()
              }
            }
          }
        }
      })

      frameRef.current++
      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', resize)
    }
  }, [isDark, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
})

export default FloatingOrbs
