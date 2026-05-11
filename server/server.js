import app from './src/app.js';
import { config } from './src/config/environment.js';
import { testConnection } from './src/config/database.js';
import logger from './src/utils/logger.js';

const PORT = config.port;

// Test database connection before starting server
testConnection()
  .then((connected) => {
    if (!connected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server.');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Closing HTTP server.');
  process.exit(0);
});