import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { postAPI, categoryAPI } from '../api';
import type { Post } from '../types';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import './Write.css';

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function Write() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');
  const navigate = useNavigate();

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
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始写作... 支持 Markdown 语法"
                className="markdown-editor"
              />
            </div>
          )}

          <div className="preview-pane">
            <div className="pane-header">
              <h3>预览</h3>
            </div>
            <div className="markdown-preview markdown-body">
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
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
