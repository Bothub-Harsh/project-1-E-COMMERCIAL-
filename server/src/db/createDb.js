import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function createDatabaseIfNotExists() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const targetDb = process.env.DB_NAME || 'harsh_electronics';

  console.log(`Connecting to PostgreSQL host ${host}:${port} as ${user}...`);

  const client = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL server.');

    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDb]);
    if (res.rows.length === 0) {
      console.log(`Creating database "${targetDb}"...`);
      await client.query(`CREATE DATABASE ${targetDb}`);
      console.log(`✓ Database "${targetDb}" created successfully!`);
    } else {
      console.log(`✓ Database "${targetDb}" already exists.`);
    }
  } catch (err) {
    console.error('✗ Connection or creation error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabaseIfNotExists();
