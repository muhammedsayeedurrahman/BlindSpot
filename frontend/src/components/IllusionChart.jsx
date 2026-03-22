import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useTheme } from '../context/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function IllusionChart({ data }) {
  const { isDark } = useTheme()

  const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(26,26,46,0.7)'
  const textColorMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,46,0.5)'
  const textColorFaint = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(26,26,46,0.4)'
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(26,26,46,0.06)'
  const tooltipBg = isDark ? '#1a1a2e' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(14, 165, 233, 0.3)'
  const legendColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,46,0.6)'

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.skill),
    datasets: [
      {
        label: 'Your Confidence',
        data: data.map((d) => d.confidence * 10),
        backgroundColor: 'rgba(167, 139, 250, 0.6)',
        borderColor: '#A78BFA',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Market Relevance',
        data: data.map((d) => d.market_relevance),
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
        borderColor: '#38BDF8',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }), [data])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: legendColor, usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          afterBody: (ctx) => {
            const idx = ctx[0].dataIndex
            const item = data[idx]
            if (item.illusion_score > 0) {
              return `Illusion gap: ${item.illusion_score.toFixed(1)}`
            }
            return ''
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
        grid: { display: false },
        ticks: { color: textColor, font: { size: 10 } },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColorMuted },
        max: 100,
        title: { display: true, text: 'Score', color: textColorFaint },
      },
    },
  }), [data, isDark, textColor, textColorMuted, textColorFaint, gridColor, legendColor, tooltipBg, tooltipBorder])

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}
