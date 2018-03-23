export default (sequelize, DataTypes) => {
  const Invoice = sequelize.define("invoice", {
    code: {
      type: DataTypes.STRING,
      unique: true
    },
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

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Client, {
      foreignKey: 'clientId'
    });
  }

  return Invoice;
}
