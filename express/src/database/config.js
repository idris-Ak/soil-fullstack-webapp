// src/config.js
module.exports = {
  HOST: process.env.DB_HOST || 'localhost',
  USER: process.env.DB_USER || 'root',
  PORT: process.env.DB_PORT || 5432,
  PASSWORD: process.env.DB_PASSWORD || '',
  DB: process.env.DB_NAME || 'postgres',
  DIALECT: process.env.DB_DIALECT || 'postgres',
};
