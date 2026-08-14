/**
 * Utility helper to safely resolve user avatar URLs (Data URIs, Cloudinary URLs, or relative server paths)
 */
export const getAvatarSrc = (avatar) => {
  if (!avatar || typeof avatar !== 'string') return '';
  
  // Data URIs, absolute URLs, or blob URLs are used directly
  if (
    avatar.startsWith('data:') ||
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('blob:')
  ) {
    return avatar;
  }

  // Relative paths e.g. /uploads/avatar-123.jpg
  const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
  const serverBase = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL || 'https://expense-tracker-u23y.onrender.com').replace(/\/api\/?$/, '');

  return `${serverBase}${cleanPath}`;
};
