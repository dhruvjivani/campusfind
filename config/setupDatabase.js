const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  // First, connect to default postgres database to create our database
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Default postgres database
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  let connection;
  try {
    // Connect as admin to create database
    await adminClient.connect();
    
    // Check if database exists, if not create it
    const dbCheckResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME]
    );
    
    if (dbCheckResult.rows.length === 0) {
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }

    await adminClient.end();

    // Now connect to our actual database
    connection = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    await connection.connect();

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        campus VARCHAR(50) NOT NULL,
        program VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'staff')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('electronics', 'textbooks', 'keys', 'id_cards', 'clothing', 'bags', 'other')),
        description TEXT,
        location_found VARCHAR(255) NOT NULL,
        campus VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'found' CHECK (status IN ('lost', 'found', 'claimed')),
        image_url VARCHAR(500),
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Claims table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id SERIAL PRIMARY KEY,
        item_id INT NOT NULL,
        claimer_id INT NOT NULL,
        owner_id INT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'completed')),
        verification_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (claimer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log("All tables created successfully!");

    // Insert sample data for testing
    const userResult = await connection.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userResult.rows[0].count);
    
    if (userCount === 0) {
      await connection.query(`
        INSERT INTO users (student_id, email, first_name, last_name, campus, program, password, is_verified, role) VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9),
        ($10, $11, $12, $13, $14, $15, $16, $17, $18),
        ($19, $20, $21, $22, $23, $24, $25, $26, $27),
        ($28, $29, $30, $31, $32, $33, $34, $35, $36),
        ($37, $38, $39, $40, $41, $42, $43, $44, $45),
        ($46, $47, $48, $49, $50, $51, $52, $53, $54)
      `, [
        'S001', 'djivani@conestogac.on.ca', 'Dhruv', 'Jivani', 'Main', 'Mobile and Web Development', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', true, 'staff',
        'S002', 'student@conestogac.on.ca', 'Jeel', 'Patel', 'Main', 'Web Development', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', true, 'student',
        'S003', 'maya@conestogac.on.ca', 'Maya', 'Singh', 'Waterloo', 'Business Management', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', true, 'student',
        'S004', 'alex@conestogac.on.ca', 'Alex', 'Johnson', 'Main', 'Computer Science', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', true, 'student',
        'S005', 'sarah@conestogac.on.ca', 'Sarah', 'Williams', 'Cambridge', 'Engineering', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', true, 'student',
        'S006', 'staff@conestogac.on.ca', 'Mike', 'Admin', 'Main', 'Administration', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', true, 'staff'
      ]);
      console.log("Sample users inserted");

      // Insert sample items
      await connection.query(`
        INSERT INTO items (title, category, description, location_found, campus, status, user_id) VALUES
        ($1, $2, $3, $4, $5, $6, $7),
        ($8, $9, $10, $11, $12, $13, $14),
        ($15, $16, $17, $18, $19, $20, $21),
        ($22, $23, $24, $25, $26, $27, $28),
        ($29, $30, $31, $32, $33, $34, $35),
        ($36, $37, $38, $39, $40, $41, $42),
        ($43, $44, $45, $46, $47, $48, $49),
        ($50, $51, $52, $53, $54, $55, $56),
        ($57, $58, $59, $60, $61, $62, $63),
        ($64, $65, $66, $67, $68, $69, $70)
      `, [
        'MacBook Pro 2021', 'electronics', 'Found near library, has apple sticker. Missing charger.', 'Library Building', 'Main', 'found', 1,
        'Calculus Textbook', 'textbooks', 'Advanced Calculus 5th Edition. Name written inside.', 'Math Lab', 'Main', 'found', 1,
        'Student ID Card', 'id_cards', 'Blue student ID card with photo. Name: John Doe', 'Cafeteria', 'Waterloo', 'found', 3,
        'Red Backpack', 'bags', 'Red canvas backpack with stickers. Contains notebooks.', 'Parking Lot B', 'Main', 'found', 2,
        'Car Keys', 'keys', 'Ford car keys with blue keychain. Found at entrance.', 'Main Entrance', 'Main', 'found', 4,
        'Wireless Earbuds', 'electronics', 'Apple AirPods Pro. Found in gym.', 'Gymnasium', 'Cambridge', 'found', 5,
        'Chemistry Lab Notebook', 'textbooks', 'Lab notebook for CHM 201. Contains experiments.', 'Science Building', 'Main', 'found', 1,
        'Black Leather Jacket', 'clothing', 'XL black leather jacket. Found in lost and found.', 'Lost and Found', 'Main', 'found', 6,
        'Programming Textbook', 'textbooks', 'Introduction to Python - Latest Edition', 'Computer Lab', 'Main', 'found', 2,
        'Gold Watch', 'electronics', 'Vintage gold watch. Still working.', 'Cafeteria', 'Waterloo', 'found', 3
      ]);
      console.log("Sample items inserted");

      // Insert sample claims
      await connection.query(`
        INSERT INTO claims (item_id, claimer_id, owner_id, status, verification_notes) VALUES
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15),
        ($16, $17, $18, $19, $20),
        ($21, $22, $23, $24, $25),
        ($26, $27, $28, $29, $30)
      `, [
        1, 2, 1, 'verified', 'Student verified ownership by providing AppleCare details',
        2, 3, 1, 'pending', 'Waiting for verification',
        3, 4, 3, 'verified', 'ID verified by staff member',
        5, 5, 4, 'completed', 'Item handed over to claimer',
        7, 6, 1, 'rejected', 'Claimer unable to provide proof of ownership',
        4, 3, 2, 'pending', 'Initial claim submitted'
      ]);
      console.log("Sample claims inserted");
    } else {
      console.log("Database already contains data, skipping sample data insertion");
    }
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
