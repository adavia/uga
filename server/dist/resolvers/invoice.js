'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _permissions = require('../authentication/permissions');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Invoice: {
    client: async ({ clientId }, args, { clientLoader }) => {
      return clientLoader.load(clientId);
    }
  },
  Query: {
    allInvoices: _permissions.isAuth.createResolver(async (parent, { cursor, filter }, { models }) => {
      const options = {
        order: [['createdAt', 'DESC']],
        where: {},
        limit: 10
      };

      if (cursor) {
        options.where[models.op.and] = {
          createdAt: {
            [models.op.gt]: cursor
          }
        };
      }

      if (filter && filter.code) {
        options.where[models.op.and] = {
          code: filter.code
        };
      }

      if (filter && filter.city) {
        options.where[models.op.and] = {
          city: {
            [models.op.like]: '%' + filter.city + '%'
          }
        };
      }

      if (filter && filter.client) {
        options.include = [{
          model: models.Client,
          where: {
            id: filter.client
          }
        }];
      }

      if (filter && filter.invoiceDate) {
        options.where[models.op.and] = {
          invoiceDate: {
            [models.op.gt]: filter.invoiceDate
          }
        };
      }

      if (filter && filter.responsible) {
        options.include = [{
          model: models.Client,
          where: {
            responsible: {
              [models.op.like]: '%' + filter.responsible + '%'
            }
          }
        }];
      }

      return await models.Invoice.findAll(options);
    }),
    reportInvoices: _permissions.isAuth.createResolver(async (parent, { filter }, { models }) => {
      const invoices = await models.sequelize.query(`SELECT
         COUNT(invoice.id) AS 'countMonth',
         SUM(invoice.total) AS 'totalMonth',
         MONTH(invoice.invoiceDate) AS 'month',
         invoice.clientId, client.id
         FROM invoices AS invoice
         INNER JOIN clients AS client
         ON invoice.clientId = client.id
         AND client.id = ?
         WHERE YEAR(invoice.invoiceDate) = ?
         GROUP BY MONTH(invoice.invoiceDate)
        `, {
        replacements: [filter.client, (0, _moment2.default)(new Date(filter.invoiceDate)).format('YYYY')],
        model: models.Invoice,
        raw: true
      });

      return invoices;
    }),
    totalInvoices: _permissions.isAuth.createResolver(async (parent, { date }, { models }) => {
      const total = await models.sequelize.query(`SELECT SUM(total) AS 'totalGeneral'
         FROM invoices
         WHERE YEAR(invoiceDate) = ?
         AND MONTH(invoiceDate) = ?
        `, {
        replacements: [(0, _moment2.default)(new Date(date)).format('YYYY'), (0, _moment2.default)(new Date(date)).format('MM')],
        model: models.Invoice,
        raw: true
      });

      return total[0];
    }),
    clientInvoices: _permissions.isAuth.createResolver(async (parent, { cursor, clientId }, { models }) => {
      const options = {
        order: [['createdAt', 'ASC']],
        where: { clientId },
        limit: 10
      };

      if (cursor) {
        options.where.createdAt = {
          [models.op.gt]: cursor
        };
      }

      return await models.Invoice.findAll(options);
    }),
    getInvoice: _permissions.isAuth.createResolver(async (parent, { id }, { models }) => {
      return await models.Invoice.findById(id);
    })
  },
  Mutation: {
    createInvoice: _permissions.isAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const invoice = await models.Invoice.create({
          code: args.code,
          city: args.city,
          receiver: args.receiver,
          notes: args.notes,
          invoiceDate: args.invoiceDate,
          total: args.total,
          clientId: args.clientId
        });

        if (invoice) {
          const client = await models.Client.findById(invoice.clientId);

          await client.increment({ invoiceCount: 1, totalOilSum: invoice.total });
        }

        return {
          ok: true,
          invoice
        };
      } catch (e) {
        if (e instanceof models.sequelize.ValidationError) {
          return {
            ok: false,
            errors: [{
              path: 'error',
              message: 'Some of your data is not valid. Try that again!'
            }]
          };
        } else {
          return {
            ok: false,
            errors: [{
              path: 'error',
              message: e.message
            }]
          };
        }
      }
    }),
    updateInvoice: _permissions.isAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const invoice = await models.Invoice.findById(args.id);

        await models.Invoice.update({
          code: args.code,
          city: args.city,
          receiver: args.receiver,
          notes: args.notes,
          invoiceDate: args.invoiceDate,
          total: args.total
        }, {
          where: {
            id: args.id
          }
        });

        if (invoice.total !== parseInt(args.total, 10)) {
          const client = await models.Client.findById(invoice.clientId);

          await client.decrement({ totalOilSum: invoice.total });
          await client.increment({ totalOilSum: args.total });
        }

        const resp = await models.Invoice.findById(invoice.id);

        return {
          ok: true,
          invoice: resp
        };
      } catch (e) {
        if (e instanceof models.sequelize.ValidationError) {
          return {
            ok: false,
            errors: [{
              path: 'error',
              message: 'Some of your data is not valid. Try that again!'
            }]
          };
        } else {
          return {
            ok: false,
            errors: [{
              path: 'error',
              message: e.message
            }]
          };
        }
      }
    }),
    deleteInvoice: _permissions.isAuth.createResolver(async (parent, args, { models }) => {
      try {
        const invoice = await models.Invoice.destroy({ where: { id: args.id } });

        if (invoice) {
          const client = await models.Client.findById(args.clientId);

          await client.decrement({
            totalOilSum: args.total,
            invoiceCount: 1
          });

          const updatedClient = await models.Client.findById(client.id);

          return {
            ok: true,
            client: updatedClient
          };
        }
      } catch (e) {
        return {
          ok: false,
          errors: [{
            path: 'error',
            message: e.message
          }]
        };
      }
    })
  }
};