import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import pool from '../db.js';
import { validateTicket } from '../utils/validation.js';

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get('/uplata', (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.redirect('/login');
  res.send(`
    <h1>Uplata listića</h1>
    <form method="POST" action="/tickets">
      <label>Broj osobne iskaznice: <input name="id_number" required maxlength="20"></label><br>
      <label>Brojevi (6-10, odvojeni zarezom): <input name="numbers" required></label><br>
      <button type="submit">Uplati</button>
    </form>
  `);
});

router.post('/tickets', async (req, res) => {
  try {
    const { id_number, numbers } = req.body;
    const nums = numbers.split(',').map(n => parseInt(n.trim(), 10));
    const errMsg = validateTicket(id_number, nums);
    if (errMsg) return res.status(400).send(errMsg);

    const roundRes = await pool.query('SELECT id FROM rounds WHERE active=true ORDER BY started_at DESC LIMIT 1');
    if (roundRes.rowCount === 0) return res.status(400).send('Nema aktivnog kola.');

    const id = uuidv4();
    await pool.query(
      'INSERT INTO tickets (id, id_number, numbers, round_id) VALUES ($1, $2, $3, $4)',
      [id, id_number, nums, roundRes.rows[0].id]
    );

    const url = `${process.env.AUTH0_BASE_URL}/ticket/${id}`;
    const qr = await QRCode.toDataURL(url);

    res.setHeader('Content-Type', 'text/html');
    res.send(`<h1>Uspješna uplata!</h1><p>Tvoj QR kod:</p><img src="${qr}"><br><a href="/">Povratak</a>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Greška pri uplati.');
  }
});

export default router;
