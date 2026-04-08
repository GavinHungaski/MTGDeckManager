import pool from "../db/db.js";

/**
 * POST /api/decks/:deckId/card
 */
export const addCard = async (req, res) => {
  let client;
  try {
    const { deckId } = req.params;
    const { name, scryfall_id, card_data, is_commander } = req.body;

    if (!name || !scryfall_id) {
      return res.status(400).json({ error: "Missing card data" });
    }

    client = await pool.connect();
    await client.query("BEGIN");

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

    await client.query("COMMIT");

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
};

/**
 * DELETE /api/decks/:deckId/card/:cardId
 */
export const removeCard = async (req, res) => {
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
};

/**
 * PATCH /api/decks/:deckId/card/:cardId/commander
 */
export const toggleCommander = async (req, res) => {
  let client;
  try {
    const { deckId, cardId } = req.params;
    const { is_commander } = req.body;

    client = await pool.connect();

    const result = await client.query(
      `
      UPDATE deck_cards 
      SET is_commander = $1 
      WHERE deck_id = $2 AND card_id = $3 
      RETURNING *
      `,
      [is_commander, deckId, cardId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Card not found in deck" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (client) client.release();
  }
};
