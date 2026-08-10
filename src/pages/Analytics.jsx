import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '../components/common/AnimatedCounter';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import SavingsProgressChart from '../components/charts/SavingsProgressChart';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiArrowUpRight,
  HiInformationCircle,
} from 'react-icons/hi2';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] },
  },
};

import { useAnalyticsQuery, useDashboardQuery } from '../hooks/queries/useDashboardQueries';

const Analytics = () => {
  const { data: dashRes, isLoading: dashLoading } = useDashboardQuery();
  const { data: analyticsRes, isLoading: analyticsLoading } = useAnalyticsQuery();

  const loading = dashLoading || analyticsLoading;
  const dashboardData = dashRes?.data || null;
  const analyticsData = analyticsRes?.data || null;

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={4} />
        <CardSkeleton count={4} />
        <CardSkeleton count={2} />
      </div>
    );
  }

  const incVsExp = analyticsData?.incVsExp || {};
  const catSpending = analyticsData?.catSpending || {};
  const savingsTrend = analyticsData?.savingsTrend || {};
  const charts = dashboardData?.charts || {};

  const totalIncome = incVsExp.totalIncome || 0;
  const totalExpense = incVsExp.totalExpense || 0;
  const netSavings = incVsExp.netSavings || totalIncome - totalExpense;
  const incomeCount = incVsExp.incomeCount || 1;
  const expenseCount = incVsExp.expenseCount || 1;

  // Rate calculations (100% Dynamic MongoDB Data)
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;
  const expenseRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;
  const budgetAdherence = savingsTrend.overallProgress || 0;
  const liquidityRatio = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round((netSavings / totalIncome) * 100))) : 0;
  const essentialRatio = incVsExp.essentialRatio || 0;
  const budgetControlPct = incVsExp.budgetControlPct || 0;
  const totalBudgetLimit = incVsExp.totalBudgetLimit || 0;
  const isBudgetExceeded = incVsExp.isBudgetExceeded || false;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Analytics & Performance
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-[#97CADB] mt-0.5">
            Real-time financial ratios, income vs expense trends and savings performance
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-[#089790]/10 border border-[#089790]/20 text-[#089790] dark:text-[#86E3CE] text-xs font-bold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#089790] animate-pulse" />
          <span>Live Metrics Sync</span>
        </div>
      </motion.div>

      {/* Row 1: Top 4 Primary Highlight Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Monthly Income */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB] flex items-center space-x-1.5">
              <span>Total Income</span>
              <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              <AnimatedCounter value={totalIncome} prefix="₹" />
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#86E3CE]/20 text-[#089790] dark:text-[#86E3CE]">
              Credits
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {incomeCount} Recorded Credits
          </p>
        </div>

        {/* Card 2: Monthly Expense */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB] flex items-center space-x-1.5">
              <span>Total Expense</span>
              <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              <AnimatedCounter value={totalExpense} prefix="₹" />
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FA897B]/20 text-[#E25B45] dark:text-[#FA897B]">
              Debits
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {expenseCount} Recorded Debits
          </p>
        </div>

        {/* Card 3: Savings Ratio */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB] flex items-center space-x-1.5">
              <span>Savings Rate</span>
              <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              <AnimatedCounter value={savingsRate} suffix="%" decimals={0} />
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#86E3CE]/20 text-[#089790] dark:text-[#86E3CE]">
              {savingsRate > 0 ? 'Positive' : '0%'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {netSavings < 0 ? (
              <span className="text-rose-500 font-extrabold">-₹{Math.abs(netSavings).toLocaleString('en-IN')} Net Deficit</span>
            ) : (
              <span className="text-emerald-500 font-extrabold">₹{netSavings.toLocaleString('en-IN')} Net Saved</span>
            )}
          </p>
        </div>

        {/* Card 4: Expense Ratio */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB] flex items-center space-x-1.5">
              <span>Expense Ratio</span>
              <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              <AnimatedCounter value={expenseRatio} suffix="%" decimals={0} />
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#8474A1]/20 text-[#8474A1] dark:text-[#CCA8D8]">
              {expenseRatio > 0 ? `${expenseRatio}%` : '0%'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Of Total Monthly Outflow
          </p>
        </div>
      </motion.div>

      {/* Row 2: Performance & Delivery Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Health & Ratios
          </h3>
          <span className="text-xs font-extrabold text-[#089790] dark:text-[#86E3CE] uppercase tracking-wider">
            AUTOMATED AUDIT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Rate 1: Savings Goal Progress */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Savings Target Rate</span>
              <HiInformationCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={budgetAdherence} suffix="%" />
              </h4>
              <p className="text-[11px] font-bold text-[#FAC172] mt-1">
                ₹<AnimatedCounter value={savingsTrend.totalSaved || 0} /> / ₹<AnimatedCounter value={savingsTrend.totalTarget || 0} />
              </p>
            </div>
            {/* Mini Micro Bar Chart Graphic */}
            <div className="flex items-end space-x-1.5 h-7 pt-1">
              <div className="w-full bg-[#089790]/30 h-4 rounded-xs" />
              <div className="w-full bg-[#089790]/50 h-5 rounded-xs" />
              <div className="w-full bg-[#089790]/70 h-6 rounded-xs" />
              <div className="w-full bg-[#089790] h-7 rounded-xs" />
              <div className="w-full bg-[#86E3CE] h-5 rounded-xs" />
            </div>
          </div>

          {/* Rate 2: Budget Efficiency */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Budget Control</span>
              <HiInformationCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={budgetControlPct} suffix="%" />
              </h4>
              <p className={`text-[11px] font-bold mt-1 ${totalBudgetLimit > 0 ? (isBudgetExceeded ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-400'}`}>
                {totalBudgetLimit > 0 ? (isBudgetExceeded ? 'Budget Limit Exceeded' : 'Under Limit Threshold') : 'No Budget Limit Set'}
              </p>
            </div>
            <div className="flex items-end space-x-1.5 h-7 pt-1">
              <div className="w-full bg-[#018ABE]/40 h-5 rounded-xs" />
              <div className="w-full bg-[#018ABE]/60 h-6 rounded-xs" />
              <div className="w-full bg-[#018ABE] h-7 rounded-xs" />
              <div className="w-full bg-[#018ABE]/80 h-4 rounded-xs" />
              <div className="w-full bg-[#018ABE]/50 h-3 rounded-xs" />
            </div>
          </div>

          {/* Rate 3: Essential Expense Ratio */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Essential Ratio</span>
              <HiInformationCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={essentialRatio} suffix="%" />
              </h4>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                Fixed Bills & Living Needs
              </p>
            </div>
            <div className="flex items-end space-x-1.5 h-7 pt-1">
              <div className="w-full bg-[#8474A1]/40 h-3 rounded-xs" />
              <div className="w-full bg-[#8474A1]/60 h-5 rounded-xs" />
              <div className="w-full bg-[#8474A1] h-7 rounded-xs" />
              <div className="w-full bg-[#8474A1]/70 h-4 rounded-xs" />
              <div className="w-full bg-[#8474A1]/50 h-2 rounded-xs" />
            </div>
          </div>

          {/* Rate 4: Liquidity Ratio */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Liquidity Score</span>
              <HiInformationCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={liquidityRatio} suffix="%" />
              </h4>
              <p className="text-[11px] font-bold text-[#089790] mt-1">
                {liquidityRatio >= 20 ? 'Strong Cash Availability' : liquidityRatio > 0 ? 'Moderate Reserve' : 'No Cash Reserve'}
              </p>
            </div>
            <div className="flex items-end space-x-1.5 h-7 pt-1">
              <div className="w-full bg-[#E25B45]/30 h-2 rounded-xs" />
              <div className="w-full bg-[#089790]/50 h-4 rounded-xs" />
              <div className="w-full bg-[#089790]/80 h-6 rounded-xs" />
              <div className="w-full bg-[#089790] h-7 rounded-xs" />
              <div className="w-full bg-[#86E3CE] h-5 rounded-xs" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 3: Bottom Charts Section (Exact Layout of Reference Image Bottom Row) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Left Chart Card: Cash Flow & Trends (Email Data Chart in Reference Image) */}
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-4">
          <IncomeExpenseChart data={charts.incomeVsExpense || []} />
        </div>

        {/* Right Chart Card: Category Breakdown (Performance By Device Type in Reference Image) */}
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-4">
          <CategoryPieChart data={catSpending.categories || []} />
        </div>
      </motion.div>

      {/* Savings Goal Target Overview Component */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <SavingsProgressChart
          overallProgress={savingsTrend.overallProgress || 0}
          totalSaved={savingsTrend.totalSaved || 0}
          totalTarget={savingsTrend.totalTarget || 0}
        />
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
