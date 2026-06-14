const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
  database: process.env.DB_NAME || 'skillbridge',
  user: process.env.DB_USER || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  poolConfig.host = process.env.DB_HOST;
} else {
  poolConfig.host = 'localhost';
  poolConfig.port = parseInt(process.env.DB_PORT) || 5432;
}

if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim()) {
  poolConfig.password = process.env.DB_PASSWORD;
}

const pool = new Pool(poolConfig);

const schema = process.env.DB_SCHEMA || 'public';

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', (client) => {
  if (schema && schema !== 'public') {
    client.query(`SET search_path TO "${schema}", public`).catch((err) => {
      console.error('Failed to set search_path:', err.message);
    });
  }
});

module.exports = pool;
