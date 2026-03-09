# 博客后端系统

基于 Node.js 和 Express 构建的个人博客系统后端。

## 安装步骤

1. 安装依赖：
```bash
npm install
```

2. 从 `.env.example` 创建 `.env` 文件：
```bash
cp .env.example .env
```

3. 更新 `.env` 文件，填写数据库凭据和 JWT 密钥。

4. 初始化数据库：
```bash
npm run init-db
```

5. 启动服务器：
```bash
npm run dev  # 开发模式（使用 nodemon）
npm start    # 生产模式
```

## 项目结构

```
src/
├── config/       # 配置文件（数据库等）
├── controllers/  # 请求处理器
├── middleware/   # 自定义中间件
├── models/       # 数据模型
├── routes/       # API 路由
└── server.js     # 应用入口文件
```

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
  - 请求体：`{ username, email, password }`
  - 验证规则：用户名 3-20 字符，邮箱格式正确，密码至少 6 位

- `POST /api/auth/login` - 用户登录
  - 请求体：`{ username, password }`
  - 返回：JWT token 和用户信息

### 其他接口
- `GET /health` - 健康检查接口

## 数据库结构

### 用户表 (users)
- id - 主键
- username - 用户名（唯一）
- email - 邮箱（唯一）
- password - 密码（加密存储）
- avatar - 头像 URL
- created_at - 创建时间

### 分类表 (categories)
- id - 主键
- name - 分类名称（唯一）
- description - 分类描述
- created_at - 创建时间

### 文章表 (posts)
- id - 主键
- title - 标题
- content - 内容（Markdown 格式）
- cover - 封面图 URL
- category_id - 分类 ID（外键）
- tags - 标签（JSON 数组）
- author_id - 作者 ID（外键）
- views - 浏览次数
- created_at - 创建时间
- updated_at - 更新时间

## JWT_SECRET 生成

使用以下命令生成安全的随机密钥：
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

将生成的密钥复制到 `.env` 文件的 `JWT_SECRET` 字段中。
