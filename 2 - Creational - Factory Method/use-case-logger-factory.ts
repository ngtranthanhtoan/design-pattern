// ============================================================================
// LOGGER FACTORY - Multi-Destination Logging System
// ============================================================================

import { exit } from "process";

// Logging levels and configuration
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  source?: string;
  requestId?: string;
}

interface LoggerConfig {
  level?: LogLevel;
  format?: 'json' | 'text' | 'structured';
  includeTimestamp?: boolean;
  includeSource?: boolean;
  maxEntries?: number;
  rotationSize?: number;
  destination?: string;
  batchSize?: number;
  tableName?: string;
  [key: string]: any;
}

// Product interface - what all loggers must implement
interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
  fatal(message: string, context?: Record<string, any>): void;
  log(level: LogLevel, message: string, context?: Record<string, any>): void;
  getEntries(): LogEntry[];
  setLevel(level: LogLevel): void;
  clear(): void;
  flush(): Promise<void>;
}

// Abstract Creator - defines the factory method
abstract class LoggerFactory {
  // Factory method - to be implemented by concrete creators
  abstract createLogger(name: string, config?: LoggerConfig): Logger;
  
  // getLogger method that matches the documented API
  public getLogger(name: string): Logger {
    const logger = this.createLogger(name);
    console.log(`Created ${this.getLoggerType()} logger: ${name}`);
    return logger;
  }
  
  // Abstract method to get logger type name
  abstract getLoggerType(): string;
  
  // Static method to create appropriate factory based on type
  public static create(type: string, config?: LoggerConfig): LoggerFactory {
    switch (type.toLowerCase()) {
      case 'console':
        return new ConsoleLoggerFactory(config);
      case 'file':
        return new FileLoggerFactory(config);
      case 'remote':
      case 'http':
        return new RemoteLoggerFactory(config);
      case 'database':
      case 'db':
        return new DatabaseLoggerFactory(config);
      case 'memory':
        return new MemoryLoggerFactory(config);
      default:
        throw new Error(`Unsupported logger type: ${type}`);
    }
  }
}

// Base logger implementation
abstract class BaseLogger implements Logger {
  protected entries: LogEntry[] = [];
  protected config: LoggerConfig;
  protected name: string;

  constructor(name: string, config: LoggerConfig) {
    this.name = name;
    this.config = {
      level: LogLevel.INFO,
      format: 'text',
      includeTimestamp: true,
      includeSource: true,
      maxEntries: 1000,
      ...config
    };
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  fatal(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context);
  }

  log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (level < (this.config.level || LogLevel.INFO)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      source: this.name
    };

    this.entries.push(entry);
    
    // Maintain max entries limit
    if (this.entries.length > (this.config.maxEntries || 1000)) {
      this.entries.shift();
    }

    this.writeLog(entry);
  }

  abstract writeLog(entry: LogEntry): void;

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  clear(): void {
    this.entries = [];
  }

  async flush(): Promise<void> {
    // Base implementation - override in subclasses if needed
  }

  protected formatLogEntry(entry: LogEntry): string {
    const timestamp = this.config.includeTimestamp ? 
      `[${entry.timestamp.toISOString()}] ` : '';
    
    const level = LogLevel[entry.level].padEnd(5);
    
    const source = this.config.includeSource && entry.source ? 
      `[${entry.source}] ` : '';
    
    const context = entry.context ? 
      ` | ${JSON.stringify(entry.context)}` : '';

    switch (this.config.format) {
      case 'json':
        return JSON.stringify(entry);
      case 'structured':
        return `${timestamp}${level} ${source}${entry.message}${context}`;
      default:
        return `${timestamp}${level} ${source}${entry.message}${context}`;
    }
  }

  protected getLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '\x1b[36m'; // Cyan
      case LogLevel.INFO: return '\x1b[32m';  // Green
      case LogLevel.WARN: return '\x1b[33m';  // Yellow
      case LogLevel.ERROR: return '\x1b[31m'; // Red
      case LogLevel.FATAL: return '\x1b[35m'; // Magenta
      default: return '\x1b[0m';
    }
  }
}

// Concrete Product implementations
class ConsoleLogger extends BaseLogger {
  override writeLog(entry: LogEntry): void {
    const color = this.getLevelColor(entry.level);
    const reset = '\x1b[0m';
    const formatted = this.formatLogEntry(entry);
    
    // Use appropriate console method based on level
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${color}${formatted}${reset}`);
        break;
      case LogLevel.INFO:
        console.info(`${color}${formatted}${reset}`);
        break;
      case LogLevel.WARN:
        console.warn(`${color}${formatted}${reset}`);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`${color}${formatted}${reset}`);
        break;
    }
  }
}

class FileLogger extends BaseLogger {
  private filePath: string;
  private writeQueue: string[] = [];

  constructor(name: string, config: LoggerConfig) {
    super(name, config);
    this.filePath = config.destination || `./logs/${name}.log`;
  }

  writeLog(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);
    this.writeQueue.push(formatted);
    
    // Simulate async file writing
    this.simulateFileWrite(formatted);
  }

  private simulateFileWrite(content: string): void {
    // In a real implementation, this would write to an actual file
    console.log(`[FILE WRITE to ${this.filePath}] ${content}`);
  }

  override async flush(): Promise<void> {
    if (this.writeQueue.length > 0) {
      console.log(`Flushing ${this.writeQueue.length} log entries to ${this.filePath}`);
      this.writeQueue = [];
    }
  }
}

class RemoteLogger extends BaseLogger {
  private endpoint: string;
  private buffer: LogEntry[] = [];
  private batchSize: number;

  constructor(name: string, config: LoggerConfig) {
    super(name, config);
    this.endpoint = config.destination || 'https://logs.example.com/api/logs';
    this.batchSize = config.batchSize || 10;
  }

  writeLog(entry: LogEntry): void {
    this.buffer.push(entry);
    
    if (this.buffer.length >= this.batchSize) {
      this.sendBatch();
    }
  }

  private async sendBatch(): Promise<void> {
    if (this.buffer.length === 0) return;
    
    const batch = [...this.buffer];
    this.buffer = [];
    
    // Simulate HTTP request
    console.log(`[HTTP POST to ${this.endpoint}] Sending ${batch.length} log entries`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`✅ Successfully sent ${batch.length} log entries to remote server`);
  }

  override async flush(): Promise<void> {
    await this.sendBatch();
  }
}

class DatabaseLogger extends BaseLogger {
  private connectionString: string;
  private tableName: string;

  constructor(name: string, config: LoggerConfig) {
    super(name, config);
    this.connectionString = config.destination || 'postgresql://localhost:5432/logs';
    this.tableName = config.tableName || 'application_logs';
  }

  writeLog(entry: LogEntry): void {
    this.simulateDbInsert(entry);
  }

  private async simulateDbInsert(entry: LogEntry): Promise<void> {
    // Simulate database insertion
    const query = `INSERT INTO ${this.tableName} (timestamp, level, message, context, source) VALUES (?, ?, ?, ?, ?)`;
    const values = [
      entry.timestamp.toISOString(),
      LogLevel[entry.level],
      entry.message,
      JSON.stringify(entry.context || {}),
      entry.source
    ];
    
    console.log(`[DB INSERT] ${query}`);
    console.log(`[DB VALUES] ${JSON.stringify(values)}`);
    
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  override async flush(): Promise<void> {
    console.log(`Database logger flushed - all entries committed to ${this.tableName}`);
  }
}

class MemoryLogger extends BaseLogger {
  private static globalEntries: Map<string, LogEntry[]> = new Map();

  writeLog(entry: LogEntry): void {
    // Store in both instance and global memory
    if (!MemoryLogger.globalEntries.has(this.name)) {
      MemoryLogger.globalEntries.set(this.name, []);
    }
    
    const globalEntries = MemoryLogger.globalEntries.get(this.name)!;
    globalEntries.push(entry);
    
    // Also output to console for visibility
    console.log(`[MEMORY] ${this.formatLogEntry(entry)}`);
  }

  getGlobalEntries(): LogEntry[] {
    return MemoryLogger.globalEntries.get(this.name) || [];
  }

  static getAllEntries(): Map<string, LogEntry[]> {
    return new Map(MemoryLogger.globalEntries);
  }

  static clearAll(): void {
    MemoryLogger.globalEntries.clear();
  }
}

// Concrete Creator implementations
class ConsoleLoggerFactory extends LoggerFactory {
  constructor(private defaultConfig?: LoggerConfig) {
    super();
  }

  createLogger(name: string, config?: LoggerConfig): Logger {
    return new ConsoleLogger(name, { ...this.defaultConfig, ...config });
  }

  getLoggerType(): string {
    return 'Console';
  }
}

class FileLoggerFactory extends LoggerFactory {
  constructor(private defaultConfig?: LoggerConfig) {
    super();
  }

  createLogger(name: string, config?: LoggerConfig): Logger {
    return new FileLogger(name, { ...this.defaultConfig, ...config });
  }

  getLoggerType(): string {
    return 'File';
  }
}

class RemoteLoggerFactory extends LoggerFactory {
  constructor(private defaultConfig?: LoggerConfig) {
    super();
  }

  createLogger(name: string, config?: LoggerConfig): Logger {
    return new RemoteLogger(name, { ...this.defaultConfig, ...config });
  }

  getLoggerType(): string {
    return 'Remote';
  }
}

class DatabaseLoggerFactory extends LoggerFactory {
  constructor(private defaultConfig?: LoggerConfig) {
    super();
  }

  createLogger(name: string, config?: LoggerConfig): Logger {
    return new DatabaseLogger(name, { ...this.defaultConfig, ...config });
  }

  getLoggerType(): string {
    return 'Database';
  }
}

class MemoryLoggerFactory extends LoggerFactory {
  constructor(private defaultConfig?: LoggerConfig) {
    super();
  }

  createLogger(name: string, config?: LoggerConfig): Logger {
    return new MemoryLogger(name, { ...this.defaultConfig, ...config });
  }

  getLoggerType(): string {
    return 'Memory';
  }
}

// Logging Service - shows real-world usage
class LoggingService {
  private loggers: Map<string, Logger> = new Map();
  private factory: LoggerFactory;

  constructor(factory: LoggerFactory) {
    this.factory = factory;
  }

  getLogger(name: string, config?: LoggerConfig): Logger {
    if (!this.loggers.has(name)) {
      const logger = this.factory.getLogger(name);
      this.loggers.set(name, logger);
    }
    return this.loggers.get(name)!;
  }

  async flushAll(): Promise<void> {
    const flushPromises = Array.from(this.loggers.values()).map(logger => logger.flush());
    await Promise.all(flushPromises);
    console.log(`Flushed ${this.loggers.size} loggers`);
  }

  setGlobalLevel(level: LogLevel): void {
    this.loggers.forEach(logger => logger.setLevel(level));
    console.log(`Set global log level to ${LogLevel[level]}`);
  }

  clearAll(): void {
    this.loggers.forEach(logger => logger.clear());
    console.log('Cleared all logger entries');
  }

  getLoggerStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.loggers.forEach((logger, name) => {
      stats[name] = logger.getEntries().length;
    });
    return stats;
  }
}

// Usage Example - Following the documented API exactly
async function demonstrateLoggerFactory(): Promise<void> {
  console.log('=== LOGGER FACTORY DEMO ===');
  console.log('Following the documented API pattern:\n');

  const loggerTypes = ['console', 'file', 'remote', 'database', 'memory'];

  for (const type of loggerTypes) {
    console.log(`--- Testing ${type.toUpperCase()} Logger ---`);
    
    try {
      // Following the exact documented API
      const loggerFactory = LoggerFactory.create(type, {
        filename: './logs/app.log',
        level: LogLevel.INFO
      });

      const logger = loggerFactory.getLogger('UserService');
      logger.info('User created', { userId: 123, email: 'user@example.com' });
      logger.error('Login failed', { attempt: 3, ip: '192.168.1.1' });
      
      // Test different log levels
      logger.debug('Debug message', { debug: true });
      logger.warn('Warning message', { warning: 'high' });
      logger.fatal('Fatal error', { critical: true });
      
      console.log(`Logger entries count: ${logger.getEntries().length}`);
      
      // Create another logger from the same factory
      const orderLogger = loggerFactory.getLogger('OrderService');
      orderLogger.info('Order processed', { orderId: 456, amount: 99.99 });
      orderLogger.error('Payment failed', { orderId: 456, reason: 'insufficient_funds' });
      
      console.log(`Order logger entries: ${orderLogger.getEntries().length}`);
      
      // Flush any pending logs
      await logger.flush();
      await orderLogger.flush();
      
    } catch (error) {
      console.error(`❌ Error with ${type}:`, error instanceof Error ? error.message : String(error));
    }
    
    console.log();
  }

  // Advanced usage example
  console.log('--- Advanced Logger Factory Usage ---');
  const factory = LoggerFactory.create('console', { level: LogLevel.DEBUG });
  
  // Create multiple loggers from the same factory
  const appLogger = factory.getLogger('Application');
  const dbLogger = factory.getLogger('Database');
  const apiLogger = factory.getLogger('API');
  
  // Log different types of messages
  appLogger.info('Application started', { version: '1.0.0', environment: 'production' });
  dbLogger.debug('Database connection established', { host: 'localhost', port: 5432 });
  apiLogger.warn('Rate limit approaching', { current: 95, limit: 100, endpoint: '/api/users' });
  
  // Log an error with context
  apiLogger.error('Failed to process request', { 
    error: 'ValidationError',
    field: 'email',
    value: 'invalid-email',
    requestId: 'req-123456'
  });

  // Log a fatal error
  appLogger.fatal('System out of memory', { 
    memoryUsage: '95%',
    availableMemory: '128MB',
    action: 'shutting_down'
  });

  console.log(`App logger entries: ${appLogger.getEntries().length}`);
  console.log(`DB logger entries: ${dbLogger.getEntries().length}`);
  console.log(`API logger entries: ${apiLogger.getEntries().length}`);
  
  console.log(`✅ Successfully demonstrated ${loggerTypes.length} logger types with documented API`);
}

// Testing Example
async function testLoggerFactory(): Promise<void> {
  console.log('=== LOGGER FACTORY TESTS ===');
  
  // Test 1: Factory creation for different types
  console.log('Test 1 - Factory creation:');
  const loggerTypes = ['console', 'file', 'remote', 'database', 'memory'];
  
  for (const type of loggerTypes) {
    try {
      const factory = LoggerFactory.create(type);
      console.log(`✅ ${type}: Factory created successfully`);
    } catch (error) {
      console.log(`❌ ${type}: Failed to create factory`);
    }
  }
  
  // Test 2: Logger interface consistency
  console.log('\nTest 2 - Logger interface consistency:');
  const factory = LoggerFactory.create('memory');
  const logger = factory.createLogger('test');
  
  const methods = ['debug', 'info', 'warn', 'error', 'fatal', 'log', 'getEntries', 'setLevel', 'clear', 'flush'];
  const hasAllMethods = methods.every(method => typeof (logger as any)[method] === 'function');
  
  console.log('✅ All required methods present:', hasAllMethods);
  
  // Test 3: Log level filtering
  console.log('\nTest 3 - Log level filtering:');
  logger.setLevel(LogLevel.WARN);
  logger.debug('Debug message');
  logger.info('Info message');
  logger.warn('Warning message');
  logger.error('Error message');
  
  const entries = logger.getEntries();
  const filteredCorrectly = entries.length === 2 && 
                           entries.every(e => e.level >= LogLevel.WARN);
  
  console.log('✅ Log level filtering works:', filteredCorrectly);
  
  // Test 4: Context logging
  console.log('\nTest 4 - Context logging:');
  logger.clear();
  logger.error('Test error', { userId: 123, action: 'login' });
  
  const contextEntry = logger.getEntries()[0];
  const hasContext = contextEntry && contextEntry.context && 
                    contextEntry.context.userId === 123;
  
  console.log('✅ Context logging works:', hasContext);
  
  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateLoggerFactory();
  await testLoggerFactory();
  exit(0);
})();

export {
  LoggerFactory,
  Logger,
  LogLevel,
  LogEntry,
  LoggerConfig,
  LoggingService
}; 