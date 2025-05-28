// src/config.js
module.exports = {
  HOST: process.env.DB_HOST || 'aws-0-ap-southeast-2.pooler.supabase.com',
  USER: process.env.DB_USER || 'postgres.htydzfgfykyncfxtxgtx',
  PORT: process.env.DB_PORT || 5432,
  PASSWORD: process.env.DB_PASSWORD || 'IKePMRpAENcLsBAy',
  DB: process.env.DB_NAME || 'postgres',
  DIALECT: process.env.DB_DIALECT || 'postgres',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres.htydzfgfykyncfxtxgtx:kyHIl8mPftX4Jtfk@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
