import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Validation schema for forgot password form
 */
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * ForgotPasswordPage Component
 * 
 * Allows users to request a password reset email.
 * Displays success/error messages and handles form submission.
 */
export default function ForgotPasswordPage() {
  const { mutate, isPending, isSuccess, isError, error } = useForgotPassword();
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const emailValue = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmittedEmail(data.email);
    mutate(data);
  };

  // Success state - show confirmation message
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
              Kiểm tra Email của bạn
            </h1>

            {/* Description */}
            <p className="text-center text-slate-600 mb-4">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến:
            </p>

            {/* Email Display */}
            <p className="text-center font-medium text-slate-900 mb-6 p-3 bg-slate-50 rounded-lg break-all">
              {submittedEmail}
            </p>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                Nhấp vào liên kết trong email để đặt lại mật khẩu của bạn. Liên kết sẽ hết hạn sau 24 giờ.
              </p>
            </div>

            {/* Resend Info */}
            <p className="text-sm text-slate-600 text-center mb-6">
              Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
              <button
                onClick={() => {
                  reset();
                  setSubmittedEmail('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                thử lại
              </button>
            </p>

            {/* Back to Login Button */}
            <Link
              to={ROUTES.LOGIN}
              className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-center"
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
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-slate-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Error Message */}
          {isError && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Lỗi</p>
                <p className="text-sm text-red-700">
                  {error.message || 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.'}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                {t('auth.login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg font-medium transition-colors ${
                    errors.email
                      ? 'border-red-300 bg-red-50 text-slate-900 placeholder:text-red-300'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-blue-50'
                  } focus:outline-none`}
                  disabled={isPending}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
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
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                'Gửi liên kết đặt lại'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Nhớ mật khẩu?{' '}
            <Link to={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-700 font-medium">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
