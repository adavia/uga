import { login } from '../authentication/passport';
import { isAuth } from '../authentication/permissions';

export default {
  Query: {
    me: isAuth.createResolver((parent, args, { models, user }) => {
      return user;
    }),
    allUsers: isAuth.createResolver(async (parent, { cursor }, { models, user }) => {
      const options = {
        order: [['createdAt', 'DESC']],
        where: {},
        limit: 10,
        raw: true
      }

      if (cursor) {
        options.where[models.op.and] = {
          createdAt: {
            [models.op.lt]: cursor
          }
        }
      }

      const users = await models.User.findAll(options);

      return users;
    }),
    getUser: isAuth.createResolver(async (parent, args, { models }) => {
      const user = await models.User.findById(args.id);

      return user;
    })
  },
  Mutation: {
    login: (parent, { email, password }, { models }) => {
      return login({ email, password });
    },
    register: isAuth.createResolver(async (parent, args, { models }) => {
      try {
        const user = await models.User.create(args);
        return {
          ok: true,
          user
        }
      } catch(e) {
        if (e instanceof models.sequelize.ValidationError) {
          return {
            ok: false,
            errors: [{
              path: 'error',
              message: 'Some of your data is not valid. Try that again!'
            }]
          }
        } else {
          return {
            ok: false,
            errors: [{
              path: 'error',
              message: e.message
            }]
          }
        }
      }
    }),
    uniqueEmail: async (parent, { email }, { models }) => {
      const user = await models.User.findOne({ where: { email }});

      if (user) {
        return false;
      }

      return true;
    },
    updateUser: isAuth.createResolver(async (parent, args, { models }) => {
      try {
        await models.User.update({
          username: args.username,
          email: args.email,
          password: args.password
        }, {
          where: {
            id: args.id
          }
        });

        const user = await models.User.findById(args.id);

        return {
          ok: true,
          user
        }
      } catch(e) {
        if (e instanceof models.sequelize.ValidationError) {
          return {
            ok: false,
            errors: [{
              path: 'error',
              message: 'Some of your data is not valid. Try that again!'
            }]
          }
        } else {
          return {
            ok: false,
            errors: [{
              path: 'error',
              message: e.message
            }]
          }
        }
      }
    })
  }
};
