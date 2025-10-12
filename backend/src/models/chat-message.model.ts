import { DataTypes } from 'sequelize';
import { getSequelize } from '../config/db';

const sequelize = getSequelize();

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
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  message_type: {
    type: DataTypes.ENUM('text', 'file', 'image', 'system', 'announcement'),
    defaultValue: 'text',
  },
  file_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reply_to: {
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
}, {
  tableName: 'chat_messages',
  timestamps: true,
  underscored: true,
});

// Add search method
ChatMessage.searchInCourse = async function(courseId: string, searchTerm: string) {
  return await this.findAll({
    where: {
      course_id: courseId,
      message: {
        [sequelize.Sequelize.Op.iLike]: `%${searchTerm}%`
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
};

export default ChatMessage;
