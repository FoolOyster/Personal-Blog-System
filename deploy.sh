#!/bin/bash

# 博客系统部署脚本
# 使用方法: ./deploy.sh

set -e

echo "=== 开始部署博客系统 ==="

# 1. 拉取最新代码
echo "1. 拉取最新代码..."
git pull origin main

# 2. 部署后端
echo "2. 部署后端..."
cd backend
npm install --production
pm2 restart blog-backend || pm2 start src/server.js --name blog-backend
cd ..

# 3. 构建前端
echo "3. 构建前端..."
cd frontend
npm install
npm run build
cd ..

# 4. 重启 Nginx
echo "4. 重启 Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "=== 部署完成 ==="
