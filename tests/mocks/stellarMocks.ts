export const mockTransaction = () => ({
  hash: 'test-transaction-hash',
  ledger: '12345',
  source_account: 'GSOURCE...',
  fee_charged: '100',
  created_at: '2024-01-01T00:00:00Z',
  successful: true,
  operations: jest.fn()
});

export const mockPaymentOperation = () => ({
  type: 'payment',
  source_account: 'GSOURCE...',
  to: 'GDESTINATION...',
  asset_type: 'native',
  amount: '100.0000000'
});

export const mockPathPaymentOperation = () => ({
  type: 'path_payment_strict_receive',
  source_account: 'GSOURCE...',
  to: 'GDESTINATION...',
  asset_type: 'credit_alphanum4',
  asset_code: 'USDC',
  asset_issuer: 'GISSUER...',
  amount: '50.0000000'
});