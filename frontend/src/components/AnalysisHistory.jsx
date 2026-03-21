import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listAnalyses, deleteAnalysis } from '../utils/storage'

function getBsiColor(score) {
  if (score >= 70) return 'text-neon-pink'
  if (score >= 45) return 'text-neon-orange'
  if (score >= 25) return 'text-neon-cyan'
  return 'text-neon-green'
}

export default function AnalysisHistory({ onLoad }) {
  const [open, setOpen] = useState(false)
  const [analyses, setAnalyses] = useState(() => listAnalyses())
  const [confirmDelete, setConfirmDelete] = useState(null)

  if (analyses.length === 0) return null

  const handleDelete = (id) => {
    deleteAnalysis(id)
    setAnalyses(listAnalyses())
    setConfirmDelete(null)
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-colors micro-press"
        style={{
          borderColor: 'var(--border-default)',
          color: 'var(--text-tertiary)',
        }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        History ({analyses.length})
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--overlay-bg)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-lg w-full max-h-[70vh] overflow-hidden flex flex-col"
              style={{ border: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold theme-text">Saved Analyses</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center theme-text-tertiary hover:theme-text transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      onClick={() => {
                        onLoad(analysis.id)
                        setOpen(false)
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium theme-text truncate">{analysis.name}</span>
                        <span className={`font-mono text-xs font-bold ${getBsiColor(analysis.bsiScore)}`}>
                          {analysis.bsiScore.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] theme-text-muted">{analysis.role}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                          {new Date(analysis.date).toLocaleDateString()}
                        </span>
                      </div>
                    </button>

                    {confirmDelete === analysis.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDelete(analysis.id)}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-neon-pink/10 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/20 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 rounded text-[10px] theme-text-tertiary transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(analysis.id)}
                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center theme-text-muted hover:text-neon-pink hover:bg-neon-pink/5 transition-colors"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
