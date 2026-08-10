/**
 * Application Constants & Style Variants
 * ExpensePilot - Shared Data & Design Token Layer
 */

export const colorVariants = {
  emerald: 'bg-[#F0FDFA] dark:bg-[#064E3B]/40 border-[#CCFBF1] dark:border-[#047857]/60 text-[#0F766E] dark:text-[#5EEAD4]',
  rose: 'bg-[#FEF2F2] dark:bg-[#881337]/40 border-[#FECDD3] dark:border-[#BE123C]/60 text-[#E25B45] dark:text-[#FDA4AF]',
  indigo: 'bg-[#F0F9FF] dark:bg-[#0C4A6E]/40 border-[#BAE6FD] dark:border-[#0284C7]/60 text-[#018ABE] dark:text-[#7DD3FC]',
  amber: 'bg-[#FFFBEB] dark:bg-[#78350F]/40 border-[#FDE68A] dark:border-[#B45309]/60 text-[#D97706] dark:text-[#FCD34D]',
  violet: 'bg-[#FAF5FF] dark:bg-[#581C87]/40 border-[#E9D5FF] dark:border-[#7E22CE]/60 text-[#7E22CE] dark:text-[#D8B4FE]',
  cyan: 'bg-[#ECFEFF] dark:bg-[#164E63]/40 border-[#A5F3FC] dark:border-[#089790]/60 text-[#089790] dark:text-[#67E8F9]',
  blue: 'bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border-[#BFDBFE] dark:border-[#1D4ED8]/60 text-[#1D4ED8] dark:text-[#60A5FA]',
  purple: 'bg-[#F5F3FF] dark:bg-[#4C1D95]/40 border-[#DDD6FE] dark:border-[#6D28D9]/60 text-[#6D28D9] dark:text-[#C084FC]',
};

export const iconBgVariants = {
  emerald: 'bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/25',
  rose: 'bg-[#E25B45] text-white shadow-md shadow-[#E25B45]/25',
  indigo: 'bg-linear-to-r from-[#018ABE] to-[#089790] text-white shadow-md shadow-[#018ABE]/25',
  amber: 'bg-[#D97706] text-white shadow-md shadow-[#D97706]/25',
  violet: 'bg-[#8474A1] text-white shadow-md shadow-[#8474A1]/25',
  cyan: 'bg-[#089790] text-white shadow-md shadow-[#089790]/25',
  blue: 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25',
  purple: 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25',
};

export const badgeVariants = {
  blue: 'bg-[#DBEAFE] dark:bg-[#1E40AF]/80 text-[#1D4ED8] dark:text-[#93C5FD] border-[#BFDBFE] dark:border-[#2563EB]/50',
  purple: 'bg-[#EDE9FE] dark:bg-[#5B21B6]/80 text-[#6D28D9] dark:text-[#C4B5FD] border-[#DDD6FE] dark:border-[#7C3AED]/50',
  violet: 'bg-[#F3E8FF] dark:bg-[#6B21A8]/80 text-[#7E22CE] dark:text-[#E9D5FF] border-[#E9D5FF] dark:border-[#8474A1]/50',
  default: 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300/60 dark:border-slate-700',
};

export const categoryColors = [
  '#089790',
  '#E25B45',
  '#8474A1',
  '#FAC172',
  '#018ABE',
  '#86E3CE',
  '#FA897B',
  '#54C0CC',
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Grocery',
  'Shopping',
  'EMI',
  'Electricity',
  'Gas',
  'Water',
  'Internet',
  'Mobile Recharge',
  'Fuel',
  'Travel',
  'Entertainment',
  'Education',
  'Medical',
  'Rent',
  'Insurance',
  'Investment',
  'Misc',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Investment',
  'Bonus',
  'Rental',
  'Gifts',
  'Others',
];

export const EXPENSE_PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Other',
];

export const INCOME_PAYMENT_METHODS = [
  'Bank Transfer',
  'Cash',
  'UPI',
  'Cheque',
  'Card',
  'Other',
];

export const categories = EXPENSE_CATEGORIES;
