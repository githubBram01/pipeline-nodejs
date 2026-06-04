const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

router.get('/', (req, res) => {
  const db = getDb();
  res.json(
    db.prepare(`
      SELECT e.*, v.make, v.model, v.year
      FROM evaluations e
      JOIN vehicles v ON e.vehicle_id = v.id
      ORDER BY e.created_at DESC
    `).all()
  );
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const evaluation = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(req.params.id);
  if (!evaluation) return res.status(404).json({ error: 'Evaluation not found' });

  const { status, notes, score } = req.body;
  const validStatuses = ['pending', 'approved', 'rejected'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.prepare('UPDATE evaluations SET status=?, notes=?, score=? WHERE id=?').run(
    status ?? evaluation.status,
    notes ?? evaluation.notes,
    score !== undefined ? Number(score) : evaluation.score,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM evaluations WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM evaluations WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Evaluation not found' });
  res.status(204).send();
});

module.exports = router;
