import React, { useEffect, useState } from 'react';
import { formatDateDisplay } from '../utils/dateUtils';
import axiosClient from '../api/axiosClient';
import Pagination from '../components/common/Pagination';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { HiMagnifyingGlass, HiArrowsUpDown, HiFunnel } from 'react-icons/hi2';

const TransactionHistory = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, INCOME, EXPENSE
  const [sortOrder, setSortOrder] = useState('desc'); // desc or asc

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMasterHistory = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/dashboard/getSummary');
        if (res.data?.success) {
          const recents = res.data?.data?.recentActivities || [];
          setActivities(recents);
        }
      } catch (error) {
        console.error('Failed to load transaction history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterHistory();
  }, []);

  // Filter & Search Logic
  const filteredActivities = activities
    .filter((act) => {
      if (filterType === 'INCOME' && act.type !== 'INCOME') return false;
      if (filterType === 'EXPENSE' && act.type !== 'EXPENSE') return false;
      if (search) {
        const query = search.toLowerCase();
        return (
          act.title.toLowerCase().includes(query) ||
          act.category.toLowerCase().includes(query) ||
          act.paymentMethod.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage) || 1;
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Master Transaction History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Combined log of all incomes, expenses and ledger entries
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between backdrop-blur-xl">
        <div className="relative w-full md:w-80">
          <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="relative flex items-center shrink-0">
            <HiFunnel className="w-4 h-4 text-indigo-500 absolute left-3.5 pointer-events-none" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all"
            >
              <option value="ALL">All Types</option>
              <option value="INCOME">Income Only</option>
              <option value="EXPENSE">Expense Only</option>
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 active:scale-95 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <HiArrowsUpDown className="w-4 h-4 text-indigo-500" />
            <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={7} cols={6} />
      ) : paginatedActivities.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 font-medium text-xs sm:text-sm">
          No matching transaction history records found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Description / Source</th>
                  <th className="py-4 px-5">Payment Method</th>
                  <th className="py-4 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                {paginatedActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatDateDisplay(act.date)}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span
                        className={`px-3.5 py-1.5 rounded-full font-black text-xs border shadow-xs tracking-wider uppercase ${
                          act.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {act.type}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {act.category}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-slate-900 dark:text-white">
                      {act.title}
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{act.paymentMethod}</td>
                    <td
                      className={`py-4 px-5 text-right font-black text-sm sm:text-base whitespace-nowrap ${
                        act.type === 'INCOME'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {act.type === 'INCOME' ? '+' : '-'}₹{act.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  );
};

export default TransactionHistory;
