import { Link } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';

export default function Header() {
  const user = getUser();

  return (
    <header style={{ background: '#333', color: 'white', padding: '15px 20px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
            个人博客
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>首页</Link>
          {isAuthenticated() ? (
            <>
              <Link to="/write" style={{ color: 'white', textDecoration: 'none' }}>写文章</Link>
              <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>
                {user?.username}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>登录</Link>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>注册</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
