import { motion } from 'framer-motion'

const PLATFORMS = [
  {
    name: 'LinkedIn',
    color: '#0A66C2',
    urlTemplate: (role) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'Indeed',
    color: '#2164F3',
    urlTemplate: (role) => `https://www.indeed.com/jobs?q=${encodeURIComponent(role)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M11.5 1C5.15 1 0 6.15 0 12.5S5.15 24 11.5 24 23 18.85 23 12.5 17.85 1 11.5 1zm2.8 17.3h-2.6V9.5h2.6v8.8zm-1.3-10c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" />
      </svg>
    ),
  },
  {
    name: 'Google',
    color: '#4285F4',
    urlTemplate: (role) => `https://www.google.com/search?q=${encodeURIComponent(role + ' jobs')}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
]

export default function JobLinks({ role }) {
  return (
    <div className="flex items-center gap-1.5">
      {PLATFORMS.map((platform) => (
        <motion.a
          key={platform.name}
          href={platform.urlTemplate(role)}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.08, y: -1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all"
          style={{
            borderColor: `${platform.color}30`,
            color: platform.color,
            backgroundColor: `${platform.color}08`,
          }}
          title={`Search ${platform.name} for ${role} jobs`}
        >
          {platform.icon}
          {platform.name}
        </motion.a>
      ))}
    </div>
  )
}
