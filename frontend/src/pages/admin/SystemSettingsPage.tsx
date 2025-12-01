import React, { useState } from 'react';
import { useSystemSettings } from '@/hooks/admin/useSystemSettings';
import { GeneralSettingsForm } from '@/components/domain/admin/GeneralSettingsForm';
import { EmailSettingsForm } from '@/components/domain/admin/EmailSettingsForm';
import { SecuritySettingsForm } from '@/components/domain/admin/SecuritySettingsForm';
import { FeatureFlagsForm } from '@/components/domain/admin/FeatureFlagsForm';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from 'react-i18next';
import { Settings, Globe, Mail, Shield, Zap, AlertCircle } from 'lucide-react';

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
        {t('admin.systemSettings.error_loading_settings')}
      </div>
    );
  }

  const tabs = [
    { 
      id: 'general', 
      label: t('admin.systemSettings.general_settings'),
      icon: Globe,
      description: 'Cấu hình chung của hệ thống'
    },
    { 
      id: 'email', 
      label: t('admin.systemSettings.email_settings'),
      icon: Mail,
      description: 'Cài đặt email và thông báo'
    },
    { 
      id: 'security', 
      label: t('admin.systemSettings.security_settings'),
      icon: Shield,
      description: 'Bảo mật và xác thực'
    },
    { 
      id: 'features', 
      label: t('admin.systemSettings.feature_flags'),
      icon: Zap,
      description: 'Quản lý tính năng'
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {t('admin.systemSettings.system_settings')}
          </h1>
          <p className="mt-1 text-gray-600 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t('admin.systemSettings.system_settings_desc')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        {/* Tab Description */}
        <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 min-h-[500px]">
        <div className="animate-fadeIn">
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
    </div>
  );
};

export default SystemSettingsPage;
