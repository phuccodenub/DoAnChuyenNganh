import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { UserActivityLogInstance } from '../types/model.types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const UserActivityLog = sequelize.define('UserActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' },
    onDelete: 'SET NULL'
  },
  activity_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  activity_description: DataTypes.TEXT,
  ip_address: DataTypes.STRING(45),
  user_agent: DataTypes.TEXT,
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'user_activity_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['activity_type'] },
    { fields: ['created_at'] }
  ]
});

const UserActivityLogModel = UserActivityLog as unknown as ModelStatic<UserActivityLogInstance>;
export default exportModel(UserActivityLogModel);







