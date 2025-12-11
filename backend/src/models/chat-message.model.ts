import { DataTypes, Op } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { ChatMessageInstance } from '../types/model.types';
import { exportModel, addStaticMethods, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  // Supabase uses 'user_id' instead of 'sender_id'
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  // Supabase uses 'content' instead of 'message'
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  message_type: {
    type: DataTypes.ENUM('text', 'file', 'image', 'system', 'announcement'),
    defaultValue: 'text',
  },
  // Supabase uses attachment_* prefix
  attachment_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  attachment_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  attachment_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  attachment_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  // Supabase uses 'reply_to_message_id'
  reply_to_message_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'chat_messages',
      key: 'id'
    }
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  edited_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pinned_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  pinned_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reactions: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'chat_messages',
  timestamps: true,
  underscored: true,
});

const ChatMessageModel = ChatMessage as unknown as ModelStatic<ChatMessageInstance>;

// Static Methods (type-safe)
addStaticMethods(ChatMessageModel, {
  async searchInCourse(this: ModelStatic<ChatMessageInstance>, courseId: string, searchTerm: string) {
    return await this.findAll({
      where: {
        course_id: courseId,
        content: {
          [Op.iLike]: `%${searchTerm}%`
        },
        is_deleted: false
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });
  }
});

export default exportModel(ChatMessageModel);


