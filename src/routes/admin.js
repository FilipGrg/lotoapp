import express from "express";
import pool from "../db.js";
import { verifyM2MToken } from "../auth/m2mMiddleware.js";

const router = express.Router();

router.use(express.json());
router.use(verifyM2MToken);

// POST /new-round
router.post("/new-round", async (req, res) => {
  await pool.query("UPDATE rounds SET active = false WHERE active = true");
  await pool.query("INSERT INTO rounds (active) VALUES (true)");
  res.sendStatus(204);
});

// POST /close
router.post("/close", async (req, res) => {
  const r = await pool.query("SELECT * FROM rounds WHERE active = true LIMIT 1");
  if (r.rows.length === 0) return res.sendStatus(204);

  await pool.query("UPDATE rounds SET active = false WHERE id = $1", [r.rows[0].id]);
  res.sendStatus(204);
});

// POST /store-results
router.post("/store-results", async (req, res) => {
  const { numbers } = req.body;
  const r = await pool.query("SELECT * FROM rounds ORDER BY id DESC LIMIT 1");

  if (r.rows.length === 0 || r.rows[0].active || r.rows[0].drawn_numbers)
    return res.status(400).send("Kolo nije spremno za pohranu rezultata.");

  await pool.query("UPDATE rounds SET drawn_numbers = $1 WHERE id = $2", [numbers, r.rows[0].id]);
  res.sendStatus(204);
});

export default router;
