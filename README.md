# StellarGraph

A high-performance blockchain indexer specifically designed for auditing financial movements on the Stellar/Soroban network. StellarGraph provides comprehensive tracking of asset transfers, liquidity pool swaps, and contract-specific events with built-in audit capabilities.

## 🚀 Features

- **Real-time Indexing**: Continuously monitors Stellar network for new transactions
- **Comprehensive Audit Engine**: Automated detection of suspicious patterns and large transactions
- **Soroban Contract Support**: Full support for Soroban smart contract events
- **Liquidity Pool Tracking**: Specialized tracking for DEX swaps and liquidity operations
- **GraphQL API**: Flexible query interface for accessing indexed data
- **Risk Assessment**: Built-in risk scoring and flagging system
- **Clean Architecture**: Modular design following clean architecture principles

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **API**: GraphQL with Apollo Server
- **Blockchain SDK**: Stellar SDK
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
stellargraph/
├── src/
│   ├── api/                    # GraphQL API layer
│   │   ├── resolvers/         # GraphQL resolvers
│   │   └── schema/            # GraphQL schema definitions
│   ├── config/                # Network and environment configuration
│   ├── ingestor/              # Stellar network data ingestion
│   ├── mappings/              # Transaction and event mappers
│   ├── services/              # Business logic services
│   └── utils/                 # Utility functions
├── prisma/                    # Database schema and migrations
├── tests/                     # Unit and integration tests
├── config/                    # Environment-specific configurations
└── docker-compose.yml         # Development environment setup
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- PostgreSQL (if running locally)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stellargraph
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start the indexer**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `STELLAR_NETWORK` | Network to index (testnet/mainnet) | testnet |
| `STELLAR_HORIZON_URL` | Horizon server URL | - |
| `STELLAR_RPC_URL` | Soroban RPC server URL | - |
| `BATCH_SIZE` | Transactions per batch | 100 |
| `POLLING_INTERVAL` | Polling interval in ms | 5000 |
| `START_LEDGER` | Starting ledger sequence | latest |

### Network Configuration

The indexer supports both Stellar Testnet and Mainnet. Configure the network in your `.env` file:

```env
# For Testnet
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_RPC_URL=https://soroban-testnet.stellar.org

# For Mainnet
STELLAR_NETWORK=mainnet
STELLAR_HORIZON_URL=https://horizon.stellar.org
STELLAR_RPC_URL=https://soroban-rpc.mainnet.stellar.gateway.fm
```

## 📊 Database Schema

### Core Tables

- **FinancialTransaction**: All indexed transactions with metadata
- **AuditLog**: Audit findings and risk assessments
- **LiquidityPoolSwap**: DEX swap operations
- **ContractEvent**: Soroban contract events
- **IndexingCursor**: Indexing progress tracking

## 🔍 Audit Features

The built-in audit engine automatically detects:

- Large transactions above configurable thresholds
- Rapid transaction patterns from single accounts
- Round-trip transaction patterns
- High-risk account interactions
- Unusual asset transfers
- Liquidity pool manipulation attempts

## 📡 GraphQL API

Access the GraphQL playground at `http://localhost:4000/graphql`

### Example Queries

```graphql
# Get recent transactions
query {
  transactions(limit: 10) {
    transactionHash
    sourceAccount
    amount
    assetCode
    auditLogs {
      auditType
      severity
      flagged
    }
  }
}

# Get flagged audit logs
query {
  auditLogs(flagged: true, severity: HIGH) {
    description
    riskScore
    createdAt
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- TransactionMapper.test.ts
```

## 🐳 Docker Development

The project includes a complete Docker development environment:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f indexer

# Stop services
docker-compose down
```

## 📈 Performance Considerations

- **Batch Processing**: Configurable batch sizes for optimal throughput
- **Database Indexing**: Optimized indexes for common query patterns
- **Connection Pooling**: Efficient database connection management
- **Caching**: Redis caching for frequently accessed data

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the GraphQL schema for API details
- Visit [stellargraph.dev](https://stellargraph.dev) for more resources

## 🔮 Roadmap

- [ ] Real-time WebSocket subscriptions
- [ ] Advanced ML-based fraud detection
- [ ] Multi-network support (other Stellar-based networks)
- [ ] Enhanced visualization dashboard
- [ ] Automated compliance reporting