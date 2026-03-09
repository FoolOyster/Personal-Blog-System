const db = require('../config/database');

class Post {
  // 创建文章
  static async create(postData) {
    const { title, content, cover, category_id, tags, author_id } = postData;
    const [result] = await db.query(
      'INSERT INTO posts (title, content, cover, category_id, tags, author_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, cover, category_id, JSON.stringify(tags), author_id]
    );
    return result.insertId;
  }

  // 根据 ID 查找文章
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, u.username as author_name, c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows[0] && rows[0].tags) {
      rows[0].tags = JSON.parse(rows[0].tags);
    }
    return rows[0];
  }

  // 获取文章列表（支持分页、分类筛选、搜索）
  static async findAll(options = {}) {
    const { page = 1, pageSize = 10, category_id, keyword } = options;
    const offset = (page - 1) * pageSize;

    let whereConditions = [];
    let params = [];

    // 分类筛选
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }

    // 关键词搜索
    if (keyword) {
      whereConditions.push('(p.title LIKE ? OR p.content LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // 查询文章列表
    const [rows] = await db.query(
      `SELECT p.id, p.title, p.cover, p.category_id, p.tags, p.views,
              p.created_at, p.updated_at,
              u.username as author_name, c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // 解析 tags JSON
    rows.forEach(row => {
      if (row.tags) {
        row.tags = JSON.parse(row.tags);
      }
    });

    // 查询总数
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM posts p ${whereClause}`,
      params
    );

    return {
      posts: rows,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(countResult[0].total / pageSize)
    };
  }

  // 更新文章
  static async update(id, postData) {
    const fields = [];
    const values = [];

    Object.keys(postData).forEach(key => {
      if (postData[key] !== undefined) {
        if (key === 'tags') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(postData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(postData[key]);
        }
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.query(
      `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // 删除文章
  static async delete(id) {
    const [result] = await db.query('DELETE FROM posts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // 增加浏览次数
  static async incrementViews(id) {
    await db.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);
  }

  // 检查文章是否属于指定用户
  static async isOwner(postId, userId) {
    const [rows] = await db.query(
      'SELECT author_id FROM posts WHERE id = ?',
      [postId]
    );
    return rows[0] && rows[0].author_id === userId;
  }
}

module.exports = Post;
