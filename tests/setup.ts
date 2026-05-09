// Global test setup
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    financialTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    liquidityPoolSwap: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    contractEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    indexingCursor: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  })),
}));

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/stellargraph_test';
process.env.NODE_ENV = 'test';