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

4. 启动服务器：
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

- `GET /health` - 健康检查接口

## JWT_SECRET 生成

使用以下命令生成安全的随机密钥：
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

将生成的密钥复制到 `.env` 文件的 `JWT_SECRET` 字段中。
