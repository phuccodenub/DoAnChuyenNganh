import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SecuritySettingsSchema } from '@/types/system-settings.types';
import { useUpdateSecuritySettings } from '@/hooks/admin/useSystemSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from 'react-i18next';

type SecuritySettingsFormData = z.infer<typeof SecuritySettingsSchema>;

interface SecuritySettingsFormProps {
  initialData?: Partial<SecuritySettingsFormData>;
}

export const SecuritySettingsForm: React.FC<SecuritySettingsFormProps> = ({ initialData }) => {
  const { t } = useTranslation();
  const { mutate: updateSettings, isPending } = useUpdateSecuritySettings();

  const { register, handleSubmit, formState: { errors } } = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(SecuritySettingsSchema),
    defaultValues: initialData || {
      password_min_length: 8,
      session_timeout_minutes: 30,
      require_email_verification: true,
      feature_two_factor: false,
      api_rate_limit: 1000,
      api_rate_limit_window: 60,
    },
  });

  const onSubmit = (data: SecuritySettingsFormData) => {
    updateSettings(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Min Length */}
        <div>
          <label htmlFor="password_min_length" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.password_min_length')}
          </label>
          <Input
            id="password_min_length"
            type="number"
            {...register('password_min_length', { valueAsNumber: true })}
            min="6"
            max="128"
            className="mt-1"
          />
          {errors.password_min_length && (
            <p className="mt-1 text-sm text-red-600">{errors.password_min_length.message}</p>
          )}
        </div>

        {/* Session Timeout */}
        <div>
          <label htmlFor="session_timeout_minutes" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.session_timeout_minutes')}
          </label>
          <Input
            id="session_timeout_minutes"
            type="number"
            {...register('session_timeout_minutes', { valueAsNumber: true })}
            min="1"
            max="1440"
            className="mt-1"
          />
          {errors.session_timeout_minutes && (
            <p className="mt-1 text-sm text-red-600">{errors.session_timeout_minutes.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">1 phút đến 1 ngày</p>
        </div>

        {/* API Rate Limit */}
        <div>
          <label htmlFor="api_rate_limit" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.api_rate_limit')} (requests)
          </label>
          <Input
            id="api_rate_limit"
            type="number"
            {...register('api_rate_limit', { valueAsNumber: true })}
            min="1"
            className="mt-1"
          />
          {errors.api_rate_limit && (
            <p className="mt-1 text-sm text-red-600">{errors.api_rate_limit.message}</p>
          )}
        </div>

        {/* API Rate Limit Window */}
        <div>
          <label htmlFor="api_rate_limit_window" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.api_rate_limit_window')} (giây)
          </label>
          <Input
            id="api_rate_limit_window"
            type="number"
            {...register('api_rate_limit_window', { valueAsNumber: true })}
            min="1"
            className="mt-1"
          />
          {errors.api_rate_limit_window && (
            <p className="mt-1 text-sm text-red-600">{errors.api_rate_limit_window.message}</p>
          )}
        </div>

        {/* Checkboxes */}
        <div className="md:col-span-2 space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('require_email_verification')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {t('admin.system_settings.fields.require_email_verification')}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('feature_two_factor')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {t('admin.system_settings.fields.feature_two_factor')}
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending && <Spinner className="w-4 h-4" />}
          {isPending ? t('admin.system_settings.actions.saving') : t('admin.system_settings.actions.save_changes')}
        </Button>
      </div>
    </form>
  );
};
