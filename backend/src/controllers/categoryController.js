const Category = require('../models/Category');

// 获取所有分类
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('获取分类列表错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，获取分类列表失败'
    });
  }
};

// 根据 ID 获取分类
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('获取分类详情错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，获取分类详情失败'
    });
  }
};
