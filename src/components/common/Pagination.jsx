import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 rounded-b-3xl">
      {totalItems !== undefined && (
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing <span className="font-extrabold text-slate-900 dark:text-white">{startItem}</span> to{' '}
          <span className="font-extrabold text-slate-900 dark:text-white">{endItem}</span> of{' '}
          <span className="font-extrabold text-slate-900 dark:text-white">{totalItems}</span> entries
        </div>
      )}

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className="w-10 h-10 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            return (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            );
          })
          .map((page, index, array) => {
            const showEllipsis = index > 0 && page - array[index - 1] > 1;
            return (
              <React.Fragment key={page}>
                {showEllipsis && <span className="px-1 text-slate-400 text-xs font-bold">...</span>}
                <button
                  onClick={() => onPageChange(page)}
                  className={`w-10 h-10 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs flex items-center justify-center ${
                    currentPage === page
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          className="w-10 h-10 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
