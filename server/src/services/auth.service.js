import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database.js';
import { config } from '../config/environment.js';
import encryptionService from './encryption.service.js';
import logger from '../utils/logger.js';
import { 
  AuthenticationError, 
  ValidationError, 
  DatabaseError 
} from '../middleware/errorHandler.js';

class AuthService {
  constructor() {
    this.saltRounds = 10;
  }

  /**
   * Register a new user
   */
  async registerUser(userData) {
    const { username, email, password } = userData;
    const client = await pool.connect();

    try {
      // Create email hash for checking existing users
      const emailHash = this.hashEmailForSearch(email);
      
      // Check if user already exists by username or email hash
      // Note: We search by email_hash since email is stored encrypted
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email_hash = $1 OR username = $2',
        [emailHash, username]
      );

      if (existingUser.rows.length > 0) {
        throw new ValidationError('Username or email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, this.saltRounds);

      // Encrypt sensitive data
      const encryptedEmail = encryptionService.encrypt(email);

      // Create user
      const result = await client.query(
        `INSERT INTO users (username, email, email_hash, password_hash) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, username, email, created_at`,
        [username, encryptedEmail, emailHash, passwordHash]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Decrypt email for response
      const decryptedUser = {
        ...user,
        email: encryptionService.decrypt(user.email)
      };

      logger.info(`User registered: ${user.id}`);

      return {
        token,
        user: {
          id: decryptedUser.id,
          username: decryptedUser.username,
          email: decryptedUser.email
        }
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error;
      }
      
      logger.error(`Registration error: ${error.message}`);
      throw new DatabaseError('Failed to register user');
    } finally {
      client.release();
    }
  }

  /**
   * Login user
   */
  async loginUser(credentials) {
    const { email, password } = credentials;
    const client = await pool.connect();

    try {
      // Find user by email (we need to search by encrypted email)
      // For search, we'll need to encrypt the input email and compare
      // Or we can store a hash of the email for searching
      // For now, let's assume we store email_hash for searching
      const emailHash = this.hashEmailForSearch(email);
      
      const userRes = await client.query(
        `SELECT id, username, email, password_hash 
         FROM users 
         WHERE email_hash = $1`,
        [emailHash]
      );

      if (userRes.rows.length === 0) {
        throw new AuthenticationError('Invalid credentials');
      }

      const user = userRes.rows[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Decrypt email for response
      const decryptedEmail = encryptionService.decrypt(user.email);

      logger.info(`User logged in: ${user.id}`);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: decryptedEmail
        }
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      logger.error(`Login error: ${error.message}`);
      throw new DatabaseError('Failed to login');
    } finally {
      client.release();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId) {
    try {
      const result = await pool.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new AuthenticationError('User not found');
      }

      const user = result.rows[0];
      
      // Decrypt email
      const decryptedEmail = encryptionService.decrypt(user.email);

      return {
        id: user.id,
        username: user.username,
        email: decryptedEmail
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      logger.error(`Get user error: ${error.message}`);
      throw new DatabaseError('Failed to get user');
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Hash email for searching (one-way hash)
   */
  hashEmailForSearch(email) {
    return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
  }
}

export const authService = new AuthService();
export default authService;