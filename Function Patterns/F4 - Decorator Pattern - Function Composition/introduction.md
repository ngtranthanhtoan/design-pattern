# Decorator Pattern - Function Composition

## What is the Functional Decorator Pattern?

The Decorator pattern using function composition replaces traditional decorator classes with higher-order functions that wrap and enhance other functions. Instead of creating wrapper classes that implement the same interface, we use functions that take a function as input and return an enhanced version of that function.

## Traditional vs Functional Approach

### Traditional OOP Decorator Pattern
```typescript
interface Coffee {
  cost(): number;
  description(): string;
}

class SimpleCoffee implements Coffee {
  cost(): number { return 2; }
  description(): string { return "Simple coffee"; }
}

class MilkDecorator implements Coffee {
  constructor(private coffee: Coffee) {}
  
  cost(): number {
    return this.coffee.cost() + 0.5;
  }
  
  description(): string {
    return this.coffee.description() + ", milk";
  }
}

class SugarDecorator implements Coffee {
  constructor(private coffee: Coffee) {}
  
  cost(): number {
    return this.coffee.cost() + 0.25;
  }
  
  description(): string {
    return this.coffee.description() + ", sugar";
  }
}

// Usage
let coffee = new SimpleCoffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
```

### Functional Decorator Pattern
```typescript
type Coffee = {
  cost: number;
  description: string;
};

const simpleCoffee: Coffee = {
  cost: 2,
  description: "Simple coffee"
};

const withMilk = (coffee: Coffee): Coffee => ({
  cost: coffee.cost + 0.5,
  description: `${coffee.description}, milk`
});

const withSugar = (coffee: Coffee): Coffee => ({
  cost: coffee.cost + 0.25,
  description: `${coffee.description}, sugar`
});

// Usage with function composition
const decoratedCoffee = withSugar(withMilk(simpleCoffee));

// Or using pipe operator
const pipe = <T>(value: T, ...fns: Array<(arg: T) => T>): T =>
  fns.reduce((acc, fn) => fn(acc), value);

const coffee = pipe(simpleCoffee, withMilk, withSugar);
```

## Key Benefits

1. **Simplicity**: No classes or interfaces needed
2. **Pure Functions**: Predictable behavior without side effects
3. **Composability**: Easy to combine multiple decorators
4. **Immutability**: Original objects remain unchanged
5. **Pipeline Operations**: Natural fit for data transformation pipelines
6. **Type Safety**: Full TypeScript support with proper inference

## Pattern Structure

### Core Components
1. **Base Function/Object**: The original function or data to be decorated
2. **Decorator Functions**: Higher-order functions that enhance behavior
3. **Composition Utilities**: Functions like `pipe` and `compose` for chaining
4. **Curried Decorators**: Parameterized decorators for flexible enhancement
5. **Middleware Patterns**: Request/response processing chains

### TypeScript Implementation
```typescript
// Generic decorator type
type Decorator<T> = (input: T) => T;

// Function decorator type
type FunctionDecorator<T extends (...args: any[]) => any> = (fn: T) => T;

// Composition utilities
const pipe = <T>(value: T, ...decorators: Decorator<T>[]): T =>
  decorators.reduce((acc, decorator) => decorator(acc), value);

const compose = <T>(...decorators: Decorator<T>[]): Decorator<T> =>
  (value: T) => decorators.reduceRight((acc, decorator) => decorator(acc), value);

// Parameterized decorator
const withProperty = <T, K extends string, V>(
  key: K, 
  value: V
) => (obj: T): T & Record<K, V> => ({
  ...obj,
  [key]: value
} as T & Record<K, V>);
```

## Common Use Cases

### 1. Middleware Functions
```typescript
type Request = { path: string; headers: Record<string, string>; body?: any };
type Response = { status: number; body: any; headers: Record<string, string> };
type Handler = (req: Request) => Response;

const withLogging = (handler: Handler): Handler => {
  return (req: Request) => {
    console.log(`${new Date().toISOString()} ${req.path}`);
    const response = handler(req);
    console.log(`Response: ${response.status}`);
    return response;
  };
};

const withAuth = (handler: Handler): Handler => {
  return (req: Request) => {
    const token = req.headers['authorization'];
    if (!token) {
      return { status: 401, body: 'Unauthorized', headers: {} };
    }
    return handler(req);
  };
};

const withCors = (handler: Handler): Handler => {
  return (req: Request) => {
    const response = handler(req);
    return {
      ...response,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*'
      }
    };
  };
};
```

### 2. Function Enhancement
```typescript
const withRetry = <T extends (...args: any[]) => any>(
  maxRetries: number = 3
) => (fn: T): T => {
  return ((...args: any[]) => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return fn(...args);
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries) break;
        console.log(`Attempt ${attempt} failed, retrying...`);
      }
    }
    
    throw lastError!;
  }) as T;
};

const withMemoization = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, any>();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

const withTiming = <T extends (...args: any[]) => any>(fn: T): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`Function took ${(end - start).toFixed(2)}ms`);
    return result;
  }) as T;
};
```

### 3. Data Object Enhancement
```typescript
type User = {
  id: string;
  name: string;
  email: string;
};

const withTimestamp = <T extends object>(obj: T) => ({
  ...obj,
  createdAt: new Date(),
  updatedAt: new Date()
});

const withValidation = <T extends object>(obj: T) => ({
  ...obj,
  isValid: true,
  validatedAt: new Date()
});

const withMetadata = <T extends object>(metadata: Record<string, any>) => 
  (obj: T) => ({
    ...obj,
    metadata
  });

// Usage
const user: User = { id: '1', name: 'John', email: 'john@example.com' };
const enhancedUser = pipe(
  user,
  withTimestamp,
  withValidation,
  withMetadata({ source: 'api', version: '1.0' })
);
```

### 4. API Response Enhancement
```typescript
type ApiResponse<T> = {
  data: T;
  status: number;
};

const withSuccessFlag = <T>(response: ApiResponse<T>) => ({
  ...response,
  success: response.status >= 200 && response.status < 300
});

const withPagination = (page: number, limit: number) => 
  <T>(response: ApiResponse<T[]>) => ({
    ...response,
    pagination: {
      page,
      limit,
      total: response.data.length,
      hasNext: response.data.length === limit
    }
  });

const withCaching = (ttl: number) => 
  <T>(response: ApiResponse<T>) => ({
    ...response,
    cache: {
      ttl,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttl
    }
  });
```

### 5. Configuration Enhancement
```typescript
type Config = {
  apiUrl: string;
  timeout: number;
};

const withDefaults = <T extends object>(defaults: Partial<T>) =>
  (config: T): T => ({
    ...defaults,
    ...config
  });

const withEnvironment = (env: string) =>
  <T extends object>(config: T) => ({
    ...config,
    environment: env,
    isDevelopment: env === 'development',
    isProduction: env === 'production'
  });

const withValidation = <T extends object>(validator: (config: T) => boolean) =>
  (config: T) => {
    if (!validator(config)) {
      throw new Error('Invalid configuration');
    }
    return config;
  };
```

## Advanced Patterns

### Conditional Decorators
```typescript
const conditionalDecorator = <T>(
  condition: boolean,
  decorator: Decorator<T>
): Decorator<T> => {
  return condition ? decorator : (value: T) => value;
};

const withDebugInfo = conditionalDecorator(
  process.env.NODE_ENV === 'development',
  <T extends object>(obj: T) => ({
    ...obj,
    debug: { timestamp: Date.now(), stack: new Error().stack }
  })
);
```

### Async Decorators
```typescript
type AsyncDecorator<T> = (input: T) => Promise<T>;

const withAsyncLogging = <T>(obj: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Async logging:', obj);
      resolve(obj);
    }, 100);
  });
};

const withAsyncValidation = <T extends { id: string }>(obj: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    // Simulate async validation
    setTimeout(() => {
      if (obj.id.length > 0) {
        resolve({ ...obj, validated: true } as T & { validated: boolean });
      } else {
        reject(new Error('Invalid ID'));
      }
    }, 50);
  });
};

// Async pipe utility
const asyncPipe = async <T>(
  value: T,
  ...decorators: Array<Decorator<T> | AsyncDecorator<T>>
): Promise<T> => {
  let result = value;
  for (const decorator of decorators) {
    result = await decorator(result);
  }
  return result;
};
```

### Decorator Factories
```typescript
const createPropertyDecorator = <K extends string, V>(key: K, getValue: () => V) =>
  <T extends object>(obj: T): T & Record<K, V> => ({
    ...obj,
    [key]: getValue()
  } as T & Record<K, V>);

const withCurrentTime = createPropertyDecorator('timestamp', () => new Date());
const withRandomId = createPropertyDecorator('id', () => Math.random().toString(36));
const withVersion = createPropertyDecorator('version', () => '1.0.0');

// Decorator combination
const withMetadataBundle = pipe(withCurrentTime, withRandomId, withVersion);
```

### Decorator Composition Patterns
```typescript
// Left-to-right composition (pipe)
const pipeDecorators = <T>(...decorators: Decorator<T>[]): Decorator<T> =>
  (value: T) => decorators.reduce((acc, decorator) => decorator(acc), value);

// Right-to-left composition (compose)
const composeDecorators = <T>(...decorators: Decorator<T>[]): Decorator<T> =>
  (value: T) => decorators.reduceRight((acc, decorator) => decorator(acc), value);

// Parallel decoration (apply all decorators to original value and merge)
const parallelDecorators = <T extends object>(...decorators: Decorator<T>[]): Decorator<T> =>
  (value: T) => decorators.reduce((acc, decorator) => ({
    ...acc,
    ...decorator(value)
  }), value);
```

## When to Use

### Choose Function Composition Decorators When:
- You need to add behavior to functions or objects
- Want to create reusable enhancement patterns
- Building middleware or plugin systems
- Need immutable object transformations
- Working with data transformation pipelines
- Want easy testing and composition

### Avoid When:
- You need complex stateful decorations
- Object identity must be preserved
- Working with classes that require `this` binding
- Team prefers traditional OOP patterns
- Decorators need to modify object prototypes

## Performance Considerations

### Benefits:
- **No Class Overhead**: Direct function calls
- **Immutable Operations**: No state mutation concerns
- **Optimizable**: Modern engines can optimize function composition
- **Memory Efficient**: No object wrapper hierarchy

### Considerations:
- **Object Creation**: Creates new objects for each decoration
- **Function Call Stack**: Multiple decorators create call stack depth
- **Memory Usage**: Immutable updates can use more memory
- **Garbage Collection**: More objects created for collection

## Modern TypeScript Features

### Conditional Types for Decorators
```typescript
type DecoratorResult<T, D> = D extends (input: T) => infer R ? R : never;

type PipeResult<T, D extends readonly any[]> = 
  D extends readonly [infer Head, ...infer Tail]
    ? Head extends (input: T) => any
      ? Tail extends readonly any[]
        ? PipeResult<DecoratorResult<T, Head>, Tail>
        : DecoratorResult<T, Head>
      : never
    : T;
```

### Template Literal Types for Dynamic Properties
```typescript
type WithPrefix<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};

const withPrefix = <T extends Record<string, any>, P extends string>(
  prefix: P
) => (obj: T): WithPrefix<T, P> => {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[`${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`] = value;
  }
  return result;
};
```

### Branded Types for Enhanced Objects
```typescript
declare const _enhanced: unique symbol;
type Enhanced<T> = T & { [_enhanced]: true };

const markAsEnhanced = <T>(obj: T): Enhanced<T> => 
  obj as Enhanced<T>;

const isEnhanced = <T>(obj: T | Enhanced<T>): obj is Enhanced<T> => 
  _enhanced in obj;
```

## Testing Strategies

```typescript
// Easy to test individual decorators
describe('Function Decorators', () => {
  it('should add timestamp', () => {
    const obj = { name: 'test' };
    const decorated = withTimestamp(obj);
    
    expect(decorated.name).toBe('test');
    expect(decorated.createdAt).toBeInstanceOf(Date);
  });
  
  it('should compose decorators', () => {
    const obj = { id: '1' };
    const decorated = pipe(obj, withTimestamp, withValidation);
    
    expect(decorated.id).toBe('1');
    expect(decorated.createdAt).toBeInstanceOf(Date);
    expect(decorated.isValid).toBe(true);
  });
});

// Easy to mock decorators
const mockDecorator = jest.fn().mockImplementation((obj) => ({
  ...obj,
  mocked: true
}));
```

## Conclusion

The functional Decorator pattern using function composition provides a clean, composable alternative to traditional decorator classes. It leverages JavaScript's functional nature and TypeScript's type system to create flexible, immutable enhancement patterns.

The key advantages are simplicity, immutability, and composability. By treating decorations as pure functions, we can easily test, combine, and reason about our enhancement logic without the complexity of class hierarchies or mutable state. 