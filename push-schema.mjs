import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Client } = pkg;
import * as schema from './shared/schema.ts';
import { sql } from 'drizzle-orm';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();
const db = drizzle(client, { schema });

console.log('Creating tables...');
// This will be handled by drizzle-kit instead
console.log('Use drizzle-kit push instead');
await client.end();
