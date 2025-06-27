import { exit } from 'process';

// Configuration State interfaces
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  connectionPool: {
    min: number;
    max: number;
    idleTimeout: number;
  };
}

interface ServerConfig {
  port: number;
  host: string;
  cors: {
    enabled: boolean;
    origins: string[];
    methods: string[];
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    file: string | null;
  };
}

interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  bcrypt: {
    rounds: number;
  };
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
  };
}

interface FeatureFlags {
  [key: string]: boolean;
}

interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  database: DatabaseConfig;
  server: ServerConfig;
  security: SecurityConfig;
  features: FeatureFlags;
  metadata: {
    lastModified: Date;
    modifiedBy: string;
    description: string;
  };
}

// Memento interface
interface Memento {
  getState(): any;
  getTimestamp(): Date;
}

// Configuration Memento
class ConfigurationMemento implements Memento {
  private state: AppConfig;
  private timestamp: Date;

  constructor(state: AppConfig) {
    // Deep copy the state to ensure immutability
    this.state = {
      name: state.name,
      version: state.version,
      environment: state.environment,
      database: {
        host: state.database.host,
        port: state.database.port,
        username: state.database.username,
        password: state.database.password,
        database: state.database.database,
        ssl: state.database.ssl,
        connectionPool: { ...state.database.connectionPool }
      },
      server: {
        port: state.server.port,
        host: state.server.host,
        cors: {
          enabled: state.server.cors.enabled,
          origins: [...state.server.cors.origins],
          methods: [...state.server.cors.methods]
        },
        rateLimit: {
          enabled: state.server.rateLimit.enabled,
          windowMs: state.server.rateLimit.windowMs,
          maxRequests: state.server.rateLimit.maxRequests
        },
        logging: {
          level: state.server.logging.level,
          format: state.server.logging.format,
          file: state.server.logging.file
        }
      },
      security: {
        jwt: {
          secret: state.security.jwt.secret,
          expiresIn: state.security.jwt.expiresIn,
          refreshExpiresIn: state.security.jwt.refreshExpiresIn
        },
        bcrypt: {
          rounds: state.security.bcrypt.rounds
        },
        cors: {
          allowedOrigins: [...state.security.cors.allowedOrigins],
          allowedMethods: [...state.security.cors.allowedMethods],
          allowedHeaders: [...state.security.cors.allowedHeaders]
        }
      },
      features: { ...state.features },
      metadata: {
        lastModified: new Date(state.metadata.lastModified),
        modifiedBy: state.metadata.modifiedBy,
        description: state.metadata.description
      }
    };
    this.timestamp = new Date();
  }

  getState(): AppConfig {
    return JSON.parse(JSON.stringify(this.state));
  }

  getTimestamp(): Date {
    return new Date(this.timestamp);
  }
}

// Configuration Manager (Originator)
class ConfigurationManager {
  private state: AppConfig;
  private configCounter: number = 0;

  constructor() {
    this.state = {
      name: 'MyApp',
      version: '1.0.0',
      environment: 'development',
      database: {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'myapp_dev',
        ssl: false,
        connectionPool: {
          min: 2,
          max: 10,
          idleTimeout: 30000
        }
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        cors: {
          enabled: true,
          origins: ['http://localhost:3000'],
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        },
        rateLimit: {
          enabled: true,
          windowMs: 900000,
          maxRequests: 100
        },
        logging: {
          level: 'info',
          format: 'json',
          file: null
        }
      },
      security: {
        jwt: {
          secret: 'your-secret-key',
          expiresIn: '1h',
          refreshExpiresIn: '7d'
        },
        bcrypt: {
          rounds: 12
        },
        cors: {
          allowedOrigins: ['http://localhost:3000'],
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization']
        }
      },
      features: {
        'user-registration': true,
        'email-verification': false,
        'two-factor-auth': false,
        'api-documentation': true,
        'monitoring': false
      },
      metadata: {
        lastModified: new Date(),
        modifiedBy: 'system',
        description: 'Initial configuration'
      }
    };
  }

  // Create memento of current state
  createMemento(): Memento {
    console.log('💾 Creating configuration snapshot...');
    return new ConfigurationMemento(this.state);
  }

  // Restore state from memento
  restore(memento: Memento): void {
    console.log('🔄 Restoring configuration...');
    this.state = memento.getState();
  }

  // Configuration operations
  updateDatabaseConfig(config: Partial<DatabaseConfig>): void {
    this.state.database = { ...this.state.database, ...config };
    this.updateMetadata('database config');
    console.log('🗄️ Database configuration updated');
  }

  updateServerConfig(config: Partial<ServerConfig>): void {
    this.state.server = { ...this.state.server, ...config };
    this.updateMetadata('server config');
    console.log('🌐 Server configuration updated');
  }

  updateSecurityConfig(config: Partial<SecurityConfig>): void {
    this.state.security = { ...this.state.security, ...config };
    this.updateMetadata('security config');
    console.log('🔒 Security configuration updated');
  }

  toggleFeature(featureName: string): void {
    if (this.state.features.hasOwnProperty(featureName)) {
      this.state.features[featureName] = !this.state.features[featureName];
      this.updateMetadata(`feature flag: ${featureName}`);
      console.log(`🚀 Feature ${featureName} ${this.state.features[featureName] ? 'enabled' : 'disabled'}`);
    } else {
      console.log(`❌ Feature ${featureName} not found`);
    }
  }

  addFeature(featureName: string, enabled: boolean = false): void {
    this.state.features[featureName] = enabled;
    this.updateMetadata(`added feature: ${featureName}`);
    console.log(`➕ Added feature ${featureName} (${enabled ? 'enabled' : 'disabled'})`);
  }

  removeFeature(featureName: string): void {
    if (this.state.features.hasOwnProperty(featureName)) {
      delete this.state.features[featureName];
      this.updateMetadata(`removed feature: ${featureName}`);
      console.log(`➖ Removed feature ${featureName}`);
    } else {
      console.log(`❌ Feature ${featureName} not found`);
    }
  }

  setEnvironment(environment: AppConfig['environment']): void {
    this.state.environment = environment;
    this.updateMetadata(`environment change to ${environment}`);
    console.log(`🌍 Environment set to ${environment}`);
  }

  updateVersion(version: string): void {
    this.state.version = version;
    this.updateMetadata(`version update to ${version}`);
    console.log(`📦 Version updated to ${version}`);
  }

  addCorsOrigin(origin: string): void {
    if (!this.state.server.cors.origins.includes(origin)) {
      this.state.server.cors.origins.push(origin);
      this.updateMetadata(`added CORS origin: ${origin}`);
      console.log(`🌐 Added CORS origin: ${origin}`);
    }
  }

  removeCorsOrigin(origin: string): void {
    const index = this.state.server.cors.origins.indexOf(origin);
    if (index > -1) {
      this.state.server.cors.origins.splice(index, 1);
      this.updateMetadata(`removed CORS origin: ${origin}`);
      console.log(`🌐 Removed CORS origin: ${origin}`);
    }
  }

  updateRateLimit(enabled: boolean, windowMs?: number, maxRequests?: number): void {
    this.state.server.rateLimit.enabled = enabled;
    if (windowMs !== undefined) this.state.server.rateLimit.windowMs = windowMs;
    if (maxRequests !== undefined) this.state.server.rateLimit.maxRequests = maxRequests;
    this.updateMetadata('rate limit config');
    console.log(`⏱️ Rate limit updated: ${enabled ? 'enabled' : 'disabled'}`);
  }

  updateLogging(level?: ServerConfig['logging']['level'], format?: ServerConfig['logging']['format'], file?: string | null): void {
    if (level !== undefined) this.state.server.logging.level = level;
    if (format !== undefined) this.state.server.logging.format = format;
    if (file !== undefined) this.state.server.logging.file = file;
    this.updateMetadata('logging config');
    console.log(`📝 Logging configuration updated`);
  }

  private updateMetadata(description: string): void {
    this.state.metadata = {
      lastModified: new Date(),
      modifiedBy: 'admin',
      description
    };
  }

  // Get current state
  getState(): AppConfig {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Display current state
  display(): void {
    console.log('\n⚙️ Current Configuration:');
    console.log(`App: ${this.state.name} v${this.state.version} (${this.state.environment})`);
    console.log(`Database: ${this.state.database.host}:${this.state.database.port}/${this.state.database.database}`);
    console.log(`Server: ${this.state.server.host}:${this.state.server.port}`);
    console.log(`Logging: ${this.state.server.logging.level} (${this.state.server.logging.format})`);
    console.log(`Rate Limit: ${this.state.server.rateLimit.enabled ? 'enabled' : 'disabled'}`);
    console.log(`CORS: ${this.state.server.cors.enabled ? 'enabled' : 'disabled'} (${this.state.server.cors.origins.length} origins)`);
    console.log(`Features: ${Object.keys(this.state.features).length} total`);
    console.log(`Last Modified: ${this.state.metadata.lastModified.toLocaleString()} by ${this.state.metadata.modifiedBy}`);
    console.log('');
  }

  // Display detailed configuration
  displayDetails(): void {
    console.log('\n📋 Configuration Details:');
    console.log('Database:');
    console.log(`  Host: ${this.state.database.host}:${this.state.database.port}`);
    console.log(`  Database: ${this.state.database.database}`);
    console.log(`  SSL: ${this.state.database.ssl}`);
    console.log(`  Pool: ${this.state.database.connectionPool.min}-${this.state.database.connectionPool.max} connections`);
    
    console.log('\nServer:');
    console.log(`  Port: ${this.state.server.port}`);
    console.log(`  CORS Origins: ${this.state.server.cors.origins.join(', ')}`);
    console.log(`  Rate Limit: ${this.state.server.rateLimit.maxRequests} requests per ${this.state.server.rateLimit.windowMs}ms`);
    
    console.log('\nSecurity:');
    console.log(`  JWT Expires: ${this.state.security.jwt.expiresIn}`);
    console.log(`  Bcrypt Rounds: ${this.state.security.bcrypt.rounds}`);
    
    console.log('\nFeatures:');
    Object.entries(this.state.features).forEach(([feature, enabled]) => {
      console.log(`  ${feature}: ${enabled ? '✅' : '❌'}`);
    });
    console.log('');
  }
}

// Caretaker - Manages configuration history
class ConfigurationCaretaker {
  private snapshots: Map<string, Memento> = new Map();
  private maxSnapshots: number;

  constructor(maxSnapshots: number = 10) {
    this.maxSnapshots = maxSnapshots;
  }

  // Save configuration snapshot
  saveSnapshot(config: ConfigurationManager, name: string): void {
    const memento = config.createMemento();
    this.snapshots.set(name, memento);
    
    // Limit snapshots
    if (this.snapshots.size > this.maxSnapshots) {
      const firstKey = this.snapshots.keys().next().value;
      if (firstKey !== undefined) {
        this.snapshots.delete(firstKey);
      }
    }
    
    console.log(`💾 Configuration snapshot saved: ${name}`);
  }

  // Load configuration snapshot
  loadSnapshot(config: ConfigurationManager, name: string): boolean {
    const memento = this.snapshots.get(name);
    if (!memento) {
      console.log(`❌ Snapshot ${name} not found`);
      return false;
    }

    config.restore(memento);
    console.log(`🔄 Configuration loaded from snapshot: ${name}`);
    return true;
  }

  // Get snapshot information
  getSnapshotInfo(): { names: string[]; count: number } {
    return {
      names: Array.from(this.snapshots.keys()),
      count: this.snapshots.size
    };
  }

  // Delete snapshot
  deleteSnapshot(name: string): boolean {
    if (this.snapshots.delete(name)) {
      console.log(`🗑️ Deleted snapshot: ${name}`);
      return true;
    }
    console.log(`❌ Snapshot ${name} not found`);
    return false;
  }

  // Export configuration to JSON
  exportSnapshot(name: string): string | null {
    const memento = this.snapshots.get(name);
    if (!memento) {
      console.log(`❌ Snapshot ${name} not found`);
      return null;
    }

    const config = memento.getState();
    return JSON.stringify(config, null, 2);
  }
}

// Demo
console.log('=== CONFIGURATION MANAGEMENT DEMO ===\n');

// Create configuration manager and caretaker
const configManager = new ConfigurationManager();
const configCaretaker = new ConfigurationCaretaker(5);

console.log('🚀 Starting configuration management...\n');

// Initial state
configManager.display();

// Perform various configuration operations
console.log('=== CONFIGURATION OPERATIONS ===');

configManager.updateDatabaseConfig({ port: 5433, ssl: true });
configManager.display();

configCaretaker.saveSnapshot(configManager, 'database-ssl');
configManager.display();

configManager.updateServerConfig({ port: 8080 });
configManager.addCorsOrigin('https://api.example.com');
configManager.display();

configCaretaker.saveSnapshot(configManager, 'server-updates');
configManager.display();

configManager.toggleFeature('email-verification');
configManager.addFeature('dark-mode', true);
configManager.updateRateLimit(true, 600000, 200);
configManager.display();

configCaretaker.saveSnapshot(configManager, 'features-rate-limit');
configManager.display();

configManager.setEnvironment('staging');
configManager.updateVersion('1.1.0');
configManager.updateLogging('debug', 'text', '/var/log/app.log');
configManager.display();

configCaretaker.saveSnapshot(configManager, 'staging-config');
configManager.display();

// Demonstrate snapshot operations
console.log('=== SNAPSHOT OPERATIONS ===');

console.log('\n🔄 Loading database-ssl snapshot...');
configCaretaker.loadSnapshot(configManager, 'database-ssl');
configManager.display();

console.log('\n🔄 Loading server-updates snapshot...');
configCaretaker.loadSnapshot(configManager, 'server-updates');
configManager.display();

console.log('\n🔄 Loading features-rate-limit snapshot...');
configCaretaker.loadSnapshot(configManager, 'features-rate-limit');
configManager.display();

// Show snapshot information
const snapshotInfo = configCaretaker.getSnapshotInfo();
console.log('\n📊 Snapshot Information:');
console.log(`Available snapshots: ${snapshotInfo.names.join(', ')}`);
console.log(`Total snapshots: ${snapshotInfo.count}`);

// Demonstrate configuration export
console.log('\n=== CONFIGURATION EXPORT ===');

const exportedConfig = configCaretaker.exportSnapshot('staging-config');
if (exportedConfig) {
  console.log('\n📄 Exported configuration (staging-config):');
  console.log(exportedConfig.substring(0, 500) + '...');
}

// Demonstrate multiple configuration changes
console.log('\n=== MULTIPLE CHANGES DEMO ===');

configManager.updateDatabaseConfig({ 
  host: 'prod-db.example.com', 
  port: 5432, 
  username: 'prod_user',
  password: 'secure_password'
});
configManager.setEnvironment('production');
configManager.updateVersion('2.0.0');
configManager.toggleFeature('monitoring');
configManager.updateSecurityConfig({
  jwt: { 
    secret: 'super-secure-production-secret',
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  }
});
configManager.display();

configCaretaker.saveSnapshot(configManager, 'production-config');
configManager.display();

console.log('\n🔄 Rolling back to staging config...');
configCaretaker.loadSnapshot(configManager, 'staging-config');
configManager.display();

// Demonstrate snapshot management
console.log('\n=== SNAPSHOT MANAGEMENT ===');

console.log('\n🗑️ Deleting database-ssl snapshot...');
configCaretaker.deleteSnapshot('database-ssl');

const updatedSnapshotInfo = configCaretaker.getSnapshotInfo();
console.log(`Updated available snapshots: ${updatedSnapshotInfo.names.join(', ')}`);

// Show detailed configuration
console.log('\n=== DETAILED CONFIGURATION VIEW ===');
configManager.displayDetails();

console.log('\n✅ Configuration management demo completed successfully');

exit(0); 