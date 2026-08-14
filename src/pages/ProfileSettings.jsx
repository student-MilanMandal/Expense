import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';
import { HiCamera, HiSun, HiMoon, HiCheck, HiScissors } from 'react-icons/hi2';
import { getAvatarSrc } from '../utils/avatarUtils';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addNotification } = useNotifications();

  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedBase64, setCroppedBase64] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');

  useEffect(() => {
    if (user?.avatar) {
      setPreviewAvatar(user.avatar);
    }
  }, [user?.avatar]);

  // Modern Cropper Modal States
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageObj, setImageObj] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const previewCanvasRef = useRef(null);
  const exportCanvasRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currency: user?.currency || 'INR',
      timezone: user?.timezone || 'Asia/Kolkata',
      language: user?.language || 'en',
    },
  });

  // When a photo is selected, load Image object & open cropper
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          setImageObj(img);
          setZoom(1);
          setPan({ x: 0, y: 0 });
          setIsCropModalOpen(true);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Render crop preview on canvas
  useEffect(() => {
    if (!isCropModalOpen || !imageObj || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 260; // 260px square preview viewport
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Calculate base cover dimensions
    const aspect = imageObj.width / imageObj.height;
    let baseW, baseH;
    if (aspect > 1) {
      baseH = size;
      baseW = size * aspect;
    } else {
      baseW = size;
      baseH = size / aspect;
    }

    const drawW = baseW * zoom;
    const drawH = baseH * zoom;

    const defaultX = (size - drawW) / 2;
    const defaultY = (size - drawH) / 2;

    const finalX = defaultX + pan.x;
    const finalY = defaultY + pan.y;

    ctx.save();

    // Clip to circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(imageObj, finalX, finalY, drawW, drawH);
    ctx.restore();

    // Outer ring outline
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();

  }, [isCropModalOpen, imageObj, zoom, pan]);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleApplyCrop = async () => {
    if (!imageObj) return;

    // Create an in-memory canvas for 100% reliable pixel extraction
    const exportCanvas = document.createElement('canvas');
    const exportSize = 400; // 400x400 high-res output
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext('2d');

    const scaleFactor = exportSize / 260; // Scale ratio from viewport to export canvas

    const aspect = imageObj.width / imageObj.height;
    let baseW, baseH;
    if (aspect > 1) {
      baseH = 260;
      baseW = 260 * aspect;
    } else {
      baseW = 260;
      baseH = 260 / aspect;
    }

    const drawW = baseW * zoom * scaleFactor;
    const drawH = baseH * zoom * scaleFactor;

    const defaultX = (exportSize - drawW) / 2;
    const defaultY = (exportSize - drawH) / 2;

    const finalX = defaultX + pan.x * scaleFactor;
    const finalY = defaultY + pan.y * scaleFactor;

    // Clear and draw real photo on canvas
    ctx.clearRect(0, 0, exportSize, exportSize);
    ctx.drawImage(imageObj, finalX, finalY, drawW, drawH);

    // Extract real image data URL (high-quality JPEG)
    const base64Data = exportCanvas.toDataURL('image/jpeg', 0.90);
    setCroppedBase64(base64Data);
    setPreviewAvatar(base64Data);
    setIsCropModalOpen(false);

    // Auto-save cropped photo immediately to backend MongoDB & AuthContext
    try {
      toast.info('Saving photo to profile...');
      const res = await updateProfile({
        name: user?.name || '',
        currency: user?.currency || 'INR',
        timezone: user?.timezone || 'Asia/Kolkata',
        language: user?.language || 'en',
        themePreference: user?.themePreference || theme,
        avatar: base64Data,
      });

      if (res?.data?.avatar) {
        setPreviewAvatar(res.data.avatar);
      }
      toast.success('Profile photo saved permanently in database & Navbar!');

      addNotification({
        title: 'Profile Photo Updated',
        message: 'Your new profile avatar photo was uploaded and saved permanently.',
        type: 'SYSTEM',
      });
    } catch (err) {
      console.error('Auto-save photo error:', err);
      toast.error('Could not auto-save. Please click "Save Profile & Preferences" at the bottom.');
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        currency: data.currency,
        timezone: data.timezone,
        language: data.language,
        themePreference: theme,
      };

      if (data.password) {
        payload.password = data.password;
      }

      if (croppedBase64) {
        payload.avatar = croppedBase64;
      } else if (previewAvatar && previewAvatar.startsWith('data:image/')) {
        payload.avatar = previewAvatar;
      }

      let submitData;
      if (selectedFile && !croppedBase64) {
        const formData = new FormData();
        Object.keys(payload).forEach((k) => formData.append(k, payload[k]));
        formData.append('avatar', selectedFile);
        submitData = formData;
      } else {
        submitData = payload;
      }

      const res = await updateProfile(submitData);
      if (res?.data?.avatar) {
        setPreviewAvatar(res.data.avatar);
      }
      setSelectedFile(null);
      setCroppedBase64('');

      toast.success('Profile and Photo updated successfully!');
      
      // Trigger Live Notification
      addNotification({
        title: 'Profile Updated',
        message: selectedFile || croppedBase64
          ? 'Your new profile avatar photo was uploaded & saved successfully.'
          : 'Your account profile settings were saved successfully.',
        type: 'SYSTEM',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Account Profile & System Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage personal photo avatar, currency defaults, dark mode & security preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User Card & Photo Upload */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            {previewAvatar ? (
              <img
                src={getAvatarSrc(previewAvatar)}
                alt={user?.name || 'User Avatar'}
                onError={() => setPreviewAvatar('')}
                className="w-24 h-24 rounded-2xl object-cover object-center border-2 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-md">
                {user?.name?.[0] || 'U'}
              </div>
            )}

            <label className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg cursor-pointer transition-all">
              <HiCamera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                {...register('email')}
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Preferences & System Options
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Timezone
              </label>
              <select
                {...register('timezone')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Appearance Theme
              </label>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-all"
              >
                <span>Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                {theme === 'dark' ? <HiSun className="w-4 h-4 text-amber-400" /> : <HiMoon className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Security Password Change */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Security & Password Update
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (Leave blank to keep unchanged)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
            />
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <HiCheck className="w-5 h-5" />
          <span>{submitting ? 'Saving Changes...' : 'Save Profile & Preferences'}</span>
        </button>
      </form>

      {/* Smartphone-Style Interactive Drag/Pan Cropper Modal */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title="Drag & Crop Profile Photo"
      >
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag image to align face. Use zoom slider to fit your head perfectly.
          </p>

          {/* Interactive Drag & Pan Circular Viewport */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="w-65 h-65 mx-auto rounded-full border-4 border-indigo-500 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing relative bg-slate-950 flex items-center justify-center select-none"
          >
            <canvas ref={previewCanvasRef} className="w-full h-full block" />
          </div>

          <canvas ref={exportCanvasRef} className="hidden" />

          {/* Zoom Slider */}
          <div className="px-4 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Zoom & Scale</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => setIsCropModalOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-1.5"
            >
              <HiScissors className="w-4 h-4" />
              <span>Crop & Save Photo</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileSettings;
