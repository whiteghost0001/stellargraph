import { Server, Horizon } from '@stellar/stellar-sdk';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { TransactionMapper } from '../mappings/TransactionMapper';
import { ContractEventMapper } from '../mappings/ContractEventMapper';
import { AuditEngine } from '../services/AuditEngine';
import { NetworkConfig } from '../config/NetworkConfig';

export class StellarIndexer {
  private server: Server;
  private prisma: PrismaClient;
  private transactionMapper: TransactionMapper;
  private contractEventMapper: ContractEventMapper;
  private auditEngine: AuditEngine;
  private isRunning: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.prisma = new PrismaClient();
    this.server = new Server(NetworkConfig.getHorizonUrl());
    this.transactionMapper = new TransactionMapper(this.prisma);
    this.contractEventMapper = new ContractEventMapper(this.prisma);
    this.auditEngine = new AuditEngine(this.prisma);
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing StellarGraph Indexer...');
      
      // Test connection to Stellar network
      await this.server.ledgers().limit(1).call();
      logger.info('Connected to Stellar network successfully');

      // Initialize database connection
      await this.prisma.$connect();
      logger.info('Connected to database successfully');

      logger.info('StellarGraph Indexer initialized');
    } catch (error) {
      logger.error('Failed to initialize StellarGraph Indexer:', error);
      throw error;
    }
  }

  async startIndexing(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Indexer is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting indexing process...');

    // Get the last processed ledger or start from latest
    const cursor = await this.getLastProcessedLedger();
    let currentCursor = cursor;

    const poll = async () => {
      try {
        const transactions = await this.server
          .transactions()
          .cursor(currentCursor)
          .limit(parseInt(process.env.BATCH_SIZE || '100'))
          .order('asc')
          .call();

        if (transactions.records.length > 0) {
          logger.info(`Processing ${transactions.records.length} transactions`);
          
          for (const transaction of transactions.records) {
            await this.processTransaction(transaction);
            currentCursor = transaction.paging_token;
          }

          // Update cursor
          await this.updateCursor(currentCursor);
        }

      } catch (error) {
        logger.error('Error during polling:', error);
      }

      if (this.isRunning) {
        this.pollingInterval = setTimeout(poll, parseInt(process.env.POLLING_INTERVAL || '5000'));
      }
    };

    // Start polling
    poll();
  }

  async stop(): Promise<void> {
    logger.info('Stopping indexer...');
    this.isRunning = false;
    
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }

    await this.prisma.$disconnect();
    logger.info('Indexer stopped');
  }

  private async processTransaction(transaction: Horizon.ServerApi.TransactionRecord): Promise<void> {
    try {
      // Map and store the transaction
      const mappedTransaction = await this.transactionMapper.mapTransaction(transaction);
      
      // Process contract events if present
      if (transaction.successful) {
        await this.contractEventMapper.processContractEvents(transaction);
      }

      // Run audit checks
      await this.auditEngine.auditTransaction(mappedTransaction);

      logger.debug(`Processed transaction: ${transaction.hash}`);
    } catch (error) {
      logger.error(`Failed to process transaction ${transaction.hash}:`, error);
    }
  }

  private async getLastProcessedLedger(): Promise<string> {
    try {
      const cursor = await this.prisma.indexingCursor.findUnique({
        where: { name: 'main_indexer' }
      });

      if (cursor) {
        return cursor.lastProcessedLedger.toString();
      }

      // If no cursor exists, start from latest or configured start ledger
      const startLedger = process.env.START_LEDGER || 'latest';
      if (startLedger === 'latest') {
        const latestLedger = await this.server.ledgers().limit(1).order('desc').call();
        return latestLedger.records[0].paging_token;
      }

      return startLedger;
    } catch (error) {
      logger.error('Failed to get last processed ledger:', error);
      throw error;
    }
  }

  private async updateCursor(cursor: string): Promise<void> {
    try {
      await this.prisma.indexingCursor.upsert({
        where: { name: 'main_indexer' },
        update: { 
          lastProcessedLedger: BigInt(cursor),
          updatedAt: new Date()
        },
        create: {
          name: 'main_indexer',
          lastProcessedLedger: BigInt(cursor)
        }
      });
    } catch (error) {
      logger.error('Failed to update cursor:', error);
    }
  }
}