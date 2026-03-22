import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

function getBsiColor(score) {
  if (score >= 70) return '#FB7185'
  if (score >= 45) return '#FB923C'
  if (score >= 25) return '#38BDF8'
  return '#34D399'
}

function getBsiLabel(level) {
  const labels = {
    critical: 'Critical',
    warning: 'Warning',
    moderate: 'Moderate',
    healthy: 'Healthy',
  }
  return labels[level] || level
}

export default function ShareCard({ bsi, profile, survival }) {
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const cardRef = useRef(null)

  const score = bsi?.score || 0
  const level = bsi?.level || 'moderate'
  const color = getBsiColor(score)
  const thriving = survival?.filter((s) => s.status === 'thriving').length || 0
  const atRisk = survival?.filter((s) => s.status === 'at_risk' || s.status === 'critical').length || 0

  const handleCopyImage = async () => {
    if (!cardRef.current) return
    setGenerating(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ])
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
        } catch {
          // Fallback: download
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `BlindSpot_Score_${profile?.name || 'User'}.png`
          a.click()
          URL.revokeObjectURL(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
        }
        setGenerating(false)
      }, 'image/png')
    } catch {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* The shareable card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #111125 50%, #0a0a0f 100%)',
          border: `1px solid ${color}33`,
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] opacity-20"
          style={{ backgroundColor: color }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: '#38BDF8' }}>
                BlindSpot AI
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: '#666' }}>
                Career Intelligence Score
              </p>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                color,
                backgroundColor: `${color}15`,
                border: `1px solid ${color}30`,
              }}
            >
              {getBsiLabel(level)}
            </div>
          </div>

          {/* Score */}
          <div className="text-center mb-6">
            <div className="text-6xl font-black font-mono" style={{ color }}>
              {score.toFixed(0)}
            </div>
            <div className="text-xs mt-1" style={{ color: '#888' }}>
              BlindSpot Index
            </div>
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-[#34D399]">{thriving}</div>
              <div className="text-[10px] uppercase" style={{ color: '#666' }}>Thriving</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-[#FB923C]">{atRisk}</div>
              <div className="text-[10px] uppercase" style={{ color: '#666' }}>At Risk</div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #ffffff10' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#ccc' }}>{profile?.name || 'Anonymous'}</p>
              <p className="text-[10px]" style={{ color: '#666' }}>{profile?.current_role || ''}</p>
            </div>
            <p className="text-[10px]" style={{ color: '#444' }}>blindspot.ai</p>
          </div>
        </div>
      </div>

      {/* Action button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCopyImage}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40"
        style={{
          borderColor: copied ? '#34D39940' : 'var(--border-default)',
          color: copied ? '#34D399' : 'var(--text-tertiary)',
          backgroundColor: copied ? '#34D39908' : 'transparent',
        }}
      >
        {generating ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
            </svg>
            Generating...
          </>
        ) : copied ? (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            Copied to clipboard!
          </>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.474l6.733-3.367A2.52 2.52 0 0113 4.5z" />
            </svg>
            Copy Score Card as Image
          </>
        )}
      </motion.button>
    </div>
  )
}
