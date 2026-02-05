const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { student_id, email, first_name, last_name, campus, program, password } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Verify .on.ca email
    const isVerified = email.endsWith('.on.ca');

    const result = await pool.query(
      `INSERT INTO users 
       (student_id, email, first_name, last_name, campus, program, password, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [student_id, email, first_name, last_name, campus, program, hashedPassword, isVerified]
    );
    
    return this.findById(result.rows[0].id);
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT id, student_id, email, first_name, last_name, campus, program, is_verified, role FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllUsers() {
    const result = await pool.query(
      'SELECT id, student_id, email, first_name, last_name, campus, program, is_verified, role, created_at FROM users'
    );
    return result.rows;
  }
}

module.exports = User;