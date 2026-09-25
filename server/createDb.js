// One-off utility — run once to create the database on a fresh RDS instance,
// then this file isn't needed again. Connects to Postgres's default
// "postgres" admin database (which always exists) to run CREATE DATABASE,
// since you can't create a database while connected to the database itself.

const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const targetDb = process.env.DB_NAME;

  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // always exists, used as a connection point only
    ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
  });

  await client.connect();

  const existing = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [targetDb]
  );

  if (existing.rowCount > 0) {
    console.log(`Database "${targetDb}" already exists — nothing to do.`);
  } else {
    // Table/database names can't be parameterized in pg — targetDb comes
    // from your own .env, not user input, so this is safe here.
    await client.query(`CREATE DATABASE "${targetDb}"`);
    console.log(`Created database "${targetDb}".`);
  }

  await client.end();
}

main().catch((err) => {
  console.error('Failed to create database:', err.message);
  process.exit(1);
});