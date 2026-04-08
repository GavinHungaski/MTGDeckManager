import pool from "../db/db.js";

/**
 * GET /api/decks
 */
export const getAllDecks = async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.name,
        d.created_at,
        COALESCE(
          JSON_AGG(c.card_data) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) AS commanders,
        (SELECT SUM(count) FROM deck_cards WHERE deck_id = d.id) AS card_count
      FROM decks d
      LEFT JOIN deck_cards dc ON d.id = dc.deck_id AND dc.is_commander = true
      LEFT JOIN cards c ON dc.card_id = c.id
      GROUP BY d.id
      ORDER BY LOWER(d.name), d.id
    `);

    res.json(
      result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        commanders: row.commanders,
        count: row.card_count || 0,
      })),
    );
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

/**
 * GET /api/decks/:id
 */
export const getDeckById = async (req, res) => {
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

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Deck not found" });
    }

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

    const commanders = cards.filter((c) => c.is_commander);

    const deck = {
      id: rows[0].deck_id,
      name: rows[0].deck_name,
      created_at: rows[0].created_at,
      commanders,
      cards,
    };

    res.json(deck);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

/**
 * POST /api/deck
 */
export const createDeck = async (req, res) => {
  let client;
  try {
    const { name, commander } = req.body;

    if (!name || !commander?.name || !commander?.scryfall_id) {
      return res.status(400).json({ error: "Name and commander are required" });
    }

    client = await pool.connect();
    await client.query("BEGIN");

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
      `
      INSERT INTO deck_cards (deck_id, card_id, count, is_commander)
      VALUES ($1, $2, 1, true)
      `,
      [deckId, cardId],
    );

    await client.query("COMMIT");

    res.status(201).json(deckResult.rows[0]);
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (client) client.release();
  }
};

/**
 * DELETE /api/decks/:id
 */
export const deleteDeck = async (req, res) => {
  let client;
  try {
    const { id } = req.params;

    client = await pool.connect();
    await client.query("BEGIN");

    await client.query(`DELETE FROM deck_cards WHERE deck_id = $1`, [id]);

    const result = await client.query(
      `DELETE FROM decks WHERE id = $1 RETURNING id, name`,
      [id],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Deck not found" });
    }

    await client.query("COMMIT");

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
};
