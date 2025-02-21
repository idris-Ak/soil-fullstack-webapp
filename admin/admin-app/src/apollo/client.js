import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
const API_URL = process.env.REACT_APP_API_URL?.trim() || "https://soil-fullstack-webapp.onrender.com/graphql";


const httpLink = new HttpLink({
  uri: API_URL,
});

const wsUrl = API_URL.replace(/^https?/, "wss");


const wsLink = new WebSocketLink({
  uri: wsUrl, // for hosting
  // uri: API_URL.replace(/^https?/, "wss"), // for hosting
  // uri: API_URL, // ✅ for local testing 

  options: {
    reconnect: true
  }
});


const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        latestReviews: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: splitLink,
  cache: cache,
});

export default client;
