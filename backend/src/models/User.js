const db = require('../config/database');

class User {
  // 根据用户名查找用户
  static async findByUsername(username) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // 根据邮箱查找用户
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // 根据 ID 查找用户
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // 创建新用户
  static async create(userData) {
    const { username, email, password, avatar = null } = userData;
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)',
      [username, email, password, avatar]
    );
    return result.insertId;
  }

  // 更新用户信息
  static async update(id, userData) {
    const fields = [];
    const values = [];

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;
