# Maybe/Option Pattern

## What is the Maybe/Option Pattern?

The Maybe (also called Option) pattern is a functional programming approach to handling nullable values safely. Instead of using `null` or `undefined` directly, we wrap values in a container that explicitly represents the presence or absence of a value, making null-safety a compile-time concern rather than a runtime error.

## Problem with Traditional Null Handling

### Traditional JavaScript/TypeScript Approach
```typescript
// Prone to null pointer exceptions
function getUser(id: string): User | null {
  return database.findUser(id); // Could return null
}

function getUserEmail(userId: string): string | null {
  const user = getUser(userId);
  if (user === null) {
    return null;
  }
  return user.email;
}

// Easy to forget null checks
const email = getUserEmail("123");
console.log(email.toUpperCase()); // 💥 Runtime error if email is null
```

### Problems:
- Easy to forget null checks
- Runtime errors from null pointer exceptions
- No compile-time safety
- Nested null checks become unwieldy
- Difficult to chain operations on nullable values

## Maybe/Option Pattern Solution

### Functional Maybe Pattern
```typescript
// Safe container for potentially missing values
type Maybe<T> = 
  | { kind: 'some'; value: T }
  | { kind: 'none' };

const some = <T>(value: T): Maybe<T> => ({ kind: 'some', value });
const none = <T>(): Maybe<T> => ({ kind: 'none' });

function getUser(id: string): Maybe<User> {
  const user = database.findUser(id);
  return user ? some(user) : none();
}

function getUserEmail(userId: string): Maybe<string> {
  return map(getUser(userId), user => user.email);
}

// Safe chaining - no runtime errors possible
const emailUpper = pipe(
  getUserEmail("123"),
  map(email => email.toUpperCase()),
  withDefault("NO EMAIL")
);
```

## Key Benefits

1. **Compile-Time Safety**: TypeScript forces you to handle both cases
2. **Explicit Nullability**: The type system shows when values might be missing
3. **Composable Operations**: Chain operations safely without nested null checks
4. **No Runtime Errors**: Eliminates null pointer exceptions
5. **Functional Composition**: Works well with other functional patterns
6. **Self-Documenting**: Code clearly shows which values are optional

## Pattern Structure

### Core Components
1. **Maybe Type**: Discriminated union representing Some or None
2. **Constructor Functions**: `some()` and `none()` for creating Maybe values
3. **Map Function**: Transform value inside Maybe without unwrapping
4. **FlatMap/Chain**: Flatten nested Maybe values
5. **Filter**: Convert Some to None based on predicate
6. **Utility Functions**: Extract values, provide defaults, check presence

### TypeScript Implementation
```typescript
// Core Maybe type
type Maybe<T> = 
  | { kind: 'some'; value: T }
  | { kind: 'none' };

// Constructor functions
const some = <T>(value: T): Maybe<T> => ({ kind: 'some', value });
const none = <T>(): Maybe<T> => ({ kind: 'none' });

// Core operations
const map = <T, U>(maybe: Maybe<T>, fn: (value: T) => U): Maybe<U> => {
  return maybe.kind === 'some' ? some(fn(maybe.value)) : none();
};

const flatMap = <T, U>(maybe: Maybe<T>, fn: (value: T) => Maybe<U>): Maybe<U> => {
  return maybe.kind === 'some' ? fn(maybe.value) : none();
};

const filter = <T>(maybe: Maybe<T>, predicate: (value: T) => boolean): Maybe<T> => {
  return maybe.kind === 'some' && predicate(maybe.value) ? maybe : none();
};
```

## Common Use Cases

### 1. Database Queries
```typescript
type User = { id: string; name: string; email: string };

const findUserById = (id: string): Maybe<User> => {
  // Simulate database lookup
  const users = [
    { id: '1', name: 'John', email: 'john@example.com' },
    { id: '2', name: 'Jane', email: 'jane@example.com' }
  ];
  
  const user = users.find(u => u.id === id);
  return user ? some(user) : none();
};

const getUserDisplayName = (id: string): string => {
  return pipe(
    findUserById(id),
    map(user => user.name),
    withDefault('Unknown User')
  );
};
```

### 2. Configuration Values
```typescript
type Config = {
  apiUrl?: string;
  timeout?: number;
  apiKey?: string;
};

const getConfigValue = <K extends keyof Config>(
  config: Config, 
  key: K
): Maybe<NonNullable<Config[K]>> => {
  const value = config[key];
  return value !== undefined ? some(value) : none();
};

const getApiUrl = (config: Config): string => {
  return pipe(
    getConfigValue(config, 'apiUrl'),
    withDefault('https://api.default.com')
  );
};
```

### 3. Array Operations
```typescript
const first = <T>(array: T[]): Maybe<T> => {
  return array.length > 0 ? some(array[0]) : none();
};

const last = <T>(array: T[]): Maybe<T> => {
  return array.length > 0 ? some(array[array.length - 1]) : none();
};

const find = <T>(array: T[], predicate: (item: T) => boolean): Maybe<T> => {
  const found = array.find(predicate);
  return found !== undefined ? some(found) : none();
};
```

### 4. API Response Handling
```typescript
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

const extractData = <T>(response: ApiResponse<T>): Maybe<T> => {
  return response.success && response.data ? some(response.data) : none();
};

const processApiResponse = <T>(response: ApiResponse<T>): string => {
  return pipe(
    extractData(response),
    map(data => JSON.stringify(data)),
    withDefault('No data available')
  );
};
```

### 5. Form Validation
```typescript
type FormData = {
  email: string;
  age: string;
  name: string;
};

const parseAge = (ageStr: string): Maybe<number> => {
  const age = parseInt(ageStr, 10);
  return !isNaN(age) && age > 0 && age < 150 ? some(age) : none();
};

const validateEmail = (email: string): Maybe<string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? some(email) : none();
};

const processForm = (form: FormData): Maybe<{ name: string; email: string; age: number }> => {
  return flatMap(validateEmail(form.email), email =>
    flatMap(parseAge(form.age), age =>
      some({ name: form.name, email, age })
    )
  );
};
```

## Advanced Patterns

### Maybe Chaining and Composition
```typescript
const pipe = <T>(value: T, ...fns: Array<(arg: any) => any>): any => {
  return fns.reduce((acc, fn) => fn(acc), value);
};

const compose = <T, U, V>(
  f: (arg: U) => V,
  g: (arg: T) => U
): (arg: T) => V => {
  return (arg: T) => f(g(arg));
};

// Complex chaining example
const processUserData = (userId: string): Maybe<string> => {
  return pipe(
    findUserById(userId),
    flatMap(user => validateEmail(user.email)),
    map(email => email.toLowerCase()),
    filter(email => email.endsWith('.com')),
    map(email => `Processed: ${email}`)
  );
};
```

### Multiple Maybe Values
```typescript
const combine2 = <T, U, R>(
  maybe1: Maybe<T>,
  maybe2: Maybe<U>,
  combiner: (a: T, b: U) => R
): Maybe<R> => {
  return flatMap(maybe1, a =>
    map(maybe2, b => combiner(a, b))
  );
};

const combine3 = <T, U, V, R>(
  maybe1: Maybe<T>,
  maybe2: Maybe<U>,
  maybe3: Maybe<V>,
  combiner: (a: T, b: U, c: V) => R
): Maybe<R> => {
  return flatMap(maybe1, a =>
    flatMap(maybe2, b =>
      map(maybe3, c => combiner(a, b, c))
    )
  );
};

// Usage
const createFullName = (first: string, middle: string, last: string): string => {
  return `${first} ${middle} ${last}`;
};

const getFullName = (
  firstName: Maybe<string>,
  middleName: Maybe<string>,
  lastName: Maybe<string>
): Maybe<string> => {
  return combine3(firstName, middleName, lastName, createFullName);
};
```

### Async Maybe Operations
```typescript
type AsyncMaybe<T> = Promise<Maybe<T>>;

const mapAsync = async <T, U>(
  asyncMaybe: AsyncMaybe<T>,
  fn: (value: T) => U | Promise<U>
): AsyncMaybe<U> => {
  const maybe = await asyncMaybe;
  if (maybe.kind === 'some') {
    const result = await fn(maybe.value);
    return some(result);
  }
  return none();
};

const flatMapAsync = async <T, U>(
  asyncMaybe: AsyncMaybe<T>,
  fn: (value: T) => AsyncMaybe<U>
): AsyncMaybe<U> => {
  const maybe = await asyncMaybe;
  return maybe.kind === 'some' ? fn(maybe.value) : none();
};

// Usage
const fetchUser = async (id: string): AsyncMaybe<User> => {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return response.ok ? some(user) : none();
  } catch {
    return none();
  }
};
```

## Utility Functions

### Essential Maybe Operations
```typescript
// Check if Maybe has a value
const isSome = <T>(maybe: Maybe<T>): maybe is { kind: 'some'; value: T } => {
  return maybe.kind === 'some';
};

const isNone = <T>(maybe: Maybe<T>): maybe is { kind: 'none' } => {
  return maybe.kind === 'none';
};

// Extract value with default
const withDefault = <T>(defaultValue: T) => (maybe: Maybe<T>): T => {
  return maybe.kind === 'some' ? maybe.value : defaultValue;
};

// Extract value or throw
const unwrap = <T>(maybe: Maybe<T>): T => {
  if (maybe.kind === 'some') {
    return maybe.value;
  }
  throw new Error('Attempted to unwrap None value');
};

// Convert from nullable
const fromNullable = <T>(value: T | null | undefined): Maybe<T> => {
  return value != null ? some(value) : none();
};

// Convert to nullable
const toNullable = <T>(maybe: Maybe<T>): T | null => {
  return maybe.kind === 'some' ? maybe.value : null;
};
```

## When to Use

### Choose Maybe/Option Pattern When:
- Working with values that might not exist
- Want to eliminate null pointer exceptions
- Need composable null-safe operations
- Building functional programming systems
- API responses might be empty
- Database queries might return no results
- Configuration values are optional

### Avoid When:
- Team is not familiar with functional programming
- Working with legacy code that expects nulls
- Performance is critical (adds small overhead)
- Simple null checks are sufficient
- Interoperating with libraries expecting nulls

## Performance Considerations

### Benefits:
- **Type Safety**: Eliminates runtime null errors
- **Composability**: Easy to chain operations
- **Explicit Design**: Makes optional values obvious
- **Functional Composition**: Works well with other patterns

### Considerations:
- **Memory Overhead**: Wrapper objects use slightly more memory
- **Learning Curve**: Team needs to understand the pattern
- **Object Creation**: Creates objects for each Maybe value
- **Interop**: May need conversion when working with nullable APIs

## Modern TypeScript Features

### Branded Types for Maybe
```typescript
declare const _brand: unique symbol;
type Brand<T, B> = T & { [_brand]: B };

type Some<T> = Brand<{ value: T }, 'Some'>;
type None = Brand<{}, 'None'>;
type Maybe<T> = Some<T> | None;
```

### Template Literal Types
```typescript
type MaybeKey<T> = `maybe${Capitalize<string & keyof T>}`;

type MaybeObject<T> = {
  [K in keyof T as MaybeKey<K>]: Maybe<T[K]>;
};
```

### Conditional Types for Maybe
```typescript
type UnwrapMaybe<T> = T extends Maybe<infer U> ? U : T;
type WrapMaybe<T> = T extends Maybe<any> ? T : Maybe<T>;

type AllSome<T extends readonly Maybe<any>[]> = 
  T extends readonly Maybe<infer U>[] ? Maybe<U[]> : never;
```

## Conclusion

The Maybe/Option pattern provides a robust, type-safe approach to handling nullable values in TypeScript. It eliminates null pointer exceptions, makes optional values explicit in the type system, and enables powerful functional composition patterns.

While it adds some conceptual overhead, the benefits of type safety, composability, and error elimination make it particularly valuable in applications where data integrity and reliability are important. The pattern works especially well in functional programming contexts and when combined with other functional patterns like pipe operations and function composition. 