import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Check your .env.local file.');
}

const sql = neon(process.env.DATABASE_URL);

export default sql;
