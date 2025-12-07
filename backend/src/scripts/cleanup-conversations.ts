/**
 * Script để xóa tất cả conversations và messages cũ
 * Chạy: npx ts-node -r tsconfig-paths/register src/scripts/cleanup-conversations.ts
 */

import { getSequelize } from '../config/db';
import logger from '../utils/logger.util';

async function cleanup() {
  try {
    const sequelize = getSequelize();
    logger.info('🗑️  Starting cleanup of conversations and messages...');
    
    // Delete all direct messages
    const messagesDeleted = await sequelize.query(`DELETE FROM direct_messages`);
    logger.info(`✅ Deleted ${messagesDeleted[1]} messages`);
    
    // Delete all conversations
    const conversationsDeleted = await sequelize.query(`DELETE FROM conversations`);
    logger.info(`✅ Deleted ${conversationsDeleted[1]} conversations`);
    
    logger.info('✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
