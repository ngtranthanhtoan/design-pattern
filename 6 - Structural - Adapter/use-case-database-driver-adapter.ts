// ============================================================================
// DATABASE DRIVER ADAPTER - Unified Database Interface
// ============================================================================

import { exit } from 'process';
import { randomUUID } from 'crypto';

// -----------------------------------------------------------------------------
// 1. Target Interface - what client code expects
// -----------------------------------------------------------------------------

interface DBConnection {
  connect(): Promise<void>;
  query<T = any>(statement: string, params?: any[]): Promise<T[]>;
  execute(statement: string, params?: any[]): Promise<number>; // affected rows / docs
  disconnect(): Promise<void>;
  getName(): string;
}

// -----------------------------------------------------------------------------
// 2. Adaptee Stubs (MySQL and MongoDB)
// -----------------------------------------------------------------------------

class MySQLDriver {
  async open(): Promise<void> {
    console.log('🐬 MySQL connection opened');
  }
  async runQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    console.log(`🐬 Executing SQL: ${sql} Params: ${JSON.stringify(params)}`);
    return [];
  }
  async runCommand(sql: string, params: any[] = []): Promise<{ affectedRows: number }> {
    console.log(`🐬 Running command: ${sql}`);
    return { affectedRows: Math.floor(Math.random() * 10) };
  }
  async close(): Promise<void> {
    console.log('🐬 MySQL connection closed');
  }
}

class MongoDriver {
  async connectToUri(uri: string): Promise<void> {
    console.log('🍃 MongoDB connected', uri);
  }
  async aggregate<T>(collection: string, pipeline: any[]): Promise<T[]> {
    console.log(`🍃 Aggregate on ${collection} pipeline`, pipeline);
    return [];
  }
  async updateMany(collection: string, filter: any, update: any): Promise<{ modifiedCount: number }> {
    console.log(`🍃 UpdateMany on ${collection}`);
    return { modifiedCount: Math.floor(Math.random() * 10) };
  }
  async disconnect(): Promise<void> {
    console.log('🍃 MongoDB disconnected');
  }
}

// -----------------------------------------------------------------------------
// 3. Concrete Adapters
// -----------------------------------------------------------------------------

class MySQLAdapter implements DBConnection {
  private driver = new MySQLDriver();

  async connect(): Promise<void> {
    await this.driver.open();
  }

  async query<T>(statement: string, params?: any[]): Promise<T[]> {
    return this.driver.runQuery<T>(statement, params);
  }

  async execute(statement: string, params?: any[]): Promise<number> {
    const result = await this.driver.runCommand(statement, params);
    return result.affectedRows;
  }

  async disconnect(): Promise<void> {
    await this.driver.close();
  }

  getName(): string {
    return 'mysql';
  }
}

class MongoAdapter implements DBConnection {
  private driver = new MongoDriver();
  private collection = 'default';

  async connect(): Promise<void> {
    await this.driver.connectToUri('mongodb://localhost:27017/mydb');
  }

  async query<T>(statement: string, params?: any[]): Promise<T[]> {
    // very naive SQL -> Mongo translation just for illustration
    const collectionMatch = statement.match(/FROM\s+(\w+)/i);
    this.collection = collectionMatch ? collectionMatch[1] : this.collection;
    return this.driver.aggregate<T>(this.collection, [{ $match: {} }]);
  }

  async execute(statement: string, params?: any[]): Promise<number> {
    return (await this.driver.updateMany(this.collection, {}, {})).modifiedCount;
  }

  async disconnect(): Promise<void> {
    await this.driver.disconnect();
  }

  getName(): string {
    return 'mongo';
  }
}

// -----------------------------------------------------------------------------
// 4. Registry for database adapters
// -----------------------------------------------------------------------------

class DatabaseAdapterRegistry {
  private static adapters = new Map<string, DBConnection>([
    ['mysql', new MySQLAdapter()],
    ['mongo', new MongoAdapter()]
  ]);

  public static get(name: string): DBConnection {
    const adapter = this.adapters.get(name.toLowerCase());
    if (!adapter) throw new Error(`Database ${name} not supported`);
    return adapter;
  }

  public static list(): string[] {
    return Array.from(this.adapters.keys());
  }
}

// -----------------------------------------------------------------------------
// 5. Demonstration & Test
// -----------------------------------------------------------------------------

async function demoDbAdapters(): Promise<void> {
  console.log('=== DATABASE DRIVER ADAPTER DEMO ===');
  for (const name of DatabaseAdapterRegistry.list()) {
    const db = DatabaseAdapterRegistry.get(name);
    console.log(`\n--- ${db.getName().toUpperCase()} ---`);
    await db.connect();
    await db.query('SELECT * FROM users WHERE id = ?', [randomUUID()]);
    const affected = await db.execute('UPDATE users SET name = ? WHERE id = ?', ['John', randomUUID()]);
    console.log('Affected rows/docs:', affected);
    await db.disconnect();
  }
}

(async () => {
  await demoDbAdapters();
  exit(0);
})();

export {
  DBConnection,
  MySQLAdapter,
  MongoAdapter,
  DatabaseAdapterRegistry
}; 