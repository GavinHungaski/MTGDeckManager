import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { cardOperationValidation } from '../middleware/validation.js';
import { cardService } from '../services/card.service.js';

const router = Router();

// All card routes require authentication
router.use(authenticate);

/**
 * POST /api/cards/decks/:deckId/card
 * Add a card to a deck
 */
router.post('/decks/:deckId/card', cardOperationValidation, async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const cardData = req.body;
    await cardService.addCardToDeck(deckId, cardData, req.user.id);
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cards/decks/:deckId/cards/batch
 * Add multiple cards to a deck in batch
 */
router.post('/decks/:deckId/cards/batch', cardOperationValidation, async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const { cards } = req.body;
    const result = await cardService.addCardsToDeckBatch(deckId, cards, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cards/decks/:deckId/card/:cardId
 * Remove a card from a deck
 */
router.delete('/decks/:deckId/card/:cardId', cardOperationValidation, async (req, res, next) => {
  try {
    const { deckId, cardId } = req.params;
    await cardService.removeCardFromDeck(deckId, cardId, req.user.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/cards/decks/:deckId/card/:cardId/commander
 * Toggle commander status for a card
 */
router.patch('/decks/:deckId/card/:cardId/commander', cardOperationValidation, async (req, res, next) => {
  try {
    const { deckId, cardId } = req.params;
    const result = await cardService.toggleCommander(deckId, cardId, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/cards/decks/:deckId/card/:cardId/count
 * Update card count in deck
 */
router.put('/decks/:deckId/card/:cardId/count', cardOperationValidation, async (req, res, next) => {
  try {
    const { deckId, cardId } = req.params;
    const { count } = req.body;
    await cardService.updateCardCount(deckId, cardId, count, req.user.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/cards/decks/:deckId/prices/batch
 * Batch update card prices for a deck
 */
router.patch('/decks/:deckId/prices/batch', cardOperationValidation, async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const { updates } = req.body;
    const result = await cardService.batchUpdatePrices(deckId, updates, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
