import { exit } from 'process';

// Database State interfaces
interface TableState {
  name: string;
  records: Record<string, any>[];
  indexes: Map<string, Set<string>>;
  constraints: Map<string, any>;
}

interface DatabaseState {
  tables: Map<string, TableState>;
  connections: Map<string, any>;
  locks: Map<string, string>;
  transactionId: string | null;
  isolationLevel: 'read-uncommitted' | 'read-committed' | 'repeatable-read' | 'serializable';
}

// Memento interface
interface Memento {
  getState(): any;
  getTimestamp(): Date;
}

// Database Memento
class DatabaseMemento implements Memento {
  private state: DatabaseState;
  private timestamp: Date;

  constructor(state: DatabaseState) {
    // Deep copy the state to ensure immutability
    this.state = {
      tables: new Map(),
      connections: new Map(),
      locks: new Map(),
      transactionId: state.transactionId,
      isolationLevel: state.isolationLevel
    };

    // Deep copy tables
    state.tables.forEach((tableState, tableName) => {
      this.state.tables.set(tableName, {
        name: tableState.name,
        records: tableState.records.map(record => ({ ...record })),
        indexes: new Map(tableState.indexes),
        constraints: new Map(tableState.constraints)
      });
    });

    // Deep copy connections and locks
    state.connections.forEach((conn, connId) => {
      this.state.connections.set(connId, { ...conn });
    });

    state.locks.forEach((lock, resource) => {
      this.state.locks.set(resource, lock);
    });

    this.timestamp = new Date();
  }

  getState(): DatabaseState {
    return JSON.parse(JSON.stringify(this.state));
  }

  getTimestamp(): Date {
    return new Date(this.timestamp);
  }
}

// Database (Originator)
class Database {
  private state: DatabaseState;
  private transactionCounter: number = 0;

  constructor() {
    this.state = {
      tables: new Map(),
      connections: new Map(),
      locks: new Map(),
      transactionId: null,
      isolationLevel: 'read-committed'
    };

    // Initialize with some sample tables
    this.createTable('users', [
      { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 }
    ]);

    this.createTable('orders', [
      { id: '1', userId: '1', product: 'Laptop', amount: 999.99, status: 'pending' },
      { id: '2', userId: '2', product: 'Mouse', amount: 29.99, status: 'completed' }
    ]);
  }

  // Create memento of current state
  createMemento(): Memento {
    console.log('💾 Creating database memento...');
    return new DatabaseMemento(this.state);
  }

  // Restore state from memento
  restore(memento: Memento): void {
    console.log('🔄 Restoring database state...');
    const restoredState = memento.getState();
    
    // Properly reconstruct the state with Map objects
    this.state = {
      tables: new Map(restoredState.tables),
      connections: new Map(restoredState.connections),
      locks: new Map(restoredState.locks),
      transactionId: restoredState.transactionId,
      isolationLevel: restoredState.isolationLevel
    };
  }

  // Database operations
  createTable(name: string, initialRecords: any[] = []): void {
    const tableState: TableState = {
      name,
      records: initialRecords.map(record => ({ ...record })),
      indexes: new Map(),
      constraints: new Map()
    };
    this.state.tables.set(name, tableState);
    console.log(`📋 Created table: ${name} with ${initialRecords.length} records`);
  }

  insertRecord(tableName: string, record: any): void {
    const table = this.state.tables.get(tableName);
    if (!table) {
      console.log(`❌ Table ${tableName} not found`);
      return;
    }

    table.records.push({ ...record });
    console.log(`➕ Inserted record into ${tableName}:`, record);
  }

  updateRecord(tableName: string, id: string, updates: any): void {
    const table = this.state.tables.get(tableName);
    if (!table) {
      console.log(`❌ Table ${tableName} not found`);
      return;
    }

    const recordIndex = table.records.findIndex(record => record.id === id);
    if (recordIndex === -1) {
      console.log(`❌ Record with id ${id} not found in ${tableName}`);
      return;
    }

    table.records[recordIndex] = { ...table.records[recordIndex], ...updates };
    console.log(`✏️ Updated record in ${tableName}:`, { id, ...updates });
  }

  deleteRecord(tableName: string, id: string): void {
    const table = this.state.tables.get(tableName);
    if (!table) {
      console.log(`❌ Table ${tableName} not found`);
      return;
    }

    const recordIndex = table.records.findIndex(record => record.id === id);
    if (recordIndex === -1) {
      console.log(`❌ Record with id ${id} not found in ${tableName}`);
      return;
    }

    const deletedRecord = table.records.splice(recordIndex, 1)[0];
    console.log(`🗑️ Deleted record from ${tableName}:`, deletedRecord);
  }

  addIndex(tableName: string, columnName: string): void {
    const table = this.state.tables.get(tableName);
    if (!table) {
      console.log(`❌ Table ${tableName} not found`);
      return;
    }

    const index = new Set<string>();
    table.records.forEach(record => {
      if (record[columnName] !== undefined) {
        index.add(String(record[columnName]));
      }
    });

    table.indexes.set(columnName, index);
    console.log(`🔍 Added index on ${tableName}.${columnName}`);
  }

  addConstraint(tableName: string, constraintName: string, constraint: any): void {
    const table = this.state.tables.get(tableName);
    if (!table) {
      console.log(`❌ Table ${tableName} not found`);
      return;
    }

    table.constraints.set(constraintName, constraint);
    console.log(`🔒 Added constraint ${constraintName} to ${tableName}`);
  }

  acquireLock(resource: string, transactionId: string): boolean {
    if (this.state.locks.has(resource)) {
      console.log(`🔒 Resource ${resource} is already locked`);
      return false;
    }

    this.state.locks.set(resource, transactionId);
    console.log(`🔒 Acquired lock on ${resource} for transaction ${transactionId}`);
    return true;
  }

  releaseLock(resource: string): void {
    if (this.state.locks.delete(resource)) {
      console.log(`🔓 Released lock on ${resource}`);
    }
  }

  beginTransaction(): string {
    this.transactionCounter++;
    const transactionId = `txn-${this.transactionCounter}`;
    this.state.transactionId = transactionId;
    console.log(`🚀 Started transaction: ${transactionId}`);
    return transactionId;
  }

  commitTransaction(): void {
    if (!this.state.transactionId) {
      console.log('❌ No active transaction to commit');
      return;
    }

    console.log(`✅ Committed transaction: ${this.state.transactionId}`);
    this.state.transactionId = null;
    
    // Release all locks for this transaction
    this.state.locks.forEach((lockTransactionId, resource) => {
      if (lockTransactionId === this.state.transactionId) {
        this.state.locks.delete(resource);
      }
    });
  }

  rollbackTransaction(): void {
    if (!this.state.transactionId) {
      console.log('❌ No active transaction to rollback');
      return;
    }

    console.log(`🔄 Rolling back transaction: ${this.state.transactionId}`);
    this.state.transactionId = null;
    
    // Release all locks for this transaction
    this.state.locks.forEach((lockTransactionId, resource) => {
      if (lockTransactionId === this.state.transactionId) {
        this.state.locks.delete(resource);
      }
    });
  }

  // Get current state
  getState(): DatabaseState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Display current state
  display(): void {
    console.log('\n🗄️ Current Database State:');
    console.log(`Active Transaction: ${this.state.transactionId || 'None'}`);
    console.log(`Isolation Level: ${this.state.isolationLevel}`);
    console.log(`Active Locks: ${this.state.locks.size}`);
    console.log(`Active Connections: ${this.state.connections.size}`);
    
    console.log('\n📋 Tables:');
    this.state.tables.forEach((table, tableName) => {
      console.log(`  📊 ${tableName}: ${table.records.length} records, ${table.indexes.size} indexes, ${table.constraints.size} constraints`);
    });
    
    console.log('');
  }

  // Display table contents
  displayTable(tableName: string): void {
    const table = this.state.tables.get(tableName);
    if (!table) {
      console.log(`❌ Table ${tableName} not found`);
      return;
    }

    console.log(`\n📊 Table: ${tableName}`);
    console.log('Records:');
    table.records.forEach(record => {
      console.log(`  ${JSON.stringify(record)}`);
    });
    console.log('');
  }
}

// Caretaker - Manages memento history
class DatabaseCaretaker {
  private mementoStack: Memento[] = [];
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 10) {
    this.maxHistorySize = maxHistorySize;
  }

  // Save current state (checkpoint)
  saveCheckpoint(database: Database): void {
    const memento = database.createMemento();
    this.mementoStack.push(memento);
    
    // Limit history size
    if (this.mementoStack.length > this.maxHistorySize) {
      this.mementoStack.shift();
    }
    
    console.log(`💾 Database checkpoint saved. Stack size: ${this.mementoStack.length}`);
  }

  // Rollback to last checkpoint
  rollback(database: Database): boolean {
    if (this.mementoStack.length === 0) {
      console.log('❌ No checkpoints available for rollback');
      return false;
    }

    const lastMemento = this.mementoStack.pop()!;
    database.restore(lastMemento);
    console.log(`🔄 Rollback performed. Remaining checkpoints: ${this.mementoStack.length}`);
    return true;
  }

  // Get history information
  getHistoryInfo(): { checkpointCount: number } {
    return {
      checkpointCount: this.mementoStack.length
    };
  }

  // Clear all checkpoints
  clearCheckpoints(): void {
    this.mementoStack = [];
    console.log('🗑️ All checkpoints cleared');
  }
}

// Demo
console.log('=== DATABASE TRANSACTION ROLLBACK DEMO ===\n');

// Create database and caretaker
const database = new Database();
const caretaker = new DatabaseCaretaker(5);

console.log('🚀 Starting database operations...\n');

// Initial state
database.display();

// Perform various database operations
console.log('=== DATABASE OPERATIONS ===');

caretaker.saveCheckpoint(database);
database.beginTransaction();
database.insertRecord('users', { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35 });
database.displayTable('users');

caretaker.saveCheckpoint(database);
database.insertRecord('orders', { id: '3', userId: '3', product: 'Keyboard', amount: 79.99, status: 'pending' });
database.displayTable('orders');

caretaker.saveCheckpoint(database);
database.updateRecord('users', '1', { age: 31 });
database.displayTable('users');

caretaker.saveCheckpoint(database);
database.addIndex('users', 'email');
database.display();

caretaker.saveCheckpoint(database);
database.deleteRecord('orders', '2');
database.displayTable('orders');

caretaker.saveCheckpoint(database);
database.addConstraint('users', 'age_check', { type: 'check', condition: 'age >= 0' });
database.display();

// Demonstrate rollback
console.log('=== ROLLBACK OPERATIONS ===');

console.log('\n🔄 Rolling back last operation...');
caretaker.rollback(database);
database.display();

console.log('\n🔄 Rolling back constraint addition...');
caretaker.rollback(database);
database.display();

console.log('\n🔄 Rolling back record deletion...');
caretaker.rollback(database);
database.displayTable('orders');

console.log('\n🔄 Rolling back index creation...');
caretaker.rollback(database);
database.display();

console.log('\n🔄 Rolling back user update...');
caretaker.rollback(database);
database.displayTable('users');

// Show history information
const history = caretaker.getHistoryInfo();
console.log('\n📊 History Information:');
console.log(`Available checkpoints: ${history.checkpointCount}`);

// Demonstrate multiple rollbacks
console.log('\n=== MULTIPLE ROLLBACK DEMO ===');
for (let i = 0; i < 2; i++) {
  console.log(`\n🔄 Rollback ${i + 1}:`);
  caretaker.rollback(database);
  database.display();
}

// Demonstrate transaction operations
console.log('\n=== TRANSACTION DEMO ===');

console.log('\n🚀 Starting new transaction...');
const txnId = database.beginTransaction();
database.acquireLock('users', txnId);
database.insertRecord('users', { id: '4', name: 'Alice Brown', email: 'alice@example.com', age: 28 });
database.displayTable('users');

console.log('\n💾 Saving checkpoint before commit...');
caretaker.saveCheckpoint(database);

console.log('\n✅ Committing transaction...');
database.commitTransaction();
database.display();

console.log('\n🔄 Rolling back to pre-commit state...');
caretaker.rollback(database);
database.displayTable('users');

console.log('\n✅ Database transaction rollback demo completed successfully');

exit(0); 