export default (sequelize, DataTypes) => {
  const Contract = sequelize.define("contract", {
    oilPayment: {
      type: DataTypes.DECIMAL,
      validate: {
        notEmpty: true
      }
    },
    contractDate: DataTypes.DATE,
    contractEnd: DataTypes.DATE,
    contact: DataTypes.STRING,
    address: DataTypes.STRING
  });

  Contract.associate = (models) => {
    Contract.belongsTo(models.Client, {
      foreignKey: 'clientId'
    });
  }

  return Contract;
}
