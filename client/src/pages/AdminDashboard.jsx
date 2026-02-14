import { useState, useEffect } from 'react';

const API = '/api';
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export default function AdminDashboard() {
  const [interventions, setInterventions] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assigned_technician_id: '' });

  const load = () => {
    Promise.all([
      fetch(`${API}/interventions`).then((r) => r.json()),
      fetch(`${API}/users/technicians`).then((r) => r.json()),
    ])
      .then(([ints, techs]) => {
        setInterventions(ints);
        setTechnicians(techs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = (e) => {
    e.preventDefault();
    fetch(`${API}/interventions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        assigned_technician_id: form.assigned_technician_id ? Number(form.assigned_technician_id) : null,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setForm({ title: '', description: '', assigned_technician_id: '' });
        setShowForm(false);
        load();
      })
      .catch(console.error);
  };

  const handleAssign = (id, technicianId) => {
    fetch(`${API}/interventions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_technician_id: technicianId || null }),
    })
      .then((r) => r.json())
      .then(() => load())
      .catch(console.error);
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Interventions</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New intervention
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h2>Create intervention</h2>
          <form onSubmit={handleCreate}>
            <label>Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Replace server disk"
              required
            />
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional details"
              rows={3}
            />
            <label>Assign to technician</label>
            <select
              value={form.assigned_technician_id}
              onChange={(e) => setForm((f) => ({ ...f, assigned_technician_id: e.target.value }))}
            >
              <option value="">— Not assigned —</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-card">
        <table className="interventions-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Assigned to</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interventions.length === 0 ? (
              <tr><td colSpan={6}>No interventions yet. Create one above.</td></tr>
            ) : (
              interventions.map((i) => (
                <tr key={i.id}>
                  <td>{i.id}</td>
                  <td>
                    <strong>{i.title}</strong>
                    {i.description && <div className="cell-desc">{i.description}</div>}
                  </td>
                  <td><span className={`badge status-${i.status}`}>{STATUS_LABELS[i.status]}</span></td>
                  <td>
                    <select
                      value={i.assigned_technician_id || ''}
                      onChange={(e) => handleAssign(i.id, e.target.value)}
                      className="assign-select"
                    >
                      <option value="">— Unassigned —</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(i.updated_at).toLocaleDateString()}</td>
                  <td>—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .admin-dashboard .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .admin-dashboard h1 { margin: 0; font-size: 1.5rem; }
        .btn-primary { padding: 0.5rem 1rem; background: var(--accent); color: white; border: none; border-radius: 8px; font-weight: 600; }
        .btn-primary:hover { background: var(--accent-hover); }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; margin-bottom: 1rem; }
        .form-card h2 { margin: 0 0 1rem; font-size: 1.1rem; }
        .form-card label { display: block; margin-bottom: 0.35rem; font-size: 0.875rem; font-weight: 500; }
        .form-card input, .form-card textarea, .form-card select {
          width: 100%; padding: 0.5rem 0.75rem; margin-bottom: 1rem; background: var(--bg); border: 1px solid var(--border);
          border-radius: 8px; color: var(--text);
        }
        .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
        .interventions-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .interventions-table th, .interventions-table td { text-align: left; padding: 0.75rem; border-bottom: 1px solid var(--border); }
        .interventions-table th { color: var(--text-muted); font-weight: 600; }
        .cell-desc { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }
        .badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500; }
        .badge.status-todo { background: var(--surface-hover); color: var(--text-muted); }
        .badge.status-in_progress { background: rgba(234,179,8,0.2); color: var(--warning); }
        .badge.status-done { background: rgba(34,197,94,0.2); color: var(--success); }
        .assign-select { background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 0.35rem 0.5rem; border-radius: 6px; min-width: 140px; }
      `}</style>
    </div>
  );
}
