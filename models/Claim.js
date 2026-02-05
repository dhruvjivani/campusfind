const pool = require('../config/database');

class Claim {
  static async create(claimData) {
    const { item_id, claimer_id, owner_id } = claimData;
    
    const result = await pool.query(
      `INSERT INTO claims (item_id, claimer_id, owner_id) VALUES ($1, $2, $3) RETURNING id`,
      [item_id, claimer_id, owner_id]
    );
    
    // Update item status to claimed
    await pool.query('UPDATE items SET status = $1 WHERE id = $2', ['claimed', item_id]);
    
    return this.findById(result.rows[0].id);
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT c.*, 
              i.title as item_title, i.description as item_description,
              u1.first_name as claimer_first, u1.last_name as claimer_last,
              u2.first_name as owner_first, u2.last_name as owner_last
       FROM claims c
       JOIN items i ON c.item_id = i.id
       JOIN users u1 ON c.claimer_id = u1.id
       LEFT JOIN users u2 ON c.owner_id = u2.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByItemId(item_id) {
    const result = await pool.query(
      `SELECT c.*, 
              u1.first_name as claimer_first, u1.last_name as claimer_last,
              u2.first_name as owner_first, u2.last_name as owner_last
       FROM claims c
       JOIN users u1 ON c.claimer_id = u1.id
       LEFT JOIN users u2 ON c.owner_id = u2.id
       WHERE c.item_id = $1`,
      [item_id]
    );
    return result.rows;
  }

  static async updateStatus(id, status, verification_notes = null) {
    await pool.query(
      'UPDATE claims SET status = $1, verification_notes = $2 WHERE id = $3',
      [status, verification_notes, id]
    );
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
    const query = `UPDATE claims SET ${fields.join(', ')} WHERE id = $${paramCount}`;
    
    await pool.query(query, values);
    return this.findById(id);
  }

  static async delete(id) {
    const claim = await this.findById(id);
    if (!claim) return false;

    // Update item status back to found when claim is deleted
    await pool.query('UPDATE items SET status = $1 WHERE id = $2', ['found', claim.item_id]);
    
    const result = await pool.query('DELETE FROM claims WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async getUserClaims(user_id) {
    const result = await pool.query(
      `SELECT c.*, i.title as item_title, i.image_url as item_image
       FROM claims c
       JOIN items i ON c.item_id = i.id
       WHERE c.claimer_id = $1 OR c.owner_id = $2
       ORDER BY c.created_at DESC`,
      [user_id, user_id]
    );
    return result.rows;
  }
}

module.exports = Claim;