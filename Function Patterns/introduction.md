# Functional Programming Patterns

## Overview

This section explores how traditional object-oriented design patterns can be reimagined through the lens of functional programming. Functional programming patterns emphasize immutability, pure functions, higher-order functions, and composition over inheritance.

## Philosophy of Functional Patterns

### Core Principles

1. **Immutability**: Data structures don't change after creation
2. **Pure Functions**: Functions without side effects that always produce the same output for the same input
3. **Higher-Order Functions**: Functions that take other functions as parameters or return functions
4. **Function Composition**: Building complex functionality by combining simpler functions
5. **Declarative Programming**: Describing what you want rather than how to achieve it

### Benefits Over Traditional OOP Patterns

- **Reduced Complexity**: Less state management and fewer side effects
- **Better Testability**: Pure functions are easier to test and reason about
- **Parallelization**: Immutable data structures are naturally thread-safe
- **Functional Composition**: Easier to combine and reuse functionality
- **Type Safety**: Better static analysis and compile-time guarantees

## Pattern Categories

### 1. Reimagined OOP Patterns

These patterns show how traditional design patterns can be implemented functionally:

#### **Strategy Pattern - Higher-Order Functions**
- **Traditional**: Interface with multiple implementations
- **Functional**: Functions passed as parameters
- **Benefit**: No need for classes or interfaces, just functions

#### **Factory Pattern - Factory Functions**
- **Traditional**: Factory classes with creation methods
- **Functional**: Pure functions that return configured objects
- **Benefit**: Simpler composition and no class instantiation

#### **Decorator Pattern - Function Composition**
- **Traditional**: Wrapper classes that implement the same interface
- **Functional**: Functions that wrap and enhance other functions
- **Benefit**: Natural composition with pipe operators

#### **Observer Pattern - Pub/Sub with Closures**
- **Traditional**: Observer interface with Subject maintaining list
- **Functional**: Event streams and reactive programming
- **Benefit**: Better handling of asynchronous events

#### **Command Pattern - Function Queues**
- **Traditional**: Command objects with execute methods
- **Functional**: Functions stored in data structures
- **Benefit**: Functions are first-class citizens

#### **Builder Pattern - Fluent Interfaces**
- **Traditional**: Builder classes with method chaining
- **Functional**: Immutable updates with functional composition
- **Benefit**: Guaranteed immutability and better type safety

### 2. Purely Functional Patterns

These patterns are native to functional programming:

#### **Monad Pattern**
- **Purpose**: Handling computations with context (error handling, async operations)
- **Examples**: Maybe, Either, IO, Promise
- **Benefit**: Composable error handling and side effect management

#### **Lens Pattern**
- **Purpose**: Immutable updates to nested data structures
- **Examples**: Object property access, array element updates
- **Benefit**: Clean updates without mutation

#### **Reader Pattern**
- **Purpose**: Dependency injection without explicit passing
- **Examples**: Configuration, database connections, logging
- **Benefit**: Clean separation of concerns

#### **Maybe/Option Pattern**
- **Purpose**: Handling nullable values safely
- **Examples**: Database queries, API responses, user input
- **Benefit**: Eliminate null pointer exceptions

## Key Concepts

### Higher-Order Functions

Functions that operate on other functions, either by taking them as arguments or returning them:

```typescript
// Traditional Strategy Pattern
interface PaymentStrategy {
  process(amount: number): boolean;
}

// Functional Strategy Pattern
type PaymentProcessor = (amount: number) => boolean;

const processPayment = (processor: PaymentProcessor) => (amount: number) => {
  return processor(amount);
};
```

### Function Composition

Building complex operations by combining simpler functions:

```typescript
// Traditional Decorator Pattern
abstract class Coffee {
  abstract cost(): number;
  abstract description(): string;
}

// Functional Decorator Pattern
type CoffeeModifier = (coffee: Coffee) => Coffee;

const addMilk: CoffeeModifier = (coffee) => ({
  ...coffee,
  cost: coffee.cost + 0.5,
  description: `${coffee.description} + Milk`
});

const compose = <T>(...fns: Array<(arg: T) => T>) => (arg: T) => 
  fns.reduceRight((acc, fn) => fn(acc), arg);
```

### Immutability

Data structures that cannot be modified after creation:

```typescript
// Traditional Builder Pattern (mutable)
class UserBuilder {
  private user: Partial<User> = {};
  
  setName(name: string): this {
    this.user.name = name; // Mutation
    return this;
  }
}

// Functional Builder Pattern (immutable)
type UserBuilder = {
  name?: string;
  email?: string;
  age?: number;
};

const setName = (name: string) => (builder: UserBuilder): UserBuilder => ({
  ...builder,
  name
});
```

## Modern TypeScript Features for Functional Patterns

### Utility Types

```typescript
// Partial updates
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Readonly immutability
type ImmutableUser = Readonly<{
  id: number;
  name: string;
  preferences: Readonly<{
    theme: string;
    language: string;
  }>;
}>;
```

### Template Literal Types

```typescript
// Type-safe event handling
type EventMap = {
  'user:created': { userId: number; name: string };
  'user:updated': { userId: number; changes: Partial<User> };
  'user:deleted': { userId: number };
};

type EventHandler<T extends keyof EventMap> = (data: EventMap[T]) => void;
```

### Discriminated Unions

```typescript
// Maybe/Option pattern
type Maybe<T> = 
  | { kind: 'some'; value: T }
  | { kind: 'none' };

// Result pattern
type Result<T, E> = 
  | { kind: 'success'; value: T }
  | { kind: 'error'; error: E };
```

## Performance Considerations

### Structural Sharing

Functional data structures use structural sharing to avoid copying entire objects:

```typescript
// Immutable updates with structural sharing
const updateUser = (user: User, updates: Partial<User>): User => ({
  ...user,
  ...updates,
  updatedAt: new Date()
});
```

### Lazy Evaluation

Computations are deferred until needed:

```typescript
// Lazy sequence processing
const lazyMap = <T, U>(fn: (x: T) => U) => function*(iterable: Iterable<T>) {
  for (const item of iterable) {
    yield fn(item);
  }
};
```

### Memoization

Caching function results for expensive computations:

```typescript
const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
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
```

## When to Use Functional Patterns

### Choose Functional Patterns When:

1. **Complex State Management**: When you need predictable state updates
2. **Concurrent Operations**: When dealing with multi-threaded environments
3. **Data Transformation**: When processing large datasets or streams
4. **Error Handling**: When you need composable error handling
5. **Testing**: When you need highly testable code

### Stick with OOP Patterns When:

1. **Modeling Real-World Entities**: When objects naturally represent domain concepts
2. **Polymorphism**: When you need runtime type dispatch
3. **Encapsulation**: When you need to hide implementation details
4. **Legacy Integration**: When working with existing OOP codebases
5. **Team Familiarity**: When the team is more comfortable with OOP

## Pattern Relationships

### Functional Pattern Combinations

```typescript
// Combining Reader + Maybe + Either for robust error handling
type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
};

type Reader<R, A> = (env: R) => A;
type Maybe<T> = T | null;
type Either<E, A> = { kind: 'left'; value: E } | { kind: 'right'; value: A };

// Reader for dependency injection
const getUser: Reader<DatabaseConfig, Maybe<User>> = (config) => {
  // Implementation using config
  return null; // or user
};

// Maybe for null handling
const processUser = (user: Maybe<User>): Either<string, ProcessedUser> => {
  if (user === null) {
    return { kind: 'left', value: 'User not found' };
  }
  // Process user
  return { kind: 'right', value: processedUser };
};
```

## Learning Path

1. **Start with Higher-Order Functions**: Understand function composition
2. **Practice Immutability**: Learn to update data without mutation
3. **Explore Monads**: Understand context-aware computations
4. **Master Composition**: Combine patterns for complex scenarios
5. **Apply to Real Projects**: Implement functional patterns in production code

## Tools and Libraries

### TypeScript Functional Libraries

- **Ramda**: Functional utility library
- **fp-ts**: Functional programming in TypeScript
- **Lodash/FP**: Functional version of Lodash
- **RxJS**: Reactive programming library
- **Immutable.js**: Immutable data structures

### Development Tools

- **ESLint**: Functional programming rules
- **TypeScript**: Advanced type system for functional programming
- **Prettier**: Code formatting
- **Jest**: Testing framework with functional testing utilities

## Conclusion

Functional programming patterns offer powerful alternatives to traditional object-oriented design patterns. They emphasize immutability, composition, and declarative programming, leading to more predictable, testable, and maintainable code.

The key is not to replace all OOP patterns with functional ones, but to choose the right paradigm for each specific problem. Modern TypeScript provides excellent support for both paradigms, allowing you to use the best of both worlds.

Each pattern folder in this section contains detailed implementations showing how to apply functional programming principles to solve real-world problems. The examples demonstrate both the theoretical concepts and practical applications, with comprehensive testing and performance considerations.

---

*This introduction serves as a foundation for understanding functional programming patterns. Each individual pattern folder contains detailed implementations, use cases, and practical examples demonstrating how to apply these concepts in real TypeScript applications.* 