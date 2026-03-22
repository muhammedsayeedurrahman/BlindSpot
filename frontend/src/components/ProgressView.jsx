import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { listAnalyses } from '../utils/storage'

function getBsiColor(score) {
  if (score >= 70) return '#FB7185'
  if (score >= 45) return '#FB923C'
  if (score >= 25) return '#38BDF8'
  return '#34D399'
}

function MiniLineChart({ data }) {
  if (data.length < 2) return null

  const scores = data.map((d) => d.bsiScore)
  const min = Math.min(...scores) - 5
  const max = Math.max(...scores) + 5
  const range = max - min || 1

  const w = 200
  const h = 60
  const padding = 4

  const points = scores.map((s, i) => ({
    x: padding + (i / (scores.length - 1)) * (w - padding * 2),
    y: padding + (1 - (s - min) / range) * (h - padding * 2),
  }))

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const lastPoint = points[points.length - 1]
  const lastScore = scores[scores.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <defs>
        <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
          <stop offset="100%" stopColor={getBsiColor(lastScore)} />
        </linearGradient>
      </defs>
      <path d={pathD} fill="none" stroke="url(#line-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={getBsiColor(scores[i])} opacity={i === points.length - 1 ? 1 : 0.5} />
      ))}
    </svg>
  )
}

export default function ProgressView() {
  const analyses = useMemo(() => {
    const all = listAnalyses()
    return all.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [])

  if (analyses.length < 2) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neon-cyan/10 flex items-center justify-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-neon-cyan">
            <path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h16.5a.75.75 0 010 1.5H18v8.75A2.75 2.75 0 0115.25 15h-1.072l.798 3.06a.75.75 0 01-1.452.38L13.41 18H6.59l-.114.44a.75.75 0 01-1.452-.38L5.822 15H4.75A2.75 2.75 0 012 12.25V3.5h-.25A.75.75 0 011 2.75z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm theme-text-tertiary">
          Run at least 2 analyses to see your progress over time
        </p>
        <p className="text-xs theme-text-muted mt-1">
          Save your current analysis and come back later to track changes
        </p>
      </div>
    )
  }

  const latest = analyses[analyses.length - 1]
  const previous = analyses[analyses.length - 2]
  const scoreDelta = latest.bsiScore - previous.bsiScore
  const improving = scoreDelta < 0

  return (
    <div className="space-y-4">
      {/* Trend chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs theme-text-muted uppercase tracking-wider">BSI Score Trend</span>
          <span
            className="text-xs font-bold font-mono"
            style={{ color: improving ? '#34D399' : '#FB923C' }}
          >
            {scoreDelta > 0 ? '+' : ''}{scoreDelta.toFixed(1)}
          </span>
        </div>
        <MiniLineChart data={analyses} />
      </div>

      {/* Analysis history */}
      <div className="space-y-2">
        {analyses.slice(-5).reverse().map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between py-2 px-3 rounded-lg"
            style={{ backgroundColor: i === 0 ? 'var(--bg-tertiary)' : 'transparent' }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getBsiColor(a.bsiScore) }}
              />
              <div>
                <p className="text-sm theme-text-secondary">{a.name}</p>
                <p className="text-[10px] theme-text-muted">
                  {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <span className="font-mono text-sm font-bold" style={{ color: getBsiColor(a.bsiScore) }}>
              {a.bsiScore.toFixed(0)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
