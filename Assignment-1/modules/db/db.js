import { MongoClient } from 'mongodb';
import 'dotenv/config';

const dbUrl = process.env.MONGODB_URI;
let client;
let db;

export async function connect() {
  try {
    client = new MongoClient(dbUrl);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB');
    return db;
  } catch (err) {
    console.error('Connection error:', err);
    throw err;
  }
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}