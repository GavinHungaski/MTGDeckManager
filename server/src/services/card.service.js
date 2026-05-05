import pool from '../config/database.js';
import logger from '../utils/logger.js';
import { NotFoundError, AuthorizationError, DatabaseError, ValidationError } from '../middleware/errorHandler.js';
import { deckService } from './deck.service.js';

class CardService {
  /**
   * Add a card to a deck
   */
  async addCardToDeck(deckId, cardData, userId) {
    const client = await pool.connect();

    try {
      // Verify deck ownership
      await deckService.verifyDeckOwnership(deckId, userId);

      await client.query('BEGIN');

      // Check if card exists, create if not
      let cardResult = await client.query(
        `SELECT id FROM cards WHERE id = $1`,
        [cardData.id]
      );

      let cardId;
      if (cardResult.rows.length === 0) {
        // Validate card data
        if (!cardData.id || !cardData.name) {
          throw new ValidationError('Card must have an id and name');
        }
        
        // Create new card with all relevant fields
        const imageUrisJson = cardData.image_uris ? JSON.stringify(cardData.image_uris) : null;
        const pricesJson = cardData.prices ? JSON.stringify(cardData.prices) : null;
        const legalitiesJson = cardData.legalities ? JSON.stringify(cardData.legalities) : null;
        
        // Convert arrays to PostgreSQL array format
        const colorIdentityArray = cardData.color_identity 
          ? (Array.isArray(cardData.color_identity) 
              ? cardData.color_identity 
              : cardData.color_identity.split(' ').filter(c => c))
          : null;
        const keywordsArray = cardData.keywords 
          ? (Array.isArray(cardData.keywords) 
              ? cardData.keywords 
              : cardData.keywords.split(',').map(k => k.trim()).filter(k => k))
          : null;
        
        cardResult = await client.query(
          `INSERT INTO cards (
            id, name, mana_cost, cmc, card_type, oracle_text, power, toughness, 
            image_uris, color_identity, prices, keywords, legalities, rarity, edhrec_rank, types, back_image
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           RETURNING id`,
          [
            cardData.id,
            cardData.name,
            cardData.mana_cost || null,
            cardData.cmc || null,
            cardData.type_line || null,
            cardData.oracle_text || null,
            cardData.power || null,
            cardData.toughness || null,
            imageUrisJson,
            colorIdentityArray,
            pricesJson,
            keywordsArray,
            legalitiesJson,
            cardData.rarity || null,
            cardData.meta_rank || cardData.edhrec_rank || null,
            cardData.types,
            cardData.back_image
          ]
        );
        cardId = cardResult.rows[0].id;
      } else {
        cardId = cardResult.rows[0].id;
        
        // Update card data with all fields
        const imageUrisJson = cardData.image_uris ? JSON.stringify(cardData.image_uris) : null;
        const pricesJson = cardData.prices ? JSON.stringify(cardData.prices) : null;
        const legalitiesJson = cardData.legalities ? JSON.stringify(cardData.legalities) : null;
        
        // Convert arrays to PostgreSQL array format
        const colorIdentityArray = cardData.color_identity 
          ? (Array.isArray(cardData.color_identity) 
              ? cardData.color_identity 
              : cardData.color_identity.split(' ').filter(c => c))
          : null;
        const keywordsArray = cardData.keywords 
          ? (Array.isArray(cardData.keywords) 
              ? cardData.keywords 
              : cardData.keywords.split(',').map(k => k.trim()).filter(k => k))
          : null;
        
        const typesJson = cardData.types ? JSON.stringify(cardData.types) : null;
        const backImage = cardData.back_image || null;

        await client.query(
          `UPDATE cards SET 
            name = $1,
            mana_cost = $2,
            cmc = $3,
            card_type = $4,
            oracle_text = $5,
            power = $6,
            toughness = $7,
            image_uris = $8,
            color_identity = $9,
            prices = $10,
            keywords = $11,
            legalities = $12,
            rarity = $13,
            edhrec_rank = $14,
            types = $15,
            back_image = $16
           WHERE id = $17`,
          [
            cardData.name,
            cardData.mana_cost || null,
            cardData.cmc || null,
            cardData.type_line || null,
            cardData.oracle_text || null,
            cardData.power || null,
            cardData.toughness || null,
            imageUrisJson,
            colorIdentityArray,
            pricesJson,
            keywordsArray,
            legalitiesJson,
            cardData.rarity || null,
            cardData.meta_rank || cardData.edhrec_rank || null,
            typesJson,
            backImage,
            cardId
          ]
        );
      }

      // Check if card is already in deck
      const existingCard = await client.query(
        `SELECT quantity FROM deck_cards WHERE deck_id = $1 AND card_id = $2`,
        [deckId, cardId]
      );

      if (existingCard.rows.length > 0) {
        // Update quantity
        const newQuantity = existingCard.rows[0].quantity + 1;
        await client.query(
          `UPDATE deck_cards SET quantity = $1 WHERE deck_id = $2 AND card_id = $3`,
          [newQuantity, deckId, cardId]
        );
      } else {
        // Add new card to deck
        await client.query(
          `INSERT INTO deck_cards (deck_id, card_id, quantity, is_commander)
           VALUES ($1, $2, 1, false)`,
          [deckId, cardId]
        );
      }

      await client.query('COMMIT');

      logger.info(`Card ${cardData.name} added to deck ${deckId}`);

      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (error instanceof NotFoundError || error instanceof AuthorizationError || error instanceof ValidationError) {
        throw error;
      }
      
      logger.error(`Add card error: ${error.message}`, { 
        stack: error.stack,
        errorCode: error.code,
        errorDetail: error.detail,
        cardData,
        deckId,
        userId 
      });
      console.error('Full error object:', error);
      throw new DatabaseError(`Failed to add card to deck: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Add multiple cards to a deck in batch
   */
  async addCardsToDeckBatch(deckId, cardsData, userId) {
    const client = await pool.connect();

    try {
      // Verify deck ownership
      await deckService.verifyDeckOwnership(deckId, userId);

      if (!Array.isArray(cardsData) || cardsData.length === 0) {
        throw new ValidationError('Cards data must be a non-empty array');
      }

      await client.query('BEGIN');

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const cardData of cardsData) {
        try {
          // Validate card data
          if (!cardData.id || !cardData.name) {
            results.failed++;
            results.errors.push({ card: cardData.name || 'Unknown', error: 'Missing id or name' });
            continue;
          }

          // Check if card exists, create if not
          let cardResult = await client.query(
            `SELECT id FROM cards WHERE id = $1`,
            [cardData.id]
          );

          let cardId;
          if (cardResult.rows.length === 0) {
            // Create new card with all relevant fields
            const imageUrisJson = cardData.image_uris ? JSON.stringify(cardData.image_uris) : null;
            const pricesJson = cardData.prices ? JSON.stringify(cardData.prices) : null;
            const legalitiesJson = cardData.legalities ? JSON.stringify(cardData.legalities) : null;
            
            // Convert arrays to PostgreSQL array format
            const colorIdentityArray = cardData.color_identity 
              ? (Array.isArray(cardData.color_identity) 
                  ? cardData.color_identity 
                  : cardData.color_identity.split(' ').filter(c => c))
              : null;
            const keywordsArray = cardData.keywords 
              ? (Array.isArray(cardData.keywords) 
                  ? cardData.keywords 
                  : cardData.keywords.split(',').map(k => k.trim()).filter(k => k))
              : null;
            
            const typesJsonInsert = cardData.types ? JSON.stringify(cardData.types) : null;
            const backImageInsert = cardData.back_image || null;

            cardResult = await client.query(
              `INSERT INTO cards (
                id, name, mana_cost, cmc, card_type, oracle_text, power, toughness, 
                image_uris, color_identity, prices, keywords, legalities, rarity, edhrec_rank, types, back_image
              )
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
               RETURNING id`,
              [
                cardData.id,
                cardData.name,
                cardData.mana_cost || null,
                cardData.cmc || null,
                cardData.type_line || null,
                cardData.oracle_text || null,
                cardData.power || null,
                cardData.toughness || null,
                imageUrisJson,
                colorIdentityArray,
                pricesJson,
                keywordsArray,
                legalitiesJson,
                cardData.rarity || null,
                cardData.meta_rank || cardData.edhrec_rank || null,
                typesJsonInsert,
                backImageInsert
              ]
            );
            cardId = cardResult.rows[0].id;
          } else {
            cardId = cardResult.rows[0].id;
            
            // Update card data with all fields
            const imageUrisJson = cardData.image_uris ? JSON.stringify(cardData.image_uris) : null;
            const pricesJson = cardData.prices ? JSON.stringify(cardData.prices) : null;
            const legalitiesJson = cardData.legalities ? JSON.stringify(cardData.legalities) : null;
            
            // Convert arrays to PostgreSQL array format
            const colorIdentityArray = cardData.color_identity 
              ? (Array.isArray(cardData.color_identity) 
                  ? cardData.color_identity 
                  : cardData.color_identity.split(' ').filter(c => c))
              : null;
            const keywordsArray = cardData.keywords 
              ? (Array.isArray(cardData.keywords) 
                  ? cardData.keywords 
                  : cardData.keywords.split(',').map(k => k.trim()).filter(k => k))
              : null;
            
            const typesJsonUpdate = cardData.types ? JSON.stringify(cardData.types) : null;
            const backImageUpdate = cardData.back_image || null;

            await client.query(
              `UPDATE cards SET 
                name = $1,
                mana_cost = $2,
                cmc = $3,
                card_type = $4,
                oracle_text = $5,
                power = $6,
                toughness = $7,
                image_uris = $8,
                color_identity = $9,
                prices = $10,
                keywords = $11,
                legalities = $12,
                rarity = $13,
                edhrec_rank = $14,
                types = $15,
                back_image = $16
               WHERE id = $17`,
              [
                cardData.name,
                cardData.mana_cost || null,
                cardData.cmc || null,
                cardData.type_line || null,
                cardData.oracle_text || null,
                cardData.power || null,
                cardData.toughness || null,
                imageUrisJson,
                colorIdentityArray,
                pricesJson,
                keywordsArray,
                legalitiesJson,
                cardData.rarity || null,
                cardData.meta_rank || cardData.edhrec_rank || null,
                typesJsonUpdate,
                backImageUpdate,
                cardId
              ]
            );
          }

          // Check if card is already in deck
          const existingCard = await client.query(
            `SELECT quantity FROM deck_cards WHERE deck_id = $1 AND card_id = $2`,
            [deckId, cardId]
          );

          if (existingCard.rows.length > 0) {
            // Update quantity
            const newQuantity = existingCard.rows[0].quantity + 1;
            await client.query(
              `UPDATE deck_cards SET quantity = $1 WHERE deck_id = $2 AND card_id = $3`,
              [newQuantity, deckId, cardId]
            );
          } else {
            // Add new card to deck
            await client.query(
              `INSERT INTO deck_cards (deck_id, card_id, quantity, is_commander)
               VALUES ($1, $2, 1, false)`,
              [deckId, cardId]
            );
          }

          results.success++;
        } catch (cardError) {
          results.failed++;
          results.errors.push({ 
            card: cardData.name || 'Unknown', 
            error: cardError.message 
          });
          logger.error(`Error adding card ${cardData.name} in batch: ${cardError.message}`);
        }
      }

      await client.query('COMMIT');

      logger.info(`Batch add to deck ${deckId}: ${results.success} succeeded, ${results.failed} failed`);

      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (error instanceof NotFoundError || error instanceof AuthorizationError || error instanceof ValidationError) {
        throw error;
      }
      
      logger.error(`Batch add cards error: ${error.message}`);
      throw new DatabaseError(`Failed to add cards to deck: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Remove a card from a deck
   */
  async removeCardFromDeck(deckId, cardId, userId) {
    const client = await pool.connect();

    try {
      // Verify deck ownership
      await deckService.verifyDeckOwnership(deckId, userId);

      await client.query('BEGIN');

      // Get card quantity
      const result = await client.query(
        `SELECT quantity FROM deck_cards 
         WHERE deck_id = $1 AND card_id = $2`,
        [deckId, cardId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new NotFoundError('Card not found in deck');
      }

      const quantity = result.rows[0].quantity;

      if (quantity > 1) {
        // Decrease quantity
        await client.query(
          `UPDATE deck_cards SET quantity = quantity - 1 
           WHERE deck_id = $1 AND card_id = $2`,
          [deckId, cardId]
        );
      } else {
        // Remove card from deck
        await client.query(
          `DELETE FROM deck_cards 
           WHERE deck_id = $1 AND card_id = $2`,
          [deckId, cardId]
        );
      }

      await client.query('COMMIT');

      logger.info(`Card ${cardId} removed from deck ${deckId}`);

      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      
      logger.error(`Remove card error: ${error.message}`);
      throw new DatabaseError('Failed to remove card from deck');
    } finally {
      client.release();
    }
  }

  /**
   * Toggle commander status for a card
   */
  async toggleCommander(deckId, cardId, userId) {
    const client = await pool.connect();

    try {
      // Verify deck ownership
      await deckService.verifyDeckOwnership(deckId, userId);

      await client.query('BEGIN');

      // Check if card exists in deck
      const cardResult = await client.query(
        `SELECT is_commander FROM deck_cards 
         WHERE deck_id = $1 AND card_id = $2`,
        [deckId, cardId]
      );

      if (cardResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new NotFoundError('Card not found in deck');
      }

      const isCommander = cardResult.rows[0].is_commander;

      // Toggle commander status
      await client.query(
        `UPDATE deck_cards SET is_commander = $1 
         WHERE deck_id = $2 AND card_id = $3`,
        [!isCommander, deckId, cardId]
      );

      await client.query('COMMIT');

      logger.info(`Card ${cardId} commander status toggled in deck ${deckId}`);

      return { success: true, is_commander: !isCommander };
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      
      logger.error(`Toggle commander error: ${error.message}`);
      throw new DatabaseError('Failed to toggle commander status');
    } finally {
      client.release();
    }
  }

  /**
   * Update card quantity in deck
   */
  async updateCardCount(deckId, cardId, count, userId) {
    const client = await pool.connect();

    try {
      // Verify deck ownership
      await deckService.verifyDeckOwnership(deckId, userId);

      if (count < 1) {
        throw new ValidationError('Card count must be at least 1');
      }

      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE deck_cards SET quantity = $1 
         WHERE deck_id = $2 AND card_id = $3 
         RETURNING *`,
        [count, deckId, cardId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new NotFoundError('Card not found in deck');
      }

      await client.query('COMMIT');

      logger.info(`Card quantity updated to ${count} in deck ${deckId}`);

      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (error instanceof NotFoundError || error instanceof AuthorizationError || error instanceof ValidationError) {
        throw error;
      }
      
      logger.error(`Update card count error: ${error.message}`);
      throw new DatabaseError('Failed to update card count');
    } finally {
      client.release();
    }
  }
}

export const cardService = new CardService();
export default cardService;
