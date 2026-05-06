import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createDeckValidation, deckIdParamValidation } from '../middleware/validation.js';
import { deckService } from '../services/deck.service.js';

const router = Router();

// All deck routes require authentication
router.use(authenticate);

/**
 * GET /api/decks
 * Get all decks for the current user
 */
router.get('/', async (req, res, next) => {
  try {
    const decks = await deckService.getAllDecks(req.user.id);
    res.json(decks);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/decks/:id
 * Get a specific deck by ID
 */
router.get('/:id', deckIdParamValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deck = await deckService.getDeckById(id, req.user.id);
    res.json(deck);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/decks
 * Create a new deck
 */
router.post('/', createDeckValidation, async (req, res, next) => {
  try {
    const { name, commander } = req.body;
    const deck = await deckService.createDeck(req.user.id, { name, commander });
    res.status(201).json(deck);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/decks/:id
 * Update a deck
 */
router.patch('/:id', deckIdParamValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await deckService.updateDeck(id, req.user.id, updates);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/decks/:id
 * Delete a deck
 */
router.delete('/:id', deckIdParamValidation, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deckService.deleteDeck(id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;