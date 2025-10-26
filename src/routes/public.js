import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const roundRes = await pool.query("SELECT * FROM rounds ORDER BY id DESC LIMIT 1");
    const round = roundRes.rows[0];

    let ticketsCount = 0;
    if (round) {
      const ticketsRes = await pool.query("SELECT COUNT(*) FROM tickets WHERE round_id = $1", [round.id]);
      ticketsCount = ticketsRes.rows[0].count;
    }

    const user = req.oidc?.user;

    let html = `
      <html>
      <head>
        <title>Loto aplikacija</title>
        <style>
          body { font-family: sans-serif; margin: 40px; background: #f7f7f7; }
          .container { background: white; border-radius: 10px; padding: 30px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          button, a.button {
            display: inline-block; padding: 10px 20px; margin-top: 10px;
            background: #007bff; color: white; border: none; border-radius: 5px;
            text-decoration: none; cursor: pointer;
          }
          button:hover, a.button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
      <div class="container">
        <h1>💰 Loto 6/45</h1>
    `;

    if (user) {
      html += `<p>Prijavljeni ste kao <strong>${user.name || user.email}</strong> (<a href="/logout">Odjava</a>)</p>`;
    } else {
      html += `<a class="button" href="/login">Prijava</a>`;
    }

    if (!round) {
      html += `<p>Nema aktivnih kola.</p>`;
    } else {
      html += `<p><strong>Broj uplaćenih listića:</strong> ${ticketsCount}</p>`;

      if (round.active) {
        html += `<p>Uplate su <strong>aktivne</strong>.</p>`;
        html += `<a class="button" href="/tickets/new">Uplati novi listić</a>`;
      } else {
        html += `<p>Uplate su <strong>zatvorene</strong>.</p>`;
        if (round.drawn_numbers)
          html += `<p>Izvučeni brojevi: ${round.drawn_numbers.join(", ")}</p>`;
      }
    }

    html += `
      </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Greška pri dohvaćanju podataka.");
  }
});

export default router;
