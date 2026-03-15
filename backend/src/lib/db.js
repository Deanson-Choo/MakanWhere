import pg from 'pg';
import 'dotenv/config';

// A Pool is a collection of clients that can be used to interact with the database
const { Pool } = pg;

// The Pool uses variables from your .env file
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,

  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  max:20, // Maximum number of clients in the pool
});

// Export a helper function to keep things clean
export const query = (text, values) => pool.query(text, values);