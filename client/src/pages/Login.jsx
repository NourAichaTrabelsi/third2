import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '/api';

export default function Login({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/users`)
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = users.find((u) => u.id === Number(selectedId));
    if (user) {
      onLogin(user);
      navigate(user.role === 'admin' ? '/admin' : '/technician');
    }
  };

  if (loading) return <div className="login-page"><p>Loading…</p></div>;

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Intervention Manager</h1>
        <p className="login-subtitle">Select your account to continue</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="user">User</label>
          <select id="user" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
            <option value="">— Select user —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Continue</button>
        </form>
      </div>
      <style>{`
        .login-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 1rem; background: linear-gradient(145deg, var(--bg) 0%, #15151a 100%);
        }
        .login-card {
          width: 100%; max-width: 380px; background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .login-card h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
        .login-subtitle { color: var(--text-muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
        .login-card label { display: block; margin-bottom: 0.35rem; font-size: 0.875rem; font-weight: 500; }
        .login-card select {
          width: 100%; padding: 0.6rem 0.75rem; margin-bottom: 1.25rem; background: var(--bg);
          border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 1rem;
        }
        .login-card select:focus { outline: none; border-color: var(--accent); }
        .btn-primary {
          width: 100%; padding: 0.7rem; background: var(--accent); color: white; border: none;
          border-radius: 8px; font-weight: 600; font-size: 1rem;
        }
        .btn-primary:hover { background: var(--accent-hover); }
      `}</style>
    </div>
  );
}
