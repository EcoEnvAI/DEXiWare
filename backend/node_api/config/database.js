const Sequelize = require('sequelize');

function requireEnv(name) {
  const value = process.env[name];
  if (value == null || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireIntEnv(name) {
  const raw = requireEnv(name);
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer environment variable ${name}: ${raw}`);
  }
  return parsed;
}

const sequelize = new Sequelize(
  requireEnv('DB_NAME'),
  requireEnv('DB_USER'),
  requireEnv('DB_PASS'),
  {
    host: requireEnv('DB_HOST'),
    port: requireIntEnv('DB_PORT'),
    dialect: 'postgres'
  }
);

// initialize database
const db = {};
const models = require('../models/all_models');

// Loop through all models
for (m in models) {
  // Add each model to db
  db[m] = models[m](sequelize, Sequelize);
}

// make associations with the database
Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
