const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createUploadMiddleware, handleUploadError } = require('../middleware/upload');
const {
  uploadAvatar,
  uploadCover,
  uploadContent,
  deleteImage,
  getUserImages
} = require('../controllers/uploadController');

// 上传头像
router.post(
  '/avatar',
  verifyToken,
  createUploadMiddleware('avatar'),
  handleUploadError,
  uploadAvatar
);

// 上传文章封面
router.post(
  '/cover',
  verifyToken,
  createUploadMiddleware('cover'),
  handleUploadError,
  uploadCover
);

// 上传文章内容图片
router.post(
  '/content',
  verifyToken,
  createUploadMiddleware('content'),
  handleUploadError,
  uploadContent
);

// 删除图片
router.delete('/:id', verifyToken, deleteImage);

// 获取用户上传的图片列表
router.get('/list', verifyToken, getUserImages);

module.exports = router;
