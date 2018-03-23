export default (sequelize, DataTypes) => {
  const Client = sequelize.define("client", {
    rfc: DataTypes.STRING,
    socialName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    legalRepresentative: DataTypes.STRING,
    comercialName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    responsible: DataTypes.STRING,
    phone: DataTypes.STRING,
    invoiceCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalOilSum: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    indexes: [{
      fields: ['createdAt']
    }]
  });

  Client.associate = (models) => {
    Client.belongsTo(models.User, {
      foreignKey: 'userId'
    });

    Client.hasOne(models.Contract, { onDelete: 'CASCADE' });
    Client.hasMany(models.Invoice, { onDelete: 'CASCADE' });
    Client.hasMany(models.Email, { onDelete: 'CASCADE' });
    Client.hasMany(models.Attachment, { onDelete: 'CASCADE' });
  }

  return Client;
}
