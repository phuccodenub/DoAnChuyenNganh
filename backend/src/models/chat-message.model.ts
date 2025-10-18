import { DataTypes, Op } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class ChatMessage extends Model {
  declare id: string;
  declare course_id: string;
  declare sender_id: string;
  declare message: string;
  declare message_type: 'text' | 'file' | 'image' | 'system' | 'announcement';
  declare file_url: string | null;
  declare file_name: string | null;
  declare file_size: number | null;
  declare reply_to: string | null;
  declare is_edited: boolean;
  declare edited_at: Date | null;
  declare is_deleted: boolean;
  declare deleted_at: Date | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (ChatMessage as any).belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    (ChatMessage as any).belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
    (ChatMessage as any).belongsTo(ChatMessage, { foreignKey: 'reply_to', as: 'replyToMessage' });
  }

  static async searchInCourse(courseId: string, searchTerm: string) {
    return await (this as any).findAll({
      where: {
        course_id: courseId,
        message: {
          [Op.iLike]: `%${searchTerm}%`
        },
        is_deleted: false
      },
      include: [
        {
          model: sequelize.models.User as any,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });
  }
}

(ChatMessage as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' }
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    message_type: {
      type: DataTypes.ENUM('text', 'file', 'image', 'system', 'announcement'),
      defaultValue: 'text'
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reply_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'chat_messages', key: 'id' }
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'chat_messages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default ChatMessage;
