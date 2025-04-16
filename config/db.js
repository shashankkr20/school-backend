const { Pool } = require('pg');
const { dbConfig } = require('./config');

const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log connection events
pool.on('connect', () => console.log('Connected to PostgreSQL'));
pool.on('error', (err) => console.error('PostgreSQL pool error:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => await pool.connect(),
  releaseClient: (client) => client.release(),
};