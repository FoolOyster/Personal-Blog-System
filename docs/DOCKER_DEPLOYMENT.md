# Docker 部署指南

## 快速开始

### 1. 配置环境变量

复制并编辑环境变量文件:

```bash
cp .env.docker .env
```

修改 `.env` 文件中的配置:
- `DB_PASSWORD`: 数据库密码
- `JWT_SECRET`: JWT 密钥
- `COS_SECRET_ID`: 腾讯云 COS 密钥 ID
- `COS_SECRET_KEY`: 腾讯云 COS 密钥
- `COS_BUCKET`: COS 存储桶名称
- `COS_CDN_DOMAIN`: CDN 域名

### 2. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 访问应用

- 前端: http://localhost
- 后端 API: http://localhost:3000/api

### 4. 初始化数据库

数据库会在首次启动时自动初始化。如果需要手动初始化:

```bash
docker-compose exec backend npm run init-db
```

## 常用命令

### 停止服务

```bash
docker-compose down
```

### 重启服务

```bash
docker-compose restart
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入数据库容器
docker-compose exec mysql mysql -u root -p
```

### 更新代码

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 生产环境部署

### 1. 修改端口映射

编辑 `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "80:80"  # HTTP
      - "443:443"  # HTTPS (需要配置 SSL)
```

### 2. 配置 SSL 证书

将 SSL 证书放在 `ssl/` 目录下,然后修改 `nginx.docker.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # ... 其他配置
}
```

修改 `docker-compose.yml` 挂载证书:

```yaml
frontend:
  volumes:
    - ./ssl:/etc/nginx/ssl:ro
```

### 3. 数据持久化

数据会自动保存在 Docker volumes 中:
- `mysql_data`: 数据库数据
- `./backend/uploads`: 上传的文件

### 4. 备份数据

```bash
# 备份数据库
docker-compose exec mysql mysqldump -u root -p blog_system > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u root -p blog_system < backup.sql
```

## 故障排查

### 查看容器状态

```bash
docker-compose ps
```

### 查看容器资源使用

```bash
docker stats
```

### 重新构建镜像

```bash
docker-compose build --no-cache
```

### 清理未使用的资源

```bash
docker system prune -a
```

## 性能优化

### 1. 调整 MySQL 配置

创建 `mysql.cnf`:

```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 256M
```

挂载到容器:

```yaml
mysql:
  volumes:
    - ./mysql.cnf:/etc/mysql/conf.d/custom.cnf
```

### 2. 启用 Nginx 缓存

在 `nginx.docker.conf` 中添加:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... 其他配置
}
```

## 安全建议

1. 修改默认密码
2. 使用强密码
3. 限制数据库端口访问
4. 配置防火墙规则
5. 定期更新镜像
6. 启用 HTTPS

## 监控

### 使用 Docker 自带监控

```bash
docker-compose logs -f --tail=100
```

### 集成第三方监控工具

可以集成 Prometheus、Grafana 等监控工具。
