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
  HiArrowRight,
} from 'react-icons/hi2';

import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../features/auth/authSchemas';

const Register = () => {
  const { register: signup /* , sendOTP, verifyOTP */ } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * ==========================================
   * OTP STATES & HANDLERS (COMMENTED OUT)
   * ==========================================
   * const [otpSent, setOtpSent] = useState(false);
   * const [sendingOtp, setSendingOtp] = useState(false);
   * const [verifyingOtp, setVerifyingOtp] = useState(false);
   * const [isEmailVerified, setIsEmailVerified] = useState(false);
   *
   * const handleSendOTP = async () => { ... };
   * const handleVerifyOTP = async () => { ... };
   * const handleEditEmail = () => { ... };
   */

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      currency: 'INR',
      themePreference: 'dark',
    },
  });

  const onError = (formErrors) => {
    const firstError = Object.values(formErrors)[0]?.message;
    if (firstError) {
      toast.error(firstError);
    }
  };

  const onSubmit = async (data) => {
    const rawEmail = data.email;
    data.email = rawEmail ? rawEmail.trim().toLowerCase() : '';

    /*
     * OTP verification bypassed as requested:
     * if (!isEmailVerified) { ... }
     */

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
          <p className="text-xs text-[#97CADB]">Join ExpensePilot to manage your personal finances</p>
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

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <HiEnvelope className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="name@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          {/* 
            ==================================================
            OTP INPUT & VERIFICATION SECTION (COMMENTED OUT)
            ==================================================
            {otpSent && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                ...
              </div>
            )}
          */}

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
