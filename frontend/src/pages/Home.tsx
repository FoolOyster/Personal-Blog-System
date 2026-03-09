import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postAPI } from '../api';
import type { Post } from '../types';
import axios from 'axios';

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
      const res = await axios.get('http://localhost:3000/api/categories');
      if (res.data.success) {
        setCategories(res.data.data);
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 搜索框 */}
      <div style={{ marginBottom: '30px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="搜索文章标题或内容..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 15px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 30px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            搜索
          </button>
          {keyword && (
            <button
              type="button"
              onClick={handleClearSearch}
              style={{
                padding: '10px 20px',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              清除
            </button>
          )}
        </form>
      </div>

      {/* 分类标签 */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCategoryClick(undefined)}
            style={{
              padding: '8px 20px',
              background: selectedCategory === undefined ? '#333' : '#f0f0f0',
              color: selectedCategory === undefined ? 'white' : '#333',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
            }}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              style={{
                padding: '8px 20px',
                background: selectedCategory === category.id ? '#333' : '#f0f0f0',
                color: selectedCategory === category.id ? 'white' : '#333',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 文章列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
          暂无文章
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '30px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  marginBottom: '20px',
                  padding: '20px',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '20px',
                }}
              >
                {/* 封面图 */}
                {post.cover && (
                  <Link to={`/post/${post.id}`} style={{ flexShrink: 0 }}>
                    <img
                      src={post.cover}
                      alt={post.title}
                      style={{
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                    />
                  </Link>
                )}

                {/* 文章信息 */}
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 10px 0' }}>
                    <Link
                      to={`/post/${post.id}`}
                      style={{
                        color: '#333',
                        textDecoration: 'none',
                        fontSize: '20px',
                      }}
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {/* 文章摘要 */}
                  <p
                    style={{
                      color: '#666',
                      margin: '10px 0',
                      lineHeight: '1.6',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.content.substring(0, 150)}...
                  </p>

                  {/* 标签 */}
                  {post.tags.length > 0 && (
                    <div style={{ margin: '10px 0' }}>
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            marginRight: '8px',
                            background: '#f0f0f0',
                            borderRadius: '3px',
                            fontSize: '14px',
                            color: '#666',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 元信息 */}
                  <div style={{ color: '#999', fontSize: '14px', marginTop: '10px' }}>
                    <span>{post.author_name}</span>
                    {post.category_name && (
                      <>
                        <span style={{ margin: '0 8px' }}>·</span>
                        <span>{post.category_name}</span>
                      </>
                    )}
                    <span style={{ margin: '0 8px' }}>·</span>
                    <span>{post.views} 浏览</span>
                    <span style={{ margin: '0 8px' }}>·</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              marginTop: '30px',
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                background: page === 1 ? '#f0f0f0' : '#333',
                color: page === 1 ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              上一页
            </button>

            <span style={{ color: '#666' }}>
              第 {page} / {totalPages} 页，共 {total} 篇文章
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              style={{
                padding: '8px 16px',
                background: page >= totalPages ? '#f0f0f0' : '#333',
                color: page >= totalPages ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
}
