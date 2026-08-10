import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '../context/NotificationContext';
import { incomeSchema } from '../features/incomes/incomeSchemas';
import {
  useIncomesQuery,
  useAddIncomeMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
} from '../hooks/queries/useIncomeQueries';
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
import { INCOME_CATEGORIES, INCOME_PAYMENT_METHODS } from '../constants/appConstants';

const categories = INCOME_CATEGORIES;
const paymentMethods = INCOME_PAYMENT_METHODS;

const Incomes = () => {
  const { addNotification } = useNotifications();

  // Local UI Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Local Modal Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState(null);

  // TanStack Query for Server State (Caching & Invalidation)
  const { data: serverData, isLoading } = useIncomesQuery({
    page: currentPage,
    limit: 10,
    search: searchQuery,
    category: selectedCategory,
    startDate,
    endDate,
  });

  const incomes = serverData?.data?.incomes || (Array.isArray(serverData?.data) ? serverData?.data : []);
  const totalPages = serverData?.data?.pagination?.pages || 1;
  const totalItems = serverData?.data?.pagination?.total || incomes.length;

  // TanStack Query Mutations
  const addIncomeMutation = useAddIncomeMutation();
  const updateIncomeMutation = useUpdateIncomeMutation();
  const deleteIncomeMutation = useDeleteIncomeMutation();

  // React Hook Form + Zod Validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: '',
      source: '',
      category: 'Salary',
      date: getTodayLocalDate(),
      paymentMethod: 'Bank Transfer',
      notes: '',
    },
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    setEditingIncome(null);
    reset({
      amount: '',
      source: '',
      category: 'Salary',
      date: getTodayLocalDate(),
      paymentMethod: 'Bank Transfer',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (income) => {
    setEditingIncome(income);
    reset({
      amount: income.amount,
      source: income.source,
      category: income.category,
      date: formatDateForInput(income.date),
      paymentMethod: income.paymentMethod,
      notes: income.notes || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('amount', data.amount);
    formData.append('source', data.source);
    formData.append('category', data.category);
    formData.append('date', data.date);
    formData.append('paymentMethod', data.paymentMethod);
    formData.append('notes', data.notes || '');

    if (data.attachment && data.attachment[0]) {
      formData.append('attachment', data.attachment[0]);
    }

    if (editingIncome) {
      updateIncomeMutation.mutate(
        { id: editingIncome._id, formData },
        {
          onSuccess: () => {
            addNotification({
              title: 'Income Updated',
              message: `Updated ${data.source} (₹${data.amount}) under ${data.category}`,
              type: 'INCOME',
            });
            setIsModalOpen(false);
          },
        }
      );
    } else {
      addIncomeMutation.mutate(formData, {
        onSuccess: () => {
          addNotification({
            title: 'Income Added',
            message: `Received ₹${Number(data.amount).toLocaleString('en-IN')} from ${data.source} (${data.category})`,
            type: 'INCOME',
          });
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDeleteClick = (income) => {
    setIncomeToDelete(income);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!incomeToDelete) return;
    deleteIncomeMutation.mutate(incomeToDelete._id, {
      onSuccess: () => {
        addNotification({
          title: 'Income Deleted',
          message: 'An income record was removed',
          type: 'INCOME',
        });
        setDeleteModalOpen(false);
        setIncomeToDelete(null);
      },
    });
  };

  const submitting = addIncomeMutation.isPending || updateIncomeMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Income Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Log earnings, filter sources, and track cash inflows
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 hover:scale-105 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add New Income</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between backdrop-blur-xl">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
          <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search source or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Category Filter */}
          <div className="relative flex items-center shrink-0">
            <HiFunnel className="w-4 h-4 text-emerald-500 absolute left-3.5 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2 rounded-2xl text-xs sm:text-sm focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all shrink-0">
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
          <div className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2 rounded-2xl text-xs sm:text-sm focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all shrink-0">
            <HiCalendar className="w-4 h-4 text-emerald-500 shrink-0" />
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

      {/* Income Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : incomes.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No income records found</p>
          <p className="text-xs mt-1 text-slate-400">Click "Add New Income" to log your first payment</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Source</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Method</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Proof</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                {incomes.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatDateDisplay(inc.date)}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-slate-900 dark:text-white">
                      {inc.source}
                      {inc.notes && <p className="text-xs font-medium text-slate-400 truncate max-w-xs mt-0.5">{inc.notes}</p>}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/20 shadow-xs">
                        {inc.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{inc.paymentMethod}</td>
                    <td className="py-4 px-5 font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      +₹{inc.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {inc.attachmentUrl ? (
                        <a
                          href={inc.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-extrabold text-xs border border-indigo-500/20 transition-all inline-flex items-center space-x-1.5 shadow-xs"
                        >
                          <HiPaperClip className="w-3.5 h-3.5" />
                          <span>View</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">-</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(inc)}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Edit Income"
                      >
                        <HiPencilSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(inc)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="Delete Income"
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

      {/* Modal Form for Add/Edit Income */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIncome ? 'Edit Income Record' : 'Add New Income Entry'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 75000"
              {...register('amount')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Income Source
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly Salary / Client Contract Payment"
              {...register('source')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
            {errors.source && <p className="text-xs text-rose-500 mt-1">{errors.source.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
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
              {...register('notes')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Proof Attachment (Optional)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              {...register('attachment')}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {submitting ? 'Saving Record...' : editingIncome ? 'Update Income' : 'Save Income'}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Income Record"
        message={
          incomeToDelete
            ? `Are you sure you want to delete the income record "${incomeToDelete.source}" (₹${Number(incomeToDelete.amount).toLocaleString('en-IN')})?`
            : 'Are you sure you want to delete this income record?'
        }
        confirmText="Delete Income"
        isLoading={deleteIncomeMutation.isPending}
      />
    </div>
  );
};

export default Incomes;
