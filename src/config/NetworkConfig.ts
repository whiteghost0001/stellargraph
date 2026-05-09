export class NetworkConfig {
  static getHorizonUrl(): string {
    const network = process.env.STELLAR_NETWORK || 'testnet';
    
    if (process.env.STELLAR_HORIZON_URL) {
      return process.env.STELLAR_HORIZON_URL;
    }

    switch (network) {
      case 'mainnet':
        return 'https://horizon.stellar.org';
      case 'testnet':
        return 'https://horizon-testnet.stellar.org';
      default:
        throw new Error(`Unknown network: ${network}`);
    }
  }

  static getSorobanRpcUrl(): string {
    const network = process.env.STELLAR_NETWORK || 'testnet';
    
    if (process.env.STELLAR_RPC_URL) {
      return process.env.STELLAR_RPC_URL;
    }

    switch (network) {
      case 'mainnet':
        return 'https://soroban-rpc.mainnet.stellar.gateway.fm';
      case 'testnet':
        return 'https://soroban-testnet.stellar.org';
      default:
        throw new Error(`Unknown network: ${network}`);
    }
  }

  static getNetworkPassphrase(): string {
    const network = process.env.STELLAR_NETWORK || 'testnet';
    
    switch (network) {
      case 'mainnet':
        return 'Public Global Stellar Network ; September 2015';
      case 'testnet':
        return 'Test SDF Network ; September 2015';
      default:
        throw new Error(`Unknown network: ${network}`);
    }
  }
}