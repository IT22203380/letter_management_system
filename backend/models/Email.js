const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Email = sequelize.define('Email', {
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bcc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'medium',
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'email',
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'emails',
  timestamps: true
});

module.exports = Email;