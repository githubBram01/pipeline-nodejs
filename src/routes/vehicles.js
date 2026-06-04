const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

router.get('/', (req, res) => {
  const db = getDb();
  const vehicles = db.prepare(`
    SELECT v.*,
           COUNT(e.id) AS evaluation_count,
           AVG(e.score) AS avg_score
    FROM vehicles v
    LEFT JOIN evaluations e ON v.id = e.vehicle_id
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `).all();
  res.json(vehicles);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const vehicle = db.prepare(`
    SELECT v.*,
           COUNT(e.id) AS evaluation_count,
           AVG(e.score) AS avg_score
    FROM vehicles v
    LEFT JOIN evaluations e ON v.id = e.vehicle_id
    WHERE v.id = ?
    GROUP BY v.id
  `).get(req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  res.json(vehicle);
});

router.post('/', (req, res) => {
  const { make, model, year, vin, mileage, condition } = req.body;
  if (!make || !model || !year) {
    return res.status(400).json({ error: 'make, model, and year are required' });
  }
  const db = getDb();
  try {
    const result = db.prepare(
      'INSERT INTO vehicles (make, model, year, vin, mileage, condition) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(make, model, year, vin || null, mileage || 0, condition || 'good');
    res.status(201).json(db.prepare('SELECT * FROM vehicles WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'VIN already exists' });
    }
    throw err;
  }
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Vehicle not found' });
  const { make, model, year, vin, mileage, condition } = req.body;
  try {
    db.prepare(
      'UPDATE vehicles SET make=?, model=?, year=?, vin=?, mileage=?, condition=? WHERE id=?'
    ).run(
      make ?? existing.make,
      model ?? existing.model,
      year ?? existing.year,
      vin ?? existing.vin,
      mileage ?? existing.mileage,
      condition ?? existing.condition,
      req.params.id
    );
    res.json(db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id));
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'VIN already exists' });
    }
    throw err;
  }
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
  res.status(204).send();
});

// Nested evaluations routes
router.get('/:vehicleId/evaluations', (req, res) => {
  const db = getDb();
  const { vehicleId } = req.params;
  if (!db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId)) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  res.json(
    db.prepare('SELECT * FROM evaluations WHERE vehicle_id = ? ORDER BY created_at DESC').all(vehicleId)
  );
});

router.post('/:vehicleId/evaluations', (req, res) => {
  const db = getDb();
  const { vehicleId } = req.params;
  if (!db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId)) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  const { evaluator_name, score, notes } = req.body;
  if (!evaluator_name || score === undefined || score === null) {
    return res.status(400).json({ error: 'evaluator_name and score are required' });
  }
  const numScore = Number(score);
  if (numScore < 1 || numScore > 10) {
    return res.status(400).json({ error: 'score must be between 1 and 10' });
  }
  const result = db.prepare(
    'INSERT INTO evaluations (vehicle_id, evaluator_name, score, notes) VALUES (?, ?, ?, ?)'
  ).run(vehicleId, evaluator_name, numScore, notes || null);
  res.status(201).json(db.prepare('SELECT * FROM evaluations WHERE id = ?').get(result.lastInsertRowid));
});

module.exports = router;
