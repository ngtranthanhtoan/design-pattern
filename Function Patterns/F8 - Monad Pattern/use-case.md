# Monad Pattern - Use Cases

## Overview

This document explores practical applications of the Monad pattern in real-world scenarios. Each use case demonstrates how monads can solve complex problems while maintaining functional purity and type safety.

## Use Case 1: Data Validation Pipeline

### Problem
Building a robust data validation system that can handle multiple validation rules, collect all errors, and provide meaningful feedback to users.

### Solution
Use the Either monad to chain validation operations and accumulate errors.

### Implementation
```typescript
// Validation result type
type ValidationResult<T> = Either<string[], T>;

// Validation functions
const validateEmail = (email: string): ValidationResult<string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) 
    ? new Right(email)
    : new Left(['Invalid email format']);
};

const validatePassword = (password: string): ValidationResult<string> => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain number');
  }
  
  return errors.length > 0 ? new Left(errors) : new Right(password);
};

const validateAge = (age: number): ValidationResult<number> => {
  return age >= 18 && age <= 120 
    ? new Right(age)
    : new Left(['Age must be between 18 and 120']);
};

// Chaining validations
const validateUser = (user: any): ValidationResult<User> => {
  return validateEmail(user.email)
    .flatMap(email => 
      validatePassword(user.password)
        .flatMap(password => 
          validateAge(user.age)
            .map(age => ({ email, password, age }))
        )
    );
};
```

### Benefits
- **Error Accumulation**: Collects all validation errors in one pass
- **Type Safety**: Compile-time guarantees about validation results
- **Composability**: Easy to add new validation rules
- **Pure Functions**: No side effects, easy to test

## Use Case 2: Configuration Management

### Problem
Managing application configuration with optional values, environment-specific settings, and fallback defaults.

### Solution
Use the Maybe monad to handle optional configuration values safely.

### Implementation
```typescript
// Configuration monad
class Config<T> {
  constructor(private value: T | null) {}
  
  static fromEnv(key: string): Config<string> {
    return new Config(process.env[key] || null);
  }
  
  static fromObject<T>(obj: any, key: string): Config<T> {
    return new Config(obj[key] || null);
  }
  
  flatMap<U>(fn: (value: T) => Config<U>): Config<U> {
    return this.value !== null 
      ? fn(this.value)
      : new Config<U>(null);
  }
  
  map<U>(fn: (value: T) => U): Config<U> {
    return this.value !== null 
      ? new Config(fn(this.value))
      : new Config<U>(null);
  }
  
  orElse(defaultValue: T): T {
    return this.value !== null ? this.value : defaultValue;
  }
  
  isPresent(): boolean {
    return this.value !== null;
  }
}

// Configuration builder
const buildConfig = () => {
  const port = Config.fromEnv('PORT')
    .map(Number)
    .orElse(3000);
    
  const databaseUrl = Config.fromEnv('DATABASE_URL')
    .orElse('postgresql://localhost:5432/myapp');
    
  const logLevel = Config.fromEnv('LOG_LEVEL')
    .map(level => level.toUpperCase())
    .orElse('INFO');
    
  return { port, databaseUrl, logLevel };
};
```

### Benefits
- **Safe Access**: No null reference errors
- **Default Values**: Graceful fallbacks
- **Environment Agnostic**: Works across different environments
- **Type Safety**: Compile-time configuration validation

## Use Case 3: Async Operation Chaining

### Problem
Chaining multiple asynchronous operations while handling errors gracefully and maintaining type safety.

### Solution
Use a Promise-based monad to chain async operations with proper error handling.

### Implementation
```typescript
// Async monad wrapper
class Async<T> {
  constructor(private promise: Promise<T>) {}
  
  static fromPromise<T>(promise: Promise<T>): Async<T> {
    return new Async(promise);
  }
  
  static fromValue<T>(value: T): Async<T> {
    return new Async(Promise.resolve(value));
  }
  
  flatMap<U>(fn: (value: T) => Async<U>): Async<U> {
    return new Async(
      this.promise.then(value => fn(value).promise)
    );
  }
  
  map<U>(fn: (value: T) => U): Async<U> {
    return new Async(this.promise.then(fn));
  }
  
  async run(): Promise<T> {
    return this.promise;
  }
}

// API operations
const fetchUser = (id: number): Async<User> => {
  return Async.fromPromise(
    fetch(`/api/users/${id}`).then(res => res.json())
  );
};

const fetchUserPosts = (userId: number): Async<Post[]> => {
  return Async.fromPromise(
    fetch(`/api/users/${userId}/posts`).then(res => res.json())
  );
};

const fetchPostComments = (postId: number): Async<Comment[]> => {
  return Async.fromPromise(
    fetch(`/api/posts/${postId}/comments`).then(res => res.json())
  );
};

// Chaining operations
const getUserWithPostsAndComments = (userId: number): Async<UserWithPosts> => {
  return fetchUser(userId)
    .flatMap(user => 
      fetchUserPosts(user.id)
        .flatMap(posts => 
          Promise.all(posts.map(post => 
            fetchPostComments(post.id).run()
          ))
            .then(commentsArrays => ({
              ...user,
              posts: posts.map((post, index) => ({
                ...post,
                comments: commentsArrays[index]
              }))
            }))
        )
        .map(userWithPosts => new Async(Promise.resolve(userWithPosts)))
    );
};
```

### Benefits
- **Error Propagation**: Automatic error handling through the chain
- **Type Safety**: Compile-time guarantees about async operations
- **Composability**: Easy to combine multiple async operations
- **No Callback Hell**: Clean, readable async code

## Use Case 4: State Management

### Problem
Managing application state in a pure functional way, allowing state updates while maintaining immutability.

### Solution
Use the State monad to encapsulate stateful computations.

### Implementation
```typescript
// State monad
class State<S, T> {
  constructor(private runState: (state: S) => [T, S]) {}
  
  static unit<S, T>(value: T): State<S, T> {
    return new State(state => [value, state]);
  }
  
  flatMap<U>(fn: (value: T) => State<S, U>): State<S, U> {
    return new State(state => {
      const [value, newState] = this.runState(state);
      return fn(value).runState(newState);
    });
  }
  
  map<U>(fn: (value: T) => U): State<S, U> {
    return new State(state => {
      const [value, newState] = this.runState(state);
      return [fn(value), newState];
    });
  }
  
  run(initialState: S): [T, S] {
    return this.runState(initialState);
  }
  
  // State operations
  get(): State<S, S> {
    return new State(state => [state, state]);
  }
  
  put(newState: S): State<S, void> {
    return new State(() => [undefined, newState]);
  }
  
  modify(fn: (state: S) => S): State<S, void> {
    return new State(state => [undefined, fn(state)]);
  }
}

// Shopping cart state
interface CartState {
  items: CartItem[];
  total: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// Cart operations
const addItem = (item: CartItem): State<CartState, void> => {
  return new State(state => {
    const existingItem = state.items.find(i => i.id === item.id);
    let newItems: CartItem[];
    
    if (existingItem) {
      newItems = state.items.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      newItems = [...state.items, item];
    }
    
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return [undefined, { items: newItems, total: newTotal }];
  });
};

const removeItem = (itemId: number): State<CartState, void> => {
  return new State(state => {
    const newItems = state.items.filter(item => item.id !== itemId);
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return [undefined, { items: newItems, total: newTotal }];
  });
};

const clearCart = (): State<CartState, void> => {
  return new State(() => [undefined, { items: [], total: 0 }]);
};

// Composing cart operations
const addMultipleItems = (items: CartItem[]): State<CartState, void> => {
  return items.reduce(
    (state, item) => state.flatMap(() => addItem(item)),
    State.unit<CartState, void>(undefined)
  );
};
```

### Benefits
- **Immutability**: State changes are explicit and trackable
- **Composability**: Easy to combine state operations
- **Testability**: Pure functions, easy to test
- **Type Safety**: Compile-time state validation

## Use Case 5: Error Recovery and Retry Logic

### Problem
Implementing robust error handling with automatic retry logic and fallback strategies.

### Solution
Use the Either monad with retry logic to handle transient failures.

### Implementation
```typescript
// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

// Retry monad
class Retry<T> {
  constructor(
    private operation: () => Promise<T>,
    private config: RetryConfig
  ) {}
  
  async execute(): Promise<Either<Error, T>> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await this.operation();
        return new Right(result);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.maxAttempts) {
          const delay = this.config.delayMs * Math.pow(this.config.backoffMultiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return new Left(lastError!);
  }
  
  flatMap<U>(fn: (value: T) => Retry<U>): Retry<U> {
    return new Retry(
      async () => {
        const result = await this.execute();
        return result.flatMap(value => fn(value).execute());
      },
      this.config
    );
  }
  
  map<U>(fn: (value: T) => U): Retry<U> {
    return new Retry(
      async () => {
        const result = await this.execute();
        return result.map(fn);
      },
      this.config
    );
  }
}

// API operations with retry
const fetchWithRetry = <T>(url: string, config: RetryConfig): Retry<T> => {
  return new Retry(
    () => fetch(url).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    }),
    config
  );
};

const processWithFallback = async <T>(
  primary: Retry<T>,
  fallback: () => Promise<T>
): Promise<T> => {
  const result = await primary.execute();
  
  return result.fold(
    error => {
      console.warn('Primary operation failed, using fallback:', error.message);
      return fallback();
    },
    value => value
  );
};

// Usage example
const getUserData = (userId: number) => {
  const retryConfig: RetryConfig = {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2
  };
  
  const primarySource = fetchWithRetry<User>(
    `https://api.primary.com/users/${userId}`,
    retryConfig
  );
  
  const fallbackSource = () => 
    fetch(`https://api.fallback.com/users/${userId}`).then(res => res.json());
  
  return processWithFallback(primarySource, fallbackSource);
};
```

### Benefits
- **Automatic Retry**: Handles transient failures
- **Exponential Backoff**: Prevents overwhelming services
- **Fallback Strategy**: Graceful degradation
- **Error Isolation**: Failures don't cascade

## Best Practices

### 1. Choose the Right Monad
- **Maybe**: For optional values
- **Either**: For error handling
- **IO**: For side effects
- **State**: For stateful computations
- **Async**: For asynchronous operations

### 2. Keep Chains Readable
- Break long chains into smaller functions
- Use meaningful variable names
- Add comments for complex transformations

### 3. Handle All Cases
- Always handle the Nothing/Left cases
- Provide meaningful error messages
- Consider logging for debugging

### 4. Test Thoroughly
- Test monad laws
- Test error scenarios
- Test edge cases
- Use property-based testing

## Conclusion

The Monad pattern provides powerful abstractions for handling complex computations, errors, and side effects in a functional way. By understanding and applying these use cases, developers can write more robust, maintainable, and type-safe code.

The key is to start with simple monads and gradually build up to more complex applications. When used appropriately, monads can significantly improve code quality and developer experience. 