-- Docker 数据库初始化脚本
-- 此脚本会在 MySQL 容器首次启动时自动执行

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像 URL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称',
  description TEXT COMMENT '分类描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '标题',
  content LONGTEXT NOT NULL COMMENT '内容（Markdown格式）',
  cover VARCHAR(255) DEFAULT NULL COMMENT '封面图 URL',
  category_id INT DEFAULT NULL COMMENT '分类ID',
  tags JSON DEFAULT NULL COMMENT '标签（JSON数组）',
  author_id INT NOT NULL COMMENT '作者ID',
  views INT DEFAULT 0 COMMENT '浏览次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_author (author_id),
  INDEX idx_category (category_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 插入默认分类
INSERT INTO categories (name, description) VALUES
  ('技术', '技术相关文章'),
  ('生活', '生活随笔'),
  ('其他', '其他分类')
ON DUPLICATE KEY UPDATE name=name;
