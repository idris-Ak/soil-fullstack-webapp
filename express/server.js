const express = require("express");
const cors = require("cors");
const db = require("./src/database");
const { ApolloServer } = require('apollo-server-express'); //Apollo Server for GraphQL
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const typeDefs = require("./src/admin_GraphQL/types");
const resolvers = require("./src/admin_GraphQL/resolvers");
const http = require('http');

// Sync database
(async () => {
  try {
    await db.sync();
  } catch (error) {
    console.error("Error syncing the database:", error);
  }
})();

const app = express();
const httpServer = http.createServer(app);

// Parse requests of content-type - application/json.
app.use(express.json());

// Add CORS suport.
app.use(cors());
app.use(express.urlencoded({ extended: true }));

require("./src/routes/user.routes.js")(express, app);
require("./src/routes/product.routes.js")(express, app);
require("./src/routes/shoppingCart.routes.js")(express, app);
require("./src/routes/cartItem.routes.js")(express, app);
require("./src/routes/review.routes.js")(express, app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const subscriptionServer = SubscriptionServer.create({
  schema,
  execute,
  subscribe,
}, {
  server: httpServer,
  path: '/graphql',
});

const server = new ApolloServer({
  schema,
  context: () => ({ db }),
  plugins: [{
    async serverWillStart() {
      return {
        async drainServer() {
          subscriptionServer.close();
        }
      };
    }
  }],
});


(async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
  const PORT = 4001;
  httpServer.listen(PORT, () => console.log(`GraphQL server running on http://localhost:${PORT}/graphql`));
})();

// Set port, listen for requests.
const REST_PORT = 4000;
app.listen(REST_PORT, () => {
  console.log(`Server is running on port ${REST_PORT}.`);
});

module.exports = { app, ApolloServer: server }; //Export the app and ApolloServer for testing
