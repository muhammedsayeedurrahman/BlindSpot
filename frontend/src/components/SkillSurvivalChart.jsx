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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const STATUS_COLORS = {
  thriving: '#39ff14',
  stable: '#00f0ff',
  at_risk: '#ff6a00',
  critical: '#ff2d7c',
}

export default function SkillSurvivalChart({ data }) {
  const chartData = {
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
  }

  const options = {
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
        backgroundColor: '#1a1a2e',
        borderColor: 'rgba(0, 240, 255, 0.3)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.5)' },
        title: { display: true, text: 'Years', color: 'rgba(255,255,255,0.4)' },
      },
      y: {
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}
