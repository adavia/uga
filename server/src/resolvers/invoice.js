import { isAuth } from '../authentication/permissions';
import moment from 'moment';

export default {
  Invoice: {
    client: async ({ clientId }, args, { clientLoader }) => {
      return clientLoader.load(clientId);
    }
  },
  Query: {
    allInvoices: isAuth.createResolver(async (parent, { cursor, filter }, { models }) => {
      const options = {
        order: [['createdAt', 'DESC']],
        where: {},
        limit: 10,
        // include: {
        //   model: models.Client,
        //   attributes: ['id'],
        //   where: {
        //     id: 1
        //   },
        //   required: true
        // },
        // attributes: [
        //   'invoice.clientId',
        //   [models.sequelize.fn('COUNT', models.sequelize.col('invoice.id')), 'countMonth'],
        //   [models.sequelize.fn('SUM', models.sequelize.col('invoice.total')), 'totalMonth'],
        //   [models.sequelize.fn('MONTH', models.sequelize.col('invoice.invoiceDate')), 'month']
        // ],
        // group: [models.sequelize.fn('MONTH', models.sequelize.col('invoice.invoiceDate'))],
        raw: true
      }

      if (cursor) {
        options.where[models.op.and] = {
          createdAt: {
            [models.op.lt]: cursor
          }
        }
      }

      if (filter && filter.code) {
        options.where[models.op.and] = {
          code: filter.code
        }
      }

      if (filter && filter.city) {
        options.where[models.op.and] = {
          city: {
            [models.op.like]: '%' + filter.city + '%'
          }
        }
      }

      if (filter && filter.client) {
        options.include = [{
          model: models.Client,
          where: {
            id: filter.client
          }
        }]
      }

      if (filter && filter.invoiceDate) {
        options.where[models.op.and] = {
          invoiceDate: {
            [models.op.gt]: filter.invoiceDate
          }
        }
      }

      if (filter && filter.responsible) {
        options.include = [{
          model: models.Client,
          where: {
            responsible: {
              [models.op.like]: '%' + filter.responsible + '%'
            }
          }
        }]
      }
      
      const query = await models.Invoice.findAll(options);
      return query;
    }),
    reportInvoices: isAuth.createResolver(async (parent, { filter }, { models }) => {
      const invoices = await models.sequelize.query(
        `SELECT
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
          replacements: [filter.client, moment(new Date(filter.invoiceDate)).format('YYYY')],
          model: models.Invoice,
          raw: true
        }
      )

      return invoices;
    }),
    totalInvoices: isAuth.createResolver(async (parent, { date }, { models }) => {
      const total = await models.sequelize.query(
        `SELECT SUM(total) AS 'totalGeneral'
         FROM invoices
         WHERE YEAR(invoiceDate) = ?
         AND MONTH(invoiceDate) = ?
        `, {
          replacements: [moment(new Date(date)).format('YYYY'), moment(new Date(date)).format('MM')],
          model: models.Invoice,
          raw: true
        }
      )

      return total[0];
    }),
    clientInvoices: isAuth.createResolver(async (parent, { cursor, clientId }, { models }) => {
      const options = {
        order: [['createdAt', 'ASC']],
        where: { clientId },
        limit: 10
      }

      if (cursor) {
        options.where.createdAt = {
          [models.op.lt]: cursor
        }
      }

      return await models.Invoice.findAll(options);
    }),
    getInvoice: isAuth.createResolver(async (parent, { id }, { models }) => {
      return await models.Invoice.findById(id);
    })
  },
  Mutation: {
    createInvoice: isAuth.createResolver(async (parent, args, { models, user }) => {
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
    updateInvoice: isAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const invoice = await models.Invoice.findById(args.id);

        await models.Invoice.update({
          code: args.code,
          city: args.city,
          receiver: args.receiver,
          notes: args.notes,
          invoiceDate: args.invoiceDate,
          total: args.total,
        }, {
          where: {
            id: args.id
          },
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
    uniqueCode: isAuth.createResolver(async (parent, { code }, { models }) => {
      const invoice = await models.Invoice.findOne({ where: { code }});

      if (invoice) {
        return false;
      }

      return true;
    }),
    deleteInvoice: isAuth.createResolver(async (parent, args, { models }) => {
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
          }
        }
      } catch (e) {
        return {
          ok: false,
          errors: [{
            path: 'error',
            message: e.message
          }]
        }
      }
    })
  }
};
