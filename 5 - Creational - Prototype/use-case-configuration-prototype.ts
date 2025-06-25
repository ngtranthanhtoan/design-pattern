/**
 * PROTOTYPE PATTERN - CONFIGURATION PROTOTYPE
 * ==========================================
 * 
 * This example demonstrates the Prototype pattern for configuration management.
 * Configuration creation often involves expensive operations like:
 * - Loading configuration files from disk
 * - Validating configuration schemas
 * - Establishing database connections
 * - Setting up cache systems
 * - Initializing logging frameworks
 * - Loading environment-specific settings
 * 
 * Instead of repeating these expensive operations, we create prototype configurations
 * that can be quickly cloned and customized for different environments and use cases.
 * 
 * REAL-WORLD APPLICATIONS:
 * - Application configuration management (development, staging, production)
 * - Microservices configuration systems
 * - Container orchestration configuration (Docker, Kubernetes)
 * - CI/CD pipeline configurations
 * - Feature flag management systems
 * - User preference and personalization systems
 */

import { exit } from "process";

// ============================================================================
// CONFIGURATION INTERFACES AND TYPES
// ============================================================================

interface DatabaseConfiguration {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionTimeout: number;
  maxConnections: number;
  retryAttempts: number;
  backup?: {
    enabled: boolean;
    schedule: string;
    retention: number;
  };
}

interface CacheConfiguration {
  enabled: boolean;
  type: 'redis' | 'memcached' | 'memory' | 'disk';
  host?: string;
  port?: number;
  ttl: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
  compression: boolean;
  clustering?: {
    enabled: boolean;
    nodes: string[];
  };
}

interface LoggingConfiguration {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  outputs: ('console' | 'file' | 'database' | 'external')[];
  format: 'json' | 'text' | 'structured';
  rotation?: {
    enabled: boolean;
    maxSize: string;
    maxFiles: number;
  };
  external?: {
    endpoint: string;
    apiKey: string;
    batchSize: number;
  };
}

interface SecurityConfiguration {
  encryption: {
    algorithm: string;
    keySize: number;
    enabled: boolean;
  };
  authentication: {
    method: 'jwt' | 'oauth' | 'basic' | 'apikey';
    tokenExpiry: number;
    refreshEnabled: boolean;
  };
  cors: {
    enabled: boolean;
    origins: string[];
    methods: string[];
    credentials: boolean;
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
}

interface PerformanceConfiguration {
  optimization: {
    enabled: boolean;
    level: 'basic' | 'aggressive' | 'conservative';
  };
  monitoring: {
    enabled: boolean;
    metrics: string[];
    endpoint?: string;
  };
  scaling: {
    autoScale: boolean;
    minInstances: number;
    maxInstances: number;
    targetCPU: number;
  };
}

interface FeatureFlags {
  flags: Map<string, boolean>;
  rolloutPercentage: Map<string, number>;
  environment: Map<string, any>;
}

// ============================================================================
// CONFIGURATION PROTOTYPE
// ============================================================================

/**
 * Core configuration prototype that manages application settings
 * Simulates expensive configuration loading and validation operations
 */
class ConfigurationPrototype {
  private appName: string;
  private version: string;
  private environment: string;
  private database: DatabaseConfiguration;
  private cache: CacheConfiguration;
  private logging: LoggingConfiguration;
  private security: SecurityConfiguration;
  private performance: PerformanceConfiguration;
  private features: FeatureFlags;
  private customSettings: Map<string, any>;
  protected isInitialized: boolean = false;
  protected initializationCost: number = 0;
  private validationResults: Map<string, boolean> = new Map();

  constructor() {
    this.appName = 'DefaultApp';
    this.version = '1.0.0';
    this.environment = 'development';
    
    this.database = {
      host: 'localhost',
      port: 5432,
      database: 'app_db',
      username: 'user',
      password: 'password',
      ssl: false,
      connectionTimeout: 30000,
      maxConnections: 10,
      retryAttempts: 3
    };

    this.cache = {
      enabled: true,
      type: 'memory',
      ttl: 3600,
      maxSize: 1000,
      evictionPolicy: 'lru',
      compression: false
    };

    this.logging = {
      level: 'info',
      outputs: ['console'],
      format: 'text'
    };

    this.security = {
      encryption: { algorithm: 'AES-256', keySize: 256, enabled: false },
      authentication: { method: 'jwt', tokenExpiry: 3600, refreshEnabled: true },
      cors: { enabled: true, origins: ['*'], methods: ['GET', 'POST'], credentials: false },
      rateLimit: { enabled: false, windowMs: 900000, maxRequests: 100 }
    };

    this.performance = {
      optimization: { enabled: false, level: 'basic' },
      monitoring: { enabled: false, metrics: [] },
      scaling: { autoScale: false, minInstances: 1, maxInstances: 5, targetCPU: 70 }
    };

    this.features = {
      flags: new Map(),
      rolloutPercentage: new Map(),
      environment: new Map()
    };

    this.customSettings = new Map();
  }

  /**
   * Expensive initialization process (simulated)
   * In real-world scenarios, this might involve:
   * - Loading configuration files from multiple sources
   * - Validating configuration schemas
   * - Establishing database connections for validation
   * - Setting up logging frameworks
   * - Initializing cache connections
   * - Loading environment-specific secrets
   */
  async initializeConfiguration(configPath?: string): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    console.log('⚙️ Starting expensive configuration initialization...');
    const startTime = Date.now();

    // Simulate loading configuration files
    await this.simulateConfigFileLoading(configPath || './config/app.json');
    
    // Simulate schema validation
    await this.simulateSchemaValidation();
    
    // Simulate database connection validation
    await this.simulateDatabaseValidation();
    
    // Simulate cache system initialization
    await this.simulateCacheInitialization();
    
    // Simulate logging framework setup
    await this.simulateLoggingSetup();
    
    // Simulate security configuration validation
    await this.simulateSecurityValidation();
    
    // Simulate feature flag loading
    await this.simulateFeatureFlagLoading();

    this.initializationCost = Date.now() - startTime;
    this.isInitialized = true;

    console.log(`✅ Configuration initialized in ${this.initializationCost}ms`);
    return this;
  }

  /**
   * Clone the configuration (fast operation)
   * Creates a new instance with all expensive initialization already done
   */
  clone(): ConfigurationPrototype {
    if (!this.isInitialized) {
      throw new Error('Configuration must be initialized before cloning');
    }

    console.log('📋 Cloning configuration (fast operation)...');
    const startTime = Date.now();

    const cloned = new ConfigurationPrototype();
    
    // Copy all configuration data without re-initialization
    cloned.appName = this.appName;
    cloned.version = this.version;
    cloned.environment = this.environment;
    
    cloned.database = { ...this.database, backup: this.database.backup ? { ...this.database.backup } : undefined };
    cloned.cache = { ...this.cache, clustering: this.cache.clustering ? { ...this.cache.clustering } : undefined };
    cloned.logging = { ...this.logging, rotation: this.logging.rotation ? { ...this.logging.rotation } : undefined, external: this.logging.external ? { ...this.logging.external } : undefined };
    cloned.security = {
      encryption: { ...this.security.encryption },
      authentication: { ...this.security.authentication },
      cors: { ...this.security.cors, origins: [...this.security.cors.origins], methods: [...this.security.cors.methods] },
      rateLimit: { ...this.security.rateLimit }
    };
    cloned.performance = {
      optimization: { ...this.performance.optimization },
      monitoring: { ...this.performance.monitoring, metrics: [...this.performance.monitoring.metrics] },
      scaling: { ...this.performance.scaling }
    };
    
    cloned.features = {
      flags: new Map(this.features.flags),
      rolloutPercentage: new Map(this.features.rolloutPercentage),
      environment: new Map(this.features.environment)
    };
    
    cloned.customSettings = new Map(this.customSettings);
    cloned.validationResults = new Map(this.validationResults);
    cloned.isInitialized = true;
    cloned.initializationCost = this.initializationCost;

    const cloneTime = Date.now() - startTime;
    console.log(`✅ Configuration cloned in ${cloneTime}ms (${Math.round((this.initializationCost / cloneTime) * 100) / 100}x faster than initialization)`);

    return cloned;
  }

  /**
   * Deep clone with full independence
   */
  deepClone(): ConfigurationPrototype {
    console.log('🔄 Deep cloning configuration...');
    const serialized = JSON.stringify({
      appName: this.appName,
      version: this.version,
      environment: this.environment,
      database: this.database,
      cache: this.cache,
      logging: this.logging,
      security: this.security,
      performance: this.performance,
      features: {
        flags: Array.from(this.features.flags.entries()),
        rolloutPercentage: Array.from(this.features.rolloutPercentage.entries()),
        environment: Array.from(this.features.environment.entries())
      },
      customSettings: Array.from(this.customSettings.entries()),
      validationResults: Array.from(this.validationResults.entries()),
      isInitialized: this.isInitialized,
      initializationCost: this.initializationCost
    });

    const parsed = JSON.parse(serialized);
    const cloned = new ConfigurationPrototype();
    
    Object.assign(cloned, parsed);
    cloned.features = {
      flags: new Map(parsed.features.flags),
      rolloutPercentage: new Map(parsed.features.rolloutPercentage),
      environment: new Map(parsed.features.environment)
    };
    cloned.customSettings = new Map(parsed.customSettings);
    cloned.validationResults = new Map(parsed.validationResults);
    
    return cloned;
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  setAppInfo(name: string, version: string): this {
    this.appName = name;
    this.version = version;
    return this;
  }

  setEnvironment(environment: string): this {
    this.environment = environment;
    return this;
  }

  setDatabase(config: Partial<DatabaseConfiguration>): this {
    Object.assign(this.database, config);
    return this;
  }

  setCache(config: Partial<CacheConfiguration>): this {
    Object.assign(this.cache, config);
    return this;
  }

  setLogging(config: Partial<LoggingConfiguration>): this {
    Object.assign(this.logging, config);
    return this;
  }

  setSecurity(config: Partial<SecurityConfiguration>): this {
    if (config.encryption) Object.assign(this.security.encryption, config.encryption);
    if (config.authentication) Object.assign(this.security.authentication, config.authentication);
    if (config.cors) Object.assign(this.security.cors, config.cors);
    if (config.rateLimit) Object.assign(this.security.rateLimit, config.rateLimit);
    return this;
  }

  setPerformance(config: Partial<PerformanceConfiguration>): this {
    if (config.optimization) Object.assign(this.performance.optimization, config.optimization);
    if (config.monitoring) Object.assign(this.performance.monitoring, config.monitoring);
    if (config.scaling) Object.assign(this.performance.scaling, config.scaling);
    return this;
  }

  enableFeature(name: string, percentage: number = 100): this {
    this.features.flags.set(name, true);
    this.features.rolloutPercentage.set(name, percentage);
    return this;
  }

  disableFeature(name: string): this {
    this.features.flags.set(name, false);
    this.features.rolloutPercentage.delete(name);
    return this;
  }

  setCustomSetting(key: string, value: any): this {
    this.customSettings.set(key, value);
    return this;
  }

  // ============================================================================
  // ENVIRONMENT-SPECIFIC FACTORY METHODS
  // ============================================================================

  /**
   * Create development environment configuration
   */
  toDevelopmentConfig(): this {
    this.environment = 'development';
    
    this.setDatabase({
      host: 'localhost',
      port: 5432,
      ssl: false,
      maxConnections: 5
    });
    
    this.setCache({
      type: 'memory',
      maxSize: 100
    });
    
    this.setLogging({
      level: 'debug',
      outputs: ['console'],
      format: 'text'
    });
    
    this.setSecurity({
      encryption: { ...this.security.encryption, enabled: false },
      cors: { ...this.security.cors, origins: ['http://localhost:3000'] },
      rateLimit: { ...this.security.rateLimit, enabled: false }
    });
    
    this.enableFeature('debug_mode');
    this.enableFeature('hot_reload');
    this.disableFeature('analytics');
    
    return this;
  }

  /**
   * Create production environment configuration
   */
  toProductionConfig(): this {
    this.environment = 'production';
    
    this.setDatabase({
      ssl: true,
      maxConnections: 50,
      backup: {
        enabled: true,
        schedule: '0 2 * * *',
        retention: 30
      }
    });
    
    this.setCache({
      type: 'redis',
      host: 'redis-cluster.prod.com',
      port: 6379,
      ttl: 7200,
      maxSize: 10000,
      compression: true,
      clustering: {
        enabled: true,
        nodes: ['redis1.prod.com:6379', 'redis2.prod.com:6379']
      }
    });
    
    this.setLogging({
      level: 'error',
      outputs: ['file', 'external'],
      format: 'json',
      rotation: {
        enabled: true,
        maxSize: '100MB',
        maxFiles: 10
      },
      external: {
        endpoint: 'https://logs.company.com/api/v1/logs',
        apiKey: 'prod-api-key',
        batchSize: 100
      }
    });
    
    this.setSecurity({
      encryption: { ...this.security.encryption, enabled: true },
      authentication: { ...this.security.authentication, tokenExpiry: 1800 },
      cors: { ...this.security.cors, origins: ['https://app.company.com'] },
      rateLimit: { ...this.security.rateLimit, enabled: true, maxRequests: 1000 }
    });
    
    this.setPerformance({
      optimization: { enabled: true, level: 'aggressive' },
      monitoring: { enabled: true, metrics: ['cpu', 'memory', 'requests', 'errors'] },
      scaling: { autoScale: true, minInstances: 3, maxInstances: 20, targetCPU: 70 }
    });
    
    this.enableFeature('analytics');
    this.enableFeature('monitoring');
    this.disableFeature('debug_mode');
    
    return this;
  }

  /**
   * Create testing environment configuration
   */
  toTestingConfig(): this {
    this.environment = 'testing';
    
    this.setDatabase({
      database: 'test_db',
      maxConnections: 3
    });
    
    this.setCache({
      type: 'memory',
      maxSize: 50
    });
    
    this.setLogging({
      level: 'warn',
      outputs: ['console']
    });
    
    this.setSecurity({
      authentication: { ...this.security.authentication, tokenExpiry: 300 },
      rateLimit: { ...this.security.rateLimit, enabled: false }
    });
    
    this.enableFeature('test_mode');
    this.enableFeature('mock_external_services');
    
    return this;
  }

  // ============================================================================
  // VALIDATION AND UTILITY METHODS
  // ============================================================================

  async validate(): Promise<boolean> {
    console.log('🔍 Validating configuration...');
    
    const validations = [
      this.validateDatabase(),
      this.validateCache(),
      this.validateLogging(),
      this.validateSecurity(),
      this.validateFeatures()
    ];

    const results = await Promise.all(validations);
    const isValid = results.every(result => result);

    console.log(`${isValid ? '✅' : '❌'} Configuration validation ${isValid ? 'passed' : 'failed'}`);
    return isValid;
  }

  private async validateDatabase(): Promise<boolean> {
    const isValid = !!(this.database.host && this.database.port && this.database.database);
    this.validationResults.set('database', isValid);
    return isValid;
  }

  private async validateCache(): Promise<boolean> {
    const isValid = this.cache.maxSize > 0 && this.cache.ttl > 0;
    this.validationResults.set('cache', isValid);
    return isValid;
  }

  private async validateLogging(): Promise<boolean> {
    const isValid = this.logging.outputs.length > 0;
    this.validationResults.set('logging', isValid);
    return isValid;
  }

  private async validateSecurity(): Promise<boolean> {
    const isValid = this.security.cors.origins.length > 0;
    this.validationResults.set('security', isValid);
    return isValid;
  }

  private async validateFeatures(): Promise<boolean> {
    this.validationResults.set('features', true);
    return true;
  }

  getConfiguration(): any {
    return {
      app: {
        name: this.appName,
        version: this.version,
        environment: this.environment
      },
      database: this.database,
      cache: this.cache,
      logging: this.logging,
      security: this.security,
      performance: this.performance,
      features: {
        flags: Object.fromEntries(this.features.flags),
        rolloutPercentage: Object.fromEntries(this.features.rolloutPercentage),
        environment: Object.fromEntries(this.features.environment)
      },
      custom: Object.fromEntries(this.customSettings)
    };
  }

  export(format: 'json' | 'yaml' | 'env' = 'json'): string {
    const config = this.getConfiguration();
    
    switch (format) {
      case 'json':
        return JSON.stringify(config, null, 2);
      case 'yaml':
        return this.toYAML(config);
      case 'env':
        return this.toEnvironmentVariables(config);
      default:
        return JSON.stringify(config);
    }
  }

  private toYAML(obj: any, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${this.toYAML(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          yaml += `${spaces}  - ${item}\n`;
        });
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  }

  private toEnvironmentVariables(obj: any, prefix: string = ''): string {
    let env = '';
    
    for (const [key, value] of Object.entries(obj)) {
      const envKey = prefix ? `${prefix}_${key.toUpperCase()}` : key.toUpperCase();
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        env += this.toEnvironmentVariables(value, envKey);
      } else if (Array.isArray(value)) {
        env += `${envKey}=${value.join(',')}\n`;
      } else {
        env += `${envKey}=${value}\n`;
      }
    }
    
    return env;
  }

  // ============================================================================
  // SIMULATION METHODS (EXPENSIVE OPERATIONS)
  // ============================================================================

  private async simulateConfigFileLoading(path: string): Promise<void> {
    console.log(`  📁 Loading configuration from: ${path}`);
    await new Promise(resolve => setTimeout(resolve, 120 + Math.random() * 180));
  }

  private async simulateSchemaValidation(): Promise<void> {
    console.log('  📝 Validating configuration schema');
    await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120));
  }

  private async simulateDatabaseValidation(): Promise<void> {
    console.log('  🗄️ Validating database connection');
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  }

  private async simulateCacheInitialization(): Promise<void> {
    console.log('  💾 Initializing cache system');
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
  }

  private async simulateLoggingSetup(): Promise<void> {
    console.log('  📊 Setting up logging framework');
    await new Promise(resolve => setTimeout(resolve, 90 + Math.random() * 130));
  }

  private async simulateSecurityValidation(): Promise<void> {
    console.log('  🔒 Validating security configuration');
    await new Promise(resolve => setTimeout(resolve, 110 + Math.random() * 140));
  }

  private async simulateFeatureFlagLoading(): Promise<void> {
    console.log('  🚩 Loading feature flags');
    await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 90));
  }

  toString(): string {
    return `Configuration(${this.environment}): ${this.appName} v${this.version} - ${this.features.flags.size} features`;
  }
}

// ============================================================================
// CONFIGURATION REGISTRY
// ============================================================================

/**
 * Registry system for managing configuration prototypes
 */
class ConfigurationRegistry {
  private configurations = new Map<string, ConfigurationPrototype>();
  private environments = new Map<string, string[]>();
  private usage = new Map<string, number>();

  async registerConfiguration(name: string, config: ConfigurationPrototype, environments: string[] = []): Promise<void> {
    try {
      await config.validate();
    } catch {
      await config.initializeConfiguration();
    }
    
    this.configurations.set(name, config);
    this.environments.set(name, environments);
    this.usage.set(name, 0);
    
    console.log(`📋 Registered configuration: ${name} for environments: [${environments.join(', ')}]`);
  }

  createConfiguration(name: string, environment?: string): ConfigurationPrototype | null {
    const config = this.configurations.get(name);
    if (!config) {
      console.log(`❌ Configuration not found: ${name}`);
      return null;
    }

    const current = this.usage.get(name) || 0;
    this.usage.set(name, current + 1);

    const cloned = config.clone();
    
    if (environment) {
      switch (environment) {
        case 'development':
          cloned.toDevelopmentConfig();
          break;
        case 'production':
          cloned.toProductionConfig();
          break;
        case 'testing':
          cloned.toTestingConfig();
          break;
      }
    }

    return cloned;
  }

  listConfigurations(): Array<{ name: string; environments: string[] }> {
    return Array.from(this.configurations.keys()).map(name => ({
      name,
      environments: this.environments.get(name) || []
    }));
  }

  getUsageStats(): Map<string, number> {
    return new Map(this.usage);
  }
}

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

/**
 * Demonstrate basic configuration prototyping
 */
async function demonstrateBasicConfigurationPrototyping(): Promise<void> {
  console.log('\n⚙️ BASIC CONFIGURATION PROTOTYPING');
  console.log('==================================');

  // Create and initialize base configuration
  const baseConfig = new ConfigurationPrototype();
  await baseConfig.initializeConfiguration('./config/base.json');

  baseConfig
    .setAppInfo('ECommerceApp', '2.1.0')
    .setDatabase({
      database: 'ecommerce_db',
      username: 'app_user'
    })
    .enableFeature('product_recommendations')
    .enableFeature('user_analytics')
    .setCustomSetting('theme', 'modern')
    .setCustomSetting('locale', 'en-US');

  console.log('🔧 Base configuration:', baseConfig.toString());

  // Clone for different environments
  const devConfig = baseConfig.clone().toDevelopmentConfig();
  const prodConfig = baseConfig.clone().toProductionConfig();
  const testConfig = baseConfig.clone().toTestingConfig();

  console.log('🛠️ Development config:', devConfig.toString());
  console.log('🚀 Production config:', prodConfig.toString());
  console.log('🧪 Testing config:', testConfig.toString());

  // Validate configurations
  console.log('\n🔍 Configuration Validation:');
  await devConfig.validate();
  await prodConfig.validate();
  await testConfig.validate();
}

/**
 * Demonstrate environment-specific configurations
 */
async function demonstrateEnvironmentConfigurations(): Promise<void> {
  console.log('\n🌍 ENVIRONMENT-SPECIFIC CONFIGURATIONS');
  console.log('======================================');

  const baseConfig = new ConfigurationPrototype();
  await baseConfig.initializeConfiguration();
  baseConfig.setAppInfo('MicroserviceAPI', '1.0.0');

  // Development environment
  const devConfig = baseConfig.clone().toDevelopmentConfig();
  devConfig.setCustomSetting('mockExternalServices', true);
  devConfig.setCustomSetting('debugLevel', 'verbose');

  console.log('🛠️ Development Configuration:');
  console.log(devConfig.export('json').substring(0, 300) + '...');

  // Production environment
  const prodConfig = baseConfig.clone().toProductionConfig();
  prodConfig.setCustomSetting('metricsCollection', true);
  prodConfig.setCustomSetting('alerting', {
    slack: 'https://hooks.slack.com/...',
    email: 'alerts@company.com'
  });

  console.log('\n🚀 Production Configuration:');
  console.log(prodConfig.export('yaml').substring(0, 300) + '...');

  // Testing environment
  const testConfig = baseConfig.clone().toTestingConfig();
  testConfig.setCustomSetting('testDataReset', true);
  testConfig.setCustomSetting('coverageReporting', true);

  console.log('\n🧪 Testing Configuration:');
  console.log(testConfig.export('env').substring(0, 300) + '...');
}

/**
 * Demonstrate configuration registry
 */
async function demonstrateConfigurationRegistry(): Promise<void> {
  console.log('\n📋 CONFIGURATION REGISTRY');
  console.log('=========================');

  const registry = new ConfigurationRegistry();

  // Create different configuration prototypes
  const webAppConfig = new ConfigurationPrototype();
  await webAppConfig.initializeConfiguration();
  webAppConfig
    .setAppInfo('WebApp', '3.0.0')
    .enableFeature('real_time_updates')
    .enableFeature('offline_mode');

  const apiConfig = new ConfigurationPrototype();
  await apiConfig.initializeConfiguration();
  apiConfig
    .setAppInfo('API', '2.5.0')
    .enableFeature('rate_limiting')
    .enableFeature('request_caching');

  const workerConfig = new ConfigurationPrototype();
  await workerConfig.initializeConfiguration();
  workerConfig
    .setAppInfo('BackgroundWorker', '1.2.0')
    .enableFeature('job_queuing')
    .enableFeature('retry_logic');

  // Register configurations
  await registry.registerConfiguration('webapp', webAppConfig, ['development', 'production']);
  await registry.registerConfiguration('api', apiConfig, ['development', 'staging', 'production']);
  await registry.registerConfiguration('worker', workerConfig, ['production']);

  console.log('📋 Available configurations:', registry.listConfigurations());

  // Create specific environment configurations
  const webappDev = registry.createConfiguration('webapp', 'development');
  const apiProd = registry.createConfiguration('api', 'production');
  const workerProd = registry.createConfiguration('worker', 'production');

  if (webappDev && apiProd && workerProd) {
    console.log('✅ Created configurations from registry');
    
    console.log('\n📊 Usage Statistics:');
    const stats = registry.getUsageStats();
    stats.forEach((count, name) => {
      console.log(`  ${name}: ${count} configurations created`);
    });
  }
}

/**
 * Demonstrate performance comparison
 */
async function demonstratePerformanceComparison(): Promise<void> {
  console.log('\n⚡ PERFORMANCE COMPARISON');
  console.log('========================');

  const iterations = 50;
  console.log(`🔧 Testing with ${iterations} configuration creations...`);

  // Create prototype once
  const prototype = new ConfigurationPrototype();
  await prototype.initializeConfiguration();
  prototype
    .setAppInfo('PerformanceTest', '1.0.0')
    .enableFeature('feature1')
    .enableFeature('feature2')
    .enableFeature('feature3')
    .setCustomSetting('setting1', 'value1')
    .setCustomSetting('setting2', { nested: 'value2' });

  // Test prototype cloning
  console.time('⚡ Prototype Cloning');
  const cloned = [];
  for (let i = 0; i < iterations; i++) {
    const config = prototype.clone();
    config.setEnvironment(`env_${i % 3}`);
    cloned.push(config);
  }
  console.timeEnd('⚡ Prototype Cloning');

  // Test traditional creation
  console.time('🏗️ Traditional Creation');
  const created = [];
  for (let i = 0; i < iterations; i++) {
    const config = new ConfigurationPrototype();
    await config.initializeConfiguration(); // Expensive operation each time
    config
      .setAppInfo('PerformanceTest', '1.0.0')
      .setEnvironment(`env_${i % 3}`)
      .enableFeature('feature1')
      .enableFeature('feature2')
      .enableFeature('feature3')
      .setCustomSetting('setting1', 'value1')
      .setCustomSetting('setting2', { nested: 'value2' });
    created.push(config);
  }
  console.timeEnd('🏗️ Traditional Creation');

  console.log(`⚙️ Created ${cloned.length} cloned configs and ${created.length} traditional configs`);
  console.log('📈 Prototype cloning provides significant performance improvement!');
}

/**
 * Main demonstration function
 */
async function demonstrateConfigurationPrototype(): Promise<void> {
  console.log('🎯 CONFIGURATION PROTOTYPE PATTERN');
  console.log('==================================');
  console.log('Managing application configurations by cloning pre-initialized prototypes');
  console.log('instead of repeating expensive setup and validation operations.\n');

  await demonstrateBasicConfigurationPrototyping();
  await demonstrateEnvironmentConfigurations();
  await demonstrateConfigurationRegistry();
  await demonstratePerformanceComparison();

  console.log('\n✅ CONFIGURATION PROTOTYPE BENEFITS:');
  console.log('- Fast configuration creation through cloning vs. initialization');
  console.log('- Consistent configuration validation and setup');
  console.log('- Environment-specific configuration management');
  console.log('- Centralized configuration registry system');
  console.log('- Feature flag and custom setting management');
  console.log('- Multiple export formats (JSON, YAML, ENV)');

  console.log('\n🏭 REAL-WORLD APPLICATIONS:');
  console.log('- Microservices configuration management');
  console.log('- Container orchestration (Docker, Kubernetes)');
  console.log('- CI/CD pipeline configuration systems');
  console.log('- Feature flag management platforms');
  console.log('- User preference and personalization systems');
  console.log('- Multi-tenant application configuration');
}

// ============================================================================
// EXECUTION
// ============================================================================

if (require.main === module) {
  demonstrateConfigurationPrototype().catch(console.error);
}

export {
  ConfigurationPrototype,
  ConfigurationRegistry,
  demonstrateConfigurationPrototype
};

exit(0); 