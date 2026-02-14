import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const STATUSES = ['todo', 'in_progress', 'done'];

// --- Users ---
app.get('/api/users', (req, res) => {
  try {
    const role = req.query.role;
    let stmt = db.prepare('SELECT id, name, email, role FROM users');
    const users = role ? db.prepare('SELECT id, name, email, role FROM users WHERE role = ?').all(role) : stmt.all();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/users/technicians', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email FROM users WHERE role = ?').all('technician');
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Interventions (admin: create, list all, assign) ---
app.get('/api/interventions', (req, res) => {
  try {
    const technicianId = req.query.technicianId;
    let interventions;
    if (technicianId) {
      interventions = db.prepare(`
        SELECT i.*, u.name as assigned_technician_name
        FROM interventions i
        LEFT JOIN users u ON i.assigned_technician_id = u.id
        WHERE i.assigned_technician_id = ?
        ORDER BY i.updated_at DESC
      `).all(technicianId);
    } else {
      interventions = db.prepare(`
        SELECT i.*, u.name as assigned_technician_name
        FROM interventions i
        LEFT JOIN users u ON i.assigned_technician_id = u.id
        ORDER BY i.updated_at DESC
      `).all();
    }
    res.json(interventions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/interventions/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT i.*, u.name as assigned_technician_name, u.email as assigned_technician_email
      FROM interventions i
      LEFT JOIN users u ON i.assigned_technician_id = u.id
      WHERE i.id = ?
    `).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Intervention not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/interventions', (req, res) => {
  try {
    const { title, description, assigned_technician_id, created_by } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    const stmt = db.prepare(`
      INSERT INTO interventions (title, description, status, assigned_technician_id, created_by, updated_at)
      VALUES (?, ?, 'todo', ?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(
      title.trim(),
      description?.trim() || null,
      assigned_technician_id || null,
      created_by || null
    );
    const inserted = db.prepare('SELECT * FROM interventions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(inserted);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/interventions/:id', (req, res) => {
  try {
    const { status, assigned_technician_id } = req.body;
    const id = req.params.id;
    const current = db.prepare('SELECT * FROM interventions WHERE id = ?').get(id);
    if (!current) return res.status(404).json({ error: 'Intervention not found' });

    const updates = [];
    const values = [];
    if (status !== undefined) {
      if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
      updates.push('status = ?');
      values.push(status);
    }
    if (assigned_technician_id !== undefined) {
      updates.push('assigned_technician_id = ?');
      values.push(assigned_technician_id || null);
    }
    if (updates.length === 0) return res.json(current);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE interventions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    const updated = db.prepare('SELECT * FROM interventions WHERE id = ?').get(id);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/interventions/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM interventions WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Intervention not found' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
