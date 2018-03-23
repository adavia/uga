export default (sequelize, DataTypes) => {
  const Email = sequelize.define("email", {
    address: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isEmail: true
      }
    }
  });

  Email.associate = (models) => {
    Email.belongsTo(models.Client, {
      foreignKey: 'clientId'
    });
  }

  return Email;
}
