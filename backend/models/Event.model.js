const db = require('../config/db');

class Event {
  // Create new event
  static async create(eventData) {
    const { title, description, date_time, venue_id, created_by, status = 'published' } = eventData;
    
    const query = `
      INSERT INTO events (title, description, date_time, venue_id, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [title, description, date_time, venue_id, created_by, status]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Get all events with details
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        e.*,
        v.name as venue_name,
        v.location as venue_location,
        v.capacity as venue_capacity,
        u.username as creator_username,
        (SELECT COUNT(*) FROM attendees WHERE event_id = e.id AND rsvp_status = 'yes') as confirmed_attendees
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filters
    if (filters.status) {
      query += ' AND e.status = ?';
      params.push(filters.status);
    }
    
    if (filters.created_by) {
      query += ' AND e.created_by = ?';
      params.push(filters.created_by);
    }
    
    // Only show future events by default
    if (filters.upcoming !== false) {
      query += ' AND e.date_time >= NOW()';
    }
    
    query += ' ORDER BY e.date_time ASC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  // Get single event by ID
  static async findById(id) {
    const query = `
      SELECT 
        e.*,
        v.name as venue_name,
        v.location as venue_location,
        v.capacity as venue_capacity,
        u.username as creator_username,
        u.email as creator_email,
        (SELECT COUNT(*) FROM attendees WHERE event_id = e.id AND rsvp_status = 'yes') as confirmed_attendees
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Update event
  static async update(id, eventData) {
    const { title, description, date_time, venue_id, status } = eventData;
    
    const query = `
      UPDATE events 
      SET title = ?, description = ?, date_time = ?, venue_id = ?, status = ?
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [title, description, date_time, venue_id, status, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete event (soft delete by setting status)
  static async delete(id) {
    const query = `UPDATE events SET status = 'cancelled' WHERE id = ?`;
    
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Check if user is event creator
  static async isCreator(eventId, userId) {
    const query = 'SELECT created_by FROM events WHERE id = ?';
    const [rows] = await db.execute(query, [eventId]);
    
    if (rows.length === 0) return false;
    return rows[0].created_by === userId;
  }
}

module.exports = Event;