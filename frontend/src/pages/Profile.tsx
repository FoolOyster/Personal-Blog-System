import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../api';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import ImageUpload from '../components/ImageUpload';
import imageCompression from 'browser-image-compression';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './Profile.css';

// @ts-ignore
import AvatarCropModal from '../components/AvatarCropModal/AvatarCropModal';

export default function Profile() {
  useDocumentTitle('个人中心 - FoolOyster Blog');
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalTags: 0,
  });

  useEffect(() => {
    if (user) {
      loadMyData();
    }
  }, [user]);

  const loadMyData = async () => {
    try {
      setLoading(true);

      // 并行请求文章列表和统计信息
      const [postsRes, statsRes] = await Promise.all([
        postAPI.getMyPosts({ pageSize: 100 }),
        postAPI.getMyStats(),
      ]);

      // 处理文章列表
      if (postsRes.success && postsRes.data) {
        setMyPosts(postsRes.data.posts);
      }

      // 处理统计信息
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  const handleAvatarUploadSuccess = (url: string) => {
    // 更新用户头像
    if (user) {
      updateUser({ ...user, avatar: url });
    }
    setShowAvatarUpload(false);
    alert('头像更新成功！');
  };

  // 处理头像文件选择
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // 清空 input，允许重复选择同一文件
    e.target.value = '';
  };

  // 处理裁剪确认
  const handleCropConfirm = async (croppedBlob: Blob) => {
    try {
      // 压缩图片
      const compressedFile = await imageCompression(croppedBlob as File, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 400,
        useWebWorker: true,
        fileType: 'image/jpeg'
      });

      // 上传到 COS
      const formData = new FormData();
      formData.append('image', compressedFile);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // 更新用户头像
        if (user) {
          updateUser({ ...user, avatar: data.data.url });
        }
        alert('头像更新成功！');
      } else {
        throw new Error(data.message || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert(error instanceof Error ? error.message : '上传失败，请稍后重试');
    } finally {
      setCropImageSrc(null);
    }
  };

  // 处理裁剪取消
  const handleCropCancel = () => {
    setCropImageSrc(null);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="2" opacity="0.2" />
              <path
                d="M40 20a12 12 0 100 24 12 12 0 000-24zM20 60a20 20 0 0140 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="empty-title">未登录</h2>
          <p className="empty-description">请先登录以查看个人中心</p>
          <button onClick={() => navigate('/login')} className="login-button">
            前往登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header animate-fadeIn">
          <div className="profile-banner">
            <div className="banner-decoration">
              <div className="decoration-circle circle-1"></div>
              <div className="decoration-circle circle-2"></div>
              <div className="decoration-circle circle-3"></div>
            </div>
          </div>

          <div className="profile-info">
            <div className="avatar-section">
              <label htmlFor="avatar-input" style={{ cursor: 'pointer' }}>
                <div className="avatar-large">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} loading="lazy" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileSelect}
                style={{ display: 'none' }}
              />
              <div className="avatar-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="user-details">
              <h1 className="user-name">{user.username}</h1>
              <p className="user-email">{user.email}</p>
              <p className="user-joined">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>加入于 {new Date(user.created_at).toLocaleDateString('zh-CN')}</span>
              </p>
            </div>

            <button onClick={handleLogout} className="logout-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7 17H4a2 2 0 01-2-2V5a2 2 0 012-2h3M13 13l4-4m0 0l-4-4m4 4H7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>退出登录</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">发布文章</p>
              <p className="stat-value">{stats.totalPosts}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">总浏览量</p>
              <p className="stat-value">{stats.totalViews}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-pink">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">使用标签</p>
              <p className="stat-value">{stats.totalTags}</p>
            </div>
          </div>
        </div>

        {/* My Posts Section */}
        <div className="my-posts-section animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h2 className="section-title">我的文章</h2>
            <button onClick={() => navigate('/write')} className="write-button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4v12m-6-6h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>写文章</span>
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">加载中...</p>
            </div>
          ) : myPosts.length === 0 ? (
            <div className="empty-posts">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="12" y="16" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                  <path d="M32 28v16M24 36h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="empty-text">还没有发布文章</p>
              <button onClick={() => navigate('/write')} className="empty-action">
                开始写作
              </button>
            </div>
          ) : (
            <div className="posts-list">
              {myPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <PostCard
                    post={post}
                    showEditButton={true}
                    onEdit={(id) => navigate(`/write?id=${id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 裁剪模态框 */}
      {cropImageSrc && (
        <AvatarCropModal
          imageSrc={cropImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* 模态框移到这里 - 页面根层级 */}
      {showAvatarUpload && (
        <div
          className="avatar-upload-modal"
          onClick={(e) => {
            // 点击遮罩层关闭
            if (e.target === e.currentTarget) {
              setShowAvatarUpload(false);
            }
          }}
        >
          <div className="avatar-upload-content">
            <div className="modal-header">
              <h3>更换头像</h3>
              <button onClick={() => setShowAvatarUpload(false)} className="close-button">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ImageUpload
              type="avatar"
              currentImage={user.avatar}
              onUploadSuccess={handleAvatarUploadSuccess}
              onUploadError={(error) => alert(error)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
