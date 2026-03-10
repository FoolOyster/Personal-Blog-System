# 图片压缩、删除逻辑和头像显示优化实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标：** 实现前端图片压缩、智能图片删除逻辑、头像统一显示和上传模态框优化

**架构：** 前端使用 browser-image-compression 进行无损压缩，后端移除 Sharp 压缩逻辑。创建可复用的 Avatar 组件统一头像显示。实现智能图片删除机制，更换图片时自动删除旧图片，删除文章时删除关联封面。

**技术栈：** React, TypeScript, browser-image-compression, Node.js, Express, MySQL, Tencent Cloud COS

---

## Task 1: 数据库迁移 - 添加 is_uploaded 字段

**Files:**
- Execute: SQL migration script

**Step 1: 创建迁移 SQL 脚本**

创建文件 `backend/migrations/add_is_uploaded_to_images.sql`:

```sql
-- 添加 is_uploaded 字段到 images 表
ALTER TABLE images ADD COLUMN is_uploaded BOOLEAN DEFAULT TRUE COMMENT '是否通过上传功能上传';

-- 为现有记录设置默认值
UPDATE images SET is_uploaded = TRUE WHERE is_uploaded IS NULL;
```

**Step 2: 执行迁移**

Run: `mysql -u root -p blog_db < backend/migrations/add_is_uploaded_to_images.sql`
Expected: Query OK, 0 rows affected

**Step 3: 验证字段添加成功**

Run: `mysql -u root -p blog_db -e "DESCRIBE images;"`
Expected: 输出包含 `is_uploaded` 字段

**Step 4: 提交**

```bash
git add backend/migrations/add_is_uploaded_to_images.sql
git commit -m "chore: 添加 is_uploaded 字段到 images 表

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: 后端 - 创建图片清理工具函数

**Files:**
- Create: `backend/src/utils/imageCleanup.js`

**Step 1: 创建 imageCleanup.js 文件**

```javascript
const db = require('../config/database');
const { deleteFromCOS, extractCOSKey, COS_CONFIG } = require('../config/cos');

/**
 * 删除旧图片（仅删除通过上传功能上传的图片）
 * @param {string} imageUrl - 图片 URL
 * @returns {Promise<boolean>} - 是否成功删除
 */
async function deleteOldImage(imageUrl) {
  if (!imageUrl) return false;

  try {
    // 1. 检查是否为 CDN 域名下的图片
    if (!imageUrl.startsWith(COS_CONFIG.CDNDomain)) {
      console.log('图片不在 CDN 域名下，跳过删除:', imageUrl);
      return false;
    }

    // 2. 查询 images 表，检查是否为上传的图片
    const [rows] = await db.query(
      'SELECT id, cos_key, is_uploaded FROM images WHERE url = ? AND is_uploaded = TRUE',
      [imageUrl]
    );

    if (rows.length === 0) {
      console.log('图片不存在或非上传图片，跳过删除:', imageUrl);
      return false;
    }

    const image = rows[0];

    // 3. 删除 COS 中的文件
    try {
      await deleteFromCOS(image.cos_key);
      console.log('COS 文件删除成功:', image.cos_key);
    } catch (cosError) {
      console.error('COS 文件删除失败:', cosError);
      // 继续删除数据库记录，即使 COS 删除失败
    }

    // 4. 删除数据库记录
    await db.query('DELETE FROM images WHERE id = ?', [image.id]);
    console.log('数据库记录删除成功:', image.id);

    return true;
  } catch (error) {
    console.error('删除旧图片失败:', error);
    return false;
  }
}

module.exports = {
  deleteOldImage
};
```

**Step 2: 提交**

```bash
git add backend/src/utils/imageCleanup.js
git commit -m "feat: 添加图片清理工具函数

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: 后端 - 修改上传控制器添加删除逻辑

**Files:**
- Modify: `backend/src/controllers/uploadController.js`

**Step 1: 导入 imageCleanup 工具**

在文件顶部添加：

```javascript
const { deleteOldImage } = require('../utils/imageCleanup');
```

**Step 2: 修改 uploadAvatar 函数**

找到 `uploadAvatar` 函数，在上传新头像前添加删除旧头像的逻辑：

```javascript
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    // 查询用户当前头像
    const [users] = await db.query('SELECT avatar FROM users WHERE id = ?', [userId]);
    const oldAvatar = users[0]?.avatar;

    // 删除旧头像（如果存在且为上传的图片）
    if (oldAvatar) {
      await deleteOldImage(oldAvatar);
    }

    // 生成安全的文件名
    const fileName = generateSafeFilename(file.originalname, userId);

    // 上传到 COS（不再压缩）
    const imageUrl = await uploadToCOS(file.buffer, fileName, 'avatar', file.mimetype);

    // 更新用户头像
    await db.query('UPDATE users SET avatar = ? WHERE id = ?', [imageUrl, userId]);

    // 记录到 images 表
    await db.query(
      'INSERT INTO images (user_id, type, url, cos_key, size, is_uploaded) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'avatar', imageUrl, `avatars/${fileName}`, file.size, true]
    );

    res.json({
      success: true,
      data: { url: imageUrl },
      message: '头像上传成功'
    });
  } catch (error) {
    console.error('头像上传失败:', error);
    res.status(500).json({
      success: false,
      message: '头像上传失败'
    });
  }
};
```

**Step 3: 修改 uploadCover 函数**

类似地修改 `uploadCover` 函数（注意：封面关联到文章，需要从请求中获取文章 ID）：

```javascript
const uploadCover = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    // 生成安全的文件名
    const fileName = generateSafeFilename(file.originalname, userId);

    // 上传到 COS（不再压缩）
    const imageUrl = await uploadToCOS(file.buffer, fileName, 'cover', file.mimetype);

    // 记录到 images 表
    await db.query(
      'INSERT INTO images (user_id, type, url, cos_key, size, is_uploaded) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'cover', imageUrl, `covers/${fileName}`, file.size, true]
    );

    res.json({
      success: true,
      data: { url: imageUrl },
      message: '封面上传成功'
    });
  } catch (error) {
    console.error('封面上传失败:', error);
    res.status(500).json({
      success: false,
      message: '封面上传失败'
    });
  }
};
```

**Step 4: 提交**

```bash
git add backend/src/controllers/uploadController.js
git commit -m "feat: 上传新图片时自动删除旧图片

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: 后端 - 移除 Sharp 压缩逻辑

**Files:**
- Modify: `backend/src/middleware/upload.js`
- Modify: `backend/package.json`

**Step 1: 修改 upload.js 移除压缩函数**

删除 `compressImage` 函数及其调用，简化中间件：

```javascript
const multer = require('multer');
const { ALLOWED_TYPES, MAX_SIZE } = require('../config/cos');

// 配置 Multer 使用内存存储
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 创建上传中间件
const createUploadMiddleware = (type) => {
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: MAX_SIZE[type]
    }
  }).single('image');
};

module.exports = {
  createUploadMiddleware
};
```

**Step 2: 移除 Sharp 依赖**

Run: `cd backend && npm uninstall sharp`
Expected: removed 1 package

**Step 3: 验证后端启动正常**

Run: `cd backend && npm run dev`
Expected: Server running on port 3000

**Step 4: 停止服务并提交**

```bash
git add backend/src/middleware/upload.js backend/package.json backend/package-lock.json
git commit -m "refactor: 移除后端 Sharp 压缩逻辑，改为前端压缩

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: 后端 - 修改文章删除接口添加封面删除逻辑

**Files:**
- Modify: `backend/src/controllers/postController.js`

**Step 1: 导入 imageCleanup 工具**

在文件顶部添加：

```javascript
const { deleteOldImage } = require('../utils/imageCleanup');
```

**Step 2: 修改 deletePost 函数**

找到删除文章的函数，在删除文章前添加删除封面的逻辑：

```javascript
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // 查询文章信息
    const [posts] = await db.query(
      'SELECT author_id, cover FROM posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const post = posts[0];

    // 权限检查
    if (post.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权删除此文章'
      });
    }

    // 删除封面图片（如果存在且为上传的图片）
    if (post.cover) {
      await deleteOldImage(post.cover);
    }

    // 删除文章
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({
      success: true,
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({
      success: false,
      message: '删除文章失败'
    });
  }
};
```

**Step 3: 提交**

```bash
git add backend/src/controllers/postController.js
git commit -m "feat: 删除文章时自动删除关联的封面图片

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: 后端 - 修改文章接口返回作者头像

**Files:**
- Modify: `backend/src/controllers/postController.js`

**Step 1: 修改文章列表查询**

找到获取文章列表的函数，修改 SQL 查询添加 `author_avatar`：

```javascript
const getPosts = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, categoryId } = req.query;
    const offset = (page - 1) * pageSize;

    let query = `
      SELECT
        posts.*,
        users.username as author_name,
        users.avatar as author_avatar,
        categories.name as category_name
      FROM posts
      LEFT JOIN users ON posts.author_id = users.id
      LEFT JOIN categories ON posts.category_id = categories.id
    `;

    const params = [];

    if (categoryId) {
      query += ' WHERE posts.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY posts.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [posts] = await db.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM posts';
    if (categoryId) {
      countQuery += ' WHERE category_id = ?';
    }
    const [countResult] = await db.query(countQuery, categoryId ? [categoryId] : []);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        posts,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章列表失败'
    });
  }
};
```

**Step 2: 修改文章详情查询**

找到获取文章详情的函数，修改 SQL 查询添加 `author_avatar`：

```javascript
const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const [posts] = await db.query(
      `SELECT
        posts.*,
        users.username as author_name,
        users.avatar as author_avatar,
        categories.name as category_name
      FROM posts
      LEFT JOIN users ON posts.author_id = users.id
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE posts.id = ?`,
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 增加浏览量
    await db.query('UPDATE posts SET views = views + 1 WHERE id = ?', [postId]);
    posts[0].views += 1;

    res.json({
      success: true,
      data: posts[0]
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章详情失败'
    });
  }
};
```

**Step 3: 提交**

```bash
git add backend/src/controllers/postController.js
git commit -m "feat: 文章接口返回作者头像字段

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: 前端 - 安装图片压缩库

**Files:**
- Modify: `frontend/package.json`

**Step 1: 安装 browser-image-compression**

Run: `cd frontend && npm install browser-image-compression`
Expected: added 1 package

**Step 2: 提交**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: 安装 browser-image-compression 图片压缩库

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: 前端 - 修改 ImageUpload 组件添加压缩功能

**Files:**
- Modify: `frontend/src/components/ImageUpload/ImageUpload.tsx`

**Step 1: 导入压缩库**

在文件顶部添加：

```typescript
import imageCompression from 'browser-image-compression';
```

**Step 2: 添加压缩配置常量**

在组件内部添加压缩配置：

```typescript
// 压缩配置
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg'
};
```

**Step 3: 修改 handleFileChange 函数添加压缩步骤**

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 验证文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    const error = '不支持的文件类型，仅支持 JPEG、PNG、WebP、GIF 格式';
    onUploadError?.(error);
    alert(error);
    return;
  }

  // 验证文件大小
  if (file.size > MAX_SIZE[type]) {
    const maxSizeMB = MAX_SIZE[type] / (1024 * 1024);
    const error = `文件大小超出限制，最大支持 ${maxSizeMB}MB`;
    onUploadError?.(error);
    alert(error);
    return;
  }

  try {
    setUploading(true);

    // 压缩图片（用户无感知）
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    console.log('原始大小:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('压缩后大小:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');

    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(compressedFile);

    // 上传压缩后的文件
    await uploadFile(compressedFile);
  } catch (error) {
    console.error('图片压缩失败:', error);
    const errorMsg = '图片处理失败，请稍后重试';
    onUploadError?.(errorMsg);
    alert(errorMsg);
    setUploading(false);
  }
};
```

**Step 4: 修改 uploadFile 函数接受 File 参数**

```typescript
const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/upload/${type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setPreview(data.data.url);
      onUploadSuccess?.(data.data.url);
    } else {
      throw new Error(data.message || '上传失败');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '上传失败，请稍后重试';
    onUploadError?.(errorMsg);
    alert(errorMsg);
    setPreview(currentImage || null);
  } finally {
    setUploading(false);
  }
};
```

**Step 5: 提交**

```bash
git add frontend/src/components/ImageUpload/ImageUpload.tsx
git commit -m "feat: 添加前端图片压缩功能

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 9: 前端 - 创建可复用 Avatar 组件

**Files:**
- Create: `frontend/src/components/Avatar/Avatar.tsx`
- Create: `frontend/src/components/Avatar/Avatar.css`

**Step 1: 创建 Avatar.tsx**

```typescript
import './Avatar.css';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Avatar({ src, name, size = 'medium', className = '' }: AvatarProps) {
  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="avatar-image" />
      ) : (
        <span className="avatar-fallback">{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
```

**Step 2: 创建 Avatar.css**

```css
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.avatar-small {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.avatar-medium {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.avatar-large {
  width: 120px;
  height: 120px;
  font-size: 48px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
```

**Step 3: 提交**

```bash
git add frontend/src/components/Avatar/
git commit -m "feat: 创建可复用 Avatar 组件

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 10: 前端 - 更新类型定义添加 author_avatar

**Files:**
- Modify: `frontend/src/types.ts`

**Step 1: 修改 Post 接口**

找到 `Post` 接口，添加 `author_avatar` 字段：

```typescript
export interface Post {
  id: number;
  title: string;
  content: string;
  cover?: string;
  author_id: number;
  author_name: string;
  author_avatar?: string;  // 新增
  category_id?: number;
  category_name?: string;
  tags?: string[];
  views: number;
  created_at: string;
  updated_at: string;
}
```

**Step 2: 提交**

```bash
git add frontend/src/types.ts
git commit -m "feat: 添加 author_avatar 字段到 Post 类型

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 11: 前端 - 修改 Header 组件使用 Avatar

**Files:**
- Modify: `frontend/src/components/Header.tsx`

**Step 1: 导入 Avatar 组件**

```typescript
import Avatar from './Avatar/Avatar';
```

**Step 2: 替换用户头像显示**

找到第 74-76 行的头像显示代码，替换为：

```typescript
<Link
  to="/profile"
  className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
  onClick={() => setMobileMenuOpen(false)}
>
  <Avatar src={user?.avatar} name={user?.username || ''} size="small" />
  <span className="nav-link-text">{user?.username}</span>
  <span className="nav-link-indicator"></span>
</Link>
```

**Step 3: 提交**

```bash
git add frontend/src/components/Header.tsx
git commit -m "feat: Header 组件使用 Avatar 显示用户头像

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 12: 前端 - 修改 PostCard 组件使用 Avatar

**Files:**
- Modify: `frontend/src/components/PostCard.tsx`

**Step 1: 导入 Avatar 组件**

```typescript
import Avatar from './Avatar/Avatar';
```

**Step 2: 替换作者头像显示**

找到第 88-92 行的作者头像代码，替换为：

```typescript
<div className="post-card-item-author">
  <Avatar
    src={post.author_avatar}
    name={post.author_name}
    size="small"
    className="post-card-item-avatar"
  />
  <span className="post-card-item-author-name">{post.author_name}</span>
</div>
```

**Step 3: 提交**

```bash
git add frontend/src/components/PostCard.tsx
git commit -m "feat: PostCard 组件使用 Avatar 显示作者头像

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 13: 前端 - 修改 PostDetail 组件使用 Avatar

**Files:**
- Modify: `frontend/src/pages/PostDetail.tsx`

**Step 1: 导入 Avatar 组件**

```typescript
import Avatar from '../components/Avatar/Avatar';
```

**Step 2: 替换作者头像显示**

找到第 129-131 行的作者头像代码，替换为：

```typescript
<div className="author-info">
  <Avatar
    src={post.author_avatar}
    name={post.author_name}
    size="medium"
    className="author-avatar"
  />
  <div className="author-details">
    <span className="author-name">{post.author_name}</span>
    <span className="post-stats">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {post.views} 次浏览
    </span>
  </div>
</div>
```

**Step 3: 提交**

```bash
git add frontend/src/pages/PostDetail.tsx
git commit -m "feat: PostDetail 组件使用 Avatar 显示作者头像

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 14: 前端 - 优化 Profile 头像上传模态框

**Files:**
- Modify: `frontend/src/pages/Profile.tsx`
- Modify: `frontend/src/pages/Profile.css`

**Step 1: 修改 Profile.tsx 模态框结构**

将模态框从 `.profile-info` 内部移到 `.profile-page` 根层级：

找到第 128-147 行的模态框代码，剪切并移动到组件返回的 JSX 最外层：

```typescript
return (
  <div className="profile-page">
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header animate-fadeIn">
        {/* ... 现有内容 ... */}
        <div className="profile-info">
          <div className="avatar-section">
            <div
              className="avatar-large"
              onClick={() => setShowAvatarUpload(!showAvatarUpload)}
              style={{ cursor: 'pointer' }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            {/* 移除这里的模态框 */}
          </div>
          {/* ... 其他内容 ... */}
        </div>
      </div>
      {/* ... 其他内容 ... */}
    </div>

    {/* 模态框移到这里 - 页面根层级 */}
    {showAvatarUpload && (
      <div
        className="avatar-upload-modal"
        onClick={(e) => {
          // 点击遮罩层关闭
          if (e.target === e.currentTarget) {
            setShowAvatarUpload(false);
          }
        }}
      >
        <div className="avatar-upload-content">
          <div className="modal-header">
            <h3>更换头像</h3>
            <button onClick={() => setShowAvatarUpload(false)} className="close-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <ImageUpload
            type="avatar"
            currentImage={user.avatar}
            onUploadSuccess={handleAvatarUploadSuccess}
            onUploadError={(error) => alert(error)}
          />
        </div>
      </div>
    )}
  </div>
);
```

**Step 2: 修改 Profile.css 模态框样式**

找到 `.avatar-upload-modal` 样式，替换为：

```css
.avatar-upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.avatar-upload-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Step 3: 提交**

```bash
git add frontend/src/pages/Profile.tsx frontend/src/pages/Profile.css
git commit -m "feat: 优化头像上传模态框为全屏居中布局

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 15: 测试和验证

**Step 1: 启动后端服务**

Run: `cd backend && npm run dev`
Expected: Server running on port 3000

**Step 2: 启动前端服务**

Run: `cd frontend && npm run dev`
Expected: Local: http://localhost:5173/

**Step 3: 测试图片压缩**

1. 登录系统
2. 进入个人中心
3. 点击头像上传一张大图片（5MB+）
4. 打开浏览器控制台查看压缩日志
5. 验证上传成功且图片质量良好

Expected: 控制台显示压缩前后大小对比，上传成功

**Step 4: 测试图片删除**

1. 上传新头像
2. 检查 COS 存储桶，验证旧头像被删除
3. 上传文章封面
4. 更换封面，验证旧封面被删除
5. 删除文章，验证封面被删除

Expected: 旧图片在 COS 中被删除，数据库记录也被删除

**Step 5: 测试头像显示**

1. 访问首页，查看文章卡片作者头像
2. 点击文章，查看详情页作者头像
3. 查看导航栏用户头像
4. 验证有头像时显示图片，无头像时显示首字母

Expected: 所有位置正确显示头像

**Step 6: 测试模态框**

1. 进入个人中心
2. 点击头像打开模态框
3. 验证模态框居中显示，不遮挡用户信息
4. 点击遮罩层关闭模态框
5. 点击关闭按钮关闭模态框

Expected: 模态框交互流畅，动画效果正常

**Step 7: 提交测试通过的代码**

如果所有测试通过，确保所有改动已提交：

```bash
git status
git log --oneline -10
```

---

## 完成

所有任务已完成！功能包括：

1. ✅ 前端图片压缩（browser-image-compression）
2. ✅ 智能图片删除逻辑（更换时删除旧图片）
3. ✅ 删除文章时删除封面
4. ✅ 头像统一显示（Avatar 组件）
5. ✅ 头像上传模态框优化（全屏居中）

后续可以考虑的优化：
- 添加图片裁剪功能
- 支持拖拽上传
- 支持粘贴上传
- 添加上传进度条
