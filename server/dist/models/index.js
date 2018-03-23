'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.default = async () => {
  let maxReconnects = 20;
  let connected = false;

  const sequelize = new _sequelize2.default(process.env.TEST_DB || 'uga', 'root', 'Ignacio01', {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    dialectOptions: {
      decimalNumbers: true
    },
    operatorsAliases: _sequelize2.default.Op
  });

  while (!connected && maxReconnects) {
    try {
      await sequelize.authenticate();
      connected = true;
    } catch (err) {
      console.log('Reconnecting in 5 seconds...');
      await sleep(5000);
      maxReconnects -= 1;
    }
  }

  if (!connected) {
    return null;
  }

  const models = {
    User: sequelize.import('./user'),
    Client: sequelize.import('./client'),
    Contract: sequelize.import('./contract'),
    Email: sequelize.import('./email'),
    Attachment: sequelize.import('./attachment'),
    Invoice: sequelize.import('./invoice')
  };

  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

  models.sequelize = sequelize;
  models.Sequelize = _sequelize2.default;
  models.op = _sequelize2.default.Op;

  return models;
};