import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

// Quick check to see if the db is working
pool.connect().catch((err) => {
  console.error("Failed to connect to PostgreSQL:", err);
  process.exit(1);
});

// Get all decks
app.get("/api/decks", async (_, res) => {
  try {
    const result = await pool.query(`
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
    const result = await pool.query(
      `
      SELECT 
        d.id AS deck_id, 
        d.name AS deck_name, 
        d.commander,
        c.id AS card_id, 
        c.name AS card_name, 
        c.card_data,
        c.is_commander AS is_commander
      FROM decks d
      LEFT JOIN deck_cards dc ON d.id = dc.deck_id
      LEFT JOIN cards c ON dc.card_id = c.id
      WHERE d.id = $1
      `,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Deck not found" });
    }
    const deck = {
      id: result.rows[0].deck_id,
      name: result.rows[0].deck_name,
      commander: result.rows[0].commander,
      cards: result.rows[0].card_id
        ? result.rows.map((row) => ({
            id: row.card_id,
            name: row.card_name,
            card_data: row.card_data,
            is_commander: row.is_commander,
          }))
        : [],
    };
    res.json(deck);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add a new deck
app.post("/api/deck", async (req, res) => {
  let client;
  try {
    const { name, commander } = req.body;
    if (!name || !commander || !commander.name) {
      return res.status(400).json({ error: "Name and commander are required" });
    }
    client = await pool.connect();
    await client.query("BEGIN"); // BEGIN TRANSACTION
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
    await client.query("COMMIT"); // COMMIT TRANSACTION
    res.status(201).json(deckResult.rows[0]);
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (client) client.release();
  }
});

// Delete a specific deck
app.delete("/api/decks/:id", async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    client = await pool.connect();
    await client.query("BEGIN"); // BEGIN TRANSACTION
    const deleteCardsQuery = `
      DELETE FROM cards WHERE id IN (
        SELECT card_id FROM deck_cards WHERE deck_id = $1
      )`;
    await client.query(deleteCardsQuery, [id]);
    const result = await client.query(
      "DELETE FROM decks WHERE id = $1 RETURNING id, name",
      [id],
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Deck not found" });
    }
    await client.query("COMMIT"); // COMMIT TRANSACTION
    res.json({
      message: "Deck and its specific cards deleted",
      deck: result.rows[0],
    });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (client) client.release();
  }
});

// Add a card to a deck
app.post("/api/decks/:deckId/card", async (req, res) => {
  let client;
  try {
    const { deckId } = req.params;
    const { name, card_data, is_commander } = req.body;
    client = await pool.connect();
    await client.query("BEGIN"); // BEGIN TRANSACTION
    const cardResult = await client.query(
      `INSERT INTO cards (name, card_data, is_commander)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET card_data = EXCLUDED.card_data
       RETURNING id`,
      [name, JSON.stringify(card_data), !!is_commander],
    );
    const cardId = cardResult.rows[0].id;
    await client.query(
      `INSERT INTO deck_cards (deck_id, card_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [deckId, cardId],
    );
    await client.query("COMMIT"); // COMMIT TRANSACTION
    res.status(201).json({ id: cardId, name, card_data });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (client) client.release();
  }
});

// Delete a specific card
app.delete("/api/decks/:deckId/card/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;
    const result = await pool.query(
      `DELETE FROM cards WHERE id = $1 RETURNING id`,
      [cardId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
