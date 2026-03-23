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
    name: 'Glassdoor',
    color: '#0CAA41',
    urlTemplate: (role) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(role)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M17.14 2H6.86A2.86 2.86 0 004 4.86v14.28A2.86 2.86 0 006.86 22h10.28A2.86 2.86 0 0020 19.14V4.86A2.86 2.86 0 0017.14 2zM12 18a6 6 0 110-12 6 6 0 010 12z" />
      </svg>
    ),
  },
  {
    name: 'Wellfound',
    color: '#E74C3C',
    urlTemplate: (role) => `https://wellfound.com/jobs?q=${encodeURIComponent(role)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    name: 'Google Jobs',
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
  {
    name: 'We Work Remotely',
    color: '#FB923C',
    urlTemplate: (role) => `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(role)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
]

const COMPANY_MAP = {
  'AI/ML': [
    { name: 'OpenAI', color: '#10A37F' },
    { name: 'Anthropic', color: '#D4A574' },
    { name: 'Google DeepMind', color: '#4285F4' },
    { name: 'Meta AI', color: '#0668E1' },
    { name: 'NVIDIA', color: '#76B900' },
    { name: 'Hugging Face', color: '#FFD21E' },
  ],
  'Engineering': [
    { name: 'Google', color: '#4285F4' },
    { name: 'Microsoft', color: '#00A4EF' },
    { name: 'Stripe', color: '#635BFF' },
    { name: 'Vercel', color: '#E2E8F0' },
    { name: 'Cloudflare', color: '#F6821F' },
    { name: 'Amazon', color: '#FF9900' },
  ],
  'Data': [
    { name: 'Snowflake', color: '#29B5E8' },
    { name: 'Databricks', color: '#FF3621' },
    { name: 'Palantir', color: '#E2E8F0' },
    { name: 'dbt Labs', color: '#FF694A' },
    { name: 'Confluent', color: '#38BDF8' },
    { name: 'Fivetran', color: '#0073FF' },
  ],
  'Infrastructure': [
    { name: 'AWS', color: '#FF9900' },
    { name: 'HashiCorp', color: '#E2E8F0' },
    { name: 'Datadog', color: '#632CA6' },
    { name: 'Grafana Labs', color: '#F46800' },
    { name: 'Cloudflare', color: '#F6821F' },
    { name: 'Elastic', color: '#00BFB3' },
  ],
  'Security': [
    { name: 'CrowdStrike', color: '#FF0000' },
    { name: 'Palo Alto Networks', color: '#FA582D' },
    { name: 'Snyk', color: '#4C4A73' },
    { name: 'Fortinet', color: '#EE3124' },
    { name: 'SentinelOne', color: '#6C2EB9' },
  ],
  'Management': [
    { name: 'Atlassian', color: '#0052CC' },
    { name: 'Asana', color: '#F06A6A' },
    { name: 'Linear', color: '#5E6AD2' },
    { name: 'Notion', color: '#E2E8F0' },
    { name: 'GitLab', color: '#FC6D26' },
  ],
  'Design': [
    { name: 'Figma', color: '#A259FF' },
    { name: 'Canva', color: '#00C4CC' },
    { name: 'Adobe', color: '#FF0000' },
    { name: 'Framer', color: '#0055FF' },
  ],
  'Content': [
    { name: 'Notion', color: '#E2E8F0' },
    { name: 'GitBook', color: '#3884FF' },
    { name: 'Contentful', color: '#2478CC' },
    { name: 'Readme', color: '#018EF5' },
  ],
  'QA': [
    { name: 'BrowserStack', color: '#F5A623' },
    { name: 'Sauce Labs', color: '#E2231A' },
    { name: 'LambdaTest', color: '#0EBAC5' },
    { name: 'Testim', color: '#6366F1' },
  ],
}

function PlatformPill({ platform, role }) {
  return (
    <motion.a
      href={platform.urlTemplate(role)}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors"
      style={{
        borderColor: `${platform.color}50`,
        color: platform.color,
        backgroundColor: `${platform.color}15`,
      }}
      title={`Search ${platform.name} for ${role} jobs`}
    >
      {platform.icon}
      {platform.name}
    </motion.a>
  )
}

function CompanyPill({ company, role }) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(company.name + ' ' + role + ' careers')}`
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors"
      style={{
        borderColor: `${company.color}50`,
        color: company.color,
        backgroundColor: `${company.color}12`,
      }}
      title={`${company.name} — ${role} careers`}
    >
      {company.name}
    </motion.a>
  )
}

export default function JobLinks({ role, category }) {
  const companies = COMPANY_MAP[category] || COMPANY_MAP['Engineering']

  return (
    <div className="space-y-3">
      {/* Search Platforms */}
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: '#94A3B8' }}>
          Search Platforms
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((platform) => (
            <PlatformPill key={platform.name} platform={platform} role={role} />
          ))}
        </div>
      </div>

      {/* Top Companies Hiring */}
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: '#94A3B8' }}>
          Top Companies Hiring
        </p>
        <div className="flex flex-wrap gap-1.5">
          {companies.map((company) => (
            <CompanyPill key={company.name} company={company} role={role} />
          ))}
        </div>
      </div>
    </div>
  )
}
