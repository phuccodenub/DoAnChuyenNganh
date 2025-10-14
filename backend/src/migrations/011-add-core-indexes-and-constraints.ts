import { QueryInterface } from 'sequelize';

async function safeAddIndex(
  qi: QueryInterface,
  table: string,
  fields: string[],
  options: any = {}
) {
  try {
    await qi.addIndex(table, fields, options);
  } catch (e: any) {
    // 42P07: relation already exists (index exists)
    if (e && (e.code === '42P07' || /already exists/i.test(String(e)))) {
      return;
    }
    throw e;
  }
}

async function safeAddConstraint(
  qi: QueryInterface,
  table: string,
  options: any
) {
  try {
    await qi.addConstraint(table, options);
  } catch (e: any) {
    if (e && (e.code === '42P07' || /already exists/i.test(String(e)))) {
      return;
    }
    throw e;
  }
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Users table indexes/constraints
  await safeAddIndex(queryInterface, 'users', ['username'], { name: 'ux_users_username', unique: true });
  await safeAddIndex(queryInterface, 'users', ['email'], { name: 'ux_users_email', unique: true });
  await safeAddIndex(queryInterface, 'users', ['student_id'], { name: 'ux_users_student_id', unique: true });
  await safeAddIndex(queryInterface, 'users', ['instructor_id'], { name: 'ux_users_instructor_id', unique: true });
  await safeAddIndex(queryInterface, 'users', ['role']);
  await safeAddIndex(queryInterface, 'users', ['status']);

  // Enrollments: unique (course_id, user_id) and helper indexes
  await safeAddConstraint(queryInterface, 'enrollments', {
    fields: ['course_id', 'user_id'],
    type: 'unique',
    name: 'ux_enrollments_course_user'
  });
  await safeAddIndex(queryInterface, 'enrollments', ['user_id']);
  await safeAddIndex(queryInterface, 'enrollments', ['course_id']);
  await safeAddIndex(queryInterface, 'enrollments', ['status']);

  // Chat messages helper indexes (idempotent with different names)
  await safeAddIndex(queryInterface, 'chat_messages', ['course_id'], { name: 'ix_chat_messages_course_id' });
  await safeAddIndex(queryInterface, 'chat_messages', ['user_id'], { name: 'ix_chat_messages_user_id' });
  await safeAddIndex(queryInterface, 'chat_messages', ['created_at'], { name: 'ix_chat_messages_created_at' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Users
  try { await queryInterface.removeIndex('users', 'ux_users_username'); } catch {}
  try { await queryInterface.removeIndex('users', 'ux_users_email'); } catch {}
  try { await queryInterface.removeIndex('users', 'ux_users_student_id'); } catch {}
  try { await queryInterface.removeIndex('users', 'ux_users_instructor_id'); } catch {}
  // unnamed role/status indexes cannot be reliably removed

  // Enrollments
  try { await queryInterface.removeConstraint('enrollments', 'ux_enrollments_course_user'); } catch {}
  try { await queryInterface.removeIndex('enrollments', ['user_id']); } catch {}
  try { await queryInterface.removeIndex('enrollments', ['course_id']); } catch {}
  try { await queryInterface.removeIndex('enrollments', ['status']); } catch {}

  // Chat messages
  try { await queryInterface.removeIndex('chat_messages', 'ix_chat_messages_course_id'); } catch {}
  try { await queryInterface.removeIndex('chat_messages', 'ix_chat_messages_user_id'); } catch {}
  try { await queryInterface.removeIndex('chat_messages', 'ix_chat_messages_created_at'); } catch {}
}


