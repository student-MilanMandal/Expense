import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/ExpensePailot.jpg';
import { toast } from 'react-toastify';
import {
  HiUser,
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiKey,
  HiArrowRight,
  HiCheckCircle,
} from 'react-icons/hi2';

import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../features/auth/authSchemas';

const Register = () => {
  const { register: signup, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      currency: 'INR',
      themePreference: 'dark',
    },
  });

  const otpValue = watch('otp');

  const handleSendOTP = async () => {
    const rawEmail = getValues('email');
    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address first');
      return;
    }

    setValue('email', email);

    setSendingOtp(true);
    try {
      await sendOTP(email);
      setOtpSent(true);
      toast.success('Verification OTP code sent to your email!');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (error.code === 'ERR_NETWORK' || error.message?.includes('Network')
            ? 'Cannot connect to backend server. Please ensure Node server is running on port 5000.'
            : error.message || 'Failed to send OTP code')
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async (customOtp) => {
    const rawEmail = getValues('email');
    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';
    const otp = typeof customOtp === 'string' ? customOtp : getValues('otp');

    if (!otp || otp.trim().length !== 6) {
      return;
    }

    setVerifyingOtp(true);
    try {
      await verifyOTP(email, otp.trim());
      setIsEmailVerified(true);
      toast.success('Email verified successfully! ✅');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Auto-verify OTP when 6 digits are entered
  React.useEffect(() => {
    if (otpSent && !isEmailVerified && !verifyingOtp && otpValue && otpValue.trim().length === 6) {
      handleVerifyOTP(otpValue.trim());
    }
  }, [otpValue, otpSent, isEmailVerified, verifyingOtp]);

  const handleEditEmail = () => {
    setOtpSent(false);
    setIsEmailVerified(false);
    setValue('otp', '');
  };

  const onError = (formErrors) => {
    const firstError = Object.values(formErrors)[0]?.message;
    if (firstError) {
      toast.error(firstError);
    }
  };

  const onSubmit = async (data) => {
    const rawEmail = data.email;
    data.email = rawEmail ? rawEmail.trim().toLowerCase() : '';

    if (!otpSent && !isEmailVerified) {
      toast.error('Please click "Send OTP" to verify your email first');
      return;
    }

    if (!isEmailVerified) {
      if (!data.otp || data.otp.trim().length !== 6) {
        toast.error('Please enter and verify your 6-digit OTP code first');
        return;
      }
      try {
        await verifyOTP(data.email, data.otp.trim());
        setIsEmailVerified(true);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Invalid or expired OTP code');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await signup(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#050B14] via-[#0A1325] to-[#1F4759] text-white">
      <div className="w-full max-w-md bg-[#0A1325]/90 backdrop-blur-xl border border-[#1F4759]/60 p-8 rounded-3xl shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <img
              src={logoImg}
              alt="ExpensePilot Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-[#089790]/20 border border-[#1F4759]"
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Create Account</h2>
          <p className="text-xs text-[#97CADB]">Join ExpensePilot with OTP email verification</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <HiUser className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter your full name"
                {...register('name', { required: 'Name is required' })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email Address & Send OTP / Change Email Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              {isEmailVerified ? (
                <span className="text-emerald-400 font-bold text-xs inline-flex items-center gap-1">
                  <HiCheckCircle className="w-4 h-4" /> Email Verified
                </span>
              ) : otpSent ? (
                <button
                  type="button"
                  onClick={handleEditEmail}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  Change Email
                </button>
              ) : null}
            </div>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <HiEnvelope className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  readOnly={otpSent || isEmailVerified}
                  placeholder="name@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all ${
                    otpSent || isEmailVerified ? 'bg-slate-900/90 border-slate-700/50 text-slate-300 read-only:cursor-not-allowed' : ''
                  }`}
                />
              </div>
              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOtp}
                  className="px-3 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              )}
            </div>
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          {/* OTP Code (Required if sent) */}
          {otpSent && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Enter 6-Digit OTP</label>
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <HiKey className="w-5 h-5 text-indigo-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    readOnly={isEmailVerified}
                    placeholder="123456"
                    {...register('otp', { required: 'OTP code is required' })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-indigo-500/80 rounded-xl text-sm text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                      isEmailVerified ? 'bg-slate-900/90 border-emerald-500/60 text-emerald-300 read-only:cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={verifyingOtp || isEmailVerified}
                  className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isEmailVerified
                      ? 'bg-emerald-600/80 text-white cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  } disabled:opacity-50`}
                >
                  {verifyingOtp ? 'Verifying...' : isEmailVerified ? 'Verified ✓' : 'Verify OTP'}
                </button>
              </div>
              {!isEmailVerified && (
                <p className="text-[11px] text-slate-400 mt-1">Check your email inbox (and spam folder) for the 6-digit OTP code.</p>
              )}
              {errors.otp && <p className="text-xs text-rose-400 mt-1">{errors.otp.message}</p>}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <HiLockClosed className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Currency</label>
            <select
              {...register('currency')}
              className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-linear-to-r from-[#018ABE] to-[#089790] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#089790]/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <HiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-[#1F4759]/50">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#86E3CE] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
