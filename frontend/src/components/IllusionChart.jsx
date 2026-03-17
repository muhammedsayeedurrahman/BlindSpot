import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function IllusionChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.skill),
    datasets: [
      {
        label: 'Your Confidence',
        data: data.map((d) => d.confidence * 10),
        backgroundColor: 'rgba(180, 74, 255, 0.6)',
        borderColor: '#b44aff',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Market Relevance',
        data: data.map((d) => d.market_relevance),
        backgroundColor: 'rgba(0, 240, 255, 0.6)',
        borderColor: '#00f0ff',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'rgba(255,255,255,0.6)', usePointStyle: true },
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
        backgroundColor: '#1a1a2e',
        borderColor: 'rgba(0, 240, 255, 0.3)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.5)' },
        max: 100,
        title: { display: true, text: 'Score', color: 'rgba(255,255,255,0.4)' },
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}
