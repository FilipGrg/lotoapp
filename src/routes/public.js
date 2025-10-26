import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const user = req.oidc?.isAuthenticated() ? req.oidc.user : null;
    const r = await pool.query('SELECT * FROM rounds ORDER BY started_at DESC LIMIT 1');
    if (r.rowCount === 0) {
      return res.send(`
        <h1>Loto aplikacija</h1>
        <p>Nema aktivnih kola.</p>
        ${user ? `<p>Prijavljeni ste kao ${user.email}</p>` : '<a href="/login">Prijava</a>'}
      `);
    }

    const round = r.rows[0];
    const count = await pool.query('SELECT COUNT(*) FROM tickets WHERE round_id=$1', [round.id]);
    const broj = count.rows[0].count;

    res.send(`
      <h1>Loto aplikacija</h1>
      ${user ? `<p>Prijavljeni ste kao ${user.email} (<a href="/logout">Odjava</a>)</p>` : '<a href="/login">Prijava</a>'}
      <p>Uplaćeni listići: <b>${broj}</b></p>
      ${round.drawn_numbers ? `<p>Izvučeni brojevi: ${round.drawn_numbers.join(', ')}</p>` : '<p>Izvlačenje još nije obavljeno.</p>'}
      ${round.active && user ? `<a href="/uplata">Uplati listić</a>` : ''}
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Greška pri dohvaćanju podataka.');
  }
});

router.get('/ticket/:uuid', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, r.drawn_numbers 
      FROM tickets t 
      JOIN rounds r ON t.round_id = r.id 
      WHERE t.id=$1
    `, [req.params.uuid]);

    if (result.rowCount === 0)
      return res.status(404).send('<h1>Listić nije pronađen.</h1>');

    const t = result.rows[0];
    res.send(`
      <h1>Podaci o listiću</h1>
      <p><b>ID listića:</b> ${t.id}</p>
      <p><b>Osobna iskaznica:</b> ${t.id_number}</p>
      <p><b>Odabrani brojevi:</b> ${t.numbers.join(', ')}</p>
      ${t.drawn_numbers ? `<p><b>Izvučeni brojevi:</b> ${t.drawn_numbers.join(', ')}</p>` : '<p>Još nije izvučeno.</p>'}
    `);
  } catch (err) {
    res.status(500).send('Greška pri dohvaćanju listića.');
  }
});

export default router;
