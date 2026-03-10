const multer = require('multer');
const path = require('path');
const { ALLOWED_TYPES, MAX_SIZE } = require('../config/cos');

// 使用内存存储，不落盘
const storage = multer.memoryStorage();

/**
 * 文件过滤器
 */
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，仅支持 JPEG、PNG、WebP、GIF 格式'), false);
  }
};

/**
 * 生成安全的文件名
 * @param {string} originalName - 原始文件名
 * @param {number} userId - 用户ID
 * @returns {string} - 安全的文件名
 */
const generateSafeFilename = (originalName, userId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName).toLowerCase();
  return `${userId}-${timestamp}-${random}${ext}`;
};

/**
 * 创建上传中间件
 * @param {string} type - 上传类型（avatar/cover/content）
 * @returns {Function} - Multer中间件
 */
const createUploadMiddleware = (type) => {
  return multer({
    storage,
    limits: {
      fileSize: MAX_SIZE[type]
    },
    fileFilter
  }).single('image');
};

/**
 * 处理上传错误的中间件
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超出限制'
      });
    }
    return res.status(400).json({
      success: false,
      message: '文件上传失败：' + err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  createUploadMiddleware,
  handleUploadError,
  generateSafeFilename
};
