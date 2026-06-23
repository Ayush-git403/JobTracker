const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobListing = sequelize.define('JobListing', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  employer_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'open' }
}, { timestamps: true });

module.exports = JobListing;