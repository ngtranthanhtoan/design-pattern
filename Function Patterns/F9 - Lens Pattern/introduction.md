# Lens Pattern - Immutable Data Access and Updates

## What is the Lens Pattern?

The Lens pattern is a functional programming concept that provides a way to access and update deeply nested immutable data structures. Lenses act as "getters and setters" for immutable data, allowing you to read and modify nested properties without mutating the original data structure.

## Core Concepts

### Lens Structure
A lens consists of two functions:
- **get**: Extracts a value from a data structure
- **set**: Creates a new data structure with an updated value

### Lens Laws
A proper lens must satisfy three laws:

1. **Get-Set Law**: `set(lens, get(lens, data), data) === data`
2. **Set-Get Law**: `get(lens, set(lens, value, data)) === value`
3. **Set-Set Law**: `set(lens, value2, set(lens, value1, data)) === set(lens, value2, data)`

## Structure

```typescript
interface Lens<S, A> {
  get: (source: S) => A;
  set: (value: A, source: S) => S;
  modify: (fn: (value: A) => A, source: S) => S;
  compose: <B>(other: Lens<A, B>): Lens<S, B>;
}
```

## Basic Lens Implementation

```typescript
class SimpleLens<S, A> {
  constructor(
    private getter: (source: S) => A,
    private setter: (value: A, source: S) => S
  ) {}

  get(source: S): A {
    return this.getter(source);
  }

  set(value: A, source: S): S {
    return this.setter(value, source);
  }

  modify(fn: (value: A) => A, source: S): S {
    return this.set(fn(this.get(source)), source);
  }

  compose<B>(other: Lens<A, B>): Lens<S, B> {
    return new SimpleLens<S, B>(
      (source: S) => other.get(this.get(source)),
      (value: B, source: S) => this.set(other.set(value, this.get(source)), source)
    );
  }
}
```

## Common Lens Types

### 1. Property Lens
Access and update object properties:

```typescript
const prop = <K extends keyof T, T>(key: K): Lens<T, T[K]> => {
  return new SimpleLens<T, T[K]>(
    (obj: T) => obj[key],
    (value: T[K], obj: T) => ({ ...obj, [key]: value })
  );
};
```

### 2. Array Lens
Access and update array elements:

```typescript
const index = <T>(index: number): Lens<T[], T> => {
  return new SimpleLens<T[], T>(
    (arr: T[]) => arr[index],
    (value: T, arr: T[]) => {
      const newArr = [...arr];
      newArr[index] = value;
      return newArr;
    }
  );
};
```

### 3. Optional Lens
Handle nullable or undefined values:

```typescript
const optional = <T>(): Lens<T | null, T> => {
  return new SimpleLens<T | null, T>(
    (value: T | null) => value!,
    (newValue: T, value: T | null) => newValue
  );
};
```

## Benefits

### 1. Immutability
- Never mutate original data structures
- Predictable state changes
- Easy to track changes
- Thread-safe operations

### 2. Composition
- Combine lenses to access deeply nested data
- Reusable lens components
- Type-safe composition
- Declarative data access

### 3. Type Safety
- Compile-time guarantees about data access
- Prevents runtime errors
- Clear contracts for data operations
- IntelliSense support

### 4. Testability
- Pure functions, easy to test
- Isolated data operations
- Predictable behavior
- No side effects

## Drawbacks

### 1. Learning Curve
- Abstract functional concepts
- Requires understanding of immutability
- Complex for simple operations
- May be overkill for simple cases

### 2. Performance Overhead
- Object copying on every update
- Function call overhead
- Memory allocation for new objects
- May not be suitable for large data structures

### 3. Verbosity
- More code than direct mutation
- Can be verbose for simple updates
- Requires understanding of lens laws
- Additional abstraction layer

## When to Use

### ✅ Good Use Cases
- **Immutable State Management**: When you need immutable state updates
- **Deep Data Access**: When accessing deeply nested data structures
- **Functional Programming**: When following functional programming principles
- **React/Redux**: When managing application state
- **Data Validation**: When building validation pipelines
- **Configuration Management**: When managing complex configurations

### ❌ Avoid When
- **Simple Operations**: For straightforward property access
- **Performance Critical**: When performance is the primary concern
- **Mutable Data**: When working with mutable data structures
- **Over-Engineering**: When simpler solutions suffice

## Related Patterns

### 1. Functor Pattern
- Provides `map` operation for transforming values
- Lenses can be viewed as functors

### 2. Monad Pattern
- Provides `flatMap` operation for chaining operations
- Lenses can be composed like monads

### 3. Immutable Data Structures
- Libraries like Immutable.js, Immer
- Built-in support for immutable updates
- Performance optimizations

### 4. Optics Pattern
- Generalization of lenses
- Includes prisms, traversals, and isos
- More powerful abstractions

## Real-World Applications

### 1. State Management
- **Redux**: Immutable state updates
- **React**: Component state management
- **Vue**: Reactive state management
- **Angular**: Change detection

### 2. Form Libraries
- **Formik**: Form state management
- **React Hook Form**: Form validation
- **Final Form**: Form state updates
- **Redux Form**: Form state in Redux

### 3. Data Processing
- **ETL Pipelines**: Data transformation
- **API Response Handling**: Nested data access
- **Configuration Management**: Settings updates
- **Validation**: Data validation pipelines

### 4. Functional Libraries
- **Ramda**: Functional programming utilities
- **Lodash/fp**: Functional programming with Lodash
- **fp-ts**: TypeScript functional programming
- **monocle-ts**: Optics for TypeScript

## Best Practices

### 1. Follow Lens Laws
- Ensure your lens implementations follow the laws
- Test the laws with property-based testing
- Use established libraries when possible

### 2. Compose Lenses
- Build complex lenses from simple ones
- Reuse common lens patterns
- Keep lenses focused and single-purpose

### 3. Use Type Safety
- Leverage TypeScript for type safety
- Define clear interfaces for your data
- Use generic types for reusability

### 4. Consider Performance
- Profile lens operations for performance
- Use immutable data structure libraries
- Consider memoization for expensive operations

## Anti-Patterns

### 1. Lens Abuse
- Using lenses for simple property access
- Over-engineering simple updates
- Ignoring simpler solutions

### 2. Breaking Immutability
- Mutating data within lens operations
- Mixing mutable and immutable operations
- Inconsistent data handling

### 3. Complex Lens Composition
- Creating overly complex lens chains
- Hard to understand lens operations
- Poor performance due to deep nesting

## Modern Alternatives

### 1. Object Spread Operator
- JavaScript's spread operator for shallow updates
- Simple and readable
- Limited to shallow updates

### 2. Immer
- Immutable updates with mutable syntax
- Automatic immutability
- Better performance than manual copying

### 3. Immutable.js
- Immutable data structures
- Optimized for performance
- Rich API for data manipulation

### 4. Structural Sharing
- Libraries that implement structural sharing
- Efficient immutable updates
- Minimal memory overhead

## Conclusion

The Lens pattern provides a powerful way to handle immutable data access and updates in functional programming. While it has a learning curve and may be overkill for simple operations, lenses excel at managing complex, nested data structures in a type-safe and composable way.

The key is to start with simple lenses and gradually build up to more complex applications. When used appropriately, lenses can significantly improve code quality, maintainability, and developer experience in functional programming contexts. 