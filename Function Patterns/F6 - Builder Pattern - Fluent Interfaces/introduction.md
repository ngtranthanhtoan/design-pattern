# Builder Pattern - Fluent Interfaces

## What is the Builder Pattern in Functional Programming?

The Builder Pattern with Fluent Interfaces in functional programming provides a way to construct complex objects through a series of function calls that can be chained together. Unlike traditional OOP builders that use classes and mutable state, functional builders use immutable data structures and pure functions to create objects step by step.

## Core Principles

### 1. **Immutable Construction**
Each builder step returns a new object rather than modifying existing state:
```typescript
const config = createConfigBuilder()
  .withHost('localhost')
  .withPort(3000)
  .withDatabase('myapp')
  .build();
```

### 2. **Function Chaining**
Each method returns a new builder instance, enabling method chaining:
```typescript
type Builder<T> = {
  [K in keyof T]: (value: T[K]) => Builder<T>;
} & {
  build(): T;
};
```

### 3. **Type Safety**
TypeScript ensures that all required fields are provided and types are correct:
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  ssl?: boolean;
}

const builder = createBuilder<DatabaseConfig>();
```

### 4. **Composable Configuration**
Builders can be composed and extended:
```typescript
const baseConfig = createConfigBuilder()
  .withHost('localhost')
  .withPort(3000);

const devConfig = baseConfig.withDatabase('dev_db').build();
const testConfig = baseConfig.withDatabase('test_db').build();
```

## Traditional OOP vs Functional Builder

### Traditional OOP Builder
```typescript
class DatabaseConfigBuilder {
  private config: Partial<DatabaseConfig> = {};
  
  setHost(host: string): this {
    this.config.host = host;
    return this;
  }
  
  setPort(port: number): this {
    this.config.port = port;
    return this;
  }
  
  build(): DatabaseConfig {
    if (!this.config.host || !this.config.port) {
      throw new Error('Missing required fields');
    }
    return this.config as DatabaseConfig;
  }
}

// Usage
const config = new DatabaseConfigBuilder()
  .setHost('localhost')
  .setPort(3000)
  .build();
```

### Functional Builder with Fluent Interface
```typescript
type Builder<T> = {
  [K in keyof T as `with${Capitalize<string & K>}`]: (
    value: T[K]
  ) => Builder<T>;
} & {
  build(): T;
};

function createBuilder<T>(): Builder<T> {
  const data = {} as Partial<T>;
  
  const builder = {} as Builder<T>;
  
  // Create with methods dynamically
  Object.keys(schema).forEach(key => {
    const methodName = `with${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    builder[methodName] = (value: any) => {
      return createBuilder<T>({ ...data, [key]: value });
    };
  });
  
  builder.build = () => {
    // Validation logic
    return data as T;
  };
  
  return builder;
}

// Usage
const config = createBuilder<DatabaseConfig>()
  .withHost('localhost')
  .withPort(3000)
  .build();
```

## Advanced Functional Builder Patterns

### 1. **Conditional Building**
```typescript
const conditionalBuilder = <T>(condition: boolean) => 
  (builder: Builder<T>) => 
    condition ? builder : builder;

const config = createBuilder<DatabaseConfig>()
  .withHost('localhost')
  .withPort(3000)
  .pipe(conditionalBuilder(isProd).withSsl(true))
  .build();
```

### 2. **Builder Composition**
```typescript
const composeBuilders = <T>(...builders: Array<(b: Builder<T>) => Builder<T>>) =>
  (initial: Builder<T>) =>
    builders.reduce((acc, builder) => builder(acc), initial);

const databaseBuilder = (builder: Builder<Config>) =>
  builder.withHost('localhost').withPort(5432);

const sslBuilder = (builder: Builder<Config>) =>
  builder.withSsl(true).withTimeout(30000);

const config = createBuilder<Config>()
  .pipe(composeBuilders(databaseBuilder, sslBuilder))
  .build();
```

### 3. **Validation During Construction**
```typescript
type ValidatedBuilder<T> = {
  [K in keyof T as `with${Capitalize<string & K>}`]: (
    value: T[K]
  ) => ValidatedBuilder<T>;
} & {
  build(): Either<ValidationError[], T>;
};

function createValidatedBuilder<T>(
  schema: ValidationSchema<T>
): ValidatedBuilder<T> {
  return {
    // Implementation with validation at each step
    build: () => validateAndBuild(data, schema)
  };
}
```

### 4. **Partial Application Builders**
```typescript
const createPartialBuilder = <T>(defaults: Partial<T>) =>
  (overrides: Partial<T>): T => ({
    ...defaults,
    ...overrides
  });

const defaultDatabaseConfig = createPartialBuilder<DatabaseConfig>({
  host: 'localhost',
  port: 5432,
  ssl: false
});

const prodConfig = defaultDatabaseConfig({
  database: 'production',
  ssl: true
});
```

## Benefits of Functional Builders

### ✅ **Advantages**

1. **Immutability**: No side effects, each step creates new state
2. **Type Safety**: Full TypeScript support with compile-time checks
3. **Composability**: Builders can be composed and reused
4. **Testability**: Pure functions are easy to test
5. **Functional Composition**: Works naturally with pipe operations
6. **Memory Efficiency**: Can optimize immutable updates with structural sharing

### ⚠️ **Considerations**

1. **Learning Curve**: Requires understanding of functional concepts
2. **Initial Setup**: More complex to set up than simple object literals
3. **TypeScript Complexity**: Advanced type manipulations can be complex
4. **Performance**: Multiple object creations (mitigated by structural sharing)

## When to Use Functional Builders

### ✅ **Good Use Cases**

- **Complex Configuration Objects**: API clients, database connections, application settings
- **Domain Object Construction**: User profiles, product catalogs, form data
- **Test Data Builders**: Creating test fixtures with variations
- **API Request Building**: Building complex HTTP requests
- **Query Construction**: Database queries, search parameters
- **Pipeline Configuration**: Data processing pipelines, middleware stacks

### ❌ **Avoid When**

- **Simple Objects**: Use object literals for simple data structures
- **Performance Critical**: When object creation overhead matters
- **Dynamic Properties**: When property names are not known at compile time
- **One-off Construction**: For objects created once with fixed values

## Integration with Other Patterns

### **With Validation (Monad Pattern)**
```typescript
const configResult = createBuilder<DatabaseConfig>()
  .withHost('localhost')
  .withPort(3000)
  .buildValidated(); // Returns Either<Error[], DatabaseConfig>
```

### **With Factory Functions**
```typescript
const createDatabaseBuilder = (environment: Environment) =>
  createBuilder<DatabaseConfig>()
    .withHost(environment.dbHost)
    .withPort(environment.dbPort);

const devBuilder = createDatabaseBuilder(devEnvironment);
```

### **With Observer Pattern**
```typescript
const builderWithEvents = createBuilder<Config>()
  .onStep((step, value) => console.log(`Set ${step} to ${value}`))
  .withHost('localhost')
  .withPort(3000);
```

## Modern TypeScript Features

### **Template Literal Types**
```typescript
type BuilderMethods<T> = {
  [K in keyof T as `with${Capitalize<string & K>}`]: (
    value: T[K]
  ) => Builder<T>;
};
```

### **Conditional Types**
```typescript
type RequiredFields<T> = {
  [K in keyof T as T[K] extends undefined ? never : K]: T[K];
};
```

### **Recursive Types**
```typescript
type DeepBuilder<T> = {
  [K in keyof T]: T[K] extends object
    ? DeepBuilder<T[K]> & { build(): T[K] }
    : (value: T[K]) => DeepBuilder<T>;
};
```

## Performance Considerations

### **Structural Sharing**
```typescript
// Use libraries like Immer for efficient immutable updates
const builder = createBuilder<Config>()
  .withStructuralSharing(true) // Optimizes object creation
  .withHost('localhost');
```

### **Lazy Evaluation**
```typescript
const lazyBuilder = createBuilder<Config>()
  .lazy() // Defers computation until build() is called
  .withComputed('fullUrl', (config) => `${config.host}:${config.port}`);
```

## Real-World Applications

1. **API Client Configuration**: Building HTTP clients with authentication, retries, timeouts
2. **Database Connection Builders**: Creating connection pools with various parameters
3. **Form Validators**: Building complex validation rules step by step
4. **Test Data Factories**: Creating test fixtures with controlled variations
5. **CSS-in-JS Style Builders**: Building complex style objects programmatically
6. **Query Builders**: Constructing database queries with type safety

## Related Patterns

- **F3 - Factory Pattern**: Builders often use factory functions internally
- **F8 - Monad Pattern**: For validation and error handling during construction  
- **F1 - Maybe Pattern**: For optional fields and safe property access
- **Lens Pattern**: For deep object manipulation and updates

The Builder Pattern with Fluent Interfaces in functional programming provides a powerful, type-safe way to construct complex objects while maintaining immutability and composability. It's particularly valuable in TypeScript applications where type safety and developer experience are priorities. 