import { MongoClient } from 'mongodb';
import 'dotenv/config';

// Validate environment variable immediately
if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI environment variable is not set');
  process.exit(1);
}

const dbUrl = process.env.MONGODB_URI;
const options = {
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

let cachedClient = null;
let cachedDb = null;

export async function connect() {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  try {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(dbUrl, options);
    
    await client.connect();
    const db = client.db();
    
    console.log('✅ Successfully connected to MongoDB');
    
    cachedClient = client;
    cachedDb = db;
    
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw new Error(`Failed to connect to MongoDB: ${err.message}`);
  }
}

export function getDb() {
  if (!cachedDb) {
    throw new Error('Database not initialized. Call connect() first.');
  }
  return cachedDb;
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  if (cachedClient) {
    await cachedClient.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
});

// Keep the process alive
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});