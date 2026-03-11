# 数据库设计文档

## 数据库信息

- **数据库名**: blog_system
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **存储引擎**: InnoDB

## 表结构

### 用户表 (users)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 用户名 |
| email | VARCHAR(100) | NOT NULL, UNIQUE | 邮箱 |
| password | VARCHAR(255) | NOT NULL | 密码（bcrypt加密） |
| avatar | VARCHAR(255) | DEFAULT NULL | 头像URL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_username` (username)
- `idx_email` (email)

### 分类表 (categories)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 分类ID |
| name | VARCHAR(50) | NOT NULL, UNIQUE | 分类名称 |
| description | TEXT | NULL | 分类描述 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_name` (name)

**默认数据**:
- 技术 - 技术相关文章
- 生活 - 生活随笔
- 其他 - 其他分类

### 文章表 (posts)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 文章ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content | LONGTEXT | NOT NULL | 内容（Markdown格式） |
| cover | VARCHAR(255) | DEFAULT NULL | 封面图URL |
| category_id | INT | DEFAULT NULL | 分类ID |
| tags | JSON | DEFAULT NULL | 标签（JSON数组） |
| author_id | INT | NOT NULL | 作者ID |
| views | INT | DEFAULT 0 | 浏览次数 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `idx_author` (author_id)
- `idx_category` (category_id)
- `idx_created_at` (created_at)

**外键约束**:
- `author_id` REFERENCES users(id) ON DELETE CASCADE
- `category_id` REFERENCES categories(id) ON DELETE SET NULL

## 表关系

```
users (1) ----< (N) posts
categories (1) ----< (N) posts
```

- 一个用户可以发布多篇文章
- 一个分类可以包含多篇文章
- 删除用户时，其所有文章也会被删除（CASCADE）
- 删除分类时，文章的category_id会被设置为NULL（SET NULL）

## 初始化

运行以下命令初始化数据库：

```bash
cd backend
npm run init-db
```

该命令会执行 `src/config/schema.sql` 文件，创建数据库、表结构和默认分类数据。
