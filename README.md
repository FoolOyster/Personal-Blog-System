# 个人博客系统

全栈博客系统，包含前端和后端。支持Markdown编辑、文章管理、分类筛选、搜索等功能。

## 项目结构

```
.
├── backend/          # 后端项目（Node.js + Express + MySQL）
├── frontend/         # 前端项目（React + TypeScript + Vite）
├── database.md       # 数据库设计文档
├── PRD.md           # 产品需求文档
├── AGENTS.md        # 开发规范文档
└── README.md        # 项目说明
```

## 功能特性

### 核心功能
- ✅ 用户注册/登录（JWT认证）
- ✅ Markdown文章编写（实时预览）
- ✅ 文章列表展示（横向卡片布局）
- ✅ 文章详情页（Markdown渲染）
- ✅ 文章分类管理
- ✅ 文章搜索功能
- ✅ 个人中心（文章管理、统计信息）
- ✅ 文章浏览量统计

### 界面特色
- 🎨 极光渐变主题（蓝、紫、粉色调）
- 🎭 流畅的动画效果
- 📱 完整的响应式设计
- 🎯 可复用的PostCard组件
- 📝 智能Markdown摘要提取

## 后端项目

详见 [backend/README.md](backend/README.md)

### 快速开始

```bash
cd backend
npm install
npm run init-db
npm run dev
```

后端服务运行在 http://localhost:3000

## 前端项目

详见 [frontend/README.md](frontend/README.md)

### 快速开始

```bash
cd frontend
npm install
npm run dev
```

前端应用运行在 http://localhost:5173

## 技术栈

### 后端
- Node.js + Express
- MySQL 数据库
- JWT 认证
- bcrypt 密码加密
- 高性能SQL聚合查询

### 前端
- React 18 + TypeScript
- Vite 构建工具
- React Router DOM 路由
- Axios HTTP客户端
- React Markdown 渲染
- CSS自定义属性（主题系统）

## 开发规范

详见 [AGENTS.md](AGENTS.md)

### 代码提交规范
- feat: 新功能
- fix: 修复bug
- chore: 构建/工具链相关
- docs: 文档更新
- 提交信息使用中文描述

### 代码风格
- 组件名使用 PascalCase
- 函数名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 代码注释使用中文

## 最近更新

### v1.2.0 (2024-12)
- 创建可复用PostCard组件
- 优化文章卡片布局（封面左侧，内容右侧）
- 支持Markdown内容智能提取纯文本摘要
- 修复首页文章列表缺少content字段的问题
- 摘要支持保留换行符显示

### v1.1.0 (2024-12)
- 实现Markdown编辑器写文章页
- 重新设计个人中心页面
- 实现后端统计信息API（毫秒级性能）
- 修复页面顶部被Header遮挡问题

### v1.0.0 (2024-12)
- 完成基础博客系统功能
- 实现用户认证系统
- 实现文章CRUD功能
- 实现极光渐变主题界面

## 许可证

MIT
