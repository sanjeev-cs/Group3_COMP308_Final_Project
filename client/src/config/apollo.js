import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const defaultHttpUrl = import.meta.env.DEV
  ? '/graphql'
  : 'https://group3-comp308-final-project-backend.onrender.com/graphql';

const defaultWsUrl = import.meta.env.DEV
  ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/graphql`
  : 'wss://group3-comp308-final-project-backend.onrender.com/graphql';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_HTTP_URL || defaultHttpUrl,
});

// Inject JWT into every request
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_GRAPHQL_WS_URL || defaultWsUrl,
  })
);

// Split between HTTP (queries/mutations) and WS (subscriptions)
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
