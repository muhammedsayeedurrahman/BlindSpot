import { motion } from 'framer-motion'

function SkeletonPulse({ className = '' }) {
  return (
    <motion.div
      className={`rounded-lg ${className}`}
      style={{ backgroundColor: 'var(--bg-quaternary)' }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card-premium neon-border p-6 ${className}`}>
      <SkeletonPulse className="h-5 w-40 mb-2" />
      <SkeletonPulse className="h-3 w-64 mb-6" />
      <SkeletonPulse className="h-48 w-full" />
    </div>
  )
}

export function SkeletonGauge() {
  return (
    <div className="glass-card-premium neon-border p-6">
      <SkeletonPulse className="h-5 w-36 mb-2" />
      <SkeletonPulse className="h-3 w-56 mb-6" />
      <div className="flex justify-center mb-4">
        <SkeletonPulse className="h-40 w-40 rounded-full" />
      </div>
      <div className="space-y-3 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <SkeletonPulse className="h-3 w-28 mb-1.5" />
            <SkeletonPulse className="h-1.5 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <SkeletonPulse className="h-8 w-48 mb-2" />
        <SkeletonPulse className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card">
            <SkeletonPulse className="h-5 w-8 mb-1" />
            <SkeletonPulse className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <SkeletonProfile />
      <SkeletonCard />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <SkeletonGauge />
        </div>
        <div className="lg:col-span-3">
          <SkeletonCard className="h-full" />
        </div>
      </div>
      <SkeletonCard />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

export default SkeletonPulse
