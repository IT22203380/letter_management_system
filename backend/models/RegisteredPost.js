const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RegisteredPost = sequelize.define('RegisteredPost', {
  registrationNumber: { type: DataTypes.STRING, allowNull: false },
  senderName: { type: DataTypes.STRING, allowNull: false },
  senderAddress: { type: DataTypes.TEXT, allowNull: false },
  receiverName: { type: DataTypes.STRING, allowNull: false },
  receiverAddress: { type: DataTypes.TEXT, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: false },
  isConfidential: { type: DataTypes.STRING, allowNull: false },
  mode: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING },
  priority: { type: DataTypes.STRING },
  attachments: { 
    type: DataTypes.JSON, 
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'registered_posts',
});

module.exports = RegisteredPost;
