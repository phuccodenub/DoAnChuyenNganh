'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Starting migration: Cleanup course categories...');
      
      // 1. Check if columns exist before dropping
      const tableDescription = await queryInterface.describeTable('courses');
      
      // 2. Drop category column if exists
      if (tableDescription.category) {
        console.log('  → Dropping column: category');
        await queryInterface.removeColumn('courses', 'category', { transaction });
      } else {
        console.log('  → Column "category" does not exist, skipping');
      }
      
      // 3. Drop subcategory column if exists
      if (tableDescription.subcategory) {
        console.log('  → Dropping column: subcategory');
        await queryInterface.removeColumn('courses', 'subcategory', { transaction });
      } else {
        console.log('  → Column "subcategory" does not exist, skipping');
      }
      
      await transaction.commit();
      console.log('✅ Migration completed successfully!');
      console.log('📝 Note: category_id (foreign key) is preserved as the correct design');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Rolling back migration: Restore category columns...');
      
      // Rollback: Add back category/subcategory
      await queryInterface.addColumn('courses', 'category', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Legacy category field (text-based)'
      }, { transaction });
      
      await queryInterface.addColumn('courses', 'subcategory', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Legacy subcategory field (text-based)'
      }, { transaction });
      
      await transaction.commit();
      console.log('✅ Rollback completed successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }
};
