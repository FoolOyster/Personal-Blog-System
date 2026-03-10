const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createUploadMiddleware } = require('../middleware/upload');
const {
  uploadAvatar,
  uploadCover,
  uploadContent,
  deleteImage,
  getUserImages
} = require('../controllers/uploadController');

// 上传头像
router.post('/avatar', authMiddleware, (req, res, next) => {
  const upload = createUploadMiddleware('avatar');
  upload(req, res, (err) => {
    if (err) {
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
    uploadAvatar(req, res, next);
  });
});

// 上传文章封面
router.post('/cover', authMiddleware, (req, res, next) => {
  const upload = createUploadMiddleware('cover');
  upload(req, res, (err) => {
    if (err) {
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
    uploadCover(req, res, next);
  });
});

// 上传文章内容图片
router.post('/content', authMiddleware, (req, res, next) => {
  const upload = createUploadMiddleware('content');
  upload(req, res, (err) => {
    if (err) {
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
    uploadContent(req, res, next);
  });
});

// 删除图片
router.delete('/:id', authMiddleware, deleteImage);

// 获取用户上传的图片列表
router.get('/list', authMiddleware, getUserImages);

module.exports = router;
