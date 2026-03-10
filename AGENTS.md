# 个人博客系统开发指令

## 项目概述

拥有完整前后端的个人博客系统，支持Markdown编辑、文章管理、用户认证等功能。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- React Router DOM
- Axios
- React Markdown

### 后端
- Node.js + Express
- MySQL 数据库
- JWT 认证
- bcrypt 密码加密

## 开发规范

### 代码质量
- 错误要有友好的提示
- 组件要可复用（如PostCard组件）
- 代码要有注释 - 使用中文注释
- 请使用中文来写文档
- 优先使用函数式组件和Hooks

### API设计
- RESTful API规范
- 统一的响应格式：`{ success: boolean, data?: any, message?: string }`
- 需要认证的接口使用JWT中间件
- 查询接口返回完整数据（避免缺少字段）

### 性能优化
- 后端使用SQL聚合查询提升性能
- 前端使用React.memo优化渲染
- 图片使用lazy loading
- 合理使用Promise.all并行请求

## 代码风格

- 使用 ESLint 和 Prettier
- 组件名使用 PascalCase（如：PostCard、Profile）
- 函数名使用 camelCase（如：loadPosts、getPlainTextExcerpt）
- 常量使用 UPPER_SNAKE_CASE
- CSS类名使用kebab-case或BEM命名

## 设计要求

### 主题风格
- 保持明亮界面，极光渐变主题
- 主色调：蓝色(#4FACFE)、紫色(#C445A9)、粉色(#FF6B9D)
- 各种交互有流畅的动画效果
- 确保移动端适配（响应式设计）

### 布局规范
- 文章卡片：横向布局，封面在左，内容在右
- 卡片高度：桌面270px，平板240px，移动端自适应
- 最大内容宽度：1200px居中显示
- 间距使用rem单位

## 组件规范

### PostCard组件
- 支持有封面和无封面两种模式
- 智能提取Markdown纯文本摘要（150字符）
- 支持可选的编辑按钮（个人中心使用）
- 保留换行符显示（white-space: pre-line）

### 页面组件
- 统一的loading状态
- 统一的empty状态
- 统一的错误处理

## 测试要求

- 每个功能完成后手动测试
- 确保数据正确存储和读取
- 测试各种边界情况
- 测试响应式布局（桌面、平板、移动端）

## 注意事项

- 要处理 API 调用失败的情况
- 加载时要有明确的提示
- 避免重复代码，提取可复用组件
- 注意SQL注入和XSS攻击防护
- 敏感信息不要提交到git（使用.gitignore）

## 代码提交

### 提交规范
- 每次完成有意义的代码或文件修改后，使用 git commit 指令提交修改
- 自主修改 .gitignore 文件，项目中依赖文件或日志文件或测试功能等代码或环境变量文件无需提交
- 提交命名请遵照：`类型: 中文描述`

### 提交类型
- `feat`: 新功能
- `fix`: 修复bug
- `chore`: 构建/工具链相关
- `docs`: 文档更新
- `refactor`: 代码重构
- `style`: 代码格式调整
- `perf`: 性能优化

### 提交示例
```bash
git commit -m "feat: 创建可复用PostCard组件并重构首页和个人中心文章卡片布局"
git commit -m "fix: 修复首页文章列表接口缺少content字段导致摘要无法显示的问题"
git commit -m "docs: 更新README添加最新功能说明"
```

## 常见问题

### 前端
- 组件未读取文件就编辑：先使用Read工具读取文件
- 图片路径问题：使用相对路径或绝对URL
- 状态管理：优先使用useState和useEffect

### 后端
- SQL查询缺少字段：确保SELECT包含所有需要的字段
- 认证问题：检查JWT token是否正确传递
- 跨域问题：配置CORS中间件

## 开发流程

1. 理解需求
2. 设计方案（必要时创建可复用组件）
3. 编写代码（遵循规范）
4. 自测功能
5. 提交代码（规范的commit message）
6. 更新文档
