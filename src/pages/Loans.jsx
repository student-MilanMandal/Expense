import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '../context/NotificationContext';
import { loanSchema } from '../features/loans/loanSchemas';
import {
  useLoansQuery,
  useCreateLoanMutation,
  useRecordEMIPaymentMutation,
  useDeleteLoanMutation,
} from '../hooks/queries/useLoanQueries';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import {
  HiPlus,
  HiTrash,
  HiBanknotes,
} from 'react-icons/hi2';
import { formatDateDisplay } from '../utils/dateUtils';

const Loans = () => {
  const { addNotification } = useNotifications();

  // Local Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);

  // TanStack Query Server State
  const { data: resData, isLoading } = useLoansQuery();
  const rawData = resData?.data;
  const loans = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.loans) ? rawData.loans : []);

  // Mutations
  const createLoanMutation = useCreateLoanMutation();
  const recordEMIMutation = useRecordEMIPaymentMutation();
  const deleteLoanMutation = useDeleteLoanMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      personName: '',
      type: 'LENT',
      amount: '',
      interestRate: 0,
      dueDate: '',
      notes: '',
    },
  });

  const handleOpenAddModal = () => {
    reset({
      personName: '',
      type: 'LENT',
      amount: '',
      interestRate: 0,
      dueDate: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    createLoanMutation.mutate(data, {
      onSuccess: () => {
        addNotification({
          title: 'Loan Record Created',
          message: `Recorded ${data.type === 'LENT' ? 'Money Lent to' : 'Money Borrowed from'} ${data.personName} (₹${Number(data.amount).toLocaleString('en-IN')})`,
          type: 'LOAN',
        });
        setIsModalOpen(false);
      },
    });
  };

  const handleOpenPaymentModal = (loan) => {
    setSelectedLoan(loan);
    setPaidAmount('');
    setPaymentNotes('');
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paidAmount || Number(paidAmount) <= 0) return;

    recordEMIMutation.mutate(
      {
        id: selectedLoan._id,
        paymentData: { amount: Number(paidAmount), notes: paymentNotes },
      },
      {
        onSuccess: () => {
          addNotification({
            title: 'EMI Payment Logged',
            message: `Recorded payment of ₹${Number(paidAmount).toLocaleString('en-IN')} for ${selectedLoan.personName}`,
            type: 'LOAN',
          });
          setPaymentModalOpen(false);
          setSelectedLoan(null);
        },
      }
    );
  };

  const handleDeleteClick = (loan) => {
    setLoanToDelete(loan);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!loanToDelete) return;
    deleteLoanMutation.mutate(loanToDelete._id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setLoanToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Loan & EMI Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Track money lent, money borrowed, remaining balances & EMI schedules
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 hover:scale-105 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add Loan Record</span>
        </button>
      </div>

      {/* Loan Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : loans.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No loan records found</p>
          <p className="text-xs mt-1 text-slate-400">Click "Add Loan Record" to log money lent or borrowed</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-5">Person</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Principal</th>
                  <th className="py-4 px-5">Paid</th>
                  <th className="py-4 px-5">Balance</th>
                  <th className="py-4 px-5">Due Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                {loans.map((l) => {
                  const isLent = l.type === 'LENT';
                  const principal = l.principalAmount || l.amount || 0;
                  const paid = l.totalPaid || 0;
                  const balance = Math.max(0, l.remainingBalance ?? (principal - paid));
                  const isSettled = balance <= 0 || l.status === 'PAID';

                  return (
                    <tr key={l._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-5 font-extrabold text-slate-900 dark:text-white">
                        {l.personName}
                        {l.notes && <p className="text-xs font-medium text-slate-400 truncate max-w-xs">{l.notes}</p>}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full font-extrabold text-xs border ${
                          isLent
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {isLent ? 'Money Lent (Given)' : 'Money Borrowed (Taken)'}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-black text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{principal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        ₹{paid.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {isSettled ? (
                          <span className="text-emerald-500 font-extrabold">SETTLED</span>
                        ) : (
                          `₹${balance.toLocaleString('en-IN')}`
                        )}
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDateDisplay(l.dueDate)}
                      </td>
                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                        {!isSettled && (
                          <button
                            onClick={() => handleOpenPaymentModal(l)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs border border-amber-500/20 transition-all inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <HiBanknotes className="w-3.5 h-3.5" />
                            <span>Record EMI</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(l)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Loan Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Loan Record">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Person / Entity Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma / HDFC Bank"
              {...register('personName')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            {errors.personName && <p className="text-xs text-rose-500 mt-1">{errors.personName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="LENT">Money Lent (Given)</option>
                <option value="BORROWED">Money Borrowed (Taken)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                {...register('amount')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
              {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interest Rate (%) (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="0"
                {...register('interestRate')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
              {errors.dueDate && <p className="text-xs text-rose-500 mt-1">{errors.dueDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Additional details..."
              {...register('notes')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={createLoanMutation.isPending}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {createLoanMutation.isPending ? 'Saving Record...' : 'Save Loan Record'}
          </button>
        </form>
      </Modal>

      {/* Record EMI Payment Modal */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title={`Record EMI Payment for ${selectedLoan?.personName}`}>
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              EMI Payment Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly EMI Installment #3"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={recordEMIMutation.isPending}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {recordEMIMutation.isPending ? 'Saving EMI...' : 'Record Payment'}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Loan Record"
        message={
          loanToDelete
            ? `Are you sure you want to delete the loan record for "${loanToDelete.personName}"?`
            : 'Are you sure you want to delete this loan record?'
        }
        confirmText="Delete Loan"
        isLoading={deleteLoanMutation.isPending}
      />
    </div>
  );
};

export default Loans;
