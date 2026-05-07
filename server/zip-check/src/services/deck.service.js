import pool from '../config/database.js';
import logger from '../utils/logger.js';
import { NotFoundError, AuthorizationError, DatabaseError } from '../middleware/errorHandler.js';

class DeckService {
  /**
   * Get all decks for a user
   */
  async getAllDecks(userId) {
    try {
      const result = await pool.query(
        `
        SELECT
          d.id,
          d.name,
          d.created_at,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'front_image', c.front_image,
                'back_image', c.back_image
              )
            ) FILTER (WHERE c.id IS NOT NULL), 
            '[]'::json
          ) AS commanders,
          COALESCE(
            (SELECT SUM(dc2.quantity) FROM deck_cards dc2 WHERE dc2.deck_id = d.id),
            0
          ) AS card_count
        FROM decks d
        LEFT JOIN deck_cards dc ON d.id = dc.deck_id AND dc.is_commander = true
        LEFT JOIN cards c ON dc.card_id = c.id
        WHERE d.user_id = $1
        GROUP BY d.id
        ORDER BY LOWER(d.name), d.id
        `,
        [userId]
      );

      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        commanders: row.commanders,
        count: parseInt(row.card_count) || 0
      }));
    } catch (error) {
      logger.error(`Get decks error: ${error.message}`);
      throw new DatabaseError('Failed to fetch decks');
    }
  }

  /**
   * Get a single deck by ID
   */
  async getDeckById(deckId, userId) {
    try {
      const result = await pool.query(
        `
        SELECT 
          d.id AS deck_id, 
          d.name AS deck_name, 
          d.created_at,
          dc.is_commander,
          dc.quantity,
          c.id AS card_id,
          c.name AS card_name,
          c.mana_cost,
          c.cmc,
          c.card_type,
          c.oracle_text,
          c.power,
          c.toughness,
          c.front_image,
          c.back_image,
          c.color_identity,
          c.prices,
          c.keywords,
          c.legalities,
          c.rarity,
          c.edhrec_rank,
          c.types
        FROM decks d
        LEFT JOIN deck_cards dc ON d.id = dc.deck_id
        LEFT JOIN cards c ON dc.card_id = c.id
        WHERE d.id = $1 AND d.user_id = $2
        `,
        [deckId, userId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Deck not found');
      }

      const rows = result.rows;
      const cards = rows
        .filter((r) => r.card_id)
        .map((r) => ({
          id: r.card_id,
          name: r.card_name,
          mana_cost: r.mana_cost,
          type_line: r.card_type,
          oracle_text: r.oracle_text,
          power: r.power,
          toughness: r.toughness,
          front_image: r.front_image,
          back_image: r.back_image,
          count: r.quantity || 1,
          is_commander: r.is_commander,
          color_identity: r.color_identity,
          cmc: r.cmc,
          prices: r.prices,
          keywords: r.keywords,
          legalities: r.legalities,
          rarity: r.rarity,
          edhrec_rank: r.edhrec_rank,
          types: r.types
        }));

      const commanders = cards.filter((c) => c.is_commander);

      return {
        id: rows[0].deck_id,
        name: rows[0].deck_name,
        created_at: rows[0].created_at,
        commanders,
        cards
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Get deck error: ${error.message}`);
      throw new DatabaseError('Failed to fetch deck');
    }
  }

  /**
   * Create a new deck
   */
  async createDeck(userId, deckData) {
    const { name, commander } = deckData;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create deck
      const deckResult = await client.query(
        `INSERT INTO decks (user_id, name) 
         VALUES ($1, $2) 
         RETURNING id, name, created_at`,
        [userId, name]
      );

      const deckId = deckResult.rows[0].id;

      // Convert color_identity to array format if needed
      const colorIdentity = commander.color_identity
        ? (Array.isArray(commander.color_identity)
            ? commander.color_identity
            : commander.color_identity.split(' ').filter(c => c))
        : null;

      // Prepare JSONB fields
      const commanderTypes = commander.types ? JSON.stringify(commander.types) : null;
      const commanderPrices = commander.prices || null;
      const commanderLegalities = commander.legalities || null;
      const commanderKeywords = Array.isArray(commander.keywords)
        ? commander.keywords
        : typeof commander.keywords === 'string'
          ? commander.keywords.split(',').map(k => k.trim()).filter(k => k)
          : null;

      // Derive type_line if not provided
      const typeLine = commander.type_line || null;

      // Derive oracle_text from either oracle_text or text_box
      const oracleText = commander.oracle_text || commander.text_box || null;

      const commanderBackImage = commander.back_image || null;

      // Create or update commander card with full data
      const cardResult = await client.query(
        `
        INSERT INTO cards (
          id, name, mana_cost, cmc, card_type, oracle_text, power, toughness,
          color_identity, prices, keywords, legalities, rarity, edhrec_rank,
          types, front_image, back_image
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16, $17)
        ON CONFLICT (id)
        DO UPDATE SET
          name = EXCLUDED.name,
          mana_cost = EXCLUDED.mana_cost,
          cmc = EXCLUDED.cmc,
          card_type = EXCLUDED.card_type,
          oracle_text = EXCLUDED.oracle_text,
          power = EXCLUDED.power,
          toughness = EXCLUDED.toughness,
          color_identity = EXCLUDED.color_identity,
          prices = EXCLUDED.prices,
          keywords = EXCLUDED.keywords,
          legalities = EXCLUDED.legalities,
          rarity = EXCLUDED.rarity,
          edhrec_rank = EXCLUDED.edhrec_rank,
          types = EXCLUDED.types,
          front_image = EXCLUDED.front_image,
          back_image = EXCLUDED.back_image
        RETURNING id
        `,
        [
          commander.id,
          commander.name,
          commander.mana_cost || null,
          commander.cmc || null,
          typeLine,
          oracleText,
          commander.power || null,
          commander.toughness || null,
          colorIdentity,
          commanderPrices,
          commanderKeywords,
          commanderLegalities,
          commander.rarity || null,
          commander.meta_rank || commander.edhrec_rank || null,
          commanderTypes,
          commander.front_image,
          commanderBackImage,
        ]
      );

      const cardId = cardResult.rows[0].id;

      // Add commander to deck
      await client.query(
        `INSERT INTO deck_cards (deck_id, card_id, quantity, is_commander) 
         VALUES ($1, $2, 1, true)`,
        [deckId, cardId]
      );

      await client.query('COMMIT');

      logger.info(`Deck created: ${deckId} by user ${userId}`);

      return deckResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      
      logger.error(`Create deck error: ${error.message}`);
      throw new DatabaseError('Failed to create deck');
    } finally {
      client.release();
    }
  }

  /**
   * Update a deck
   */
  async updateDeck(deckId, userId, updates) {
    const { ValidationError } = await import('../middleware/errorHandler.js');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const allowedFields = ['name', 'description', 'format', 'is_public'];
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) {
        throw new ValidationError('No valid fields to update');
      }

      values.push(deckId, userId);

      const result = await client.query(
        `UPDATE decks
         SET ${setClauses.join(', ')}
         WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
         RETURNING id, name, description, format, is_public, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new NotFoundError('Deck not found');
      }

      await client.query('COMMIT');

      logger.info(`Deck updated: ${deckId} by user ${userId}`);

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      await client.query('ROLLBACK');
      logger.error(`Update deck error: ${error.message}`);
      throw new DatabaseError('Failed to update deck');
    } finally {
      client.release();
    }
  }

  /**
   * Delete a deck
   */
  async deleteDeck(deckId, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if deck exists and belongs to user
      const result = await client.query(
        `DELETE FROM decks 
         WHERE id = $1 AND user_id = $2 
         RETURNING id, name`,
        [deckId, userId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new NotFoundError('Deck not found');
      }

      await client.query('COMMIT');

      logger.info(`Deck deleted: ${deckId} by user ${userId}`);

      return {
        message: 'Deck deleted successfully',
        deck: result.rows[0]
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      await client.query('ROLLBACK');
      logger.error(`Delete deck error: ${error.message}`);
      throw new DatabaseError('Failed to delete deck');
    } finally {
      client.release();
    }
  }

  /**
   * Verify deck ownership
   */
  async verifyDeckOwnership(deckId, userId) {
    try {
      const result = await pool.query(
        'SELECT id FROM decks WHERE id = $1 AND user_id = $2',
        [deckId, userId]
      );

      if (result.rows.length === 0) {
        throw new AuthorizationError('You do not have access to this deck');
      }

      return true;
    } catch (error) {
      if (error instanceof AuthorizationError) {
        throw error;
      }
      
      logger.error(`Verify ownership error: ${error.message}`);
      throw new DatabaseError('Failed to verify deck ownership');
    }
  }
}

export const deckService = new DeckService();
export default deckService;