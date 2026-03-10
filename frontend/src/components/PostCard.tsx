import { Link } from 'react-router-dom';
import type { Post } from '../types';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  showEditButton?: boolean;
  onEdit?: (id: number) => void;
}

export default function PostCard({ post, showEditButton = false, onEdit }: PostCardProps) {
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
            <p className="post-card-item-excerpt">
              {post.content ? post.content.substring(0, 150) : '暂无内容'}...
            </p>
          </div>
          <div className="post-card-item-footer">
            <div className="post-card-item-info">
              <div className="post-card-item-author">
                <div className="post-card-item-avatar">
                  {post.author_name.charAt(0).toUpperCase()}
                </div>
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
