const { Sequelize } = require('sequelize');
require('dotenv').config();

// RDS requires SSL by default; local Postgres (including the Docker-local
// test against host.docker.internal) does not. DB_SSL lets us toggle this
// per environment instead of hardcoding it — set DB_SSL=true alongside your
// RDS connection details, leave it unset for local Postgres.
const useSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            // RDS's certificate chain isn't in Node's default trusted root
            // store unless you install the RDS CA bundle separately —
            // rejectUnauthorized: false skips that verification step.
            // Fine for a portfolio project; a stricter production setup
            // would load AWS's RDS CA certificate instead.
            rejectUnauthorized: false,
          },
        }
      : {},
  }
);

module.exports = sequelize;