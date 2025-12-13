import { QueryInterface, DataTypes } from 'sequelize';

const SYSTEM_SETTINGS_SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('system_settings', {
    id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },

    // General
    site_name: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'LMS' },
    site_logo_url: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    site_favicon_url: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    timezone: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'Asia/Ho_Chi_Minh' },
    language: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'vi' },
    currency: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'VND' },
    max_upload_size: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10485760 },

    // System flags
    maintenance_mode: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    allow_registration: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    require_email_verification: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

    // Security
    password_min_length: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 8 },
    session_timeout_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },

    // Email
    email_from: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    email_provider: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'smtp' },
    email_host: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    email_port: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 587 },
    email_username: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    email_use_tls: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    smtp_encryption: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'tls' },

    // Feature flags
    feature_two_factor: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    feature_social_login: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    feature_live_stream: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    feature_chat: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    feature_forums: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    enable_course_reviews: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    enable_user_profiles: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

    // API limits
    api_rate_limit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1000 },
    api_rate_limit_window: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },

    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await queryInterface.addIndex('system_settings', ['id'], { unique: true, name: 'idx_system_settings_singleton' });

  await queryInterface.bulkInsert('system_settings', [
    {
      id: SYSTEM_SETTINGS_SINGLETON_ID,
      site_name: 'LMS',
      site_logo_url: '',
      site_favicon_url: '',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi',
      currency: 'VND',
      max_upload_size: 10485760,
      maintenance_mode: false,
      allow_registration: true,
      require_email_verification: true,
      password_min_length: 8,
      session_timeout_minutes: 30,
      email_from: '',
      email_provider: 'smtp',
      email_host: '',
      email_port: 587,
      email_username: '',
      email_use_tls: true,
      smtp_encryption: 'tls',
      feature_two_factor: false,
      feature_social_login: false,
      feature_live_stream: true,
      feature_chat: true,
      feature_forums: false,
      enable_course_reviews: true,
      enable_user_profiles: true,
      api_rate_limit: 1000,
      api_rate_limit_window: 60,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  try {
    await queryInterface.removeIndex('system_settings', 'idx_system_settings_singleton');
  } catch {
    // ignore
  }
  await queryInterface.dropTable('system_settings');
}
