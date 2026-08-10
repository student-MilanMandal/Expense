import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/ExpensePailot.jpg';
import { toast } from 'react-toastify';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiArrowRight } from 'react-icons/hi2';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../features/auth/authSchemas';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Invalid email or password');
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
          <h2 className="text-2xl font-black tracking-tight">Sign In to Expense<span className="text-[#089790]">Pilot</span></h2>
          <p className="text-xs text-[#97CADB]">Enter your credentials to access your expense tracker dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <HiEnvelope className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="name@example.com"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                className="w-full pl-11 pr-4 py-2.5 bg-[#050B14] border border-[#1F4759]/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#089790] focus:ring-1 focus:ring-[#089790] transition-all"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#86E3CE] hover:underline font-semibold">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <HiLockClosed className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-11 pr-11 py-2.5 bg-[#050B14] border border-[#1F4759]/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#089790] focus:ring-1 focus:ring-[#089790] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-linear-to-r from-[#018ABE] to-[#089790] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#089790]/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <HiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-[#1F4759]/50">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#86E3CE] font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
