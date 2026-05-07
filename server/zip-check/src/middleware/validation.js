import { body, param, query, validationResult } from 'express-validator';
import logger from '../utils/logger.js';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation errors: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array() 
    });
  }
  next();
};

// User registration validation
export const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  validate
];

// User login validation
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// Deck creation validation
export const createDeckValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Deck name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Deck name must be between 1 and 100 characters'),
  
  body('commander')
    .notEmpty().withMessage('Commander is required')
    .custom((value) => {
      if (!value.name || !value.id) {
        throw new Error('Commander must have name and id');
      }
      return true;
    }),
  
  validate
];

// Deck ID parameter validation
export const deckIdParamValidation = [
  param('id')
    .isUUID().withMessage('Invalid deck ID format'),
  
  validate
];

// Card operations validation
export const cardOperationValidation = [
  param('deckId')
    .isUUID().withMessage('Invalid deck ID format'),
  
  param('cardId')
    .optional()
    .isString().withMessage('Invalid card ID format'),
  
  validate
];

export default {
  validate,
  registerValidation,
  loginValidation,
  createDeckValidation,
  deckIdParamValidation,
  cardOperationValidation
};