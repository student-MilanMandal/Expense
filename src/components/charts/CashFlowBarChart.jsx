import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CashFlowBarChart = ({ data = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <p>No cash flow data recorded yet.</p>
      </div>
    );
  }

  const labels = data.map((d) => d.month || d.label || 'Month');
  const values = data.map((d) => d.income || d.expense || d.total || 0);

  const lastIndex = values.length - 1;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Net Cash Flow',
        data: values,
        backgroundColor: values.map((_, idx) =>
          idx === lastIndex
            ? '#f43f5e' // Vibrant Coral for active month
            : isDark
            ? 'rgba(255, 255, 255, 0.08)' // Soft translucent pattern in dark mode
            : '#f1f5f9' // Soft neutral in light mode
        ),
        borderRadius: 14,
        borderSkipped: false,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: (context) => ` Cash Flow: ₹${context.parsed.y.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: (context) => (context.index === lastIndex ? '#f43f5e' : isDark ? '#94a3b8' : '#64748b'),
          font: { family: 'Plus Jakarta Sans', weight: 700, size: 11 },
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          borderDash: [4, 4],
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: 'Plus Jakarta Sans', weight: 600, size: 10 },
          callback: (val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`,
        },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CashFlowBarChart;
