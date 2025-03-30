const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const escapePassword = (pwd) => encodeURIComponent(pwd);
const connString = `postgres://${process.env.DB_USER}:${escapePassword('dstpocadmin01!')}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=disable`;

const pool = new Pool({
  connectionString: connString,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(1);
});

module.exports = pool;