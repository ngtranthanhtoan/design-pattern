# Use Case: HTTP Client Factory System

## Problem Statement

Modern applications need to interact with multiple APIs and services, each with different:
- Base URLs and endpoints
- Authentication methods (API keys, JWT tokens, OAuth)
- Request/response formats and headers
- Timeout and retry configurations
- Error handling strategies
- Logging and monitoring requirements

Traditional OOP factory patterns require creating multiple client classes and factory classes, leading to:
- Complex inheritance hierarchies
- Difficult configuration management
- Hard-to-test client creation logic
- Inflexible client composition

## Solution: Factory Functions for HTTP Clients

Using factory functions, we can create a flexible HTTP client system where:
- Each client type is created by a simple function
- Configuration is handled through function parameters
- Client features can be composed using higher-order functions
- New client types can be added without modifying existing code
- Testing is simplified with pure function factories

## Implementation Highlights

### Key Features

1. **Multiple Client Types**: REST API, GraphQL, WebSocket, and custom protocol clients
2. **Flexible Authentication**: Support for various auth strategies
3. **Configuration Management**: Environment-specific client configurations
4. **Middleware Composition**: Request/response interceptors using function composition
5. **Error Handling**: Consistent error handling across all clients
6. **Performance Monitoring**: Built-in metrics and logging
7. **Type Safety**: Full TypeScript support with generic types

### Core Components

1. **Base Client Factory**: Creates basic HTTP clients with common configuration
2. **Specialized Factories**: REST, GraphQL, and protocol-specific client factories
3. **Authentication Factories**: Functions that add auth headers and token management
4. **Middleware Factories**: Higher-order functions for request/response processing
5. **Configuration Factories**: Environment and service-specific configurations
6. **Client Registry**: Dynamic client creation and management

### Real-World Applications

- **Microservices Communication**: Different clients for each service
- **Third-Party API Integration**: Stripe, AWS, Google APIs with different auth
- **Multi-Environment Deployment**: Dev, staging, production client configurations
- **A/B Testing**: Different client configurations for testing
- **Progressive Enhancement**: Fallback clients for different network conditions

## Benefits Demonstrated

1. **Simplicity**: No complex class hierarchies or factory classes
2. **Composability**: Easy to combine different client features
3. **Configuration**: Clean separation of client configuration from business logic
4. **Testing**: Each factory function can be tested independently
5. **Performance**: Lightweight client creation with minimal overhead
6. **Type Safety**: Full TypeScript support with proper type inference
7. **Flexibility**: Easy to add new client types and configurations

## Usage Example

```typescript
// Create different client types
const apiClient = createRestClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000
});

const authClient = createAuthenticatedClient(apiClient, {
  type: 'jwt',
  token: 'your-jwt-token'
});

const monitoredClient = withRequestLogging(
  withRetry(authClient, { maxRetries: 3 }),
  logger
);

// Use the composed client
const response = await monitoredClient.get('/users');
```

This use case demonstrates how functional factory patterns can create a more maintainable and flexible HTTP client system compared to traditional OOP approaches, with better composability and easier testing. 