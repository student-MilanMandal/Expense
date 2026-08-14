import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { formatDateDisplay } from '../utils/dateUtils';
import axiosClient from '../api/axiosClient';
import StatCard from '../components/common/StatCard';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import CardSkeleton, { ChartSkeleton } from '../components/common/LoadingSkeleton';
import Modal from '../components/common/Modal';
import { toast } from 'react-toastify';
import {
  HiCurrencyRupee,
  HiReceiptPercent,
  HiScale,
  HiCheckCircle,
  HiSparkles,
  HiArrowTrendingDown,
  HiPlus,
  HiMagnifyingGlass,
  HiEllipsisHorizontal,
  HiExclamationTriangle,
  HiTag,
  HiTrash,
  HiEye,
  HiCalendarDays,
  HiChartBar,
} from 'react-icons/hi2';

import CustomMonthPicker from '../components/common/CustomMonthPicker';
import Pagination from '../components/common/Pagination';
import { useDashboardQuery, DASHBOARD_QUERY_KEY } from '../hooks/queries/useDashboardQueries';
import { useQueryClient } from '@tanstack/react-query';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Month Picker State (Defaults to Current Active Month e.g., "2026-08")
  const now = new Date();
  const defaultMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthStr, setSelectedMonthStr] = useState(defaultMonthStr);

  const [yearStr, monthStr] = selectedMonthStr.split('-');
  const selectedYearNum = parseInt(yearStr, 10);
  const selectedMonthNum = parseInt(monthStr, 10);

  const dateObj = new Date(selectedYearNum, selectedMonthNum - 1, 1);
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const selectedMonthLabel = `${monthName}, ${selectedYearNum}`;

  // TanStack Query Server State with Month/Year Filter
  const { data: resData, isLoading: loading } = useDashboardQuery({
    year: selectedYearNum,
    month: selectedMonthNum,
  });
  const dashboardData = resData?.data || null;
  const cards = dashboardData?.cards || {};
  const widgets = dashboardData?.widgets || {};
  const charts = dashboardData?.charts || {};
  const recentActivities = dashboardData?.recentActivities || [];
  const budgets = dashboardData?.budgets || [];

  // Filtered transactions (Search + Type Filter) - Memoized for 0 re-render overhead
  const filteredActivities = useMemo(() => {
    return recentActivities.filter((act) => {
      const matchesSearch =
        act.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'ALL' || act.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [recentActivities, searchTerm, typeFilter]);

  // Pagination for Recent Transactions
  const totalPages = useMemo(() => Math.ceil(filteredActivities.length / itemsPerPage) || 1, [filteredActivities.length]);
  const paginatedActivities = useMemo(() => {
    return filteredActivities.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredActivities, currentPage]);

  // Calculate Budget Totals & Warning Status
  const { totalBudgetLimit, totalBudgetSpent, remainingBudget, budgetUsagePct, isBudgetExceeded } = useMemo(() => {
    const limit = budgets.reduce((acc, b) => acc + (b.limit || b.amount || 0), 0);
    const spent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
    const remaining = Math.max(0, limit - spent);
    const usage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return {
      totalBudgetLimit: limit,
      totalBudgetSpent: spent,
      remainingBudget: remaining,
      budgetUsagePct: usage,
      isBudgetExceeded: usage >= 90,
    };
  }, [budgets]);

  const handleDeleteActivity = useCallback(async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      if (type === 'INCOME') {
        await axiosClient.delete(`/income/deleteIncome/${id}`);
      } else {
        await axiosClient.delete(`/expense/deleteExpense/${id}`);
      }
      toast.success('Record deleted successfully');
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY] });
      setSelectedTxn(null);
    } catch (error) {
      toast.error('Failed to delete record');
    }
  }, [queryClient]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={4} />
        <CardSkeleton count={4} />
        <ChartSkeleton />
      </div>
    );
  }

  // STRICT REAL BACKEND WIDGET DATA (ZERO HARDCODED MOCK NUMBERS)
  const topCategoryObj = widgets.topCategory || (charts.categorySpending?.length > 0 ? {
    category: charts.categorySpending[0].category,
    totalAmount: charts.categorySpending[0].total,
    percentage: cards.totalExpense > 0 ? Math.round((charts.categorySpending[0].total / cards.totalExpense) * 100) : 0,
  } : null);

  const thisWeekSpending = cards.thisWeekSpending || 0;
  const currentMonthExpense = cards.thisMonthExpense || 0;
  const upcomingBills = widgets.upcomingBills || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Personal Expense Dashboard
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-[#97CADB]">
            Clean overview of your incomes, expenses, budgets & cashflow for {selectedMonthLabel}
          </p>
        </div>

        {/* Quick Actions (Custom Month Picker, Add Income, Add Expense) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Custom Modern Month Picker */}
          <CustomMonthPicker
            value={selectedMonthStr}
            onChange={setSelectedMonthStr}
          />

          <Link
            to="/incomes"
            className="px-3.5 py-2.5 bg-[#089790] hover:bg-[#055B5C] active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-[#089790]/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Income</span>
          </Link>
          <Link
            to="/expenses"
            className="px-3.5 py-2.5 bg-[#E25B45] hover:bg-[#FA897B] active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-[#E25B45]/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* 8 TOP SUMMARY CARDS (Strict Real Backend Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Income"
          value={cards.totalIncome || 0}
          subtitle="Lifetime recorded credits"
          icon={HiCurrencyRupee}
          color="emerald"
        />
        <StatCard
          title="Total Expenses"
          value={cards.totalExpense || 0}
          subtitle="Lifetime recorded debits"
          icon={HiReceiptPercent}
          color="rose"
        />
        <StatCard
          title="Current Balance"
          value={cards.currentBalance || 0}
          subtitle="Net liquid balance"
          icon={HiSparkles}
          color="indigo"
        />
        <StatCard
          title="Budget Usage"
          value={`${budgetUsagePct}%`}
          subtitle={isBudgetExceeded ? 'Exceeded Limit Alert!' : 'Of monthly budget used'}
          icon={HiCheckCircle}
          color={isBudgetExceeded ? 'rose' : 'cyan'}
        />

        {/* Selected Month Section: Monthly Income -> Monthly Expenses -> Monthly Savings */}
        <StatCard
          title="Monthly Income"
          value={cards.monthlyIncome || 0}
          subtitle={`Credits for ${selectedMonthLabel}`}
          icon={HiCurrencyRupee}
          color="blue"
          badge="Monthly"
        />
        <StatCard
          title="Monthly Expenses"
          value={currentMonthExpense}
          subtitle={`Outgoings for ${selectedMonthLabel}`}
          icon={HiArrowTrendingDown}
          color="purple"
          badge="Monthly"
        />
        <StatCard
          title="Monthly Savings"
          value={cards.monthlySavings || 0}
          subtitle={`Net saved for ${selectedMonthLabel}`}
          icon={HiScale}
          color="violet"
          badge="Monthly"
        />
        <StatCard
          title="Total Transactions"
          value={`${recentActivities.length} Entries`}
          subtitle="Recent logged activities"
          icon={HiChartBar}
          color="indigo"
        />
      </div>

      {/* NEW DASHBOARD WIDGETS ROW (Strict Real Backend Data - Zero Mock Numbers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Widget 1: Top Spending Category */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB]">Top Category</span>
            <HiTag className="w-4 h-4 text-[#089790]" />
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white truncate">
            {topCategoryObj ? topCategoryObj.category : 'No Spend Yet'}
          </h4>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>₹{(topCategoryObj ? topCategoryObj.totalAmount : 0).toLocaleString('en-IN')}</span>
            <span className="text-[#089790] font-extrabold">
              {topCategoryObj ? `${topCategoryObj.percentage}% of spend` : '0%'}
            </span>
          </div>
        </div>

        {/* Widget 2: This Week Spending */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB]">This Week Spend</span>
            <HiCalendarDays className="w-4 h-4 text-[#E25B45]" />
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white">
            ₹{thisWeekSpending.toLocaleString('en-IN')}
          </h4>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Recorded Monday to Today
          </p>
        </div>

        {/* Widget 3: Active User Budgets & Upcoming Bills */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#97CADB]">Upcoming Bills</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              {upcomingBills.length} Active
            </span>
          </div>
          {upcomingBills.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 py-2">No active recurring bills due.</p>
          ) : (
            <div className="space-y-1.5 text-xs font-semibold max-h-24 overflow-y-auto custom-scrollbar">
              {upcomingBills.map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between py-0.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{item.title}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹{Number(item.amount).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CHARTS SECTION (Income vs Expenses with Timeframe Toggle & Expense Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="lg:col-span-2 p-6 rounded-[28px] bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs backdrop-blur-md">
          <IncomeExpenseChart data={charts.incomeVsExpense || []} />
        </div>

        {/* Expense Category Breakdown Donut */}
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs backdrop-blur-md">
          <CategoryPieChart data={charts.categorySpending || []} />
        </div>
      </div>

      {/* RECENT TRANSACTIONS & IMPROVED BUDGET PLANNER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT TRANSACTIONS TABLE */}
        <div className="lg:col-span-2 p-6 rounded-[28px] bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Recent Transactions
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-[#97CADB]">
                Search, filter, and manage your recent ledger items
              </p>
            </div>

            {/* Search & Type Filters */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search activity..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#070F1E] border border-slate-200/80 dark:border-[#1F4759]/60 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#089790] placeholder:text-slate-400"
                />
              </div>

              {/* Type Filter Select */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-[#070F1E] border border-slate-200/80 dark:border-[#1F4759]/60 rounded-xl text-xs font-bold text-slate-700 dark:text-[#97CADB] focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
          </div>

          {/* Transactions Table without Status Column */}
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold">
              No matching activity recorded yet.
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#1F4759]/40 text-[11px] font-bold text-slate-400 dark:text-slate-400">
                      <th className="py-3 px-3">Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Payment Method</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1F4759]/30 text-xs font-semibold">
                    {paginatedActivities.map((act, idx) => {
                      const isIncome = act.type === 'INCOME';
                      return (
                        <tr key={act.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-[#1F4759]/20 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                isIncome ? 'bg-[#089790]/15 text-[#089790]' : 'bg-[#E25B45]/15 text-[#E25B45]'
                              }`}>
                                {act.title?.charAt(0) || 'T'}
                              </div>
                              <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[140px]">
                                {act.title}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {act.category || 'General'}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-medium">
                            {act.paymentMethod || 'UPI / Cash'}
                          </td>

                          <td className="py-3 px-3 text-slate-400 dark:text-slate-500">
                            {formatDateDisplay(act.date)}
                          </td>

                          <td className={`py-3 px-3 text-right font-black ${isIncome ? 'text-[#089790] dark:text-[#86E3CE]' : 'text-[#E25B45] dark:text-[#FA897B]'}`}>
                            {isIncome ? '+' : '-'}₹{act.amount.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => setSelectedTxn(act)}
                                title="View Details"
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                              >
                                <HiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteActivity(act.id, act.type)}
                                title="Delete Record"
                                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-400 hover:text-rose-600 cursor-pointer transition-colors"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Numbered Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredActivities.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>

        {/* IMPROVED BUDGET WIDGET */}
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#0A1325] border border-slate-200/80 dark:border-[#1F4759]/60 shadow-xs backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Budget Planner
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-[#97CADB]">
                Track monthly budget allocations
              </p>
            </div>
            <Link to="/budgets" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
              <HiEllipsisHorizontal className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070F1E] border border-slate-200/60 dark:border-[#1F4759]/40">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spent</span>
              <p className="text-sm font-black text-[#E25B45]">₹{totalBudgetSpent.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remaining</span>
              <p className="text-sm font-black text-[#089790] dark:text-[#86E3CE]">₹{remainingBudget.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {isBudgetExceeded && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2">
              <HiExclamationTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Budget Limit Warning: You have consumed {budgetUsagePct}% of your allocated budget!</span>
            </div>
          )}

          {budgets.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs font-bold">
              No active budgets found. <Link to="/budgets" className="text-[#089790] hover:underline">Create a budget →</Link>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {budgets.map((b) => (
                <div key={b.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                      <span className="w-7 h-7 rounded-xl bg-[#089790]/15 text-[#089790] dark:text-[#86E3CE] flex items-center justify-center text-xs font-black">
                        {b.category?.charAt(0) || 'B'}
                      </span>
                      <span className="font-extrabold">{b.category}</span>
                    </div>
                    <span className="text-slate-500 dark:text-[#97CADB] font-extrabold">{b.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.percentage >= 90 ? 'bg-[#E25B45]' : b.percentage >= 75 ? 'bg-[#FAC172]' : 'bg-[#089790]'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* TRANSACTION DETAILS MODAL */}
      <Modal
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        title="Transaction Details"
      >
        {selectedTxn && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F4759]/40">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                  selectedTxn.type === 'INCOME' ? 'bg-[#089790]/15 text-[#089790]' : 'bg-[#E25B45]/15 text-[#E25B45]'
                }`}>
                  {selectedTxn.title?.charAt(0) || 'T'}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedTxn.title}</h4>
                  <p className="text-xs text-slate-400">{formatDateDisplay(selectedTxn.date)}</p>
                </div>
              </div>
              <span className={`text-lg font-black ${
                selectedTxn.type === 'INCOME' ? 'text-[#089790] dark:text-[#86E3CE]' : 'text-[#E25B45] dark:text-[#FA897B]'
              }`}>
                {selectedTxn.type === 'INCOME' ? '+' : '-'}₹{selectedTxn.amount?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1F4759]/20">
                <span className="text-slate-400">Category:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedTxn.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1F4759]/20">
                <span className="text-slate-400">Payment Method:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedTxn.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Type:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedTxn.type}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <button
                onClick={() => handleDeleteActivity(selectedTxn.id, selectedTxn.type)}
                className="flex-1 py-2 bg-rose-500/10 text-rose-500 font-bold text-xs rounded-xl hover:bg-rose-500/20 cursor-pointer"
              >
                Delete Record
              </button>
              <button
                onClick={() => setSelectedTxn(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
