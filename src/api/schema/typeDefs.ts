import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type FinancialTransaction {
    id: ID!
    transactionHash: String!
    ledgerSequence: String!
    sourceAccount: String!
    destinationAccount: String
    assetCode: String!
    assetIssuer: String
    amount: String!
    fee: String!
    operationType: TransactionType!
    contractId: String
    contractFunction: String
    blockTimestamp: String!
    auditLogs: [AuditLog!]!
  }

  type AuditLog {
    id: ID!
    auditType: AuditType!
    severity: AuditSeverity!
    description: String!
    riskScore: Float
    flagged: Boolean!
    investigated: Boolean!
    createdAt: String!
  }

  type LiquidityPoolSwap {
    id: ID!
    transactionHash: String!
    poolId: String!
    assetACode: String!
    assetBCode: String!
    amountIn: String!
    amountOut: String!
    swapper: String!
    blockTimestamp: String!
  }

  enum TransactionType {
    PAYMENT
    PATH_PAYMENT_STRICT_RECEIVE
    PATH_PAYMENT_STRICT_SEND
    INVOKE_HOST_FUNCTION
  }

  enum AuditType {
    LARGE_TRANSACTION
    SUSPICIOUS_PATTERN
    RAPID_TRANSACTIONS
    HIGH_RISK_ACCOUNT
  }

  enum AuditSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type Query {
    transactions(
      limit: Int = 50
      offset: Int = 0
      sourceAccount: String
      assetCode: String
      flagged: Boolean
    ): [FinancialTransaction!]!
    
    auditLogs(
      limit: Int = 50
      offset: Int = 0
      severity: AuditSeverity
      flagged: Boolean
    ): [AuditLog!]!
    
    liquidityPoolSwaps(
      limit: Int = 50
      offset: Int = 0
      poolId: String
    ): [LiquidityPoolSwap!]!
  }
`;