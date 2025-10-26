import express from 'express';
import pool from '../db.js';
import { verifyM2MToken } from '../auth/m2mMiddleware.js';

const router = express.Router();
// router.use(verifyM2MToken);



// Novo kolo
router.post('/new-round', async (req, res) => {
  try {
    const active = await pool.query('SELECT id FROM rounds WHERE active=true');
    if (active.rowCount > 0)
      await pool.query('UPDATE rounds SET active=false WHERE active=true');

    await pool.query('INSERT INTO rounds (active, started_at) VALUES (true, NOW())');
    res.status(204).end();
  } catch {
    res.status(500).send('Greška kod otvaranja kola.');
  }
});

// Zatvori kolo
router.post('/close', async (req, res) => {
  try {
    const round = await pool.query('SELECT id FROM rounds WHERE active=true ORDER BY started_at DESC LIMIT 1');
    if (round.rowCount === 0) return res.status(204).end();

    await pool.query('UPDATE rounds SET active=false WHERE id=$1', [round.rows[0].id]);
    res.status(204).end();
  } catch {
    res.status(500).send('Greška pri zatvaranju kola.');
  }
});

// Spremi rezultate
router.post('/store-results', async (req, res) => {
  try {
    const { numbers } = req.body;
    const r = await pool.query('SELECT id, active, drawn_numbers FROM rounds ORDER BY started_at DESC LIMIT 1');
    if (r.rowCount === 0 || r.rows[0].active || r.rows[0].drawn_numbers)
      return res.status(400).send('Neispravan poziv.');

    await pool.query('UPDATE rounds SET drawn_numbers=$1 WHERE id=$2', [numbers, r.rows[0].id]);
    res.status(204).end();
  } catch {
    res.status(500).send('Greška kod spremanja rezultata.');
  }
});

export default router;
