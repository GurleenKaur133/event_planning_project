const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, email, password, role = 'user' } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [username, email, hashedPassword, role]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = true LIMIT 1';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }
  
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ? AND is_active = true LIMIT 1';
    const [rows] = await db.execute(query, [username]);
    return rows[0];
  }
  
  static async findById(id) {
    const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = ? AND is_active = true LIMIT 1';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
  
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;