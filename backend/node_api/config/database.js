const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER || 'dexiware_user', process.env.DB_PASS || 'dexiware_password', {
  host: 'localhost',
  dialect: 'postgres'
});

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
