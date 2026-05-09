import { PrismaClient } from '@prisma/client';
import { TransactionMapper } from '../../src/mappings/TransactionMapper';
import { mockTransaction, mockPaymentOperation } from '../mocks/stellarMocks';

// Mock Prisma
const mockPrisma = {
  financialTransaction: {
    create: jest.fn(),
  },
} as unknown as PrismaClient;

describe('TransactionMapper', () => {
  let transactionMapper: TransactionMapper;

  beforeEach(() => {
    transactionMapper = new TransactionMapper(mockPrisma);
    jest.clearAllMocks();
  });

  describe('mapTransaction', () => {
    it('should map a payment transaction correctly', async () => {
      const mockTx = mockTransaction();
      mockTx.operations = jest.fn().mockResolvedValue({
        records: [mockPaymentOperation()]
      });

      const expectedData = {
        transactionHash: mockTx.hash,
        ledgerSequence: BigInt(mockTx.ledger),
        sourceAccount: mockTx.source_account,
        fee: mockTx.fee_charged.toString(),
        blockTimestamp: new Date(mockTx.created_at),
        operationType: 'PAYMENT',
        destinationAccount: 'GDESTINATION...',
        assetCode: 'XLM',
        assetIssuer: null,
        amount: '100.0000000'
      };

      (mockPrisma.financialTransaction.create as jest.Mock).mockResolvedValue({
        id: 'test-id',
        ...expectedData
      });

      const result = await transactionMapper.mapTransaction(mockTx);

      expect(mockPrisma.financialTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining(expectedData)
      });
      expect(result).toHaveLength(1);
    });

    it('should handle contract operations', async () => {
      const mockTx = mockTransaction();
      const contractOperation = {
        type: 'invoke_host_function',
        source_account: 'GSOURCE...',
        contract_id: 'CCONTRACT...',
        function: 'transfer'
      };

      mockTx.operations = jest.fn().mockResolvedValue({
        records: [contractOperation]
      });

      await transactionMapper.mapTransaction(mockTx);

      expect(mockPrisma.financialTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          operationType: 'INVOKE_HOST_FUNCTION',
          contractId: 'CCONTRACT...',
          contractFunction: 'transfer'
        })
      });
    });
  });
});