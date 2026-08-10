import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  useKhataCustomersQuery,
  useAddKhataCustomerMutation,
  useUpdateKhataCustomerMutation,
  useDeleteKhataCustomerMutation,
  useAddKhataTransactionMutation,
} from '../hooks/queries/useKhataQueries';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import {
  HiPlus,
  HiMagnifyingGlass,
  HiPhone,
  HiMapPin,
  HiPencilSquare,
  HiTrash,
} from 'react-icons/hi2';

const KhataBook = () => {
  const { addNotification } = useNotifications();

  // Local UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Customer Modal State (Add / Edit)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Delete Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Transaction Modal State
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [txnType, setTxnType] = useState('CREDIT'); // CREDIT (Gave/Udhar) or DEBIT (Got/Jama)
  const [txnAmount, setTxnAmount] = useState('');
  const [txnNotes, setTxnNotes] = useState('');

  // TanStack Query for Server State
  const { data: resData, isLoading } = useKhataCustomersQuery({ search: searchTerm });
  const rawData = resData?.data;
  const customers = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.customers) ? rawData.customers : []);

  // Mutations
  const addCustomerMutation = useAddKhataCustomerMutation();
  const updateCustomerMutation = useUpdateKhataCustomerMutation();
  const deleteCustomerMutation = useDeleteKhataCustomerMutation();
  const addTxnMutation = useAddKhataTransactionMutation();

  const handleOpenAddCustomerModal = () => {
    setEditingCustomer(null);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomerModal = (customer) => {
    setEditingCustomer(customer);
    setCustName(customer.name || '');
    setCustPhone(customer.mobile || customer.phone || '');
    setCustAddress(customer.address || '');
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomerSubmit = (e) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) return;

    const payload = { name: custName, mobile: custPhone, address: custAddress };

    if (editingCustomer) {
      updateCustomerMutation.mutate(
        { id: editingCustomer._id, customerData: payload },
        {
          onSuccess: () => {
            addNotification({
              title: 'Khata Customer Updated',
              message: `Updated details for ${custName}`,
              type: 'KHATA',
            });
            setIsCustomerModalOpen(false);
          },
        }
      );
    } else {
      addCustomerMutation.mutate(payload, {
        onSuccess: () => {
          addNotification({
            title: 'Khata Customer Added',
            message: `Added ${custName} (${custPhone}) to Khata Book`,
            type: 'KHATA',
          });
          setIsCustomerModalOpen(false);
        },
      });
    }
  };

  const handleDeleteCustomerClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    deleteCustomerMutation.mutate(customerToDelete._id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setCustomerToDelete(null);
      },
    });
  };

  const handleOpenTxnModal = (customer, type) => {
    setSelectedCustomer(customer);
    setTxnType(type);
    setTxnAmount('');
    setTxnNotes('');
    setIsTxnModalOpen(true);
  };

  const handleAddTxnSubmit = (e) => {
    e.preventDefault();
    if (!txnAmount || Number(txnAmount) <= 0 || !selectedCustomer) return;

    const mappedType = txnType === 'CREDIT' ? 'CREDIT_GIVEN' : txnType === 'DEBIT' ? 'PAYMENT_RECEIVED' : txnType;

    addTxnMutation.mutate(
      {
        customerId: selectedCustomer._id,
        type: mappedType,
        amount: Number(txnAmount),
        notes: txnNotes,
        description: txnNotes,
      },
      {
        onSuccess: () => {
          addNotification({
            title: 'Khata Entry Recorded',
            message: `${mappedType === 'CREDIT_GIVEN' ? 'Gave Udhar' : 'Received Jama'} of ₹${Number(txnAmount).toLocaleString('en-IN')} for ${selectedCustomer.name}`,
            type: 'KHATA',
          });
          setIsTxnModalOpen(false);
          setSelectedCustomer(null);
        },
      }
    );
  };

  const isSubmittingCustomer = addCustomerMutation.isPending || updateCustomerMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Khata Book (Udhar & Credit Ledger)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Manage customer credit accounts, You Gave (Udhar) & You Got (Jama) records
          </p>
        </div>
        <button
          onClick={handleOpenAddCustomerModal}
          className="px-5 py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 hover:scale-105 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Customers List */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : customers.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No customers registered in Khata Book</p>
          <p className="text-xs mt-1 text-slate-400">Click "Add New Customer" to start tracking credit balances</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c) => {
            const balance = c.netBalance ?? c.balance ?? 0;
            const isYouWillGet = balance > 0; // Customer owes money to you
            const isYouWillGive = balance < 0; // You owe money to customer

            return (
              <div
                key={c._id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{c.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1 font-medium">
                      <HiPhone className="w-3.5 h-3.5 text-amber-500" />
                      <span>{c.mobile || c.phone}</span>
                    </div>
                    {c.address && (
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5 font-medium">
                        <HiMapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditCustomerModal(c)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all cursor-pointer"
                      title="Edit Customer Details"
                    >
                      <HiPencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomerClick(c)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete Customer"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Net Balance:</span>
                  <span className={`text-base font-black ${
                    isYouWillGet ? 'text-rose-500' : isYouWillGive ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {isYouWillGet && `You Will Get ₹${Math.abs(balance).toLocaleString('en-IN')}`}
                    {isYouWillGive && `You Will Give ₹${Math.abs(balance).toLocaleString('en-IN')}`}
                    {balance === 0 && '₹0 (Settled)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleOpenTxnModal(c, 'CREDIT')}
                    className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-xs rounded-xl border border-rose-500/20 transition-all cursor-pointer"
                  >
                    - You Gave (Udhar)
                  </button>
                  <button
                    onClick={() => handleOpenTxnModal(c, 'DEBIT')}
                    className="py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs rounded-xl border border-emerald-500/20 transition-all cursor-pointer"
                  >
                    + You Got (Jama)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Customer */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Details' : 'Add Khata Customer'}
      >
        <form onSubmit={handleSaveCustomerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Shop #12, Main Market"
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingCustomer}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {isSubmittingCustomer ? 'Saving Details...' : editingCustomer ? 'Update Customer' : 'Add Customer'}
          </button>
        </form>
      </Modal>

      {/* Modal Add Khata Transaction */}
      <Modal
        isOpen={isTxnModalOpen}
        onClose={() => setIsTxnModalOpen(false)}
        title={txnType === 'CREDIT' ? `Record "You Gave" (Udhar) to ${selectedCustomer?.name}` : `Record "You Got" (Jama) from ${selectedCustomer?.name}`}
      >
        <form onSubmit={handleAddTxnSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={txnAmount}
              onChange={(e) => setTxnAmount(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Particulars (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery items purchase credit / Cash payment receipt"
              value={txnNotes}
              onChange={(e) => setTxnNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={addTxnMutation.isPending}
            className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4 ${
              txnType === 'CREDIT' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
            }`}
          >
            {addTxnMutation.isPending ? 'Saving Record...' : 'Record Khata Entry'}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteCustomer}
        title="Delete Khata Customer"
        message={
          customerToDelete
            ? `Are you sure you want to remove "${customerToDelete.name}" and delete all credit transaction history for this customer?`
            : 'Are you sure you want to delete this customer?'
        }
        confirmText="Delete Customer"
        isLoading={deleteCustomerMutation.isPending}
      />
    </div>
  );
};

export default KhataBook;
