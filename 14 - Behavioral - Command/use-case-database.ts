import { exit } from 'process';

// Command interface
interface Command {
  execute(): void;
  undo(): void;
  log(): void;
}

// Database record
interface DatabaseRecord {
  id: string;
  table: string;
  data: Record<string, any>;
  timestamp: Date;
}

// Database receiver
class Database {
  private tables: Map<string, Map<string, any>> = new Map();
  private transactionLog: DatabaseRecord[] = [];
  private isInTransaction: boolean = false;
  private transactionCommands: Command[] = [];
  
  constructor() {
    // Initialize some tables
    this.tables.set('users', new Map());
    this.tables.set('products', new Map());
    this.tables.set('orders', new Map());
  }
  
  beginTransaction(): void {
    this.isInTransaction = true;
    this.transactionCommands = [];
    console.log('🔄 Transaction started');
  }
  
  commitTransaction(): void {
    if (!this.isInTransaction) {
      console.log('⚠️  No active transaction to commit');
      return;
    }
    
    console.log('✅ Transaction committed');
    this.transactionLog.push(...this.transactionCommands.map(cmd => ({
      id: Date.now().toString(),
      table: 'transaction',
      data: { action: 'commit', commandCount: this.transactionCommands.length },
      timestamp: new Date()
    })));
    
    this.isInTransaction = false;
    this.transactionCommands = [];
  }
  
  rollbackTransaction(): void {
    if (!this.isInTransaction) {
      console.log('⚠️  No active transaction to rollback');
      return;
    }
    
    console.log('↩️  Rolling back transaction...');
    // Undo commands in reverse order
    for (let i = this.transactionCommands.length - 1; i >= 0; i--) {
      this.transactionCommands[i].undo();
    }
    
    this.transactionLog.push({
      id: Date.now().toString(),
      table: 'transaction',
      data: { action: 'rollback', commandCount: this.transactionCommands.length },
      timestamp: new Date()
    });
    
    this.isInTransaction = false;
    this.transactionCommands = [];
  }
  
  insert(table: string, id: string, data: Record<string, any>): void {
    if (!this.tables.has(table)) {
      throw new Error(`Table ${table} does not exist`);
    }
    
    const tableData = this.tables.get(table)!;
    if (tableData.has(id)) {
      throw new Error(`Record with id ${id} already exists in table ${table}`);
    }
    
    tableData.set(id, { ...data, id });
    console.log(`📝 Inserted record ${id} into ${table}`);
    
    this.logOperation('insert', table, id, data);
  }
  
  update(table: string, id: string, data: Record<string, any>): void {
    if (!this.tables.has(table)) {
      throw new Error(`Table ${table} does not exist`);
    }
    
    const tableData = this.tables.get(table)!;
    if (!tableData.has(id)) {
      throw new Error(`Record with id ${id} not found in table ${table}`);
    }
    
    const oldData = tableData.get(id);
    tableData.set(id, { ...oldData, ...data });
    console.log(`✏️  Updated record ${id} in ${table}`);
    
    this.logOperation('update', table, id, data);
  }
  
  delete(table: string, id: string): void {
    if (!this.tables.has(table)) {
      throw new Error(`Table ${table} does not exist`);
    }
    
    const tableData = this.tables.get(table)!;
    if (!tableData.has(id)) {
      throw new Error(`Record with id ${id} not found in table ${table}`);
    }
    
    const deletedData = tableData.get(id);
    tableData.delete(id);
    console.log(`🗑️  Deleted record ${id} from ${table}`);
    
    this.logOperation('delete', table, id, deletedData);
  }
  
  select(table: string, id: string): any {
    if (!this.tables.has(table)) {
      throw new Error(`Table ${table} does not exist`);
    }
    
    const tableData = this.tables.get(table)!;
    const record = tableData.get(id);
    
    if (!record) {
      console.log(`❌ Record ${id} not found in ${table}`);
      return null;
    }
    
    console.log(`🔍 Found record ${id} in ${table}:`, record);
    return record;
  }
  
  private logOperation(operation: string, table: string, id: string, data: any): void {
    const record: DatabaseRecord = {
      id: Date.now().toString(),
      table,
      data: { operation, id, data },
      timestamp: new Date()
    };
    
    this.transactionLog.push(record);
  }
  
  addToTransaction(command: Command): void {
    if (this.isInTransaction) {
      this.transactionCommands.push(command);
    }
  }
  
  getTransactionLog(): DatabaseRecord[] {
    return [...this.transactionLog];
  }
  
  getTableData(table: string): Map<string, any> {
    return new Map(this.tables.get(table) || []);
  }
}

// Database commands
class InsertCommand implements Command {
  private database: Database;
  private table: string;
  private id: string;
  private data: Record<string, any>;
  private wasExecuted: boolean = false;
  
  constructor(database: Database, table: string, id: string, data: Record<string, any>) {
    this.database = database;
    this.table = table;
    this.id = id;
    this.data = data;
  }
  
  execute(): void {
    this.database.insert(this.table, this.id, this.data);
    this.database.addToTransaction(this);
    this.wasExecuted = true;
  }
  
  undo(): void {
    if (this.wasExecuted) {
      this.database.delete(this.table, this.id);
      this.wasExecuted = false;
    }
  }
  
  log(): void {
    console.log(`📋 INSERT ${this.table}.${this.id}: ${JSON.stringify(this.data)}`);
  }
}

class UpdateCommand implements Command {
  private database: Database;
  private table: string;
  private id: string;
  private newData: Record<string, any>;
  private oldData: any = null;
  private wasExecuted: boolean = false;
  
  constructor(database: Database, table: string, id: string, data: Record<string, any>) {
    this.database = database;
    this.table = table;
    this.id = id;
    this.newData = data;
  }
  
  execute(): void {
    // Store old data for undo
    this.oldData = this.database.select(this.table, this.id);
    this.database.update(this.table, this.id, this.newData);
    this.database.addToTransaction(this);
    this.wasExecuted = true;
  }
  
  undo(): void {
    if (this.wasExecuted && this.oldData) {
      this.database.update(this.table, this.id, this.oldData);
      this.wasExecuted = false;
    }
  }
  
  log(): void {
    console.log(`📋 UPDATE ${this.table}.${this.id}: ${JSON.stringify(this.newData)}`);
  }
}

class DeleteCommand implements Command {
  private database: Database;
  private table: string;
  private id: string;
  private deletedData: any = null;
  private wasExecuted: boolean = false;
  
  constructor(database: Database, table: string, id: string) {
    this.database = database;
    this.table = table;
    this.id = id;
  }
  
  execute(): void {
    // Store data for undo
    this.deletedData = this.database.select(this.table, this.id);
    this.database.delete(this.table, this.id);
    this.database.addToTransaction(this);
    this.wasExecuted = true;
  }
  
  undo(): void {
    if (this.wasExecuted && this.deletedData) {
      this.database.insert(this.table, this.id, this.deletedData);
      this.wasExecuted = false;
    }
  }
  
  log(): void {
    console.log(`📋 DELETE ${this.table}.${this.id}`);
  }
}

// Transaction manager
class TransactionManager {
  private database: Database;
  private commandHistory: Command[] = [];
  
  constructor(database: Database) {
    this.database = database;
  }
  
  executeCommand(command: Command): void {
    command.execute();
    this.commandHistory.push(command);
  }
  
  beginTransaction(): void {
    this.database.beginTransaction();
  }
  
  commitTransaction(): void {
    this.database.commitTransaction();
  }
  
  rollbackTransaction(): void {
    this.database.rollbackTransaction();
  }
  
  undoLastCommand(): void {
    if (this.commandHistory.length > 0) {
      const command = this.commandHistory.pop()!;
      command.undo();
    }
  }
  
  getAuditLog(): DatabaseRecord[] {
    return this.database.getTransactionLog();
  }
  
  printTableContents(table: string): void {
    const data = this.database.getTableData(table);
    console.log(`\n📊 Table: ${table}`);
    console.log('─'.repeat(50));
    
    if (data.size === 0) {
      console.log('(empty)');
    } else {
      data.forEach((value, key) => {
        console.log(`${key}: ${JSON.stringify(value)}`);
      });
    }
  }
}

// Demo
const database = new Database();
const transactionManager = new TransactionManager(database);

console.log('=== DATABASE TRANSACTION MANAGER DEMO ===\n');

// Insert some initial data
console.log('--- Initial Data Setup ---');
transactionManager.executeCommand(new InsertCommand(database, 'users', 'U001', { name: 'John Doe', email: 'john@example.com' }));
transactionManager.executeCommand(new InsertCommand(database, 'users', 'U002', { name: 'Jane Smith', email: 'jane@example.com' }));
transactionManager.executeCommand(new InsertCommand(database, 'products', 'P001', { name: 'Laptop', price: 999.99 }));

// Show initial state
console.log('\n--- Initial State ---');
transactionManager.printTableContents('users');
transactionManager.printTableContents('products');

// Start a transaction
console.log('\n--- Starting Transaction ---');
transactionManager.beginTransaction();

// Execute commands within transaction
transactionManager.executeCommand(new InsertCommand(database, 'users', 'U003', { name: 'Bob Wilson', email: 'bob@example.com' }));
transactionManager.executeCommand(new UpdateCommand(database, 'users', 'U001', { email: 'john.doe@example.com' }));
transactionManager.executeCommand(new InsertCommand(database, 'products', 'P002', { name: 'Mouse', price: 29.99 }));

// Show state before commit
console.log('\n--- State Before Commit ---');
transactionManager.printTableContents('users');
transactionManager.printTableContents('products');

// Commit transaction
console.log('\n--- Committing Transaction ---');
transactionManager.commitTransaction();

// Show state after commit
console.log('\n--- State After Commit ---');
transactionManager.printTableContents('users');
transactionManager.printTableContents('products');

// Start another transaction and rollback
console.log('\n--- Starting Transaction (Will Rollback) ---');
transactionManager.beginTransaction();

transactionManager.executeCommand(new DeleteCommand(database, 'users', 'U002'));
transactionManager.executeCommand(new UpdateCommand(database, 'products', 'P001', { price: 899.99 }));

// Show state before rollback
console.log('\n--- State Before Rollback ---');
transactionManager.printTableContents('users');
transactionManager.printTableContents('products');

// Rollback transaction
console.log('\n--- Rolling Back Transaction ---');
transactionManager.rollbackTransaction();

// Show state after rollback
console.log('\n--- State After Rollback ---');
transactionManager.printTableContents('users');
transactionManager.printTableContents('products');

// Show audit log
console.log('\n--- Audit Log ---');
const auditLog = transactionManager.getAuditLog();
auditLog.forEach(record => {
  console.log(`${record.timestamp.toISOString()} - ${record.table}: ${JSON.stringify(record.data)}`);
});

exit(0); 