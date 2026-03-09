import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import './Login.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.register({ username, email, password });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card animate-scaleIn">
            <div className="success-content">
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" stroke="url(#success-gradient)" strokeWidth="3" />
                  <path
                    d="M20 32l8 8 16-16"
                    stroke="url(#success-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="success-gradient" x1="0" y1="0" x2="64" y2="64">
                      <stop offset="0%" stopColor="#43e97b" />
                      <stop offset="100%" stopColor="#38f9d7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2 className="success-title">注册成功！</h2>
              <p className="success-message">正在跳转到登录页面...</p>
              <div className="success-loader">
                <div className="loader-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card animate-scaleIn">
          <div className="auth-header">
            <div className="auth-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 4v40M4 24h40"
                  stroke="url(#register-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="24" cy="24" r="18" stroke="url(#register-gradient)" strokeWidth="3" />
                <defs>
                  <linearGradient id="register-gradient" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#43e97b" />
                    <stop offset="100%" stopColor="#38f9d7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="auth-title">创建账号</h1>
            <p className="auth-subtitle">加入 FoolOyster Blog 社区</p>
          </div>

          {error && (
            <div className="auth-error animate-fadeIn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                用户名
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 10a4 4 0 100-8 4 4 0 000 8zM3 18a7 7 0 0114 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  id="username"
                  type="text"
                  placeholder="3-20个字符"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  className="form-input"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                邮箱
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M2 5l8 5 8-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                密码
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="9" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M6 9V6a4 4 0 018 0v3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  id="password"
                  type="password"
                  placeholder="至少6位字符"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  <span>注册中...</span>
                </>
              ) : (
                <>
                  <span>创建账号</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10h12M12 6l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-link-text">
              已有账号？
              <Link to="/login" className="auth-link">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-decoration">
          <div className="decoration-orb orb-1"></div>
          <div className="decoration-orb orb-2"></div>
          <div className="decoration-orb orb-3"></div>
        </div>
      </div>
    </div>
  );
}
