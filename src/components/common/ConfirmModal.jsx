import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamationTriangle, HiTrash, HiXMark } from 'react-icons/hi2';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0c1019] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden z-10 p-6 space-y-5"
          >
            {/* Close Icon */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            {/* Header Icon + Title */}
            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  isDanger
                    ? 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                {isDanger ? <HiTrash className="w-6 h-6" /> : <HiExclamationTriangle className="w-6 h-6" />}
              </div>

              <div className="flex-1 pt-0.5 pr-4">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-sm disabled:opacity-50"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2 ${
                  isDanger
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
