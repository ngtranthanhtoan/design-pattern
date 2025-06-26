// ============================================================================
// WINSTON LOGGER ADAPTER - Unified Logger Interface
// ============================================================================

import { exit } from 'process';

// We'll simulate winston for demonstration
const winston = {
  createLogger: (config: any) => ({
    info: (msg: string, meta: any) => console.log('ℹ️', msg, meta),
    warn: (msg: string, meta: any) => console.warn('⚠️', msg, meta),
    error: (msg: string, meta: any) => console.error('❌', msg, meta),
    debug: (msg: string, meta: any) => console.debug('🐛', msg, meta)
  }),
  format: { timestamp: () => {}, json: () => {}, combine: (...args: any[]) => {} },
  transports: {
    Console: class { constructor() {} },
    File: class { constructor(opts: any) {} }
  }
};

// -----------------------------------------------------------------------------
// 1. Target Interface
// -----------------------------------------------------------------------------

interface Logger {
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
  debug(message: string, context?: any): void;
}

// -----------------------------------------------------------------------------
// 2. Adapter
// -----------------------------------------------------------------------------

class WinstonAdapter implements Logger {
  private logger: any;
  constructor(config: { level?: string; file?: string } = {}) {
    this.logger = winston.createLogger({
      level: config.level || 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [new winston.transports.Console(), new winston.transports.File({ filename: config.file || 'app.log' })]
    });
  }
  info(message: string, context?: any): void { this.logger.info(message, { context }); }
  warn(message: string, context?: any): void { this.logger.warn(message, { context }); }
  error(message: string, error?: Error, context?: any): void { this.logger.error(message, { error: error?.message, stack: error?.stack, context }); }
  debug(message: string, context?: any): void { this.logger.debug(message, { context }); }
}

// -----------------------------------------------------------------------------
// 3. Demo
// -----------------------------------------------------------------------------

function demo(): void {
  console.log('=== WINSTON LOGGER ADAPTER DEMO ===');
  const logger: Logger = new WinstonAdapter({ level: 'debug' });
  logger.info('User login', { userId: 1 });
  logger.warn('Low disk space', { path: '/var' });
  logger.error('Unhandled exception', new Error('Boom!'), { module: 'core' });
  logger.debug('Debug details', { data: { a: 1 } });
}

demo();
exit(0);

export { Logger, WinstonAdapter }; 