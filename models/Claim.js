const pool = require('../config/database');

class Claim {
  static async create(claimData) {
    const { item_id, claimer_id, owner_id } = claimData;
    
    const [result] = await pool.query(
      `INSERT INTO claims (item_id, claimer_id, owner_id) VALUES (?, ?, ?)`,
      [item_id, claimer_id, owner_id]
    );
    
    // Update item status to claimed
    await pool.query('UPDATE items SET status = "claimed" WHERE id = ?', [item_id]);
    
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.*, 
              i.title as item_title, i.description as item_description,
              u1.first_name as claimer_first, u1.last_name as claimer_last,
              u2.first_name as owner_first, u2.last_name as owner_last
       FROM claims c
       JOIN items i ON c.item_id = i.id
       JOIN users u1 ON c.claimer_id = u1.id
       LEFT JOIN users u2 ON c.owner_id = u2.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByItemId(item_id) {
    const [rows] = await pool.query(
      `SELECT c.*, 
              u1.first_name as claimer_first, u1.last_name as claimer_last,
              u2.first_name as owner_first, u2.last_name as owner_last
       FROM claims c
       JOIN users u1 ON c.claimer_id = u1.id
       LEFT JOIN users u2 ON c.owner_id = u2.id
       WHERE c.item_id = ?`,
      [item_id]
    );
    return rows;
  }

  static async updateStatus(id, status, verification_notes = null) {
    await pool.query(
      'UPDATE claims SET status = ?, verification_notes = ? WHERE id = ?',
      [status, verification_notes, id]
    );
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
    const query = `UPDATE claims SET ${fields.join(', ')} WHERE id = ?`;
    
    await pool.query(query, values);
    return this.findById(id);
  }

  static async delete(id) {
    const claim = await this.findById(id);
    if (!claim) return false;

    // Update item status back to found when claim is deleted
    await pool.query('UPDATE items SET status = "found" WHERE id = ?', [claim.item_id]);
    
    const [result] = await pool.query('DELETE FROM claims WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getUserClaims(user_id) {
    const [rows] = await pool.query(
      `SELECT c.*, i.title as item_title, i.image_url as item_image
       FROM claims c
       JOIN items i ON c.item_id = i.id
       WHERE c.claimer_id = ? OR c.owner_id = ?
       ORDER BY c.created_at DESC`,
      [user_id, user_id]
    );
    return rows;
  }
}

module.exports = Claim;