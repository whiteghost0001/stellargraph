import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export class GraphQLServer {
  private app: express.Application;
  private server: ApolloServer;
  private prisma: PrismaClient;

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    
    this.server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        prisma: this.prisma,
        user: req.user // Add authentication context if needed
      }),
    });
  }

  async start(): Promise<void> {
    try {
      await this.server.start();
      this.server.applyMiddleware({ app: this.app, path: '/graphql' });

      const port = process.env.GRAPHQL_PORT || 4000;
      
      this.app.listen(port, () => {
        logger.info(`GraphQL server running at http://localhost:${port}${this.server.graphqlPath}`);
      });
    } catch (error) {
      logger.error('Failed to start GraphQL server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.server.stop();
      await this.prisma.$disconnect();
      logger.info('GraphQL server stopped');
    } catch (error) {
      logger.error('Failed to stop GraphQL server:', error);
    }
  }
}