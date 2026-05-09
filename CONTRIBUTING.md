# Contributing to StellarGraph

Thank you for your interest in contributing to StellarGraph! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- Git
- Basic knowledge of TypeScript, Stellar SDK, and blockchain concepts

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Copy environment file: `cp .env.example .env`
5. Start development environment: `docker-compose up -d`
6. Run migrations: `npm run db:migrate`

## 📋 Development Guidelines

### Code Standards

- **Language**: TypeScript with strict mode enabled
- **Formatting**: Use Prettier with the provided configuration
- **Linting**: ESLint rules must pass
- **Testing**: Minimum 80% code coverage for new features
- **Documentation**: JSDoc comments for all public methods

### Architecture Principles

- **Clean Architecture**: Follow domain-driven design principles
- **Separation of Concerns**: Keep business logic separate from infrastructure
- **Dependency Injection**: Use constructor injection for dependencies
- **Error Handling**: Comprehensive error handling with proper logging
- **Performance**: Consider performance implications of all changes

### Naming Conventions

- **Files**: PascalCase for classes, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Database**: snake_case for columns, PascalCase for models
- **GraphQL**: camelCase for fields, PascalCase for types

## 🔧 Adding New Indexers

### 1. Create Mapper Class

```typescript
// src/mappings/YourFeatureMapper.ts
export class YourFeatureMapper {
  constructor(private prisma: PrismaClient) {}
  
  async mapYourFeature(data: any): Promise<any> {
    // Implementation
  }
}
```

### 2. Update Database Schema

```prisma
// prisma/schema.prisma
model YourFeature {
  id        String   @id @default(cuid())
  // Add your fields
  createdAt DateTime @default(now())
  
  @@index([relevantField])
}
```

### 3. Add GraphQL Schema

```typescript
// src/api/schema/typeDefs.ts
type YourFeature {
  id: ID!
  // Add your fields
}

extend type Query {
  yourFeatures: [YourFeature!]!
}
```

### 4. Implement Resolver

```typescript
// src/api/resolvers/index.ts
yourFeatures: async (_, args, context) => {
  return context.prisma.yourFeature.findMany();
}
```

### 5. Add Tests

```typescript
// tests/mappings/YourFeatureMapper.test.ts
describe('YourFeatureMapper', () => {
  // Add comprehensive tests
});
```

## 🧪 Testing Guidelines

### Test Structure

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete workflows

### Test Requirements

- All new features must include tests
- Bug fixes must include regression tests
- Tests should be deterministic and fast
- Use meaningful test descriptions

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- YourFeatureMapper.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Pull Request Process

### Before Submitting

1. **Code Quality**
   - [ ] All tests pass
   - [ ] Linting passes
   - [ ] Code coverage meets requirements
   - [ ] No TypeScript errors

2. **Documentation**
   - [ ] README updated if needed
   - [ ] API documentation updated
   - [ ] Code comments added for complex logic

3. **Database Changes**
   - [ ] Migration scripts included
   - [ ] Schema changes documented
   - [ ] Backward compatibility considered

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer approval required
3. **Testing**: Reviewer should test the changes locally
4. **Documentation**: Ensure documentation is accurate and complete

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Ubuntu 20.04]
- Node.js version: [e.g., 18.17.0]
- Network: [testnet/mainnet]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## 🔒 Security

### Security Guidelines

- Never commit sensitive information (keys, passwords, etc.)
- Use environment variables for configuration
- Validate all inputs
- Follow OWASP security guidelines
- Report security vulnerabilities privately

### Reporting Security Issues

Please report security vulnerabilities to [security@example.com] rather than creating public issues.

## 📚 Resources

### Documentation

- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Stellar Network

- [Stellar Developer Portal](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Horizon API Reference](https://developers.stellar.org/api)

## 🎯 Contribution Areas

We welcome contributions in these areas:

- **New Audit Rules**: Additional fraud detection patterns
- **Performance Optimization**: Database queries, indexing strategies
- **API Enhancements**: New GraphQL queries and mutations
- **Documentation**: Tutorials, examples, API documentation
- **Testing**: Additional test coverage, test utilities
- **Monitoring**: Metrics, alerting, health checks

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Discord**: [Join our Discord server] for real-time chat
- **Email**: [maintainers@example.com] for private inquiries

Thank you for contributing to StellarGraph! 🚀