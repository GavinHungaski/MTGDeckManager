import pool from "../db/db.js";

/**
 * GET /api/decks
 * Only fetch decks for the authenticated user
 */
export const getAllDecks = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
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
      WHERE d.user_id = $1
      GROUP BY d.id
      ORDER BY LOWER(d.name), d.id
    `,
      [userId],
    );

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
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

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
      WHERE d.id = $1 AND d.user_id = $2
    `,
      [id, req.user.id],
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Deck not found" });

    const cards = result.rows
      .filter((r) => r.card_id)
      .map((r) => ({
        id: r.card_id,
        name: r.card_name,
        card_data: r.card_data,
        count: r.count || 1,
        is_commander: r.is_commander,
      }));

    const deck = {
      id: result.rows[0].deck_id,
      name: result.rows[0].deck_name,
      created_at: result.rows[0].created_at,
      commanders: cards.filter((c) => c.is_commander),
      cards,
    };

    res.json(deck);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

/**
 * POST /api/deck
 */
export const createDeck = async (req, res) => {
  let client;
  try {
    const userId = req.user.id;
    const { name, commander } = req.body;

    if (!name || !commander?.name || !commander?.scryfall_id) {
      return res.status(400).json({ error: "Name and commander are required" });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const deckRes = await client.query(
      `INSERT INTO decks (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at`,
      [userId, name],
    );

    const deckId = deckRes.rows[0].id;

    const cardRes = await client.query(
      `INSERT INTO cards (name, scryfall_id, card_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (scryfall_id) DO UPDATE SET card_data = EXCLUDED.card_data
       RETURNING id`,
      [commander.name, commander.scryfall_id, commander],
    );

    const cardId = cardRes.rows[0].id;

    await client.query(
      `INSERT INTO deck_cards (deck_id, card_id, count, is_commander) VALUES ($1, $2, 1, true)`,
      [deckId, cardId],
    );

    await client.query("COMMIT");

    res.status(201).json(deckRes.rows[0]);
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (client) client.release();
  }
};

export const deleteDeck = async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    client = await pool.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `DELETE FROM decks WHERE id=$1 AND user_id=$2 RETURNING id,name`,
      [id, req.user.id],
    );

    if (!result.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Deck not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "Deck deleted", deck: result.rows[0] });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    if (client) client.release();
  }
};
