import React, { useMemo } from 'react';
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

import { useAnalyticsQuery, useDashboardQuery } from '../hooks/queries/useDashboardQueries';

const Analytics = () => {
  const { data: dashRes, isLoading: dashLoading } = useDashboardQuery();
  const { data: analyticsRes, isLoading: analyticsLoading } = useAnalyticsQuery();

  const loading = dashLoading || analyticsLoading;
  const dashboardData = dashRes?.data || null;
  const analyticsData = analyticsRes?.data || null;

  const incVsExp = analyticsData?.incVsExp || {};
  const catSpending = analyticsData?.catSpending || {};
  const savingsTrend = analyticsData?.savingsTrend || {};
  const charts = dashboardData?.charts || {};

  const totalIncome = incVsExp.totalIncome || 0;
  const totalExpense = incVsExp.totalExpense || 0;
  const netSavings = incVsExp.netSavings || totalIncome - totalExpense;
  const incomeCount = incVsExp.incomeCount || 1;
  const expenseCount = incVsExp.expenseCount || 1;

  // Rate calculations - Memoized for zero re-render overhead
  const {
    savingsRate,
    expenseRatio,
    budgetAdherence,
    liquidityRatio,
    essentialRatio,
    budgetControlPct,
    totalBudgetLimit,
    isBudgetExceeded,
  } = useMemo(() => {
    const sRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;
    const eRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;
    const bAdherence = savingsTrend.overallProgress || 0;
    const lRatio = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round((netSavings / totalIncome) * 100))) : 0;
    const essRatio = incVsExp.essentialRatio || 0;
    const bCtrlPct = incVsExp.budgetControlPct || 0;
    const bLimit = incVsExp.totalBudgetLimit || 0;
    const bExceeded = incVsExp.isBudgetExceeded || false;

    return {
      savingsRate: sRate,
      expenseRatio: eRatio,
      budgetAdherence: bAdherence,
      liquidityRatio: lRatio,
      essentialRatio: essRatio,
      budgetControlPct: bCtrlPct,
      totalBudgetLimit: bLimit,
      isBudgetExceeded: bExceeded,
    };
  }, [totalIncome, totalExpense, netSavings, savingsTrend.overallProgress, incVsExp]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={4} />
        <CardSkeleton count={4} />
        <CardSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Analytics & Performance
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-[#97CADB] mt-0.5">
            Real-time financial ratios, income vs expense trends and savings performance
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-[#089790]/10 border border-[#089790]/20 text-[#089790] dark:text-[#86E3CE] text-xs font-bold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#089790]" />
          <span>Live Metrics Sync</span>
        </div>
      </div>

      {/* Row 1: Top 4 Primary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Monthly Income */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB] flex items-center space-x-1.5">
              <span>Total Income</span>
              <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <div className="w-8 h-8 rounded-full bg-[#089790]/15 flex items-center justify-center text-[#089790]">
              <HiArrowTrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={totalIncome} prefix="₹" />
            </h3>
            <p className="text-[11px] font-bold text-[#089790] dark:text-[#86E3CE] mt-1">
              Active cash inflows ({incomeCount} records)
            </p>
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB] flex items-center space-x-1.5">
              <span>Total Spent</span>
              <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <div className="w-8 h-8 rounded-full bg-[#E25B45]/15 flex items-center justify-center text-[#E25B45]">
              <HiArrowTrendingDown className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={totalExpense} prefix="₹" />
            </h3>
            <p className="text-[11px] font-bold text-[#E25B45] dark:text-[#FA897B] mt-1">
              Recorded debits ({expenseCount} transactions)
            </p>
          </div>
        </div>

        {/* Card 3: Savings Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB] flex items-center space-x-1.5">
              <span>Savings Rate</span>
              <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <div className="w-8 h-8 rounded-full bg-[#089790]/15 flex items-center justify-center text-[#089790]">
              <HiArrowTrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#089790] dark:text-[#86E3CE]">
              <AnimatedCounter value={savingsRate} suffix="%" decimals={0} />
            </h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#089790] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, savingsRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Expense to Income Ratio */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB] flex items-center space-x-1.5">
              <span>Expense Ratio</span>
              <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${expenseRatio > 80 ? 'bg-[#E25B45]/15 text-[#E25B45]' : 'bg-[#FAC172]/15 text-[#FAC172]'}`}>
              <HiInformationCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              <AnimatedCounter value={expenseRatio} suffix="%" decimals={0} />
            </h3>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
              {expenseRatio > 80 ? 'High spending threshold' : 'Spending within healthy limits'}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Metric Cards (Financial Health Ratios) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 5: Net Savings Amount */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB]">Net Retained Balance</span>
          <div className={`text-xl font-black ${netSavings >= 0 ? 'text-[#089790] dark:text-[#86E3CE]' : 'text-[#E25B45] dark:text-[#FA897B]'}`}>
            {netSavings >= 0 ? '+' : '-'}₹{Math.abs(netSavings).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] font-bold text-slate-400">
            Total Inflow - Total Outflow
          </p>
        </div>

        {/* Card 6: Goal Adherence */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB]">Savings Goals Fulfillment</span>
          <div className="text-xl font-black text-[#8474A1] dark:text-[#86E3CE]">
            <AnimatedCounter value={budgetAdherence} suffix="%" />
          </div>
          <p className="text-[11px] font-bold text-slate-400">
            ₹<AnimatedCounter value={savingsTrend.totalSaved || 0} /> / ₹<AnimatedCounter value={savingsTrend.totalTarget || 0} />
          </p>
        </div>

        {/* Card 7: Budget Usage % */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB]">Budget Consumption</span>
          <div className={`text-xl font-black ${isBudgetExceeded ? 'text-[#E25B45]' : 'text-slate-900 dark:text-white'}`}>
            <AnimatedCounter value={budgetControlPct} suffix="%" />
          </div>
          <p className="text-[11px] font-bold text-slate-400">
            {totalBudgetLimit > 0 ? `₹${totalExpense.toLocaleString('en-IN')} of ₹${totalBudgetLimit.toLocaleString('en-IN')} limit` : 'No limits assigned'}
          </p>
        </div>

        {/* Card 8: Essential Outflow Ratio */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB]">Essential Outflows</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            <AnimatedCounter value={essentialRatio} suffix="%" />
          </div>
          <p className="text-[11px] font-bold text-slate-400">
            Food, Utilities & Rent spending
          </p>
        </div>
      </div>

      {/* Row 3: Bottom Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart Card: Cash Flow & Trends */}
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-4">
          <IncomeExpenseChart data={charts.incomeVsExpense || []} />
        </div>

        {/* Right Chart Card: Category Breakdown */}
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-4">
          <CategoryPieChart data={catSpending.categories || []} />
        </div>
      </div>

      {/* Savings Goal Target Overview Component */}
      <div>
        <SavingsProgressChart
          overallProgress={savingsTrend.overallProgress || 0}
          totalSaved={savingsTrend.totalSaved || 0}
          totalTarget={savingsTrend.totalTarget || 0}
        />
      </div>
    </div>
  );
};

export default Analytics;
