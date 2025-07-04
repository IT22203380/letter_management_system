const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NormalPost = sequelize.define('NormalPost', {
  //registrationNumber: { type: DataTypes.STRING, allowNull: false },
  senderName: { type: DataTypes.STRING, allowNull: false },
  senderAddress: { type: DataTypes.TEXT, allowNull: false },
  receiverName: { type: DataTypes.STRING, allowNull: false },
  receiverAddress: { type: DataTypes.TEXT, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  isConfidential: { type: DataTypes.STRING, allowNull: false },
  mode: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  priority: { type: DataTypes.STRING, defaultValue: 'medium' },
  type: { type: DataTypes.STRING, defaultValue: 'normal' },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
});

module.exports = NormalPost;