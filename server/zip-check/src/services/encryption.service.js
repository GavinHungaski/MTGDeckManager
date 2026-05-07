import crypto from 'crypto';
import { config } from '../config/environment.js';
import logger from '../utils/logger.js';

class EncryptionService {
  constructor() {
    this.algorithm = config.encryption.algorithm;
    // Ensure key is exactly 32 bytes for AES-256
    this.key = crypto.scryptSync(
      config.encryption.key.padEnd(32, ' ').slice(0, 32), 
      'salt', 
      32
    );
  }

  /**
   * Encrypt sensitive text data
   * @param {string} text - Plain text to encrypt
   * @returns {string} - Encrypted data (iv:authTag:ciphertext)
   */
  encrypt(text) {
    try {
      // Generate a random IV
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the authentication tag
      const authTag = cipher.getAuthTag();
      
      // Return iv:authTag:ciphertext format
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt encrypted data
   * @param {string} encryptedData - Encrypted data (iv:authTag:ciphertext)
   * @returns {string} - Decrypted plain text
   */
  decrypt(encryptedData) {
    try {
      // Split the data into parts
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encryptedText = parts[2];
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt the text
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt an object's sensitive fields
   * @param {Object} obj - Object containing sensitive fields
   * @param {string[]} fields - Array of field names to encrypt
   * @returns {Object} - Object with encrypted fields
   */
  encryptFields(obj, fields) {
    const encryptedObj = { ...obj };
    
    fields.forEach(field => {
      if (encryptedObj[field] && typeof encryptedObj[field] === 'string') {
        encryptedObj[field] = this.encrypt(encryptedObj[field]);
      }
    });
    
    return encryptedObj;
  }

  /**
   * Decrypt an object's sensitive fields
   * @param {Object} obj - Object containing encrypted fields
   * @param {string[]} fields - Array of field names to decrypt
   * @returns {Object} - Object with decrypted fields
   */
  decryptFields(obj, fields) {
    const decryptedObj = { ...obj };
    
    fields.forEach(field => {
      if (decryptedObj[field] && typeof decryptedObj[field] === 'string') {
        try {
          decryptedObj[field] = this.decrypt(decryptedObj[field]);
        } catch (error) {
          // If decryption fails, leave the field as is
          logger.warn(`Failed to decrypt field ${field}, leaving as encrypted`);
        }
      }
    });
    
    return decryptedObj;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
export default encryptionService;