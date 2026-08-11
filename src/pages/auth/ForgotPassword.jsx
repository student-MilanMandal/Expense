import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/ExpensePailot.jpg';
import { toast } from 'react-toastify';
import { HiEnvelope, HiKey, HiLockClosed, HiArrowLeft } from 'react-icons/hi2';

const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify & New Password
  const [emailSaved, setEmailSaved] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleSendOTP = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setEmailSaved(data.email);
      setStep(2);
      toast.success('Password reset OTP sent to your email!');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (error.code === 'ERR_NETWORK' || error.message?.includes('Network')
            ? 'Cannot connect to backend server. Please ensure Node server is running on port 5000.'
            : error.message || 'Failed to request OTP')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    setLoading(true);
    try {
      await resetPassword({
        email: emailSaved,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!emailSaved) return;
    setLoading(true);
    try {
      await forgotPassword(emailSaved);
      toast.success('A new OTP has been sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#050B14] via-[#0A1325] to-[#1F4759] text-white">
      <div className="w-full max-w-md bg-[#0A1325]/90 backdrop-blur-xl border border-[#1F4759]/60 p-8 rounded-3xl shadow-2xl space-y-6">
        <Link to="/login" className="inline-flex items-center space-x-2 text-xs font-semibold text-[#86E3CE] hover:underline">
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <img
              src={logoImg}
              alt="ExpensePilot Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-[#089790]/20 border border-[#1F4759]"
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Reset Password</h2>
          <p className="text-xs text-[#97CADB]">
            {step === 1 ? 'Enter your email address to receive an OTP' : `Enter the OTP sent to ${emailSaved}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit(handleSendOTP)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <HiEnvelope className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email', { required: 'Email address is required' })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-linear-to-r from-[#018ABE] to-[#089790] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#089790]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">6-Digit OTP</label>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-xs text-[#86E3CE] hover:underline font-semibold disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
              <div className="relative">
                <HiKey className="w-5 h-5 text-[#86E3CE] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  {...register('otp', { required: 'OTP code is required' })}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#050B14] border border-[#089790] rounded-xl text-sm text-white placeholder-slate-500 font-mono tracking-widest focus:outline-hidden focus:ring-1 focus:ring-[#089790] transition-all"
                />
              </div>
              {errors.otp && <p className="text-xs text-rose-400 mt-1">{errors.otp.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <HiLockClosed className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#050B14] border border-[#1F4759]/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#089790] transition-all"
                />
              </div>
              {errors.newPassword && <p className="text-xs text-rose-400 mt-1">{errors.newPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-linear-to-r from-[#018ABE] to-[#089790] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#089790]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
