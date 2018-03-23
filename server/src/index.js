import { createServer } from 'http';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import formidable from 'formidable';
import DataLoader from 'dataloader';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

// Import database models
import getModels from './models';

import { getUser } from './authentication/passport';
import { emailBatcher, fileBatcher, contractBatcher, clientBatcher } from './utils/batch';

const uploadDir = 'files';

// Merge graphql type files
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));
// Merge graphql resolver files
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = express();

app.use(cors('*'));

app.use(async (req, res, next) => {
  const user = await getUser(req, res);
  req.user = user;

  next();
});

const fileMiddleware = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  const form = formidable.IncomingForm({
    uploadDir
  })

  form.parse(req, (error, { operations }, files) => {
    if (error) {
      throw new Error(error);
    }

    const document = JSON.parse(operations);

    console.log(document)

    if (Object.keys(files).length) {
      const attachments = Object.values(files).map(file => {
        const { name, type, path: filePath } = file;
        return {
          name,
          type,
          path: filePath,
        }
      });

      document.variables.files = attachments;
    }

    req.body = document;
    next();
  });
}

const graphqlEndpoint = '/graphql';

app.use('/files', express.static('files'));

const server = createServer(app);

getModels().then(models => {
  if (!models) {
    console.log('Could not connect to database');
    return;
  }

  app.use(graphqlEndpoint,
    bodyParser.json(),
    fileMiddleware,
    graphqlExpress((req, res) => ({
      schema,
      context: {
        models,
        user: req.user,
        emailLoader: new DataLoader(ids => emailBatcher(ids, models)),
        fileLoader: new DataLoader(ids => fileBatcher(ids, models)),
        contractLoader: new DataLoader(ids => contractBatcher(ids, models)),
        clientLoader: new DataLoader(ids => clientBatcher(ids, models))
      }
    }))
  );
  
  app.use('/graphiql',
    graphiqlExpress({
      endpointURL: graphqlEndpoint
    })
  );

  models.sequelize.sync().then(() => {
    server.listen(8081, () => {
      console.log('Server listening on port 8081..');
    });
  });
});
