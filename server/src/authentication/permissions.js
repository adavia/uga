const passport = require('passport');

// Get currenUser from header req
import { getUser } from './passport';

const createResolver = (resolver) => {
  const baseResolver = resolver;

  baseResolver.createResolver = (childResolver) => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    }
    return createResolver(newResolver);
  }
  return baseResolver;
};

export const isAuth = createResolver((parent, args, {user}) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }
});
