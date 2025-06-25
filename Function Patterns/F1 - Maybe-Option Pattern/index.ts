/**
 * Maybe/Option Pattern
 * 
 * Demonstrates type-safe handling of nullable values using the Maybe pattern
 * instead of traditional null/undefined checking approaches.
 */

import { exit } from "process";

// Core Maybe type definition
type Maybe<T> = 
  | { kind: 'some'; value: T }
  | { kind: 'none' };

// Constructor functions
const some = <T>(value: T): Maybe<T> => ({ kind: 'some', value });
const none = <T>(): Maybe<T> => ({ kind: 'none' });

// Core operations (non-curried for direct use)
const map = <T, U>(maybe: Maybe<T>, fn: (value: T) => U): Maybe<U> => {
  return maybe.kind === 'some' ? some(fn(maybe.value)) : none();
};

const flatMap = <T, U>(maybe: Maybe<T>, fn: (value: T) => Maybe<U>): Maybe<U> => {
  return maybe.kind === 'some' ? fn(maybe.value) : none();
};

const filter = <T>(maybe: Maybe<T>, predicate: (value: T) => boolean): Maybe<T> => {
  return maybe.kind === 'some' && predicate(maybe.value) ? maybe : none();
};

// Curried versions for pipe composition
const mapWith = <T, U>(fn: (value: T) => U) => (maybe: Maybe<T>): Maybe<U> => {
  return map(maybe, fn);
};

const flatMapWith = <T, U>(fn: (value: T) => Maybe<U>) => (maybe: Maybe<T>): Maybe<U> => {
  return flatMap(maybe, fn);
};

const filterWith = <T>(predicate: (value: T) => boolean) => (maybe: Maybe<T>): Maybe<T> => {
  return filter(maybe, predicate);
};

// Utility functions
const isSome = <T>(maybe: Maybe<T>): maybe is { kind: 'some'; value: T } => {
  return maybe.kind === 'some';
};

const isNone = <T>(maybe: Maybe<T>): maybe is { kind: 'none' } => {
  return maybe.kind === 'none';
};

const withDefault = <T>(defaultValue: T) => (maybe: Maybe<T>): T => {
  return maybe.kind === 'some' ? maybe.value : defaultValue;
};

const fromNullable = <T>(value: T | null | undefined): Maybe<T> => {
  return value != null ? some(value) : none();
};

const toNullable = <T>(maybe: Maybe<T>): T | null => {
  return maybe.kind === 'some' ? maybe.value : null;
};

// Pipe utility for function composition
const pipe = <T>(value: T, ...fns: Array<(arg: any) => any>): any => {
  return fns.reduce((acc, fn) => fn(acc), value);
};

// Example data types
type User = {
  id: string;
  name: string;
  email: string;
  age?: number;
  address?: {
    street: string;
    city: string;
    zipCode: string;
  };
};

type Config = {
  apiUrl?: string;
  timeout?: number;
  apiKey?: string;
  features?: {
    logging?: boolean;
    analytics?: boolean;
  };
};

// Example: Database simulation
const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'New York',
      zipCode: '10001'
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com'
  }
];

// Safe database operations
const findUserById = (id: string): Maybe<User> => {
  const user = users.find(u => u.id === id);
  return fromNullable(user);
};

const findUserByEmail = (email: string): Maybe<User> => {
  const user = users.find(u => u.email === email);
  return fromNullable(user);
};

// Safe property access
const getUserAge = (user: User): Maybe<number> => {
  return fromNullable(user.age);
};

const getUserAddress = (user: User): Maybe<User['address']> => {
  return fromNullable(user.address);
};

const getAddressCity = (address: User['address']): Maybe<string> => {
  return fromNullable(address?.city);
};

// Configuration handling
const sampleConfig: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  features: {
    logging: true
  }
};

const getConfigValue = <K extends keyof Config>(
  config: Config, 
  key: K
): Maybe<NonNullable<Config[K]>> => {
  const value = config[key];
  return value !== undefined ? some(value as NonNullable<Config[K]>) : none();
};

// Array operations
const first = <T>(array: T[]): Maybe<T> => {
  return array.length > 0 ? some(array[0]) : none();
};

const last = <T>(array: T[]): Maybe<T> => {
  return array.length > 0 ? some(array[array.length - 1]) : none();
};

const find = <T>(array: T[], predicate: (item: T) => boolean): Maybe<T> => {
  const found = array.find(predicate);
  return fromNullable(found);
};

// Combining Maybe values
const combine2 = <T, U, R>(
  maybe1: Maybe<T>,
  maybe2: Maybe<U>,
  combiner: (a: T, b: U) => R
): Maybe<R> => {
  return flatMap(maybe1, a =>
    map(maybe2, b => combiner(a, b))
  );
};

// Demonstration functions
function demonstrateBasicMaybeOperations(): void {
  console.log("🎯 BASIC MAYBE OPERATIONS");
  console.log("=" + "=".repeat(27));
  
  // Test finding users
  const user1 = findUserById('1');
  const user999 = findUserById('999');
  
  console.log("User lookup results:");
  console.log(`  User 1 exists: ${isSome(user1)}`);
  console.log(`  User 999 exists: ${isSome(user999)}`);
  
  // Safe property access
  if (isSome(user1)) {
    console.log(`  User 1 name: ${user1.value.name}`);
  }
  
  // Using withDefault
  const userName = pipe(
    findUserById('999'),
    mapWith((user: User) => user.name),
    withDefault('Unknown User')
  );
  console.log(`  User 999 name with default: ${userName}`);
  
  console.log();
}

function demonstrateSafeChaining(): void {
  console.log("🔗 SAFE CHAINING OPERATIONS");
  console.log("=" + "=".repeat(29));
  
  // Chain operations safely
  const userAge = pipe(
    findUserById('1'),
    flatMapWith(getUserAge),
    withDefault(0)
  );
  
  const userCity = pipe(
    findUserById('1'),
    flatMapWith(getUserAddress),
    flatMapWith(getAddressCity),
    withDefault('Unknown City')
  );
  
  const missingUserCity = pipe(
    findUserById('2'),
    flatMapWith(getUserAddress),
    flatMapWith(getAddressCity),
    withDefault('Unknown City')
  );
  
  console.log("Safe chaining results:");
  console.log(`  User 1 age: ${userAge}`);
  console.log(`  User 1 city: ${userCity}`);
  console.log(`  User 2 city: ${missingUserCity}`);
  
  console.log();
}

function demonstrateFiltering(): void {
  console.log("🔍 FILTERING AND VALIDATION");
  console.log("=" + "=".repeat(30));
  
  // Filter based on conditions
  const adultUser = pipe(
    findUserById('1'),
    flatMapWith(getUserAge),
    filterWith((age: number) => age >= 18),
    mapWith((age: number) => `Adult age: ${age}`),
    withDefault('Not an adult or age unknown')
  );
  
  const validEmail = pipe(
    findUserByEmail('john@example.com'),
    mapWith((user: User) => user.email),
    filterWith((email: string) => email.includes('@')),
    mapWith((email: string) => email.toLowerCase()),
    withDefault('Invalid email')
  );
  
  console.log("Filtering results:");
  console.log(`  Adult user: ${adultUser}`);
  console.log(`  Valid email: ${validEmail}`);
  
  console.log();
}

function demonstrateArrayOperations(): void {
  console.log("📊 ARRAY OPERATIONS");
  console.log("=" + "=".repeat(19));
  
  const numbers = [1, 2, 3, 4, 5];
  const emptyArray: number[] = [];
  
  const firstNumber = pipe(
    first(numbers),
    withDefault(0)
  );
  
  const lastNumber = pipe(
    last(numbers),
    withDefault(0)
  );
  
  const firstEmptyNumber = pipe(
    first(emptyArray),
    withDefault(-1)
  );
  
  const evenNumber = pipe(
    find(numbers, n => n % 2 === 0),
    withDefault(0)
  );
  
  console.log("Array operation results:");
  console.log(`  First number: ${firstNumber}`);
  console.log(`  Last number: ${lastNumber}`);
  console.log(`  First from empty: ${firstEmptyNumber}`);
  console.log(`  First even number: ${evenNumber}`);
  
  console.log();
}

function demonstrateConfigurationHandling(): void {
  console.log("⚙️ CONFIGURATION HANDLING");
  console.log("=" + "=".repeat(28));
  
  const apiUrl = pipe(
    getConfigValue(sampleConfig, 'apiUrl'),
    withDefault('http://localhost:3000')
  );
  
  const timeout = pipe(
    getConfigValue(sampleConfig, 'timeout'),
    withDefault(1000)
  );
  
  const missingApiKey = pipe(
    getConfigValue(sampleConfig, 'apiKey'),
    withDefault('default-api-key')
  );
  
  // Nested configuration access
  const loggingEnabled = pipe(
    fromNullable(sampleConfig.features),
    flatMapWith((features: NonNullable<Config['features']>) => fromNullable(features.logging)),
    withDefault(false)
  );
  
  console.log("Configuration values:");
  console.log(`  API URL: ${apiUrl}`);
  console.log(`  Timeout: ${timeout}ms`);
  console.log(`  API Key: ${missingApiKey}`);
  console.log(`  Logging enabled: ${loggingEnabled}`);
  
  console.log();
}

function demonstrateCombiningMaybes(): void {
  console.log("🔧 COMBINING MAYBE VALUES");
  console.log("=" + "=".repeat(27));
  
  const user1 = findUserById('1');
  const user2 = findUserById('2');
  
  // Combine two users
  const combinedNames = combine2(
    user1,
    user2,
    (u1, u2) => `${u1.name} and ${u2.name}`
  );
  
  const combinedResult = pipe(
    combinedNames,
    withDefault('Cannot combine users')
  );
  
  // Try to combine with missing user
  const user999 = findUserById('999');
  const failedCombination = combine2(
    user1,
    user999,
    (u1, u2) => `${u1.name} and ${u2.name}`
  );
  
  const failedResult = pipe(
    failedCombination,
    withDefault('Cannot combine - user missing')
  );
  
  console.log("Combination results:");
  console.log(`  Combined existing users: ${combinedResult}`);
  console.log(`  Failed combination: ${failedResult}`);
  
  console.log();
}

function demonstrateErrorSafety(): void {
  console.log("🛡️ ERROR SAFETY DEMONSTRATION");
  console.log("=" + "=".repeat(32));
  
  // Simulate operations that might fail
  const parseNumber = (str: string): Maybe<number> => {
    const num = parseInt(str, 10);
    return isNaN(num) ? none() : some(num);
  };
  
  const divide = (a: number, b: number): Maybe<number> => {
    return b === 0 ? none() : some(a / b);
  };
  
  const operations = [
    { input: "42", divisor: "2", expected: "21" },
    { input: "invalid", divisor: "2", expected: "Error: Invalid number" },
    { input: "10", divisor: "0", expected: "Error: Division by zero" }
  ];
  
  console.log("Error-safe operations:");
  operations.forEach((op, index) => {
    const result = pipe(
      parseNumber(op.input),
      flatMapWith((num: number) => 
        pipe(
          parseNumber(op.divisor),
          flatMapWith((divisor: number) => divide(num, divisor))
        )
      ),
      mapWith((result: number) => `Result: ${result}`),
      withDefault('Error: Operation failed')
    );
    
    console.log(`  Operation ${index + 1}: ${result}`);
  });
  
  console.log();
}

function showPerformanceComparison(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("=" + "=".repeat(26));
  
  const iterations = 100000;
  console.log(`Running ${iterations} Maybe operations...`);
  
  const startTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    pipe(
      some(i),
      mapWith((x: number) => x * 2),
      filterWith((x: number) => x > 10),
      mapWith((x: number) => x.toString()),
      withDefault('0')
    );
  }
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  const operationsPerSecond = Math.round((iterations / duration) * 1000);
  
  console.log(`✨ Completed ${iterations} operations in ${duration}ms`);
  console.log(`📊 Performance: ~${operationsPerSecond} operations/second`);
  console.log(`🏃‍♂️ Average: ${(duration / iterations).toFixed(4)}ms per operation`);
  console.log();
  
  console.log("Key Performance Benefits:");
  console.log("• Type-safe null handling with zero runtime errors");
  console.log("• Efficient discriminated union checks");
  console.log("• Optimizable function composition");
  console.log("• No unexpected null pointer exceptions");
  console.log();
}

function showUsageExamples(): void {
  console.log("💡 PRACTICAL USAGE EXAMPLES");
  console.log("=" + "=".repeat(30));
  
  console.log("1. Safe database queries:");
  console.log(`   const user = findUserById(id);`);
  console.log(`   const name = pipe(user, mapWith(u => u.name), withDefault('Unknown'));`);
  console.log();
  
  console.log("2. Configuration access:");
  console.log(`   const timeout = pipe(getConfig('timeout'), withDefault(5000));`);
  console.log();
  
  console.log("3. Safe property access:");
  console.log(`   const city = pipe(user, flatMapWith(getAddress), mapWith(a => a.city));`);
  console.log();
  
  console.log("4. Error-safe parsing:");
  console.log(`   const number = pipe(parseNumber(input), withDefault(0));`);
  console.log();
  
  console.log("5. Array operations:");
  console.log(`   const firstItem = pipe(first(array), withDefault(null));`);
  console.log();
}

// Main execution
function main(): void {
  console.log("🎯 MAYBE/OPTION PATTERN");
  console.log("=" + "=".repeat(25));
  console.log();
  console.log("This pattern provides type-safe handling of nullable values,");
  console.log("eliminating null pointer exceptions and enabling safe composition.");
  console.log();
  
  demonstrateBasicMaybeOperations();
  demonstrateSafeChaining();
  demonstrateFiltering();
  demonstrateArrayOperations();
  demonstrateConfigurationHandling();
  demonstrateCombiningMaybes();
  demonstrateErrorSafety();
  showPerformanceComparison();
  showUsageExamples();
  
  console.log("🚀 COMPREHENSIVE EXAMPLE");
  console.log("=" + "=".repeat(23));
  console.log("Run the data processing pipeline:");
  console.log("npm run functional:maybe:pipeline");
  console.log();
  console.log("Key Benefits:");
  console.log("• Complete elimination of null pointer exceptions");
  console.log("• Type-safe composition of nullable operations");
  console.log("• Clear error handling without try/catch blocks");
  console.log("• Functional programming paradigms in TypeScript");
  console.log("• Performance comparable to direct null checks");
}

// Run the demonstration
main();
exit(0); 