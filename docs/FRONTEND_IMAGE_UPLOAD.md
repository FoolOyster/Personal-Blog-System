# 前端图片上传功能使用说明

## 功能概述

前端已集成图片上传功能，支持：
1. ✅ 文章封面上传（Write页面）
2. ✅ 用户头像上传（Profile页面）
3. ⏳ 文章内容图片上传（待实现）

## 使用方法

### 1. 上传文章封面

**位置**：写文章页面 (`/write`)

**操作步骤**：
1. 进入写文章页面
2. 在左侧边栏找到"封面图片"部分
3. 点击"选择图片"按钮
4. 选择本地图片文件（支持JPEG、PNG、WebP、GIF）
5. 图片自动上传并显示预览
6. 也可以手动输入图片URL

**限制**：
- 最大文件大小：5MB
- 支持格式：JPEG、PNG、WebP、GIF

**效果**：
- 上传成功后，封面URL会自动填充到输入框
- 图片会显示预览
- 发布文章时封面URL会保存到数据库

### 2. 上传用户头像

**位置**：个人中心页面 (`/profile`)

**操作步骤**：
1. 进入个人中心
2. 点击头像区域
3. 弹出头像上传模态框
4. 点击"选择图片"按钮
5. 选择本地图片文件
6. 图片自动上传并更新头像
7. 点击关闭按钮或模态框外部关闭弹窗

**限制**：
- 最大文件大小：2MB
- 支持格式：JPEG、PNG、WebP、GIF
- 图片会自动压缩为400x400px

**效果**：
- 上传成功后，头像立即更新
- 用户信息自动保存到localStorage
- 刷新页面后头像保持更新

## 技术实现

### ImageUpload 组件

**位置**：`frontend/src/components/ImageUpload/ImageUpload.tsx`

**Props**：
```typescript
interface ImageUploadProps {
  type: 'avatar' | 'cover' | 'content';  // 上传类型
  onUploadSuccess?: (url: string) => void;  // 上传成功回调
  onUploadError?: (error: string) => void;  // 上传失败回调
  currentImage?: string;  // 当前图片URL
  className?: string;  // 自定义样式类
}
```

**使用示例**：
```tsx
import ImageUpload from '@/components/ImageUpload/ImageUpload';

<ImageUpload
  type="cover"
  currentImage={cover}
  onUploadSuccess={(url) => setCover(url)}
  onUploadError={(error) => alert(error)}
/>
```

### API调用

组件内部使用 `fetch` 调用后端API：

```typescript
const token = localStorage.getItem('token');
const response = await fetch(`http://localhost:3000/api/upload/${type}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### 文件验证

**客户端验证**：
- 文件类型检查（MIME type）
- 文件大小检查
- 实时预览

**服务端验证**：
- 文件类型白名单
- 文件大小限制
- JWT认证
- 图片压缩优化

## 样式说明

### 头像上传模态框

**CSS类**：
- `.avatar-upload-modal` - 模态框遮罩层
- `.avatar-upload-content` - 模态框内容区
- `.modal-header` - 模态框头部
- `.close-button` - 关闭按钮

**特点**：
- 半透明黑色遮罩
- 居中显示
- 淡入动画
- 点击外部关闭

### 图片上传组件

**CSS类**：
- `.image-upload` - 组件容器
- `.image-preview` - 图片预览区
- `.upload-button` - 上传按钮
- `.upload-tips` - 提示文本

**特点**：
- 渐变按钮样式
- 悬停效果
- 禁用状态
- 响应式设计

## 注意事项

### 1. 认证要求
- 所有上传操作需要登录
- Token从localStorage获取
- Token过期会返回401错误

### 2. 错误处理
- 文件类型不支持：弹出提示
- 文件大小超限：弹出提示
- 网络错误：弹出提示
- 上传失败：恢复原图片

### 3. 用户体验
- 上传中显示"上传中..."
- 上传成功显示"更换图片"
- 支持重新上传
- 实时预览

### 4. 性能优化
- 使用FileReader本地预览
- 不占用额外内存
- 图片自动压缩（后端）
- 异步上传不阻塞UI

## 待实现功能

### 文章内容图片上传

**计划实现方式**：
1. 在Markdown编辑器中添加图片上传按钮
2. 点击按钮弹出上传对话框
3. 上传成功后自动插入Markdown图片语法
4. 支持拖拽上传
5. 支持粘贴上传

**Markdown语法**：
```markdown
![图片描述](https://your-domain.com/content/xxx.jpg)
```

**实现位置**：
- `frontend/src/pages/Write.tsx` - 编辑器工具栏
- 添加图片上传按钮
- 集成ImageUpload组件

## 常见问题

### 1. 上传失败怎么办？
- 检查是否已登录
- 检查网络连接
- 检查文件大小和格式
- 查看浏览器控制台错误信息

### 2. 图片不显示？
- 检查COS配置是否正确
- 检查图片URL是否有效
- 检查浏览器控制台网络请求
- 确认COS存储桶权限为公开读

### 3. 头像没有更新？
- 刷新页面查看
- 检查localStorage中的用户信息
- 清除浏览器缓存
- 重新登录

### 4. 如何修改上传限制？
- 前端：修改 `ImageUpload.tsx` 中的 `MAX_SIZE`
- 后端：修改 `backend/src/config/cos.js` 中的 `MAX_SIZE`
- 两边需要保持一致

## 开发建议

### 1. 添加新的上传类型
```typescript
// 1. 在ImageUpload组件中添加类型
type: 'avatar' | 'cover' | 'content' | 'banner'

// 2. 在MAX_SIZE中添加限制
const MAX_SIZE = {
  avatar: 2 * 1024 * 1024,
  cover: 5 * 1024 * 1024,
  content: 10 * 1024 * 1024,
  banner: 8 * 1024 * 1024  // 新增
};

// 3. 后端添加对应路由
router.post('/banner', authMiddleware, ...);
```

### 2. 自定义样式
```tsx
<ImageUpload
  type="cover"
  className="custom-upload"
  // ...
/>
```

```css
.custom-upload .upload-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### 3. 添加上传进度
```typescript
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', (e) => {
  const percent = (e.loaded / e.total) * 100;
  setProgress(percent);
});
```

## 更新日志

### v1.0.0 (2024-01-01)
- ✅ 实现文章封面上传
- ✅ 实现用户头像上传
- ✅ 添加图片预览功能
- ✅ 添加头像上传模态框
- ✅ 集成后端API
- ✅ 添加错误处理

### 待开发
- ⏳ 文章内容图片上传
- ⏳ 拖拽上传
- ⏳ 粘贴上传
- ⏳ 上传进度显示
- ⏳ 图片裁剪功能
- ⏳ 批量上传
