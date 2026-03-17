import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { motion } from 'framer-motion'
import { useCurrency } from '../context/CurrencyContext'
import { formatSalary, formatSalaryCompact } from '../utils/currency'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function CareerTwin({ data }) {
  const { currency } = useCurrency()
  const { current_path, optimized_path, recommended_skills } = data

  const chartData = {
    labels: current_path.salary_projection.map((p) => p.year),
    datasets: [
      {
        label: `Current: ${current_path.role}`,
        data: current_path.salary_projection.map((p) => p.salary),
        borderColor: '#ff6a00',
        backgroundColor: 'rgba(255, 106, 0, 0.1)',
        borderDash: [5, 5],
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
      {
        label: `Optimized: ${optimized_path.role}`,
        data: optimized_path.salary_projection.map((p) => p.salary),
        borderColor: '#39ff14',
        backgroundColor: 'rgba(57, 255, 20, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'rgba(255,255,255,0.6)', usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatSalary(ctx.parsed.y, currency)}`,
        },
        backgroundColor: '#1a1a2e',
        borderColor: 'rgba(0, 240, 255, 0.3)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.6)' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: 'rgba(255,255,255,0.6)',
          callback: (v) => formatSalaryCompact(v, currency),
        },
      },
    },
  }

  const salaryDiff =
    optimized_path.salary_projection.at(-1).salary -
    current_path.salary_projection.at(-1).salary

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart */}
      <div className="lg:col-span-2 h-72">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <div className="bg-dark-700/50 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Salary uplift by 2027</p>
          <p className="text-2xl font-bold text-neon-green">
            +{formatSalary(salaryDiff, currency)}
          </p>
        </div>

        <div className="bg-dark-700/50 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Current automation risk</p>
          <p className="text-xl font-bold text-neon-orange">
            {(current_path.automation_exposure * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-dark-700/50 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Optimized automation risk</p>
          <p className="text-xl font-bold text-neon-green">
            {(optimized_path.automation_exposure * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-dark-700/50 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">Skills to learn</p>
          <div className="flex flex-wrap gap-1">
            {recommended_skills.map((s) => (
              <motion.span
                key={s.skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  s.priority === 'high'
                    ? 'bg-neon-pink/20 text-neon-pink'
                    : 'bg-neon-cyan/20 text-neon-cyan'
                }`}
              >
                {s.skill}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
