import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResetPassword } from '@/hooks/auth/useResetPassword';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * Validation schema for reset password form
 */
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * ResetPasswordPage Component
 * 
 * Allows users to reset their password using a reset token from email.
 * Validates password strength and confirms the new password.
 */
export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { mutate, isPending, isSuccess, isError, error } = useResetPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch('password');

  useEffect(() => {
    // Validate token exists
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    mutate({
      token,
      password: data.password,
    });
  };

  // Success state - show confirmation
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
              Password Reset Successfully
            </h1>

            {/* Description */}
            <p className="text-center text-slate-600 mb-6">
              Your password has been changed successfully. Redirecting to login...
            </p>

            {/* Success Animation */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                <Loader className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
              Invalid Reset Link
            </h1>

            {/* Description */}
            <p className="text-center text-slate-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            {/* Action Button */}
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-center"
            >
              Request New Reset Link
            </Link>

            {/* Back to Login */}
            <Link
              to={ROUTES.LOGIN}
              className="block w-full mt-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium py-2.5 px-4 rounded-lg transition-colors text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Reset Password
            </h1>
            <p className="text-slate-600">
              Enter your new password below. Make sure it's strong and secure.
            </p>
          </div>

          {/* Error Message */}
          {isError && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">
                  {error.message || 'Failed to reset password. Please try again.'}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter new password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg font-medium transition-colors ${
                    errors.password
                      ? 'border-red-300 bg-red-50 text-slate-900 placeholder:text-red-300'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-blue-50'
                  } focus:outline-none`}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}

              {/* Password Requirements */}
              {passwordValue && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm space-y-1">
                  <p className={passwordValue.length >= 8 ? 'text-emerald-600' : 'text-slate-600'}>
                    {passwordValue.length >= 8 ? '✓' : '○'} At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(passwordValue) ? 'text-emerald-600' : 'text-slate-600'}>
                    {/[A-Z]/.test(passwordValue) ? '✓' : '○'} At least one uppercase letter
                  </p>
                  <p className={/[a-z]/.test(passwordValue) ? 'text-emerald-600' : 'text-slate-600'}>
                    {/[a-z]/.test(passwordValue) ? '✓' : '○'} At least one lowercase letter
                  </p>
                  <p className={/[0-9]/.test(passwordValue) ? 'text-emerald-600' : 'text-slate-600'}>
                    {/[0-9]/.test(passwordValue) ? '✓' : '○'} At least one number
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="Confirm new password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg font-medium transition-colors ${
                    errors.confirmPassword
                      ? 'border-red-300 bg-red-50 text-slate-900 placeholder:text-red-300'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-blue-50'
                  } focus:outline-none`}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full font-medium py-2.5 px-4 rounded-lg transition-colors ${
                isPending
                  ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-white rounded-full animate-spin" />
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-slate-600">
            <Link to={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-700 font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
