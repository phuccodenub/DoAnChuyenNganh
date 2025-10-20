'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add email_verified_at column
    await queryInterface.addColumn('users', 'email_verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when email was verified'
    });

    // Add index for performance
    await queryInterface.addIndex('users', ['email_verified_at'], {
      name: 'idx_users_email_verified_at'
    });

    // Update existing verified users with their updated_at timestamp
    // (best guess for when they were verified)
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET email_verified_at = updated_at 
      WHERE email_verified = true AND email_verified_at IS NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('users', 'idx_users_email_verified_at');
    
    // Remove column
    await queryInterface.removeColumn('users', 'email_verified_at');
  }
};
