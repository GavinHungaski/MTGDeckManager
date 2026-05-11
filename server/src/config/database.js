import pkg from 'pg';
import { config } from './environment.js';

const { Pool } = pkg;

// Build pool config: prefer raw DATABASE_URL (Railway) for reliability
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      ssl: config.database.ssl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

// Create connection pool with configuration
const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to test connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message || err);
    console.error('Connection config used:', {
      usingDatabaseUrl: !!process.env.DATABASE_URL,
      host: poolConfig.host || 'from-connectionString',
      port: poolConfig.port || 'from-connectionString',
      database: poolConfig.database || 'from-connectionString',
    });
    return false;
  }
};

export default pool;
