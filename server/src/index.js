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

// Connect to MongoDB
await connectDB();

// Create Express app and HTTP server
const app = express();
const httpServer = http.createServer(app);

// Build executable schema for both HTTP and WS
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Set up WebSocket server for GraphQL subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({ schema }, wsServer);

// Initialize Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    // Graceful shutdown for HTTP
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Graceful shutdown for WebSocket
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

// Apply middleware
app.use(
  '/graphql',
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: getAuthContext,
  })
);

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at ${process.env.CLIENT_URL}`);
  console.log(`🔌 Subscriptions ready at ${process.env.CLIENT_URL.replace('http', 'ws')}/graphql`);
});
