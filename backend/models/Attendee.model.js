const db = require('../config/db');

class Attendee {
  // RSVP to an event
  static async rsvp(userId, eventId, rsvpStatus = 'yes') {
    // Check if RSVP already exists
    const checkQuery = 'SELECT id, rsvp_status FROM attendees WHERE user_id = ? AND event_id = ?';
    const [existing] = await db.execute(checkQuery, [userId, eventId]);
    
    if (existing.length > 0) {
      // Update existing RSVP
      const updateQuery = 'UPDATE attendees SET rsvp_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await db.execute(updateQuery, [rsvpStatus, existing[0].id]);
      return { updated: true, rsvpStatus };
    } else {
      // Create new RSVP
      const insertQuery = 'INSERT INTO attendees (user_id, event_id, rsvp_status) VALUES (?, ?, ?)';
      const [result] = await db.execute(insertQuery, [userId, eventId, rsvpStatus]);
      return { created: true, id: result.insertId, rsvpStatus };
    }
  }

  // Get all attendees for an event
  static async findByEvent(eventId) {
    const query = `
      SELECT 
        a.*,
        u.username,
        u.email,
        u.name
      FROM attendees a
      JOIN users u ON a.user_id = u.id
      WHERE a.event_id = ?
      ORDER BY a.created_at DESC
    `;
    
    const [rows] = await db.execute(query, [eventId]);
    return rows;
  }

  // Get all events a user is attending
  static async findByUser(userId) {
    const query = `
      SELECT 
        a.*,
        e.title,
        e.description,
        e.date_time,
        e.status as event_status,
        v.name as venue_name,
        v.location as venue_location
      FROM attendees a
      JOIN events e ON a.event_id = e.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE a.user_id = ?
      ORDER BY e.date_time ASC
    `;
    
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Get RSVP status for a specific user and event
  static async getRsvpStatus(userId, eventId) {
    const query = 'SELECT rsvp_status FROM attendees WHERE user_id = ? AND event_id = ?';
    const [rows] = await db.execute(query, [userId, eventId]);
    return rows[0] || null;
  }

  // Cancel RSVP (delete)
  static async cancelRsvp(userId, eventId) {
    const query = 'DELETE FROM attendees WHERE user_id = ? AND event_id = ?';
    const [result] = await db.execute(query, [userId, eventId]);
    return result.affectedRows > 0;
  }

  // Get event statistics
  static async getEventStats(eventId) {
    const query = `
      SELECT 
        COUNT(CASE WHEN rsvp_status = 'yes' THEN 1 END) as confirmed,
        COUNT(CASE WHEN rsvp_status = 'maybe' THEN 1 END) as maybe,
        COUNT(CASE WHEN rsvp_status = 'no' THEN 1 END) as declined,
        COUNT(CASE WHEN rsvp_status = 'waitlist' THEN 1 END) as waitlisted,
        COUNT(*) as total_responses
      FROM attendees
      WHERE event_id = ?
    `;
    
    const [rows] = await db.execute(query, [eventId]);
    return rows[0];
  }

  // Check if user has RSVP'd to event
  static async hasRsvpd(userId, eventId) {
    const query = 'SELECT id FROM attendees WHERE user_id = ? AND event_id = ?';
    const [rows] = await db.execute(query, [userId, eventId]);
    return rows.length > 0;
  }
}

module.exports = Attendee;