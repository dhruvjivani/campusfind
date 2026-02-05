const mysql = require("mysql2/promise");
require("dotenv").config();

async function setupDatabase() {
  let connection;
  try {
    // Connect to MySQL without selecting database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    // Create database
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
    );
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        campus VARCHAR(50) NOT NULL,
        program VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        role ENUM('student', 'staff') DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        category ENUM('electronics', 'textbooks', 'keys', 'id_cards', 'clothing', 'bags', 'other') NOT NULL,
        description TEXT,
        location_found VARCHAR(255) NOT NULL,
        campus VARCHAR(50) NOT NULL,
        status ENUM('lost', 'found', 'claimed') DEFAULT 'found',
        image_url VARCHAR(500),
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Claims table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        claimer_id INT NOT NULL,
        owner_id INT,
        status ENUM('pending', 'verified', 'rejected', 'completed') DEFAULT 'pending',
        verification_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (claimer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log("All tables created successfully!");

    // Insert sample data for testing
    const [users] = await connection.query(
      "SELECT COUNT(*) as count FROM users",
    );
    if (users[0].count === 0) {
      await connection.query(`
        INSERT INTO users (student_id, email, first_name, last_name, campus, program, password, is_verified, role) VALUES
        ('S001', 'djivani@conestogac.on.ca', 'Dhruv', 'Jivani', 'Main', 'Mobile and Web Development', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', TRUE, 'staff'),
        ('S002', 'student@conestogac.on.ca', 'Jeel', 'Patel', 'Main', 'Web Development', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', TRUE, 'student'),
        ('S003', 'maya@conestogac.on.ca', 'Maya', 'Singh', 'Waterloo', 'Business Management', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', TRUE, 'student'),
        ('S004', 'alex@conestogac.on.ca', 'Alex', 'Johnson', 'Main', 'Computer Science', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', TRUE, 'student'),
        ('S005', 'sarah@conestogac.on.ca', 'Sarah', 'Williams', 'Cambridge', 'Engineering', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', TRUE, 'student'),
        ('S006', 'staff@conestogac.on.ca', 'Mike', 'Admin', 'Main', 'Administration', '$2y$10$RTtomPipixuar/97Q/eGiuPao4T/usKJj6dkbplmc7jjUAkK2EE82', TRUE, 'staff')
      `);
      console.log("Sample users inserted");

      // Insert sample items
      await connection.query(`
        INSERT INTO items (title, category, description, location_found, campus, status, user_id) VALUES
        ('MacBook Pro 2021', 'electronics', 'Found near library, has apple sticker. Missing charger.', 'Library Building', 'Main', 'found', 1),
        ('Calculus Textbook', 'textbooks', 'Advanced Calculus 5th Edition. Name written inside.', 'Math Lab', 'Main', 'found', 1),
        ('Student ID Card', 'id_cards', 'Blue student ID card with photo. Name: John Doe', 'Cafeteria', 'Waterloo', 'found', 3),
        ('Red Backpack', 'bags', 'Red canvas backpack with stickers. Contains notebooks.', 'Parking Lot B', 'Main', 'found', 2),
        ('Car Keys', 'keys', 'Ford car keys with blue keychain. Found at entrance.', 'Main Entrance', 'Main', 'found', 4),
        ('Wireless Earbuds', 'electronics', 'Apple AirPods Pro. Found in gym.', 'Gymnasium', 'Cambridge', 'found', 5),
        ('Chemistry Lab Notebook', 'textbooks', 'Lab notebook for CHM 201. Contains experiments.', 'Science Building', 'Main', 'found', 1),
        ('Black Leather Jacket', 'clothing', 'XL black leather jacket. Found in lost and found.', 'Lost and Found', 'Main', 'found', 6),
        ('Programming Textbook', 'textbooks', 'Introduction to Python - Latest Edition', 'Computer Lab', 'Main', 'found', 2),
        ('Gold Watch', 'electronics', 'Vintage gold watch. Still working.', 'Cafeteria', 'Waterloo', 'found', 3)
      `);
      console.log("Sample items inserted");

      // Insert sample claims
      await connection.query(`
        INSERT INTO claims (item_id, claimer_id, owner_id, status, verification_notes) VALUES
        (1, 2, 1, 'verified', 'Student verified ownership by providing AppleCare details'),
        (2, 3, 1, 'pending', 'Waiting for verification'),
        (3, 4, 3, 'verified', 'ID verified by staff member'),
        (5, 5, 4, 'completed', 'Item handed over to claimer'),
        (7, 6, 1, 'rejected', 'Claimer unable to provide proof of ownership'),
        (4, 3, 2, 'pending', 'Initial claim submitted')
      `);
      console.log("Sample claims inserted");
    }
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
