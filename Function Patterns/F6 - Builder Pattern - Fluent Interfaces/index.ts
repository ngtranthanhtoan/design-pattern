/**
 * F6 - Builder Pattern - Fluent Interfaces
 * 
 * Functional implementation of the Builder pattern using fluent interfaces
 * for constructing complex objects with immutability and type safety.
 */

import { exit } from "process";

// Database configuration builder
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  connectionPool?: {
    min: number;
    max: number;
    idle: number;
  };
  timeout?: number;
  retries?: number;
}

interface DatabaseBuilder {
  withHost: (host: string) => DatabaseBuilder;
  withPort: (port: number) => DatabaseBuilder;
  withDatabase: (database: string) => DatabaseBuilder;
  withUsername: (username: string) => DatabaseBuilder;
  withPassword: (password: string) => DatabaseBuilder;
  withSsl: (ssl: boolean) => DatabaseBuilder;
  withConnectionPool: (pool: { min: number; max: number; idle: number }) => DatabaseBuilder;
  withTimeout: (timeout: number) => DatabaseBuilder;
  withRetries: (retries: number) => DatabaseBuilder;
  when: (condition: boolean, fn: (builder: DatabaseBuilder) => DatabaseBuilder) => DatabaseBuilder;
  build: () => DatabaseConfig;
}

function createDatabaseBuilder(initial: Partial<DatabaseConfig> = {}): DatabaseBuilder {
  const data = { ...initial };

  return {
    withHost: (host: string) => createDatabaseBuilder({ ...data, host }),
    withPort: (port: number) => createDatabaseBuilder({ ...data, port }),
    withDatabase: (database: string) => createDatabaseBuilder({ ...data, database }),
    withUsername: (username: string) => createDatabaseBuilder({ ...data, username }),
    withPassword: (password: string) => createDatabaseBuilder({ ...data, password }),
    withSsl: (ssl: boolean) => createDatabaseBuilder({ ...data, ssl }),
    withConnectionPool: (connectionPool) => createDatabaseBuilder({ ...data, connectionPool }),
    withTimeout: (timeout: number) => createDatabaseBuilder({ ...data, timeout }),
    withRetries: (retries: number) => createDatabaseBuilder({ ...data, retries }),
    
    when: (condition: boolean, fn: (builder: DatabaseBuilder) => DatabaseBuilder) => {
      const currentBuilder = createDatabaseBuilder(data);
      return condition ? fn(currentBuilder) : currentBuilder;
    },
    
    build: (): DatabaseConfig => {
      if (!data.host || !data.port || !data.database) {
        throw new Error('Host, port, and database are required');
      }
      return { ...data } as DatabaseConfig;
    }
  };
}

// HTTP Client builder
interface HttpClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    credentials: string;
  };
}

interface HttpClientBuilder {
  withBaseUrl: (url: string) => HttpClientBuilder;
  withTimeout: (timeout: number) => HttpClientBuilder;
  withRetries: (retries: number) => HttpClientBuilder;
  withHeaders: (headers: Record<string, string>) => HttpClientBuilder;
  withAuth: (auth: { type: 'bearer' | 'basic' | 'api-key'; credentials: string }) => HttpClientBuilder;
  when: (condition: boolean, fn: (builder: HttpClientBuilder) => HttpClientBuilder) => HttpClientBuilder;
  build: () => HttpClientConfig;
}

function createHttpClientBuilder(initial: Partial<HttpClientConfig> = {}): HttpClientBuilder {
  const data = { 
    timeout: 5000,
    retries: 3,
    headers: {},
    ...initial 
  };

  return {
    withBaseUrl: (baseUrl: string) => createHttpClientBuilder({ ...data, baseUrl }),
    withTimeout: (timeout: number) => createHttpClientBuilder({ ...data, timeout }),
    withRetries: (retries: number) => createHttpClientBuilder({ ...data, retries }),
    withHeaders: (headers: Record<string, string>) => 
      createHttpClientBuilder({ ...data, headers: { ...data.headers, ...headers } }),
    withAuth: (auth) => createHttpClientBuilder({ ...data, auth }),
    
    when: (condition: boolean, fn: (builder: HttpClientBuilder) => HttpClientBuilder) => {
      const currentBuilder = createHttpClientBuilder(data);
      return condition ? fn(currentBuilder) : currentBuilder;
    },
    
    build: (): HttpClientConfig => {
      if (!data.baseUrl) {
        throw new Error('Base URL is required');
      }
      return { ...data } as HttpClientConfig;
    }
  };
}

// Query builder
interface Query {
  table: string;
  select: string[];
  where: Array<{ field: string; operator: string; value: any }>;
  join: Array<{ table: string; on: string }>;
  orderBy: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  offset?: number;
}

interface QueryBuilder {
  select: (fields: string[]) => QueryBuilder;
  where: (field: string, operator: string, value: any) => QueryBuilder;
  join: (table: string, on: string) => QueryBuilder;
  orderBy: (field: string, direction?: 'asc' | 'desc') => QueryBuilder;
  limit: (limit: number) => QueryBuilder;
  offset: (offset: number) => QueryBuilder;
  when: (condition: boolean, fn: (builder: QueryBuilder) => QueryBuilder) => QueryBuilder;
  build: () => Query;
  toSQL: () => string;
}

function createQueryBuilder(table: string): QueryBuilder {
  const data: Query = {
    table,
    select: [],
    where: [],
    join: [],
    orderBy: []
  };

  function createFromData(queryData: Query): QueryBuilder {
    return {
      select: (fields: string[]) => 
        createFromData({ ...queryData, select: [...queryData.select, ...fields] }),
      where: (field: string, operator: string, value: any) => 
        createFromData({ ...queryData, where: [...queryData.where, { field, operator, value }] }),
      join: (table: string, on: string) => 
        createFromData({ ...queryData, join: [...queryData.join, { table, on }] }),
      orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => 
        createFromData({ ...queryData, orderBy: [...queryData.orderBy, { field, direction }] }),
      limit: (limit: number) => createFromData({ ...queryData, limit }),
      offset: (offset: number) => createFromData({ ...queryData, offset }),
      
      when: (condition: boolean, fn: (builder: QueryBuilder) => QueryBuilder) => {
        const currentBuilder = createFromData(queryData);
        return condition ? fn(currentBuilder) : currentBuilder;
      },
      
      build: (): Query => ({ ...queryData }),
      
      toSQL: (): string => {
        let sql = `SELECT ${queryData.select.length > 0 ? queryData.select.join(', ') : '*'} FROM ${queryData.table}`;
        
        queryData.join.forEach(j => {
          sql += ` JOIN ${j.table} ON ${j.on}`;
        });

        if (queryData.where.length > 0) {
          const whereClause = queryData.where
            .map(w => `${w.field} ${w.operator} ${typeof w.value === 'string' ? `'${w.value}'` : w.value}`)
            .join(' AND ');
          sql += ` WHERE ${whereClause}`;
        }

        if (queryData.orderBy.length > 0) {
          const orderClause = queryData.orderBy
            .map(o => `${o.field} ${o.direction.toUpperCase()}`)
            .join(', ');
          sql += ` ORDER BY ${orderClause}`;
        }

        if (queryData.limit !== undefined) {
          sql += ` LIMIT ${queryData.limit}`;
        }

        if (queryData.offset !== undefined) {
          sql += ` OFFSET ${queryData.offset}`;
        }

        return sql;
      }
    };
  }

  return createFromData(data);
}

// User builder for test data
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  roles: string[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}

interface UserBuilder {
  withId: (id: string) => UserBuilder;
  withName: (name: string) => UserBuilder;
  withEmail: (email: string) => UserBuilder;
  withAge: (age: number) => UserBuilder;
  withRoles: (roles: string[]) => UserBuilder;
  withPreferences: (preferences: { theme: 'light' | 'dark'; notifications: boolean; language: string }) => UserBuilder;
  when: (condition: boolean, fn: (builder: UserBuilder) => UserBuilder) => UserBuilder;
  build: () => User;
}

function createUserBuilder(initial: Partial<User> = {}): UserBuilder {
  const data = {
    age: 25,
    roles: ['user'],
    preferences: {
      theme: 'light' as const,
      notifications: true,
      language: 'en'
    },
    ...initial
  };

  return {
    withId: (id: string) => createUserBuilder({ ...data, id }),
    withName: (name: string) => createUserBuilder({ ...data, name }),
    withEmail: (email: string) => createUserBuilder({ ...data, email }),
    withAge: (age: number) => createUserBuilder({ ...data, age }),
    withRoles: (roles: string[]) => createUserBuilder({ ...data, roles }),
    withPreferences: (preferences) => createUserBuilder({ ...data, preferences }),
    
    when: (condition: boolean, fn: (builder: UserBuilder) => UserBuilder) => {
      const currentBuilder = createUserBuilder(data);
      return condition ? fn(currentBuilder) : currentBuilder;
    },
    
    build: (): User => {
      if (!data.id || !data.name || !data.email) {
        throw new Error('ID, name, and email are required');
      }
      return { ...data } as User;
    }
  };
}

function demonstrateDatabaseBuilder(): void {
  console.log("🗄️ DATABASE CONFIGURATION BUILDER");
  console.log("=====================================");
  console.log();

  // Basic configuration
  const basicConfig = createDatabaseBuilder()
    .withHost('localhost')
    .withPort(5432)
    .withDatabase('myapp')
    .build();

  console.log("Basic configuration:");
  console.log(JSON.stringify(basicConfig, null, 2));
  console.log();

  // Production configuration with conditional SSL
  const isProduction = true;
  const prodConfig = createDatabaseBuilder()
    .withHost('prod-db.example.com')
    .withPort(5432)
    .withDatabase('production')
    .withUsername('app_user')
    .withPassword('secure_password')
    .when(isProduction, builder => 
      builder
        .withSsl(true)
        .withConnectionPool({ min: 5, max: 20, idle: 10000 })
        .withTimeout(30000)
        .withRetries(3)
    )
    .build();

  console.log("Production configuration:");
  console.log(JSON.stringify(prodConfig, null, 2));
  console.log();
}

function demonstrateHttpClientBuilder(): void {
  console.log("🌐 HTTP CLIENT BUILDER");
  console.log("======================");
  console.log();

  const apiClient = createHttpClientBuilder()
    .withBaseUrl('https://api.example.com')
    .withTimeout(10000)
    .withRetries(3)
    .withHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
    .withAuth({
      type: 'bearer',
      credentials: 'abc123token'
    })
    .build();

  console.log("API client configuration:");
  console.log(JSON.stringify(apiClient, null, 2));
  console.log();
}

function demonstrateQueryBuilder(): void {
  console.log("📊 SQL QUERY BUILDER");
  console.log("====================");
  console.log();

  const simpleQuery = createQueryBuilder('users')
    .select(['id', 'name', 'email'])
    .where('active', '=', true)
    .orderBy('created_at', 'desc')
    .limit(10);

  console.log("Simple query:");
  console.log(simpleQuery.toSQL());
  console.log();

  // Complex query with conditional building
  const hasSearch = true;
  const searchTerm = 'john';
  const includeInactive = false;

  const conditionalQuery = createQueryBuilder('users')
    .select(['id', 'name', 'email', 'status'])
    .when(hasSearch, builder => 
      builder.where('name', 'ILIKE', `%${searchTerm}%`)
    )
    .when(!includeInactive, builder =>
      builder.where('status', '=', 'active')
    )
    .orderBy('name', 'asc')
    .limit(20);

  console.log("Conditional query:");
  console.log(conditionalQuery.toSQL());
  console.log();
}

function demonstrateUserBuilder(): void {
  console.log("👤 USER TEST DATA BUILDER");
  console.log("=========================");
  console.log();

  const standardUser = createUserBuilder()
    .withId('user_001')
    .withName('John Doe')
    .withEmail('john.doe@example.com')
    .withAge(30)
    .withRoles(['user', 'subscriber'])
    .build();

  console.log("Standard user:");
  console.log(JSON.stringify(standardUser, null, 2));
  console.log();

  const adminUser = createUserBuilder()
    .withId('admin_001')
    .withName('Jane Admin')
    .withEmail('jane.admin@example.com')
    .withAge(35)
    .withRoles(['admin', 'moderator'])
    .withPreferences({
      theme: 'dark',
      notifications: false,
      language: 'en'
    })
    .build();

  console.log("Admin user:");
  console.log(JSON.stringify(adminUser, null, 2));
  console.log();
}

function demonstratePerformance(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("========================");
  console.log();

  const iterations = 50000;

  console.log(`Creating ${iterations} database configurations using builders...`);
  const builderStart = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    createDatabaseBuilder()
      .withHost('localhost')
      .withPort(5432)
      .withDatabase(`db_${i}`)
      .withSsl(i % 2 === 0)
      .build();
  }
  
  const builderTime = Date.now() - builderStart;
  const builderOpsPerSec = Math.round(iterations / (builderTime / 1000));
  
  console.log(`✨ Completed ${iterations} builder operations in ${builderTime}ms`);
  console.log(`📊 Performance: ~${builderOpsPerSec.toLocaleString()} operations/second`);
  console.log(`🏃‍♂️ Average: ${(builderTime / iterations).toFixed(4)}ms per operation`);
  console.log();

  console.log("Key Performance Benefits:");
  console.log("• Immutable object creation with structural sharing");
  console.log("• Type-safe construction with compile-time validation");
  console.log("• Method chaining for readable configuration");
  console.log("• Conditional building without performance penalties");
  console.log();
}

console.log("🏗️ F6 - BUILDER PATTERN - FLUENT INTERFACES");
console.log("==============================================");
console.log();
console.log("Functional implementation of the Builder pattern using fluent interfaces");
console.log("for constructing complex objects with immutability and type safety.");
console.log();

demonstrateDatabaseBuilder();
demonstrateHttpClientBuilder();
demonstrateQueryBuilder();
demonstrateUserBuilder();
demonstratePerformance();

console.log("💡 PRACTICAL USAGE EXAMPLES");
console.log("===============================");
console.log();

console.log("1. Environment-specific database configuration:");
console.log(`const config = createDatabaseBuilder()
  .withHost(process.env.DB_HOST || 'localhost')
  .withPort(parseInt(process.env.DB_PORT || '5432'))
  .when(process.env.NODE_ENV === 'production', b => 
    b.withSsl(true).withConnectionPool({ min: 5, max: 20, idle: 10000 })
  )
  .build();`);
console.log();

console.log("2. Test data factories:");
console.log(`const createTestUser = () => createUserBuilder()
  .withId(generateId())
  .withName('Test User')
  .withEmail('test@example.com');

const youngUser = createTestUser().withAge(20).build();
const adminUser = createTestUser().withRoles(['admin']).build();`);
console.log();

console.log("🚀 COMPREHENSIVE EXAMPLES");
console.log("=========================");
console.log("Run specific builder examples:");
console.log("npm run f6:builder         # This comprehensive overview");
console.log();

console.log("Key Benefits:");
console.log("• Immutable object construction with fluent interfaces");
console.log("• Type-safe building with compile-time validation");
console.log("• Conditional building with when() method");
console.log("• Composable builders for configuration reuse");
console.log("• Clear, readable API for complex object creation");

exit(0); 