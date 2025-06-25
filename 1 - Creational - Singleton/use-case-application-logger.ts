// ============================================================================
// APPLICATION LOGGER - Centralized Logging Service
// ============================================================================

import { exit } from "process";

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

class ApplicationLogger {
  private static instance: ApplicationLogger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogSize: number = 1000;

  private constructor() {}

  public static getInstance(): ApplicationLogger {
    if (!ApplicationLogger.instance) {
      ApplicationLogger.instance = new ApplicationLogger();
    }
    return ApplicationLogger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (level >= this.logLevel) {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level,
        message,
        ...(context && { context })
      };
      
      this.logs.push(logEntry);
      
      // Maintain max log size
      if (this.logs.length > this.maxLogSize) {
        this.logs.shift();
      }
      
      // Output to console with formatting
      const levelName = LogLevel[level];
      const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
      const formattedMessage = `[${logEntry.timestamp.toISOString()}] ${levelName}: ${message}${contextStr}`;
      
      if (level >= LogLevel.ERROR) {
        console.error(formattedMessage);
      } else if (level >= LogLevel.WARN) {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logs]; // Return a copy
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // For testing purposes only
  public static resetInstance(): void {
    ApplicationLogger.instance = null as any;
  }
}

// Usage Example
function demonstrateLogger(): void {
  console.log('=== APPLICATION LOGGER DEMO ===');
  
  const logger = ApplicationLogger.getInstance();
  logger.setLogLevel(LogLevel.DEBUG);
  
  // Log different levels with context
  logger.debug('Debug message', { userId: 123, action: 'login' });
  logger.info('User authenticated successfully', { userId: 123, method: 'OAuth' });
  logger.warn('API rate limit approaching', { remaining: 10, limit: 100 });
  logger.error('Database connection failed', { host: 'localhost', port: 5432, error: 'timeout' });
  
  // Verify same instance
  const anotherLogger = ApplicationLogger.getInstance();
  console.log('Same logger instance?', logger === anotherLogger);
  console.log('Total logs:', logger.getLogs().length);
  console.log('Error logs:', logger.getLogsByLevel(LogLevel.ERROR).length);
  console.log();
}

// Testing Example  
function testLogger(): void {
  console.log('=== APPLICATION LOGGER TESTS ===');
  
  // Test 1: Log level filtering
  ApplicationLogger.resetInstance();
  const logger1 = ApplicationLogger.getInstance();
  logger1.setLogLevel(LogLevel.WARN);
  logger1.debug('This should not appear');
  logger1.warn('This should appear');
  console.log('Test 1 - Logs after WARN filter:', logger1.getLogs().length);
  
  // Test 2: Context logging
  ApplicationLogger.resetInstance();
  const logger2 = ApplicationLogger.getInstance();
  logger2.info('Test with context', { test: true, value: 42 });
  const logs = logger2.getLogs();
  console.log('Test 2 - Context exists?', logs[0].context?.test === true);
  
  // Test 3: Log export
  const exported = logger2.exportLogs();
  console.log('Test 3 - Export is JSON?', exported.startsWith('['));
  console.log();
}

// Run demonstrations
demonstrateLogger();
testLogger();

export { ApplicationLogger, LogLevel, LogEntry };
exit(0); 