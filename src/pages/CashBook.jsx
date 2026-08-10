import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  useCashbookQuery,
  useAddCashbookEntryMutation,
} from '../hooks/queries/useCashbookQueries';
import Modal from '../components/common/Modal';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import {
  HiPlus,
  HiBanknotes,
  HiArrowDownLeft,
  HiArrowUpRight,
} from 'react-icons/hi2';
import { formatDateDisplay } from '../utils/dateUtils';

const CashBook = () => {
  const { addNotification } = useNotifications();

  // Local UI State
  const [selectedDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryType, setEntryType] = useState('IN'); // 'IN' (Cash In) or 'OUT' (Cash Out)
  const [entryAmount, setEntryAmount] = useState('');
  const [entryCategory, setEntryCategory] = useState('Daily Operations');
  const [entryNotes, setEntryNotes] = useState('');

  // TanStack Query for Server State
  const { data: resData, isLoading } = useCashbookQuery({ date: selectedDate });
  const cashData = resData?.data || {};
  const entries = cashData.entries || [];
  const openingBalance = cashData.openingBalance || 0;
  const totalCashIn = cashData.cashIn ?? cashData.totalCashIn ?? 0;
  const totalCashOut = cashData.cashOut ?? cashData.totalCashOut ?? 0;
  const netClosingBalance = cashData.closingBalance ?? (openingBalance + totalCashIn - totalCashOut);

  // Mutations
  const addEntryMutation = useAddCashbookEntryMutation();

  const handleOpenAddModal = (type) => {
    setEntryType(type);
    setEntryAmount('');
    setEntryCategory('Daily Operations');
    setEntryNotes('');
    setIsModalOpen(true);
  };

  const handleAddEntrySubmit = (e) => {
    e.preventDefault();
    if (!entryAmount || Number(entryAmount) <= 0) return;

    addEntryMutation.mutate(
      {
        type: entryType,
        amount: Number(entryAmount),
        category: entryCategory,
        notes: entryNotes,
      },
      {
        onSuccess: () => {
          addNotification({
            title: 'Cash Book Entry Recorded',
            message: `${entryType === 'IN' ? 'Cash In' : 'Cash Out'} of ₹${Number(entryAmount).toLocaleString('en-IN')} logged`,
            type: 'CASHBOOK',
          });
          setIsModalOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Daily Cash Book & Flow Summary
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Monitor daily opening/closing cash balances, Cash In & Cash Out entries
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenAddModal('IN')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <HiPlus className="w-4 h-4" />
            <span>+ Cash In</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('OUT')}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <HiPlus className="w-4 h-4" />
            <span>- Cash Out</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <HiBanknotes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opening Balance</p>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              ₹{openingBalance.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <HiArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cash In</p>
            <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              +₹{totalCashIn.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <HiArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cash Out</p>
            <h3 className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              -₹{totalCashOut.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <HiBanknotes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Closing Cash</p>
            <h3 className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              ₹{netClosingBalance.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* Cash Entries Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : entries.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No cash entries logged for today</p>
          <p className="text-xs mt-1 text-slate-400">Use "+ Cash In" or "- Cash Out" to log daily transactions</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-5">Time / Date</th>
                  <th className="py-4 px-5">Category / Particulars</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                {entries.map((entry, idx) => {
                  const isCashIn = entry.type === 'IN';
                  return (
                    <tr key={entry._id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatDateDisplay(entry.createdAt || entry.date)}
                      </td>
                      <td className="py-4 px-5 font-extrabold text-slate-900 dark:text-white">
                        {entry.category || 'General'}
                        {entry.notes && <p className="text-xs font-medium text-slate-400 truncate max-w-xs">{entry.notes}</p>}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full font-extrabold text-xs border ${
                          isCashIn
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {isCashIn ? 'Cash In (+)' : 'Cash Out (-)'}
                        </span>
                      </td>
                      <td className={`py-4 px-5 font-black text-base whitespace-nowrap ${
                        isCashIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isCashIn ? `+₹${entry.amount.toLocaleString('en-IN')}` : `-₹${entry.amount.toLocaleString('en-IN')}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form for Cash Entry */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={entryType === 'IN' ? 'Log Cash Inflow (+)' : 'Log Cash Outflow (-)'}
      >
        <form onSubmit={handleAddEntrySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 1200"
              value={entryAmount}
              onChange={(e) => setEntryAmount(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category / Particulars
            </label>
            <input
              type="text"
              placeholder="e.g. Counter Cash Sales / Petty Expenses"
              value={entryCategory}
              onChange={(e) => setEntryCategory(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Additional details..."
              value={entryNotes}
              onChange={(e) => setEntryNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={addEntryMutation.isPending}
            className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4 ${
              entryType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
            }`}
          >
            {addEntryMutation.isPending ? 'Saving...' : 'Save Cash Entry'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CashBook;
