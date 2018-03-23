'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = exports.getUser = undefined;

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportJwt = require('passport-jwt');

var _passportLocal = require('passport-local');

var _passportLocal2 = _interopRequireDefault(_passportLocal);

var _token = require('../authentication/token');

var _config = require('../config/config');

var _config2 = _interopRequireDefault(_config);

var _models = require('../models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create local strategy
const localOptions = { usernameField: 'email' };

(0, _models2.default)().then(models => {
  _passport2.default.use(new _passportLocal2.default(localOptions, async (email, password, done) => {
    const existingUser = await models.User.findOne({ where: { email } });

    if (!existingUser) {
      return done('This email address does not exist!');
    }

    const valid = await _bcrypt2.default.compare(password, existingUser.password);

    if (!valid) {
      return done('Your password is not correct.');
    }

    return done(null, existingUser);
  }));

  // Setup options for JWT Strategy
  const jwtOptions = {
    jwtFromRequest: _passportJwt.ExtractJwt.fromHeader('authorization'),
    secretOrKey: _config2.default.jwtSecret
  };

  // Create JWT strategy
  _passport2.default.use(new _passportJwt.Strategy(jwtOptions, async (payload, done) => {
    // See if the user ID in the payload exists in our database
    // If it does, call 'done' with that other
    // Otherwise, call done without a user object
    const user = await models.User.findOne({ where: { id: payload.sub } });

    if (user) {
      return done(null, user);
    }

    done(null, false);
  }));
});

const getUser = exports.getUser = (req, res) => {
  return new Promise((resolve, reject) => {
    _passport2.default.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return resolve(false);
      }

      if (user) {
        return resolve(user);
      }

      resolve(false);
    })(req, res);
  });
};

const login = exports.login = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    if (email === '' || password === '') {
      return resolve({
        ok: false,
        errors: [{ path: 'error', message: 'Credentials cannot be blank!' }]
      });
    }

    _passport2.default.authenticate('local', { session: false }, (err, user) => {
      if (err) {
        return resolve({
          ok: false,
          errors: [{ path: 'error', message: err }]
        });
      }

      resolve({
        ok: true,
        token: (0, _token.token)(user)
      });
    })({ body: { email, password } });
  });
};