/**
 * Migrations Index
 * Centralized migration management
 */

import { Sequelize, QueryInterface } from 'sequelize';
import logger from '../utils/logger.util';

// Import migration files
import { createEnumTypes, dropEnumTypes } from './000-create-enum-types';
import { createUsersTable } from './001-create-users-table';
import { createCoursesTable } from './002-create-courses-table';
import { createEnrollmentsTable } from './003-create-enrollments-table';
import { createChatMessagesTable } from './004-create-chat-messages-table';
import { addIndexesToUsersTable } from './005-add-indexes-to-users-table';
import { addIndexesToCoursesTable } from './006-add-indexes-to-courses-table';
import { addIndexesToEnrollmentsTable } from './007-add-indexes-to-enrollments-table';
import { addIndexesToChatMessagesTable } from './008-add-indexes-to-chat-messages-table';
import { createExtendedLmsTables, dropExtendedLmsTables } from './009-create-extended-lms-tables';
import { addEmailVerifiedAt, removeEmailVerifiedAt } from './010-add-email-verified-at';
import { addUserProfileColumns, removeUserProfileColumns } from './011-add-user-profile-columns';
import { up as fixQuizAttemptsConstraint, down as revertQuizAttemptsConstraint } from './016-fix-quiz-attempts-constraint-final';
import { up as updateLiveSessionsSchema, down as revertLiveSessionsSchema } from './017-update-live-sessions-schema';
import { up as addLivestreamIngestType, down as revertLivestreamIngestType } from './018-add-livestream-ingest-type';
import { up as createLiveSessionMessagesTable, down as dropLiveSessionMessagesTable } from './019-create-live-session-messages-table';
import { up as createCommentModerationsTable, down as dropCommentModerationsTable } from './019a-create-comment-moderations-table';
import { up as addMessageContentToCommentModerations, down as removeMessageContentFromCommentModerations } from './020-add-message-content-to-comment-moderations';
import { up as allowNullMessageIdInCommentModerations, down as requireMessageIdInCommentModerations } from './021-allow-null-message-id-in-comment-moderations';
import { up as forceAllowNullMessageId, down as requireMessageIdAgain } from './022-force-allow-null-message-id';
import { up as createConversationsTable, down as dropConversationsTable } from './023-create-conversations-table';
import { up as createDirectMessagesTable, down as dropDirectMessagesTable } from './024-create-direct-messages-table';
import { up as addIsPracticeToQuizzesAssignments, down as removeIsPracticeFromQuizzesAssignments } from './025-add-is-practice-to-quizzes-assignments';
import { up as addLessonIdToQuizzesAssignments, down as removeLessonIdFromQuizzesAssignments } from './026-add-lesson-id-to-quizzes-assignments';
import { up as allowNullableCourseForQuizAssignment, down as revertNullableCourseForQuizAssignment } from './027-allow-nullable-course-for-quiz-assignment';
import { up as replaceLessonIdWithSectionIdInQuizzes, down as revertReplaceLessonIdWithSectionIdInQuizzes } from './028-replace-lesson-id-with-section-id-in-quizzes';
import { up as addSectionIdToAssignments, down as removeSectionIdFromAssignments } from './029-add-section-id-to-assignments';
import { up as createCertificatesTable, down as dropCertificatesTable } from './030-create-certificates-table';
import { up as makeIpfsHashNullable, down as revertIpfsHashNullable } from './031-make-ipfs-hash-nullable';
import { up as allowNullCourseIdConversations, down as revertNullCourseIdConversations } from './033-allow-null-course-id-conversations';
import { up as redesignConversationsForAdmin, down as revertConversationsDesign } from './034-redesign-conversations-for-admin';
import { up as createCoursePrerequisitesTable, down as dropCoursePrerequisitesTable } from './035-create-course-prerequisites-table';
import { up as createCourseChatReadStatus, down as dropCourseChatReadStatus } from './036-create-course-chat-read-status';
import { up as renameMaxPointsToMaxScore, down as revertMaxPointsRename } from './037-rename-max-points-to-max-score';
import { up as extendUserActivityLogsForAdmin, down as revertExtendUserActivityLogsForAdmin } from './038-extend-user-activity-logs-for-admin';
import { up as createSystemSettingsTable, down as dropSystemSettingsTable } from './039-create-system-settings-table';
import { up as repairUserActivityLogsAdminColumns, down as revertRepairUserActivityLogsAdminColumns } from './040-repair-user-activity-logs-admin-columns';
import { up as addInstructionsToAssignments, down as removeInstructionsFromAssignments } from './041-add-instructions-to-assignments';
import { up as addBlockchainFieldsToCertificates, down as removeBlockchainFieldsFromCertificates } from './042-add-blockchain-fields-to-certificates';
import { up as addWalletAddressToUsers, down as removeWalletAddressFromUsers } from './043-add-wallet-address-to-users';

// Migration interface
export interface Migration {
  up: (queryInterface: QueryInterface) => Promise<void>;
  down: (queryInterface: QueryInterface) => Promise<void>;
  version: string;
  description: string;
}

// Migration registry
export const migrations: Migration[] = [
  {
    version: '000',
    description: 'Create PostgreSQL enum types',
    up: createEnumTypes,
    down: dropEnumTypes
  },
  {
    version: '001',
    description: 'Create users table',
    up: createUsersTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.dropTable('users');
    }
  },
  {
    version: '002',
    description: 'Create courses table',
    up: createCoursesTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.dropTable('courses');
    }
  },
  {
    version: '003',
    description: 'Create enrollments table',
    up: createEnrollmentsTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.dropTable('enrollments');
    }
  },
  {
    version: '004',
    description: 'Create chat messages table',
    up: createChatMessagesTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.dropTable('chat_messages');
    }
  },
  {
    version: '005',
    description: 'Add indexes to users table',
    up: addIndexesToUsersTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeIndex('users', 'idx_users_email');
      await queryInterface.removeIndex('users', 'idx_users_username');
      await queryInterface.removeIndex('users', 'idx_users_phone');
      await queryInterface.removeIndex('users', 'idx_users_role');
      await queryInterface.removeIndex('users', 'idx_users_status');
    }
  },
  {
    version: '006',
    description: 'Add indexes to courses table',
    up: addIndexesToCoursesTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeIndex('courses', 'idx_courses_instructor_id');
      await queryInterface.removeIndex('courses', 'idx_courses_status');
      await queryInterface.removeIndex('courses', 'idx_courses_category');
    }
  },
  {
    version: '007',
    description: 'Add indexes to enrollments table',
    up: addIndexesToEnrollmentsTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeIndex('enrollments', 'idx_enrollments_user_id');
      await queryInterface.removeIndex('enrollments', 'idx_enrollments_course_id');
      await queryInterface.removeIndex('enrollments', 'idx_enrollments_status');
    }
  },
  {
    version: '008',
    description: 'Add indexes to chat messages table',
    up: addIndexesToChatMessagesTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeIndex('chat_messages', 'idx_chat_messages_course_id');
      await queryInterface.removeIndex('chat_messages', 'idx_chat_messages_user_id');
      await queryInterface.removeIndex('chat_messages', 'idx_chat_messages_created_at');
    }
  }
  ,
  {
    version: '009',
    description: 'Create extended LMS tables and alter existing ones',
    up: createExtendedLmsTables,
    down: dropExtendedLmsTables
  }
  ,
  {
    version: '010',
    description: 'Add email_verified_at column and index to users',
    up: addEmailVerifiedAt,
    down: removeEmailVerifiedAt
  }
  ,
  {
    version: '011',
    description: 'Add missing user profile columns to users table',
    up: addUserProfileColumns,
    down: removeUserProfileColumns
  }
  ,
  {
    version: '016',
    description: 'Fix unique constraint on quiz_attempts (quiz_id, user_id, attempt_number)',
    up: fixQuizAttemptsConstraint,
    down: revertQuizAttemptsConstraint
  }
  ,
  {
    version: '017',
    description: 'Update live sessions schema for livestream feature',
    up: updateLiveSessionsSchema,
    down: revertLiveSessionsSchema
  },
  {
    version: '018',
    description: 'Add ingest_type and WebRTC columns to live sessions',
    up: addLivestreamIngestType,
    down: revertLivestreamIngestType
  },
  {
    version: '019',
    description: 'Create live_session_messages table for livestream chat',
    up: createLiveSessionMessagesTable,
    down: dropLiveSessionMessagesTable
  },
  {
    version: '019a',
    description: 'Create comment_moderations table',
    up: createCommentModerationsTable,
    down: dropCommentModerationsTable
  },
  {
    version: '020',
    description: 'Add message_content column to comment_moderations table',
    up: addMessageContentToCommentModerations,
    down: removeMessageContentFromCommentModerations
  },
  {
    version: '021',
    description: 'Allow null message_id in comment_moderations table',
    up: allowNullMessageIdInCommentModerations,
    down: requireMessageIdInCommentModerations
  },
  {
    version: '022',
    description: 'Force allow null message_id in comment_moderations table',
    up: forceAllowNullMessageId,
    down: requireMessageIdAgain
  },
  {
    version: '023',
    description: 'Create conversations table for direct messaging',
    up: createConversationsTable,
    down: dropConversationsTable
  },
  {
    version: '024',
    description: 'Create direct_messages table',
    up: createDirectMessagesTable,
    down: dropDirectMessagesTable
  },
  {
    version: '025',
    description: 'Allow null course_id in conversations for direct messages',
    up: allowNullCourseIdConversations,
    down: revertNullCourseIdConversations
  },
  {
    version: '026',
    description: 'Add is_practice field to quizzes and assignments',
    up: addIsPracticeToQuizzesAssignments,
    down: removeIsPracticeFromQuizzesAssignments
  },
  {
    version: '027',
    description: 'Add lesson_id field to quizzes and assignments',
    up: addLessonIdToQuizzesAssignments,
    down: removeLessonIdFromQuizzesAssignments
  },
  {
    version: '028',
    description: 'Allow nullable course_id for quiz/assignment (XOR with lesson)',
    up: allowNullableCourseForQuizAssignment,
    down: revertNullableCourseForQuizAssignment
  },
  {
    version: '029',
    description: 'Replace lesson_id with section_id in quizzes',
    up: replaceLessonIdWithSectionIdInQuizzes,
    down: revertReplaceLessonIdWithSectionIdInQuizzes
  },
  {
    version: '030',
    description: 'Add section_id to assignments',
    up: addSectionIdToAssignments,
    down: removeSectionIdFromAssignments
  },
  {
    version: '031',
    description: 'Create certificates table',
    up: createCertificatesTable,
    down: dropCertificatesTable
  },
  {
    version: '032',
    description: 'Make ipfs_hash nullable in certificates table',
    up: makeIpfsHashNullable,
    down: revertIpfsHashNullable
  },
  {
    version: '033',
    description: 'Allow null course_id in conversations for direct messages',
    up: allowNullCourseIdConversations,
    down: revertNullCourseIdConversations
  },
  {
    version: '034',
    description: 'Redesign conversations table for admin support (user1_id/user2_id)',
    up: redesignConversationsForAdmin,
    down: revertConversationsDesign
  },
  {
    version: '035',
    description: 'Create course_prerequisites table',
    up: createCoursePrerequisitesTable,
    down: dropCoursePrerequisitesTable
  },
  {
    version: '036',
    description: 'Create course_chat_read_status table',
    up: createCourseChatReadStatus,
    down: dropCourseChatReadStatus
  },
  {
    version: '037',
    description: 'Rename max_points to max_score in assignments table',
    up: renameMaxPointsToMaxScore,
    down: revertMaxPointsRename
  },
  {
    version: '038',
    description: 'Extend user_activity_logs for admin audit log features',
    up: extendUserActivityLogsForAdmin,
    down: revertExtendUserActivityLogsForAdmin
  },
  {
    version: '039',
    description: 'Create system_settings singleton table for admin configuration',
    up: createSystemSettingsTable,
    down: dropSystemSettingsTable
  },
  {
    version: '040',
    description: 'Repair user_activity_logs admin columns/indexes if missing',
    up: repairUserActivityLogsAdminColumns,
    down: revertRepairUserActivityLogsAdminColumns
  },
  {
    version: '041',
    description: 'Add instructions column to assignments table',
    up: addInstructionsToAssignments,
    down: removeInstructionsFromAssignments
  },
  {
    version: '042',
    description: 'Add blockchain fields to certificates table for NFT integration',
    up: addBlockchainFieldsToCertificates,
    down: removeBlockchainFieldsFromCertificates
  },
  {
    version: '043',
    description: 'Add wallet_address field to users table for blockchain certificate issuance',
    up: addWalletAddressToUsers,
    down: removeWalletAddressFromUsers
  }
];

// Migration management class
export class MigrationManager {
  private sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  /**
   * Initialize migration tracking table
   */
  async initialize(): Promise<void> {
    const queryInterface = this.sequelize.getQueryInterface();
    
    try {
      await queryInterface.createTable('migrations', {
        id: {
          type: 'INTEGER',
          primaryKey: true,
          autoIncrement: true
        },
        version: {
          type: 'VARCHAR(10)',
          allowNull: false,
          unique: true
        },
        description: {
          type: 'TEXT',
          allowNull: false
        },
        executed_at: {
          type: 'TIMESTAMP',
          allowNull: false,
          defaultValue: this.sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      logger.info('Migration tracking table created');
    } catch (error: unknown) {
      // Table might already exist
      logger.info('Migration tracking table already exists');
    }
  }

  /**
   * Get executed migrations
   */
  async getExecutedMigrations(): Promise<string[]> {
    try {
      const [results] = await this.sequelize.query(
        'SELECT version FROM migrations ORDER BY version'
      );
      return (results as any[]).map(row => row.version);
    } catch (error: unknown) {
      logger.error('Error getting executed migrations:', error);
      return [];
    }
  }

  /**
   * Mark migration as executed
   */
  async markMigrationExecuted(version: string, description: string): Promise<void> {
    await this.sequelize.query(
      'INSERT INTO migrations (version, description, executed_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      {
        replacements: [version, description]
      }
    );
  }

  /**
   * Remove migration from executed list
   */
  async unmarkMigrationExecuted(version: string): Promise<void> {
    await this.sequelize.query(
      'DELETE FROM migrations WHERE version = ?',
      {
        replacements: [version]
      }
    );
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<void> {
    await this.initialize();
    
    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = migrations.filter(
      migration => !executedMigrations.includes(migration.version)
    );

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    logger.info(`Running ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      try {
        logger.info(`Running migration ${migration.version}: ${migration.description}`);
        
        await migration.up(this.sequelize.getQueryInterface());
        await this.markMigrationExecuted(migration.version, migration.description);
        
        logger.info(`Migration ${migration.version} completed successfully`);
      } catch (error: unknown) {
        logger.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    logger.info('All migrations completed successfully');
  }

  /**
   * Rollback last migration
   */
  async rollback(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    const lastMigrationVersion = executedMigrations[executedMigrations.length - 1];
    const migration = migrations.find(m => m.version === lastMigrationVersion);

    if (!migration) {
      logger.error(`Migration ${lastMigrationVersion} not found`);
      return;
    }

    try {
      logger.info(`Rolling back migration ${migration.version}: ${migration.description}`);
      
      await migration.down(this.sequelize.getQueryInterface());
      await this.unmarkMigrationExecuted(migration.version);
      
      logger.info(`Migration ${migration.version} rolled back successfully`);
    } catch (error: unknown) {
      logger.error(`Rollback of migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  /**
   * Rollback all migrations
   */
  async rollbackAll(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    logger.info(`Rolling back ${executedMigrations.length} migrations`);

    // Rollback in reverse order
    for (let i = executedMigrations.length - 1; i >= 0; i--) {
      const version = executedMigrations[i];
      const migration = migrations.find(m => m.version === version);

      if (!migration) {
        logger.error(`Migration ${version} not found`);
        continue;
      }

      try {
        logger.info(`Rolling back migration ${migration.version}: ${migration.description}`);
        
        await migration.down(this.sequelize.getQueryInterface());
        await this.unmarkMigrationExecuted(migration.version);
        
        logger.info(`Migration ${migration.version} rolled back successfully`);
      } catch (error: unknown) {
        logger.error(`Rollback of migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    logger.info('All migrations rolled back successfully');
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    total: number;
    executed: number;
    pending: number;
    executedMigrations: string[];
    pendingMigrations: string[];
  }> {
    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = migrations
      .filter(migration => !executedMigrations.includes(migration.version))
      .map(migration => migration.version);

    return {
      total: migrations.length,
      executed: executedMigrations.length,
      pending: pendingMigrations.length,
      executedMigrations,
      pendingMigrations
    };
  }
}

