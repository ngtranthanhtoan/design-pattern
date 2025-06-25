# F6 - Builder Pattern - Fluent Interfaces: Use Cases

## Primary Use Case: Database Connection Builder

### Problem Statement
Modern applications need to configure database connections with multiple parameters including host, port, database name, authentication, SSL settings, connection pooling, retry logic, and environment-specific configurations. Traditional approaches using object literals or configuration files become unwieldy when dealing with complex configurations that need to be built dynamically or have conditional parameters.

### Solution Approach
Implement a fluent interface builder that allows step-by-step construction of database connection configurations with type safety, immutability, and composability. The builder provides a natural, readable API for creating complex configurations while ensuring all required parameters are provided and validated.

### Implementation Benefits
- **Type Safety**: Compile-time validation of required fields and parameter types
- **Immutability**: Each step creates a new configuration object without side effects
- **Composability**: Base configurations can be extended for different environments
- **Readability**: Method chaining creates self-documenting configuration code
- **Validation**: Built-in validation ensures configuration integrity

## Real-World Use Cases

### 1. **API Client Configuration Builder**
**Problem**: Configure HTTP clients with authentication, retry policies, timeouts, and middleware
**Solution**: Fluent builder for creating axios/fetch clients with complex configurations
```typescript
const apiClient = createHttpClientBuilder()
  .withBaseUrl('https://api.example.com')
  .withAuth(bearerToken('abc123'))
  .withRetry(3, exponentialBackoff())
  .withTimeout(5000)
  .withMiddleware(loggingMiddleware, rateLimitMiddleware)
  .build();
```

### 2. **Test Data Factory Builder**
**Problem**: Create test fixtures with controlled variations for comprehensive testing
**Solution**: Builder pattern for generating test data with defaults and overrides
```typescript
const testUser = createUserBuilder()
  .withName('John Doe')
  .withEmail('john@example.com')
  .withAge(25)
  .withRoles(['user', 'admin'])
  .withPreferences(defaultPreferences)
  .build();
```

### 3. **Query Builder for Type-Safe Database Queries**
**Problem**: Construct complex database queries with joins, filters, and sorting
**Solution**: Fluent interface for building SQL queries with compile-time safety
```typescript
const query = createQueryBuilder('users')
  .select(['id', 'name', 'email'])
  .where('active', '=', true)
  .join('profiles', 'users.id', 'profiles.user_id')
  .orderBy('created_at', 'desc')
  .limit(10)
  .build();
```

### 4. **Form Validation Rule Builder**
**Problem**: Create complex validation rules with conditional logic and custom validators
**Solution**: Builder for constructing validation schemas with fluent API
```typescript
const validation = createValidationBuilder()
  .field('email')
    .required()
    .email()
    .maxLength(255)
  .field('password')
    .required()
    .minLength(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .field('age')
    .optional()
    .number()
    .min(18)
    .max(120)
  .build();
```

### 5. **CSS-in-JS Style Builder**
**Problem**: Create complex CSS styles programmatically with theme integration
**Solution**: Builder for constructing style objects with responsive design and themes
```typescript
const buttonStyle = createStyleBuilder()
  .withBase({
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  })
  .withTheme(theme => ({
    backgroundColor: theme.colors.primary,
    color: theme.colors.white
  }))
  .withHover({
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  })
  .withResponsive({
    mobile: { padding: '8px 16px' },
    tablet: { padding: '10px 20px' }
  })
  .build();
```

### 6. **Configuration Management Builder**
**Problem**: Build application configurations with environment-specific overrides
**Solution**: Builder for creating configuration objects with hierarchical settings
```typescript
const config = createConfigBuilder()
  .withDatabase({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME
  })
  .withRedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  })
  .withLogging({
    level: process.env.LOG_LEVEL || 'info',
    format: 'json'
  })
  .withFeatureFlags({
    enableNewFeature: process.env.ENABLE_NEW_FEATURE === 'true',
    enableBetaFeatures: false
  })
  .build();
```

## Implementation Patterns

### 1. **Immutable Builder Pattern**
Each method call returns a new builder instance:
```typescript
const builder1 = createBuilder().withHost('localhost');
const builder2 = builder1.withPort(3000); // builder1 unchanged
const config = builder2.build();
```

### 2. **Conditional Building**
Apply configurations based on conditions:
```typescript
const config = createBuilder()
  .withHost('localhost')
  .when(isProd, b => b.withSsl(true))
  .when(isDev, b => b.withDebug(true))
  .build();
```

### 3. **Composition and Extension**
Extend base configurations:
```typescript
const baseConfig = createBuilder()
  .withHost('localhost')
  .withPort(3000);

const prodConfig = baseConfig
  .withSsl(true)
  .withConnectionPool(20)
  .build();
```

### 4. **Validation Integration**
Validate during construction:
```typescript
const result = createBuilder()
  .withHost('localhost')
  .withPort(3000)
  .buildWithValidation(); // Returns Either<Error[], Config>
```

## Architecture Benefits

### **Separation of Concerns**
- Configuration logic separated from business logic
- Validation separated from construction
- Environment-specific logic isolated

### **Maintainability**
- Easy to add new configuration options
- Type-safe refactoring
- Clear documentation through method names

### **Testability**
- Pure functions are easy to test
- Builders can be partially applied for test fixtures
- Immutable objects simplify test assertions

### **Reusability**
- Base configurations can be shared
- Builders can be composed and extended
- Common patterns can be abstracted

## Performance Considerations

### **Structural Sharing**
Use libraries like Immer for efficient immutable updates:
```typescript
const optimizedBuilder = createBuilder()
  .withStructuralSharing(true)
  .withHost('localhost');
```

### **Lazy Evaluation**
Defer expensive operations until build():
```typescript
const lazyBuilder = createBuilder()
  .withLazyValidation()
  .withComputed('connectionString', config => 
    `postgres://${config.host}:${config.port}/${config.database}`
  );
```

### **Memoization**
Cache builder results for expensive configurations:
```typescript
const memoizedBuilder = memoize(createBuilder);
const config1 = memoizedBuilder().withHost('localhost').build();
const config2 = memoizedBuilder().withHost('localhost').build(); // Cached
```

This use case demonstrates how the Builder Pattern with Fluent Interfaces provides a powerful, type-safe way to construct complex objects while maintaining code readability, immutability, and composability in functional programming contexts. 