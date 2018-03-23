import groupBy from 'lodash/groupBy';

export const emailBatcher = async (ids, models) => {
  const emails = await models.Email.findAll({
    where: {
      clientId: ids
    },
    order: [
      ['id', 'ASC']
    ]
  });

  const data = groupBy(emails, 'clientId');

  return ids.map(k => data[k] || []);
}

export const fileBatcher = async (ids, models) => {
  const files = await models.Attachment.findAll({
    where: {
      clientId: ids
    },
    order: [
      ['id', 'ASC']
    ]
  });

  const data = groupBy(files, 'clientId');

  return ids.map(k => data[k] || []);
}

export const contractBatcher = async (ids, models) => {
  const contracts = await models.Contract.findAll({
    where: {
      clientId: ids
    }
  });

  const data = {};

  contracts.forEach(contract => {
    data[contract.id] = contract;
  });

  return ids.map(k => data[k] || []);
}

export const clientBatcher = async (ids, models) => {
  const clients = await models.Client.findAll({
    where: {
      id: ids
    }
  });

  const data = {};

  clients.forEach(client => {
    data[client.id] = client;
  });

  return ids.map(k => data[k] || []);
}
