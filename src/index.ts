import dotenv from 'dotenv';
import { StellarIndexer } from './ingestor/StellarIndexer';
import { GraphQLServer } from './api/GraphQLServer';
import { logger } from './utils/logger';
import { DatabaseService } from './services/DatabaseService';

// Load environment variables
dotenv.config();

async function main() {
  try {
    logger.info('Starting StellarGraph Indexer...');

    // Initialize database connection
    const dbService = new DatabaseService();
    await dbService.connect();

    // Initialize and start the indexer
    const indexer = new StellarIndexer();
    await indexer.initialize();

    // Start GraphQL API server
    const graphqlServer = new GraphQLServer();
    await graphqlServer.start();

    // Start indexing process
    indexer.startIndexing();

    logger.info('StellarGraph Indexer started successfully');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      await indexer.stop();
      await graphqlServer.stop();
      await dbService.disconnect();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start indexer:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});