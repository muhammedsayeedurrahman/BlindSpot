import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useTheme } from '../context/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const STATUS_COLORS = {
  thriving: '#39ff14',
  stable: '#00f0ff',
  at_risk: '#ff6a00',
  critical: '#ff2d7c',
}

export default function SkillSurvivalChart({ data }) {
  const { isDark } = useTheme()

  const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(26,26,46,0.7)'
  const textColorMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,46,0.5)'
  const textColorFaint = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(26,26,46,0.4)'
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(26,26,46,0.06)'
  const tooltipBg = isDark ? '#1a1a2e' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 160, 190, 0.3)'

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.skill),
    datasets: [
      {
        label: 'Half-Life (years)',
        data: data.map((d) => Math.min(d.half_life_years, 20)),
        backgroundColor: data.map((d) => STATUS_COLORS[d.status] + '99'),
        borderColor: data.map((d) => STATUS_COLORS[d.status]),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }), [data])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const item = data[ctx.dataIndex]
            return [
              `Half-life: ${item.half_life_years}y`,
              `Automation risk: ${(item.automation_risk * 100).toFixed(0)}%`,
              `Status: ${item.status}`,
            ]
          },
        },
        backgroundColor: tooltipBg,
        titleColor: isDark ? '#fff' : '#1a1a2e',
        bodyColor: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(26,26,46,0.8)',
        borderColor: tooltipBorder,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColorMuted },
        title: { display: true, text: 'Years', color: textColorFaint },
      },
      y: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11 } },
      },
    },
  }), [data, isDark, textColor, textColorMuted, textColorFaint, gridColor, tooltipBg, tooltipBorder])

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}
