import { exit } from 'process';

// Iterator interface
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
  current(): T;
  reset(): void;
  close(): void;
}

// Database record interface
interface DatabaseRecord {
  id: number;
  name: string;
  email: string;
  age: number;
  department: string;
}

// Simulated database connection
class DatabaseConnection {
  private isConnected: boolean = false;
  private queryResults: DatabaseRecord[] = [];
  private currentIndex: number = 0;
  
  connect(): void {
    this.isConnected = true;
    console.log('🔌 Database connected');
  }
  
  disconnect(): void {
    this.isConnected = false;
    console.log('🔌 Database disconnected');
  }
  
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
  
  // Simulate query execution with lazy loading
  executeQuery(query: string): void {
    console.log(`📊 Executing query: ${query}`);
    
    // Simulate large dataset (only load first few records initially)
    this.queryResults = this.generateMockData(1000);
    this.currentIndex = 0;
    
    console.log(`📊 Query returned ${this.queryResults.length} records`);
  }
  
  // Lazy loading - fetch records in batches
  fetchNextBatch(batchSize: number = 10): DatabaseRecord[] {
    const batch = this.queryResults.slice(this.currentIndex, this.currentIndex + batchSize);
    this.currentIndex += batchSize;
    return batch;
  }
  
  hasMoreRecords(): boolean {
    return this.currentIndex < this.queryResults.length;
  }
  
  getCurrentIndex(): number {
    return this.currentIndex;
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private generateMockData(count: number): DatabaseRecord[] {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
    const records: DatabaseRecord[] = [];
    
    for (let i = 1; i <= count; i++) {
      records.push({
        id: i,
        name: `Employee ${i}`,
        email: `employee${i}@company.com`,
        age: 20 + (i % 40),
        department: departments[i % departments.length]
      });
    }
    
    return records;
  }
}

// Database result set iterator
class DatabaseResultSetIterator implements Iterator<DatabaseRecord> {
  private connection: DatabaseConnection;
  private currentBatch: DatabaseRecord[] = [];
  private batchIndex: number = 0;
  private batchSize: number;
  private isClosed: boolean = false;
  
  constructor(connection: DatabaseConnection, batchSize: number = 10) {
    this.connection = connection;
    this.batchSize = batchSize;
    this.loadNextBatch();
  }
  
  hasNext(): boolean {
    if (this.isClosed) {
      return false;
    }
    
    // If we have more records in current batch
    if (this.batchIndex < this.currentBatch.length) {
      return true;
    }
    
    // If we have more batches to load
    if (this.connection.hasMoreRecords()) {
      this.loadNextBatch();
      return this.batchIndex < this.currentBatch.length;
    }
    
    return false;
  }
  
  next(): DatabaseRecord {
    if (this.isClosed || this.batchIndex >= this.currentBatch.length) {
      throw new Error('No more records available');
    }
    
    const record = this.currentBatch[this.batchIndex];
    this.batchIndex++;
    
    console.log(`📄 Fetched record: ${record.name} (${record.department})`);
    return record;
  }
  
  current(): DatabaseRecord {
    if (this.isClosed || this.batchIndex >= this.currentBatch.length) {
      throw new Error('No current record available');
    }
    
    return this.currentBatch[this.batchIndex];
  }
  
  reset(): void {
    this.connection.reset();
    this.batchIndex = 0;
    this.currentBatch = [];
    this.loadNextBatch();
    console.log('🔄 Iterator reset to beginning');
  }
  
  close(): void {
    this.isClosed = true;
    this.connection.disconnect();
    console.log('🔒 Iterator closed and connection released');
  }
  
  private loadNextBatch(): void {
    this.currentBatch = this.connection.fetchNextBatch(this.batchSize);
    this.batchIndex = 0;
    
    if (this.currentBatch.length > 0) {
      console.log(`📦 Loaded batch of ${this.currentBatch.length} records`);
    }
  }
}

// Filtering iterator for database results
class FilteringDatabaseIterator implements Iterator<DatabaseRecord> {
  private iterator: Iterator<DatabaseRecord>;
  private predicate: (record: DatabaseRecord) => boolean;
  private currentRecord: DatabaseRecord | null = null;
  
  constructor(iterator: Iterator<DatabaseRecord>, predicate: (record: DatabaseRecord) => boolean) {
    this.iterator = iterator;
    this.predicate = predicate;
  }
  
  hasNext(): boolean {
    // Look ahead for next matching record
    while (this.iterator.hasNext()) {
      const record = this.iterator.next();
      if (this.predicate(record)) {
        this.currentRecord = record;
        return true;
      }
    }
    return false;
  }
  
  next(): DatabaseRecord {
    if (this.currentRecord === null) {
      throw new Error('No more matching records');
    }
    
    const result = this.currentRecord;
    this.currentRecord = null;
    return result;
  }
  
  current(): DatabaseRecord {
    if (this.currentRecord === null) {
      throw new Error('No current record available');
    }
    return this.currentRecord;
  }
  
  reset(): void {
    this.iterator.reset();
    this.currentRecord = null;
  }
  
  close(): void {
    this.iterator.close();
  }
}

// Database collection interface
interface DatabaseCollection {
  createIterator(batchSize?: number): Iterator<DatabaseRecord>;
  createFilteringIterator(predicate: (record: DatabaseRecord) => boolean, batchSize?: number): Iterator<DatabaseRecord>;
}

// Concrete database collection
class UserDatabase implements DatabaseCollection {
  private connection: DatabaseConnection;
  
  constructor() {
    this.connection = new DatabaseConnection();
  }
  
  createIterator(batchSize: number = 10): Iterator<DatabaseRecord> {
    this.connection.connect();
    this.connection.executeQuery('SELECT * FROM users ORDER BY id');
    return new DatabaseResultSetIterator(this.connection, batchSize);
  }
  
  createFilteringIterator(predicate: (record: DatabaseRecord) => boolean, batchSize: number = 10): Iterator<DatabaseRecord> {
    const baseIterator = this.createIterator(batchSize);
    return new FilteringDatabaseIterator(baseIterator, predicate);
  }
}

// Demo
console.log('=== DATABASE RESULT SET ITERATOR DEMO ===\n');

const userDatabase = new UserDatabase();

// Basic iteration
console.log('--- Basic Database Iteration ---');
const iterator = userDatabase.createIterator(5);

let count = 0;
while (iterator.hasNext() && count < 10) {
  const record = iterator.next();
  console.log(`  ${record.id}: ${record.name} - ${record.department}`);
  count++;
}

console.log(`\nProcessed ${count} records\n`);

// Filtering iteration
console.log('--- Filtering Database Iteration (Engineering Department) ---');
const engineeringFilter = (record: DatabaseRecord) => record.department === 'Engineering';
const filteringIterator = userDatabase.createFilteringIterator(engineeringFilter, 5);

count = 0;
while (filteringIterator.hasNext() && count < 5) {
  const record = filteringIterator.next();
  console.log(`  ${record.id}: ${record.name} - ${record.department}`);
  count++;
}

console.log(`\nFound ${count} engineering employees\n`);

// Reset and iterate again
console.log('--- Reset and Iterate Again ---');
iterator.reset();
count = 0;
while (iterator.hasNext() && count < 3) {
  const record = iterator.next();
  console.log(`  ${record.id}: ${record.name} - ${record.department}`);
  count++;
}

// Close iterators
console.log('\n--- Closing Iterators ---');
iterator.close();
filteringIterator.close();

console.log('\n✅ Database iteration completed successfully');

exit(0); 