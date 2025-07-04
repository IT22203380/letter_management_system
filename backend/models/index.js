const { systemLogger } = require("../utils/logger");
const sequelize = require("../config/database");
const { Sequelize } = require('sequelize');

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    systemLogger.info('Database connection has been established successfully.');
  } catch (error) {
    systemLogger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Initialize database object
const db = {
  Sequelize,
  sequelize,
  // Models will be added here
};

// Import models
db.User = require('./user.model')(sequelize, Sequelize);
db.Email = require('./Email');
db.Fax = require('./Fax');
db.Letter = require('./Letter');
db.NormalPost = require('./NormalPost');
db.RegisteredPost = require('./RegisteredPost');

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Test the database connection
testConnection();

module.exports = db;