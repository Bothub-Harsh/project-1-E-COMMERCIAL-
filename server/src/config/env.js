import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'harsh-electronics-super-secure-production-jwt-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieMaxAgeDays: parseInt(process.env.COOKIE_MAX_AGE_DAYS || '7', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  db: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'harsh_electronics',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  }
};
