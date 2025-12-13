import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateGeneralSettings } from '@/hooks/admin/useSystemSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from 'react-i18next';

const GeneralSettingsSchema = z.object({
  site_name: z.string().min(1, 'Tên trang web là bắt buộc').max(100),
  site_logo_url: z.string().url('URL logo không hợp lệ').or(z.literal('')),
  site_favicon_url: z.string().url('URL favicon không hợp lệ').or(z.literal('')),
  timezone: z.string().min(1, 'Múi giờ là bắt buộc'),
  language: z.enum(['vi', 'en']),
  currency: z.string().min(1, 'Tiền tệ là bắt buộc'),
  max_upload_size: z.number().positive('Kích thước upload phải là số dương'),
});

type GeneralSettingsFormData = z.infer<typeof GeneralSettingsSchema>;

interface GeneralSettingsFormProps {
  initialData?: Partial<GeneralSettingsFormData>;
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({ initialData }) => {
  const { t } = useTranslation();
  const { mutate: updateSettings, isPending } = useUpdateGeneralSettings();

  const { register, handleSubmit, formState: { errors } } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(GeneralSettingsSchema),
    defaultValues: initialData || {
      site_name: '',
      site_logo_url: '',
      site_favicon_url: '',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi',
      currency: 'VND',
      max_upload_size: 10485760,
    },
  });

  const onSubmit = (data: GeneralSettingsFormData) => {
    updateSettings(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Name */}
        <div>
          <label htmlFor="site_name" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.site_name')}
          </label>
          <Input
            id="site_name"
            {...register('site_name')}
            placeholder="Tên trang web"
            className="mt-1"
          />
          {errors.site_name && (
            <p className="mt-1 text-sm text-red-600">{errors.site_name.message}</p>
          )}
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.timezone')}
          </label>
          <select
            id="timezone"
            {...register('timezone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          >
            <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (UTC+7)</option>
            <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New York (UTC-5)</option>
          </select>
          {errors.timezone && (
            <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
          )}
        </div>

        {/* Logo URL */}
        <div className="md:col-span-2">
          <label htmlFor="site_logo_url" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.logo_url')}
          </label>
          <Input
            id="site_logo_url"
            {...register('site_logo_url')}
            placeholder="https://example.com/logo.png"
            className="mt-1"
          />
          {errors.site_logo_url && (
            <p className="mt-1 text-sm text-red-600">{errors.site_logo_url.message}</p>
          )}
        </div>

        {/* Favicon URL */}
        <div className="md:col-span-2">
          <label htmlFor="site_favicon_url" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.favicon_url')}
          </label>
          <Input
            id="site_favicon_url"
            {...register('site_favicon_url')}
            placeholder="https://example.com/favicon.ico"
            className="mt-1"
          />
          {errors.site_favicon_url && (
            <p className="mt-1 text-sm text-red-600">{errors.site_favicon_url.message}</p>
          )}
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.language')}
          </label>
          <select
            id="language"
            {...register('language')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.currency')}
          </label>
          <select
            id="currency"
            {...register('currency')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
          >
            <option value="VND">VND (₫)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        {/* Max Upload Size */}
        <div>
          <label htmlFor="max_upload_size" className="block text-sm font-medium text-gray-700">
            {t('admin.system_settings.fields.max_upload_size')} (bytes)
          </label>
          <Input
            id="max_upload_size"
            type="number"
            {...register('max_upload_size', { valueAsNumber: true })}
            placeholder="10485760"
            className="mt-1"
          />
          {errors.max_upload_size && (
            <p className="mt-1 text-sm text-red-600">{errors.max_upload_size.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Mặc định: 10 MB (10485760 bytes)
          </p>
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
