# 图片上传功能文档

## 功能概述

本系统集成了腾讯云COS对象存储服务，支持用户上传头像、文章封面和文章内容图片。所有图片经过压缩优化后上传到COS，并通过自定义域名访问。

## 技术架构

### 存储方案
- **存储服务**: 腾讯云COS（Cloud Object Storage）
- **访问权限**: 公开读 + 私有写
- **访问方式**: 自定义域名 + HTTPS
- **图片URL**: 永久有效，无需动态签名

### 技术栈
- **后端**: Node.js + Express + cos-nodejs-sdk-v5 + multer + sharp
- **前端**: React + TypeScript
- **数据库**: MySQL

## 目录结构

### 后端文件
```
backend/src/
├── config/
│   └── cos.js                    # COS配置和工具函数
├── middleware/
│   └── upload.js                 # 文件上传中间件
├── controllers/
│   └── uploadController.js       # 上传控制器
├── routes/
│   └── upload.js                 # 上传路由
└── models/
    └── Image.js                  # 图片数据库模型
```

### 前端文件
```
Markdown note-taking app/src/components/
└── ImageUpload/
    ├── ImageUpload.tsx           # 图片上传组件
    └── ImageUpload.css           # 组件样式
```

## API接口

### 1. 上传头像
```
POST /api/upload/avatar
```

**请求头**:
- `Authorization`: Bearer {token}
- `Content-Type`: multipart/form-data

**请求体**:
- `image`: 图片文件（最大2MB）

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://your-domain.com/avatars/1-1234567890-abc123.jpg"
  },
  "message": "头像上传成功"
}
```

### 2. 上传文章封面
```
POST /api/upload/cover
```

**请求头**:
- `Authorization`: Bearer {token}
- `Content-Type`: multipart/form-data

**请求体**:
- `image`: 图片文件（最大5MB）

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://your-domain.com/covers/1-1234567890-abc123.jpg"
  },
  "message": "封面上传成功"
}
```

### 3. 上传文章内容图片
```
POST /api/upload/content
```

**请求头**:
- `Authorization`: Bearer {token}
- `Content-Type`: multipart/form-data

**请求体**:
- `image`: 图片文件（最大10MB）

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://your-domain.com/content/1-1234567890-abc123.jpg"
  },
  "message": "图片上传成功"
}
```

### 4. 删除图片
```
DELETE /api/upload/:id
```

**请求头**:
- `Authorization`: Bearer {token}

**响应**:
```json
{
  "success": true,
  "message": "图片删除成功"
}
```

### 5. 获取用户图片列表
```
GET /api/upload/list?type=avatar&page=1&limit=20
```

**请求头**:
- `Authorization`: Bearer {token}

**查询参数**:
- `type`: 图片类型（avatar/cover/content，可选）
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）

**响应**:
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": 1,
        "user_id": 1,
        "type": "avatar",
        "url": "https://your-domain.com/avatars/xxx.jpg",
        "cos_key": "avatars/xxx.jpg",
        "size": 102400,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

## 数据库结构

### images表
```sql
CREATE TABLE images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('avatar', 'cover', 'content') NOT NULL,
  url VARCHAR(500) NOT NULL,
  cos_key VARCHAR(500) NOT NULL,
  size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_cos_key (cos_key)
);
```

### 字段说明
- `id`: 图片记录ID
- `user_id`: 上传用户ID
- `type`: 图片类型（avatar/cover/content）
- `url`: 完整访问URL
- `cos_key`: COS对象键（用于删除）
- `size`: 文件大小（字节）
- `created_at`: 创建时间

## 配置说明

### 环境变量配置
在 `backend/.env` 文件中添加以下配置：

```env
# 腾讯云COS配置
COS_SECRET_ID=your_cos_secret_id
COS_SECRET_KEY=your_cos_secret_key
COS_REGION=ap-guangzhou
COS_BUCKET=your-bucket-name
COS_CDN_DOMAIN=https://your-cdn-domain.com
```

### 配置项说明
- `COS_SECRET_ID`: 腾讯云API密钥ID
- `COS_SECRET_KEY`: 腾讯云API密钥Key
- `COS_REGION`: COS存储桶所在区域（如：ap-guangzhou）
- `COS_BUCKET`: COS存储桶名称
- `COS_CDN_DOMAIN`: 自定义域名（需配置CNAME到COS）

## 图片处理策略

### 压缩策略
- **头像**: 限制尺寸400x400px，质量90%
- **封面**: 限制宽度1200px，保持比例，质量85%
- **内容图片**: 限制宽度1600px，保持比例，质量80%

### 文件限制
- **头像**: 最大2MB
- **封面**: 最大5MB
- **内容图片**: 最大10MB
- **支持格式**: JPEG、PNG、WebP、GIF

### COS目录结构
```
bucket-name/
├── avatars/           # 用户头像
│   └── {userId}-{timestamp}-{random}.jpg
├── covers/            # 文章封面
│   └── {userId}-{timestamp}-{random}.jpg
└── content/           # 文章内容图片
    └── {userId}-{timestamp}-{random}.jpg
```

## 前端组件使用

### 基本用法
```tsx
import ImageUpload from '@/components/ImageUpload/ImageUpload';

function MyComponent() {
  const handleUploadSuccess = (url: string) => {
    console.log('上传成功:', url);
    // 更新状态或提交表单
  };

  const handleUploadError = (error: string) => {
    console.error('上传失败:', error);
  };

  return (
    <ImageUpload
      type="avatar"
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
      currentImage="https://example.com/current-avatar.jpg"
    />
  );
}
```

### Props说明
- `type`: 上传类型（'avatar' | 'cover' | 'content'）
- `onUploadSuccess`: 上传成功回调，参数为图片URL
- `onUploadError`: 上传失败回调，参数为错误信息
- `currentImage`: 当前图片URL（可选）
- `className`: 自定义样式类名（可选）

## 数据库初始化

运行以下命令初始化图片上传相关数据库结构：

```bash
cd backend
node src/models/Image.js
```

该命令会：
1. 创建 `images` 表
2. 更新 `users` 表的 `avatar` 字段长度为VARCHAR(500)
3. 更新 `posts` 表的 `cover` 字段长度为VARCHAR(500)

## 安全措施

### 后端安全
1. **JWT认证**: 所有上传接口需要登录认证
2. **文件类型验证**: 仅允许图片格式（JPEG、PNG、WebP、GIF）
3. **文件大小限制**: 根据类型限制不同大小
4. **文件名安全**: 使用时间戳+随机字符串生成安全文件名
5. **内存存储**: 使用multer内存存储，不落盘，减少安全风险

### COS安全配置
1. **访问权限**: 存储桶设置为公开读、私有写
2. **密钥保护**: 永久密钥仅在后端使用，不暴露给前端
3. **防盗链**: 建议在COS控制台配置Referer白名单
4. **HTTPS**: 使用HTTPS协议访问图片

### 防盗链配置（推荐）
在腾讯云COS控制台配置：
- 路径：存储桶 → 安全管理 → 防盗链
- 白名单：
  - `https://yourdomain.com`
  - `https://www.yourdomain.com`
  - 空Referer（允许直接访问）

## 性能优化

### 后端优化
- 使用流式上传，避免大文件占用内存
- 图片压缩后再上传，减少存储和流量成本
- 异步上传到COS，不阻塞响应

### 前端优化
- 图片预览使用FileReader，不占用额外内存
- 上传前进行客户端验证，减少无效请求
- 显示上传进度，提升用户体验

### COS配置优化
- 设置缓存策略：`Cache-Control: max-age=2592000`（30天）
- 建议开通CDN加速（可选，但能显著提升访问速度和降低成本）

## 成本估算

### 存储成本
- 标准存储：0.118元/GB/月
- 示例：存储10GB图片 = 1.18元/月

### 流量成本（无CDN）
- 外网下行流量：0.5元/GB
- 示例：月流量50GB = 25元/月

### 流量成本（有CDN）
- CDN流量：0.21元/GB起（阶梯定价）
- 示例：月流量50GB = 10.5元/月
- **节省**: 14.5元/月（58%）

### 请求成本
- 读请求：0.01元/万次
- 写请求：0.1元/万次
- 影响极小，可忽略

## 常见问题

### 1. 上传失败怎么办？
- 检查COS配置是否正确
- 确认存储桶权限设置为公开读、私有写
- 检查网络连接
- 查看后端日志获取详细错误信息

### 2. 图片无法访问？
- 确认自定义域名CNAME配置正确
- 检查存储桶是否设置为公开读
- 确认图片URL格式正确
- 检查防盗链配置是否过于严格

### 3. 如何删除旧图片？
- 上传新头像时会自动删除旧头像
- 可以调用删除接口手动删除图片
- 删除会同时清理COS和数据库记录

### 4. 如何升级到CDN？
1. 在腾讯云控制台开通CDN服务
2. 添加加速域名，源站选择COS存储桶
3. 配置HTTPS证书
4. 更新 `COS_CDN_DOMAIN` 环境变量
5. 重启后端服务

## 未来优化方向

### Phase 2（性能优化）
- [ ] 添加上传进度显示
- [ ] 支持拖拽上传
- [ ] 图片裁剪功能
- [ ] 批量上传

### Phase 3（功能增强）
- [ ] 图片内容审核（腾讯云内容安全）
- [ ] 上传频率限制（防止滥用）
- [ ] 用户存储配额管理
- [ ] 图片水印功能

### Phase 4（监控运维）
- [ ] 上传成功率监控
- [ ] 存储空间使用监控
- [ ] 费用告警
- [ ] 访问日志分析

## 技术支持

如遇到问题，请检查：
1. 后端日志：`backend/logs/`
2. COS控制台：查看存储桶状态和日志
3. 网络请求：浏览器开发者工具Network面板

## 更新日志

### v1.0.0 (2024-01-01)
- ✅ 基础图片上传功能
- ✅ 头像、封面、内容图片支持
- ✅ 图片压缩优化
- ✅ 前端上传组件
- ✅ 数据库记录管理
- ✅ 自动删除旧图片
