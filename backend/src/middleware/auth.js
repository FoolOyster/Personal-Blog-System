const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    // 1. 从请求头获取 token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 2. 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. 查找用户
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 4. 将用户信息附加到请求对象
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期'
      });
    }

    console.error('认证错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = authMiddleware;
