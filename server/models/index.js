const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const JobListing = require('./JobListing');
const Application = require('./Application');
const Session = require('./Session');
const Resume = require('./Resume');
const Score = require('./Score');

// Associations
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

User.hasMany(JobListing, { foreignKey: 'employer_id' });
JobListing.belongsTo(User, { foreignKey: 'employer_id', as: 'employer' });

User.hasMany(Application, { foreignKey: 'applicant_id' });
Application.belongsTo(User, { foreignKey: 'applicant_id', as: 'applicant' });

JobListing.hasMany(Application, { foreignKey: 'job_id' });
Application.belongsTo(JobListing, { foreignKey: 'job_id', as: 'job' });

User.hasMany(Session, { foreignKey: 'user_id' });
Session.belongsTo(User, { foreignKey: 'user_id' });

// New: Resume + Score, each 1:1 with Application
Application.hasOne(Resume, { foreignKey: 'application_id', as: 'resume', onDelete: 'CASCADE' });
Resume.belongsTo(Application, { foreignKey: 'application_id' });

Application.hasOne(Score, { foreignKey: 'application_id', as: 'score', onDelete: 'CASCADE' });
Score.belongsTo(Application, { foreignKey: 'application_id' });

module.exports = { sequelize, Role, User, JobListing, Application, Session, Resume, Score };