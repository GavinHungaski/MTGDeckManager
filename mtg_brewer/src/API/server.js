import express from "express";
import cors from "cors";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(express.json());

app.use(cors());

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
  console.error("Failed to connect to PostgreSQL:", err);
  process.exit(1);
});

app.get("/api/decks", async (req, res) => {
  try {
    const result = await client.query(`
      SELECT id, name
      FROM decks
      ORDER BY id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/deck", async (req, res) => {
  try {
    console.log("POST /api/deck body:", req.body);
    const { name, commander } = req.body;

    if (!name || !commander) {
      return res.status(400).json({ error: "Name and commander are required" });
    }

    const result = await client.query(
      `INSERT INTO decks (name, commander) VALUES ($1, $2) RETURNING id, name`,
      [name, JSON.stringify(commander)]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
