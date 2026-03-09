import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postAPI } from '../api';

export default function Write() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cover, setCover] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  useEffect(() => {
    if (editId) {
      loadPost(parseInt(editId));
    }
  }, [editId]);

  const loadPost = async (id: number) => {
    try {
      const res = await postAPI.getById(id);
      if (res.success && res.data) {
        setTitle(res.data.title);
        setContent(res.data.content);
        setCover(res.data.cover || '');
        setTags(res.data.tags.join(', '));
      }
    } catch (error) {
      console.error('加载文章失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        title,
        content,
        cover: cover || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
      };

      if (editId) {
        await postAPI.update(parseInt(editId), data);
        alert('更新成功');
      } else {
        const res = await postAPI.create(data);
        alert('发布成功');
        if (res.data) {
          navigate(`/post/${res.data.id}`);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>{editId ? '编辑文章' : '写文章'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="封面图 URL（可选）"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="标签（用逗号分隔，如：技术, React）"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <textarea
            placeholder="内容（支持 Markdown 格式）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 30px' }}>
          {loading ? '提交中...' : editId ? '更新' : '发布'}
        </button>
      </form>
    </div>
  );
}
