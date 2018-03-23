import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      validate: {
        isAlphanumeric: true,
        len: {
          args: [3, 25]
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [5, 100]
        }
      }
    }
  }, {
    hooks: {
      afterValidate: async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        user.password = hashedPassword;
      }
    }
  });

  return User;
};
