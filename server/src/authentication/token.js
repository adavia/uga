import jwt from 'jwt-simple';
import config from '../config/config';

export const token = (user) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.jwtSecret);
};
