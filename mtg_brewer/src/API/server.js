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
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

client.connect().catch((err) => {
  console.error("Failed to connect to PostgreSQL:", err);
  process.exit(1);
});

// Get all decks
app.get("/api/decks", async (_, res) => {
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
// Get a specific deck
app.get("/api/decks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      `
      SELECT id, name, commander
      FROM decks
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Deck not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add a new deck
app.post("/api/deck", async (req, res) => {
  try {
    const { name, commander } = req.body;

    if (!name || !commander || !commander.name) {
      return res.status(400).json({ error: "Name and commander are required" });
    }

    // Start a transaction
    await client.query("BEGIN");

    const deckResult = await client.query(
      `INSERT INTO decks (name, commander) VALUES ($1, $2) RETURNING id, name`,
      [name, JSON.stringify(commander)],
    );
    const deckId = deckResult.rows[0].id;

    const cardResult = await client.query(
      `INSERT INTO cards (name, card_data, is_commander)
       VALUES ($1, $2, true)
       ON CONFLICT (name) DO UPDATE SET card_data = EXCLUDED.card_data
       RETURNING id`,
      [commander.name, JSON.stringify(commander)],
    );
    const cardId = cardResult.rows[0].id;

    await client.query(
      `INSERT INTO deck_cards (deck_id, card_id) VALUES ($1, $2)`,
      [deckId, cardId],
    );

    // Commit transaction
    await client.query("COMMIT");

    res.status(201).json(deckResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete a specific deck
app.delete("/api/decks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      "DELETE FROM decks WHERE id = $1 RETURNING id, name",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Deck not found" });
    }

    res.json({ message: "Deck deleted", deck: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
