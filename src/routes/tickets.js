import express from "express";
import pool from "../db.js";
import QRCode from "qrcode";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());


router.get("/new", async (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Uplata listića</title>
        <style>
          body { font-family: sans-serif; margin: 40px; background: #f7f7f7; }
          .container { background: white; border-radius: 10px; padding: 30px; max-width: 500px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          input, button { padding: 10px; margin: 5px 0; width: 100%; }
          button { background: #28a745; color: white; border: none; border-radius: 5px; }
          button:hover { background: #1e7e34; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Uplata loto listića</h2>
          <form action="/tickets/new" method="post">
            <label>Broj osobne iskaznice / putovnice:</label>
            <input name="id_number" maxlength="20" required>
            <label>Brojevi (6 do 10 brojeva, odvojeni zarezima):</label>
            <input name="numbers" required placeholder="npr. 3,15,22,27,33,45">
            <button type="submit">Uplati</button>
          </form>
        </div>
      </body>
    </html>
  `);
});


router.post("/new", async (req, res) => {
  try {
    const { id_number, numbers } = req.body;

    const nums = numbers.split(",").map(n => parseInt(n.trim(), 10));
    if (nums.length < 6 || nums.length > 10)
      return res.status(400).send("Broj mora sadržavati između 6 i 10 brojeva.");
    if (new Set(nums).size !== nums.length)
      return res.status(400).send("Brojevi se ne smiju ponavljati.");
    if (nums.some(n => n < 1 || n > 45))
      return res.status(400).send("Svi brojevi moraju biti između 1 i 45.");
    if (!id_number || id_number.length > 20)
      return res.status(400).send("Neispravan broj osobne iskaznice.");

    const roundRes = await pool.query("SELECT * FROM rounds WHERE active = true LIMIT 1");
    if (roundRes.rows.length === 0)
      return res.status(400).send("Nema aktivnog kola.");

    const roundId = roundRes.rows[0].id;
    const result = await pool.query(
      "INSERT INTO tickets (id, id_number, numbers, round_id) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id",
      [id_number, nums, roundId]
    );

    const ticketId = result.rows[0].id;
    const ticketUrl = `${process.env.AUTH0_BASE_URL}/tickets/${ticketId}`;
    const qr = await QRCode.toDataURL(ticketUrl);

    res.setHeader("Content-Type", "text/html");
    res.send(`
      <html><body style="text-align:center; font-family:sans-serif;">
        <h2>Uspješno ste uplatili listić!</h2>
        <p>QR kod za provjeru:</p>
        <img src="${qr}" alt="QR kod">
        <p><a href="/">Povratak na početnu</a></p>
      </body></html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Greška pri spremanju listića.");
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const t = await pool.query("SELECT * FROM tickets WHERE id = $1", [id]);
    if (t.rows.length === 0) return res.status(404).send("Listić nije pronađen.");

    const ticket = t.rows[0];
    const round = await pool.query("SELECT * FROM rounds WHERE id = $1", [ticket.round_id]);
    const r = round.rows[0];

    res.send(`
      <html><body style="font-family:sans-serif; margin: 40px;">
        <h2>Detalji listića</h2>
        <p><strong>ID broj:</strong> ${ticket.id_number}</p>
        <p><strong>Brojevi:</strong> ${ticket.numbers.join(", ")}</p>
        <p><strong>Kolo:</strong> ${ticket.round_id}</p>
        <p><strong>Izvučeni brojevi:</strong> ${r?.drawn_numbers ? r.drawn_numbers.join(", ") : "Još nisu izvučeni"}</p>
        <a href="/">Povratak na početnu</a>
      </body></html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Greška pri dohvaćanju listića.");
  }
});

export default router;
