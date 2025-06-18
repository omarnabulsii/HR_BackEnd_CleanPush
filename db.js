// db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', err => {
  console.error('Unexpected PG client error', err);
  process.exit(-1);
});