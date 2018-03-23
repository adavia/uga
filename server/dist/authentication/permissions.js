'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAuth = undefined;

var _passport = require('./passport');

const passport = require('passport');

// Get currenUser from header req


const createResolver = resolver => {
  const baseResolver = resolver;

  baseResolver.createResolver = childResolver => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

const isAuth = exports.isAuth = createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }
});