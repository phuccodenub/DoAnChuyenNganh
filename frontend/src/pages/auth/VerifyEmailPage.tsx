import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { httpClient } from '@/services/http/client';
import { toast } from 'react-hot-toast';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage(t('invalid_verification_link'));
        return;
      }

      try {
        setStatus('loading');
        const response = await httpClient.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data?.message || t('email_verified_successfully'));
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error?.response?.data?.message || t('email_verification_failed');
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [token, navigate, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('verifying_email')}</h1>
              <p className="text-gray-600">{t('please_wait')}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('email_verified')}</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">{t('redirecting_to_login')}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('verification_failed')}</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {t('back_to_login')}
              </button>
            </>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              {t('email_verification_info')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
