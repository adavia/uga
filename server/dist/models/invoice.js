'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = (sequelize, DataTypes) => {
  const Invoice = sequelize.define("invoice", {
    code: DataTypes.STRING,
    city: DataTypes.STRING,
    receiver: DataTypes.STRING,
    notes: DataTypes.TEXT,
    invoiceDate: DataTypes.DATE,
    total: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true
      }
    }
  }, {
    indexes: [{
      fields: ['createdAt']
    }]
  });

  Invoice.associate = models => {
    Invoice.belongsTo(models.Client, {
      foreignKey: 'clientId'
    });
  };

  return Invoice;
};