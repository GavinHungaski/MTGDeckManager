import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if provided (Railway format)
function parseDatabaseUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port || 5432,
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.replace('/', ''),
    };
  } catch {
    return null;
  }
}

const dbUrlConfig = parseDatabaseUrl(process.env.DATABASE_URL);

export const config = {
  // Server
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    host: dbUrlConfig?.host || process.env.PGHOST,
    port: dbUrlConfig?.port || process.env.PGPORT,
    user: dbUrlConfig?.user || process.env.PGUSER,
    password: dbUrlConfig?.password || process.env.PGPASSWORD,
    database: dbUrlConfig?.database || process.env.PGDATABASE,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '7d'
  },
  
  // Encryption (for sensitive data)
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key!!',
    algorithm: 'aes-256-gcm'
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

export default config;