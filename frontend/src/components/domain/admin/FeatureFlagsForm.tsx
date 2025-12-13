import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FeatureFlagsSchema } from '@/types/system-settings.types';
import { useUpdateFeatureFlags } from '@/hooks/admin/useSystemSettings';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from 'react-i18next';

type FeatureFlagsFormData = z.infer<typeof FeatureFlagsSchema>;

interface FeatureFlagsFormProps {
  initialData?: Partial<FeatureFlagsFormData>;
}

export const FeatureFlagsForm: React.FC<FeatureFlagsFormProps> = ({ initialData }) => {
  const { t } = useTranslation();
  const { mutate: updateSettings, isPending } = useUpdateFeatureFlags();

  const { register, handleSubmit, formState: { errors } } = useForm<FeatureFlagsFormData>({
    resolver: zodResolver(FeatureFlagsSchema),
    defaultValues: initialData || {
      feature_two_factor: false,
      feature_social_login: false,
      feature_live_stream: true,
      feature_chat: true,
      feature_forums: false,
      enable_course_reviews: true,
      enable_user_profiles: true,
      allow_registration: true,
      maintenance_mode: false,
    },
  });

  const onSubmit = (data: FeatureFlagsFormData) => {
    updateSettings(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* System Features */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.system_settings.sections.system_features')}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('maintenance_mode')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('admin.system_settings.fields.maintenance_mode')}</span>
                <p className="text-xs text-gray-500 mt-1">{t('admin.system_settings.fields.maintenance_mode_desc')}</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('allow_registration')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('admin.system_settings.fields.allow_registration')}</span>
                <p className="text-xs text-gray-500 mt-1">{t('admin.system_settings.fields.allow_new_user_registrations')}</p>
              </div>
            </label>
          </div>
        </div>

        {/* Learning Features */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.system_settings.sections.learning_features')}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('feature_live_stream')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('admin.system_settings.fields.live_streaming')}</span>
                <p className="text-xs text-gray-500 mt-1">{t('admin.system_settings.fields.enable_live_courses')}</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('feature_chat')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('admin.system_settings.fields.chat_system')}</span>
                <p className="text-xs text-gray-500 mt-1">{t('admin.system_settings.fields.enable_course_chat')}</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('feature_forums')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('admin.system_settings.fields.discussion_forums')}</span>
                <p className="text-xs text-gray-500 mt-1">{t('admin.system_settings.fields.enable_course_forums')}</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('enable_course_reviews')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('admin.system_settings.fields.course_reviews')}</span>
                <p className="text-xs text-gray-500 mt-1">{t('admin.system_settings.fields.allow_course_ratings')}</p>
              </div>
            </label>
          </div>
        </div>

        {/* User Features */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.system_settings.sections.user_features')}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('feature_two_factor')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('admin.system_settings.fields.two_factor_auth')}</span>
                <p className="text-xs text-gray-500 mt-1">{t('admin.system_settings.fields.enable_2fa_for_users')}</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('feature_social_login')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('admin.system_settings.fields.social_login')}</span>
                <p className="text-xs text-gray-500 mt-1">{t('admin.system_settings.fields.enable_social_auth')}</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('enable_user_profiles')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('admin.system_settings.fields.user_profiles')}</span>
                <p className="text-xs text-gray-500 mt-1">{t('admin.system_settings.fields.allow_public_user_profiles')}</p>
              </div>
            </label>
          </div>
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
