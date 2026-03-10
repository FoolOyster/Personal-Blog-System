# 图片上传功能使用指南

## 快速开始

### 1. 配置环境变量

复制 `backend/.env.example` 为 `backend/.env`，并填入你的腾讯云COS配置：

```env
# 腾讯云COS配置
COS_SECRET_ID=your_cos_secret_id          # 你的腾讯云API密钥ID
COS_SECRET_KEY=your_cos_secret_key        # 你的腾讯云API密钥Key
COS_REGION=ap-guangzhou                   # COS存储桶所在区域
COS_BUCKET=your-bucket-name               # COS存储桶名称
COS_CDN_DOMAIN=https://your-domain.com    # 自定义域名
```

### 2. 初始化数据库

运行以下命令创建 `images` 表并更新相关字段：

```bash
cd backend
node src/models/Image.js
```

成功后会看到：
```
✓ Images表创建成功
✓ Users表avatar字段更新成功
✓ Posts表cover字段更新成功
✓ 图片上传数据库结构初始化完成
```

### 3. 启动后端服务

```bash
cd backend
npm run dev
```

看到 `Server is running on port 3000` 表示启动成功。

### 4. 测试接口

#### 测试健康检查
```bash
curl http://localhost:3000/health
```

#### 测试上传接口（需要登录token）
```bash
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

## 前端集成

### 导入组件

```tsx
import ImageUpload from '@/components/ImageUpload/ImageUpload';
```

### 使用示例

#### 上传头像
```tsx
function ProfilePage() {
  const [avatarUrl, setAvatarUrl] = useState('');

  return (
    <ImageUpload
      type="avatar"
      currentImage={avatarUrl}
      onUploadSuccess={(url) => {
        setAvatarUrl(url);
        console.log('头像上传成功:', url);
      }}
      onUploadError={(error) => {
        console.error('上传失败:', error);
        alert(error);
      }}
    />
  );
}
```

#### 上传文章封面
```tsx
function CreatePostPage() {
  const [coverUrl, setCoverUrl] = useState('');

  return (
    <ImageUpload
      type="cover"
      currentImage={coverUrl}
      onUploadSuccess={(url) => {
        setCoverUrl(url);
      }}
      onUploadError={(error) => {
        alert(error);
      }}
    />
  );
}
```

#### 上传文章内容图片
```tsx
function MarkdownEditor() {
  const insertImage = (url: string) => {
    // 在光标位置插入Markdown图片语法
    const markdown = `![图片](${url})`;
    // 插入到编辑器...
  };

  return (
    <ImageUpload
      type="content"
      onUploadSuccess={(url) => {
        insertImage(url);
      }}
      onUploadError={(error) => {
        alert(error);
      }}
    />
  );
}
```

## API接口说明

### 1. 上传头像
- **接口**: `POST /api/upload/avatar`
- **认证**: 需要JWT Token
- **限制**: 最大2MB，支持JPEG/PNG/WebP/GIF
- **返回**: `{ success: true, data: { url: "图片URL" } }`

### 2. 上传封面
- **接口**: `POST /api/upload/cover`
- **认证**: 需要JWT Token
- **限制**: 最大5MB，支持JPEG/PNG/WebP/GIF
- **返回**: `{ success: true, data: { url: "图片URL" } }`

### 3. 上传内容图片
- **接口**: `POST /api/upload/content`
- **认证**: 需要JWT Token
- **限制**: 最大10MB，支持JPEG/PNG/WebP/GIF
- **返回**: `{ success: true, data: { url: "图片URL" } }`

### 4. 删除图片
- **接口**: `DELETE /api/upload/:id`
- **认证**: 需要JWT Token
- **返回**: `{ success: true, message: "图片删除成功" }`

### 5. 获取图片列表
- **接口**: `GET /api/upload/list?type=avatar&page=1&limit=20`
- **认证**: 需要JWT Token
- **参数**:
  - `type`: 图片类型（可选）
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认20）
- **返回**: 图片列表和分页信息

## 常见问题

### 1. 服务启动失败
**错误**: `argument handler must be a function`

**原因**: 中间件导入错误

**解决**: 已修复，确保使用最新代码

### 2. 数据库初始化失败
**错误**: `Access denied for user`

**原因**: 数据库配置不正确

**解决**: 检查 `backend/.env` 中的数据库配置

### 3. 图片上传失败
**错误**: `未提供认证令牌`

**原因**: 未登录或token过期

**解决**: 确保请求头包含有效的 `Authorization: Bearer TOKEN`

### 4. 图片无法访问
**原因**: COS配置错误或权限问题

**解决**:
- 检查COS存储桶权限设置为"公开读"
- 确认自定义域名CNAME配置正确
- 检查 `COS_CDN_DOMAIN` 环境变量

## 腾讯云COS配置

### 1. 创建存储桶
1. 登录腾讯云控制台
2. 进入对象存储COS
3. 创建存储桶，选择区域
4. 记录存储桶名称和区域

### 2. 配置访问权限
1. 进入存储桶 → 权限管理
2. 设置公共权限为"公开读、私有写"
3. 或使用存储桶策略精细控制

### 3. 配置自定义域名
1. 进入存储桶 → 域名管理
2. 添加自定义域名
3. 配置CNAME解析到COS域名
4. 可选：开启CDN加速

### 4. 获取密钥
1. 进入访问管理 → API密钥管理
2. 创建密钥或使用现有密钥
3. 记录SecretId和SecretKey

### 5. 配置防盗链（推荐）
1. 进入存储桶 → 安全管理 → 防盗链
2. 添加白名单：
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
   - 空Referer（允许直接访问）

## 成本估算

### 个人博客（示例）
- 存储10GB图片：1.18元/月
- 月流量50GB（无CDN）：25元/月
- 月流量50GB（有CDN）：10.5元/月
- **推荐配置总成本**: 约12元/月

### 优化建议
1. 开通CDN加速（节省58%流量成本）
2. 定期清理未使用的图片
3. 启用WebP格式（减少30-50%体积）

## 更多信息

详细文档请查看：[docs/IMAGE_UPLOAD.md](../docs/IMAGE_UPLOAD.md)
