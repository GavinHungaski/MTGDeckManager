import pool from "../db.js";

async function resetDB() {
  try {
    await pool.query(`DROP TABLE IF EXISTS deck_cards, cards, decks CASCADE;`);

    await pool.query(`
      CREATE TABLE decks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE cards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        scryfall_id TEXT UNIQUE NOT NULL,
        card_data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE deck_cards (
        deck_id INTEGER REFERENCES decks(id) ON DELETE CASCADE,
        card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
        count INTEGER DEFAULT 1,
        is_commander BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (deck_id, card_id)
      );
    `);

    console.log("✅ Database reset complete");
  } catch (err) {
    console.error("❌ Database error:", err);
  } finally {
    await pool.end();
  }
}

resetDB();
