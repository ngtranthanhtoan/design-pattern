import { exit } from "process";

// ============================================================================
// READER MONAD IMPLEMENTATION
// ============================================================================

/**
 * Reader monad for dependency injection and environment passing.
 * @template R - Environment type
 * @template A - Result type
 */
class Reader<R, A> {
  constructor(private readonly runReader: (env: R) => A) {}

  /**
   * Run the Reader with a given environment.
   */
  run(env: R): A {
    return this.runReader(env);
  }

  /**
   * Functor map: transform the result inside the Reader.
   */
  map<B>(fn: (a: A) => B): Reader<R, B> {
    return new Reader(env => fn(this.runReader(env)));
  }

  /**
   * Monad flatMap: chain Readers that depend on the same environment.
   */
  flatMap<B>(fn: (a: A) => Reader<R, B>): Reader<R, B> {
    return new Reader(env => fn(this.runReader(env)).run(env));
  }

  /**
   * Applicative ap: apply a Reader-wrapped function to a Reader-wrapped value.
   */
  ap<B>(rf: Reader<R, (a: A) => B>): Reader<R, B> {
    return new Reader(env => rf.run(env)(this.runReader(env)));
  }

  /**
   * Static: create a Reader that returns the environment.
   */
  static ask<R>(): Reader<R, R> {
    return new Reader(env => env);
  }

  /**
   * Static: create a Reader that always returns a value.
   */
  static of<R, A>(value: A): Reader<R, A> {
    return new Reader(() => value);
  }

  /**
   * Static: transform the environment for a given Reader.
   */
  static local<R, A>(fn: (env: R) => R, reader: Reader<R, A>): Reader<R, A> {
    return new Reader(env => reader.run(fn(env)));
  }
}

// ============================================================================
// EXAMPLE ENVIRONMENTS AND SERVICES
// ============================================================================

interface AppConfig {
  databaseUrl: string;
  apiKey: string;
  featureFlag: boolean;
  environment: 'development' | 'staging' | 'production';
}

interface Logger {
  info: (msg: string) => void;
  error: (msg: string) => void;
  warn: (msg: string) => void;
}

interface Mailer {
  send: (to: string, subject: string, body: string) => Promise<void>;
}

interface Database {
  query: <T>(sql: string, params?: any[]) => Promise<T[]>;
  transaction: <T>(fn: () => Promise<T>) => Promise<T>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface Env {
  config: AppConfig;
  logger: Logger;
  mailer: Mailer;
  database: Database;
}

// ============================================================================
// PRACTICAL READER USAGE EXAMPLES
// ============================================================================

// 1. Application Configuration Access
const getDatabaseUrl = new Reader<Env, string>(env => env.config.databaseUrl);
const getApiKey = new Reader<Env, string>(env => env.config.apiKey);
const getFeatureFlag = new Reader<Env, boolean>(env => env.config.featureFlag);
const getEnvironment = new Reader<Env, string>(env => env.config.environment);

// 2. Service Injection
const logInfo = (msg: string) => new Reader<Env, void>(env => env.logger.info(msg));
const logError = (msg: string) => new Reader<Env, void>(env => env.logger.error(msg));
const logWarn = (msg: string) => new Reader<Env, void>(env => env.logger.warn(msg));

const sendEmail = (to: string, subject: string, body: string) => 
  new Reader<Env, Promise<void>>(env => env.mailer.send(to, subject, body));

const executeQuery = <T>(sql: string, params?: any[]) => 
  new Reader<Env, Promise<T[]>>(env => env.database.query(sql, params));

// 3. Composing Readers for Business Logic
const sendWelcomeEmail = (userEmail: string, userName: string) =>
  logInfo(`Sending welcome email to ${userEmail}`)
    .flatMap(() => sendEmail(
      userEmail, 
      "Welcome to our app!", 
      `Hello ${userName}, welcome to our platform!`
    ))
    .flatMap(() => logInfo(`Welcome email sent to ${userEmail}`));

const getUserById = (userId: string) =>
  logInfo(`Fetching user ${userId}`)
    .flatMap(() => new Reader<Env, Promise<User | null>>(async env => {
      const results = await env.database.query<User>('SELECT * FROM users WHERE id = ?', [userId]);
      return results.length > 0 ? results[0] : null;
    }))
    .flatMap(userPromise => 
      new Reader<Env, Promise<User | null>>(async env => {
        const user = await userPromise;
        if (user) {
          env.logger.info(`User ${userId} found`);
          return user;
        } else {
          env.logger.error(`User ${userId} not found`);
          return null;
        }
      })
    );

// 4. API Request Pipeline (simulated)
interface ApiEnv {
  baseUrl: string;
  token: string;
  timeout: number;
}

const getUser = (id: string) => new Reader<ApiEnv, Promise<{ id: string; name: string; email: string }>>(env =>
  Promise.resolve({ id, name: `User ${id}`, email: `user${id}@example.com` }) // Simulate fetch
);

const getUserWithToken = (id: string) =>
  Reader.ask<ApiEnv>().flatMap(env =>
    getUser(id).map(user => ({ ...user, token: env.token }))
  );

const getUserWithAuth = (id: string) =>
  getUserWithToken(id)
    .flatMap(userWithToken => 
      Reader.ask<ApiEnv>().map(env => ({
        ...userWithToken,
        authHeader: `Bearer ${env.token}`,
        timeout: env.timeout
      }))
    );

// 5. Testing with Mock Environments
const mockLogger: Logger = {
  info: msg => console.log(`[MOCK LOG] ${msg}`),
  error: msg => console.log(`[MOCK ERROR] ${msg}`),
  warn: msg => console.log(`[MOCK WARN] ${msg}`)
};

const mockMailer: Mailer = {
  send: async (to, subject, body) => 
    console.log(`[MOCK EMAIL] to ${to}: ${subject} - ${body}`)
};

const mockDatabase: Database = {
  query: async <T>(sql: string, params?: any[]) => {
    console.log(`[MOCK DB] ${sql}`, params);
    return [] as T[];
  },
  transaction: async <T>(fn: () => Promise<T>) => {
    console.log('[MOCK DB] Starting transaction');
    const result = await fn();
    console.log('[MOCK DB] Committing transaction');
    return result;
  }
};

const mockEnv: Env = {
  config: { 
    databaseUrl: "mock-db://localhost", 
    apiKey: "mock-key-123", 
    featureFlag: true,
    environment: 'development'
  },
  logger: mockLogger,
  mailer: mockMailer,
  database: mockDatabase
};

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

const demonstrateConfigAccess = () => {
  console.log("\n=== Reader: Config Access ===");
  
  const env: Env = {
    config: { 
      databaseUrl: "postgres://prod-db.example.com", 
      apiKey: "prod-key-456", 
      featureFlag: false,
      environment: 'production'
    },
    logger: console,
    mailer: { send: async () => {} },
    database: { query: async () => [], transaction: async (fn) => fn() }
  };
  
  console.log("Database URL:", getDatabaseUrl.run(env));
  console.log("API Key:", getApiKey.run(env));
  console.log("Feature Flag:", getFeatureFlag.run(env));
  console.log("Environment:", getEnvironment.run(env));
};

const demonstrateServiceInjection = () => {
  console.log("\n=== Reader: Service Injection ===");
  
  sendWelcomeEmail("user@example.com", "John Doe").run(mockEnv);
};

const demonstrateApiPipeline = () => {
  console.log("\n=== Reader: API Pipeline ===");
  
  const apiEnv: ApiEnv = { 
    baseUrl: "https://api.example.com", 
    token: "abc123", 
    timeout: 5000 
  };
  
  getUserWithAuth("42").run(apiEnv).then(userWithAuth => {
    console.log("User with auth:", userWithAuth);
  });
};

const demonstrateTesting = () => {
  console.log("\n=== Reader: Testing with Mock Env ===");
  
  sendWelcomeEmail("test@example.com", "Test User").run(mockEnv);
  getUserById("123").run(mockEnv);
};

const demonstrateComposition = () => {
  console.log("\n=== Reader: Business Logic Composition ===");
  
  interface RequestContext {
    user: { id: string; role: string; permissions: string[] };
    config: AppConfig;
    requestId: string;
  }
  
  const getUserRole = new Reader<RequestContext, string>(ctx => ctx.user.role);
  const getUserPermissions = new Reader<RequestContext, string[]>(ctx => ctx.user.permissions);
  const getRequestId = new Reader<RequestContext, string>(ctx => ctx.requestId);
  
  const isAdmin = getUserRole.map(role => role === 'admin');
  const hasPermission = (permission: string) => 
    getUserPermissions.map(permissions => permissions.includes(permission));
  
  const canAccessFeature = isAdmin.flatMap(admin =>
    hasPermission('feature:access').map(hasPerm => admin || hasPerm)
  );
  
  const canAccessFeatureWithContext = canAccessFeature.flatMap(canAccess =>
    getRequestId.map(requestId => ({
      canAccess,
      requestId,
      timestamp: new Date().toISOString()
    }))
  );
  
  const ctx: RequestContext = {
    user: { id: "1", role: "user", permissions: ["feature:access"] },
    config: { 
      databaseUrl: "db", 
      apiKey: "key", 
      featureFlag: true,
      environment: 'development'
    },
    requestId: "req-123"
  };
  
  console.log("Is admin:", isAdmin.run(ctx));
  console.log("Has feature permission:", hasPermission('feature:access').run(ctx));
  console.log("Can access feature:", canAccessFeature.run(ctx));
  console.log("Access with context:", canAccessFeatureWithContext.run(ctx));
};

const demonstrateEnvironmentTransformation = () => {
  console.log("\n=== Reader: Environment Transformation ===");
  
  // Transform environment for specific operations
  const withDebugLogging = Reader.local<Env, void>(
    env => ({ ...env, logger: { ...env.logger, debug: console.log } }),
    logInfo("Debug logging enabled")
  );
  
  const withTestConfig = Reader.local<Env, string>(
    env => ({ 
      ...env, 
      config: { ...env.config, environment: 'development' as const }
    }),
    getEnvironment
  );
  
  console.log("With debug logging:");
  withDebugLogging.run(mockEnv);
  
  console.log("With test config:", withTestConfig.run(mockEnv));
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = () => {
  console.log("🚦 Reader Pattern Examples");
  console.log("=".repeat(50));
  
  try {
    demonstrateConfigAccess();
    demonstrateServiceInjection();
    demonstrateApiPipeline();
    demonstrateTesting();
    demonstrateComposition();
    demonstrateEnvironmentTransformation();
    
    console.log("\n✅ All Reader pattern examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running Reader examples:", error);
  }
};

// Run the examples
main();

exit(0); 