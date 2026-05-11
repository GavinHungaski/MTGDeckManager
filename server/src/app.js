import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/environment.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import deckRoutes from './routes/deck.routes.js';
import cardRoutes from './routes/card.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);

// Legacy routes (for backward compatibility)
// These redirect to the new routes
app.get('/api/users/me', (req, res) => {
  res.redirect('/api/auth/me');
});

app.use('/api/users', (req, res) => {
  res.status(410).json({ 
    error: 'Deprecated', 
    message: 'This endpoint has been moved. Please use /api/auth/* endpoints.' 
  });
});

// Serve static files from the React app build in production
if (config.nodeEnv === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // Handle React Router - serve index.html for all non-API routes
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // 404 handler for development (when no static files are served)
  app.use(notFoundHandler);
}

// Global error handler
app.use(errorHandler);

export default app;
