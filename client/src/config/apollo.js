import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';

import { createUploadLink } from '../helpers/file-link';

const httpLink = createUploadLink({
  uri: `${process.env.REACT_APP_SERVER_URL}/graphql`
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? token : null
    }
  }
});

export default new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
