import { exit } from "process";

// ============================================================================
// MONAD IMPLEMENTATIONS
// ============================================================================

/**
 * Maybe monad for handling potentially missing values.
 */
class Maybe<T> {
  private constructor(private value: T | null) {}

  static some<T>(value: T): Maybe<T> {
    return new Maybe(value);
  }

  static none<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }

  static fromNullable<T>(value: T | null | undefined): Maybe<T> {
    return value === null || value === undefined ? Maybe.none() : Maybe.some(value);
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    return this.value === null ? Maybe.none() : Maybe.some(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return this.value === null ? Maybe.none() : fn(this.value);
  }

  getOrElse(defaultValue: T): T {
    return this.value === null ? defaultValue : this.value;
  }

  isSome(): boolean {
    return this.value !== null;
  }

  isNone(): boolean {
    return this.value === null;
  }

  fold<U>(onNone: () => U, onSome: (value: T) => U): U {
    return this.value === null ? onNone() : onSome(this.value);
  }
}

/**
 * Either monad for handling success/failure scenarios.
 */
class Either<L, R> {
  private constructor(private left: L | null, private right: R | null) {}

  static left<L, R>(value: L): Either<L, R> {
    return new Either<L, R>(value, null);
  }

  static right<L, R>(value: R): Either<L, R> {
    return new Either<L, R>(null, value);
  }

  map<U>(fn: (value: R) => U): Either<L, U> {
    return this.isRight() ? Either.right<L, U>(fn(this.right!)) : Either.left<L, U>(this.left!);
  }

  flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U> {
    return this.isRight() ? fn(this.right!) : Either.left<L, U>(this.left!);
  }

  mapLeft<U>(fn: (value: L) => U): Either<U, R> {
    return this.isLeft() ? Either.left<U, R>(fn(this.left!)) : Either.right<U, R>(this.right!);
  }

  isLeft(): boolean {
    return this.left !== null;
  }

  isRight(): boolean {
    return this.right !== null;
  }

  fold<U>(onLeft: (value: L) => U, onRight: (value: R) => U): U {
    return this.isLeft() ? onLeft(this.left!) : onRight(this.right!);
  }

  getOrElse(defaultValue: R): R {
    return this.isRight() ? this.right! : defaultValue;
  }
}

/**
 * List monad for handling collections.
 */
class List<T> {
  private constructor(private values: T[]) {}

  static of<T>(...values: T[]): List<T> {
    return new List(values);
  }

  static empty<T>(): List<T> {
    return new List([]);
  }

  map<U>(fn: (value: T) => U): List<U> {
    return new List(this.values.map(fn));
  }

  flatMap<U>(fn: (value: T) => List<U>): List<U> {
    const results: U[] = [];
    for (const value of this.values) {
      const list = fn(value);
      results.push(...list.values);
    }
    return new List(results);
  }

  filter(predicate: (value: T) => boolean): List<T> {
    return new List(this.values.filter(predicate));
  }

  reduce<U>(fn: (acc: U, value: T) => U, initial: U): U {
    return this.values.reduce(fn, initial);
  }

  toArray(): T[] {
    return [...this.values];
  }

  length(): number {
    return this.values.length;
  }

  isEmpty(): boolean {
    return this.values.length === 0;
  }
}

/**
 * IO monad for handling side effects.
 */
class IO<T> {
  private constructor(private effect: () => T) {}

  static of<T>(value: T): IO<T> {
    return new IO(() => value);
  }

  static fromEffect<T>(effect: () => T): IO<T> {
    return new IO(effect);
  }

  map<U>(fn: (value: T) => U): IO<U> {
    return new IO(() => fn(this.effect()));
  }

  flatMap<U>(fn: (value: T) => IO<U>): IO<U> {
    return new IO(() => fn(this.effect()).run());
  }

  run(): T {
    return this.effect();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Compose multiple functions.
 */
const compose = <T>(...fns: ((arg: T) => T)[]): (arg: T) => T => {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
};

/**
 * Pipe multiple functions.
 */
const pipe = <T>(...fns: ((arg: T) => T)[]): (arg: T) => T => {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
};

// ============================================================================
// REAL-WORLD SCENARIOS
// ============================================================================

// Data models
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// ============================================================================
// MAYBE MONAD EXAMPLES
// ============================================================================

const demonstrateMaybeMonad = () => {
  console.log("\n=== Maybe Monad Examples ===");

  // Safe division
  const safeDivide = (a: number, b: number): Maybe<number> => {
    return b === 0 ? Maybe.none() : Maybe.some(a / b);
  };

  // Safe array access
  const safeGet = <T>(array: T[], index: number): Maybe<T> => {
    return index >= 0 && index < array.length ? Maybe.some(array[index]) : Maybe.none();
  };

  // Safe object property access
  const safeGetProperty = <T, K extends keyof T>(obj: T, key: K): Maybe<T[K]> => {
    return obj[key] !== undefined ? Maybe.some(obj[key]) : Maybe.none();
  };

  // User validation
  const validateUser = (user: any): Maybe<User> => {
    if (!user || typeof user !== 'object') return Maybe.none();
    
    const { id, name, email } = user;
    if (!id || !name || !email) return Maybe.none();
    
    return Maybe.some({ id, name, email, age: user.age });
  };

  // Examples
  console.log("Safe division 10 / 2:", safeDivide(10, 2).getOrElse(0));
  console.log("Safe division 10 / 0:", safeDivide(10, 0).getOrElse(0));

  const users = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' }
  ];

  console.log("Safe array access [0]:", safeGet(users, 0).map(u => u.name).getOrElse('Not found'));
  console.log("Safe array access [5]:", safeGet(users, 5).map(u => u.name).getOrElse('Not found'));

  const user = { id: '1', name: 'Alice', email: 'alice@example.com' };
  console.log("Safe property access:", safeGetProperty(user, 'name').getOrElse('Unknown'));

  // Complex validation pipeline
  const processUserData = (data: any): Maybe<User> => {
    return Maybe.fromNullable(data)
      .flatMap(validateUser)
      .map(user => ({
        ...user,
        name: user.name.trim(),
        email: user.email.toLowerCase()
      }));
  };

  const validData = { id: '1', name: '  Alice  ', email: 'ALICE@EXAMPLE.COM' };
  const invalidData = null;

  console.log("Valid user data:", processUserData(validData).fold(
    () => 'Invalid user',
    user => `Valid user: ${user.name} (${user.email})`
  ));

  console.log("Invalid user data:", processUserData(invalidData).fold(
    () => 'Invalid user',
    user => `Valid user: ${user.name} (${user.email})`
  ));
};

// ============================================================================
// EITHER MONAD EXAMPLES
// ============================================================================

const demonstrateEitherMonad = () => {
  console.log("\n=== Either Monad Examples ===");

  // API response handling
  const parseApiResponse = <T>(response: ApiResponse<T>): Either<string, T> => {
    if (response.status !== 200) {
      return Either.left(`HTTP ${response.status}: ${response.error || 'Unknown error'}`);
    }
    if (!response.data) {
      return Either.left('No data received');
    }
    return Either.right(response.data);
  };

  // Database operation simulation
  const findUserById = (id: string): Either<string, User> => {
    const users: User[] = [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' }
    ];

    const user = users.find(u => u.id === id);
    return user ? Either.right(user) : Either.left(`User ${id} not found`);
  };

  const findOrdersByUserId = (userId: string): Either<string, Order[]> => {
    const orders: Order[] = [
      { id: 'o1', userId: '1', items: [], total: 100, status: 'completed' },
      { id: 'o2', userId: '1', items: [], total: 200, status: 'pending' }
    ];

    const userOrders = orders.filter(o => o.userId === userId);
    return userOrders.length > 0 ? Either.right(userOrders) : Either.left(`No orders found for user ${userId}`);
  };

  // Complex operation pipeline
  const getUserOrders = (userId: string): Either<string, { user: User; orders: Order[] }> => {
    return findUserById(userId)
      .flatMap(user => 
        findOrdersByUserId(userId)
          .map(orders => ({ user, orders }))
      );
  };

  // Examples
  const validResponse: ApiResponse<User> = {
    status: 200,
    data: { id: '1', name: 'Alice', email: 'alice@example.com' }
  };

  const invalidResponse: ApiResponse<User> = {
    status: 404,
    error: 'User not found'
  };

  console.log("Valid API response:", parseApiResponse(validResponse).fold(
    error => `Error: ${error}`,
    user => `Success: ${user.name}`
  ));

  console.log("Invalid API response:", parseApiResponse(invalidResponse).fold(
    error => `Error: ${error}`,
    user => `Success: ${user.name}`
  ));

  console.log("User orders for valid user:", getUserOrders('1').fold(
    error => `Error: ${error}`,
    result => `User: ${result.user.name}, Orders: ${result.orders.length}`
  ));

  console.log("User orders for invalid user:", getUserOrders('999').fold(
    error => `Error: ${error}`,
    result => `User: ${result.user.name}, Orders: ${result.orders.length}`
  ));
};

// ============================================================================
// LIST MONAD EXAMPLES
// ============================================================================

const demonstrateListMonad = () => {
  console.log("\n=== List Monad Examples ===");

  // Data transformation pipeline
  const users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com', age: 25 },
    { id: '2', name: 'Bob', email: 'bob@example.com', age: 30 },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', age: 35 },
    { id: '4', name: 'Diana', email: 'diana@example.com', age: 28 }
  ];

  const orders: Order[] = [
    { id: 'o1', userId: '1', items: [], total: 100, status: 'completed' },
    { id: 'o2', userId: '1', items: [], total: 200, status: 'pending' },
    { id: 'o3', userId: '2', items: [], total: 150, status: 'completed' },
    { id: 'o4', userId: '3', items: [], total: 300, status: 'cancelled' }
  ];

  // Transform users to List monad
  const userList = List.of(...users);

  // Map operations
  const userNames = userList.map(user => user.name);
  const userEmails = userList.map(user => user.email);
  const adultUsers = userList.filter(user => (user.age || 0) >= 18);

  console.log("User names:", userNames.toArray());
  console.log("User emails:", userEmails.toArray());
  console.log("Adult users:", adultUsers.map(u => u.name).toArray());

  // FlatMap operations
  const userOrderPairs = userList.flatMap(user => {
    const userOrders = orders.filter(order => order.userId === user.id);
    return List.of(...userOrders.map(order => ({ user: user.name, order: order.id })));
  });

  console.log("User-order pairs:", userOrderPairs.toArray());

  // Reduce operations
  const totalAge = userList
    .map(user => user.age || 0)
    .reduce((sum, age) => sum + age, 0);

  const averageAge = totalAge / userList.length();

  console.log("Total age:", totalAge);
  console.log("Average age:", averageAge);

  // Complex pipeline
  const userStats = userList
    .filter(user => (user.age || 0) >= 25)
    .map(user => ({
      name: user.name,
      email: user.email,
      ageGroup: (user.age || 0) >= 30 ? 'senior' : 'junior'
    }))
    .flatMap(user => 
      List.of(
        { ...user, category: 'active' },
        { ...user, category: 'inactive' }
      )
    );

  console.log("User stats:", userStats.toArray());
};

// ============================================================================
// IO MONAD EXAMPLES
// ============================================================================

const demonstrateIOMonad = () => {
  console.log("\n=== IO Monad Examples ===");

  // Pure functions
  const add = (a: number, b: number): number => a + b;
  const multiply = (a: number, b: number): number => a * b;
  const square = (x: number): number => x * x;

  // IO operations
  const getCurrentTime = (): IO<Date> => IO.fromEffect(() => new Date());
  const getRandomNumber = (): IO<number> => IO.fromEffect(() => Math.random());
  const logMessage = (message: string): IO<void> => IO.fromEffect(() => console.log(`[LOG] ${message}`));

  // Composing IO operations
  const getTimestamp = getCurrentTime().map(date => date.getTime());
  const getRandomTimestamp = getRandomNumber().map(random => Math.floor(random * 1000000));

  // Complex IO pipeline
  const complexIO = getCurrentTime()
    .flatMap(time => 
      logMessage(`Current time: ${time.toISOString()}`)
        .flatMap(() => getRandomNumber())
        .map(random => ({ time, random }))
    )
    .flatMap(({ time, random }) => 
      logMessage(`Random number: ${random}`)
        .map(() => ({ time, random }))
    );

  // Execute IO operations
  console.log("Timestamp:", getTimestamp.run());
  console.log("Random timestamp:", getRandomTimestamp.run());
  
  console.log("Complex IO operation:");
  const result = complexIO.run();
  console.log("Result:", result);

  // Side effect composition
  const sideEffectPipeline = IO.of("Hello")
    .flatMap(msg => logMessage(msg).map(() => msg.toUpperCase()))
    .flatMap(msg => logMessage(msg).map(() => msg.length))
    .flatMap(length => logMessage(`Length: ${length}`).map(() => length * 2));

  console.log("Side effect pipeline result:", sideEffectPipeline.run());
};

// ============================================================================
// MONAD COMPOSITION EXAMPLES
// ============================================================================

const demonstrateMonadComposition = () => {
  console.log("\n=== Monad Composition Examples ===");

  // Combining Maybe and Either
  const validateAndProcess = (data: any): Either<string, User> => {
    return Maybe.fromNullable(data)
      .map(data => data as User)
      .fold(
        () => Either.left('Data is null or undefined'),
        user => user.id && user.name && user.email 
          ? Either.right(user)
          : Either.left('Invalid user data')
      );
  };

  // Combining List and Maybe
  const findUserInList = (users: User[], id: string): Maybe<User> => {
    return List.of(...users)
      .filter(user => user.id === id)
      .toArray()
      .reduce((acc, user) => Maybe.some(user), Maybe.none<User>());
  };

  // Combining IO and Either
  const safeIOOperation = <T>(operation: () => T): IO<Either<string, T>> => {
    return IO.fromEffect(() => {
      try {
        return Either.right(operation());
      } catch (error) {
        return Either.left(error instanceof Error ? error.message : 'Unknown error');
      }
    });
  };

  // Examples
  const validUserData = { id: '1', name: 'Alice', email: 'alice@example.com' };
  const invalidUserData = { id: '1', name: '' };

  console.log("Validate and process valid data:", validateAndProcess(validUserData).fold(
    error => `Error: ${error}`,
    user => `Success: ${user.name}`
  ));

  console.log("Validate and process invalid data:", validateAndProcess(invalidUserData).fold(
    error => `Error: ${error}`,
    user => `Success: ${user.name}`
  ));

  const userList = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' }
  ];

  console.log("Find user in list:", findUserInList(userList, '1').fold(
    () => 'User not found',
    user => `Found: ${user.name}`
  ));

  console.log("Find non-existent user:", findUserInList(userList, '999').fold(
    () => 'User not found',
    user => `Found: ${user.name}`
  ));

  // Safe IO operation
  const safeDivideIO = (a: number, b: number): IO<Either<string, number>> => {
    return safeIOOperation(() => {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    });
  };

  console.log("Safe divide IO (10/2):", safeDivideIO(10, 2).run().fold(
    error => `Error: ${error}`,
    result => `Result: ${result}`
  ));

  console.log("Safe divide IO (10/0):", safeDivideIO(10, 0).run().fold(
    error => `Error: ${error}`,
    result => `Result: ${result}`
  ));
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = () => {
  console.log("🎯 Monad Pattern: Functional Operations");
  console.log("=".repeat(60));
  
  try {
    demonstrateMaybeMonad();
    demonstrateEitherMonad();
    demonstrateListMonad();
    demonstrateIOMonad();
    demonstrateMonadComposition();
    
    console.log("\n✅ All Monad pattern examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running Monad examples:", error);
  }
};

// Run the examples
main();

exit(0); 