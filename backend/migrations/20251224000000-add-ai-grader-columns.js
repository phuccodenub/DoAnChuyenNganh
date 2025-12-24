'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('assignment_submissions', 'ai_grader_last', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Latest AI grader result payload'
    });

    await queryInterface.addColumn('assignment_submissions', 'ai_grader_history', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'AI grader history entries (array)'
    });

    await queryInterface.addColumn('assignment_submissions', 'ai_grader_rubric', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Last rubric used by AI grader'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('assignment_submissions', 'ai_grader_rubric');
    await queryInterface.removeColumn('assignment_submissions', 'ai_grader_history');
    await queryInterface.removeColumn('assignment_submissions', 'ai_grader_last');
  }
};
