# 图片压缩、删除逻辑和头像显示优化设计文档

## 概述

本设计文档描述了对个人博客系统图片功能的三项优化：
1. 前端无损图片压缩
2. 智能图片删除逻辑
3. 头像统一显示和上传模态框优化

## 1. 前端图片压缩

### 目标

- 在前端进行图片压缩，减轻后端资源占用
- 压缩过程对用户无感知
- 保持良好的图片质量

### 技术方案

**选用库：** `browser-image-compression`

**压缩配置：**
```typescript
{
  maxSizeMB: 1,              // 压缩到最大 1MB
  maxWidthOrHeight: 1920,    // 最大宽度/高度
  useWebWorker: true,        // 使用 Web Worker 不阻塞 UI
  fileType: 'image/jpeg'     // 统一输出为 JPEG
}
```

**实现流程：**
1. 用户选择图片文件
2. 前端自动在后台压缩（使用 Web Worker）
3. 显示统一的"上传中..."提示
4. 上传压缩后的文件到服务器
5. 服务器直接上传到 COS，不再进行压缩
6. 返回 URL 并显示预览

**前端改动：**
- 安装依赖：`npm install browser-image-compression`
- 修改 `ImageUpload.tsx`：
  - 导入压缩库
  - 在 `handleFileChange` 中添加压缩步骤
  - 压缩完成后再调用 `uploadFile`

**后端改动：**
- 移除 `sharp` 依赖
- 删除 `backend/src/middleware/upload.js` 中的 `compressImage` 函数
- 简化中间件，仅保留文件验证和上传逻辑
- 更新 `package.json`，移除 `sharp` 依赖

### 优势

- 减轻服务器 CPU 和内存负担
- 压缩在客户端并行处理，不阻塞服务器
- 用户无感知，体验流畅
- 画质更好（无损压缩）

## 2. 图片删除逻辑

### 目标

- 更换图片时自动删除旧图片（仅上传的图片）
- 删除文章时删除关联的封面图片
- 删除用户时删除关联的头像图片
- 避免误删手动输入的外部图片 URL

### 数据库改动

**修改 `images` 表：**
```sql
ALTER TABLE images ADD COLUMN is_uploaded BOOLEAN DEFAULT TRUE;
```

**字段说明：**
- `is_uploaded = TRUE`：通过上传功能上传的图片
- `is_uploaded = FALSE`：手动输入的外部 URL（不删除）

### 删除场景

#### 场景一：更换头像时删除旧头像

**流程：**
1. 用户上传新头像
2. 查询 `users` 表获取当前头像 URL
3. 在 `images` 表中查询该 URL 是否存在且 `is_uploaded = TRUE`
4. 如果是上传的图片：
   - 调用 `deleteFromCOS()` 删除 COS 中的文件
   - 删除 `images` 表中的记录
5. 上传新头像到 COS
6. 插入新记录到 `images` 表
7. 更新 `users` 表的 `avatar` 字段

#### 场景二：更换封面时删除旧封面

**流程：**
1. 用户上传新封面
2. 查询 `posts` 表获取当前封面 URL
3. 在 `images` 表中查询该 URL 是否存在且 `is_uploaded = TRUE`
4. 如果是上传的图片：
   - 调用 `deleteFromCOS()` 删除 COS 中的文件
   - 删除 `images` 表中的记录
5. 上传新封面到 COS
6. 插入新记录到 `images` 表
7. 更新 `posts` 表的 `cover` 字段

#### 场景三：删除文章时删除封面

**流程：**
1. 用户删除文章
2. 查询文章的 `cover` 字段
3. 在 `images` 表中查询该 URL 是否存在且 `is_uploaded = TRUE`
4. 如果是上传的图片：
   - 调用 `deleteFromCOS()` 删除 COS 中的文件
   - 删除 `images` 表中的记录
5. 删除 `posts` 表中的文章记录

#### 场景四：删除用户时删除头像

**流程：**
1. 删除用户（如果有此功能）
2. 查询用户的 `avatar` 字段
3. 在 `images` 表中查询该 URL 是否存在且 `is_uploaded = TRUE`
4. 如果是上传的图片：
   - 调用 `deleteFromCOS()` 删除 COS 中的文件
   - 删除 `images` 表中的记录
5. 删除 `users` 表中的用户记录

### 安全措施

1. **域名检查：** 只删除 `COS_CDN_DOMAIN` 下的图片
2. **事务处理：** 使用数据库事务确保数据一致性
3. **错误处理：** COS 删除失败时记录日志，但不阻断主流程
4. **权限验证：** 确保只有图片所有者可以删除

### 实现要点

**后端新增工具函数：**
```javascript
// backend/src/utils/imageCleanup.js
async function deleteOldImage(imageUrl) {
  // 1. 检查是否为 CDN 域名
  // 2. 查询 images 表
  // 3. 如果 is_uploaded = TRUE，删除 COS 文件
  // 4. 删除数据库记录
}
```

**修改上传控制器：**
- `uploadAvatar`：上传前调用 `deleteOldImage(user.avatar)`
- `uploadCover`：上传前调用 `deleteOldImage(post.cover)`

**修改删除控制器：**
- `deletePost`：删除前调用 `deleteOldImage(post.cover)`

## 3. 头像统一显示

### 目标

- 所有显示用户头像的地方都显示真实头像图片（如果有）
- 没有头像时显示用户名首字母
- 创建可复用的 Avatar 组件

### 需要修改的位置

1. **Header 组件**（导航栏）
2. **PostCard 组件**（文章卡片作者头像）
3. **PostDetail 组件**（文章详情作者头像）
4. **Profile 组件**（个人中心，已实现）

### 创建 Avatar 组件

**文件：** `frontend/src/components/Avatar/Avatar.tsx`

**Props 接口：**
```typescript
interface AvatarProps {
  src?: string;                          // 头像 URL
  name: string;                          // 用户名（用于首字母）
  size?: 'small' | 'medium' | 'large';  // 尺寸
  className?: string;                    // 自定义样式
}
```

**尺寸定义：**
- `small`: 32px（Header、PostCard）
- `medium`: 48px（默认）
- `large`: 120px（Profile）

**实现逻辑：**
```typescript
{src ? (
  <img src={src} alt={name} />
) : (
  <span>{name.charAt(0).toUpperCase()}</span>
)}
```

### 后端 API 改动

**修改文章列表接口：**
```sql
SELECT
  posts.*,
  users.username as author_name,
  users.avatar as author_avatar,  -- 新增
  categories.name as category_name
FROM posts
LEFT JOIN users ON posts.author_id = users.id
LEFT JOIN categories ON posts.category_id = categories.id
```

**修改文章详情接口：**
```sql
SELECT
  posts.*,
  users.username as author_name,
  users.avatar as author_avatar,  -- 新增
  categories.name as category_name
FROM posts
LEFT JOIN users ON posts.author_id = users.id
LEFT JOIN categories ON posts.category_id = categories.id
WHERE posts.id = ?
```

### 前端类型定义

**修改 `types.ts`：**
```typescript
export interface Post {
  // ... 现有字段
  author_avatar?: string;  // 新增
}
```

## 4. 头像上传模态框优化

### 目标

- 将模态框从用户信息框内部移到页面根层级
- 使用全屏居中布局，不遮挡用户信息
- 提供更好的用户体验

### 当前问题

- 模态框嵌套在 `.profile-info` 内部
- 显示时遮挡用户信息
- 布局受限于父容器

### 优化方案

**布局结构：**
```jsx
<div className="profile-page">
  <div className="profile-container">
    {/* 用户信息 */}
  </div>

  {/* 模态框移到根层级 */}
  {showAvatarUpload && (
    <div className="avatar-upload-modal">
      <div className="avatar-upload-content">
        {/* 上传组件 */}
      </div>
    </div>
  )}
</div>
```

**样式实现：**
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
```

**交互优化：**
- 点击遮罩层关闭模态框
- 点击关闭按钮关闭模态框
- 添加淡入淡出动画
- ESC 键关闭模态框（可选）

## 实现优先级

1. **高优先级：**
   - 前端图片压缩（核心功能）
   - 头像统一显示（用户体验）
   - 模态框优化（用户体验）

2. **中优先级：**
   - 更换图片时删除旧图片（成本优化）

3. **低优先级：**
   - 删除文章/用户时删除图片（完善功能）

## 测试计划

### 前端压缩测试
- [ ] 上传大图片（5MB+），验证压缩效果
- [ ] 验证压缩后图片质量
- [ ] 验证上传流程流畅性
- [ ] 测试不同图片格式（JPEG、PNG、WebP）

### 删除逻辑测试
- [ ] 更换头像，验证旧头像被删除
- [ ] 更换封面，验证旧封面被删除
- [ ] 手动输入 URL，验证不会被删除
- [ ] 删除文章，验证封面被删除
- [ ] 验证 COS 中文件确实被删除

### 头像显示测试
- [ ] Header 显示头像
- [ ] PostCard 显示作者头像
- [ ] PostDetail 显示作者头像
- [ ] 无头像时显示首字母
- [ ] 响应式布局测试

### 模态框测试
- [ ] 点击头像打开模态框
- [ ] 点击遮罩层关闭模态框
- [ ] 点击关闭按钮关闭模态框
- [ ] 验证不遮挡用户信息
- [ ] 动画效果流畅

## 风险和注意事项

1. **浏览器兼容性：** `browser-image-compression` 需要现代浏览器支持
2. **大文件压缩：** 超大图片可能导致浏览器卡顿，需要设置合理的文件大小限制
3. **删除安全性：** 确保只删除自己上传的图片，避免误删
4. **数据一致性：** 使用事务确保数据库和 COS 的一致性
5. **错误处理：** COS 删除失败时需要记录日志，便于后续清理

## 后续优化

1. 添加图片裁剪功能
2. 支持拖拽上传
3. 支持粘贴上传
4. 添加上传进度条
5. 批量图片管理功能
