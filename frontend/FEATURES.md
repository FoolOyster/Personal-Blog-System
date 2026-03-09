# 功能清单

## 用户认证功能 ✅

### 1. AuthContext 全局状态管理
- ✅ 创建 AuthContext 提供全局认证状态
- ✅ 实现 `useAuth` hook 方便组件访问认证状态
- ✅ 提供 `login`、`logout`、`updateUser` 方法
- ✅ 自动从 localStorage 恢复登录状态

### 2. Token 管理
- ✅ Token 存储在 localStorage
- ✅ Axios 拦截器自动在请求头添加 token
- ✅ 401 响应自动清除 token 并跳转登录页

### 3. 路由保护
- ✅ PrivateRoute 组件保护需要登录的页面
- ✅ 未登录用户访问受保护页面自动跳转到登录页
- ✅ 登录后自动跳转到首页

### 4. 页面实现
- ✅ 登录页面（/login）
  - 用户名和密码输入
  - 表单验证
  - 错误提示
  - 跳转到注册页链接

- ✅ 注册页面（/register）
  - 用户名、邮箱、密码输入
  - 表单验证（用户名 3-20 字符，密码至少 6 位）
  - 注册成功后自动跳转登录页
  - 跳转到登录页链接

- ✅ 个人中心（/profile）
  - 显示用户信息
  - 退出登录功能

### 5. Header 导航
- ✅ 根据登录状态显示不同菜单
- ✅ 未登录：显示"登录"和"注册"
- ✅ 已登录：显示"写文章"和用户名

## 文章功能 ✅

### 1. 文章列表（/）
- ✅ 分页显示文章
- ✅ 显示标题、作者、浏览数、标签、创建时间
- ✅ 点击标题跳转到文章详情

### 2. 文章详情（/post/:id）
- ✅ 显示完整文章内容（Markdown 渲染）
- ✅ 显示封面图、标签、作者、浏览数
- ✅ 自动增加浏览次数
- ✅ 作者可以编辑和删除自己的文章

### 3. 写文章（/write）
- ✅ 需要登录才能访问
- ✅ 支持标题、内容、封面、标签输入
- ✅ 内容支持 Markdown 格式
- ✅ 支持编辑已有文章（通过 URL 参数 ?id=xxx）

## 技术实现

### 前端
- ✅ React 18 + TypeScript
- ✅ Vite 构建工具
- ✅ React Router DOM 路由管理
- ✅ Axios HTTP 请求
- ✅ React Markdown 渲染
- ✅ Context API 状态管理

### 后端
- ✅ Node.js + Express
- ✅ MySQL 数据库
- ✅ JWT 认证
- ✅ bcrypt 密码加密
- ✅ RESTful API 设计

## API 接口

### 认证接口
- ✅ POST /api/auth/register - 用户注册
- ✅ POST /api/auth/login - 用户登录

### 文章接口
- ✅ GET /api/posts - 获取文章列表（支持分页、搜索、分类筛选）
- ✅ GET /api/posts/:id - 获取文章详情
- ✅ POST /api/posts - 创建文章（需要登录）
- ✅ PUT /api/posts/:id - 更新文章（需要登录，仅作者）
- ✅ DELETE /api/posts/:id - 删除文章（需要登录，仅作者）

## 项目结构

```
个人博客系统/
├── backend/              # 后端项目
│   ├── src/
│   │   ├── config/      # 数据库配置
│   │   ├── controllers/ # 控制器
│   │   ├── middleware/  # 中间件（JWT 认证）
│   │   ├── models/      # 数据模型
│   │   └── routes/      # 路由
│   └── package.json
│
├── frontend/            # 前端项目
│   ├── src/
│   │   ├── api/        # API 封装
│   │   ├── components/ # 公共组件
│   │   ├── contexts/   # Context（AuthContext）
│   │   ├── pages/      # 页面组件
│   │   ├── types/      # TypeScript 类型
│   │   └── utils/      # 工具函数
│   └── package.json
│
└── README.md
```
