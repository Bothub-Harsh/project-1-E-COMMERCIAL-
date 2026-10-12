import pg from 'pg';
import { config } from '../config/env.js';

const { Pool } = pg;

let poolConfig;

if (config.db.connectionString) {
  poolConfig = {
    connectionString: config.db.connectionString,
    ssl: config.db.ssl
  };
} else {
  poolConfig = {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    ssl: config.db.ssl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  };
}

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL Unexpected Error]:', err.message);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (config.nodeEnv === 'development' && duration > 100) {
      console.log(`[SQL Slow Query] (${duration}ms):`, text.substring(0, 80));
    }
    return res;
  } catch (error) {
    console.error('[SQL Error Execution]:', error.message);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};
