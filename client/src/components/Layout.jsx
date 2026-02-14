import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function Layout({ user, onLogout }) {
  const navigate = useNavigate();

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">Intervention Manager</Link>
        <nav className="nav">
          {user.role === 'admin' && <Link to="/admin">Dashboard</Link>}
          {user.role === 'technician' && <Link to="/technician">My interventions</Link>}
          <span className="user-badge">{user.name}</span>
          <button type="button" className="btn btn-ghost" onClick={() => { onLogout(); navigate('/login'); }}>
            Log out
          </button>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <style>{`
        .layout { min-height: 100vh; display: flex; flex-direction: column; }
        .header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.5rem; background: var(--surface); border-bottom: 1px solid var(--border);
        }
        .logo { font-weight: 700; font-size: 1.15rem; color: var(--text); }
        .nav { display: flex; align-items: center; gap: 1.25rem; }
        .nav a { color: var(--text-muted); font-weight: 500; }
        .nav a:hover { color: var(--text); }
        .user-badge { font-size: 0.875rem; color: var(--text-muted); }
        .main { flex: 1; padding: 1.5rem; max-width: 1200px; margin: 0 auto; width: 100%; }
        .btn-ghost { background: none; border: none; color: var(--text-muted); padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.875rem; }
        .btn-ghost:hover { background: var(--surface-hover); color: var(--text); }
      `}</style>
    </div>
  );
}
