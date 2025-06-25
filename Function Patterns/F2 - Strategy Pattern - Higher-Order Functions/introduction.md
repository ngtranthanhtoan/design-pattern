# Strategy Pattern - Higher-Order Functions

## What is the Functional Strategy Pattern?

The Strategy pattern using higher-order functions replaces the traditional strategy interface with functions passed as parameters. Instead of creating multiple classes that implement a common interface, we use functions as first-class citizens that can be passed around, stored, and executed.

## Traditional vs Functional Approach

### Traditional OOP Strategy Pattern
```typescript
interface PaymentStrategy {
  processPayment(amount: number): boolean;
}

class CreditCardStrategy implements PaymentStrategy {
  processPayment(amount: number): boolean {
    // Credit card processing logic
    return true;
  }
}

class PayPalStrategy implements PaymentStrategy {
  processPayment(amount: number): boolean {
    // PayPal processing logic
    return true;
  }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}
  
  process(amount: number): boolean {
    return this.strategy.processPayment(amount);
  }
}
```

### Functional Strategy Pattern
```typescript
type PaymentProcessor = (amount: number) => boolean;

const creditCardProcessor: PaymentProcessor = (amount) => {
  // Credit card processing logic
  return true;
};

const paypalProcessor: PaymentProcessor = (amount) => {
  // PayPal processing logic  
  return true;
};

const processPayment = (processor: PaymentProcessor, amount: number) => {
  return processor(amount);
};
```

## Key Benefits

1. **Simplicity**: No need for interfaces or classes
2. **Direct Composition**: Functions can be easily combined
3. **Type Safety**: TypeScript ensures function signatures match
4. **Immutability**: Strategies don't maintain state
5. **Higher-Order Functions**: Strategies can be generated dynamically

## Pattern Structure

### Components
1. **Strategy Function Type**: Defines the function signature
2. **Concrete Strategy Functions**: Individual strategy implementations
3. **Context Functions**: Functions that use strategies
4. **Strategy Factory Functions**: Generate strategies based on parameters

### TypeScript Implementation
```typescript
// Strategy function type
type Strategy<T, R> = (input: T) => R;

// Context function that uses strategy
const executeWithStrategy = <T, R>(
  strategy: Strategy<T, R>,
  input: T
): R => {
  return strategy(input);
};

// Strategy composition
const composeStrategies = <T, R, S>(
  strategy1: Strategy<T, R>,
  strategy2: Strategy<R, S>
): Strategy<T, S> => {
  return (input: T) => strategy2(strategy1(input));
};
```

## Common Use Cases

### 1. Data Validation
```typescript
type Validator<T> = (value: T) => boolean;

const emailValidator: Validator<string> = (email) => /\S+@\S+\.\S+/.test(email);
const lengthValidator: Validator<string> = (str) => str.length >= 8;

const validate = <T>(validators: Validator<T>[], value: T): boolean => {
  return validators.every(validator => validator(value));
};
```

### 2. Sorting Algorithms
```typescript
type Comparator<T> = (a: T, b: T) => number;

const numericSort: Comparator<number> = (a, b) => a - b;
const alphabeticSort: Comparator<string> = (a, b) => a.localeCompare(b);

const sortBy = <T>(items: T[], comparator: Comparator<T>): T[] => {
  return [...items].sort(comparator);
};
```

### 3. Data Transformation
```typescript
type Transformer<T, R> = (input: T) => R;

const toUpperCase: Transformer<string, string> = (str) => str.toUpperCase();
const addPrefix: (prefix: string) => Transformer<string, string> = 
  (prefix) => (str) => `${prefix}${str}`;

const transform = <T, R>(data: T[], transformer: Transformer<T, R>): R[] => {
  return data.map(transformer);
};
```

### 4. Authentication Strategies
```typescript
type AuthStrategy = (credentials: any) => Promise<boolean>;

const jwtAuth: AuthStrategy = async (token) => {
  // JWT validation logic
  return true;
};

const basicAuth: AuthStrategy = async ({ username, password }) => {
  // Basic auth validation logic
  return true;
};

const oauth2Auth: AuthStrategy = async (token) => {
  // OAuth2 validation logic
  return true;
};
```

### 5. Pricing Strategies
```typescript
type PricingStrategy = (basePrice: number, quantity: number) => number;

const bulkDiscount: PricingStrategy = (price, qty) => 
  qty > 100 ? price * 0.9 : price;

const loyaltyDiscount: PricingStrategy = (price, qty) => 
  price * 0.95; // 5% discount

const seasonalDiscount: PricingStrategy = (price, qty) => 
  new Date().getMonth() === 11 ? price * 0.8 : price; // December discount
```

## Advanced Patterns

### Strategy Composition
```typescript
const combineStrategies = <T>(
  ...strategies: Array<(input: T) => T>
): ((input: T) => T) => {
  return (input: T) => strategies.reduce((acc, strategy) => strategy(acc), input);
};
```

### Conditional Strategy Selection
```typescript
type StrategySelector<T, R> = {
  condition: (input: T) => boolean;
  strategy: (input: T) => R;
};

const selectStrategy = <T, R>(
  selectors: StrategySelector<T, R>[],
  fallback: (input: T) => R
) => (input: T): R => {
  const selector = selectors.find(s => s.condition(input));
  return selector ? selector.strategy(input) : fallback(input);
};
```

### Parameterized Strategies
```typescript
const createThrottleStrategy = (maxCalls: number, timeWindow: number) => {
  const calls: number[] = [];
  
  return <T extends (...args: any[]) => any>(fn: T): T => {
    return ((...args: any[]) => {
      const now = Date.now();
      const recentCalls = calls.filter(time => now - time < timeWindow);
      
      if (recentCalls.length >= maxCalls) {
        throw new Error('Rate limit exceeded');
      }
      
      calls.push(now);
      return fn(...args);
    }) as T;
  };
};
```

## When to Use

### Choose Higher-Order Function Strategy When:
- You need to swap algorithms dynamically
- Strategies are stateless functions
- You want to avoid class hierarchies
- You need easy function composition
- Strategies can be generated programmatically

### Avoid When:
- Strategies need to maintain complex state
- You need polymorphic behavior beyond function calls
- Team is not comfortable with functional programming
- You need runtime type checking of strategy objects

## Performance Considerations

### Benefits:
- **No Object Instantiation**: Functions are lightweight
- **Memory Efficient**: No class overhead
- **JIT Optimization**: Modern engines optimize function calls well
- **Composition Friendly**: Easy to combine strategies

### Considerations:
- **Closure Memory**: Be careful with captured variables
- **Function Creation**: Don't create functions in hot paths
- **Type Checking**: Use TypeScript for compile-time safety

## Testing Strategies

```typescript
// Easy to test individual strategies
describe('Validation Strategies', () => {
  it('should validate email format', () => {
    expect(emailValidator('test@example.com')).toBe(true);
    expect(emailValidator('invalid-email')).toBe(false);
  });
  
  it('should validate password length', () => {
    expect(lengthValidator('password123')).toBe(true);
    expect(lengthValidator('short')).toBe(false);
  });
});

// Easy to test strategy composition
describe('Strategy Composition', () => {
  const composedValidator = (value: string) => 
    emailValidator(value) && lengthValidator(value);
  
  it('should validate both email and length', () => {
    expect(composedValidator('test@example.com')).toBe(true);
    expect(composedValidator('t@e.co')).toBe(false);
  });
});
```

## Modern TypeScript Features

### Generic Strategy Types
```typescript
type AsyncStrategy<T, R> = (input: T) => Promise<R>;
type BatchStrategy<T, R> = (inputs: T[]) => R[];
type CachingStrategy<T, R> = (key: string, computer: () => R) => R;
```

### Utility Types for Strategies
```typescript
type StrategyMap<T, R> = Record<string, (input: T) => R>;
type StrategyPipeline<T> = Array<(input: T) => T>;
type ConditionalStrategy<T, R> = {
  [K in keyof T]: (input: T[K]) => R;
};
```

## Conclusion

The functional Strategy pattern using higher-order functions provides a clean, composable alternative to traditional OOP strategy patterns. It leverages JavaScript's first-class function support and TypeScript's type system to create flexible, maintainable, and testable code.

The key advantage is simplicity - instead of creating multiple classes and interfaces, you work directly with functions that can be easily composed, tested, and reasoned about. This approach is particularly powerful when combined with other functional programming concepts like currying, partial application, and function composition. 