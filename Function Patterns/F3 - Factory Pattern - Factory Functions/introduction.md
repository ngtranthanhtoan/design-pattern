# Factory Pattern - Factory Functions

## What is the Functional Factory Pattern?

The Factory pattern using factory functions replaces traditional factory classes with pure functions that create and configure objects. Instead of instantiating factory classes, we use functions that return configured objects based on parameters.

## Traditional vs Functional Approach

### Traditional OOP Factory Pattern
```typescript
interface Product {
  name: string;
  price: number;
}

abstract class ProductFactory {
  abstract createProduct(type: string): Product;
}

class ConcreteProductFactory extends ProductFactory {
  createProduct(type: string): Product {
    switch (type) {
      case 'book':
        return new Book('Sample Book', 29.99);
      case 'electronics':
        return new Electronics('Sample Device', 199.99);
      default:
        throw new Error('Unknown product type');
    }
  }
}

const factory = new ConcreteProductFactory();
const product = factory.createProduct('book');
```

### Functional Factory Pattern
```typescript
type Product = {
  name: string;
  price: number;
  category: string;
};

const createBook = (name: string, price: number): Product => ({
  name,
  price,
  category: 'book'
});

const createElectronics = (name: string, price: number): Product => ({
  name,
  price,
  category: 'electronics'
});

const productFactory = (type: string, name: string, price: number): Product => {
  const factories = {
    book: createBook,
    electronics: createElectronics
  };
  
  const factory = factories[type];
  if (!factory) {
    throw new Error(`Unknown product type: ${type}`);
  }
  
  return factory(name, price);
};
```

## Key Benefits

1. **Simplicity**: No classes or inheritance hierarchies
2. **Pure Functions**: Predictable output for given inputs
3. **Easy Testing**: Each factory function can be tested independently
4. **Composition**: Factory functions can be easily combined
5. **Type Safety**: Full TypeScript support with return type inference
6. **Performance**: No object instantiation overhead

## Pattern Structure

### Components
1. **Factory Function**: Pure function that creates objects
2. **Configuration Objects**: Parameter objects for complex configurations
3. **Factory Registry**: Map of factory functions for dynamic selection
4. **Composite Factories**: Functions that combine multiple factories
5. **Parameterized Factories**: Higher-order functions that return factory functions

### TypeScript Implementation
```typescript
// Basic factory function type
type Factory<T> = (...args: any[]) => T;

// Parameterized factory
type ParameterizedFactory<P, T> = (params: P) => T;

// Factory registry
type FactoryRegistry<T> = Record<string, Factory<T>>;

// Factory composition
const composeFactories = <T, U, V>(
  factory1: (input: T) => U,
  factory2: (input: U) => V
): ((input: T) => V) => {
  return (input: T) => factory2(factory1(input));
};
```

## Common Use Cases

### 1. Configuration Objects
```typescript
type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  ssl: boolean;
};

const createDevelopmentConfig = (): DatabaseConfig => ({
  host: 'localhost',
  port: 5432,
  database: 'dev_db',
  ssl: false
});

const createProductionConfig = (): DatabaseConfig => ({
  host: process.env.DB_HOST || 'prod-server',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'prod_db',
  ssl: true
});

const configFactory = (env: string): DatabaseConfig => {
  const factories = {
    development: createDevelopmentConfig,
    production: createProductionConfig
  };
  
  return factories[env] || createDevelopmentConfig();
};
```

### 2. HTTP Clients
```typescript
type HttpClient = {
  baseUrl: string;
  headers: Record<string, string>;
  timeout: number;
};

const createApiClient = (baseUrl: string): HttpClient => ({
  baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 5000
});

const createAuthenticatedClient = (baseUrl: string, token: string): HttpClient => ({
  ...createApiClient(baseUrl),
  headers: {
    ...createApiClient(baseUrl).headers,
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. UI Components
```typescript
type ButtonProps = {
  text: string;
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
};

const createPrimaryButton = (text: string): ButtonProps => ({
  text,
  variant: 'primary',
  size: 'medium',
  disabled: false
});

const createDangerButton = (text: string): ButtonProps => ({
  text,
  variant: 'danger',
  size: 'medium',
  disabled: false
});

const buttonFactory = (variant: string) => (text: string): ButtonProps => {
  const factories = {
    primary: createPrimaryButton,
    danger: createDangerButton
  };
  
  return factories[variant]?.(text) || createPrimaryButton(text);
};
```

### 4. Data Models
```typescript
type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
};

const createUser = (name: string, email: string): User => ({
  id: crypto.randomUUID(),
  name,
  email,
  role: 'user',
  createdAt: new Date()
});

const createAdminUser = (name: string, email: string): User => ({
  ...createUser(name, email),
  role: 'admin'
});

const userFactory = (role: string, name: string, email: string): User => {
  const factories = {
    admin: createAdminUser,
    user: createUser,
    guest: (n: string, e: string) => ({ ...createUser(n, e), role: 'guest' as const })
  };
  
  return factories[role]?.(name, email) || createUser(name, email);
};
```

### 5. Error Objects
```typescript
type AppError = {
  code: string;
  message: string;
  statusCode: number;
  timestamp: Date;
};

const createValidationError = (message: string): AppError => ({
  code: 'VALIDATION_ERROR',
  message,
  statusCode: 400,
  timestamp: new Date()
});

const createNotFoundError = (resource: string): AppError => ({
  code: 'NOT_FOUND',
  message: `${resource} not found`,
  statusCode: 404,
  timestamp: new Date()
});

const errorFactory = (type: string, message: string): AppError => {
  const factories = {
    validation: createValidationError,
    notFound: () => createNotFoundError(message),
    server: (msg: string) => ({
      code: 'SERVER_ERROR',
      message: msg,
      statusCode: 500,
      timestamp: new Date()
    })
  };
  
  return factories[type]?.(message) || factories.server(message);
};
```

## Advanced Patterns

### Factory Composition
```typescript
const withLogging = <T>(factory: Factory<T>, logger: (item: T) => void): Factory<T> => {
  return (...args: any[]) => {
    const result = factory(...args);
    logger(result);
    return result;
  };
};

const withValidation = <T>(
  factory: Factory<T>,
  validator: (item: T) => boolean
): Factory<T> => {
  return (...args: any[]) => {
    const result = factory(...args);
    if (!validator(result)) {
      throw new Error('Factory produced invalid result');
    }
    return result;
  };
};
```

### Parameterized Factory Factories
```typescript
const createApiClientFactory = (defaultTimeout: number) => {
  return (baseUrl: string, customTimeout?: number): HttpClient => ({
    baseUrl,
    headers: { 'Content-Type': 'application/json' },
    timeout: customTimeout || defaultTimeout
  });
};

const fastApiClientFactory = createApiClientFactory(1000);
const slowApiClientFactory = createApiClientFactory(10000);
```

### Async Factory Functions
```typescript
type DatabaseConnection = {
  host: string;
  connected: boolean;
  connectionId: string;
};

const createDatabaseConnection = async (host: string): Promise<DatabaseConnection> => {
  // Simulate async connection
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    host,
    connected: true,
    connectionId: crypto.randomUUID()
  };
};

const connectionFactory = async (environment: string): Promise<DatabaseConnection> => {
  const hosts = {
    development: 'localhost',
    staging: 'staging-db.example.com',
    production: 'prod-db.example.com'
  };
  
  const host = hosts[environment] || hosts.development;
  return createDatabaseConnection(host);
};
```

### Registry-Based Factories
```typescript
class FactoryRegistry<T> {
  private factories = new Map<string, Factory<T>>();
  
  register(name: string, factory: Factory<T>): void {
    this.factories.set(name, factory);
  }
  
  create(name: string, ...args: any[]): T {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`No factory registered for: ${name}`);
    }
    return factory(...args);
  }
  
  getRegisteredNames(): string[] {
    return Array.from(this.factories.keys());
  }
}

// Usage
const userRegistry = new FactoryRegistry<User>();
userRegistry.register('admin', createAdminUser);
userRegistry.register('regular', createUser);

const admin = userRegistry.create('admin', 'John', 'john@example.com');
```

## When to Use

### Choose Factory Functions When:
- You need to create objects with different configurations
- Object creation logic is complex but doesn't require state
- You want easy testing and composition
- Performance is important (no class instantiation)
- You prefer functional programming style

### Avoid When:
- Factory needs to maintain state between creations
- You need complex inheritance hierarchies
- Object creation requires lifecycle management
- Team strongly prefers OOP patterns

## Performance Considerations

### Benefits:
- **No Class Instantiation**: Direct function calls are faster
- **Memory Efficient**: No object overhead for factory itself
- **Tree Shaking**: Unused factory functions can be eliminated
- **Inlining**: Modern engines can inline simple factory functions

### Considerations:
- **Function Creation**: Avoid creating functions in hot paths
- **Closure Memory**: Be careful with captured variables
- **Object Creation**: Still need to create the actual objects

## Testing Strategies

```typescript
// Easy to test individual factories
describe('Factory Functions', () => {
  it('should create user with correct defaults', () => {
    const user = createUser('John', 'john@example.com');
    
    expect(user.name).toBe('John');
    expect(user.email).toBe('john@example.com');
    expect(user.role).toBe('user');
    expect(user.id).toBeDefined();
  });
  
  it('should create admin user with admin role', () => {
    const admin = createAdminUser('Admin', 'admin@example.com');
    
    expect(admin.role).toBe('admin');
    expect(admin.name).toBe('Admin');
  });
});

// Easy to mock for testing
const mockUserFactory = jest.fn().mockReturnValue({
  id: 'test-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: new Date()
});
```

## Modern TypeScript Features

### Generic Factory Functions
```typescript
type Entity<T> = T & {
  id: string;
  createdAt: Date;
};

const createEntity = <T>(data: T): Entity<T> => ({
  ...data,
  id: crypto.randomUUID(),
  createdAt: new Date()
});

// Usage with full type safety
const user = createEntity({ name: 'John', email: 'john@example.com' });
const product = createEntity({ name: 'iPhone', price: 999 });
```

### Conditional Factory Types
```typescript
type FactoryOptions<T> = {
  withId?: boolean;
  withTimestamp?: boolean;
  data: T;
};

type FactoryResult<T, O extends FactoryOptions<T>> = 
  O['withId'] extends true 
    ? O['withTimestamp'] extends true 
      ? T & { id: string; createdAt: Date }
      : T & { id: string }
    : O['withTimestamp'] extends true 
      ? T & { createdAt: Date }
      : T;

const createWithOptions = <T, O extends FactoryOptions<T>>(
  options: O
): FactoryResult<T, O> => {
  let result: any = { ...options.data };
  
  if (options.withId) {
    result.id = crypto.randomUUID();
  }
  
  if (options.withTimestamp) {
    result.createdAt = new Date();
  }
  
  return result;
};
```

## Conclusion

Factory functions provide a lightweight, composable alternative to traditional factory classes. They leverage JavaScript's functional nature and TypeScript's type system to create flexible, maintainable object creation patterns.

The key advantages are simplicity, performance, and composability. By treating object creation as pure functions, we can easily test, combine, and reason about our factory logic without the complexity of class hierarchies. 