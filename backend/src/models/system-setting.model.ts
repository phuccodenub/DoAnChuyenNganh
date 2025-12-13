import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const SystemSetting = sequelize.define(
  'SystemSetting',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },

    site_name: { type: DataTypes.STRING(100), allowNull: false },
    site_logo_url: { type: DataTypes.TEXT, allowNull: false },
    site_favicon_url: { type: DataTypes.TEXT, allowNull: false },
    timezone: { type: DataTypes.STRING(64), allowNull: false },
    language: { type: DataTypes.STRING(8), allowNull: false },
    currency: { type: DataTypes.STRING(16), allowNull: false },
    max_upload_size: { type: DataTypes.INTEGER, allowNull: false },

    maintenance_mode: { type: DataTypes.BOOLEAN, allowNull: false },
    allow_registration: { type: DataTypes.BOOLEAN, allowNull: false },
    require_email_verification: { type: DataTypes.BOOLEAN, allowNull: false },

    password_min_length: { type: DataTypes.INTEGER, allowNull: false },
    session_timeout_minutes: { type: DataTypes.INTEGER, allowNull: false },

    email_from: { type: DataTypes.TEXT, allowNull: false },
    email_provider: { type: DataTypes.STRING(16), allowNull: false },
    email_host: { type: DataTypes.TEXT, allowNull: false },
    email_port: { type: DataTypes.INTEGER, allowNull: false },
    email_username: { type: DataTypes.TEXT, allowNull: false },
    email_use_tls: { type: DataTypes.BOOLEAN, allowNull: false },
    smtp_encryption: { type: DataTypes.STRING(8), allowNull: false },

    feature_two_factor: { type: DataTypes.BOOLEAN, allowNull: false },
    feature_social_login: { type: DataTypes.BOOLEAN, allowNull: false },
    feature_live_stream: { type: DataTypes.BOOLEAN, allowNull: false },
    feature_chat: { type: DataTypes.BOOLEAN, allowNull: false },
    feature_forums: { type: DataTypes.BOOLEAN, allowNull: false },
    enable_course_reviews: { type: DataTypes.BOOLEAN, allowNull: false },
    enable_user_profiles: { type: DataTypes.BOOLEAN, allowNull: false },

    api_rate_limit: { type: DataTypes.INTEGER, allowNull: false },
    api_rate_limit_window: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'system_settings',
    timestamps: true,
    underscored: true,
  }
);

const SystemSettingModel = SystemSetting as unknown as ModelStatic<any>;
export default exportModel(SystemSettingModel);
