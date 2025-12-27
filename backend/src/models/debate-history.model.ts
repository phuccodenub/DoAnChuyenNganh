/**
 * Debate History Model
 * Lưu trữ kết quả tranh biện multi-agent
 */

import { DataTypes } from 'sequelize';
import { getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const DebateHistory = sequelize.define(
  'DebateHistory',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    topic: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    debate_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    rounds: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    result: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    disagreement: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    requires_judge: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    judge_decision: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    decision: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    initiated_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'ai_debate_history',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['initiated_by', 'created_at'] },
      { fields: ['course_id'] },
      { fields: ['debate_type'] },
    ],
  }
);

export default DebateHistory;
