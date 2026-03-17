import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const features = [
  {
    icon: '🎯',
    title: 'BlindSpot Index',
    desc: 'A single score revealing your hidden career vulnerabilities',
  },
  {
    icon: '🧊',
    title: 'Skill Iceberg',
    desc: '3D visualization of what you see vs what the market sees',
  },
  {
    icon: '⏳',
    title: 'Skill Half-Life',
    desc: 'Know exactly when your skills expire in the job market',
  },
  {
    icon: '👥',
    title: 'Career Twin',
    desc: 'Your digital twin shows two futures: current path vs optimized',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="gradient-text">BlindSpot</span>
            <span className="text-white/80 block text-3xl md:text-4xl font-light mt-2">
              AI Career Intelligence
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Uncover the hidden gaps in your career trajectory before the market does.
            AI-powered analysis of skill decay, competence illusions, and future-proof pathways.
          </p>

          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/onboarding')}
              className="btn-primary text-lg"
            >
              Analyze My Career
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-lg"
            >
              View Demo
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card neon-border p-6 hover:bg-dark-700/60 transition-colors"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-white/30 text-sm border-t border-white/5">
        BlindSpot AI &mdash; Built for hackathon demo purposes
      </footer>
    </div>
  )
}
