import { exit } from 'process';

// Log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Log message
interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: Date;
}

// Handler interface
abstract class LogHandler {
  protected next?: LogHandler;
  protected level: LogLevel;
  
  constructor(level: LogLevel) {
    this.level = level;
  }
  
  setNext(handler: LogHandler): LogHandler {
    this.next = handler;
    return handler;
  }
  
  handle(message: LogMessage): void {
    if (message.level >= this.level) {
      this.log(message);
    }
    
    if (this.next) {
      this.next.handle(message);
    }
  }
  
  protected abstract log(message: LogMessage): void;
}

// Debug handler
class DebugHandler extends LogHandler {
  constructor() { super(LogLevel.DEBUG); }
  
  protected log(message: LogMessage): void {
    console.log(`🐛 DEBUG: ${message.message}`);
  }
}

// Info handler
class InfoHandler extends LogHandler {
  constructor() { super(LogLevel.INFO); }
  
  protected log(message: LogMessage): void {
    console.log(`ℹ️  INFO: ${message.message}`);
  }
}

// Warn handler
class WarnHandler extends LogHandler {
  constructor() { super(LogLevel.WARN); }
  
  protected log(message: LogMessage): void {
    console.log(`⚠️  WARN: ${message.message}`);
  }
}

// Error handler
class ErrorHandler extends LogHandler {
  constructor() { super(LogLevel.ERROR); }
  
  protected log(message: LogMessage): void {
    console.log(`❌ ERROR: ${message.message}`);
  }
}

// Demo
const debug = new DebugHandler();
const info = new InfoHandler();
const warn = new WarnHandler();
const error = new ErrorHandler();

// Build chain: DEBUG → INFO → WARN → ERROR
debug.setNext(info).setNext(warn).setNext(error);

console.log('=== LOGGING LEVEL CHAIN DEMO ===');

// Test different log levels
const messages: LogMessage[] = [
  { level: LogLevel.DEBUG, message: 'User clicked button', timestamp: new Date() },
  { level: LogLevel.INFO, message: 'User logged in successfully', timestamp: new Date() },
  { level: LogLevel.WARN, message: 'Database connection slow', timestamp: new Date() },
  { level: LogLevel.ERROR, message: 'Failed to save user data', timestamp: new Date() }
];

messages.forEach(msg => {
  console.log(`\n--- Logging ${LogLevel[msg.level]} message ---`);
  debug.handle(msg);
});

exit(0); 