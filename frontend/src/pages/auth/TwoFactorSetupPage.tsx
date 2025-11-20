import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Copy, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { httpClient } from '@/services/http/client';
import { toast } from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';

export default function TwoFactorSetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'success'>('intro');
  const [totpCode, setTotpCode] = useState('');
  const [setupData, setSetupData] = useState<{ qrCode?: string; secret?: string; backupCodes?: string[] } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Setup 2FA
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await httpClient.post('/auth/2fa/enable');
      return response.data;
    },
    onSuccess: (data) => {
      setSetupData(data.data);
      setStep('setup');
      toast.success(t('two_factor_setup_initiated'));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || t('error_enabling_2fa');
      toast.error(message);
    },
  });

  // Verify 2FA setup
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await httpClient.post('/auth/2fa/verify-setup', { code });
      return response.data;
    },
    onSuccess: () => {
      setStep('success');
      toast.success(t('two_factor_enabled_successfully'));
      setTimeout(() => {
        navigate('/');
      }, 3000);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || t('invalid_2fa_code');
      toast.error(message);
    },
  });

  const handleStartSetup = () => {
    setupMutation.mutate();
  };

  const handleVerifyCode = () => {
    if (!totpCode.trim() || totpCode.length !== 6) {
      toast.error(t('please_enter_valid_6_digit_code'));
      return;
    }
    verifyMutation.mutate(totpCode);
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t('please_login_first')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">{t('two_factor_authentication')}</h1>
            <p className="text-gray-600 mt-2">{t('two_factor_description')}</p>
          </div>

          {/* Intro Step */}
          {step === 'intro' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-4">{t('two_factor_intro')}</p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>{t('two_factor_benefit_1')}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>{t('two_factor_benefit_2')}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>{t('two_factor_benefit_3')}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleStartSetup}
                disabled={setupMutation.isPending}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                {setupMutation.isPending ? (
                  <>
                    <Spinner /> {t('setting_up')}
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    {t('enable_two_factor')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Setup Step - Show QR Code & Secret */}
          {step === 'setup' && setupData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('step_1_scan_qr_code')}</h2>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  {setupData.qrCode ? (
                    <img src={setupData.qrCode} alt="QR Code" className="mx-auto w-48 h-48" />
                  ) : (
                    <p className="text-gray-600">{t('qr_code_loading')}</p>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {t('scan_with_authenticator_app')}
                </p>
              </div>

              {/* Manual Entry */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('or_enter_manually')}</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">{t('secret_key')}</p>
                  <code className="block bg-white p-3 rounded border border-gray-300 font-mono text-center text-lg tracking-wider break-all">
                    {setupData.secret || '••••••••••••••••'}
                  </code>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setStep('verify')}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {t('next')}
              </button>
            </div>
          )}

          {/* Verify Step - Enter TOTP Code */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('step_2_verify_code')}</h2>
                <p className="text-sm text-gray-600 mb-4">{t('enter_6_digit_code')}</p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl tracking-widest border-2 border-gray-300 rounded-lg py-3 font-mono focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={verifyMutation.isPending || totpCode.length !== 6}
                className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Spinner /> {t('verifying')}
                  </>
                ) : (
                  t('verify_code')
                )}
              </button>

              <button
                onClick={() => setStep('setup')}
                className="w-full border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition"
              >
                {t('back')}
              </button>
            </div>
          )}

          {/* Success Step - Show Backup Codes */}
          {step === 'success' && setupData?.backupCodes && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900">{t('two_factor_enabled')}</h3>
                    <p className="text-sm text-green-800 mt-1">{t('2fa_enabled_info')}</p>
                  </div>
                </div>
              </div>

              {/* Backup Codes */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('backup_codes')}</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{t('backup_codes_warning')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {setupData.backupCodes.map((code, index) => (
                    <div
                      key={index}
                      onClick={() => handleCopyCode(code, index)}
                      className="bg-gray-50 p-3 rounded border border-gray-300 cursor-pointer hover:bg-gray-100 transition flex items-center justify-between"
                    >
                      <code className="font-mono text-sm">{code}</code>
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Done Button */}
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {t('done')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
