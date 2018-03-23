'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (sequelize, DataTypes) => {
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
      afterValidate: async user => {
        const hashedPassword = await _bcrypt2.default.hash(user.password, 12);
        user.password = hashedPassword;
      }
    }
  });

  return User;
};