import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { postAPI, categoryAPI } from '../api';
import type { Post } from '../types';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import imageCompression from 'browser-image-compression';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { createMarkdownComponents } from '../utils/markdown';
import './Write.css';

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function Write() {
  useDocumentTitle('写文章 - FoolOyster Blog');
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [tags, setTags] = useState('');
  const [cover, setCover] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadCategories();
    if (postId) {
      loadPost(parseInt(postId));
    }
  }, [postId]);

  // 动态调整布局，避免被 Header 遮挡
  useEffect(() => {
    const updateLayout = () => {
      const header = document.querySelector('.header') as HTMLElement;
      if (header) {
        const headerHeight = header.offsetHeight;
        const writeHeader = document.querySelector('.write-header') as HTMLElement;
        const writeContainer = document.querySelector('.write-container') as HTMLElement;

        if (writeHeader) {
          writeHeader.style.top = `${headerHeight}px`;
        }
        if (writeContainer) {
          writeContainer.style.paddingTop = `${headerHeight + 70}px`;
        }
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getList();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadPost = async (id: number) => {
    try {
      setLoading(true);
      const res = await postAPI.getById(id);
      if (res.success && res.data) {
        const post = res.data;
        setTitle(post.title);
        setContent(post.content || '');
        setCategoryId(post.category_id || '');
        setTags(post.tags ? post.tags.join(', ') : '');
        setCover(post.cover || '');
      }
    } catch (error) {
      console.error('加载文章失败:', error);
      alert('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('请输入文章标题');
      return;
    }
    if (!content.trim()) {
      alert('请输入文章内容');
      return;
    }
    if (!categoryId) {
      alert('请选择文章分类');
      return;
    }

    try {
      setSaving(true);
      const postData: Partial<Post> = {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId as number,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
        cover: cover.trim() || undefined,
      };

      if (postId) {
        await postAPI.update(parseInt(postId), postData);
        alert('文章更新成功！');
      } else {
        const res = await postAPI.create(postData);
        alert('文章发布成功！');
        if (res.success && res.data) {
          navigate(`/post/${res.data.id}`);
          return;
        }
      }
      navigate('/');
    } catch (error: any) {
      console.error('保存失败:', error);
      alert(error.response?.data?.message || '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  // 推送历史快照到撤销栈
  const pushHistorySnapshot = (currentContent: string) => {
    undoStackRef.current.push(currentContent);
    if (undoStackRef.current.length > 200) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
  };

  // 应用编辑器更改
  const applyEditorChange = (newContent: string, nextCursor: number) => {
    setContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = nextCursor;
        textareaRef.current.selectionEnd = nextCursor;
        textareaRef.current.focus();
      }
    }, 0);
  };

  // 处理内容更改（带撤销栈）
  const handleContentChange = (currentContent: string, newContent: string, nextCursor: number) => {
    if (newContent !== currentContent) {
      pushHistorySnapshot(currentContent);
    }
    applyEditorChange(newContent, nextCursor);
  };

  // 撤销
  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;

    const previousContent = undoStackRef.current.pop();
    if (typeof previousContent === 'undefined') return;

    redoStackRef.current.push(content);
    setContent(previousContent);
  };

  // 重做
  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;

    const nextContent = redoStackRef.current.pop();
    if (typeof nextContent === 'undefined') return;

    undoStackRef.current.push(content);
    setContent(nextContent);
  };

  // 在光标位置插入文本（使用撤销栈）
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);

    handleContentChange(content, newContent, start + text.length);
  };

  // 包裹选中文本（使用撤销栈）
  const wrapSelection = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const wrappedText = prefix + selectedText + suffix;

    const newContent = content.substring(0, start) + wrappedText + content.substring(end);
    const newCursorStart = start + prefix.length;
    const newCursorEnd = end + prefix.length;

    handleContentChange(content, newContent, newCursorEnd);

    setTimeout(() => {
      if (textarea) {
        textarea.selectionStart = newCursorStart;
        textarea.selectionEnd = newCursorEnd;
      }
    }, 0);
  };

  // 切换标题（使用撤销栈）
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
    handleContentChange(content, newContent, start);
  };

  // 插入链接（使用撤销栈）
  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const linkText = selectedText || 'text';
    const linkMarkdown = `[${linkText}](url)`;

    const newContent = content.substring(0, start) + linkMarkdown + content.substring(end);
    const urlStart = start + linkText.length + 3;

    handleContentChange(content, newContent, urlStart + 3);

    setTimeout(() => {
      if (textarea) {
        textarea.selectionStart = urlStart;
        textarea.selectionEnd = urlStart + 3;
      }
    }, 0);
  };

  // 插入代码块（使用撤销栈）
  const insertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const codeBlock = '```\n' + (selectedText || 'code') + '\n```';

    const newContent = content.substring(0, start) + codeBlock + content.substring(end);
    const nextCursor = selectedText ? start + codeBlock.length : start + 4;

    handleContentChange(content, newContent, nextCursor);

    if (!selectedText) {
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = start + 4;
          textarea.selectionEnd = start + 8;
        }
      }, 0);
    }
  };

  // 插入列表（使用撤销栈）
  const insertList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', start);
    const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);

    let newLine: string;
    if (line.startsWith('- ')) {
      newLine = line.substring(2);
    } else {
      newLine = '- ' + line;
    }

    const newContent = content.substring(0, lineStart) + newLine + content.substring(lineEnd === -1 ? content.length : lineEnd);
    handleContentChange(content, newContent, start);
  };

  // 保存草稿
  const saveDraft = () => {
    localStorage.setItem('draft', JSON.stringify({ title, content, categoryId, tags, cover }));
    alert('草稿已保存');
  };

  // 触发图片上传
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageUpload(file);
    }
    // 清空 input，允许重复选择同一文件
    e.target.value = '';
  };

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    // 验证文件类型和大小
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

    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const placeholder = '![上传中...]()';

    try {
      // 在光标位置插入占位符
      const beforeCursor = content.substring(0, cursorPos);
      const afterCursor = content.substring(cursorPos);
      const contentWithPlaceholder = beforeCursor + placeholder + afterCursor;
      setContent(contentWithPlaceholder);

      // 压缩图片
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg'
      });

      // 上传到 COS
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
        // 替换占位符为实际 URL
        const imageMarkdown = `![image](${data.data.url})`;
        const newContent = contentWithPlaceholder.replace(placeholder, imageMarkdown);
        setContent(newContent);

        // 恢复光标位置
        setTimeout(() => {
          const newCursorPos = cursorPos + imageMarkdown.length;
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
          textarea.focus();
        }, 0);
      } else {
        throw new Error(data.message || '上传失败');
      }
    } catch (error) {
      // 移除占位符，恢复原内容
      setContent(content);

      const errorMsg = error instanceof Error ? error.message : '上传失败，请稍后重试';
      alert(errorMsg);
    }
  };

  // 处理粘贴
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

  // 处理拖拽
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

  // 快捷键处理
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

    // Ctrl+Z 撤销
    if (withCommand && lowerKey === 'z' && !shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }

    // Ctrl+Y 或 Ctrl+Shift+Z 重做
    if (withCommand && (lowerKey === 'y' || (shiftKey && lowerKey === 'z'))) {
      e.preventDefault();
      handleRedo();
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
    if (withCommand && lowerKey === 'i' && !shiftKey) {
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

  if (loading) {
    return (
      <div className="write-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="write-page">
      <div className="write-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 16l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>返回</span>
          </button>
          <h1 className="page-title">{postId ? '编辑文章' : '写文章'}</h1>
        </div>
        <div className="header-right">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="preview-toggle"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M1 10s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>{previewMode ? '编辑' : '预览'}</span>
          </button>
          <button onClick={handleSave} className="save-button" disabled={saving}>
            {saving ? (
              <>
                <span className="button-spinner"></span>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 18H5a2 2 0 01-2-2V4a2 2 0 012-2h7l5 5v9a2 2 0 01-2 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M13 2v5h5M7 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>{postId ? '更新' : '发布'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="write-container">
        <div className="write-sidebar">
          <div className="form-section">
            <label className="form-label">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 9h12M9 3v12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>文章标题</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入文章标题..."
              className="form-input"
              maxLength={100}
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect
                  x="2" y="2" width="14" height="14" rx="2"
                  stroke="currentColor" strokeWidth="2"
                />
                <path d="M6 2v4M12 2v4M2 8h14" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span>文章分类</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
              className="form-select"
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label className="form-label">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>文章标签</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="用逗号分隔，如：前端, React, TypeScript"
              className="form-input"
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect
                  x="2" y="2" width="14" height="14" rx="2"
                  stroke="currentColor" strokeWidth="2"
                />
                <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                <path
                  d="M14 10l-3-3-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>封面图片</span>
            </label>
            <ImageUpload
              type="cover"
              currentImage={cover}
              onUploadSuccess={(url) => setCover(url)}
              onUploadError={(error) => alert(error)}
            />
            <div className="form-hint">或手动输入图片URL</div>
            <input
              type="text"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="输入图片 URL..."
              className="form-input"
            />
          </div>
        </div>

        <div className={`write-content ${previewMode ? 'preview-mode' : ''}`}>
          {!previewMode && (
            <div className="editor-pane">
              <div className="pane-header">
                <h3>编辑</h3>
                <span className="char-count">{content.length} 字符</span>
              </div>

              {/* 工具栏 */}
              <div className="editor-toolbar">
                <button onClick={() => wrapSelection('**', '**')} title="加粗 (Ctrl+B)" className="toolbar-button">
                  <strong>B</strong>
                </button>
                <button onClick={() => wrapSelection('*', '*')} title="斜体 (Ctrl+I)" className="toolbar-button">
                  <em>I</em>
                </button>
                <button onClick={toggleHeading} title="标题 (Ctrl+Shift+H)" className="toolbar-button">
                  H
                </button>
                <button onClick={insertLink} title="链接 (Ctrl+K)" className="toolbar-button">
                  🔗
                </button>
                <button onClick={insertCodeBlock} title="代码块 (Ctrl+Shift+C)" className="toolbar-button">
                  &lt;/&gt;
                </button>
                <button onClick={insertList} title="列表 (Ctrl+Shift+L)" className="toolbar-button">
                  ≡
                </button>
                <button onClick={triggerImageUpload} title="插入图片 (Ctrl+Shift+I)" className="toolbar-button">
                  🖼️
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  const newContent = e.target.value;
                  const cursorPos = e.currentTarget.selectionStart;
                  handleContentChange(content, newContent, cursorPos);
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                placeholder="开始写作... 支持 Markdown 语法"
                className="markdown-editor"
              />

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}

          <div className="preview-pane">
            <div className="pane-header">
              <h3>预览</h3>
            </div>
            <div className="markdown-preview markdown-body">
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={createMarkdownComponents()}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="empty-preview">预览区域，开始输入内容后会实时显示...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
