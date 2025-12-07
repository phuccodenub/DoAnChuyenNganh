/**
 * Seeder 006: Seed direct messages between users
 * 
 * Creates DM conversations and messages between:
 * - admin@example.com (admin)
 * - instructor1@example.com (instructor)
 * - student1@example.com (student)
 * 
 * Uses RFC 4122 compliant UUIDs (Version 4)
 */

import { Sequelize, QueryTypes } from 'sequelize';

// User IDs from 001-seed-users.ts (keeping existing format for compatibility)
const ADMIN_ID = '00000000-0000-0000-0000-000000000002';
const INSTRUCTOR1_ID = '00000000-0000-0000-0000-000000000003';
const STUDENT1_ID = '00000000-0000-0000-0000-000000000006';

// Valid UUID v4 format for conversations: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
// where y is 8, 9, a, or b
const CONV_ADMIN_INSTRUCTOR = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const CONV_ADMIN_STUDENT = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
const CONV_INSTRUCTOR_STUDENT = 'c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f';

// Message IDs (UUID v4 format)
const MSG_IDS = {
  // Admin <-> Instructor conversation
  msg01: 'd4e5f6a7-b8c9-4d0e-9f2a-3b4c5d6e7f8a',
  msg02: 'e5f6a7b8-c9d0-4e1f-8a3b-4c5d6e7f8a9b',
  msg03: 'f6a7b8c9-d0e1-4f2a-9b4c-5d6e7f8a9b0c',
  msg04: 'a7b8c9d0-e1f2-4a3b-8c5d-6e7f8a9b0c1d',
  msg05: 'b8c9d0e1-f2a3-4b4c-9d6e-7f8a9b0c1d2e',
  msg06: 'c9d0e1f2-a3b4-4c5d-8e7f-8a9b0c1d2e3f',
  // Admin <-> Student conversation
  msg07: 'd0e1f2a3-b4c5-4d6e-9f8a-9b0c1d2e3f4a',
  msg08: 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b',
  msg09: 'f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c',
  msg10: 'a3b4c5d6-e7f8-4a9b-8c1d-2e3f4a5b6c7d',
  msg11: 'b4c5d6e7-f8a9-4b0c-9d2e-3f4a5b6c7d8e',
  msg12: 'c5d6e7f8-a9b0-4c1d-8e3f-4a5b6c7d8e9f',
  // Instructor <-> Student conversation
  msg13: 'd6e7f8a9-b0c1-4d2e-9f4a-5b6c7d8e9f0a',
  msg14: 'e7f8a9b0-c1d2-4e3f-8a5b-6c7d8e9f0a1b',
  msg15: 'f8a9b0c1-d2e3-4f4a-9b6c-7d8e9f0a1b2c',
  msg16: 'a9b0c1d2-e3f4-4a5b-8c7d-8e9f0a1b2c3d',
  msg17: 'b0c1d2e3-f4a5-4b6c-9d8e-9f0a1b2c3d4e',
  msg18: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
  msg19: 'd2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a',
  msg20: 'e3f4a5b6-c7d8-4e9f-8a1b-2c3d4e5f6a7b',
};

export async function seedDirectMessages(sequelize: Sequelize): Promise<void> {
  // Create conversations (direct messages without course_id)
  const conversations = [
    // Conversation between Admin and Instructor1
    {
      id: CONV_ADMIN_INSTRUCTOR,
      course_id: null,
      user1_id: ADMIN_ID,
      user2_id: INSTRUCTOR1_ID,
      last_message_at: new Date('2024-03-15T14:30:00'),
      user1_last_read_at: new Date('2024-03-15T14:30:00'),
      user2_last_read_at: new Date('2024-03-15T14:25:00'),
      is_archived_by_user1: false,
      is_archived_by_user2: false,
      created_at: new Date('2024-03-10T10:00:00'),
      updated_at: new Date('2024-03-15T14:30:00'),
    },
    // Conversation between Admin and Student1
    {
      id: CONV_ADMIN_STUDENT,
      course_id: null,
      user1_id: ADMIN_ID,
      user2_id: STUDENT1_ID,
      last_message_at: new Date('2024-03-14T16:45:00'),
      user1_last_read_at: new Date('2024-03-14T16:45:00'),
      user2_last_read_at: new Date('2024-03-14T16:45:00'),
      is_archived_by_user1: false,
      is_archived_by_user2: false,
      created_at: new Date('2024-03-12T09:00:00'),
      updated_at: new Date('2024-03-14T16:45:00'),
    },
    // Conversation between Instructor1 and Student1
    {
      id: CONV_INSTRUCTOR_STUDENT,
      course_id: null,
      user1_id: INSTRUCTOR1_ID,
      user2_id: STUDENT1_ID,
      last_message_at: new Date('2024-03-15T11:20:00'),
      user1_last_read_at: new Date('2024-03-15T11:20:00'),
      user2_last_read_at: new Date('2024-03-15T11:15:00'),
      is_archived_by_user1: false,
      is_archived_by_user2: false,
      created_at: new Date('2024-03-11T14:00:00'),
      updated_at: new Date('2024-03-15T11:20:00'),
    },
  ];

  // Direct messages
  const messages = [
    // Admin <-> Instructor1 conversation
    {
      id: MSG_IDS.msg01,
      conversation_id: CONV_ADMIN_INSTRUCTOR,
      sender_id: ADMIN_ID,
      content: 'Xin chào thầy John, tôi muốn hỏi về lịch dạy tuần tới.',
      is_read: true,
      read_at: new Date('2024-03-10T10:05:00'),
      created_at: new Date('2024-03-10T10:00:00'),
      updated_at: new Date('2024-03-10T10:00:00'),
    },
    {
      id: MSG_IDS.msg02,
      conversation_id: CONV_ADMIN_INSTRUCTOR,
      sender_id: INSTRUCTOR1_ID,
      content: 'Chào Admin! Tuần tới tôi có lịch dạy React vào thứ 2, 4, 6 từ 8h-10h ạ.',
      is_read: true,
      read_at: new Date('2024-03-10T10:15:00'),
      created_at: new Date('2024-03-10T10:10:00'),
      updated_at: new Date('2024-03-10T10:10:00'),
    },
    {
      id: MSG_IDS.msg03,
      conversation_id: CONV_ADMIN_INSTRUCTOR,
      sender_id: ADMIN_ID,
      content: 'Được rồi, cảm ơn thầy. Tôi sẽ cập nhật vào hệ thống.',
      is_read: true,
      read_at: new Date('2024-03-10T10:25:00'),
      created_at: new Date('2024-03-10T10:20:00'),
      updated_at: new Date('2024-03-10T10:20:00'),
    },
    {
      id: MSG_IDS.msg04,
      conversation_id: CONV_ADMIN_INSTRUCTOR,
      sender_id: INSTRUCTOR1_ID,
      content: 'Admin ơi, tôi có thể bổ sung thêm 1 buổi vào thứ 7 được không?',
      is_read: true,
      read_at: new Date('2024-03-15T14:15:00'),
      created_at: new Date('2024-03-15T14:10:00'),
      updated_at: new Date('2024-03-15T14:10:00'),
    },
    {
      id: MSG_IDS.msg05,
      conversation_id: CONV_ADMIN_INSTRUCTOR,
      sender_id: ADMIN_ID,
      content: 'Để tôi kiểm tra phòng học thứ 7 nhé. Thầy muốn dạy khung giờ nào?',
      is_read: true,
      read_at: new Date('2024-03-15T14:25:00'),
      created_at: new Date('2024-03-15T14:20:00'),
      updated_at: new Date('2024-03-15T14:20:00'),
    },
    {
      id: MSG_IDS.msg06,
      conversation_id: CONV_ADMIN_INSTRUCTOR,
      sender_id: INSTRUCTOR1_ID,
      content: 'Từ 9h-11h thì tốt nhất ạ. Cảm ơn Admin!',
      is_read: false,
      read_at: null,
      created_at: new Date('2024-03-15T14:30:00'),
      updated_at: new Date('2024-03-15T14:30:00'),
    },

    // Admin <-> Student1 conversation
    {
      id: MSG_IDS.msg07,
      conversation_id: CONV_ADMIN_STUDENT,
      sender_id: STUDENT1_ID,
      content: 'Em chào Admin, em muốn hỏi về cách reset mật khẩu tài khoản ạ.',
      is_read: true,
      read_at: new Date('2024-03-12T09:10:00'),
      created_at: new Date('2024-03-12T09:00:00'),
      updated_at: new Date('2024-03-12T09:00:00'),
    },
    {
      id: MSG_IDS.msg08,
      conversation_id: CONV_ADMIN_STUDENT,
      sender_id: ADMIN_ID,
      content: 'Chào Alice! Em có thể vào trang Quên mật khẩu để reset nhé. Hoặc Admin có thể reset giúp em.',
      is_read: true,
      read_at: new Date('2024-03-12T09:20:00'),
      created_at: new Date('2024-03-12T09:15:00'),
      updated_at: new Date('2024-03-12T09:15:00'),
    },
    {
      id: MSG_IDS.msg09,
      conversation_id: CONV_ADMIN_STUDENT,
      sender_id: STUDENT1_ID,
      content: 'Dạ em đã thử nhưng không nhận được email. Admin reset giúp em được không ạ?',
      is_read: true,
      read_at: new Date('2024-03-12T09:30:00'),
      created_at: new Date('2024-03-12T09:25:00'),
      updated_at: new Date('2024-03-12T09:25:00'),
    },
    {
      id: MSG_IDS.msg10,
      conversation_id: CONV_ADMIN_STUDENT,
      sender_id: ADMIN_ID,
      content: 'OK, Admin đã reset mật khẩu mới cho em là: NewPass123! Em đăng nhập và đổi mật khẩu mới nhé.',
      is_read: true,
      read_at: new Date('2024-03-12T09:40:00'),
      created_at: new Date('2024-03-12T09:35:00'),
      updated_at: new Date('2024-03-12T09:35:00'),
    },
    {
      id: MSG_IDS.msg11,
      conversation_id: CONV_ADMIN_STUDENT,
      sender_id: STUDENT1_ID,
      content: 'Em đăng nhập được rồi ạ! Cảm ơn Admin nhiều!',
      is_read: true,
      read_at: new Date('2024-03-14T16:45:00'),
      created_at: new Date('2024-03-14T16:40:00'),
      updated_at: new Date('2024-03-14T16:40:00'),
    },
    {
      id: MSG_IDS.msg12,
      conversation_id: CONV_ADMIN_STUDENT,
      sender_id: STUDENT1_ID,
      content: 'Em cảm ơn Admin nhiều ạ!',
      is_read: true,
      read_at: new Date('2024-03-14T16:50:00'),
      created_at: new Date('2024-03-14T16:45:00'),
      updated_at: new Date('2024-03-14T16:45:00'),
    },

    // Instructor1 <-> Student1 conversation
    {
      id: MSG_IDS.msg13,
      conversation_id: CONV_INSTRUCTOR_STUDENT,
      sender_id: STUDENT1_ID,
      content: 'Em chào thầy John! Em có thắc mắc về bài học React Hooks ạ.',
      is_read: true,
      read_at: new Date('2024-03-11T14:10:00'),
      created_at: new Date('2024-03-11T14:00:00'),
      updated_at: new Date('2024-03-11T14:00:00'),
    },
    {
      id: MSG_IDS.msg14,
      conversation_id: CONV_INSTRUCTOR_STUDENT,
      sender_id: INSTRUCTOR1_ID,
      content: 'Chào Alice! Em cứ hỏi đi, thầy sẽ giải đáp cho em.',
      is_read: true,
      read_at: new Date('2024-03-11T14:20:00'),
      created_at: new Date('2024-03-11T14:15:00'),
      updated_at: new Date('2024-03-11T14:15:00'),
    },
    {
      id: MSG_IDS.msg15,
      conversation_id: CONV_INSTRUCTOR_STUDENT,
      sender_id: STUDENT1_ID,
      content: 'Em không hiểu lắm về useEffect cleanup function. Khi nào thì nên sử dụng ạ?',
      is_read: true,
      read_at: new Date('2024-03-11T14:30:00'),
      created_at: new Date('2024-03-11T14:25:00'),
      updated_at: new Date('2024-03-11T14:25:00'),
    },
    {
      id: MSG_IDS.msg16,
      conversation_id: CONV_INSTRUCTOR_STUDENT,
      sender_id: INSTRUCTOR1_ID,
      content: 'Cleanup function dùng để dọn dẹp các side effects như event listeners, timers, hoặc subscriptions khi component unmount hoặc trước khi effect chạy lại.',
      is_read: true,
      read_at: new Date('2024-03-11T14:40:00'),
      created_at: new Date('2024-03-11T14:35:00'),
      updated_at: new Date('2024-03-11T14:35:00'),
    },
    {
      id: MSG_IDS.msg17,
      conversation_id: CONV_INSTRUCTOR_STUDENT,
      sender_id: INSTRUCTOR1_ID,
      content: 'Ví dụ: nếu em addEventListener thì cần removeEventListener trong cleanup. Tránh memory leak.',
      is_read: true,
      read_at: new Date('2024-03-11T14:45:00'),
      created_at: new Date('2024-03-11T14:40:00'),
      updated_at: new Date('2024-03-11T14:40:00'),
    },
    {
      id: MSG_IDS.msg18,
      conversation_id: CONV_INSTRUCTOR_STUDENT,
      sender_id: STUDENT1_ID,
      content: 'Em hiểu rồi ạ! Cảm ơn thầy rất nhiều. Em sẽ thử áp dụng vào bài tập.',
      is_read: true,
      read_at: new Date('2024-03-11T14:55:00'),
      created_at: new Date('2024-03-11T14:50:00'),
      updated_at: new Date('2024-03-11T14:50:00'),
    },
    {
      id: MSG_IDS.msg19,
      conversation_id: CONV_INSTRUCTOR_STUDENT,
      sender_id: INSTRUCTOR1_ID,
      content: 'Tốt lắm Alice! Em gửi link Github cho thầy nhé, thầy sẽ review và feedback.',
      is_read: true,
      read_at: new Date('2024-03-15T11:20:00'),
      created_at: new Date('2024-03-15T11:15:00'),
      updated_at: new Date('2024-03-15T11:15:00'),
    },
    {
      id: MSG_IDS.msg20,
      conversation_id: CONV_INSTRUCTOR_STUDENT,
      sender_id: STUDENT1_ID,
      content: 'Đây ạ thầy: https://github.com/alice/react-hooks-practice',
      is_read: false,
      read_at: null,
      created_at: new Date('2024-03-15T11:20:00'),
      updated_at: new Date('2024-03-15T11:20:00'),
    },
  ];

  // Check if conversations already exist
  const existingConvs = await sequelize.query(
    `SELECT id FROM conversations WHERE id IN (:ids)`,
    {
      replacements: { ids: conversations.map(c => c.id) },
      type: QueryTypes.SELECT,
    }
  ) as { id: string }[];

  // If any exist, clean them up first
  if (existingConvs.length > 0) {
    console.log(`Found ${existingConvs.length} existing conversations, cleaning up...`);
    
    // Delete messages from conversations being replaced
    const convIdsToDelete = existingConvs.map(c => c.id);
    await sequelize.query(
      `DELETE FROM direct_messages WHERE conversation_id IN (:ids)`,
      {
        replacements: { ids: convIdsToDelete },
        type: QueryTypes.DELETE,
      }
    );
    
    // Delete conversations
    await sequelize.query(
      `DELETE FROM conversations WHERE id IN (:ids)`,
      {
        replacements: { ids: convIdsToDelete },
        type: QueryTypes.DELETE,
      }
    );
    
    console.log('Cleaned up existing conversations and messages.');
  }

  console.log('Seeding direct message conversations...');

  // Insert conversations
  for (const conv of conversations) {
    await sequelize.query(
      `INSERT INTO conversations (
        id, course_id, user1_id, user2_id, last_message_at,
        user1_last_read_at, user2_last_read_at,
        is_archived_by_user1, is_archived_by_user2,
        created_at, updated_at
      ) VALUES (
        :id, :course_id, :user1_id, :user2_id, :last_message_at,
        :user1_last_read_at, :user2_last_read_at,
        :is_archived_by_user1, :is_archived_by_user2,
        :created_at, :updated_at
      )`,
      {
        replacements: conv,
        type: QueryTypes.INSERT,
      }
    );
  }

  console.log(`Inserted ${conversations.length} conversations`);

  // Insert messages
  for (const msg of messages) {
    await sequelize.query(
      `INSERT INTO direct_messages (
        id, conversation_id, sender_id, content, status,
        created_at, updated_at
      ) VALUES (
        :id, :conversation_id, :sender_id, :content, 'sent',
        :created_at, :updated_at
      )`,
      {
        replacements: {
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          content: msg.content,
          created_at: msg.created_at,
          updated_at: msg.updated_at,
        },
        type: QueryTypes.INSERT,
      }
    );
  }

  console.log(`Inserted ${messages.length} direct messages`);
  console.log('Direct messages seed completed!');
}

export default seedDirectMessages;
