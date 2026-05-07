import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { config } from '../config/environment.js';
import logger from '../utils/logger.js';
import { AuthenticationError, AuthorizationError } from './errorHandler.js';

/**
 * Authenticate JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`Authentication failed: No token provided for ${req.url}`);
      throw new AuthenticationError('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Invalid token format');
    }

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, config.jwt.secret);
    } catch (jwtError) {
      logger.warn(`JWT verification failed: ${jwtError.message}`);
      throw new AuthenticationError('Invalid or expired token');
    }

    // Fetch user from database
    const userRes = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [payload.id]
    );

    if (userRes.rows.length === 0) {
      logger.warn(`User not found for token payload: ${payload.id}`);
      throw new AuthenticationError('User not found');
    }

    // Attach user to request
    req.user = userRes.rows[0];
    
    // Log successful authentication
    logger.debug(`User ${req.user.id} authenticated successfully`);
    
    next();
  } catch (error) {
    // Pass through our custom errors, wrap others
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      next(error);
    } else {
      logger.error(`Authentication error: ${error.message}`);
      next(new AuthenticationError('Authentication failed'));
    }
  }
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const payload = jwt.verify(token, config.jwt.secret);
        const userRes = await pool.query(
          'SELECT id, username, email FROM users WHERE id = $1',
          [payload.id]
        );

        if (userRes.rows.length > 0) {
          req.user = userRes.rows[0];
        }
      } catch (jwtError) {
        // Token is invalid, but that's okay for optional auth
        logger.debug('Optional auth: invalid token, continuing as guest');
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we never fail the request
    logger.debug(`Optional auth error (non-fatal): ${error.message}`);
    next();
  }
};

export default { authenticate, optionalAuth };