import { useMemo } from 'react'
import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { useTheme } from '../context/ThemeContext'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const DIMENSION_LABELS = {
  skill_breadth: 'Skill Breadth',
  automation_readiness: 'Automation Readiness',
  market_alignment: 'Market Alignment',
  growth_potential: 'Growth Potential',
  salary_position: 'Salary Position',
}

const DIMENSION_ORDER = [
  'skill_breadth',
  'automation_readiness',
  'market_alignment',
  'growth_potential',
  'salary_position',
]

export default function BenchmarkComparison({ data }) {
  const { isDark } = useTheme()

  if (!data || !data.user_scores || !data.industry_avg) return null

  const pointBorderColor = isDark ? '#0a0a0f' : '#ffffff'
  const textColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,46,0.5)'
  const tickColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(26,26,46,0.15)'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,26,46,0.08)'
  const tooltipBg = isDark ? 'rgba(18, 18, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(26, 26, 46, 0.1)'

  const chartData = useMemo(() => ({
    labels: DIMENSION_ORDER.map((k) => DIMENSION_LABELS[k]),
    datasets: [
      {
        label: 'Your Profile',
        data: DIMENSION_ORDER.map((k) => data.user_scores[k] || 0),
        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(14, 165, 233, 0.15)',
        borderColor: isDark ? '#38BDF8' : '#0EA5E9',
        borderWidth: 2,
        pointBackgroundColor: isDark ? '#38BDF8' : '#0EA5E9',
        pointBorderColor,
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Industry Average',
        data: DIMENSION_ORDER.map((k) => data.industry_avg[k] || 0),
        backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : 'rgba(124, 58, 237, 0.08)',
        borderColor: isDark ? '#A78BFA' : '#7C3AED',
        borderWidth: 2,
        borderDash: [4, 4],
        pointBackgroundColor: isDark ? '#A78BFA' : '#7C3AED',
        pointBorderColor,
        pointBorderWidth: 2,
        pointRadius: 3,
      },
    ],
  }), [data, isDark, pointBorderColor])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 25,
          color: tickColor,
          backdropColor: 'transparent',
          font: { size: 9, family: 'JetBrains Mono' },
        },
        grid: {
          color: gridColor,
        },
        angleLines: {
          color: gridColor,
        },
        pointLabels: {
          color: textColor,
          font: { size: 11, family: 'Outfit' },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { size: 11, family: 'Outfit' },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: isDark ? '#fff' : '#1a1a2e',
        bodyColor: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(26,26,46,0.8)',
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleFont: { family: 'Outfit' },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}/100`,
        },
      },
    },
  }), [isDark, textColor, tickColor, gridColor, tooltipBg, tooltipBorder])

  return (
    <div>
      <div className="h-[320px] md:h-[380px]">
        <Radar data={chartData} options={options} />
      </div>
      {data.summary && (
        <p className="text-xs theme-text-tertiary text-center mt-4 leading-relaxed">{data.summary}</p>
      )}
    </div>
  )
}
