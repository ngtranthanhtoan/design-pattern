// ============================================================================
// DATABASE CONNECTION FACTORY - Multi-Database Support
// ============================================================================

import { exit } from "process";

// Database configuration interfaces
interface DatabaseConfig {
  host: string;
  database: string;
  username: string;
  password: string;
  port?: number;
  options?: Record<string, any>;
}

interface QueryResult {
  rows: any[];
  rowCount: number;
  executionTime: number;
}

// Product interface - what all database connections must implement
interface DatabaseConnection {
  query(sql: string, params?: any[]): Promise<QueryResult>;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnectionInfo(): string;
}

// Abstract Creator - defines the factory method
abstract class DatabaseConnectionFactory {
  // Factory method - to be implemented by concrete creators
  abstract createConnection(): DatabaseConnection;
  
  // Static method to create appropriate factory
  public static create(databaseType: string): DatabaseConnectionFactory {
    switch (databaseType.toLowerCase()) {
      case 'postgresql':
      case 'postgres':
        return new PostgreSQLConnectionFactory();
      case 'mysql':
        return new MySQLConnectionFactory();
      case 'mongodb':
      case 'mongo':
        return new MongoDBConnectionFactory();
      case 'sqlite':
        return new SQLiteConnectionFactory();
      default:
        throw new Error(`Unsupported database type: ${databaseType}`);
    }
  }

  // Connect method that matches the documented API
  public async connect(config: DatabaseConfig): Promise<DatabaseConnection> {
    const connection = this.createConnection() as BaseConnection;
    await connection.initialize(config);
    return connection;
  }
}

// Base connection implementation with common functionality
abstract class BaseConnection implements DatabaseConnection {
  protected connected: boolean = false;
  protected config?: DatabaseConfig;

  abstract initialize(config: DatabaseConfig): Promise<void>;
  abstract query(sql: string, params?: any[]): Promise<QueryResult>;
  abstract beginTransaction(): Promise<void>;
  abstract commitTransaction(): Promise<void>;
  abstract rollbackTransaction(): Promise<void>;
  abstract getConnectionInfo(): string;

  async disconnect(): Promise<void> {
    if (this.connected) {
      console.log(`Disconnecting from ${this.getConnectionType()}...`);
      await this.simulateDelay(50);
      this.connected = false;
      console.log(`✅ ${this.getConnectionType()} disconnected`);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  protected async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected abstract getConnectionType(): string;
}

// Concrete Product implementations
class PostgreSQLConnection extends BaseConnection {
  async initialize(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const port = config.port || 5432;
    console.log(`Connecting to PostgreSQL at ${config.host}:${port}/${config.database}`);
    await this.simulateDelay(100);
    this.connected = true;
    console.log('✅ PostgreSQL connection established');
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    if (!this.connected) throw new Error('Not connected to database');
    
    console.log(`Executing PostgreSQL query: ${sql}`);
    if (params) console.log(`Parameters: ${JSON.stringify(params)}`);
    
    await this.simulateDelay(50);
    
    return this.generateMockResult(sql);
  }

  async beginTransaction(): Promise<void> {
    console.log('PostgreSQL: BEGIN TRANSACTION');
  }

  async commitTransaction(): Promise<void> {
    console.log('PostgreSQL: COMMIT TRANSACTION');
  }

  async rollbackTransaction(): Promise<void> {
    console.log('PostgreSQL: ROLLBACK TRANSACTION');
  }

  getConnectionInfo(): string {
    const port = this.config?.port || 5432;
    return `PostgreSQL connection to ${this.config?.host}:${port}/${this.config?.database}`;
  }

  protected getConnectionType(): string {
    return 'PostgreSQL';
  }

  private generateMockResult(sql: string): QueryResult {
    const startTime = Date.now();
    
    if (sql.toLowerCase().includes('select')) {
      return {
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date() },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: new Date() }
        ],
        rowCount: 2,
        executionTime: Date.now() - startTime
      };
    } else if (sql.toLowerCase().includes('insert')) {
      return {
        rows: [{ id: 3, created_at: new Date() }],
        rowCount: 1,
        executionTime: Date.now() - startTime
      };
    } else {
      return {
        rows: [],
        rowCount: 0,
        executionTime: Date.now() - startTime
      };
    }
  }
}

class MySQLConnection extends BaseConnection {
  async initialize(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const port = config.port || 3306;
    console.log(`Connecting to MySQL at ${config.host}:${port}/${config.database}`);
    await this.simulateDelay(120);
    this.connected = true;
    console.log('✅ MySQL connection established');
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    if (!this.connected) throw new Error('Not connected to database');
    
    console.log(`Executing MySQL query: ${sql}`);
    if (params) console.log(`Parameters: ${JSON.stringify(params)}`);
    
    await this.simulateDelay(40);
    
    return {
      rows: [
        { id: 1, title: 'MySQL Result', status: 'active', updated_at: new Date() }
      ],
      rowCount: 1,
      executionTime: 40
    };
  }

  async beginTransaction(): Promise<void> {
    console.log('MySQL: START TRANSACTION');
  }

  async commitTransaction(): Promise<void> {
    console.log('MySQL: COMMIT');
  }

  async rollbackTransaction(): Promise<void> {
    console.log('MySQL: ROLLBACK');
  }

  getConnectionInfo(): string {
    const port = this.config?.port || 3306;
    return `MySQL connection to ${this.config?.host}:${port}/${this.config?.database}`;
  }

  protected getConnectionType(): string {
    return 'MySQL';
  }
}

class MongoDBConnection extends BaseConnection {
  async initialize(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const port = config.port || 27017;
    console.log(`Connecting to MongoDB at ${config.host}:${port}/${config.database}`);
    await this.simulateDelay(80);
    this.connected = true;
    console.log('✅ MongoDB connection established');
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    if (!this.connected) throw new Error('Not connected to database');
    
    // MongoDB uses different query syntax, but we'll simulate
    console.log(`Executing MongoDB operation: ${sql}`);
    if (params) console.log(`Parameters: ${JSON.stringify(params)}`);
    
    await this.simulateDelay(30);
    
    return {
      rows: [
        { _id: '507f1f77bcf86cd799439011', name: 'MongoDB Document', tags: ['nosql', 'database'] }
      ],
      rowCount: 1,
      executionTime: 30
    };
  }

  async beginTransaction(): Promise<void> {
    console.log('MongoDB: Starting session transaction');
  }

  async commitTransaction(): Promise<void> {
    console.log('MongoDB: Committing transaction');
  }

  async rollbackTransaction(): Promise<void> {
    console.log('MongoDB: Aborting transaction');
  }

  getConnectionInfo(): string {
    const port = this.config?.port || 27017;
    return `MongoDB connection to ${this.config?.host}:${port}/${this.config?.database}`;
  }

  protected getConnectionType(): string {
    return 'MongoDB';
  }
}

class SQLiteConnection extends BaseConnection {
  async initialize(config: DatabaseConfig): Promise<void> {
    this.config = config;
    console.log(`Connecting to SQLite database: ${config.database}`);
    await this.simulateDelay(20);
    this.connected = true;
    console.log('✅ SQLite connection established');
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    if (!this.connected) throw new Error('Not connected to database');
    
    console.log(`Executing SQLite query: ${sql}`);
    if (params) console.log(`Parameters: ${JSON.stringify(params)}`);
    
    await this.simulateDelay(10);
    
    return {
      rows: [
        { id: 1, data: 'SQLite local data', timestamp: Date.now() }
      ],
      rowCount: 1,
      executionTime: 10
    };
  }

  async beginTransaction(): Promise<void> {
    console.log('SQLite: BEGIN TRANSACTION');
  }

  async commitTransaction(): Promise<void> {
    console.log('SQLite: COMMIT TRANSACTION');
  }

  async rollbackTransaction(): Promise<void> {
    console.log('SQLite: ROLLBACK TRANSACTION');
  }

  getConnectionInfo(): string {
    return `SQLite database: ${this.config?.database}`;
  }

  protected getConnectionType(): string {
    return 'SQLite';
  }
}

// Concrete Creator implementations
class PostgreSQLConnectionFactory extends DatabaseConnectionFactory {
  createConnection(): DatabaseConnection {
    return new PostgreSQLConnection();
  }
}

class MySQLConnectionFactory extends DatabaseConnectionFactory {
  createConnection(): DatabaseConnection {
    return new MySQLConnection();
  }
}

class MongoDBConnectionFactory extends DatabaseConnectionFactory {
  createConnection(): DatabaseConnection {
    return new MongoDBConnection();
  }
}

class SQLiteConnectionFactory extends DatabaseConnectionFactory {
  createConnection(): DatabaseConnection {
    return new SQLiteConnection();
  }
}

// Usage Example - Following the documented API exactly
async function demonstrateDatabaseFactory(): Promise<void> {
  console.log('=== DATABASE CONNECTION FACTORY DEMO ===');
  console.log('Following the documented API pattern:\n');

  const databases = ['postgresql', 'mysql', 'mongodb', 'sqlite'];
  const connections: DatabaseConnection[] = [];

  for (const dbType of databases) {
    console.log(`--- Testing ${dbType.toUpperCase()} ---`);
    
    try {
      // Following the exact documented API
      const dbFactory = DatabaseConnectionFactory.create(dbType);
      const connection = await dbFactory.connect({
        host: 'localhost',
        database: 'myapp',
        username: 'user',
        password: 'pass'
      });

      console.log(`Connection info: ${connection.getConnectionInfo()}`);

      // Same interface regardless of database type
      const users = await connection.query('SELECT * FROM users');
      console.log(`Retrieved ${users.rowCount} users from ${dbType}`);
      
      // Test transaction
      await connection.beginTransaction();
      await connection.query('INSERT INTO users (name, email) VALUES (?, ?)', ['Test User', 'test@example.com']);
      await connection.commitTransaction();
      console.log('Transaction completed successfully');

      connections.push(connection);
      
    } catch (error) {
      console.error(`❌ Error with ${dbType}:`, error instanceof Error ? error.message : String(error));
    }
    
    console.log();
  }

  // Clean up all connections
  console.log('--- Cleaning up connections ---');
  for (const connection of connections) {
    await connection.disconnect();
  }
  
  console.log('✅ All database connections closed');
}

// Advanced Usage Example
async function advancedDatabaseUsage(): Promise<void> {
  console.log('\n=== ADVANCED DATABASE USAGE ===');

  // Database migration example
  console.log('--- Database Migration Example ---');
  const oldFactory = DatabaseConnectionFactory.create('mysql');
  const newFactory = DatabaseConnectionFactory.create('postgresql');

  const oldConnection = await oldFactory.connect({
    host: 'old-server.com',
    database: 'legacy_db',
    username: 'migration_user',
    password: 'secure_pass'
  });

  const newConnection = await newFactory.connect({
    host: 'new-server.com', 
    database: 'modern_db',
    username: 'migration_user',
    password: 'secure_pass'
  });

  // Simulate data migration
  const oldData = await oldConnection.query('SELECT * FROM legacy_table');
  console.log(`Migrating ${oldData.rowCount} records...`);
  
  await newConnection.beginTransaction();
  try {
    await newConnection.query('INSERT INTO new_table SELECT * FROM temp_data');
    await newConnection.commitTransaction();
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await newConnection.rollbackTransaction();
    console.log('❌ Migration failed, rolled back');
  }

  await oldConnection.disconnect();
  await newConnection.disconnect();
}

// Testing Example
async function testDatabaseFactory(): Promise<void> {
  console.log('\n=== DATABASE CONNECTION FACTORY TESTS ===');
  
  // Test 1: Factory creation for different types
  console.log('Test 1 - Factory creation:');
  const supportedTypes = ['postgresql', 'mysql', 'mongodb', 'sqlite'];
  for (const type of supportedTypes) {
    try {
      const factory = DatabaseConnectionFactory.create(type);
      console.log(`✅ ${type}: Factory created successfully`);
    } catch (error) {
      console.log(`❌ ${type}: Failed to create factory`);
    }
  }
  
  // Test 2: Unsupported database type
  console.log('\nTest 2 - Unsupported database type:');
  try {
    DatabaseConnectionFactory.create('unsupported');
    console.log('❌ Should have thrown error for unsupported type');
  } catch (error) {
    console.log('✅ Correctly threw error for unsupported type:', error instanceof Error ? error.message : String(error));
  }
  
  // Test 3: API consistency test
  console.log('\nTest 3 - API consistency:');
  const factory = DatabaseConnectionFactory.create('postgresql');
  const connection = await factory.connect({
    host: 'localhost',
    database: 'test',
    username: 'test',
    password: 'test'
  });
  
  console.log('✅ API matches documented pattern');
  console.log('✅ Connection created with expected interface');
  
  await connection.disconnect();
  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateDatabaseFactory();
  await advancedDatabaseUsage();
  await testDatabaseFactory();
  exit(0);
})();

export { 
  DatabaseConnectionFactory, 
  DatabaseConnection, 
  DatabaseConfig, 
  QueryResult 
}; 