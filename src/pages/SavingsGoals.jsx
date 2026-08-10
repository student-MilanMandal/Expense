import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '../context/NotificationContext';
import { savingsSchema } from '../features/savings/savingsSchemas';
import {
  useSavingsQuery,
  useCreateSavingsGoalMutation,
  useContributeSavingsGoalMutation,
  useDeleteSavingsGoalMutation,
} from '../hooks/queries/useSavingsQueries';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import {
  HiPlus,
  HiTrash,
  HiFlag,
  HiSparkles,
} from 'react-icons/hi2';
import { formatDateDisplay } from '../utils/dateUtils';

const SavingsGoals = () => {
  const { addNotification } = useNotifications();

  // Local Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contribModalOpen, setContribModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contribAmount, setContribAmount] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // TanStack Query Server State
  const { data: resData, isLoading } = useSavingsQuery();
  const rawData = resData?.data;
  const goals = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.goals) ? rawData.goals : []);

  // Mutations
  const createGoalMutation = useCreateSavingsGoalMutation();
  const contributeMutation = useContributeSavingsGoalMutation();
  const deleteGoalMutation = useDeleteSavingsGoalMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      title: '',
      targetAmount: '',
      targetDate: '',
      category: 'General',
      initialContribution: 0,
    },
  });

  const handleOpenAddModal = () => {
    reset({
      title: '',
      targetAmount: '',
      targetDate: '',
      category: 'General',
      initialContribution: 0,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    createGoalMutation.mutate(data, {
      onSuccess: () => {
        addNotification({
          title: 'Savings Goal Created',
          message: `Set target of ₹${Number(data.targetAmount).toLocaleString('en-IN')} for ${data.title}`,
          type: 'SAVINGS',
        });
        setIsModalOpen(false);
      },
    });
  };

  const handleOpenContribModal = (goal) => {
    setSelectedGoal(goal);
    setContribAmount('');
    setContribModalOpen(true);
  };

  const handleAddContributionSubmit = (e) => {
    e.preventDefault();
    if (!contribAmount || Number(contribAmount) <= 0) return;

    contributeMutation.mutate(
      { id: selectedGoal._id, amount: Number(contribAmount) },
      {
        onSuccess: () => {
          addNotification({
            title: 'Goal Contribution Logged',
            message: `Added ₹${Number(contribAmount).toLocaleString('en-IN')} towards ${selectedGoal.title}`,
            type: 'SAVINGS',
          });
          setContribModalOpen(false);
          setSelectedGoal(null);
        },
      }
    );
  };

  const handleDeleteClick = (goal) => {
    setGoalToDelete(goal);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!goalToDelete) return;
    deleteGoalMutation.mutate(goalToDelete._id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setGoalToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Savings Goals & Milestones
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Track targets for Emergency Fund, Laptop, Vacation & Vehicles
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 hover:scale-105 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <HiPlus className="w-5 h-5" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : goals.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No savings goals created</p>
          <p className="text-xs mt-1 text-slate-400">Click "Create New Goal" to start tracking your targets</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const saved = g.savedAmount || g.currentAmount || 0;
            const target = g.targetAmount || 1;
            const percent = Math.min(100, Math.round((saved / target) * 100));
            const isCompleted = percent >= 100;

            return (
              <div
                key={g._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                      {isCompleted ? <HiSparkles className="w-6 h-6" /> : <HiFlag className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        {g.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-400">
                        Target Date: {formatDateDisplay(g.targetDate)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(g)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Saved: ₹{saved.toLocaleString('en-IN')}</span>
                    <span className="text-slate-900 dark:text-white">Goal: ₹{target.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className={`font-black ${isCompleted ? 'text-emerald-500' : 'text-indigo-500'}`}>
                      {percent}% Reached
                    </span>
                    <span className="font-extrabold text-slate-600 dark:text-slate-300">
                      Remaining: ₹{Math.max(0, target - saved).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenContribModal(g)}
                  disabled={isCompleted}
                  className="w-full py-2.5 bg-slate-100 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200 hover:text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCompleted ? '🎉 Goal Achieved!' : '+ Add Money to Goal'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form for Create Savings Goal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Savings Goal">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g. Buy Laptop / Emergency Fund / Goa Vacation"
              {...register('title')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Amount (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 85000"
                {...register('targetAmount')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
              {errors.targetAmount && <p className="text-xs text-rose-500 mt-1">{errors.targetAmount.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Deadline Date
              </label>
              <input
                type="date"
                {...register('targetDate')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
              {errors.targetDate && <p className="text-xs text-rose-500 mt-1">{errors.targetDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Savings Deposit (₹) (Optional)
            </label>
            <input
              type="number"
              placeholder="0"
              {...register('initialContribution')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={createGoalMutation.isPending}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {createGoalMutation.isPending ? 'Creating Goal...' : 'Create Savings Goal'}
          </button>
        </form>
      </Modal>

      {/* Modal for Add Contribution */}
      <Modal isOpen={contribModalOpen} onClose={() => setContribModalOpen(false)} title={`Add Money to "${selectedGoal?.title}"`}>
        <form onSubmit={handleAddContributionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deposit Contribution Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={contributeMutation.isPending}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {contributeMutation.isPending ? 'Saving...' : 'Add Contribution'}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Savings Goal"
        message={
          goalToDelete
            ? `Are you sure you want to delete the goal "${goalToDelete.title}"?`
            : 'Are you sure you want to delete this savings goal?'
        }
        confirmText="Delete Goal"
        isLoading={deleteGoalMutation.isPending}
      />
    </div>
  );
};

export default SavingsGoals;
