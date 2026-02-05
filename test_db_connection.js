const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Attempting to connect to:');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    await client.connect();
    console.log('\n✅ Connection successful!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Server time:', result.rows[0]);
    
    await client.end();
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}

testConnection();
