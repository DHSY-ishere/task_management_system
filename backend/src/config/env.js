require('dotenv').config();

const toList = (value) =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  corsOrigins: toList(process.env.CORS_ORIGIN || 'http://localhost:5173'),
  seedData: (process.env.SEED_DATA || 'true').toLowerCase() === 'true',
};
