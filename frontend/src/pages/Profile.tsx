import { getUser, logout } from '../utils/auth';

export default function Profile() {
  const user = getUser();

  if (!user) {
    return <div>请先登录</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>个人中心</h1>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>用户名:</strong> {user.username}</p>
        <p><strong>邮箱:</strong> {user.email}</p>
        <p><strong>注册时间:</strong> {new Date(user.created_at).toLocaleString()}</p>
      </div>
      <button onClick={logout} style={{ padding: '10px 20px', background: '#ff4444', color: 'white', border: 'none', cursor: 'pointer' }}>
        退出登录
      </button>
    </div>
  );
}
