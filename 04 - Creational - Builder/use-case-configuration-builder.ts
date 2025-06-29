// ============================================================================
// CONFIGURATION BUILDER - Complex Configuration Object Construction
// ============================================================================

import { exit } from "process";

// Configuration interfaces and types
interface PoolSettings {
  min: number;
  max: number;
  acquireTimeoutMillis?: number;
  createTimeoutMillis?: number;
  destroyTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  reapIntervalMillis?: number;
  createRetryIntervalMillis?: number;
}

interface RetryOptions {
  attempts: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
  maxDelay?: number;
}

interface SSLConfig {
  enabled: boolean;
  cert?: string;
  key?: string;
  ca?: string;
  rejectUnauthorized?: boolean;
}

interface DatabaseConfiguration {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username?: string;
  readonly password?: string;
  readonly poolSettings: PoolSettings;
  readonly ssl: SSLConfig;
  readonly timeout: number;
  readonly retryOptions: RetryOptions;
  readonly compression: boolean;
  readonly logging: boolean;
  readonly maxConnections: number;
  readonly connectionString?: string;
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  destination: 'console' | 'file' | 'both';
  filePath?: string;
  maxSize?: number;
  rotate?: boolean;
}

interface CacheConfig {
  ttl: number; // seconds
  maxSize: number; // number of items
  strategy: 'lru' | 'lfu' | 'fifo';
  persistent?: boolean;
  persistPath?: string;
}

interface SecurityConfig {
  cors: boolean;
  helmet: boolean;
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  jwt?: {
    secret: string;
    expiresIn: string;
  };
}

interface ApplicationConfiguration {
  readonly environment: 'development' | 'staging' | 'production';
  readonly port: number;
  readonly host: string;
  readonly logging: LoggingConfig;
  readonly cache: CacheConfig;
  readonly security: SecurityConfig;
  readonly features: Record<string, boolean>;
  readonly version: string;
  readonly buildNumber?: string;
}

// ============================================================================
// DATABASE CONFIGURATION BUILDER
// ============================================================================

class DatabaseConfigurationBuilder {
  private config: Partial<Omit<DatabaseConfiguration, 'readonly'>> & {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    poolSettings?: PoolSettings;
    ssl?: SSLConfig;
    timeout?: number;
    retryOptions?: RetryOptions;
    compression?: boolean;
    logging?: boolean;
    maxConnections?: number;
    connectionString?: string;
  } = {
    // Default values
    port: 5432,
    poolSettings: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000
    },
    ssl: {
      enabled: false,
      rejectUnauthorized: true
    },
    timeout: 30000,
    retryOptions: {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential',
      maxDelay: 10000
    },
    compression: false,
    logging: false,
    maxConnections: 100
  };

  host(host: string): this {
    if (!host || host.trim() === '') {
      throw new Error('Host cannot be empty');
    }
    this.config.host = host.trim();
    return this;
  }

  port(port: number): this {
    if (port < 1 || port > 65535) {
      throw new Error('Port must be between 1 and 65535');
    }
    this.config.port = port;
    return this;
  }

  database(database: string): this {
    if (!database || database.trim() === '') {
      throw new Error('Database name cannot be empty');
    }
    this.config.database = database.trim();
    return this;
  }

  credentials(username: string, password: string): this {
    if (!username || username.trim() === '') {
      throw new Error('Username cannot be empty');
    }
    this.config.username = username.trim();
    this.config.password = password; // Password can be empty for some auth methods
    return this;
  }

  poolSettings(settings: Partial<PoolSettings>): this {
    this.config.poolSettings = {
      ...this.config.poolSettings!,
      ...settings
    };

    // Validate pool settings
    const pool = this.config.poolSettings;
    if (pool.min < 0) throw new Error('Pool min cannot be negative');
    if (pool.max < pool.min) throw new Error('Pool max cannot be less than min');
    if (pool.acquireTimeoutMillis && pool.acquireTimeoutMillis < 1000) {
      throw new Error('Acquire timeout should be at least 1000ms');
    }

    return this;
  }

  ssl(enabled: boolean, options?: Partial<Omit<SSLConfig, 'enabled'>>): this {
    this.config.ssl = {
      enabled,
      ...this.config.ssl,
      ...options
    };
    return this;
  }

  timeout(timeoutMs: number): this {
    if (timeoutMs < 1000) {
      throw new Error('Timeout should be at least 1000ms');
    }
    this.config.timeout = timeoutMs;
    return this;
  }

  retryOptions(options: Partial<RetryOptions>): this {
    this.config.retryOptions = {
      ...this.config.retryOptions!,
      ...options
    };

    const retry = this.config.retryOptions;
    if (retry.attempts < 1) throw new Error('Retry attempts must be at least 1');
    if (retry.delay < 100) throw new Error('Retry delay should be at least 100ms');

    return this;
  }

  compression(enabled: boolean): this {
    this.config.compression = enabled;
    return this;
  }

  logging(enabled: boolean): this {
    this.config.logging = enabled;
    return this;
  }

  maxConnections(max: number): this {
    if (max < 1) throw new Error('Max connections must be at least 1');
    this.config.maxConnections = max;
    return this;
  }

  connectionString(connectionString: string): this {
    if (!connectionString || connectionString.trim() === '') {
      throw new Error('Connection string cannot be empty');
    }
    this.config.connectionString = connectionString.trim();
    return this;
  }

  build(): DatabaseConfiguration {
    // Validate required fields
    if (!this.config.host) {
      throw new Error('Host is required');
    }
    if (!this.config.database) {
      throw new Error('Database name is required');
    }

    // Return immutable configuration
    return Object.freeze({
      host: this.config.host,
      port: this.config.port!,
      database: this.config.database,
      username: this.config.username,
      password: this.config.password,
      poolSettings: Object.freeze({ ...this.config.poolSettings! }),
      ssl: Object.freeze({ ...this.config.ssl! }),
      timeout: this.config.timeout!,
      retryOptions: Object.freeze({ ...this.config.retryOptions! }),
      compression: this.config.compression!,
      logging: this.config.logging!,
      maxConnections: this.config.maxConnections!,
      connectionString: this.config.connectionString
    });
  }

  // Static factory method for common configurations
  static forEnvironment(env: 'development' | 'staging' | 'production'): DatabaseConfigurationBuilder {
    const builder = new DatabaseConfigurationBuilder();
    
    switch (env) {
      case 'development':
        return builder
          .host('localhost')
          .port(5432)
          .database('myapp_dev')
          .credentials('dev_user', 'dev_password')
          .logging(true)
          .poolSettings({ min: 1, max: 5 });
      
      case 'staging':
        return builder
          .host('staging-db.example.com')
          .port(5432)
          .ssl(true)
          .compression(true)
          .poolSettings({ min: 2, max: 10 })
          .retryOptions({ attempts: 5, delay: 2000 });
      
      case 'production':
        return builder
          .ssl(true, { rejectUnauthorized: true })
          .compression(true)
          .poolSettings({ min: 5, max: 20 })
          .retryOptions({ attempts: 5, delay: 1000, backoff: 'exponential' })
          .timeout(60000)
          .maxConnections(200);
      
      default:
        return builder;
    }
  }
}

// ============================================================================
// APPLICATION CONFIGURATION BUILDER
// ============================================================================

class ApplicationConfigurationBuilder {
  private config: Partial<Omit<ApplicationConfiguration, 'readonly'>> & {
    environment?: 'development' | 'staging' | 'production';
    port?: number;
    host?: string;
    logging?: LoggingConfig;
    cache?: CacheConfig;
    security?: SecurityConfig;
    features?: Record<string, boolean>;
    version?: string;
    buildNumber?: string;
  } = {
    // Default values
    port: 3000,
    host: '0.0.0.0',
    logging: {
      level: 'info',
      destination: 'console'
    },
    cache: {
      ttl: 3600,
      maxSize: 1000,
      strategy: 'lru',
      persistent: false
    },
    security: {
      cors: true,
      helmet: true
    },
    features: {},
    version: '1.0.0'
  };

  environment(env: 'development' | 'staging' | 'production'): this {
    this.config.environment = env;
    
    // Auto-configure based on environment
    switch (env) {
      case 'development':
        this.config.logging = { 
          level: 'debug', 
          destination: 'console' 
        };
        break;
      case 'staging':
        this.config.logging = { 
          level: 'info', 
          destination: 'both',
          filePath: './logs/staging.log'
        };
        break;
      case 'production':
        this.config.logging = { 
          level: 'warn', 
          destination: 'file',
          filePath: './logs/production.log',
          rotate: true,
          maxSize: 100 * 1024 * 1024 // 100MB
        };
        break;
    }
    
    return this;
  }

  port(port: number): this {
    if (port < 1 || port > 65535) {
      throw new Error('Port must be between 1 and 65535');
    }
    this.config.port = port;
    return this;
  }

  host(host: string): this {
    if (!host || host.trim() === '') {
      throw new Error('Host cannot be empty');
    }
    this.config.host = host.trim();
    return this;
  }

  logging(config: Partial<LoggingConfig>): this {
    this.config.logging = {
      ...this.config.logging!,
      ...config
    };

    // Validate logging config
    const logging = this.config.logging;
    if (logging.destination === 'file' && !logging.filePath) {
      throw new Error('File path is required when logging to file');
    }
    if (logging.maxSize && logging.maxSize < 1024) {
      throw new Error('Log file max size should be at least 1KB');
    }

    return this;
  }

  cache(config: Partial<CacheConfig>): this {
    this.config.cache = {
      ...this.config.cache!,
      ...config
    };

    // Validate cache config
    const cache = this.config.cache;
    if (cache.ttl < 1) throw new Error('Cache TTL must be at least 1 second');
    if (cache.maxSize < 1) throw new Error('Cache max size must be at least 1');
    if (cache.persistent && !cache.persistPath) {
      throw new Error('Persist path is required when cache is persistent');
    }

    return this;
  }

  security(config: Partial<SecurityConfig>): this {
    this.config.security = {
      ...this.config.security!,
      ...config
    };

    // Validate security config
    const security = this.config.security;
    if (security.rateLimit) {
      if (security.rateLimit.windowMs < 1000) {
        throw new Error('Rate limit window should be at least 1000ms');
      }
      if (security.rateLimit.max < 1) {
        throw new Error('Rate limit max should be at least 1');
      }
    }
    if (security.jwt && !security.jwt.secret) {
      throw new Error('JWT secret is required when JWT is enabled');
    }

    return this;
  }

  feature(name: string, enabled: boolean): this {
    this.config.features = {
      ...this.config.features!,
      [name]: enabled
    };
    return this;
  }

  features(features: Record<string, boolean>): this {
    this.config.features = {
      ...this.config.features!,
      ...features
    };
    return this;
  }

  version(version: string): this {
    if (!version || version.trim() === '') {
      throw new Error('Version cannot be empty');
    }
    this.config.version = version.trim();
    return this;
  }

  buildNumber(buildNumber: string): this {
    this.config.buildNumber = buildNumber;
    return this;
  }

  build(): ApplicationConfiguration {
    // Validate required fields
    if (!this.config.environment) {
      throw new Error('Environment is required');
    }

    // Return immutable configuration
    return Object.freeze({
      environment: this.config.environment,
      port: this.config.port!,
      host: this.config.host!,
      logging: Object.freeze({ ...this.config.logging! }),
      cache: Object.freeze({ ...this.config.cache! }),
      security: Object.freeze({ ...this.config.security! }),
      features: Object.freeze({ ...this.config.features! }),
      version: this.config.version!,
      buildNumber: this.config.buildNumber
    });
  }

  // Static factory method for quick setup
  static forProduction(): ApplicationConfigurationBuilder {
    return new ApplicationConfigurationBuilder()
      .environment('production')
      .security({
        cors: true,
        helmet: true,
        rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }
      })
      .cache({ ttl: 7200, maxSize: 5000, strategy: 'lru' })
      .features({
        analytics: true,
        monitoring: true,
        debug: false
      });
  }
}

// ============================================================================
// USAGE DEMONSTRATIONS
// ============================================================================

// Configuration validation helper
class ConfigurationValidator {
  static validateDatabaseConfig(config: DatabaseConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.poolSettings.max > config.maxConnections) {
      errors.push('Pool max cannot exceed max connections');
    }

    if (config.ssl.enabled && !config.ssl.ca && !config.ssl.rejectUnauthorized) {
      errors.push('SSL CA certificate should be provided when reject unauthorized is false');
    }

    if (config.retryOptions.attempts > 10) {
      errors.push('Too many retry attempts may cause performance issues');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateApplicationConfig(config: ApplicationConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.environment === 'production' && config.logging.level === 'debug') {
      errors.push('Debug logging should not be enabled in production');
    }

    if (config.cache.persistent && !config.cache.persistPath) {
      errors.push('Persistent cache requires a persist path');
    }

    if (config.security.jwt && config.security.jwt.expiresIn === '1h' && config.environment === 'production') {
      errors.push('JWT expiration should be shorter in production');
    }

    return { valid: errors.length === 0, errors };
  }
}

// Usage Example - Following the documented API exactly
async function demonstrateConfigurationBuilder(): Promise<void> {
  console.log('=== CONFIGURATION BUILDER DEMO ===');
  console.log('Following the documented API pattern:\n');

  // Database Configuration Example
  console.log('--- Database Configuration ---');
  
  try {
    const dbConfig = new DatabaseConfigurationBuilder()
      .host('localhost')
      .port(5432)
      .database('myapp_production')
      .credentials('admin', 'secure_password')
      .poolSettings({ min: 2, max: 10, acquireTimeoutMillis: 30000 })
      .ssl(true)
      .timeout(45000)
      .retryOptions({ attempts: 3, delay: 1000 })
      .compression(true)
      .build();

    console.log('Database Configuration:');
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`Username: ${dbConfig.username}`);
    console.log(`SSL Enabled: ${dbConfig.ssl.enabled}`);
    console.log(`Pool Settings: min=${dbConfig.poolSettings.min}, max=${dbConfig.poolSettings.max}`);
    console.log(`Timeout: ${dbConfig.timeout}ms`);
    console.log(`Retry Attempts: ${dbConfig.retryOptions.attempts}`);
    console.log(`Compression: ${dbConfig.compression}`);

    // Validate configuration
    const dbValidation = ConfigurationValidator.validateDatabaseConfig(dbConfig);
    console.log(`Configuration Valid: ${dbValidation.valid}`);
    if (!dbValidation.valid) {
      console.log(`Validation Errors: ${dbValidation.errors.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Database config error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // Application Configuration Example
  console.log('--- Application Configuration ---');
  
  try {
    const appConfig = new ApplicationConfigurationBuilder()
      .environment('production')
      .port(8080)
      .host('0.0.0.0')
      .logging({ level: 'info', destination: 'file', filePath: './logs/app.log' })
      .cache({ ttl: 3600, maxSize: 1000, strategy: 'lru' })
      .security({ cors: true, helmet: true })
      .features({
        analytics: true,
        monitoring: true,
        debug: false
      })
      .version('2.1.0')
      .buildNumber('2024.06.25.1')
      .build();

    console.log('Application Configuration:');
    console.log(`Environment: ${appConfig.environment}`);
    console.log(`Server: ${appConfig.host}:${appConfig.port}`);
    console.log(`Logging: ${appConfig.logging.level} -> ${appConfig.logging.destination}`);
    console.log(`Cache: ${appConfig.cache.strategy}, TTL=${appConfig.cache.ttl}s, Max=${appConfig.cache.maxSize}`);
    console.log(`Security: CORS=${appConfig.security.cors}, Helmet=${appConfig.security.helmet}`);
    console.log(`Features: ${Object.keys(appConfig.features).length} features configured`);
    console.log(`Version: ${appConfig.version} (Build: ${appConfig.buildNumber})`);

    // Validate configuration
    const appValidation = ConfigurationValidator.validateApplicationConfig(appConfig);
    console.log(`Configuration Valid: ${appValidation.valid}`);
    if (!appValidation.valid) {
      console.log(`Validation Errors: ${appValidation.errors.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Application config error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // Environment-specific configurations
  console.log('--- Environment-Specific Configurations ---');
  
  const environments = ['development', 'staging', 'production'] as const;
  
  for (const env of environments) {
    try {
      const envDbConfig = DatabaseConfigurationBuilder
        .forEnvironment(env)
        .database(`myapp_${env}`)
        .build();

      const envAppConfig = new ApplicationConfigurationBuilder()
        .environment(env)
        .version('2.1.0')
        .build();

      console.log(`${env.toUpperCase()}:`);
      console.log(`  DB: ${envDbConfig.host}:${envDbConfig.port}/${envDbConfig.database}`);
      console.log(`  App: ${envAppConfig.host}:${envAppConfig.port} (${envAppConfig.logging.level})`);
      console.log(`  Logging: ${envAppConfig.logging.destination}`);
      
    } catch (error) {
      console.error(`❌ ${env} config error:`, error instanceof Error ? error.message : String(error));
    }
  }

  console.log(`\n✅ Successfully demonstrated configuration builders with validation and environment-specific setups`);
}

// Testing Example
async function testConfigurationBuilder(): Promise<void> {
  console.log('\n=== CONFIGURATION BUILDER TESTS ===');
  
  // Test 1: Required field validation
  console.log('Test 1 - Required field validation:');
  try {
    new DatabaseConfigurationBuilder().build();
    console.log('❌ Should have thrown error for missing host');
  } catch (error) {
    console.log('✅ Correctly validates required host field');
  }

  // Test 2: Parameter validation
  console.log('\nTest 2 - Parameter validation:');
  try {
    new DatabaseConfigurationBuilder()
      .host('localhost')
      .port(-1)
      .database('test');
    console.log('❌ Should have thrown error for invalid port');
  } catch (error) {
    console.log('✅ Correctly validates port range');
  }

  // Test 3: Immutability
  console.log('\nTest 3 - Configuration immutability:');
  const config = new DatabaseConfigurationBuilder()
    .host('localhost')
    .database('test')
    .build();

  try {
    (config as any).host = 'changed';
    console.log('❌ Configuration should be immutable');
  } catch (error) {
    console.log('✅ Configuration is properly immutable');
  }

  // Test 4: Default values
  console.log('\nTest 4 - Default values:');
  const configWithDefaults = new DatabaseConfigurationBuilder()
    .host('localhost')
    .database('test')
    .build();

  console.log(`✅ Default port applied: ${configWithDefaults.port === 5432}`);
  console.log(`✅ Default pool settings applied: ${configWithDefaults.poolSettings.min === 2}`);
  console.log(`✅ Default timeout applied: ${configWithDefaults.timeout === 30000}`);

  // Test 5: Factory methods
  console.log('\nTest 5 - Factory methods:');
  const prodConfig = ApplicationConfigurationBuilder
    .forProduction()
    .version('1.0.0')
    .build();

  console.log(`✅ Production factory: ${prodConfig.environment === 'production'}`);
  console.log(`✅ Security configured: ${prodConfig.security.cors === true}`);
  console.log(`✅ Features configured: ${Object.keys(prodConfig.features).length > 0}`);

  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateConfigurationBuilder();
  await testConfigurationBuilder();
  exit(0);
})();

export {
  DatabaseConfigurationBuilder,
  ApplicationConfigurationBuilder,
  DatabaseConfiguration,
  ApplicationConfiguration,
  ConfigurationValidator
}; 