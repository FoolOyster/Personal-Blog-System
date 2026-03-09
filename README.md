# 个人博客系统

全栈博客系统，包含前端和后端。

## 项目结构

```
.
├── backend/          # 后端项目（Node.js + Express + MySQL）
├── frontend/         # 前端项目（React + TypeScript + Vite）
├── database.md       # 数据库设计文档
├── PRD.md           # 产品需求文档
└── README.md        # 项目说明
```

## 后端项目

详见 [backend/README.md](backend/README.md)

### 快速开始

```bash
cd backend
npm install
npm run init-db
npm run dev
```

## 前端项目

详见 [frontend/README.md](frontend/README.md)

### 快速开始

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

## 技术栈

### 后端
- Node.js + Express
- MySQL
- JWT 认证
- bcrypt 密码加密

### 前端
- React 18 + TypeScript
- Vite
- React Router DOM
- Axios
- React Markdown
