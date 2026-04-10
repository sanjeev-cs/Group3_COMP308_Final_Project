import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';

import connectDB from './config/db.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import { getAuthContext } from './middleware/auth.js';

const PORT = process.env.PORT || 4000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const SUBSCRIPTIONS_URL = SERVER_URL.replace(/^http/i, 'ws');

await connectDB();

const app = express();
const httpServer = http.createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

app.use(
  '/graphql',
  cors({
    origin: [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'https://group3-comp308-final-project-1.onrender.com',
    ].filter(Boolean),
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: getAuthContext,
  }),
);

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

httpServer.listen(PORT, () => {
  console.log(`Server ready at ${SERVER_URL}/graphql`);
  console.log(`Subscriptions ready at ${SUBSCRIPTIONS_URL}/graphql`);
});
