'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add unique constraints to student_id and instructor_id columns
    await queryInterface.addConstraint('users', {
      fields: ['student_id'],
      type: 'unique',
      name: 'users_student_id_unique'
    });

    await queryInterface.addConstraint('users', {
      fields: ['instructor_id'],
      type: 'unique',
      name: 'users_instructor_id_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove unique constraints
    await queryInterface.removeConstraint('users', 'users_student_id_unique');
    await queryInterface.removeConstraint('users', 'users_instructor_id_unique');
  }
};
