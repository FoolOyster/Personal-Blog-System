# 头像裁剪、编辑器优化、布局修复和动态标题设计文档

## 概述

本设计文档描述了对个人博客系统的四项优化功能：
1. 头像裁剪功能
2. 写文章页面编辑器增强（快捷键 + 图片插入）
3. 修复写文章页面布局问题
4. 动态页面标题

## 实现策略

采用**渐进式实现**方案，按以下优先级顺序开发：
1. 动态页面标题（最简单，快速见效）
2. 修复布局问题（提升用户体验）
3. 头像裁剪功能（独立功能模块）
4. 编辑器增强（快捷键 + 图片插入，最复杂）

## 1. 动态页面标题

### 目标

- 根据当前路由和页面内容动态设置浏览器标题
- 提升用户体验和 SEO

### 实现方式

**创建自定义 Hook：** `frontend/src/hooks/useDocumentTitle.ts`

```typescript
import { useEffect } from 'react';

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};
```

**标题映射规则：**
- 首页: `FoolOyster Blog`
- 写文章: `写文章 - FoolOyster Blog`
- 登录: `登录 - FoolOyster Blog`
- 注册: `注册 - FoolOyster Blog`
- 个人中心: `个人中心 - FoolOyster Blog`
- 文章详情: `${post.title} - FoolOyster Blog`

### 修改的文件

- 创建: `frontend/src/hooks/useDocumentTitle.ts`
- 修改: `frontend/src/pages/Home.tsx`
- 修改: `frontend/src/pages/Write.tsx`
- 修改: `frontend/src/pages/Login.tsx`
- 修改: `frontend/src/pages/Register.tsx`
- 修改: `frontend/src/pages/Profile.tsx`
- 修改: `frontend/src/pages/PostDetail.tsx`

### 技术要点

- 文章详情页需要等文章数据加载后再设置标题
- 组件卸载时恢复之前的标题
- 使用 `document.title` API

## 2. 修复布局问题

### 问题分析

- 当前 `.write-header` 使用 `position: fixed; top: 70px`
- 实际 Header 高度可能因响应式布局变化
- 导致 Write 页面顶部按钮被主 Header 遮挡

### 解决方案

**动态计算 Header 高度：**
- 使用 JavaScript 获取 Header 的实际高度
- 动态设置 `.write-header` 的 `top` 值
- 动态设置页面容器的 `padding-top`
- 监听窗口 resize 事件实时调整

### 实现代码

在 `Write.tsx` 中添加：

```typescript
useEffect(() => {
  const updateLayout = () => {
    const header = document.querySelector('.header');
    if (header) {
      const headerHeight = header.offsetHeight;
      const writeHeader = document.querySelector('.write-header');
      const writeContainer = document.querySelector('.write-container');

      if (writeHeader) {
        (writeHeader as HTMLElement).style.top = `${headerHeight}px`;
      }
      if (writeContainer) {
        (writeContainer as HTMLElement).style.paddingTop = `${headerHeight + 70}px`;
      }
    }
  };

  updateLayout();
  window.addEventListener('resize', updateLayout);
  return () => window.removeEventListener('resize', updateLayout);
}, []);
```

### 修改的文件

- 修改: `frontend/src/pages/Write.tsx`
- 修改: `frontend/src/pages/Write.css`（移除硬编码的 top 值）

### 优势

- 自适应不同屏幕尺寸
- 无需硬编码高度值
- 响应式友好

## 3. 头像裁剪功能

### 目标

- 用户上传头像时可以裁剪图片
- 支持缩放和拖动调整裁剪区域
- 裁剪后的图片自动压缩并上传

### 技术选型

**库：** `react-easy-crop`

**安装：**
```bash
npm install react-easy-crop
```

### 实现流程

1. 用户点击头像，打开文件选择对话框
2. 选择图片后，显示裁剪模态框
3. 用户调整裁剪区域（缩放、拖动）
4. 点击"确认"，生成裁剪后的图片 Blob
5. 使用 `browser-image-compression` 压缩
6. 上传到 COS，删除旧头像（如果存在）
7. 更新用户头像 URL

### 裁剪配置

```typescript
{
  aspect: 1,              // 1:1 正方形头像
  cropShape: 'round',     // 圆形裁剪框
  showGrid: false,        // 不显示网格
  minZoom: 1,
  maxZoom: 3
}
```

### 组件结构

**创建新组件：** `frontend/src/components/AvatarCropModal/AvatarCropModal.tsx`

**Props 接口：**
```typescript
interface AvatarCropModalProps {
  imageSrc: string;                          // 原始图片 URL
  onConfirm: (croppedBlob: Blob) => void;   // 确认回调
  onCancel: () => void;                      // 取消回调
}
```

**状态管理：**
```typescript
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
```

### 修改的文件

- 创建: `frontend/src/components/AvatarCropModal/AvatarCropModal.tsx`
- 创建: `frontend/src/components/AvatarCropModal/AvatarCropModal.css`
- 创建: `frontend/src/utils/cropImage.ts`（裁剪工具函数）
- 修改: `frontend/src/pages/Profile.tsx`

### 裁剪工具函数

**文件：** `frontend/src/utils/cropImage.ts`

```typescript
export const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg');
  });
};

const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
};
```

### 用户体验

- 模态框全屏居中显示，半透明遮罩
- 提供缩放滑块和拖动功能
- 显示"取消"和"确认裁剪"按钮
- 裁剪预览实时更新
- 添加淡入淡出动画

## 4. 编辑器增强

### 4.1 快捷键功能

### 目标

- 提供常用的 Markdown 格式化快捷键
- 提升写作效率
- 支持撤销/重做和保存草稿

### 实现的快捷键

| 快捷键 | 功能 | Markdown 语法 |
|--------|------|---------------|
| `Ctrl+B` | 加粗 | `**text**` |
| `Ctrl+I` | 斜体 | `*text*` |
| `Ctrl+Shift+H` | 标题切换 | 在行首添加/移除 `#` |
| `Tab` | 缩进 | 添加 2 个空格 |
| `Ctrl+K` | 插入链接 | `[text](url)` |
| `Ctrl+Shift+C` | 插入代码块 | ` ```\ncode\n``` ` |
| `Ctrl+Shift+L` | 插入列表 | 在行首添加 `- ` |
| `Ctrl+Z` | 撤销 | 浏览器原生 |
| `Ctrl+Y` | 重做 | 浏览器原生 |
| `Ctrl+S` | 保存草稿 | 保存到 localStorage |
| `Ctrl+Shift+I` | 插入图片 | 打开文件选择 |

### 实现方式

在 `Write.tsx` 的 textarea 添加 `onKeyDown` 事件处理：

```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  const { key, ctrlKey, metaKey, shiftKey } = e;
  const withCommand = ctrlKey || metaKey;
  const lowerKey = key.toLowerCase();

  // Tab 缩进
  if (key === 'Tab') {
    e.preventDefault();
    insertAtCursor('  ');
    return;
  }

  // Ctrl+S 保存草稿
  if (withCommand && lowerKey === 's') {
    e.preventDefault();
    saveDraft();
    return;
  }

  // Ctrl+B 加粗
  if (withCommand && lowerKey === 'b') {
    e.preventDefault();
    wrapSelection('**', '**');
    return;
  }

  // Ctrl+I 斜体
  if (withCommand && lowerKey === 'i') {
    e.preventDefault();
    wrapSelection('*', '*');
    return;
  }

  // Ctrl+Shift+H 标题
  if (withCommand && shiftKey && lowerKey === 'h') {
    e.preventDefault();
    toggleHeading();
    return;
  }

  // Ctrl+K 链接
  if (withCommand && lowerKey === 'k') {
    e.preventDefault();
    insertLink();
    return;
  }

  // Ctrl+Shift+C 代码块
  if (withCommand && shiftKey && lowerKey === 'c') {
    e.preventDefault();
    insertCodeBlock();
    return;
  }

  // Ctrl+Shift+L 列表
  if (withCommand && shiftKey && lowerKey === 'l') {
    e.preventDefault();
    insertList();
    return;
  }

  // Ctrl+Shift+I 插入图片
  if (withCommand && shiftKey && lowerKey === 'i') {
    e.preventDefault();
    triggerImageUpload();
    return;
  }
};
```

### 工具函数

```typescript
// 在光标位置插入文本
const insertAtCursor = (text: string) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const newContent = content.substring(0, start) + text + content.substring(end);

  setContent(newContent);

  // 恢复光标位置
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
  }, 0);
};

// 包裹选中文本
const wrapSelection = (prefix: string, suffix: string) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = content.substring(start, end);
  const wrappedText = prefix + selectedText + suffix;

  const newContent = content.substring(0, start) + wrappedText + content.substring(end);
  setContent(newContent);

  setTimeout(() => {
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = end + prefix.length;
    textarea.focus();
  }, 0);
};

// 切换标题
const toggleHeading = () => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const lineStart = content.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = content.indexOf('\n', start);
  const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);

  let newLine: string;
  if (line.startsWith('# ')) {
    newLine = line.substring(2);
  } else {
    newLine = '# ' + line;
  }

  const newContent = content.substring(0, lineStart) + newLine + content.substring(lineEnd === -1 ? content.length : lineEnd);
  setContent(newContent);
};

// 保存草稿
const saveDraft = () => {
  localStorage.setItem('draft', JSON.stringify({ title, content, categoryId, tags, cover }));
  alert('草稿已保存');
};
```

### 4.2 图片插入功能

### 目标

- 支持多种方式插入图片（粘贴、拖拽、按钮、快捷键）
- 自动上传到 COS
- 在光标位置插入 Markdown 语法
- 显示上传进度

### 三种触发方式

**1. 粘贴插入（Ctrl+V）**

```typescript
const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      e.preventDefault();
      const file = items[i].getAsFile();
      if (file) {
        await handleImageUpload(file);
      }
      break;
    }
  }
};
```

**2. 拖拽插入**

```typescript
const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault();

  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    if (files[i].type.startsWith('image/')) {
      await handleImageUpload(files[i]);
      break;
    }
  }
};

const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
};
```

**3. 工具栏按钮 + 快捷键**

```typescript
const fileInputRef = useRef<HTMLInputElement>(null);

const triggerImageUpload = () => {
  fileInputRef.current?.click();
};

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && file.type.startsWith('image/')) {
    await handleImageUpload(file);
  }
  // 清空 input，允许重复选择同一文件
  e.target.value = '';
};
```

### 图片上传流程

```typescript
const handleImageUpload = async (file: File) => {
  // 1. 验证文件类型和大小
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    alert('不支持的文件类型，仅支持 JPEG、PNG、WebP、GIF 格式');
    return;
  }

  if (file.size > MAX_SIZE) {
    alert('文件大小超出限制，最大支持 10MB');
    return;
  }

  try {
    // 2. 在光标位置插入占位符
    const placeholder = '![上传中...]()';
    const textarea = textareaRef.current;
    const cursorPos = textarea?.selectionStart || content.length;
    insertAtCursor(placeholder);

    // 3. 压缩图片
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg'
    });

    // 4. 上传到 COS
    const formData = new FormData();
    formData.append('image', compressedFile);

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/upload/content', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // 5. 替换占位符为实际 URL
      const imageMarkdown = `![image](${data.data.url})`;
      const newContent = content.replace(placeholder, imageMarkdown);
      setContent(newContent);

      // 恢复光标位置
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = cursorPos + imageMarkdown.length;
          textarea.focus();
        }
      }, 0);
    } else {
      throw new Error(data.message || '上传失败');
    }
  } catch (error) {
    // 移除占位符
    const newContent = content.replace(placeholder, '');
    setContent(newContent);

    const errorMsg = error instanceof Error ? error.message : '上传失败，请稍后重试';
    alert(errorMsg);
  }
};
```

### 工具栏设计

在编辑器顶部添加工具栏：

```tsx
<div className="editor-toolbar">
  <button onClick={() => wrapSelection('**', '**')} title="加粗 (Ctrl+B)">
    <strong>B</strong>
  </button>
  <button onClick={() => wrapSelection('*', '*')} title="斜体 (Ctrl+I)">
    <em>I</em>
  </button>
  <button onClick={toggleHeading} title="标题 (Ctrl+Shift+H)">
    H
  </button>
  <button onClick={insertLink} title="链接 (Ctrl+K)">
    🔗
  </button>
  <button onClick={insertCodeBlock} title="代码块 (Ctrl+Shift+C)">
    &lt;/&gt;
  </button>
  <button onClick={insertList} title="列表 (Ctrl+Shift+L)">
    ≡
  </button>
  <button onClick={triggerImageUpload} title="插入图片 (Ctrl+Shift+I)">
    🖼️
  </button>
  <div className="toolbar-divider"></div>
  <button onClick={() => setPreviewMode(!previewMode)} title="预览">
    {previewMode ? '编辑' : '预览'}
  </button>
</div>
```

### 图片删除逻辑

**后端改动：**
- 文章保存时，解析 content 中的所有图片 URL
- 将图片 URL 记录到 `images` 表，标记 `is_uploaded = TRUE`，关联 `post_id`
- 文章删除时，查询关联的所有 content 类型图片，调用 `deleteFromCOS()` 删除

**注意事项：**
- 用户编辑文章时移除图片 URL，保存时不删除（避免误删）
- 只在文章被删除时才删除关联的图片

### 修改的文件

**前端：**
- 修改: `frontend/src/pages/Write.tsx`
- 修改: `frontend/src/pages/Write.css`
- 安装依赖: `npm install browser-image-compression`（已安装）

**后端：**
- 修改: `backend/src/controllers/postController.js`（文章保存和删除逻辑）
- 修改: `backend/src/routes/upload.js`（确保 content 类型上传接口存在）

## 测试计划

### 动态标题测试
- [ ] 访问各个页面，验证标题正确显示
- [ ] 文章详情页标题显示文章标题
- [ ] 页面切换时标题正确更新

### 布局修复测试
- [ ] 不同屏幕尺寸下验证 Write 页面按钮不被遮挡
- [ ] 窗口 resize 时布局自动调整
- [ ] 移动端响应式测试

### 头像裁剪测试
- [ ] 上传图片后显示裁剪模态框
- [ ] 缩放和拖动功能正常
- [ ] 裁剪后的图片正确上传
- [ ] 旧头像被正确删除
- [ ] 取消裁剪不上传图片

### 快捷键测试
- [ ] 所有快捷键功能正常
- [ ] 光标位置和选区状态正确
- [ ] Ctrl+S 保存草稿到 localStorage
- [ ] 刷新页面后草稿可恢复

### 图片插入测试
- [ ] 粘贴图片正常上传并插入
- [ ] 拖拽图片正常上传并插入
- [ ] 工具栏按钮选择图片正常
- [ ] Ctrl+Shift+I 快捷键正常
- [ ] 上传进度提示正确显示
- [ ] 上传失败时占位符被移除
- [ ] 图片压缩功能正常
- [ ] 文章删除时关联图片被删除

## 风险和注意事项

1. **浏览器兼容性：** 快捷键在 Mac 上使用 Cmd 键，Windows 使用 Ctrl 键
2. **图片上传性能：** 大图片压缩可能导致浏览器卡顿，需要合理限制文件大小
3. **草稿保存：** localStorage 有大小限制（通常 5-10MB），超大文章可能无法保存
4. **图片删除安全性：** 确保只删除自己上传的图片，避免误删
5. **裁剪质量：** Canvas 裁剪可能导致图片质量下降，需要合理设置压缩参数
6. **快捷键冲突：** 避免与浏览器或操作系统的快捷键冲突

## 后续优化

1. 支持更多 Markdown 语法快捷键（引用、分割线等）
2. 添加图片裁剪功能（用于文章封面）
3. 支持批量图片上传
4. 添加图片管理功能（查看、删除已上传的图片）
5. 支持从 URL 插入图片
6. 添加编辑器自动保存功能（定时保存草稿）
7. 支持 Markdown 语法高亮
8. 添加字数统计功能
