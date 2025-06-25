import { exit } from "process";

// ============================================================================
// MONAD INTERFACE AND BASE IMPLEMENTATIONS
// ============================================================================

// Base monad interface
interface Monad<T> {
  flatMap<U>(fn: (value: T) => Monad<U>): Monad<U>;
  map<U>(fn: (value: T) => U): Monad<U>;
}

// ============================================================================
// MAYBE/Option MONAD
// ============================================================================

type Maybe<T> = Just<T> | Nothing;

class Just<T> implements Monad<T> {
  constructor(private value: T) {}

  flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return fn(this.value);
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    return new Just(fn(this.value));
  }

  getOrElse(defaultValue: T): T {
    return this.value;
  }

  isJust(): boolean {
    return true;
  }

  isNothing(): boolean {
    return false;
  }

  toString(): string {
    return `Just(${this.value})`;
  }
}

class Nothing implements Monad<any> {
  flatMap<U>(fn: (value: any) => Maybe<U>): Maybe<U> {
    return new Nothing();
  }

  map<U>(fn: (value: any) => U): Maybe<U> {
    return new Nothing();
  }

  getOrElse<T>(defaultValue: T): T {
    return defaultValue;
  }

  isJust(): boolean {
    return false;
  }

  isNothing(): boolean {
    return true;
  }

  toString(): string {
    return "Nothing";
  }
}

// Maybe utility functions
const maybe = {
  just: <T>(value: T): Maybe<T> => new Just(value),
  nothing: <T>(): Maybe<T> => new Nothing(),
  fromNullable: <T>(value: T | null | undefined): Maybe<T> => 
    value === null || value === undefined ? new Nothing() : new Just(value),
  fromPredicate: <T>(predicate: (value: T) => boolean, value: T): Maybe<T> =>
    predicate(value) ? new Just(value) : new Nothing()
};

// ============================================================================
// EITHER/RESULT MONAD
// ============================================================================

type Either<L, R> = Left<L> | Right<R>;

class Right<T> implements Monad<T> {
  constructor(private value: T) {}

  flatMap<U>(fn: (value: T) => Either<any, U>): Either<any, U> {
    return fn(this.value);
  }

  map<U>(fn: (value: T) => U): Either<any, U> {
    return new Right(fn(this.value));
  }

  fold<U>(leftFn: (error: any) => U, rightFn: (value: T) => U): U {
    return rightFn(this.value);
  }

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return true;
  }

  getOrElse(defaultValue: T): T {
    return this.value;
  }

  toString(): string {
    return `Right(${this.value})`;
  }
}

class Left<T> implements Monad<any> {
  constructor(private error: T) {}

  flatMap<U>(fn: (value: any) => Either<any, U>): Either<any, U> {
    return new Left(this.error);
  }

  map<U>(fn: (value: any) => U): Either<any, U> {
    return new Left(this.error);
  }

  fold<U>(leftFn: (error: T) => U, rightFn: (value: any) => U): U {
    return leftFn(this.error);
  }

  isLeft(): boolean {
    return true;
  }

  isRight(): boolean {
    return false;
  }

  getOrElse<T>(defaultValue: T): T {
    return defaultValue;
  }

  toString(): string {
    return `Left(${this.error})`;
  }
}

// Either utility functions
const either = {
  right: <T>(value: T): Either<any, T> => new Right(value),
  left: <T>(error: T): Either<T, any> => new Left(error),
  fromNullable: <T>(value: T | null | undefined, error: string): Either<string, T> =>
    value === null || value === undefined ? new Left(error) : new Right(value),
  fromPredicate: <T>(predicate: (value: T) => boolean, value: T, error: string): Either<string, T> =>
    predicate(value) ? new Right(value) : new Left(error)
};

// ============================================================================
// IO MONAD
// ============================================================================

class IO<T> implements Monad<T> {
  constructor(private effect: () => T) {}

  flatMap<U>(fn: (value: T) => IO<U>): IO<U> {
    return new IO(() => {
      const result = this.effect();
      return fn(result).run();
    });
  }

  map<U>(fn: (value: T) => U): IO<U> {
    return new IO(() => fn(this.effect()));
  }

  run(): T {
    return this.effect();
  }

  static unit<T>(value: T): IO<T> {
    return new IO(() => value);
  }

  static fromEffect<T>(effect: () => T): IO<T> {
    return new IO(effect);
  }
}

// ============================================================================
// STATE MONAD
// ============================================================================

class State<S, T> implements Monad<T> {
  constructor(private runState: (state: S) => [T, S]) {}

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

  static unit<S, T>(value: T): State<S, T> {
    return new State(state => [value, state]);
  }

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

// ============================================================================
// ASYNC MONAD
// ============================================================================

class Async<T> implements Monad<T> {
  constructor(private promise: Promise<T>) {}

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

  static fromPromise<T>(promise: Promise<T>): Async<T> {
    return new Async(promise);
  }

  static fromValue<T>(value: T): Async<T> {
    return new Async(Promise.resolve(value));
  }

  static fromEffect<T>(effect: () => Promise<T>): Async<T> {
    return new Async(effect());
  }
}

// ============================================================================
// PRACTICAL EXAMPLES
// ============================================================================

// Example 1: Data Validation Pipeline
interface User {
  email: string;
  password: string;
  age: number;
}

type ValidationResult<T> = Either<string[], T>;

const validateEmail = (email: string): ValidationResult<string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) 
    ? either.right(email)
    : either.left(['Invalid email format']);
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
  
  return errors.length > 0 ? either.left(errors) : either.right(password);
};

const validateAge = (age: number): ValidationResult<number> => {
  return age >= 18 && age <= 120 
    ? either.right(age)
    : either.left(['Age must be between 18 and 120']);
};

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

// Example 2: Configuration Management
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

// Example 3: Shopping Cart with State Monad
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

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
  return new State<CartState, void>(() => [undefined, { items: [], total: 0 }]);
};

// Example 4: IO Operations
const readFile = (path: string): IO<string> => {
  return IO.fromEffect(() => {
    // Simulate file reading
    console.log(`Reading file: ${path}`);
    return `Content of ${path}`;
  });
};

const writeFile = (path: string, content: string): IO<void> => {
  return IO.fromEffect(() => {
    console.log(`Writing to file: ${path}`);
    console.log(`Content: ${content}`);
  });
};

const processFile = (inputPath: string, outputPath: string): IO<void> => {
  return readFile(inputPath)
    .map(content => content.toUpperCase())
    .flatMap(processedContent => writeFile(outputPath, processedContent));
};

// Example 5: Async Operations with Error Handling
const fetchUser = (id: number): Async<User> => {
  return Async.fromEffect(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    if (id === 1) {
      return { email: "user@example.com", password: "Password123", age: 25 };
    } else {
      throw new Error("User not found");
    }
  });
};

const fetchUserPosts = (userId: number): Async<string[]> => {
  return Async.fromEffect(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [`Post 1 by user ${userId}`, `Post 2 by user ${userId}`];
  });
};

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

const demonstrateMaybeMonad = () => {
  console.log("\n=== Maybe Monad Examples ===");
  
  // Basic Maybe operations
  const justValue = maybe.just(42);
  const nothingValue = maybe.nothing();
  
  console.log("Just(42):", justValue.toString());
  console.log("Nothing:", nothingValue.toString());
  
  // Mapping over Maybe
  const doubled = justValue.map(x => x * 2);
  console.log("Just(42).map(x => x * 2):", doubled.toString());
  
  // Flat mapping
  const safeDivide = (x: number) => (y: number): Maybe<number> => 
    y === 0 ? maybe.nothing() : maybe.just(x / y);
  
  const division1 = justValue.flatMap(x => safeDivide(x)(2));
  const division2 = justValue.flatMap(x => safeDivide(x)(0));
  
  console.log("Safe division 42 / 2:", division1.toString());
  console.log("Safe division 42 / 0:", division2.toString());
  
  // From nullable
  const fromNull = maybe.fromNullable(null);
  const fromUndefined = maybe.fromNullable(undefined);
  const fromValue = maybe.fromNullable("hello");
  
  console.log("fromNullable(null):", fromNull.toString());
  console.log("fromNullable(undefined):", fromUndefined.toString());
  console.log("fromNullable('hello'):", fromValue.toString());
};

const demonstrateEitherMonad = () => {
  console.log("\n=== Either Monad Examples ===");
  
  // Basic Either operations
  const rightValue = either.right(42);
  const leftValue = either.left("Error occurred");
  
  console.log("Right(42):", rightValue.toString());
  console.log("Left('Error occurred'):", leftValue.toString());
  
  // Mapping over Either
  const doubled = rightValue.map(x => x * 2);
  const errorDoubled = leftValue.map(x => x * 2);
  
  console.log("Right(42).map(x => x * 2):", doubled.toString());
  console.log("Left('Error').map(x => x * 2):", errorDoubled.toString());
  
  // Flat mapping
  const safeDivide = (x: number) => (y: number): Either<string, number> => 
    y === 0 ? either.left("Division by zero") : either.right(x / y);
  
  const division1 = rightValue.flatMap(x => safeDivide(x)(2));
  const division2 = rightValue.flatMap(x => safeDivide(x)(0));
  
  console.log("Safe division 42 / 2:", division1.toString());
  console.log("Safe division 42 / 0:", division2.toString());
  
  // Folding
  const result1 = rightValue.fold(
    error => `Error: ${error}`,
    value => `Success: ${value}`
  );
  const result2 = leftValue.fold(
    error => `Error: ${error}`,
    value => `Success: ${value}`
  );
  
  console.log("Right fold result:", result1);
  console.log("Left fold result:", result2);
};

const demonstrateValidationPipeline = () => {
  console.log("\n=== Validation Pipeline Examples ===");
  
  // Valid user
  const validUser = {
    email: "user@example.com",
    password: "Password123",
    age: 25
  };
  
  const validResult = validateUser(validUser);
  console.log("Valid user validation:", validResult.toString());
  
  // Invalid user
  const invalidUser = {
    email: "invalid-email",
    password: "weak",
    age: 15
  };
  
  const invalidResult = validateUser(invalidUser);
  console.log("Invalid user validation:", invalidResult.toString());
  
  // Handle validation results
  validResult.fold(
    errors => console.log("Validation failed:", errors),
    user => console.log("Validation successful:", user)
  );
  
  invalidResult.fold(
    errors => console.log("Validation failed:", errors),
    user => console.log("Validation successful:", user)
  );
};

const demonstrateStateMonad = () => {
  console.log("\n=== State Monad Examples ===");
  
  const initialState: CartState = { items: [], total: 0 };
  
  // Add items to cart
  const cartOperation = addItem({ id: 1, name: "Book", price: 20, quantity: 1 })
    .flatMap(() => addItem({ id: 2, name: "Pen", price: 5, quantity: 2 }))
    .flatMap(() => removeItem(1))
    .flatMap(() => State.unit<CartState, void>(undefined));
  
  const [result, finalState] = cartOperation.run(initialState);
  
  console.log("Initial cart state:", initialState);
  console.log("Final cart state:", finalState);
  
  // Complex cart operation
  const complexOperation = addItem({ id: 1, name: "Laptop", price: 1000, quantity: 1 })
    .flatMap(() => addItem({ id: 2, name: "Mouse", price: 50, quantity: 1 }))
    .flatMap(() => addItem({ id: 1, name: "Laptop", price: 1000, quantity: 1 })) // Duplicate
    .flatMap(() => new State<CartState, CartState>(state => [state, state]))
    .map(state => {
      console.log("Current cart state:", state);
      return state;
    });
  
  const [finalCart, finalCartState] = complexOperation.run(initialState);
  console.log("Complex operation result:", finalCart);
};

const demonstrateIOMonad = () => {
  console.log("\n=== IO Monad Examples ===");
  
  // Simple IO operation
  const simpleIO = IO.unit("Hello, World!")
    .map(str => str.toUpperCase())
    .flatMap(str => IO.fromEffect(() => {
      console.log("IO Result:", str);
      return str.length;
    }));
  
  const ioResult = simpleIO.run();
  console.log("IO operation result:", ioResult);
  
  // File processing simulation
  const fileProcessing = processFile("input.txt", "output.txt");
  console.log("Starting file processing...");
  fileProcessing.run();
  console.log("File processing completed");
};

const demonstrateAsyncMonad = () => {
  console.log("\n=== Async Monad Examples ===");
  
  // Simple async operation
  const asyncOperation = Async.fromValue(42)
    .map(x => x * 2)
    .flatMap(x => Async.fromEffect(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return x + 10;
    }));
  
  asyncOperation.run().then(result => {
    console.log("Async operation result:", result);
  });
  
  // User fetching with error handling
  const userOperation = fetchUser(1)
    .flatMap(user => 
      fetchUserPosts(user.age)
        .map(posts => ({ ...user, posts }))
    );
  
  userOperation.run().then(result => {
    console.log("User with posts:", result);
  }).catch(error => {
    console.log("Error fetching user:", error.message);
  });
};

const demonstrateConfigurationManagement = () => {
  console.log("\n=== Configuration Management Examples ===");
  
  // Simulate environment variables
  process.env.PORT = "3000";
  process.env.DATABASE_URL = "postgresql://localhost:5432/myapp";
  // LOG_LEVEL not set
  
  const port = Config.fromEnv('PORT')
    .map(Number)
    .orElse(3000);
    
  const databaseUrl = Config.fromEnv('DATABASE_URL')
    .orElse('postgresql://localhost:5432/default');
    
  const logLevel = Config.fromEnv('LOG_LEVEL')
    .map(level => level.toUpperCase())
    .orElse('INFO');
    
  console.log("Configuration:");
  console.log("- Port:", port);
  console.log("- Database URL:", databaseUrl);
  console.log("- Log Level:", logLevel);
  
  // Configuration with transformation
  const config = Config.fromEnv('PORT')
    .map(Number)
    .flatMap(port => 
      Config.fromEnv('DATABASE_URL')
        .map(dbUrl => ({ port, databaseUrl: dbUrl }))
    )
    .orElse({ port: 3000, databaseUrl: 'default' });
    
  console.log("Combined config:", config);
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = () => {
  console.log("🚀 Monad Pattern Examples");
  console.log("=" .repeat(50));
  
  try {
    demonstrateMaybeMonad();
    demonstrateEitherMonad();
    demonstrateValidationPipeline();
    demonstrateStateMonad();
    demonstrateIOMonad();
    demonstrateAsyncMonad();
    demonstrateConfigurationManagement();
    
    console.log("\n✅ All monad examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running monad examples:", error);
  }
};

// Run the examples
main();

exit(0); 