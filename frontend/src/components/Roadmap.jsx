import { motion } from 'framer-motion'

export default function Roadmap({ data, jobs }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Timeline */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">
          Learning Timeline
        </h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-neon-cyan via-neon-purple to-neon-pink" />

          {data.map((item, i) => (
            <motion.div
              key={item.quarter + item.skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="relative pl-10 pb-6"
            >
              {/* Dot */}
              <div
                className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                  item.priority === 'high'
                    ? 'border-neon-pink bg-neon-pink/30'
                    : 'border-neon-cyan bg-neon-cyan/30'
                }`}
              />

              <div className="bg-dark-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-neon-cyan">{item.quarter}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      item.priority === 'high'
                        ? 'bg-neon-pink/20 text-neon-pink'
                        : 'bg-neon-cyan/20 text-neon-cyan'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="text-white font-medium text-sm">{item.skill}</p>
                <p className="text-white/40 text-xs mt-1">{item.milestone}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Matching Jobs */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">
          Top Job Matches
        </h3>
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job.title + job.company}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-dark-700/50 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-white font-medium text-sm">{job.title}</p>
                  <p className="text-white/40 text-xs">{job.company}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      job.match_percentage >= 75
                        ? 'text-neon-green'
                        : job.match_percentage >= 50
                        ? 'text-neon-cyan'
                        : 'text-neon-orange'
                    }`}
                  >
                    {job.match_percentage}%
                  </span>
                  <p className="text-white/30 text-xs">match</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs">
                  ${job.salary_range[0].toLocaleString()} - ${job.salary_range[1].toLocaleString()}
                </span>
              </div>

              {job.missing_skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-white/30 text-xs">Missing:</span>
                  {job.missing_skills.map((s) => (
                    <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-neon-orange/15 text-neon-orange">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
