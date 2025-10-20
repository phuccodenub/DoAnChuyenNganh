/**
 * Seeder 004: Seed chat messages
 */

import { Sequelize, QueryTypes } from 'sequelize';

export async function seedChatMessages(sequelize: Sequelize): Promise<void> {
  // Helper function to ensure all required fields are present
  const ensureChatMessageFields = (message: any) => {
    return {
      id: message.id,
      course_id: message.course_id,
      user_id: message.user_id,
      message_type: message.message_type,
      content: message.content,
      reply_to_message_id: message.reply_to_message_id || null,
      is_pinned: message.is_pinned || false,
      pinned_at: message.pinned_at || null,
      pinned_by: message.pinned_by || null,
      created_at: message.created_at,
      updated_at: message.updated_at
    };
  };

  const chatMessages = [
    // Course 1 (React Development) messages
    {
      id: '00000000-0000-0000-0000-000000000301',
      course_id: '00000000-0000-0000-0000-000000000101',
      user_id: '00000000-0000-0000-0000-000000000003',
      message_type: 'system',
      content: 'Welcome to the Complete React Development Course! Feel free to ask questions and interact with other students.',
      reply_to_message_id: null,
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date('2024-01-15T10:00:00'),
      updated_at: new Date('2024-01-15T10:00:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000302',
      course_id: '00000000-0000-0000-0000-000000000101',
      user_id: '00000000-0000-0000-0000-000000000006',
      message_type: 'text',
      content: 'Hello everyone! I\'m excited to start learning React. Any tips for beginners?',
      reply_to_message_id: null,
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date('2024-01-15T10:05:00'),
      updated_at: new Date('2024-01-15T10:05:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000303',
      course_id: '00000000-0000-0000-0000-000000000101',
      user_id: '00000000-0000-0000-0000-000000000003',
      message_type: 'text',
      content: 'Welcome Alice! My best tip is to practice with small projects and don\'t rush through the concepts. Take your time to understand each topic.',
      reply_to_message_id: '00000000-0000-0000-0000-000000000302',
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date('2024-01-15T10:07:00'),
      updated_at: new Date('2024-01-15T10:07:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000304',
      course_id: '00000000-0000-0000-0000-000000000101',
      user_id: '00000000-0000-0000-0000-000000000007',
      message_type: 'text',
      content: 'I agree with John! Also, make sure to build projects alongside the course. It really helps solidify the concepts.',
      reply_to_message_id: '00000000-0000-0000-0000-000000000302',
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date('2024-01-15T10:10:00'),
      updated_at: new Date('2024-01-15T10:10:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000305',
      course_id: '00000000-0000-0000-0000-000000000101',
      user_id: '00000000-0000-0000-0000-000000000003',
      message_type: 'announcement',
      content: '📢 New lesson uploaded: "React Hooks Deep Dive". Check it out in the course content!',
      is_pinned: true,
      pinned_at: new Date('2024-01-15T11:00:00'),
      pinned_by: '00000000-0000-0000-0000-000000000003',
      created_at: new Date('2024-01-15T11:00:00'),
      updated_at: new Date('2024-01-15T11:00:00')
    },
    // Course 2 (Node.js Backend) messages
    {
      id: '00000000-0000-0000-0000-000000000306',
      course_id: '00000000-0000-0000-0000-000000000102',
      user_id: '00000000-0000-0000-0000-000000000004',
      message_type: 'system',
      content: 'Welcome to the Node.js Backend Development Course! Let\'s build amazing backend applications together.',
      reply_to_message_id: null,
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date('2024-02-01T09:00:00'),
      updated_at: new Date('2024-02-01T09:00:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000307',
      course_id: '00000000-0000-0000-0000-000000000102',
      user_id: '00000000-0000-0000-0000-000000000008',
      message_type: 'text',
      content: 'Hi Jane! I have some experience with frontend development. Will this course be suitable for me?',
      reply_to_message_id: null,
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      created_at: new Date('2024-02-01T09:15:00'),
      updated_at: new Date('2024-02-01T09:15:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000308',
      course_id: '00000000-0000-0000-0000-000000000102',
      user_id: '00000000-0000-0000-0000-000000000004',
      message_type: 'text',
      content: 'Absolutely! Having frontend experience is actually a great advantage. You\'ll understand how the frontend and backend work together.',
      reply_to_message_id: '00000000-0000-0000-0000-000000000307',
      created_at: new Date('2024-02-01T09:18:00'),
      updated_at: new Date('2024-02-01T09:18:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000309',
      course_id: '00000000-0000-0000-0000-000000000102',
      user_id: '00000000-0000-0000-0000-000000000009',
      message_type: 'text',
      content: 'I just completed this course last month. It\'s fantastic! The projects are really well designed.',
      created_at: new Date('2024-02-01T09:25:00'),
      updated_at: new Date('2024-02-01T09:25:00')
    },
    // Course 3 (Machine Learning) messages
    {
      id: '00000000-0000-0000-0000-000000000310',
      course_id: '00000000-0000-0000-0000-000000000103',
      user_id: '00000000-0000-0000-0000-000000000005',
      message_type: 'system',
      content: 'Welcome to Machine Learning Fundamentals! Get ready to dive into the world of AI and data science.',
      created_at: new Date('2024-02-15T08:00:00'),
      updated_at: new Date('2024-02-15T08:00:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000311',
      course_id: '00000000-0000-0000-0000-000000000103',
      user_id: '00000000-0000-0000-0000-000000000007',
      message_type: 'text',
      content: 'Hello Mike! I\'m new to machine learning. Do I need to be good at math to follow this course?',
      created_at: new Date('2024-02-15T08:10:00'),
      updated_at: new Date('2024-02-15T08:10:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000312',
      course_id: '00000000-0000-0000-0000-000000000103',
      user_id: '00000000-0000-0000-0000-000000000005',
      message_type: 'text',
      content: 'Great question! Basic math knowledge is helpful, but I\'ll explain all the mathematical concepts step by step. Don\'t worry if you\'re not a math expert.',
      reply_to_message_id: '00000000-0000-0000-0000-000000000311',
      created_at: new Date('2024-02-15T08:15:00'),
      updated_at: new Date('2024-02-15T08:15:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000313',
      course_id: '00000000-0000-0000-0000-000000000103',
      user_id: '00000000-0000-0000-0000-000000000010',
      message_type: 'text',
      content: 'I\'m really enjoying the practical examples in this course. The datasets are very interesting!',
      created_at: new Date('2024-02-15T08:20:00'),
      updated_at: new Date('2024-02-15T08:20:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000314',
      course_id: '00000000-0000-0000-0000-000000000103',
      user_id: '00000000-0000-0000-0000-000000000005',
      message_type: 'announcement',
      content: '🎉 Congratulations to all students who completed the first project! Great work everyone!',
      is_pinned: true,
      pinned_at: new Date('2024-02-20T10:00:00'),
      pinned_by: '00000000-0000-0000-0000-000000000005',
      created_at: new Date('2024-02-20T10:00:00'),
      updated_at: new Date('2024-02-20T10:00:00')
    },
    // Course 4 (Free JavaScript) messages
    {
      id: '00000000-0000-0000-0000-000000000315',
      course_id: '00000000-0000-0000-0000-000000000104',
      user_id: '00000000-0000-0000-0000-000000000003',
      message_type: 'system',
      content: 'Welcome to JavaScript Basics! This is a free course to help you get started with programming.',
      created_at: new Date('2024-01-01T12:00:00'),
      updated_at: new Date('2024-01-01T12:00:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000316',
      course_id: '00000000-0000-0000-0000-000000000104',
      user_id: '00000000-0000-0000-0000-000000000006',
      message_type: 'text',
      content: 'Thank you for making this course free! It\'s really helpful for beginners like me.',
      created_at: new Date('2024-01-01T12:30:00'),
      updated_at: new Date('2024-01-01T12:30:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000317',
      course_id: '00000000-0000-0000-0000-000000000104',
      user_id: '00000000-0000-0000-0000-000000000009',
      message_type: 'text',
      content: 'I completed this course and now I\'m ready for more advanced topics. Highly recommended!',
      created_at: new Date('2024-01-01T13:00:00'),
      updated_at: new Date('2024-01-01T13:00:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000318',
      course_id: '00000000-0000-0000-0000-000000000104',
      user_id: '00000000-0000-0000-0000-000000000010',
      message_type: 'text',
      content: 'The exercises are really well designed. I\'m learning so much!',
      created_at: new Date('2024-01-01T13:15:00'),
      updated_at: new Date('2024-01-01T13:15:00')
    },
    // Course 5 (Advanced React) messages
    {
      id: '00000000-0000-0000-0000-000000000319',
      course_id: '00000000-0000-0000-0000-000000000105',
      user_id: '00000000-0000-0000-0000-000000000004',
      message_type: 'system',
      content: 'Welcome to Advanced React Patterns! This course is for developers who want to take their React skills to the next level.',
      created_at: new Date('2024-03-01T14:00:00'),
      updated_at: new Date('2024-03-01T14:00:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000320',
      course_id: '00000000-0000-0000-0000-000000000105',
      user_id: '00000000-0000-0000-0000-000000000008',
      message_type: 'text',
      content: 'Hi Jane! I\'m excited to learn advanced patterns. The course description looks very comprehensive.',
      created_at: new Date('2024-03-01T14:10:00'),
      updated_at: new Date('2024-03-01T14:10:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000321',
      course_id: '00000000-0000-0000-0000-000000000105',
      user_id: '00000000-0000-0000-0000-000000000004',
      message_type: 'text',
      content: 'Welcome Carol! We\'ll cover some really powerful patterns that will make your React applications more maintainable and performant.',
      reply_to_message_id: '00000000-0000-0000-0000-000000000320',
      created_at: new Date('2024-03-01T14:15:00'),
      updated_at: new Date('2024-03-01T14:15:00')
    },
    {
      id: '00000000-0000-0000-0000-000000000322',
      course_id: '00000000-0000-0000-0000-000000000105',
      user_id: '00000000-0000-0000-0000-000000000004',
      message_type: 'announcement',
      content: '📚 New resource added: "React Performance Optimization Cheat Sheet". Check the resources section!',
      is_pinned: true,
      pinned_at: new Date('2024-03-05T16:00:00'),
      pinned_by: '00000000-0000-0000-0000-000000000004',
      created_at: new Date('2024-03-05T16:00:00'),
      updated_at: new Date('2024-03-05T16:00:00')
    }
  ];

  // Insert chat messages
  for (const message of chatMessages) {
    const completeMessage = ensureChatMessageFields(message);
    // Check if message already exists
    const existingMessage = await sequelize.query(
      'SELECT id FROM chat_messages WHERE id = ?',
      {
        replacements: [message.id],
        type: QueryTypes.SELECT
      }
    );

    if (existingMessage.length > 0) {
      console.log(`Chat message ${message.id} already exists, skipping...`);
      continue;
    }

    await sequelize.query(
      `INSERT INTO chat_messages (
        id, course_id, user_id, message_type, content, reply_to_message_id,
        is_pinned, pinned_at, pinned_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          completeMessage.id, completeMessage.course_id, completeMessage.user_id, completeMessage.message_type,
          completeMessage.content, completeMessage.reply_to_message_id, completeMessage.is_pinned,
          completeMessage.pinned_at, completeMessage.pinned_by, completeMessage.created_at, completeMessage.updated_at
        ]
      }
    );
  }
}

