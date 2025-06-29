// ============================================================================
// CONFIGURATION MANAGER - Environment & App Settings
// ============================================================================

import { exit } from "process";

interface AppConfig {
  apiUrl: string;
  apiKey: string;
  environment: 'development' | 'production' | 'testing';
  database: {
    host: string;
    port: number;
    name: string;
  };
  features: {
    enableLogging: boolean;
    enableCache: boolean;
    maxRetries: number;
  };
}

class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: AppConfig;
  private isInitialized: boolean = false;

  private constructor() {
    // Default configuration - in real app, load from environment or config files
    this.config = {
      apiUrl: 'https://api.example.com',
      apiKey: '',
      environment: 'development',
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp'
      },
      features: {
        enableLogging: true,
        enableCache: false,
        maxRetries: 3
      }
    };
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  public loadConfig(config: Partial<AppConfig>): void {
    if (this.isInitialized) {
      console.warn('Configuration already initialized. Changes may not take effect.');
    }
    
    this.config = { ...this.config, ...config };
    this.isInitialized = true;
  }

  public getConfig(): AppConfig {
    return { ...this.config }; // Return a copy to prevent external modifications
  }

  public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  public isProduction(): boolean {
    return this.config.environment === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  public getDatabaseUrl(): string {
    const { host, port, name } = this.config.database;
    return `postgresql://${host}:${port}/${name}`;
  }

  // For testing purposes only
  public static resetInstance(): void {
    ConfigurationManager.instance = null as any;
  }
}

// Usage Example
function demonstrateConfigManager(): void {
  console.log('=== CONFIGURATION MANAGER DEMO ===');
  
  const config = ConfigurationManager.getInstance();
  
  // Load custom configuration
  config.loadConfig({
    apiKey: 'secret-key-123',
    environment: 'production',
    features: {
      enableLogging: true,
      enableCache: true,
      maxRetries: 5
    }
  });
  
  // Use configuration throughout the app
  console.log('API URL:', config.get('apiUrl'));
  console.log('Database URL:', config.getDatabaseUrl());
  console.log('Is Production?', config.isProduction());
  console.log('Cache Enabled?', config.get('features').enableCache);
  
  // Verify same instance
  const anotherConfig = ConfigurationManager.getInstance();
  console.log('Same instance?', config === anotherConfig);
  console.log();
}

// Testing Example
function testConfigManager(): void {
  console.log('=== CONFIGURATION MANAGER TESTS ===');
  
  // Test 1: Default configuration
  ConfigurationManager.resetInstance();
  const config1 = ConfigurationManager.getInstance();
  console.log('Test 1 - Default environment:', config1.get('environment'));
  
  // Test 2: Custom configuration
  ConfigurationManager.resetInstance();
  const config2 = ConfigurationManager.getInstance();
  config2.loadConfig({ environment: 'testing' });
  console.log('Test 2 - Custom environment:', config2.get('environment'));
  
  // Test 3: Singleton behavior
  const config3 = ConfigurationManager.getInstance();
  console.log('Test 3 - Same instance after reset?', config2 === config3);
  console.log();
}

// Run demonstrations
demonstrateConfigManager();
testConfigManager();

export { ConfigurationManager, AppConfig };
exit(0); 