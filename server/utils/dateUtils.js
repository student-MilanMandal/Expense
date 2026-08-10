/**
 * Safe date parser for server controllers and services.
 * Ensures YYYY-MM-DD date strings are created at UTC 12:00:00 (midday)
 * so timezone conversion never shifts the date backward or forward.
 */
export const parseInputDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (typeof dateVal === 'string') {
    const cleanStr = dateVal.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      return new Date(`${cleanStr}T12:00:00.000Z`);
    }
  }
  return new Date(dateVal);
};

/**
 * Calculates start and end dates based on period type (weekly, monthly, or custom override)
 */
export const getPeriodDateRange = (period = 'monthly', customStartDate, customEndDate) => {
  const now = new Date();
  let startDate, endDate;

  if (customStartDate && customEndDate) {
    startDate = new Date(customStartDate);
    endDate = new Date(customEndDate);
    return { startDate, endDate };
  }

  if (period === 'weekly') {
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Default to monthly
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  if (customStartDate) startDate = new Date(customStartDate);
  if (customEndDate) endDate = new Date(customEndDate);

  return { startDate, endDate };
};
