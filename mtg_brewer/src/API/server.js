import express from "express";
import cors from "cors";

import pool from "./db.js";

const PORT = 4000;
const app = express();

app.use(express.json());
app.use(cors());

// Quick check to see if the db is working
pool.connect().catch((err) => {
  console.error("Failed to connect to PostgreSQL:", err);
  process.exit(1);
});

// Get all decks
app.get("/api/decks", async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.name,
        d.created_at,
        c.card_data AS commander,
        (SELECT SUM(count) FROM deck_cards WHERE deck_id = d.id) AS card_count
      FROM decks d
        LEFT JOIN deck_cards dc ON d.id = dc.deck_id AND dc.is_commander = true
        LEFT JOIN cards c ON dc.card_id = c.id
      ORDER BY LOWER(d.name), d.id
    `);
    res.json(
      result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        commander: row.commander ?? null,
        count: row.card_count,
      })),
    );
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
        d.created_at,

        dc.is_commander,
        dc.count,

        c.id AS card_id, 
        c.name AS card_name, 
        c.card_data

      FROM decks d
        LEFT JOIN deck_cards dc ON d.id = dc.deck_id
        LEFT JOIN cards c ON dc.card_id = c.id
      WHERE d.id = $1
      `,
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Deck not found" });

    const rows = result.rows;
    const cards = rows
      .filter((r) => r.card_id)
      .map((r) => ({
        id: r.card_id,
        name: r.card_name,
        card_data: r.card_data,
        count: r.count || 1,
        is_commander: r.is_commander,
      }));
    const commander = rows.find((r) => r.is_commander);
    const deck = {
      id: rows[0].deck_id,
      name: rows[0].deck_name,
      created_at: rows[0].created_at,

      commander: commander
        ? {
            id: commander.card_id,
            name: commander.card_name,
            card_data: commander.card_data,
            count: commander.count || 1,
            is_commander: true,
          }
        : null,

      cards,
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
    if (!name || !commander?.name || !commander?.scryfall_id) {
      console.log(name);
      console.log(commander.name);
      console.log(commander.scryfall_id);
      return res.status(400).json({ error: "Name and commander are required" });
    }
    client = await pool.connect();

    await client.query("BEGIN"); // BEGIN TRANSACTION
    const deckResult = await client.query(
      `
      INSERT INTO decks (name)
      VALUES ($1)
      RETURNING id, name, created_at
      `,
      [name],
    );
    const deckId = deckResult.rows[0].id;
    const cardResult = await client.query(
      `
      INSERT INTO cards (name, scryfall_id, card_data)
      VALUES ($1, $2, $3)
      ON CONFLICT (scryfall_id)
      DO UPDATE SET card_data = EXCLUDED.card_data
      RETURNING id
      `,
      [commander.name, commander.scryfall_id, commander],
    );
    const cardId = cardResult.rows[0].id;
    await client.query(
      `INSERT INTO deck_cards (deck_id, card_id, count, is_commander)
      VALUES ($1, $2, 1, true)`,
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
    await client.query(`DELETE FROM deck_cards WHERE deck_id = $1`, [id]);
    const result = await client.query(
      `DELETE FROM decks WHERE id = $1 RETURNING id, name`,
      [id],
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Deck not found" });
    }
    await client.query("COMMIT"); // COMMIT TRANSACTION

    res.json({
      message: "Deck deleted successfully",
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
    const { name, scryfall_id, card_data, is_commander } = req.body;
    if (!name || !scryfall_id) {
      return res.status(400).json({ error: "Missing card data" });
    }
    client = await pool.connect();

    await client.query("BEGIN"); // BEGIN TRANSACTION
    const cardResult = await client.query(
      `
      INSERT INTO cards (name, scryfall_id, card_data)
      VALUES ($1, $2, $3)
      ON CONFLICT (scryfall_id)
      DO UPDATE SET card_data = EXCLUDED.card_data
      RETURNING id
      `,
      [name, scryfall_id, card_data],
    );
    const cardId = cardResult.rows[0].id;
    const deckCardResult = await client.query(
      `
      INSERT INTO deck_cards (deck_id, card_id, count, is_commander)
      VALUES ($1, $2, 1, $3)
      ON CONFLICT (deck_id, card_id)
      DO UPDATE SET count = deck_cards.count + 1
      RETURNING count
      `,
      [deckId, cardId, !!is_commander],
    );
    const count = deckCardResult.rows[0].count;
    await client.query("COMMIT"); // COMMIT TRANSACTION

    res.status(201).json({
      id: cardId,
      name,
      scryfall_id,
      card_data,
      count,
    });
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
    const { deckId, cardId } = req.params;
    const result = await pool.query(
      `
      UPDATE deck_cards
      SET count = count - 1
      WHERE deck_id = $1 AND card_id = $2
      RETURNING count
      `,
      [deckId, cardId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Card not found in deck" });
    }
    const newCount = result.rows[0].count;
    if (newCount <= 0) {
      await pool.query(
        `
        DELETE FROM deck_cards
        WHERE deck_id = $1 AND card_id = $2
        `,
        [deckId, cardId],
      );
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
