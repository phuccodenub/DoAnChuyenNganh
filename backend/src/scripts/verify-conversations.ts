/**
 * Quick script to verify conversations table structure on Supabase
 */

import 'dotenv-flow/config';
import { Sequelize, QueryTypes } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: false,
});

async function verifyConversations() {
  try {
    console.log('🔍 Verifying conversations table on Supabase...\n');

    // Check columns
    const columns = await sequelize.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'conversations'
       ORDER BY ordinal_position`,
      { type: QueryTypes.SELECT }
    );

    console.log('📋 Conversations Table Columns:');
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Check data
    const conversations = await sequelize.query(
      `SELECT id, user1_id, user2_id, course_id, 
              user1_last_read_at, user2_last_read_at,
              is_archived_by_user1, is_archived_by_user2,
              created_at
       FROM conversations
       ORDER BY created_at DESC
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    console.log(`\n💬 Recent Conversations (${conversations.length}):`);
    conversations.forEach((conv: any) => {
      console.log(`  ID: ${conv.id}`);
      console.log(`  User1: ${conv.user1_id}`);
      console.log(`  User2: ${conv.user2_id}`);
      console.log(`  Course: ${conv.course_id || 'NULL (direct message)'}`);
      console.log(`  Created: ${conv.created_at}`);
      console.log('  ---');
    });

    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyConversations();
