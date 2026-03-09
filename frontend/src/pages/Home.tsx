import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postAPI } from '../api';
import type { Post } from '../types';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await postAPI.getList({ page, pageSize: 10 });
      setPosts(res.data.posts);
      setTotal(res.data.total);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1>文章列表</h1>
      <div>
        {posts.map((post) => (
          <div key={post.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
            <h2>
              <Link to={`/post/${post.id}`}>{post.title}</Link>
            </h2>
            <p>作者: {post.author_name} | 浏览: {post.views}</p>
            <p>标签: {post.tags.join(', ')}</p>
            <p>{new Date(post.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          上一页
        </button>
        <span> 第 {page} 页 </span>
        <button onClick={() => setPage(p => p + 1)} disabled={posts.length < 10}>
          下一页
        </button>
      </div>
    </div>
  );
}
