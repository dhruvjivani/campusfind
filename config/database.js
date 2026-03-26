const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campusfind_db',
  ssl: { rejectUnauthorized: false }, // Always use SSL for Render
};

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected!');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err.message);
});

module.exports = pool;
