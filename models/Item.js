const pool = require('../config/database');

class Item {
  static async create(itemData) {
    const { title, category, description, location_found, campus, status, image_url, user_id } = itemData;
    
    const [result] = await pool.query(
      `INSERT INTO items 
       (title, category, description, location_found, campus, status, image_url, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, description, location_found, campus, status || 'found', image_url, user_id]
    );
    
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT i.*, u.first_name, u.last_name, u.email as user_email 
       FROM items i 
       JOIN users u ON i.user_id = u.id 
       WHERE i.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT i.*, u.first_name, u.last_name, u.email as user_email 
      FROM items i 
      JOIN users u ON i.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.category) {
      query += ' AND i.category = ?';
      params.push(filters.category);
    }

    if (filters.campus) {
      query += ' AND i.campus = ?';
      params.push(filters.campus);
    }

    if (filters.status) {
      query += ' AND i.status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      query += ' AND (i.title LIKE ? OR i.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY i.created_at DESC';

    // Pagination
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE items SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined && value !== null) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE items SET ${fields.join(', ')} WHERE id = ?`;
    
    await pool.query(query, values);
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Item;