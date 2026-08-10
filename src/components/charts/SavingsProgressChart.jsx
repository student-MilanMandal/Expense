import React from 'react';

const SavingsProgressChart = ({ overallProgress = 0, totalSaved = 0, totalTarget = 0 }) => {
  const safeProgress = Number.isNaN(Number(overallProgress)) ? 0 : Number(overallProgress);
  const percentage = Math.min(100, Math.max(0, safeProgress));
  const safeSaved = Number.isNaN(Number(totalSaved)) ? 0 : Number(totalSaved);
  const safeTarget = Number.isNaN(Number(totalTarget)) ? 0 : Number(totalTarget);

  return (
    <div className="flex flex-col justify-center space-y-4 p-4 rounded-2xl bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-500/20">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Overall Savings Goal Target
          </span>
          <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
            ₹{safeSaved.toLocaleString('en-IN')} <span className="text-xs font-semibold text-slate-500">/ ₹{safeTarget.toLocaleString('en-IN')}</span>
          </h4>
        </div>
        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
          {percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-3.5 p-0.5 overflow-hidden">
        <div
          className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out shadow-md"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default SavingsProgressChart;
