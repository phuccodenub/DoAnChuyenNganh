/**
 * Migration 032: Redesign Conversations for Admin Support
 * 
 * Changes:
 * - Rename student_id → user1_id
 * - Rename instructor_id → user2_id
 * - Rename student_last_read_at → user1_last_read_at
 * - Rename instructor_last_read_at → user2_last_read_at
 * - Rename is_archived_by_student → is_archived_by_user1
 * - Rename is_archived_by_instructor → is_archived_by_user2
 * 
 * This allows ANY user (student/instructor/admin) to chat with ANY user
 */

import { QueryInterface, DataTypes, QueryTypes, Op } from 'sequelize';

async function columnExists(
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string
): Promise<boolean> {
  const results = await queryInterface.sequelize.query(
    `SELECT column_name 
     FROM information_schema.columns 
     WHERE table_name = '${tableName}' AND column_name = '${columnName}'`,
    { type: QueryTypes.SELECT }
  ) as { column_name: string }[];
  return results.length > 0;
}

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const tableName = 'conversations';

  // Check if already migrated
  if (await columnExists(queryInterface, tableName, 'user1_id')) {
    console.log('Conversations table already redesigned, skipping...');
    return;
  }

  console.log('Starting conversations table redesign...');

  // 1. Drop old constraints/indexes first
  try {
    await queryInterface.removeConstraint(tableName, 'conversations_course_id_student_id_instructor_id_key');
  } catch (e) {
    console.log('Old unique constraint not found, continuing...');
  }

  try {
    await queryInterface.removeIndex(tableName, 'conversations_student_id');
  } catch (e) {
    console.log('Index conversations_student_id not found');
  }

  try {
    await queryInterface.removeIndex(tableName, 'conversations_instructor_id');
  } catch (e) {
    console.log('Index conversations_instructor_id not found');
  }

  try {
    await queryInterface.removeIndex(tableName, 'conversations_course_id_student_id_instructor_id');
  } catch (e) {
    console.log('Composite index not found');
  }

  // 2. Rename columns
  if (await columnExists(queryInterface, tableName, 'student_id')) {
    await queryInterface.renameColumn(tableName, 'student_id', 'user1_id');
    console.log('✓ Renamed student_id → user1_id');
  }

  if (await columnExists(queryInterface, tableName, 'instructor_id')) {
    await queryInterface.renameColumn(tableName, 'instructor_id', 'user2_id');
    console.log('✓ Renamed instructor_id → user2_id');
  }

  if (await columnExists(queryInterface, tableName, 'student_last_read_at')) {
    await queryInterface.renameColumn(tableName, 'student_last_read_at', 'user1_last_read_at');
    console.log('✓ Renamed student_last_read_at → user1_last_read_at');
  }

  if (await columnExists(queryInterface, tableName, 'instructor_last_read_at')) {
    await queryInterface.renameColumn(tableName, 'instructor_last_read_at', 'user2_last_read_at');
    console.log('✓ Renamed instructor_last_read_at → user2_last_read_at');
  }

  if (await columnExists(queryInterface, tableName, 'is_archived_by_student')) {
    await queryInterface.renameColumn(tableName, 'is_archived_by_student', 'is_archived_by_user1');
    console.log('✓ Renamed is_archived_by_student → is_archived_by_user1');
  }

  if (await columnExists(queryInterface, tableName, 'is_archived_by_instructor')) {
    await queryInterface.renameColumn(tableName, 'is_archived_by_instructor', 'is_archived_by_user2');
    console.log('✓ Renamed is_archived_by_instructor → is_archived_by_user2');
  }

  // 3. Add new indexes
  await queryInterface.addIndex(tableName, ['user1_id'], {
    name: 'conversations_user1_id',
  });

  await queryInterface.addIndex(tableName, ['user2_id'], {
    name: 'conversations_user2_id',
  });

  // Unique constraint: prevent duplicate conversations
  // Note: We allow NULL course_id for general DMs
  await queryInterface.addIndex(tableName, ['user1_id', 'user2_id', 'course_id'], {
    unique: true,
    name: 'unique_conversation_per_users_course',
    where: {
      course_id: { [Op.ne]: null },
    },
  });

  console.log('✓ Conversations table redesign completed!');
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  const tableName = 'conversations';

  // Revert in reverse order
  if (await columnExists(queryInterface, tableName, 'user1_id')) {
    await queryInterface.removeIndex(tableName, 'conversations_user1_id');
    await queryInterface.removeIndex(tableName, 'conversations_user2_id');
    await queryInterface.removeIndex(tableName, 'unique_conversation_per_users_course');

    await queryInterface.renameColumn(tableName, 'user1_id', 'student_id');
    await queryInterface.renameColumn(tableName, 'user2_id', 'instructor_id');
    await queryInterface.renameColumn(tableName, 'user1_last_read_at', 'student_last_read_at');
    await queryInterface.renameColumn(tableName, 'user2_last_read_at', 'instructor_last_read_at');
    await queryInterface.renameColumn(tableName, 'is_archived_by_user1', 'is_archived_by_student');
    await queryInterface.renameColumn(tableName, 'is_archived_by_user2', 'is_archived_by_instructor');

    // Restore old indexes
    await queryInterface.addIndex(tableName, ['student_id']);
    await queryInterface.addIndex(tableName, ['instructor_id']);
  }
};
