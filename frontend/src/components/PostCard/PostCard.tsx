import { Link } from 'react-router-dom';
import type { Post } from '../../types';
import Avatar from '../Avatar';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  showEditButton?: boolean;
  onEdit?: (id: number) => void;
}

// 从Markdown内容中提取纯文本摘要
const getPlainTextExcerpt = (markdown: string, maxLength: number = 150): string => {
  if (!markdown) return '暂无内容';

  // 移除Markdown语法
  let text = markdown
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`[^`]+`/g, '')
    // 移除图片
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 移除链接，保留文本
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体和斜体
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // 移除删除线
    .replace(/~~(.*?)~~/g, '$1')
    // 移除引用标记
    .replace(/^>\s+/gm, '')
    // 移除列表标记
    .replace(/^[\*\-\+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // 移除水平线
    .replace(/^[\*\-_]{3,}$/gm, '')
    // 将多个连续空行压缩为单个换行
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // 移除行首行尾空白，但保留换行符
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();

  // 截取指定长度
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }

  return text || '暂无内容';
};

export default function PostCard({ post, showEditButton = false, onEdit }: PostCardProps) {
  const excerpt = getPlainTextExcerpt(post.content || '', 150);

  return (
    <article className="post-card-item">
      <Link to={`/post/${post.id}`} className="post-card-item-link">
        {post.cover && (
          <div className="post-card-item-cover">
            <img src={post.cover} alt={post.title} loading="lazy" />
          </div>
        )}
        <div className="post-card-item-content">
          <div className="post-card-item-header">
            <div className="post-card-item-meta">
              {post.category_name && (
                <span className="post-card-item-category">{post.category_name}</span>
              )}
              <span className="post-card-item-date">
                {new Date(post.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h2 className="post-card-item-title">{post.title}</h2>
            <div className="post-card-item-excerpt">
              {excerpt}
            </div>
          </div>
          <div className="post-card-item-footer">
            <div className="post-card-item-info">
              <div className="post-card-item-author">
                <Avatar
                  src={post.author_avatar}
                  name={post.author_name}
                  size="small"
                  className="post-card-item-avatar"
                />
                <span className="post-card-item-author-name">{post.author_name}</span>
              </div>
              <span className="post-card-item-views">
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
                {post.views}
              </span>
              {post.category_name && (
                <span className="post-card-item-category-badge">{post.category_name}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
      {showEditButton && onEdit && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(post.id);
          }}
          className="post-card-item-edit"
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
        </button>
      )}
    </article>
  );
}
