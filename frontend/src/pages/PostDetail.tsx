import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { postAPI } from '../api';
import type { Post } from '../types';
import { getUser } from '../utils/auth';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
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
    if (!post || !window.confirm('确定要删除这篇文章吗？')) return;

    try {
      await postAPI.delete(post.id);
      alert('删除成功');
      navigate('/');
    } catch (error) {
      alert('删除失败');
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!post) return <div>文章不存在</div>;

  const isAuthor = currentUser?.id === post.author_id;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>{post.title}</h1>
      <div style={{ color: '#666', marginBottom: '20px' }}>
        <span>作者: {post.author_name}</span>
        <span style={{ margin: '0 10px' }}>|</span>
        <span>浏览: {post.views}</span>
        <span style={{ margin: '0 10px' }}>|</span>
        <span>{new Date(post.created_at).toLocaleString()}</span>
      </div>
      {post.tags.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          标签: {post.tags.map(tag => <span key={tag} style={{ marginRight: '10px', padding: '2px 8px', background: '#f0f0f0' }}>{tag}</span>)}
        </div>
      )}
      {post.cover && <img src={post.cover} alt={post.title} style={{ maxWidth: '100%', marginBottom: '20px' }} />}
      <div style={{ lineHeight: '1.8' }}>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
      {isAuthor && (
        <div style={{ marginTop: '30px' }}>
          <button onClick={() => navigate(`/write?id=${post.id}`)} style={{ marginRight: '10px' }}>
            编辑
          </button>
          <button onClick={handleDelete} style={{ background: '#ff4444', color: 'white' }}>
            删除
          </button>
        </div>
      )}
    </div>
  );
}
