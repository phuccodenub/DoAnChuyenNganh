import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '@config/db';

const sequelize = getSequelize();

class NotificationRecipient extends Model {
  declare id: string;
  declare notification_id: string;
  declare recipient_id: string;
  declare is_read: boolean;
  declare read_at: Date | null;
  declare is_archived: boolean;
  declare archived_at: Date | null;
  declare is_dismissed: boolean;
  declare dismissed_at: Date | null;
  declare clicked_at: Date | null;
  declare interaction_data: any | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (NotificationRecipient as any).belongsTo(models.Notification, { foreignKey: 'notification_id', as: 'notification' });
    (NotificationRecipient as any).belongsTo(models.User, { foreignKey: 'recipient_id', as: 'recipient' });
  }
}

(NotificationRecipient as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    notification_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'notifications', key: 'id' }
    },
    recipient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_dismissed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    dismissed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    clicked_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    interaction_data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'notification_recipients',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default NotificationRecipient;
