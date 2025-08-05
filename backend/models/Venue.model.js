const db = require('../config/db');

class Venue {
  // Create new venue
  static async create(venueData) {
    const { name, location, capacity } = venueData;
    
    const query = `
      INSERT INTO venues (name, location, capacity)
      VALUES (?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [name, location, capacity]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Get all venues
  static async findAll() {
    const query = `
      SELECT 
        v.*,
        (SELECT COUNT(*) FROM events WHERE venue_id = v.id AND status = 'published') as active_events
      FROM venues v
      ORDER BY v.name ASC
    `;
    
    const [rows] = await db.execute(query);
    return rows;
  }

  // Get single venue by ID
  static async findById(id) {
    const query = `
      SELECT 
        v.*,
        (SELECT COUNT(*) FROM events WHERE venue_id = v.id AND status = 'published') as active_events
      FROM venues v
      WHERE v.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Update venue
  static async update(id, venueData) {
    const { name, location, capacity } = venueData;
    
    const query = `
      UPDATE venues 
      SET name = ?, location = ?, capacity = ?
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [name, location, capacity, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete venue (only if no active events)
  static async delete(id) {
    // First check if venue has active events
    const checkQuery = `
      SELECT COUNT(*) as event_count 
      FROM events 
      WHERE venue_id = ? AND status IN ('published', 'draft')
    `;
    
    const [checkResult] = await db.execute(checkQuery, [id]);
    
    if (checkResult[0].event_count > 0) {
      throw new Error('Cannot delete venue with active events');
    }
    
    const query = `DELETE FROM venues WHERE id = ?`;
    
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Check if venue exists
  static async exists(id) {
    const query = 'SELECT id FROM venues WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0;
  }
}

module.exports = Venue;