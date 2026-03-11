# 部署指南

## 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm 或 yarn

## 后端部署

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 配置环境变量
复制 `.env.example` 为 `.env` 并配置：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blog_db

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# 腾讯云COS配置
COS_SECRET_ID=your_secret_id
COS_SECRET_KEY=your_secret_key
COS_BUCKET=your_bucket_name
COS_REGION=ap-guangzhou
COS_CDN_DOMAIN=https://your-cdn-domain.com

# 服务器端口
PORT=3000
```

### 3. 初始化数据库
```bash
npm run init-db
```

### 4. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## 前端部署

### 1. 安装依赖
```bash
cd frontend
npm install
```

### 2. 配置API地址
修改 `src/api/axios.ts` 中的 `baseURL`：

```typescript
const api = axios.create({
  baseURL: 'https://your-api-domain.com/api',
  timeout: 10000,
});
```

### 3. 构建生产版本
```bash
npm run build
```

构建产物在 `dist` 目录。

### 4. 部署到服务器
将 `dist` 目录上传到服务器，配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 使用 PM2 管理进程

### 安装 PM2
```bash
npm install -g pm2
```

### 启动后端服务
```bash
cd backend
pm2 start src/server.js --name blog-backend
pm2 save
pm2 startup
```

### 常用命令
```bash
pm2 list          # 查看进程列表
pm2 logs          # 查看日志
pm2 restart all   # 重启所有进程
pm2 stop all      # 停止所有进程
```

## Docker 部署（可选）

### 后端 Dockerfile
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 前端 Dockerfile
```dockerfile
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=blog_db
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mysql:
    image: mysql:5.7
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=blog_db
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 注意事项

1. 生产环境务必修改 JWT_SECRET
2. 配置 HTTPS 证书
3. 定期备份数据库
4. 配置日志轮转
5. 监控服务器资源使用情况
