const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, name, email, password, role = 'user' } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO users (username, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [username, name, email, hashedPassword, role]);
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
    const query = 'SELECT id, username, name, email, role, created_at FROM users WHERE id = ? AND is_active = true LIMIT 1';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
  
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user profile
  static async update(userId, updateData) {
    const { name, email, username } = updateData;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    
    if (updates.length === 0) {
      throw new Error('No fields to update');
    }
    
    // Add userId at the end for WHERE clause
    values.push(userId);
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = true
    `;
    
    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update password (separate method for security)
  static async updatePassword(userId, currentPassword, newPassword) {
    // First get user with password to verify
    const query = 'SELECT * FROM users WHERE id = ? AND is_active = true LIMIT 1';
    const [rows] = await db.execute(query, [userId]);
    const user = rows[0];
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const updateQuery = `
      UPDATE users 
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const [result] = await db.execute(updateQuery, [hashedPassword, userId]);
    return result.affectedRows > 0;
  }

  // Check if email exists (excluding current user)
  static async emailExists(email, excludeUserId) {
    const query = 'SELECT id FROM users WHERE email = ? AND id != ? AND is_active = true LIMIT 1';
    const [rows] = await db.execute(query, [email, excludeUserId]);
    return rows.length > 0;
  }

  // Check if username exists (excluding current user)
  static async usernameExists(username, excludeUserId) {
    const query = 'SELECT id FROM users WHERE username = ? AND id != ? AND is_active = true LIMIT 1';
    const [rows] = await db.execute(query, [username, excludeUserId]);
    return rows.length > 0;
  }

  // Soft delete user account
  static async deleteAccount(userId) {
    const query = `
      UPDATE users 
      SET is_active = false, 
          updated_at = CURRENT_TIMESTAMP,
          email = CONCAT(email, '_deleted_', UNIX_TIMESTAMP()),
          username = CONCAT(username, '_deleted_', UNIX_TIMESTAMP())
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;