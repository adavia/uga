'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clientBatcher = exports.contractBatcher = exports.fileBatcher = exports.emailBatcher = undefined;

var _groupBy = require('lodash/groupBy');

var _groupBy2 = _interopRequireDefault(_groupBy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const emailBatcher = exports.emailBatcher = async (ids, models) => {
  const emails = await models.Email.findAll({
    where: {
      clientId: ids
    },
    order: [['id', 'ASC']]
  });

  const data = (0, _groupBy2.default)(emails, 'clientId');

  return ids.map(k => data[k] || []);
};

const fileBatcher = exports.fileBatcher = async (ids, models) => {
  const files = await models.Attachment.findAll({
    where: {
      clientId: ids
    },
    order: [['id', 'ASC']]
  });

  const data = (0, _groupBy2.default)(files, 'clientId');

  return ids.map(k => data[k] || []);
};

const contractBatcher = exports.contractBatcher = async (ids, models) => {
  const contracts = await models.Contract.findAll({
    where: {
      clientId: ids
    }
  });

  const data = {};

  contracts.forEach(contract => {
    data[contract.id] = contract;
  });

  return ids.map(k => data[k] || []);
};

const clientBatcher = exports.clientBatcher = async (ids, models) => {
  const clients = await models.Client.findAll({
    where: {
      id: ids
    }
  });

  const data = {};

  clients.forEach(client => {
    data[client.id] = client;
  });

  return ids.map(k => data[k] || []);
};