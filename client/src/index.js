import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Route } from 'react-router-dom';

import Routes from './components/main/App';
import serviceWorker from './service-worker';
import client from './config/apollo';

const App = (
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Route component={Routes} />
    </BrowserRouter>
  </ApolloProvider>
);

ReactDOM.render(App, document.getElementById('root'));
serviceWorker();
