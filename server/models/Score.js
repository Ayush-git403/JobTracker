const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Score = sequelize.define('Score', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  application_id: { type: DataTypes.INTEGER, allowNull: false, unique: true }, // one score per application
  // 0-100, null until worker finishes
  fit_score: { type: DataTypes.FLOAT, allowNull: true },
  // raw cosine similarity before any scaling, useful for debugging/tuning
  raw_similarity: { type: DataTypes.FLOAT, allowNull: true },
  // JSON array of overlapping skill keywords, e.g. ["react", "node.js", "postgresql"]
  matched_skills: { type: DataTypes.JSON, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'done', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  error_message: { type: DataTypes.STRING, allowNull: true }
}, { timestamps: true });

module.exports = Score;