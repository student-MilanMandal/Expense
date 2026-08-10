import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '../context/NotificationContext';
import { expenseSchema } from '../features/expenses/expenseSchemas';
import {
  useExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '../hooks/queries/useExpenseQueries';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import {
  HiPlus,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiTrash,
  HiPaperClip,
  HiCalendar,
  HiFunnel,
} from 'react-icons/hi2';
import { getTodayLocalDate, formatDateForInput, formatDateDisplay } from '../utils/dateUtils';
import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS } from '../constants/appConstants';

const categories = EXPENSE_CATEGORIES;
const paymentMethods = EXPENSE_PAYMENT_METHODS;

/**
 * ============================================================================
 * EXPENSES MANAGEMENT COMPONENT
 * ============================================================================
 * @description Central expense tracking page with real-time TanStack Query,
 * Zod validation schema, server-side pagination, and category filtering.
 */
const Expenses = () => {
  const { addNotification } = useNotifications();

  // Local UI Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Local Modal Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // TanStack Query for Server State (Caching, Invalidation, Refetching)
  const { data: serverData, isLoading } = useExpensesQuery({
    page: currentPage,
    limit: 10,
    search: searchQuery,
    category: selectedCategory,
    startDate,
    endDate,
  });

  const expenses = serverData?.data?.expenses || (Array.isArray(serverData?.data) ? serverData?.data : []);
  const totalPages = serverData?.data?.pages || 1;
  const totalItems = serverData?.data?.totalRecords || expenses.length;

  // TanStack Query Mutations
  const addExpenseMutation = useAddExpenseMutation();
  const updateExpenseMutation = useUpdateExpenseMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();

  // React Hook Form + Zod Validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '',
      description: '',
      category: 'Food',
      date: getTodayLocalDate(),
      paymentMethod: 'UPI',
      notes: '',
    },
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    reset({
      amount: '',
      description: '',
      category: 'Food',
      date: getTodayLocalDate(),
      paymentMethod: 'UPI',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    reset({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: formatDateForInput(expense.date),
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('amount', data.amount);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('date', data.date);
    formData.append('paymentMethod', data.paymentMethod);
    formData.append('notes', data.notes || '');

    if (data.receipt && data.receipt[0]) {
      formData.append('receipt', data.receipt[0]);
    }

    if (editingExpense) {
      updateExpenseMutation.mutate(
        { id: editingExpense._id, formData },
        {
          onSuccess: () => {
            addNotification({
              title: 'Expense Updated',
              message: `Updated ${data.description} (₹${data.amount}) under ${data.category}`,
              type: 'EXPENSE',
            });
            setIsModalOpen(false);
          },
        }
      );
    } else {
      addExpenseMutation.mutate(formData, {
        onSuccess: () => {
          addNotification({
            title: 'Expense Logged',
            message: `Spent ₹${Number(data.amount).toLocaleString('en-IN')} for ${data.description} (${data.category})`,
            type: 'EXPENSE',
          });
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!expenseToDelete) return;
    deleteExpenseMutation.mutate(expenseToDelete._id, {
      onSuccess: () => {
        addNotification({
          title: 'Expense Deleted',
          message: 'An expense record was removed',
          type: 'EXPENSE',
        });
        setDeleteModalOpen(false);
        setExpenseToDelete(null);
      },
    });
  };

  const submitting = addExpenseMutation.isPending || updateExpenseMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Expense Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Log, filter and review daily spending & receipt uploads
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-500 active:scale-95 hover:scale-105 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-500/25 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between backdrop-blur-xl">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
          <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search description or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Category Filter */}
          <div className="relative flex items-center shrink-0">
            <HiFunnel className="w-4 h-4 text-rose-500 absolute left-3.5 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 cursor-pointer transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2 rounded-2xl text-xs sm:text-sm focus-within:ring-2 focus-within:ring-rose-500/50 transition-all shrink-0">
            <HiCalendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-0 font-bold text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* End Date Filter */}
          <div className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2 rounded-2xl text-xs sm:text-sm focus-within:ring-2 focus-within:ring-rose-500/50 transition-all shrink-0">
            <HiCalendar className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-0 font-bold text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Expense Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : expenses.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No expense records found</p>
          <p className="text-xs mt-1 text-slate-400">Click "Add New Expense" to log your first payment</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Description</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Method</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Receipt</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatDateDisplay(exp.date)}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-slate-900 dark:text-white">
                      {exp.description}
                      {exp.notes && <p className="text-xs font-medium text-slate-400 truncate max-w-xs mt-0.5">{exp.notes}</p>}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs border border-rose-500/20 shadow-xs">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{exp.paymentMethod}</td>
                    <td className="py-4 px-5 font-black text-sm sm:text-base text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {exp.receiptUrl ? (
                        <a
                          href={exp.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-extrabold text-xs border border-indigo-500/20 transition-all inline-flex items-center space-x-1.5 shadow-xs"
                        >
                          <HiPaperClip className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">-</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(exp)}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Edit Expense"
                      >
                        <HiPencilSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(exp)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Delete Expense"
                      >
                        <HiTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
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
            totalItems={totalItems}
            itemsPerPage={10}
          />
        </div>
      )}

      {/* Modal Form for Add/Edit Expense */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Entry' : 'Add New Expense Entry'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 1500"
              {...register('amount')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            />
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expense Description
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly Grocery Supermarket / Electricity Bill"
              {...register('description')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                {...register('paymentMethod')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Additional details..."
              {...register('notes')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bill / Receipt Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              {...register('receipt')}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-500/10 file:text-rose-600 hover:file:bg-rose-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {submitting ? 'Saving Expense...' : editingExpense ? 'Update Expense' : 'Save Expense'}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Expense Record"
        message={
          expenseToDelete
            ? `Are you sure you want to delete the expense "${expenseToDelete.description}" (₹${Number(expenseToDelete.amount).toLocaleString('en-IN')})?`
            : 'Are you sure you want to delete this expense record?'
        }
        confirmText="Delete Expense"
        isLoading={deleteExpenseMutation.isPending}
      />
    </div>
  );
};

export default Expenses;
