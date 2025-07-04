const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fax = sequelize.define('Fax', {
  senderNumber: DataTypes.STRING,
  senderOrganization: DataTypes.STRING,
  senderEmail: DataTypes.STRING,
  faxNumber: DataTypes.STRING,
  date: DataTypes.STRING,
  time: DataTypes.STRING,
  isConfidential: DataTypes.STRING,
  subject: DataTypes.STRING,
  message: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'fax',
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
});

module.exports = Fax;