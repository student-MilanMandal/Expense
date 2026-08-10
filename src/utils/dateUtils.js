/**
 * Frontend Date Formatting Utilities
 * Prevents UTC timezone offset shifts from displaying previous/next calendar days.
 */

export const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateForInput = (dateVal) => {
  if (!dateVal) return getTodayLocalDate();
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    return dateVal.trim();
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return getTodayLocalDate();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateVal) => {
  if (!dateVal) return '-';
  
  // If date string is date-only without time (e.g. "2026-07-31")
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    const parts = dateVal.trim().split('-');
    const year = parts[0];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[Number(parts[1]) - 1] || parts[1];
    const day = Number(parts[2]);
    return `${day} ${month} ${year}`;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';

  // Format in user's local timezone (e.g. 2026-07-30T18:30:00.000Z in IST becomes 31 Jul 2026)
  const day = d.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};
