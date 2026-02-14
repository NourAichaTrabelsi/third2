import { useState, useEffect } from 'react';

const API = '/api';
const STATUS_FLOW = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function TechnicianDashboard() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = () => {
    if (!user.id) return;
    fetch(`${API}/interventions?technicianId=${user.id}`)
      .then((r) => r.json())
      .then(setInterventions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [user.id]);

  const updateStatus = (id, status) => {
    fetch(`${API}/interventions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then((r) => r.json())
      .then(() => load())
      .catch(console.error);
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="technician-dashboard">
      <h1>My interventions</h1>
      <p className="subtitle">View and update the status of your assigned interventions.</p>

      {interventions.length === 0 ? (
        <div className="card empty-state">
          <p>You have no assigned interventions.</p>
        </div>
      ) : (
        <div className="intervention-cards">
          {interventions.map((i) => (
            <div key={i.id} className="card intervention-card">
              <div className="card-header">
                <span className="card-id">#{i.id}</span>
                <span className={`badge status-${i.status}`}>
                  {STATUS_FLOW.find((s) => s.value === i.status)?.label || i.status}
                </span>
              </div>
              <h3>{i.title}</h3>
              {i.description && <p className="description">{i.description}</p>}
              <div className="lifecycle">
                <span className="lifecycle-label">Update status:</span>
                <div className="status-buttons">
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      className={`btn status-btn ${i.status === s.value ? 'active' : ''}`}
                      onClick={() => updateStatus(i.id, s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        .technician-dashboard h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
        .technician-dashboard .subtitle { color: var(--text-muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; }
        .empty-state { text-align: center; color: var(--text-muted); }
        .intervention-cards { display: grid; gap: 1rem; }
        .intervention-card .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .card-id { font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); }
        .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500; }
        .badge.status-todo { background: var(--surface-hover); color: var(--text-muted); }
        .badge.status-in_progress { background: rgba(234,179,8,0.2); color: var(--warning); }
        .badge.status-done { background: rgba(34,197,94,0.2); color: var(--success); }
        .intervention-card h3 { margin: 0 0 0.5rem; font-size: 1.1rem; }
        .intervention-card .description { color: var(--text-muted); font-size: 0.9rem; margin: 0 0 1rem; }
        .lifecycle { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
        .lifecycle-label { font-size: 0.8rem; color: var(--text-muted); margin-right: 0.5rem; }
        .status-buttons { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
        .status-btn { padding: 0.4rem 0.75rem; background: var(--surface-hover); border: 1px solid var(--border); color: var(--text); border-radius: 6px; font-size: 0.85rem; }
        .status-btn:hover { background: var(--border); }
        .status-btn.active { background: var(--accent); border-color: var(--accent); color: white; }
      `}</style>
    </div>
  );
}
