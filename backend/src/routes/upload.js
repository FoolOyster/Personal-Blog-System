const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createUploadMiddleware } = require('../middleware/upload');
const {
  uploadAvatar,
  uploadCover,
  uploadContent,
  deleteImage,
  getUserImages
} = require('../controllers/uploadController');

// 包装上传中间件，处理multer错误
const wrapUploadMiddleware = (type, handler) => {
  return (req, res, next) => {
    const upload = createUploadMiddleware(type);
    upload(req, res, (err) => {
      if (err) {
        // 处理multer错误
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: '文件大小超出限制'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || '文件上传失败'
        });
      }
      // 没有错误，继续执行handler
      handler(req, res, next);
    });
  };
};

// 上传头像
router.post('/avatar', verifyToken, wrapUploadMiddleware('avatar', uploadAvatar));

// 上传文章封面
router.post('/cover', verifyToken, wrapUploadMiddleware('cover', uploadCover));

// 上传文章内容图片
router.post('/content', verifyToken, wrapUploadMiddleware('content', uploadContent));

// 删除图片
router.delete('/:id', verifyToken, deleteImage);

// 获取用户上传的图片列表
router.get('/list', verifyToken, getUserImages);

module.exports = router;
