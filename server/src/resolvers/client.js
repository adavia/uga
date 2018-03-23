import { isAuth } from '../authentication/permissions';
import { renameField } from '../utils/helpers';

export default {
  Client: {
    contract: ({ id }, args, { contractLoader }) => {
      return contractLoader.load(id);
    },
    emails: ({ id }, args, { emailLoader }) => {
      return emailLoader.load(id);
    },
    files: ({ id }, args, { fileLoader }) => {
      return fileLoader.load(id);
    }
  },
  Query: {
    allClients: isAuth.createResolver(async (parent, { cursor, searchText }, { models }) => {
      const options = {
        order: [['createdAt', 'DESC']],
        // include: {
        //   model: models.Invoice,
        //   attributes: [[models.sequelize.fn('SUM', models.sequelize.col('invoices.total')), 'totalOilSum']],
        //   duplicating: false
        // },
        where: {},
        //group: [models.sequelize.col('client.id')],
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

      if (searchText) {
        options.where[models.op.or] = {
          socialName: {
            [models.op.like]: '%' + searchText + '%'
          },
          comercialName: {
            [models.op.like]: '%' + searchText + '%'
          }
        }
      }

      const clients = await models.Client.findAll(options);

      return clients;
    }),
    autocompleteClients: isAuth.createResolver(async (parent, { searchText }, { models }) => {
      const options = {
        order: [['createdAt', 'DESC']],
        where: {},
        limit: 10
      }

      if (searchText) {
        options.where[models.op.or] = {
          socialName: {
            [models.op.like]: '%' + searchText + '%'
          },
          comercialName: {
            [models.op.like]: '%' + searchText + '%'
          }
        }
      }

      return await models.Client.findAll(options);
    }),
    getClient: isAuth.createResolver(async (parent, args, { models }) => {
      const client = await models.Client.findById(args.id);

      return client;
    })
  },
  Mutation: {
    createClient: isAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const resp = await models.sequelize.transaction(
          async(transaction) => {
            const client = await models.Client.create({
              rfc: args.rfc,
              socialName: args.socialName,
              legalRepresentative: args.legalRepresentative,
              comercialName: args.comercialName,
              responsible: args.responsible,
              phone: args.phone,
              userId: user.id
            }, {transaction});

            await models.Contract.create({
              oilPayment: args.contract.oilPayment,
              contractDate: args.contract.contractDate,
              contractEnd: args.contract.contractEnd,
              contact: args.contract.contact,
              address: args.contract.address,
              clientId: client.id
            }, {transaction});

            if (args.emails.length === 0) {
              throw new Error('You must add at least one email address to this client');
            } else {
              const emails = args.emails.map(email => {
                const obj = Object.assign({}, email);
                obj.clientId = client.id;

                return obj;
              });

              await models.Email.bulkCreate(emails, {
                transaction,
                validate: true
              });
            }

            if (args.files.length > 0) {
              const files = args.files.map(file => {
                const obj = Object.assign({}, file);
                obj.clientId = client.id;

                return obj;
              });

              await models.Attachment.bulkCreate(files, {
                transaction,
                validate: true
              });
            }

            return client;
          }
        )

        return {
          ok: true,
          client: resp
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
    updateClient: isAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const resp = await models.sequelize.transaction(
          async(transaction) => {
            await models.Client.update({
              rfc: args.rfc,
              socialName: args.socialName,
              legalRepresentative: args.legalRepresentative,
              comercialName: args.comercialName,
              responsible: args.responsible,
              phone: args.phone,
              userId: user.id
            }, {
              where: {
                id: args.id
              },
              transaction
            });

            const client = await models.Client.findById(args.id, { transaction });

            await models.Contract.update({
              oilPayment: args.contract.oilPayment,
              contractDate: args.contract.contractDate,
              contractEnd: args.contract.contractEnd,
              contact: args.contract.contact,
              address: args.contract.address,
            }, {
              where: {
                clientId: client.id
              },
              transaction
            });

            const emails = args.emails.map(email => {
              const obj = Object.assign({}, email);
              obj.clientId = client.id;

              return obj;
            });

            if (args.emails.length === 0) {
              throw new Error('You must add at least one email address to this client');
            } else {
              const emails = args.emails.map(email => {
                const obj = Object.assign({}, email);
                obj.clientId = client.id;

                return obj;
              });

              await models.Email.bulkCreate(emails, {
                transaction,
                updateOnDuplicate: true,
                validate: true
              });
            }

            if (args.deletedEmails.length > 0) {
              const emailIds = args.deletedEmails.map(e => e.id);

              await models.Email.destroy({
                where: { id: emailIds },
                transaction
              });
            }

            if (args.files.length > 0) {
              const files = args.files.map(file => {
                const obj = Object.assign({}, file);
                obj.clientId = client.id;

                return obj;
              });

              await models.Attachment.bulkCreate(files, {
                transaction,
                updateOnDuplicate: true,
                validate: true
              });
            }

            return client;
          });

        return {
          ok: true,
          client: resp
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
    deleteClient: isAuth.createResolver(async (parent, args, { models }) => {
      const client = await models.Client.destroy({ where: { id: args.id } });

      if (client) {
        return {
          ok: true
        }
      } else {
        return {
          ok: false,
          errors: [{
            path: 'error',
            message: 'Something went wrong. Try that again!'
          }]
        }
      }
    })
  }
}
