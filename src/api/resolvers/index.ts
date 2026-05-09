import { PrismaClient } from '@prisma/client';

interface Context {
  prisma: PrismaClient;
}

export const resolvers = {
  Query: {
    transactions: async (
      _: any,
      args: {
        limit?: number;
        offset?: number;
        sourceAccount?: string;
        assetCode?: string;
        flagged?: boolean;
      },
      context: Context
    ) => {
      const where: any = {};
      
      if (args.sourceAccount) {
        where.sourceAccount = args.sourceAccount;
      }
      
      if (args.assetCode) {
        where.assetCode = args.assetCode;
      }
      
      if (args.flagged !== undefined) {
        where.auditLogs = {
          some: {
            flagged: args.flagged
          }
        };
      }

      return context.prisma.financialTransaction.findMany({
        where,
        take: args.limit || 50,
        skip: args.offset || 0,
        orderBy: {
          blockTimestamp: 'desc'
        },
        include: {
          auditLogs: true
        }
      });
    },

    auditLogs: async (
      _: any,
      args: {
        limit?: number;
        offset?: number;
        severity?: string;
        flagged?: boolean;
      },
      context: Context
    ) => {
      const where: any = {};
      
      if (args.severity) {
        where.severity = args.severity;
      }
      
      if (args.flagged !== undefined) {
        where.flagged = args.flagged;
      }

      return context.prisma.auditLog.findMany({
        where,
        take: args.limit || 50,
        skip: args.offset || 0,
        orderBy: {
          createdAt: 'desc'
        }
      });
    },

    liquidityPoolSwaps: async (
      _: any,
      args: {
        limit?: number;
        offset?: number;
        poolId?: string;
      },
      context: Context
    ) => {
      const where: any = {};
      
      if (args.poolId) {
        where.poolId = args.poolId;
      }

      return context.prisma.liquidityPoolSwap.findMany({
        where,
        take: args.limit || 50,
        skip: args.offset || 0,
        orderBy: {
          blockTimestamp: 'desc'
        }
      });
    }
  }
};