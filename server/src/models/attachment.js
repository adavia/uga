export default (sequelize, DataTypes) => {
  const Attachment = sequelize.define("attachments", {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    path: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    }
  });

  Attachment.associate = (models) => {
    Attachment.belongsTo(models.Client, {
      foreignKey: 'clientId'
    });
  }

  return Attachment;
}
