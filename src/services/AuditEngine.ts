import { PrismaClient, AuditType, AuditSeverity } from '@prisma/client';
import { logger } from '../utils/logger';

export class AuditEngine {
  constructor(private prisma: PrismaClient) {}

  async auditTransaction(transaction: any): Promise<void> {
    try {
      const auditChecks = [
        this.checkLargeTransaction(transaction),
        this.checkRapidTransactions(transaction),
        this.checkSuspiciousPatterns(transaction),
        this.checkHighRiskAccount(transaction),
        this.checkUnusualAsset(transaction)
      ];

      await Promise.all(auditChecks);
    } catch (error) {
      logger.error(`Audit failed for transaction ${transaction.transactionHash}:`, error);
    }
  }

  private async checkLargeTransaction(transaction: any): Promise<void> {
    const amount = parseFloat(transaction.amount);
    const threshold = parseFloat(process.env.LARGE_TRANSACTION_THRESHOLD || '10000');

    if (amount > threshold) {
      await this.createAuditLog(transaction, {
        auditType: AuditType.LARGE_TRANSACTION,
        severity: AuditSeverity.MEDIUM,
        description: `Large transaction detected: ${amount} ${transaction.assetCode}`,
        riskScore: Math.min(amount / threshold, 10),
        flagged: amount > threshold * 5
      });
    }
  }

  private async checkRapidTransactions(transaction: any): Promise<void> {
    const recentCount = await this.prisma.financialTransaction.count({
      where: {
        sourceAccount: transaction.sourceAccount,
        blockTimestamp: {
          gte: new Date(Date.now() - 60000) // Last minute
        }
      }
    });

    if (recentCount > 10) {
      await this.createAuditLog(transaction, {
        auditType: AuditType.RAPID_TRANSACTIONS,
        severity: AuditSeverity.HIGH,
        description: `Rapid transactions detected: ${recentCount} in last minute`,
        riskScore: recentCount / 2,
        flagged: recentCount > 20
      });
    }
  }
}
  private async checkSuspiciousPatterns(transaction: any): Promise<void> {
    // Check for round-trip transactions
    const roundTrip = await this.prisma.financialTransaction.findFirst({
      where: {
        sourceAccount: transaction.destinationAccount,
        destinationAccount: transaction.sourceAccount,
        amount: transaction.amount,
        blockTimestamp: {
          gte: new Date(Date.now() - 300000) // Last 5 minutes
        }
      }
    });

    if (roundTrip) {
      await this.createAuditLog(transaction, {
        auditType: AuditType.SUSPICIOUS_PATTERN,
        severity: AuditSeverity.HIGH,
        description: 'Round-trip transaction pattern detected',
        riskScore: 8,
        flagged: true
      });
    }
  }

  private async checkHighRiskAccount(transaction: any): Promise<void> {
    // Check if account has been flagged before
    const previousFlags = await this.prisma.auditLog.count({
      where: {
        transaction: {
          OR: [
            { sourceAccount: transaction.sourceAccount },
            { destinationAccount: transaction.sourceAccount }
          ]
        },
        flagged: true
      }
    });

    if (previousFlags > 5) {
      await this.createAuditLog(transaction, {
        auditType: AuditType.HIGH_RISK_ACCOUNT,
        severity: AuditSeverity.CRITICAL,
        description: `High-risk account detected: ${previousFlags} previous flags`,
        riskScore: 10,
        flagged: true
      });
    }
  }

  private async checkUnusualAsset(transaction: any): Promise<void> {
    // Check for transactions with unusual or new assets
    if (transaction.assetCode !== 'XLM') {
      const assetHistory = await this.prisma.financialTransaction.count({
        where: {
          assetCode: transaction.assetCode,
          assetIssuer: transaction.assetIssuer
        }
      });

      if (assetHistory < 10) {
        await this.createAuditLog(transaction, {
          auditType: AuditType.UNUSUAL_ASSET,
          severity: AuditSeverity.MEDIUM,
          description: `Transaction with unusual asset: ${transaction.assetCode}`,
          riskScore: 5,
          flagged: false
        });
      }
    }
  }

  private async createAuditLog(transaction: any, auditData: any): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          transactionId: transaction.id,
          ...auditData,
          metadata: {
            transactionHash: transaction.transactionHash,
            amount: transaction.amount,
            assetCode: transaction.assetCode
          }
        }
      });

      if (auditData.flagged) {
        logger.warn(`Transaction flagged: ${transaction.transactionHash} - ${auditData.description}`);
      }
    } catch (error) {
      logger.error('Failed to create audit log:', error);
    }
  }
}