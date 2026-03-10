const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');

// 获取文章列表（公开）
router.get('/', postController.getPosts);

// 获取当前用户的文章列表（需要登录）
router.get('/my/posts', authMiddleware, postController.getMyPosts);

// 获取当前用户的统计信息（需要登录）
router.get('/my/stats', authMiddleware, postController.getMyStats);

// 获取文章详情（公开）
router.get('/:id', postController.getPostById);

// 创建文章（需要登录）
router.post('/', authMiddleware, postController.createPost);

// 更新文章（需要登录）
router.put('/:id', authMiddleware, postController.updatePost);

// 删除文章（需要登录）
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
