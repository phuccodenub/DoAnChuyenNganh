import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EmailSettingsSchema } from '@/types/system-settings.types';
import { useUpdateEmailSettings, useTestEmailConnection } from '@/hooks/admin/useSystemSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from 'react-i18next';

type EmailSettingsFormData = z.infer<typeof EmailSettingsSchema>;

interface EmailSettingsFormProps {
  initialData?: Partial<EmailSettingsFormData>;
}

export const EmailSettingsForm: React.FC<EmailSettingsFormProps> = ({ initialData }) => {
  const { t } = useTranslation();
  const { mutate: updateSettings, isPending } = useUpdateEmailSettings();
  const { mutate: testConnection, isPending: isTesting } = useTestEmailConnection();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EmailSettingsFormData>({
    resolver: zodResolver(EmailSettingsSchema),
    defaultValues: initialData || {
      email_from: '',
      email_provider: 'smtp',
      email_host: '',
      email_port: 587,
      email_username: '',
      email_use_tls: true,
      smtp_encryption: 'tls',
    },
  });

  const emailProvider = watch('email_provider');

  const onSubmit = (data: EmailSettingsFormData) => {
    updateSettings(data);
  };

  const handleTestConnection = () => {
    const data = {
      email_host: watch('email_host'),
      email_port: watch('email_port'),
      email_username: watch('email_username'),
      email_password: '', // User should input this
      smtp_encryption: watch('smtp_encryption'),
    };
    testConnection(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email From */}
        <div className="md:col-span-2">
          <label htmlFor="email_from" className="block text-sm font-medium text-gray-700">
            {t('email_from')}
          </label>
          <Input
            id="email_from"
            type="email"
            {...register('email_from')}
            placeholder="noreply@example.com"
            className="mt-1"
          />
          {errors.email_from && (
            <p className="mt-1 text-sm text-red-600">{errors.email_from.message}</p>
          )}
        </div>

        {/* Email Provider */}
        <div>
          <label htmlFor="email_provider" className="block text-sm font-medium text-gray-700">
            {t('email_provider')}
          </label>
          <select
            id="email_provider"
            {...register('email_provider')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="aws_ses">AWS SES</option>
          </select>
        </div>

        {emailProvider === 'smtp' && (
          <>
            {/* Email Host */}
            <div className="md:col-span-2">
              <label htmlFor="email_host" className="block text-sm font-medium text-gray-700">
                {t('email_host')}
              </label>
              <Input
                id="email_host"
                {...register('email_host')}
                placeholder="smtp.gmail.com"
                className="mt-1"
              />
              {errors.email_host && (
                <p className="mt-1 text-sm text-red-600">{errors.email_host.message}</p>
              )}
            </div>

            {/* Email Port */}
            <div>
              <label htmlFor="email_port" className="block text-sm font-medium text-gray-700">
                {t('email_port')}
              </label>
              <Input
                id="email_port"
                type="number"
                {...register('email_port', { valueAsNumber: true })}
                placeholder="587"
                className="mt-1"
              />
              {errors.email_port && (
                <p className="mt-1 text-sm text-red-600">{errors.email_port.message}</p>
              )}
            </div>

            {/* Email Username */}
            <div className="md:col-span-2">
              <label htmlFor="email_username" className="block text-sm font-medium text-gray-700">
                {t('email_username')}
              </label>
              <Input
                id="email_username"
                {...register('email_username')}
                placeholder="your-email@gmail.com"
                className="mt-1"
              />
              {errors.email_username && (
                <p className="mt-1 text-sm text-red-600">{errors.email_username.message}</p>
              )}
            </div>

            {/* SMTP Encryption */}
            <div>
              <label htmlFor="smtp_encryption" className="block text-sm font-medium text-gray-700">
                {t('smtp_encryption')}
              </label>
              <select
                id="smtp_encryption"
                {...register('smtp_encryption')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
              >
                <option value="none">Không có</option>
                <option value="ssl">SSL</option>
                <option value="tls">TLS</option>
              </select>
            </div>

            {/* Use TLS */}
            <div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  {...register('email_use_tls')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{t('use_tls')}</span>
              </label>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={handleTestConnection}
          disabled={isTesting || emailProvider !== 'smtp'}
          className="gap-2"
        >
          {isTesting && <Spinner className="w-4 h-4" />}
          {isTesting ? t('testing') : t('test_connection')}
        </Button>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending && <Spinner className="w-4 h-4" />}
          {isPending ? t('saving') : t('save_changes')}
        </Button>
      </div>
    </form>
  );
};
