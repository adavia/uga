'use strict';

var _http = require('http');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _formidable = require('formidable');

var _formidable2 = _interopRequireDefault(_formidable);

var _dataloader = require('dataloader');

var _dataloader2 = _interopRequireDefault(_dataloader);

var _apolloServerExpress = require('apollo-server-express');

var _graphqlTools = require('graphql-tools');

var _mergeGraphqlSchemas = require('merge-graphql-schemas');

var _graphql = require('graphql');

var _subscriptionsTransportWs = require('subscriptions-transport-ws');

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _passport = require('./authentication/passport');

var _batch = require('./utils/batch');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const uploadDir = 'files';

// Merge graphql type files


// Import database models
const typeDefs = (0, _mergeGraphqlSchemas.mergeTypes)((0, _mergeGraphqlSchemas.fileLoader)(_path2.default.join(__dirname, './schemas')));
// Merge graphql resolver files
const resolvers = (0, _mergeGraphqlSchemas.mergeResolvers)((0, _mergeGraphqlSchemas.fileLoader)(_path2.default.join(__dirname, './resolvers')));
const schema = (0, _graphqlTools.makeExecutableSchema)({
  typeDefs,
  resolvers
});

const app = (0, _express2.default)();

app.use((0, _cors2.default)('*'));

app.use(async (req, res, next) => {
  const user = await (0, _passport.getUser)(req, res);
  req.user = user;

  next();
});

const fileMiddleware = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  const form = _formidable2.default.IncomingForm({
    uploadDir
  });

  form.parse(req, (error, { operations }, files) => {
    if (error) {
      throw new Error(error);
    }

    const document = JSON.parse(operations);

    console.log(document);

    if (Object.keys(files).length) {
      const attachments = Object.values(files).map(file => {
        const { name, type, path: filePath } = file;
        return {
          name,
          type,
          path: filePath
        };
      });

      document.variables.files = attachments;
    }

    req.body = document;
    next();
  });
};

const graphqlEndpoint = '/graphql';

app.use('/files', _express2.default.static('files'));

const server = (0, _http.createServer)(app);

(0, _models2.default)().then(models => {
  if (!models) {
    console.log('Could not connect to database');
    return;
  }

  app.use(graphqlEndpoint, _bodyParser2.default.json(), fileMiddleware, (0, _apolloServerExpress.graphqlExpress)((req, res) => ({
    schema,
    context: {
      models,
      user: req.user,
      emailLoader: new _dataloader2.default(ids => (0, _batch.emailBatcher)(ids, models)),
      fileLoader: new _dataloader2.default(ids => (0, _batch.fileBatcher)(ids, models)),
      contractLoader: new _dataloader2.default(ids => (0, _batch.contractBatcher)(ids, models)),
      clientLoader: new _dataloader2.default(ids => (0, _batch.clientBatcher)(ids, models))
    }
  })));

  app.use('/graphiql', (0, _apolloServerExpress.graphiqlExpress)({
    endpointURL: graphqlEndpoint
  }));

  models.sequelize.sync().then(() => {
    server.listen(8081, () => {
      console.log('Server listening on port 8081..');
    });
  });
});