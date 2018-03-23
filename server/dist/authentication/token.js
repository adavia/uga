'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.token = undefined;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _config = require('../config/config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const token = exports.token = user => {
  const timestamp = new Date().getTime();
  return _jwtSimple2.default.encode({ sub: user.id, iat: timestamp }, _config2.default.jwtSecret);
};