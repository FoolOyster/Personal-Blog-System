# 博客前端项目

基于 React + TypeScript + Vite 构建的个人博客系统前端。

## 技术栈

- React 18
- TypeScript
- Vite
- React Router DOM
- Axios
- React Markdown

## 安装步骤

\`\`\`bash
npm install
\`\`\`

## 开发

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:5173

## 构建

\`\`\`bash
npm run build
\`\`\`

## 项目结构

\`\`\`
src/
├── api/           # API 接口
├── components/    # 公共组件
├── pages/         # 页面组件
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
├── App.tsx        # 应用入口
└── main.tsx       # 主文件
\`\`\`

## 路由

- \`/\` - 首页（文章列表）
- \`/post/:id\` - 文章详情
- \`/write\` - 写文章（需要登录）
- \`/profile\` - 个人中心（需要登录）
- \`/login\` - 登录
- \`/register\` - 注册

## API 配置

后端 API 地址配置在 \`src/api/axios.ts\` 中，默认为 \`http://localhost:3000/api\`
