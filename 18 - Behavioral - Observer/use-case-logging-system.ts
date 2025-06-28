import { exit } from 'process';

// Observer interface
interface Observer {
  update(logEntry: LogEntry): void;
}

// Subject interface
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(logEntry: LogEntry): void;
}

// Log entry interface
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context: {
    service: string;
    userId?: string;
    requestId?: string;
    sessionId?: string;
    [key: string]: any;
  };
  metadata?: {
    stackTrace?: string;
    performance?: {
      duration: number;
      memory: number;
    };
    tags?: string[];
  };
}

// Logger (Subject)
class Logger implements Subject {
  private observers: Set<Observer> = new Set();
  private logCounter: number = 0;
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  attach(observer: Observer): void {
    this.observers.add(observer);
    console.log(`📝 ${observer.constructor.name} subscribed to ${this.serviceName} logger`);
  }

  detach(observer: Observer): void {
    this.observers.delete(observer);
    console.log(`📝 ${observer.constructor.name} unsubscribed from ${this.serviceName} logger`);
  }

  notify(logEntry: LogEntry): void {
    console.log(`🔔 ${this.serviceName} notifying ${this.observers.size} observers about log entry`);
    this.observers.forEach(observer => {
      try {
        observer.update(logEntry);
      } catch (error) {
        console.error(`❌ Error notifying ${observer.constructor.name}:`, error);
      }
    });
  }

  private createLogEntry(level: LogEntry['level'], message: string, context: Partial<LogEntry['context']> = {}, metadata?: LogEntry['metadata']): LogEntry {
    const logEntry: LogEntry = {
      id: `log-${++this.logCounter}`,
      timestamp: new Date(),
      level,
      message,
      context: {
        service: this.serviceName,
        ...context
      },
      metadata
    };

    return logEntry;
  }

  debug(message: string, context?: Partial<LogEntry['context']>, metadata?: LogEntry['metadata']): void {
    const logEntry = this.createLogEntry('debug', message, context, metadata);
    console.log(`🐛 [DEBUG] ${message}`);
    this.notify(logEntry);
  }

  info(message: string, context?: Partial<LogEntry['context']>, metadata?: LogEntry['metadata']): void {
    const logEntry = this.createLogEntry('info', message, context, metadata);
    console.log(`ℹ️ [INFO] ${message}`);
    this.notify(logEntry);
  }

  warn(message: string, context?: Partial<LogEntry['context']>, metadata?: LogEntry['metadata']): void {
    const logEntry = this.createLogEntry('warn', message, context, metadata);
    console.log(`⚠️ [WARN] ${message}`);
    this.notify(logEntry);
  }

  error(message: string, error?: Error, context?: Partial<LogEntry['context']>, metadata?: LogEntry['metadata']): void {
    const logEntry = this.createLogEntry('error', message, context, {
      ...metadata,
      stackTrace: error?.stack
    });
    console.log(`❌ [ERROR] ${message}`);
    this.notify(logEntry);
  }

  fatal(message: string, error?: Error, context?: Partial<LogEntry['context']>, metadata?: LogEntry['metadata']): void {
    const logEntry = this.createLogEntry('fatal', message, context, {
      ...metadata,
      stackTrace: error?.stack
    });
    console.log(`💀 [FATAL] ${message}`);
    this.notify(logEntry);
  }

  getServiceName(): string {
    return this.serviceName;
  }
}

// Console Logger (Observer)
class ConsoleLogger implements Observer {
  private name: string;
  private logLevels: Set<LogEntry['level']>;
  private includeTimestamp: boolean;
  private includeContext: boolean;

  constructor(name: string, options: {
    levels?: LogEntry['level'][];
    includeTimestamp?: boolean;
    includeContext?: boolean;
  } = {}) {
    this.name = name;
    this.logLevels = new Set(options.levels || ['info', 'warn', 'error', 'fatal']);
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.includeContext = options.includeContext ?? false;
  }

  update(logEntry: LogEntry): void {
    if (!this.logLevels.has(logEntry.level)) {
      return;
    }

    const timestamp = this.includeTimestamp ? `[${logEntry.timestamp.toISOString()}]` : '';
    const context = this.includeContext ? ` [${logEntry.context.service}]` : '';
    const level = `[${logEntry.level.toUpperCase()}]`;
    
    console.log(`${timestamp}${context} ${level} ${logEntry.message}`);
    
    if (logEntry.metadata?.stackTrace) {
      console.log(`Stack trace: ${logEntry.metadata.stackTrace}`);
    }
  }

  getName(): string {
    return this.name;
  }
}

// File Logger (Observer)
class FileLogger implements Observer {
  private name: string;
  private logLevels: Set<LogEntry['level']>;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number;
  private flushInterval: number;
  private flushTimer?: NodeJS.Timeout;

  constructor(name: string, options: {
    levels?: LogEntry['level'][];
    maxBufferSize?: number;
    flushInterval?: number;
  } = {}) {
    this.name = name;
    this.logLevels = new Set(options.levels || ['warn', 'error', 'fatal']);
    this.maxBufferSize = options.maxBufferSize || 100;
    this.flushInterval = options.flushInterval || 5000; // 5 seconds

    // Start periodic flush
    this.startPeriodicFlush();
  }

  update(logEntry: LogEntry): void {
    if (!this.logLevels.has(logEntry.level)) {
      return;
    }

    this.logBuffer.push(logEntry);
    console.log(`📁 ${this.name} buffered log entry: ${logEntry.message}`);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logsToWrite = [...this.logBuffer];
    this.logBuffer = [];

    // Simulate writing to file
    console.log(`💾 ${this.name} writing ${logsToWrite.length} log entries to file`);
    
    logsToWrite.forEach(log => {
      const logLine = `${log.timestamp.toISOString()} [${log.level.toUpperCase()}] [${log.context.service}] ${log.message}`;
      console.log(`📄 File: ${logLine}`);
    });
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flush();
    }
  }

  getName(): string {
    return this.name;
  }

  getBufferSize(): number {
    return this.logBuffer.length;
  }
}

// Database Logger (Observer)
class DatabaseLogger implements Observer {
  private name: string;
  private logLevels: Set<LogEntry['level']>;
  private database: Array<LogEntry> = [];
  private maxDatabaseSize: number;

  constructor(name: string, options: {
    levels?: LogEntry['level'][];
    maxDatabaseSize?: number;
  } = {}) {
    this.name = name;
    this.logLevels = new Set(options.levels || ['error', 'fatal']);
    this.maxDatabaseSize = options.maxDatabaseSize || 1000;
  }

  update(logEntry: LogEntry): void {
    if (!this.logLevels.has(logEntry.level)) {
      return;
    }

    this.database.push(logEntry);
    console.log(`🗄️ ${this.name} stored log entry in database: ${logEntry.message}`);

    // Remove oldest entries if database is full
    if (this.database.length > this.maxDatabaseSize) {
      const removed = this.database.splice(0, this.database.length - this.maxDatabaseSize);
      console.log(`🗑️ ${this.name} removed ${removed.length} old log entries from database`);
    }
  }

  query(level?: LogEntry['level'], service?: string, startDate?: Date, endDate?: Date): LogEntry[] {
    let results = [...this.database];

    if (level) {
      results = results.filter(log => log.level === level);
    }

    if (service) {
      results = results.filter(log => log.context.service === service);
    }

    if (startDate) {
      results = results.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      results = results.filter(log => log.timestamp <= endDate);
    }

    return results;
  }

  getName(): string {
    return this.name;
  }

  getDatabaseSize(): number {
    return this.database.length;
  }
}

// Alert System (Observer)
class AlertSystem implements Observer {
  private name: string;
  private alertLevels: Set<LogEntry['level']>;
  private alertThresholds: Map<LogEntry['level'], number>;
  private alertCounts: Map<LogEntry['level'], number> = new Map();
  private alertHistory: Array<{ level: LogEntry['level']; message: string; timestamp: Date; count: number }> = [];

  constructor(name: string, options: {
    levels?: LogEntry['level'][];
    thresholds?: Map<LogEntry['level'], number>;
  } = {}) {
    this.name = name;
    this.alertLevels = new Set(options.levels || ['error', 'fatal']);
    this.alertThresholds = options.thresholds || new Map([
      ['error', 5],
      ['fatal', 1]
    ]);
  }

  update(logEntry: LogEntry): void {
    if (!this.alertLevels.has(logEntry.level)) {
      return;
    }

    const currentCount = (this.alertCounts.get(logEntry.level) || 0) + 1;
    this.alertCounts.set(logEntry.level, currentCount);

    const threshold = this.alertThresholds.get(logEntry.level);
    if (threshold && currentCount >= threshold) {
      this.sendAlert(logEntry.level, logEntry.message, currentCount);
      this.alertCounts.set(logEntry.level, 0); // Reset counter
    }
  }

  private sendAlert(level: LogEntry['level'], message: string, count: number): void {
    const alert = {
      level,
      message: `Alert: ${count} ${level} logs detected. Latest: ${message}`,
      timestamp: new Date(),
      count
    };

    this.alertHistory.push(alert);

    // Simulate different alert methods based on severity
    if (level === 'fatal') {
      console.log(`🚨 ${this.name} CRITICAL ALERT: ${alert.message}`);
      this.sendSMS(alert.message);
      this.sendEmail(alert.message);
    } else {
      console.log(`⚠️ ${this.name} ALERT: ${alert.message}`);
      this.sendEmail(alert.message);
    }
  }

  private sendSMS(message: string): void {
    console.log(`📱 SMS Alert: ${message}`);
  }

  private sendEmail(message: string): void {
    console.log(`📧 Email Alert: ${message}`);
  }

  getAlertHistory(): Array<{ level: LogEntry['level']; message: string; timestamp: Date; count: number }> {
    return [...this.alertHistory];
  }

  getName(): string {
    return this.name;
  }
}

// Performance Monitor (Observer)
class PerformanceMonitor implements Observer {
  private name: string;
  private performanceData: Array<{ timestamp: Date; service: string; duration: number; memory: number }> = [];
  private slowQueryThreshold: number;
  private memoryThreshold: number;

  constructor(name: string, options: {
    slowQueryThreshold?: number;
    memoryThreshold?: number;
  } = {}) {
    this.name = name;
    this.slowQueryThreshold = options.slowQueryThreshold || 1000; // 1 second
    this.memoryThreshold = options.memoryThreshold || 100; // 100 MB
  }

  update(logEntry: LogEntry): void {
    if (logEntry.metadata?.performance) {
      const { duration, memory } = logEntry.metadata.performance;
      
      this.performanceData.push({
        timestamp: logEntry.timestamp,
        service: logEntry.context.service,
        duration,
        memory
      });

      console.log(`📊 ${this.name} recorded performance data: ${duration}ms, ${memory}MB`);

      // Check for performance issues
      if (duration > this.slowQueryThreshold) {
        console.log(`🐌 ${this.name} SLOW QUERY DETECTED: ${duration}ms in ${logEntry.context.service}`);
      }

      if (memory > this.memoryThreshold) {
        console.log(`💾 ${this.name} HIGH MEMORY USAGE: ${memory}MB in ${logEntry.context.service}`);
      }
    }
  }

  getPerformanceData(): Array<{ timestamp: Date; service: string; duration: number; memory: number }> {
    return [...this.performanceData];
  }

  getAveragePerformance(): { avgDuration: number; avgMemory: number } {
    if (this.performanceData.length === 0) {
      return { avgDuration: 0, avgMemory: 0 };
    }

    const totalDuration = this.performanceData.reduce((sum, data) => sum + data.duration, 0);
    const totalMemory = this.performanceData.reduce((sum, data) => sum + data.memory, 0);

    return {
      avgDuration: totalDuration / this.performanceData.length,
      avgMemory: totalMemory / this.performanceData.length
    };
  }

  getName(): string {
    return this.name;
  }
}

// Logging System
class LoggingSystem {
  private loggers: Map<string, Logger> = new Map();
  private observers: Observer[] = [];

  constructor() {
    console.log('🔧 Logging system initialized');
  }

  createLogger(serviceName: string): Logger {
    const logger = new Logger(serviceName);
    this.loggers.set(serviceName, logger);
    
    // Attach all observers to the new logger
    this.observers.forEach(observer => {
      logger.attach(observer);
    });
    
    return logger;
  }

  addObserver(observer: Observer): void {
    this.observers.push(observer);
    
    // Attach to all existing loggers
    this.loggers.forEach(logger => {
      logger.attach(observer);
    });
    
    console.log(`👁️ Added observer: ${observer.constructor.name}`);
  }

  removeObserver(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      
      // Detach from all loggers
      this.loggers.forEach(logger => {
        logger.detach(observer);
      });
      
      console.log(`👁️ Removed observer: ${observer.constructor.name}`);
    }
  }

  getLoggers(): Logger[] {
    return Array.from(this.loggers.values());
  }

  getObservers(): Observer[] {
    return [...this.observers];
  }
}

// Demo
console.log('=== LOGGING SYSTEM DEMO ===\n');

// Create logging system
const loggingSystem = new LoggingSystem();

// Create observers
const consoleLogger = new ConsoleLogger('Console Logger', {
  levels: ['info', 'warn', 'error', 'fatal'],
  includeTimestamp: true,
  includeContext: true
});

const fileLogger = new FileLogger('File Logger', {
  levels: ['warn', 'error', 'fatal'],
  maxBufferSize: 5,
  flushInterval: 3000
});

const databaseLogger = new DatabaseLogger('Database Logger', {
  levels: ['error', 'fatal'],
  maxDatabaseSize: 50
});

const alertSystem = new AlertSystem('Alert System', {
  levels: ['error', 'fatal'],
  thresholds: new Map([
    ['error', 3],
    ['fatal', 1]
  ])
});

const performanceMonitor = new PerformanceMonitor('Performance Monitor', {
  slowQueryThreshold: 500,
  memoryThreshold: 50
});

// Add observers to logging system
loggingSystem.addObserver(consoleLogger);
loggingSystem.addObserver(fileLogger);
loggingSystem.addObserver(databaseLogger);
loggingSystem.addObserver(alertSystem);
loggingSystem.addObserver(performanceMonitor);

// Create loggers for different services
const userServiceLogger = loggingSystem.createLogger('UserService');
const paymentServiceLogger = loggingSystem.createLogger('PaymentService');
const orderServiceLogger = loggingSystem.createLogger('OrderService');

console.log('\n=== SIMULATING APPLICATION LOGGING ===');

// Simulate user service logs
userServiceLogger.info('User authentication successful', { userId: 'user123', requestId: 'req456' });
userServiceLogger.debug('Validating user credentials', { userId: 'user123' });
userServiceLogger.warn('User session expired', { userId: 'user123', sessionId: 'sess789' });

// Simulate payment service logs with performance data
paymentServiceLogger.info('Processing payment', { userId: 'user123', requestId: 'req456' }, {
  performance: { duration: 250, memory: 25 }
});

paymentServiceLogger.error('Payment failed - insufficient funds', 
  new Error('Insufficient funds'), 
  { userId: 'user123', requestId: 'req456' }
);

paymentServiceLogger.error('Payment gateway timeout', 
  new Error('Gateway timeout'), 
  { userId: 'user456', requestId: 'req789' }
);

paymentServiceLogger.error('Database connection failed', 
  new Error('Connection refused'), 
  { userId: 'user789', requestId: 'req101' }
);

// Simulate order service logs
orderServiceLogger.info('Order created successfully', { userId: 'user123', requestId: 'req456' });
orderServiceLogger.warn('Inventory low for product ABC123', { productId: 'ABC123' });

// Simulate slow operation
orderServiceLogger.info('Processing large order', { userId: 'user456', requestId: 'req789' }, {
  performance: { duration: 1200, memory: 75 }
});

// Simulate fatal error
orderServiceLogger.fatal('Critical system failure', 
  new Error('Database corruption detected'), 
  { userId: 'user123', requestId: 'req456' }
);

console.log('\n=== DEMONSTRATING LOGGER FEATURES ===');

// Wait for file logger to flush
setTimeout(() => {
  console.log('\n📊 Performance Statistics:');
  const perfData = performanceMonitor.getPerformanceData();
  const avgPerf = performanceMonitor.getAveragePerformance();
  
  console.log(`Total performance records: ${perfData.length}`);
  console.log(`Average duration: ${avgPerf.avgDuration.toFixed(2)}ms`);
  console.log(`Average memory usage: ${avgPerf.avgMemory.toFixed(2)}MB`);

  console.log('\n🗄️ Database Logs:');
  const dbLogs = databaseLogger.query();
  dbLogs.forEach(log => {
    console.log(`- [${log.level}] ${log.message}`);
  });

  console.log('\n🚨 Alert History:');
  const alerts = alertSystem.getAlertHistory();
  alerts.forEach(alert => {
    console.log(`- ${alert.timestamp.toLocaleTimeString()}: ${alert.message}`);
  });

  console.log('\n📁 File Logger Buffer:');
  console.log(`Buffer size: ${fileLogger.getBufferSize()} entries`);

  console.log('\n✅ Logging system demo completed successfully');
  
  // Stop file logger
  fileLogger.stop();
  
  exit(0);
}, 4000); 