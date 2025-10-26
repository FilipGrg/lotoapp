import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// --- potpuno onemogući SSL za lokalnu bazu ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

export default pool;
