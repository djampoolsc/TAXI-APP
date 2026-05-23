import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export function getDatabase() {
  return pool;
}

export async function initializeDatabase() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0]);

    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) as exists`
    );

    if (!tableCheck.rows[0].exists) {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schema);
      console.log('✓ Database schema initialized');
    } else {
      console.log('✓ Database schema already present');
    }
  } catch (err) {
    console.error('✗ Database initialization failed:', err);
    process.exit(1);
  }
}
