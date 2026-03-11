# 个人博客系统

全栈博客系统，包含前端和后端。支持Markdown编辑、文章管理、分类筛选、搜索等功能。

## 📚 文档导航

- [项目结构说明](PROJECT_STRUCTURE.md) - 详细的目录结构和模块说明
- [开发规范](AGENTS.md) - Git提交规范和代码风格指南
- [API文档](docs/API.md) - 完整的后端API接口文档
- [部署指南](docs/DEPLOYMENT.md) - 生产环境部署步骤
- [更新日志](docs/CHANGELOG.md) - 版本更新记录
- [数据库设计](docs/DATABASE.md) - 数据库表结构设计
- [产品需求](docs/PRD.md) - 产品功能需求文档

## 项目结构

```
.
├── backend/          # 后端项目（Node.js + Express + MySQL）
├── frontend/         # 前端项目（React + TypeScript + Vite）
├── docs/            # 项目文档
├── AGENTS.md        # 开发规范文档
├── PROJECT_STRUCTURE.md  # 项目结构说明
└── README.md        # 项目说明（本文件）
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
- ✅ 头像裁剪上传（圆形裁剪、缩放调整）
- ✅ 图片上传到腾讯云COS（前端压缩、智能删除）

### 编辑器功能
- ⌨️ 完整的Markdown快捷键支持
  - Ctrl+B: 加粗
  - Ctrl+I: 斜体
  - Ctrl+Shift+H: 标题切换
  - Ctrl+K: 插入链接
  - Ctrl+Shift+C: 插入代码块
  - Ctrl+Shift+L: 插入列表
  - Ctrl+S: 保存草稿
  - Ctrl+Z/Y: 撤销/重做
- 🖼️ 多种图片插入方式
  - 粘贴上传（Ctrl+V）
  - 拖拽上传
  - 工具栏按钮
  - 快捷键（Ctrl+Shift+I）
- 💾 自动草稿保存到 localStorage

### 界面特色
- 🎨 极光渐变主题（蓝、紫、粉色调）
- 🎭 流畅的动画效果
- 📱 完整的响应式设计
- 🎯 可复用的PostCard组件
- 📝 智能Markdown摘要提取
- 🔄 动态页面标题（根据路由自动更新）
- 👤 统一的Avatar组件（支持头像和首字母显示）

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
- react-easy-crop 图片裁剪
- browser-image-compression 图片压缩
- react-markdown + remark-gfm Markdown渲染
- react-syntax-highlighter 代码高亮

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

### v1.3.0 (2026-03)
- 实现头像裁剪功能（圆形裁剪、缩放、拖动调整）
- 实现编辑器完整快捷键支持（格式化、插入、保存等）
- 实现编辑器图片插入功能（粘贴、拖拽、工具栏、快捷键）
- 实现动态页面标题（根据路由和内容自动更新）
- 修复写文章页面布局问题（动态计算Header高度）
- 优化图片上传流程（前端压缩、智能删除旧图片）
- 添加Markdown代码高亮支持
- 实现文章图片关联删除功能

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
