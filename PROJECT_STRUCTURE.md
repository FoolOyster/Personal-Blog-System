# 项目结构说明

## 目录结构

```
个人博客系统/
├── backend/              # 后端项目
│   ├── src/             # 源代码
│   │   ├── config/      # 配置文件
│   │   │   ├── db.js           # 数据库配置
│   │   │   └── cos.js          # 腾讯云COS配置
│   │   ├── controllers/ # 控制器
│   │   │   ├── authController.js    # 认证控制器
│   │   │   ├── postController.js    # 文章控制器
│   │   │   ├── categoryController.js # 分类控制器
│   │   │   └── userController.js    # 用户控制器
│   │   ├── middleware/  # 中间件
│   │   │   ├── auth.js         # JWT认证中间件
│   │   │   └── upload.js       # 文件上传中间件
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由
│   │   │   ├── auth.js         # 认证路由
│   │   │   ├── posts.js        # 文章路由
│   │   │   ├── categories.js   # 分类路由
│   │   │   ├── users.js        # 用户路由
│   │   │   └── upload.js       # 上传路由
│   │   ├── utils/       # 工具函数
│   │   │   └── imageCleanup.js # 图片清理工具
│   │   └── server.js    # 入口文件
│   ├── .env             # 环境变量（不提交到 Git）
│   ├── .env.example     # 环境变量模板
│   ├── package.json     # 依赖配置
│   ├── api-test.http    # API 测试文件
│   └── README.md        # 后端文档
│
├── frontend/            # 前端项目
│   ├── src/
│   │   ├── api/         # API 接口
│   │   │   ├── axios.ts         # Axios 配置
│   │   │   └── index.ts         # API 导出
│   │   ├── assets/      # 静态资源
│   │   ├── components/  # 可复用组件（统一文件夹结构）
│   │   │   ├── Avatar/          # 头像组件
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Avatar.css
│   │   │   │   └── index.ts
│   │   │   ├── AvatarCropModal/ # 头像裁剪模态框
│   │   │   │   ├── AvatarCropModal.tsx
│   │   │   │   ├── AvatarCropModal.css
│   │   │   │   └── index.ts
│   │   │   ├── Header/          # 顶部导航栏
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Header.css
│   │   │   │   └── index.ts
│   │   │   ├── ImageUpload/     # 图片上传组件
│   │   │   │   ├── ImageUpload.tsx
│   │   │   │   ├── ImageUpload.css
│   │   │   │   └── index.ts
│   │   │   ├── PostCard/        # 文章卡片组件
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── PostCard.css
│   │   │   │   └── index.ts
│   │   │   └── PrivateRoute/    # 私有路由组件
│   │   │       ├── PrivateRoute.tsx
│   │   │       └── index.ts
│   │   ├── contexts/    # React Context
│   │   │   └── AuthContext.tsx  # 认证上下文
│   │   ├── hooks/       # 自定义 Hooks
│   │   │   └── useDocumentTitle.ts # 动态标题 Hook
│   │   ├── pages/       # 页面组件
│   │   │   ├── Home.tsx         # 首页
│   │   │   ├── Home.css
│   │   │   ├── Login.tsx        # 登录页
│   │   │   ├── Login.css
│   │   │   ├── Register.tsx     # 注册页
│   │   │   ├── Write.tsx        # 写文章页
│   │   │   ├── Write.css
│   │   │   ├── PostDetail.tsx   # 文章详情页
│   │   │   ├── PostDetail.css
│   │   │   ├── Profile.tsx      # 个人中心
│   │   │   └── Profile.css
│   │   ├── types/       # TypeScript 类型定义
│   │   │   └── index.ts
│   │   ├── utils/       # 前端工具函数
│   │   │   ├── auth.ts          # 认证工具
│   │   │   ├── cropImage.ts     # 图片裁剪工具
│   │   │   └── markdown.tsx     # Markdown工具
│   │   ├── App.tsx      # 应用入口
│   │   ├── App.css      # 应用样式
│   │   ├── index.css    # 全局样式
│   │   └── main.tsx     # 主入口
│   ├── package.json     # 依赖配置
│   └── README.md        # 前端文档
│
├── docs/                # 文档目录
│   └── plans/          # 设计和实现计划
│       ├── 2026-03-10-image-optimization-design.md
│       └── 2026-03-11-avatar-crop-editor-optimization.md
│
├── database.md          # 数据库设计文档
├── PRD.md              # 产品需求文档
├── AGENTS.md           # 开发规范文档
├── PROJECT_STRUCTURE.md # 项目结构说明（本文件）
├── .gitignore          # Git 忽略文件
└── README.md           # 项目总览
```

## 开发指南

### 后端开发

```bash
cd backend
npm install
npm run init-db  # 初始化数据库
npm run dev      # 启动开发服务器（http://localhost:3000）
```

### 前端开发

```bash
cd frontend
npm install
npm run dev      # 启动开发服务器（http://localhost:5173）
```

## 核心功能模块

### 1. 用户认证系统
- JWT Token 认证
- bcrypt 密码加密
- 登录/注册/登出功能
- 认证中间件保护路由

### 2. 文章管理系统
- Markdown 编辑器（实时预览）
- 完整的快捷键支持（格式化、插入、保存）
- 图片上传到腾讯云COS（前端压缩）
- 多种图片插入方式（粘贴、拖拽、工具栏、快捷键）
- 文章CRUD操作
- 分类筛选和搜索
- 浏览量统计
- 代码高亮显示

### 3. 图片管理系统
- 前端图片压缩（browser-image-compression）
- 上传到腾讯云COS
- 智能删除旧图片（更换头像/封面时）
- 文章删除时自动清理关联图片
- 头像裁剪功能（圆形裁剪、缩放、拖动）

### 4. 用户中心
- 个人信息展示
- 头像上传和裁剪
- 文章统计信息
- 文章管理（编辑、删除）

### 5. 界面系统
- 极光渐变主题
- 响应式布局
- 动态页面标题
- 统一的Avatar组件
- 可复用的PostCard组件
- 流畅的动画效果

## 注意事项

1. 后端和前端项目完全独立，各自有独立的 `node_modules` 和 `package.json`
2. 环境变量文件 `.env` 不会提交到 Git，需要从 `.env.example` 复制并配置
3. 数据库配置在 `backend/.env` 中
4. 腾讯云COS配置需要在 `backend/.env` 中设置：
   - `COS_SECRET_ID`: 腾讯云密钥ID
   - `COS_SECRET_KEY`: 腾讯云密钥Key
   - `COS_BUCKET`: COS存储桶名称
   - `COS_REGION`: COS地域
   - `COS_CDN_DOMAIN`: CDN加速域名
5. 图片上传限制：
   - 头像：最大2MB
   - 封面：最大5MB
   - 文章图片：最大10MB
6. 前端会自动压缩图片到1MB以内（保持良好画质）
7. 更换头像/封面时会自动删除旧图片
8. 删除文章时会自动删除关联的封面图片

## 技术亮点

### 性能优化
- 前端图片压缩（减轻服务器负担）
- 使用Web Worker进行压缩（不阻塞UI）
- SQL聚合查询（毫秒级统计性能）
- 智能图片删除（节省存储成本）

### 用户体验
- 实时Markdown预览
- 完整的编辑器快捷键
- 多种图片插入方式
- 头像裁剪功能
- 动态页面标题
- 流畅的动画效果
- 响应式设计

### 代码质量
- TypeScript类型安全
- 组件化设计
- 统一的组件结构（所有组件使用文件夹+index.ts模式）
- 可复用组件（Avatar、PostCard、ImageUpload）
- 统一的错误处理
- 清晰的代码注释
- 规范的Git提交信息

## 项目结构优化说明

### 前端组件组织规范
所有组件统一采用文件夹结构，每个组件包含：
- `ComponentName.tsx` - 组件实现
- `ComponentName.css` - 组件样式
- `index.ts` - 导出文件（统一导入接口）

**优势：**
1. **统一的导入方式**：`import Component from '../components/Component'`
2. **更好的组织性**：相关文件（组件+样式）集中管理
3. **易于维护**：添加新文件（如测试、类型定义）时结构清晰
4. **符合最佳实践**：遵循React社区标准组件组织方式

### 前后端utils目录说明
- **frontend/src/utils**：前端工具函数（auth.ts、cropImage.ts、markdown.tsx）
- **backend/src/utils**：后端工具函数（imageCleanup.js）

这两个utils目录服务于不同的运行环境，包含完全不同的功能，**不存在重复**。
