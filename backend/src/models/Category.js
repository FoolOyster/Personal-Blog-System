const db = require('../config/database');

class Category {
  // 获取所有分类
  static async findAll() {
    const [rows] = await db.query(
      'SELECT id, name, description, created_at FROM categories ORDER BY id ASC'
    );
    return rows;
  }

  // 根据 ID 查找分类
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, description, created_at FROM categories WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // 创建分类
  static async create(categoryData) {
    const { name, description } = categoryData;
    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  }

  // 更新分类
  static async update(id, categoryData) {
    const fields = [];
    const values = [];

    Object.keys(categoryData).forEach(key => {
      if (categoryData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(categoryData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // 删除分类
  static async delete(id) {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Category;
