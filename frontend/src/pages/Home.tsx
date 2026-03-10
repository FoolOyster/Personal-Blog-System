import { useEffect, useState } from 'react';
import { postAPI, categoryAPI } from '../api';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import './Home.css';

interface Category {
  id: number;
  name: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [page, selectedCategory, keyword]);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getList();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await postAPI.getList({
        page,
        pageSize: 10,
        category_id: selectedCategory,
        keyword: keyword || undefined,
      });
      setPosts(res.data.posts);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId?: number) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setKeyword('');
    setPage(1);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content animate-fadeIn">
          <h1 className="hero-title">
            探索<span className="gradient-text">无限</span>可能
          </h1>
          <p className="hero-subtitle">
            在这里分享知识、记录生活、探索世界
          </p>
        </div>
        <div className="hero-decoration">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>
      </section>

      <div className="container">
        {/* Search Section */}
        <section className="search-section animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="搜索文章标题或内容..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="search-clear"
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M12 4L4 12M4 4l8 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button type="submit" className="search-button">
              <span>搜索</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 12l6-4-6-4v8z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </form>
        </section>

        {/* Categories Section */}
        <section className="categories-section animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="categories-wrapper">
            <button
              onClick={() => handleCategoryClick(undefined)}
              className={`category-chip ${selectedCategory === undefined ? 'active' : ''}`}
            >
              <span className="category-chip-text">全部</span>
              <span className="category-chip-bg"></span>
            </button>
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <span className="category-chip-text">{category.name}</span>
                <span className="category-chip-bg"></span>
              </button>
            ))}
          </div>
        </section>

        {/* Posts Section */}
        <section className="posts-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">加载中...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                  <path
                    d="M32 20v24M20 32h24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="empty-title">暂无文章</h3>
              <p className="empty-description">换个关键词试试吧</p>
            </div>
          ) : (
            <>
              <div className="posts-grid">
                {posts.map((post, index) => (
                  <div
                    key={post.id}
                    className="animate-scaleIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PostCard post={post} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="pagination-button"
                    aria-label="Previous page"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M12 16l-6-6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className="pagination-info">
                    <span className="pagination-current">{page}</span>
                    <span className="pagination-separator">/</span>
                    <span className="pagination-total">{totalPages}</span>
                  </div>

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                    className="pagination-button"
                    aria-label="Next page"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M8 4l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
