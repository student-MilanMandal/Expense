import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { categoryColors } from '../../data/data';

ChartJS.register(ArcElement, Tooltip, Legend);

// Canvas-native Center Text Plugin (Renders text directly on canvas BEFORE tooltips, preventing HTML text bleed-through)
const centerTextPlugin = {
  id: 'centerTextPlugin',
  afterDraw: (chart) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const { left, top, right, bottom } = chartArea;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    const opts = chart.config.options.plugins.centerTextPlugin || {};
    const textColor = opts.textColor || '#ffffff';
    const subTextColor = opts.subTextColor || '#94a3b8';

    ctx.save();

    // 100% Bold Text
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('100%', centerX, centerY - 8);

    // Total Subtitle Text
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = subTextColor;
    ctx.fillText('Total', centerX, centerY + 12);

    ctx.restore();
  },
};

const CategoryPieChart = ({ data = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Spending Breakdown
          </h3>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
            Expense distribution
          </p>
        </div>
        <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <p>No category spending recorded for this month yet.</p>
        </div>
      </div>
    );
  }

  const chartItems = data;
  const labels = chartItems.map((item) => item.category || 'Misc');
  const values = chartItems.map((item) => item.total || item.totalAmount || 0);
  const totalSum = values.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: categoryColors.slice(0, chartItems.length),
        borderWidth: isDark ? 2 : 1.5,
        borderColor: isDark ? '#0f172a' : '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      centerTextPlugin: {
        textColor: isDark ? '#ffffff' : '#0f172a',
        subTextColor: isDark ? '#94a3b8' : '#64748b',
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.98)' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const val = context.parsed;
            const pct = totalSum > 0 ? Math.round((val / totalSum) * 100) : 0;
            return ` ${context.label}: ₹${val.toLocaleString('en-IN')} (${pct}%)`;
          },
        },
      },
    },
    cutout: '72%',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Spending Breakdown
          </h3>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
            Expense distribution
          </p>
        </div>
      </div>

      {/* Donut Chart Canvas with Canvas-native Center Plugin */}
      <div className="relative w-full h-48 flex items-center justify-center">
        <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
      </div>

      {/* 2-Column Grid Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-2">
        {chartItems.map((item, idx) => {
          const val = item.total || item.totalAmount || 0;
          const pct = totalSum > 0 ? Math.round((val / totalSum) * 100) : 0;
          const color = categoryColors[idx % categoryColors.length];

          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-xs flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: color }}
                />
                <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                  {item.category}
                </span>
              </div>
              <span className="font-extrabold text-slate-400 dark:text-slate-400 ml-2">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPieChart;
