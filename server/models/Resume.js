const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resume = sequelize.define('Resume', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  application_id: { type: DataTypes.INTEGER, allowNull: false },
  // S3 object key, e.g. "resumes/{application_id}-uuid.pdf"
  // NOT the raw file — file bytes live in S3, this table just references it
  s3_key: { type: DataTypes.STRING, allowNull: false },
  // populated by scoreWorker after pdf-parse extraction
  parsed_text: { type: DataTypes.TEXT, allowNull: true },
  original_file_name: { type: DataTypes.STRING, allowNull: true }
}, { timestamps: true });

module.exports = Resume;