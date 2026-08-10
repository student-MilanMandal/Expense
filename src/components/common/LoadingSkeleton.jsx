import React from 'react';

/**
 * Modern dual-ring circular gradient loading spinner with rounded pill aesthetics
 */
export const RoundedSpinner = ({ size = 'md', label = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className={`absolute rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 blur-md opacity-40 animate-pulse ${sizeClasses[size] || sizeClasses.md}`} />
        {/* Inner animated dual spinner */}
        <div
          className={`rounded-full border-t-emerald-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin ${sizeClasses[size] || sizeClasses.md}`}
        />
      </div>
      {label && (
        <span className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-xs tracking-wide animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};

/**
 * Full page glassmorphism loader with centered rounded spinner
 */
export const RoundedPageLoader = ({ text = 'Loading details...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl flex flex-col items-center space-y-4 max-w-sm w-full animate-in zoom-in-95 duration-200">
        <RoundedSpinner size="lg" label="" />
        <div className="text-center space-y-1">
          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{text}</p>
          <p className="text-xs font-semibold text-slate-400">Fetching latest data securely</p>
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-28 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse p-5 flex flex-col justify-between border border-slate-200/40 dark:border-slate-800/40"
        >
          <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded-full" />
          <div className="h-7 w-36 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-md">
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex space-x-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 flex-1 bg-slate-200/70 dark:bg-slate-800/80 animate-pulse rounded-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  const heights = [40, 75, 55, 90, 60, 80, 45];
  return (
    <div className="h-72 w-full rounded-3xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse p-6 flex items-end justify-between space-x-3 border border-slate-200/40 dark:border-slate-800/40">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-slate-300 dark:bg-slate-700 rounded-t-2xl"
          style={{ height: `${heights[i % 7]}%` }}
        />
      ))}
    </div>
  );
};

export default CardSkeleton;
