import React, { useState } from 'react';
import { useSystemSettings } from '@/hooks/admin/useSystemSettings';
import { GeneralSettingsForm } from '@/components/domain/admin/GeneralSettingsForm';
import { EmailSettingsForm } from '@/components/domain/admin/EmailSettingsForm';
import { SecuritySettingsForm } from '@/components/domain/admin/SecuritySettingsForm';
import { FeatureFlagsForm } from '@/components/domain/admin/FeatureFlagsForm';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from 'react-i18next';

export const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'security' | 'features'>('general');
  const { data: settings, isLoading, error } = useSystemSettings();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {t('error_loading_settings')}
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: t('general_settings') },
    { id: 'email', label: t('email_settings') },
    { id: 'security', label: t('security_settings') },
    { id: 'features', label: t('feature_flags') },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('system_settings')}</h1>
        <p className="mt-2 text-gray-600">
          {t('system_settings_desc')}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'general' && settings && (
          <GeneralSettingsForm initialData={settings as any} />
        )}
        {activeTab === 'email' && settings && (
          <EmailSettingsForm initialData={settings as any} />
        )}
        {activeTab === 'security' && settings && (
          <SecuritySettingsForm initialData={settings as any} />
        )}
        {activeTab === 'features' && settings && (
          <FeatureFlagsForm initialData={settings as any} />
        )}
      </div>
    </div>
  );
};

export default SystemSettingsPage;
