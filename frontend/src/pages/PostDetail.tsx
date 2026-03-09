import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { postAPI } from '../api';
import type { Post } from '../types';
import { getUser } from '../utils/auth';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const currentUser = getUser();

  useEffect(() => {
    if (id) {
      loadPost(parseInt(id));
    }
  }, [id]);

  const loadPost = async (postId: number) => {
    try {
      setLoading(true);
      const res = await postAPI.getById(postId);
      if (res.success && res.data) {
        setPost(res.data);
      }
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    const confirmed = window.confirm('确定要删除这篇文章吗？此操作无法撤销。');
    if (!confirmed) return;

    try {
      setDeleting(true);
      await postAPI.delete(post.id);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                <path d="M32 20v24M20 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="empty-title">文章不存在</h2>
            <p className="empty-description">该文章可能已被删除或不存在</p>
            <Link to="/" className="back-button">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser?.id === post.author_id;

  return (
    <div className="post-detail-page">
      <div className="container">
        <article className="post-detail animate-fadeIn">
          {/* Back Button */}
          <Link to="/" className="back-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 16l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>返回首页</span>
          </Link>

          {/* Post Header */}
          <header className="post-header">
            <div className="post-meta-top">
              {post.category_name && (
                <span className="post-category-badge">{post.category_name}</span>
              )}
              <time className="post-date">
                {new Date(post.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            <h1 className="post-title">{post.title}</h1>

            <div className="post-meta-bottom">
              <div className="author-info">
                <div className="author-avatar">
                  {post.author_name.charAt(0).toUpperCase()}
                </div>
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

              {isAuthor && (
                <div className="post-actions">
                  <button
                    onClick={() => navigate(`/write?id=${post.id}`)}
                    className="action-button edit-button"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M12.5 2.5l3 3L6 15H3v-3L12.5 2.5z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>编辑</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="action-button delete-button"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="button-spinner"></span>
                        <span>删除中...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path
                            d="M3 5h12M7 5V3h4v2M5 5v10h8V5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>删除</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="post-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {post.cover && (
            <div className="post-cover">
              <img src={post.cover} alt={post.title} loading="lazy" />
            </div>
          )}

          {/* Post Content */}
          <div className="post-content markdown-body">
            <ReactMarkdown>{post.content || '暂无内容'}</ReactMarkdown>
          </div>

          {/* Post Footer */}
          <footer className="post-footer">
            <div className="footer-divider"></div>
            <div className="footer-content">
              <div className="footer-author">
                <div className="author-avatar-large">
                  {post.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="author-info-large">
                  <h3 className="author-name-large">{post.author_name}</h3>
                  <p className="author-bio">文章作者</p>
                </div>
              </div>
              <Link to="/" className="back-button">
                返回首页
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
