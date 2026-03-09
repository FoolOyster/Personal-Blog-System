# 项目结构说明

## 目录结构

```
个人博客系统/
├── backend/              # 后端项目
│   ├── src/             # 源代码
│   │   ├── config/      # 配置文件
│   │   ├── controllers/ # 控制器
│   │   ├── middleware/  # 中间件
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由
│   │   └── server.js    # 入口文件
│   ├── .env             # 环境变量（不提交到 Git）
│   ├── .env.example     # 环境变量模板
│   ├── package.json     # 依赖配置
│   ├── api-test.http    # API 测试文件
│   └── README.md        # 后端文档
│
├── frontend/            # 前端项目（待创建）
│
├── database.md          # 数据库设计文档
├── PRD.md              # 产品需求文档
├── .gitignore          # Git 忽略文件
└── README.md           # 项目总览
```

## 开发指南

### 后端开发

```bash
cd backend
npm install
npm run init-db  # 初始化数据库
npm run dev      # 启动开发服务器
```

### 前端开发

待创建

## 注意事项

1. 后端和前端项目完全独立，各自有独立的 `node_modules` 和 `package.json`
2. 环境变量文件 `.env` 不会提交到 Git，需要从 `.env.example` 复制并配置
3. 数据库配置在 `backend/.env` 中
