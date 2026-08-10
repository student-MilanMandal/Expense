import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { HiChartBar, HiArrowTrendingUp } from 'react-icons/hi2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const IncomeExpenseChart = ({ data = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [chartType, setChartType] = useState('area'); // 'area' or 'bar'
  const [timePeriod, setTimePeriod] = useState('monthly'); // 'weekly', 'monthly', 'yearly'

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-4 text-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HiChartBar className="w-5 h-5 text-[#089790]" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Income & Expense Trend
            </h3>
          </div>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <HiArrowTrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
          <p>No income or expense records found for this period.</p>
          <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-1">Add transactions to see your real-time cash flow chart.</p>
        </div>
      </div>
    );
  }

  const labels = data.map((item) => item.month || item.label || item.year || 'Period');
  const incomeValues = data.map((item) => item.income || 0);
  const expenseValues = data.map((item) => item.expense || 0);

  // Line / Area Graph Dataset with smooth cubic curves & gradient fills
  const lineChartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Income (₹)',
        data: incomeValues,
        borderColor: '#089790', // Ocean Mint Teal
        borderWidth: 3.5,
        tension: 0.45,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#089790',
        pointBorderColor: isDark ? '#0A1325' : '#ffffff',
        pointBorderWidth: 2.5,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 320);
          gradient.addColorStop(0, isDark ? 'rgba(8, 151, 144, 0.4)' : 'rgba(134, 227, 206, 0.35)');
          gradient.addColorStop(1, 'rgba(8, 151, 144, 0.0)');
          return gradient;
        },
      },
      {
        fill: true,
        label: 'Expense (₹)',
        data: expenseValues,
        borderColor: '#E25B45', // Terracotta Coral
        borderWidth: 3.5,
        tension: 0.45,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#E25B45',
        pointBorderColor: isDark ? '#0A1325' : '#ffffff',
        pointBorderWidth: 2.5,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 320);
          gradient.addColorStop(0, isDark ? 'rgba(226, 91, 69, 0.4)' : 'rgba(250, 137, 123, 0.35)');
          gradient.addColorStop(1, 'rgba(226, 91, 69, 0.0)');
          return gradient;
        },
      },
    ],
  };

  // Bar Chart Dataset
  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Income (₹)',
        data: incomeValues,
        backgroundColor: 'rgba(8, 151, 144, 0.85)',
        borderRadius: 10,
      },
      {
        label: 'Expense (₹)',
        data: expenseValues,
        backgroundColor: 'rgba(226, 91, 69, 0.85)',
        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { family: 'Plus Jakarta Sans', weight: 700, size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(10, 19, 37, 0.98)' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? 'rgba(31, 71, 89, 0.6)' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#97CADB' : '#64748b',
          font: { family: 'Plus Jakarta Sans', weight: 700, size: 12 },
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(31, 71, 89, 0.3)' : 'rgba(0,0,0,0.05)',
          borderDash: [5, 5],
        },
        ticks: {
          color: isDark ? '#97CADB' : '#64748b',
          font: { family: 'Plus Jakarta Sans', weight: 600, size: 11 },
          callback: (value) => `₹${value.toLocaleString('en-IN')}`,
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#1F4759]/40 pb-4">
        <div>
          <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Income vs Expenses Overview
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-[#97CADB]">
            {timePeriod === 'weekly' ? '7-day cash flow overview' : timePeriod === 'yearly' ? '5-year financial trajectory' : 'Historical monthly cash flow breakdown'}
          </p>
        </div>

        {/* Timeframe & Chart Type Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Weekly / Monthly / Yearly Toggle */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-[#070F1E] border border-slate-200/80 dark:border-[#1F4759]/60 rounded-2xl">
            {['weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold capitalize transition-all cursor-pointer ${
                  timePeriod === period
                    ? 'bg-white dark:bg-[#0A1325] text-[#089790] dark:text-[#86E3CE] shadow-xs border border-slate-200/60 dark:border-[#1F4759]/60'
                    : 'text-slate-500 dark:text-[#97CADB] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Area / Bar View Switcher */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-[#070F1E] border border-slate-200/80 dark:border-[#1F4759]/60 rounded-2xl">
            <button
              onClick={() => setChartType('area')}
              aria-label="Area Chart"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white dark:bg-[#0A1325] text-[#089790] dark:text-[#86E3CE] shadow-xs'
                  : 'text-slate-500 dark:text-[#97CADB]'
              }`}
            >
              <HiArrowTrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              aria-label="Bar Chart"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-[#0A1325] text-[#089790] dark:text-[#86E3CE] shadow-xs'
                  : 'text-slate-500 dark:text-[#97CADB]'
              }`}
            >
              <HiChartBar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Graph Area Container */}
      <div className="w-full h-80 pt-2">
        {chartType === 'area' ? (
          <Line data={lineChartData} options={options} />
        ) : (
          <Bar data={barChartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
