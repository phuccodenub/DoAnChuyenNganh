'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ai_debate_history', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      topic: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      context: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      debate_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      rounds: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      result: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      disagreement: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      requires_judge: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      judge_decision: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      decision: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      initiated_by: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('ai_debate_history', ['initiated_by', 'created_at']);
    await queryInterface.addIndex('ai_debate_history', ['course_id']);
    await queryInterface.addIndex('ai_debate_history', ['debate_type']);
    await queryInterface.addIndex('ai_debate_history', ['decision']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ai_debate_history');
  }
};
