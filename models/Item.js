const pool = require('../config/database');

class Item {
  static async create(itemData) {
    const { title, category, description, location_found, campus, status, image_url, user_id } = itemData;
    
    const result = await pool.query(
      `INSERT INTO items 
       (title, category, description, location_found, campus, status, image_url, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [title, category, description, location_found, campus, status || 'found', image_url, user_id]
    );
    
    return this.findById(result.rows[0].id);
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT i.*, u.first_name, u.last_name, u.email as user_email 
       FROM items i 
       JOIN users u ON i.user_id = u.id 
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT i.*, u.first_name, u.last_name, u.email as user_email 
      FROM items i 
      JOIN users u ON i.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.category) {
      query += ` AND i.category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters.campus) {
      query += ` AND i.campus = $${paramCount}`;
      params.push(filters.campus);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount + 1})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
      paramCount += 2;
    }

    query += ' ORDER BY i.created_at DESC';

    // Pagination
    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(filters.limit));
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(parseInt(filters.offset));
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE items SET status = $1 WHERE id = $2', [status, id]);
    return this.findById(id);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined && value !== null) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id`;
    
    const result = await pool.query(query, values);
    return this.findById(id);
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM items WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = Item;