const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Letter = sequelize.define('Letter', {
  type: { type: DataTypes.ENUM('normal', 'registered', 'fax', 'email'), allowNull: false },
  subject: { type: DataTypes.STRING },
  from: { type: DataTypes.STRING },
  to: { type: DataTypes.STRING },
  date: { type: DataTypes.DATEONLY },
  time: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'processing', 'completed'), defaultValue: 'pending' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high') },
  registrationNumber: { type: DataTypes.STRING },
  senderName: { type: DataTypes.STRING },
  senderAddress: { type: DataTypes.STRING },
  receiverName: { type: DataTypes.STRING },
  receiverAddress: { type: DataTypes.STRING },
  isConfidential: { type: DataTypes.STRING },
  mode: { type: DataTypes.STRING },
  senderEmail: { type: DataTypes.STRING },
  receiverEmail: { type: DataTypes.STRING },
  emailPriority: { type: DataTypes.STRING },
  senderNumber: { type: DataTypes.STRING },
  senderOrganization: { type: DataTypes.STRING },
  faxNumber: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT },
});

module.exports = Letter;