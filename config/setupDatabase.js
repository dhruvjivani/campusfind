/**
 * setupDatabase.js
 * Initialises the PostgreSQL database, creates tables, and seeds sample data.
 * Passwords are hashed at runtime with bcryptjs so they always work with Node.
 *
 * Default credentials after seeding:
 *   Staff  → staff@conestogac.on.ca  / Staff@123
 *   Staff  → djivani@conestogac.on.ca / Admin@123
 *   Student→ student@conestogac.on.ca / Student@123
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
  // ── Connect to default postgres DB to create our database ──────────────────
  const adminClient = new Client({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  let connection;
  try {
    await adminClient.connect();

    // Create database if it does not exist
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME]
    );
    if (dbCheck.rows.length === 0) {
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✅ Database "${process.env.DB_NAME}" created`);
    } else {
      console.log(`ℹ️  Database "${process.env.DB_NAME}" already exists`);
    }
    await adminClient.end();

    // ── Connect to our application database ──────────────────────────────────
    connection = new Client({
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    await connection.connect();

    // ── Users table ──────────────────────────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        student_id  VARCHAR(20)  UNIQUE NOT NULL,
        email       VARCHAR(100) UNIQUE NOT NULL,
        first_name  VARCHAR(50)  NOT NULL,
        last_name   VARCHAR(50)  NOT NULL,
        campus      VARCHAR(50)  NOT NULL,
        program     VARCHAR(100),
        password    VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        role        VARCHAR(20)  DEFAULT 'student' CHECK (role IN ('student', 'staff')),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── Items table ──────────────────────────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id             SERIAL PRIMARY KEY,
        title          VARCHAR(100) NOT NULL,
        category       VARCHAR(50)  NOT NULL CHECK (
                         category IN ('electronics','textbooks','keys','id_cards',
                                      'clothing','bags','accessories','other')
                       ),
        description    TEXT,
        location_found VARCHAR(255) NOT NULL,
        campus         VARCHAR(50)  NOT NULL,
        status         VARCHAR(20)  DEFAULT 'found' CHECK (status IN ('lost','found','claimed')),
        image_url      VARCHAR(500),
        user_id        INT NOT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ── Claims table ─────────────────────────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id                 SERIAL PRIMARY KEY,
        item_id            INT NOT NULL,
        claimer_id         INT NOT NULL,
        owner_id           INT,
        status             VARCHAR(20) DEFAULT 'pending'
                             CHECK (status IN ('pending','verified','rejected','completed')),
        verification_notes TEXT,
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id)    REFERENCES items(id)  ON DELETE CASCADE,
        FOREIGN KEY (claimer_id) REFERENCES users(id)  ON DELETE CASCADE,
        FOREIGN KEY (owner_id)   REFERENCES users(id)  ON DELETE SET NULL
      )
    `);

    console.log('✅ All tables ready');

    // ── Seed data (only when table is empty) ─────────────────────────────────
    const { rows } = await connection.query('SELECT COUNT(*) AS count FROM users');
    if (parseInt(rows[0].count) > 0) {
      console.log('ℹ️  Sample data already present — skipping seed');
      return;
    }

    // Hash passwords at runtime so they always work with bcryptjs
    const [staffHash1, staffHash2, studentHash] = await Promise.all([
      bcrypt.hash('Admin@123',   10),   // djivani@conestogac.on.ca
      bcrypt.hash('Staff@123',   10),   // staff@conestogac.on.ca
      bcrypt.hash('Student@123', 10),   // all student accounts
    ]);

    // Insert sample users
    await connection.query(`
      INSERT INTO users
        (student_id, email, first_name, last_name, campus, program, password, is_verified, role)
      VALUES
        ('S001','djivani@conestogac.on.ca','Dhruv','Jivani','Main Campus',
         'Mobile and Web Development', $1, true, 'staff'),
        ('S006','staff@conestogac.on.ca','Mike','Admin','Main Campus',
         'Administration', $2, true, 'staff'),
        ('S002','student@conestogac.on.ca','Jeel','Patel','Main Campus',
         'Web Development', $3, true, 'student'),
        ('S003','maya@conestogac.on.ca','Maya','Singh','Waterloo',
         'Business Management', $3, true, 'student'),
        ('S004','alex@conestogac.on.ca','Alex','Johnson','Main Campus',
         'Computer Science', $3, true, 'student'),
        ('S005','sarah@conestogac.on.ca','Sarah','Williams','Cambridge',
         'Engineering', $3, true, 'student')
    `, [staffHash1, staffHash2, studentHash]);
    console.log('✅ Sample users inserted');

    // Insert sample items
    await connection.query(`
      INSERT INTO items
        (title, category, description, location_found, campus, status, user_id)
      VALUES
        ('MacBook Pro 2021','electronics',
         'Found near library. Has an Apple sticker. Missing charger.',
         'Library Building','Main Campus','found',1),
        ('Calculus Textbook','textbooks',
         'Advanced Calculus 5th Edition. Name written inside.',
         'Math Lab','Main Campus','found',1),
        ('Student ID Card','id_cards',
         'Blue student ID card with photo. Name: John Doe.',
         'Cafeteria','Waterloo','found',3),
        ('Red Backpack','bags',
         'Red canvas backpack with stickers. Contains notebooks.',
         'Parking Lot B','Main Campus','found',2),
        ('Car Keys','keys',
         'Ford car keys with blue keychain. Found at main entrance.',
         'Main Entrance','Main Campus','found',4),
        ('Wireless Earbuds','electronics',
         'Apple AirPods Pro. Found in the gymnasium.',
         'Gymnasium','Cambridge','found',5),
        ('Chemistry Lab Notebook','textbooks',
         'Lab notebook for CHM 201. Contains completed experiments.',
         'Science Building','Main Campus','found',1),
        ('Black Leather Jacket','clothing',
         'XL black leather jacket. Turned in to lost and found.',
         'Lost and Found Desk','Main Campus','found',2),
        ('Python Programming Textbook','textbooks',
         'Introduction to Python — Latest Edition.',
         'Computer Lab','Main Campus','lost',2),
        ('Gold Watch','accessories',
         'Vintage gold watch. Still in working condition.',
         'Cafeteria','Waterloo','found',3)
    `);
    console.log('✅ Sample items inserted');

    // Insert sample claims
    await connection.query(`
      INSERT INTO claims (item_id, claimer_id, owner_id, status, verification_notes)
      VALUES
        (1, 2, 1, 'verified',  'Student verified ownership by providing AppleCare receipt'),
        (2, 3, 1, 'pending',   'Waiting for owner to confirm'),
        (3, 4, 3, 'verified',  'ID verified by staff member'),
        (5, 5, 4, 'completed', 'Item handed over to claimer in person'),
        (7, 6, 1, 'rejected',  'Claimer unable to provide proof of ownership'),
        (4, 3, 2, 'pending',   'Initial claim submitted — awaiting review')
    `);
    console.log('✅ Sample claims inserted');
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  SAMPLE LOGIN CREDENTIALS');
    console.log('  Staff  : staff@conestogac.on.ca / Staff@123');
    console.log('  Staff  : djivani@conestogac.on.ca / Admin@123');
    console.log('  Student: student@conestogac.on.ca / Student@123');
    console.log('═══════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
