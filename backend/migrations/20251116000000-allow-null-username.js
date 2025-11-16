/**
 * Migration: Allow NULL for username column
 * 
 * Purpose: Fix schema mismatch between model (allowNull: true) and database (NOT NULL)
 * The username field should be optional since email is the primary login method
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    });
  }
};
