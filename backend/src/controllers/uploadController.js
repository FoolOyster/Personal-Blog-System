const { uploadToCOS, deleteFromCOS, extractCOSKey } = require('../config/cos');
const { generateSafeFilename, compressImage } = require('../middleware/upload');
const db = require('../config/database');

/**
 * 上传头像
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const userId = req.user.id;
    const originalName = req.file.originalname;
    const fileName = generateSafeFilename(originalName, userId);

    // 压缩图片
    const compressedBuffer = await compressImage(req.file.buffer, 'avatar');

    // 上传到COS
    const imageUrl = await uploadToCOS(
      compressedBuffer,
      fileName,
      'avatar',
      req.file.mimetype
    );

    // 查询用户旧头像
    const [users] = await db.query('SELECT avatar FROM users WHERE id = ?', [userId]);
    const oldAvatar = users[0]?.avatar;

    // 更新数据库
    await db.query('UPDATE users SET avatar = ? WHERE id = ?', [imageUrl, userId]);

    // 记录到images表
    await db.query(
      'INSERT INTO images (user_id, type, url, cos_key, size) VALUES (?, ?, ?, ?, ?)',
      [userId, 'avatar', imageUrl, `avatars/${fileName}`, compressedBuffer.length]
    );

    // 删除旧头像（如果存在且不是默认头像）
    if (oldAvatar && oldAvatar.includes('avatars/')) {
      const oldKey = extractCOSKey(oldAvatar);
      if (oldKey) {
        try {
          await deleteFromCOS(oldKey);
          await db.query('DELETE FROM images WHERE cos_key = ?', [oldKey]);
        } catch (error) {
          console.error('删除旧头像失败:', error);
        }
      }
    }

    res.json({
      success: true,
      data: {
        url: imageUrl
      },
      message: '头像上传成功'
    });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.status(500).json({
      success: false,
      message: '上传失败，请稍后重试'
    });
  }
};

/**
 * 上传文章封面
 */
const uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const userId = req.user.id;
    const originalName = req.file.originalname;
    const fileName = generateSafeFilename(originalName, userId);

    // 压缩图片
    const compressedBuffer = await compressImage(req.file.buffer, 'cover');

    // 上传到COS
    const imageUrl = await uploadToCOS(
      compressedBuffer,
      fileName,
      'cover',
      req.file.mimetype
    );

    // 记录到images表
    await db.query(
      'INSERT INTO images (user_id, type, url, cos_key, size) VALUES (?, ?, ?, ?, ?)',
      [userId, 'cover', imageUrl, `covers/${fileName}`, compressedBuffer.length]
    );

    res.json({
      success: true,
      data: {
        url: imageUrl
      },
      message: '封面上传成功'
    });
  } catch (error) {
    console.error('上传封面失败:', error);
    res.status(500).json({
      success: false,
      message: '上传失败，请稍后重试'
    });
  }
};

/**
 * 上传文章内容图片
 */
const uploadContent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const userId = req.user.id;
    const originalName = req.file.originalname;
    const fileName = generateSafeFilename(originalName, userId);

    // 压缩图片
    const compressedBuffer = await compressImage(req.file.buffer, 'content');

    // 上传到COS
    const imageUrl = await uploadToCOS(
      compressedBuffer,
      fileName,
      'content',
      req.file.mimetype
    );

    // 记录到images表
    await db.query(
      'INSERT INTO images (user_id, type, url, cos_key, size) VALUES (?, ?, ?, ?, ?)',
      [userId, 'content', imageUrl, `content/${fileName}`, compressedBuffer.length]
    );

    res.json({
      success: true,
      data: {
        url: imageUrl
      },
      message: '图片上传成功'
    });
  } catch (error) {
    console.error('上传内容图片失败:', error);
    res.status(500).json({
      success: false,
      message: '上传失败，请稍后重试'
    });
  }
};

/**
 * 删除图片
 */
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查询图片信息
    const [images] = await db.query(
      'SELECT * FROM images WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: '图片不存在或无权删除'
      });
    }

    const image = images[0];

    // 从COS删除
    await deleteFromCOS(image.cos_key);

    // 从数据库删除
    await db.query('DELETE FROM images WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '图片删除成功'
    });
  } catch (error) {
    console.error('删除图片失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败，请稍后重试'
    });
  }
};

/**
 * 获取用户上传的图片列表
 */
const getUserImages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, page = 1, limit = 20 } = req.query;

    let query = 'SELECT * FROM images WHERE user_id = ?';
    const params = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [images] = await db.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM images WHERE user_id = ?';
    const countParams = [userId];
    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
    }
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        images,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取图片列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败，请稍后重试'
    });
  }
};

module.exports = {
  uploadAvatar,
  uploadCover,
  uploadContent,
  deleteImage,
  getUserImages
};
