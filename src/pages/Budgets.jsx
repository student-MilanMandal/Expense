import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '../context/NotificationContext';
import { budgetSchema } from '../features/budgets/budgetSchemas';
import {
  useBudgetsQuery,
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
} from '../hooks/queries/useBudgetQueries';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import {
  HiPlus,
  HiScale,
  HiExclamationTriangle,
  HiPencilSquare,
  HiTrash,
} from 'react-icons/hi2';

import { EXPENSE_CATEGORIES } from '../constants/appConstants';

const Budgets = () => {
  const { addNotification } = useNotifications();

  // Local Modal Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // TanStack Query for Server State
  const { data: resData, isLoading } = useBudgetsQuery();
  const rawData = resData?.data;
  const budgets = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.budgets) ? rawData.budgets : []);

  // TanStack Query Mutations
  const createBudgetMutation = useCreateBudgetMutation();
  const deleteBudgetMutation = useDeleteBudgetMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: 'Food',
      amount: '',
      period: 'monthly',
      alertThreshold: 80,
    },
  });

  const handleOpenAddModal = () => {
    setEditingBudget(null);
    reset({
      category: 'Food',
      amount: '',
      period: 'monthly',
      alertThreshold: 80,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    reset({
      category: budget.category,
      amount: budget.amount,
      period: budget.period || 'monthly',
      alertThreshold: budget.alertThreshold || 80,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    const payload = {
      category: data.category,
      amount: Number(data.amount),
      period: data.period,
      alertThreshold: Number(data.alertThreshold),
    };

    createBudgetMutation.mutate(payload, {
      onSuccess: () => {
        addNotification({
          title: editingBudget ? 'Budget Updated' : 'Budget Configured',
          message: `Configured ${data.category} budget cap to ₹${Number(data.amount).toLocaleString('en-IN')}`,
          type: 'BUDGET',
        });
        setIsModalOpen(false);
      },
    });
  };

  const handleDeleteClick = (budget) => {
    setBudgetToDelete(budget);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!budgetToDelete) return;
    deleteBudgetMutation.mutate(budgetToDelete._id, {
      onSuccess: () => {
        addNotification({
          title: 'Budget Removed',
          message: 'Budget limit removed',
          type: 'BUDGET',
        });
        setDeleteModalOpen(false);
        setBudgetToDelete(null);
      },
    });
  };

  const submitting = createBudgetMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Budget Management & Cap Alerts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Configure spending limits and monitor automated email threshold alerts
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 hover:scale-105 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <HiPlus className="w-5 h-5" />
          <span>Configure Budget Cap</span>
        </button>
      </div>

      {/* Grid of Budget Cards */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : budgets.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active budgets configured</p>
          <p className="text-xs mt-1 text-slate-400">Click "Configure Budget Cap" to prevent overspending</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const spent = b.spent || 0;
            const limit = b.amount || b.limit || 0;
            const remaining = Math.max(0, limit - spent);
            const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const isExceeded = spent >= limit;
            const isWarning = percent >= (b.alertThreshold || 80);

            return (
              <div
                key={b._id || b.category}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl ${isExceeded ? 'bg-rose-500/10 text-rose-500' : isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                      <HiScale className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                        {b.category}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {b.period || 'Monthly'} Cap
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(b)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
                    >
                      <HiPencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(b)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Spent: ₹{spent.toLocaleString('en-IN')}</span>
                    <span className="text-slate-900 dark:text-white">Limit: ₹{limit.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className={`font-black ${isExceeded ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-slate-500'}`}>
                      {percent}% Used
                    </span>
                    <span className="font-extrabold text-slate-600 dark:text-slate-300">
                      Remaining: ₹{remaining.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {isExceeded && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center space-x-2 text-xs font-bold">
                    <HiExclamationTriangle className="w-4 h-4 shrink-0" />
                    <span>Budget Limit Exceeded! Email alert sent.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Configure Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Update Budget Cap' : 'Configure New Budget Cap'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Category
            </label>
            <select
              {...register('category')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Max Spending Cap Limit (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 15000"
              {...register('amount')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Period
              </label>
              <select
                {...register('period')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alert Email Threshold (%)
              </label>
              <input
                type="number"
                placeholder="80"
                {...register('alertThreshold')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {submitting ? 'Configuring...' : editingBudget ? 'Update Budget Limit' : 'Save Budget Cap'}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Budget Limit"
        message={
          budgetToDelete
            ? `Are you sure you want to remove the budget limit for "${budgetToDelete.category}"?`
            : 'Are you sure you want to delete this budget limit?'
        }
        confirmText="Remove Budget"
        isLoading={deleteBudgetMutation.isPending}
      />
    </div>
  );
};

export default Budgets;
