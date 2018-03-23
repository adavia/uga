import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import LocalStrategy from 'passport-local';

import { token } from '../authentication/token';
import config from '../config/config';
import getModels from '../models';

// Create local strategy
const localOptions = { usernameField: 'email' };

getModels().then(models => {
  passport.use(new LocalStrategy(localOptions, async (email, password, done) => {
    const existingUser = await models.User.findOne({ where: { email } });

    if (!existingUser) {
      return done('This email address does not exist!');
    }

    const valid = await bcrypt.compare(password, existingUser.password);

    if (!valid) {
      return done('Your password is not correct.');
    }

    return done(null, existingUser);
  }));

  // Setup options for JWT Strategy
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.jwtSecret
  };

  // Create JWT strategy
  passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
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

export const getUser = (req, res) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
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

export const login = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    if (email === '' || password === '') {
      return resolve({
        ok: false,
        errors: [{ path: 'error', message: 'Credentials cannot be blank!'}]
      });
    }

    passport.authenticate('local', { session: false }, (err, user) => {
      if (err) {
        return resolve({
          ok: false,
          errors: [{ path: 'error', message: err}]
        });
      }

      resolve({
        ok: true,
        token: token(user)
      });
    })({ body: { email, password } });
  });
};
