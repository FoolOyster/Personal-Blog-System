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
      `SELECT p.*, u.username as author_name, u.avatar as author_avatar, c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    // MySQL JSON 类型会自动转换，不需要 JSON.parse()
    if (rows[0] && !rows[0].tags) {
      rows[0].tags = [];
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
      `SELECT p.id, p.title, p.content, p.cover, p.category_id, p.tags, p.views,
              p.created_at, p.updated_at,
              u.username as author_name, u.avatar as author_avatar, c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // MySQL JSON 类型会自动转换，不需要 JSON.parse()
    rows.forEach(row => {
      if (!row.tags) {
        row.tags = [];
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

  // 获取用户文章列表（用于个人中心）
  static async findByAuthor(authorId, options = {}) {
    const { page = 1, pageSize = 100 } = options;
    const offset = (page - 1) * pageSize;

    // 查询用户的文章列表
    const [rows] = await db.query(
      `SELECT p.id, p.title, p.content, p.cover, p.category_id, p.tags, p.views,
              p.author_id, p.created_at, p.updated_at,
              u.username as author_name, u.avatar as author_avatar, c.name as category_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.author_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [authorId, pageSize, offset]
    );

    // 处理 tags
    rows.forEach(row => {
      if (!row.tags) {
        row.tags = [];
      }
    });

    // 查询总数
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM posts WHERE author_id = ?',
      [authorId]
    );

    return {
      posts: rows,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(countResult[0].total / pageSize)
    };
  }

  // 获取用户统计信息（高性能单次查询）
  static async getUserStats(authorId) {
    // 使用单次聚合查询获取所有统计数据
    const [statsRows] = await db.query(
      `SELECT
        COUNT(*) as totalPosts,
        COALESCE(SUM(views), 0) as totalViews,
        GROUP_CONCAT(DISTINCT tags) as allTags
       FROM posts
       WHERE author_id = ?`,
      [authorId]
    );

    const stats = statsRows[0];

    // 处理标签统计
    let uniqueTags = new Set();
    if (stats.allTags) {
      // 解析所有文章的 tags JSON 数组
      const tagsString = stats.allTags;
      // 匹配所有 JSON 数组中的标签
      const tagMatches = tagsString.match(/"([^"]+)"/g);
      if (tagMatches) {
        tagMatches.forEach(tag => {
          // 移除引号
          const cleanTag = tag.replace(/"/g, '');
          if (cleanTag) {
            uniqueTags.add(cleanTag);
          }
        });
      }
    }

    return {
      totalPosts: parseInt(stats.totalPosts) || 0,
      totalViews: parseInt(stats.totalViews) || 0,
      totalTags: uniqueTags.size
    };
  }
}

module.exports = Post;
