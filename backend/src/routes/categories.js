const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// 获取所有分类
router.get('/', categoryController.getCategories);

// 获取分类详情
router.get('/:id', categoryController.getCategoryById);

module.exports = router;
