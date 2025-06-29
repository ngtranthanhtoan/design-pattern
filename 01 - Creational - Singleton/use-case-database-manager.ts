// ============================================================================
// DATABASE MANAGER - Connection Pooling with Fake Connections
// ============================================================================

import { exit } from "process";

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  maxConnections: number;
  connectionTimeout: number;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private config: DatabaseConfig;
  private isInitialized: boolean = false;

  private constructor() {
    this.config = {
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      username: 'user',
      password: 'password',
      maxConnections: 10,
      connectionTimeout: 30000
    };
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initialize(config: Partial<DatabaseConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    this.isInitialized = true;
    console.log(`Database manager initialized for ${this.config.host}:${this.config.port}/${this.config.database}`);
  }

  public async executeQuery(query: string, params?: any[]): Promise<any[]> {
    // Simulate database query with fake connection
    console.log(`Executing query: ${query}`);
    if (params && params.length > 0) {
      console.log(`With parameters:`, params);
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
    
    // Return mock results based on query type
    if (query.toLowerCase().includes('select * from users')) {
      return [
        { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: true },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', active: false }
      ];
    } else if (query.toLowerCase().includes('select * from orders')) {
      return [
        { id: 101, userId: 1, amount: 99.99, date: '2024-01-15' },
        { id: 102, userId: 2, amount: 149.50, date: '2024-01-16' },
        { id: 103, userId: 1, amount: 75.25, date: '2024-01-17' }
      ];
    } else if (query.toLowerCase().includes('count')) {
      return [{ count: Math.floor(Math.random() * 100) + 50 }];
    } else {
      return [
        { id: 1, result: 'Mock data for query' },
        { id: 2, result: 'Another mock result' }
      ];
    }
  }

  public getConnectionStats(): {
    status: string;
    host: string;
    database: string;
    initialized: boolean;
  } {
    return {
      status: this.isInitialized ? 'Connected' : 'Disconnected',
      host: this.config.host,
      database: this.config.database,
      initialized: this.isInitialized
    };
  }

  public async disconnect(): Promise<void> {
    this.isInitialized = false;
    console.log('Database connection closed');
  }

  // For testing purposes only
  public static resetInstance(): void {
    if (DatabaseManager.instance && DatabaseManager.instance.isInitialized) {
      DatabaseManager.instance.disconnect();
    }
    DatabaseManager.instance = null as any;
  }
}

// Usage Example
async function demonstrateDatabase(): Promise<void> {
  console.log('=== DATABASE MANAGER DEMO ===');
  
  const db = DatabaseManager.getInstance();
  
  // Initialize with custom config
  await db.initialize({
    host: 'production-db.example.com',
    database: 'myapp_prod'
  });
  
  // Execute multiple queries concurrently
  const queries = [
    db.executeQuery('SELECT * FROM users WHERE active = $1', [true]),
    db.executeQuery('SELECT * FROM orders WHERE date > $1', ['2024-01-01']),
    db.executeQuery('SELECT COUNT(*) FROM products')
  ];
  
  try {
    const results = await Promise.all(queries);
    console.log('Query results:', results.length, 'queries completed');
    console.log('Sample user data:', results[0][0]);
    console.log('Sample order data:', results[1][0]);
    console.log('Product count:', results[2][0]);
    
    // Check connection stats
    console.log('Database stats:', db.getConnectionStats());
    
    // Verify same instance
    const anotherDb = DatabaseManager.getInstance();
    console.log('Same DB instance?', db === anotherDb);
    
  } catch (error) {
    console.error('Database error:', error);
  }
  
  console.log();
}

// Testing Example
async function testDatabase(): Promise<void> {
  console.log('=== DATABASE MANAGER TESTS ===');
  
  // Test 1: Initialization
  DatabaseManager.resetInstance();
  const db1 = DatabaseManager.getInstance();
  await db1.initialize({ database: 'test_db' });
  const stats1 = db1.getConnectionStats();
  console.log('Test 1 - Database initialized?', stats1.initialized === true);
  
  // Test 2: Different query types
  const userResults = await db1.executeQuery('SELECT * FROM users WHERE active = $1', [true]);
  console.log('Test 2 - User query returned data?', userResults.length > 0);
  
  const countResults = await db1.executeQuery('SELECT COUNT(*) FROM products');
  console.log('Test 2 - Count query returned number?', typeof countResults[0].count === 'number');
  
  // Test 3: Connection status
  console.log('Test 3 - Database connected?', stats1.status === 'Connected');
  
  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateDatabase();
  await testDatabase();
  exit(0);
})();

export { DatabaseManager, DatabaseConfig }; 