import { Horizon } from '@stellar/stellar-sdk';
import { PrismaClient, TransactionType } from '@prisma/client';
import { logger } from '../utils/logger';

export class TransactionMapper {
  constructor(private prisma: PrismaClient) {}

  async mapTransaction(transaction: Horizon.ServerApi.TransactionRecord): Promise<any> {
    try {
      // Get transaction operations
      const operations = await transaction.operations();
      
      const mappedTransactions = [];

      for (const operation of operations.records) {
        const mappedTx = await this.mapOperation(transaction, operation);
        if (mappedTx) {
          mappedTransactions.push(mappedTx);
        }
      }

      return mappedTransactions;
    } catch (error) {
      logger.error(`Failed to map transaction ${transaction.hash}:`, error);
      throw error;
    }
  }

  private async mapOperation(
    transaction: Horizon.ServerApi.TransactionRecord,
    operation: Horizon.ServerApi.OperationRecord
  ): Promise<any | null> {
    try {
      const baseData = {
        transactionHash: transaction.hash,
        ledgerSequence: BigInt(transaction.ledger),
        sourceAccount: operation.source_account || transaction.source_account,
        fee: transaction.fee_charged.toString(),
        blockTimestamp: new Date(transaction.created_at),
        operationType: this.mapOperationType(operation.type),
      };

      let specificData = {};

      switch (operation.type) {
        case 'payment':
          specificData = await this.mapPaymentOperation(operation as Horizon.ServerApi.PaymentOperationRecord);
          break;
        case 'path_payment_strict_receive':
        case 'path_payment_strict_send':
          specificData = await this.mapPathPaymentOperation(operation as any);
          break;
        case 'invoke_host_function':
          specificData = await this.mapContractOperation(operation as any);
          break;
        default:
          // For other operation types, store minimal data
          specificData = {
            destinationAccount: null,
            assetCode: 'XLM',
            assetIssuer: null,
            amount: '0'
          };
      }

      const financialTransaction = await this.prisma.financialTransaction.create({
        data: {
          ...baseData,
          ...specificData
        }
      });

      return financialTransaction;
    } catch (error) {
      logger.error(`Failed to map operation:`, error);
      return null;
    }
  }

  private async mapPaymentOperation(operation: Horizon.ServerApi.PaymentOperationRecord): Promise<any> {
    return {
      destinationAccount: operation.to,
      assetCode: operation.asset_type === 'native' ? 'XLM' : operation.asset_code,
      assetIssuer: operation.asset_type === 'native' ? null : operation.asset_issuer,
      amount: operation.amount
    };
  }

  private async mapPathPaymentOperation(operation: any): Promise<any> {
    return {
      destinationAccount: operation.to,
      assetCode: operation.asset_type === 'native' ? 'XLM' : operation.asset_code,
      assetIssuer: operation.asset_type === 'native' ? null : operation.asset_issuer,
      amount: operation.amount || operation.destination_amount
    };
  }

  private async mapContractOperation(operation: any): Promise<any> {
    // Extract contract details from Soroban operation
    const contractId = operation.contract_id || null;
    const contractFunction = operation.function || null;
    
    return {
      destinationAccount: null,
      assetCode: 'CONTRACT',
      assetIssuer: null,
      amount: '0',
      contractId,
      contractFunction,
      contractEvents: operation.events || null
    };
  }

  private mapOperationType(operationType: string): TransactionType {
    const typeMap: { [key: string]: TransactionType } = {
      'payment': TransactionType.PAYMENT,
      'path_payment_strict_receive': TransactionType.PATH_PAYMENT_STRICT_RECEIVE,
      'path_payment_strict_send': TransactionType.PATH_PAYMENT_STRICT_SEND,
      'create_account': TransactionType.CREATE_ACCOUNT,
      'account_merge': TransactionType.ACCOUNT_MERGE,
      'manage_sell_offer': TransactionType.MANAGE_OFFER,
      'manage_buy_offer': TransactionType.MANAGE_BUY_OFFER,
      'create_passive_sell_offer': TransactionType.CREATE_PASSIVE_SELL_OFFER,
      'set_options': TransactionType.SET_OPTIONS,
      'change_trust': TransactionType.CHANGE_TRUST,
      'allow_trust': TransactionType.ALLOW_TRUST,
      'manage_data': TransactionType.MANAGE_DATA,
      'bump_sequence': TransactionType.BUMP_SEQUENCE,
      'invoke_host_function': TransactionType.INVOKE_HOST_FUNCTION,
      'extend_footprint_ttl': TransactionType.EXTEND_FOOTPRINT_TTL,
      'restore_footprint': TransactionType.RESTORE_FOOTPRINT
    };

    return typeMap[operationType] || TransactionType.PAYMENT;
  }
}