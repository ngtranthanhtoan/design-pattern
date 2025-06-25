/**
 * Factory Pattern - Factory Functions
 * 
 * Demonstrates how to implement the Factory pattern using pure functions
 * instead of traditional factory classes and inheritance hierarchies.
 */

import { exit } from "process";

// Core factory function types
type Factory<T> = (...args: any[]) => T;
type ParameterizedFactory<P, T> = (params: P) => T;

// Example 1: Simple Product Factory
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

const createBook = (name: string, price: number): Product => ({
  id: crypto.randomUUID(),
  name,
  price,
  category: 'book'
});

const createElectronics = (name: string, price: number): Product => ({
  id: crypto.randomUUID(),
  name,
  price,
  category: 'electronics'
});

const createClothing = (name: string, price: number): Product => ({
  id: crypto.randomUUID(),
  name,
  price,
  category: 'clothing'
});

// Factory function that delegates to specific factories
const productFactory = (category: string, name: string, price: number): Product => {
  const factories: Record<string, Factory<Product>> = {
    book: (n: string, p: number) => createBook(n, p),
    electronics: (n: string, p: number) => createElectronics(n, p),
    clothing: (n: string, p: number) => createClothing(n, p)
  };
  
  const factory = factories[category];
  if (!factory) {
    throw new Error(`Unknown product category: ${category}`);
  }
  
  return factory(name, price);
};

// Example 2: Configuration Factory
type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  ssl: boolean;
  maxConnections: number;
  timeout: number;
};

const createDevelopmentConfig = (): DatabaseConfig => ({
  host: 'localhost',
  port: 5432,
  database: 'dev_db',
  ssl: false,
  maxConnections: 10,
  timeout: 5000
});

const createStagingConfig = (): DatabaseConfig => ({
  host: 'staging-db.example.com',
  port: 5432,
  database: 'staging_db',
  ssl: true,
  maxConnections: 20,
  timeout: 10000
});

const createProductionConfig = (): DatabaseConfig => ({
  host: process.env.DB_HOST || 'prod-db.example.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'prod_db',
  ssl: true,
  maxConnections: 50,
  timeout: 15000
});

const databaseConfigFactory = (environment: string): DatabaseConfig => {
  const factories: Record<string, () => DatabaseConfig> = {
    development: createDevelopmentConfig,
    test: createDevelopmentConfig, // Reuse dev config for testing
    staging: createStagingConfig,
    production: createProductionConfig
  };
  
  return factories[environment]?.() || createDevelopmentConfig();
};

// Example 3: User Factory with roles
type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  createdAt: Date;
};

const createGuestUser = (name: string, email: string): User => ({
  id: crypto.randomUUID(),
  name,
  email,
  role: 'guest',
  permissions: ['read'],
  createdAt: new Date()
});

const createRegularUser = (name: string, email: string): User => ({
  id: crypto.randomUUID(),
  name,
  email,
  role: 'user',
  permissions: ['read', 'write'],
  createdAt: new Date()
});

const createAdminUser = (name: string, email: string): User => ({
  id: crypto.randomUUID(),
  name,
  email,
  role: 'admin',
  permissions: ['read', 'write', 'delete', 'admin'],
  createdAt: new Date()
});

const userFactory = (role: string, name: string, email: string): User => {
  const factories: Record<string, (name: string, email: string) => User> = {
    guest: createGuestUser,
    user: createRegularUser,
    admin: createAdminUser
  };
  
  return factories[role]?.(name, email) || createRegularUser(name, email);
};

// Example 4: Higher-order factory functions
const createEntityFactory = <T>(baseFactory: (data: any) => T) => {
  return (data: any, withTimestamp = true, withId = true): T & { id?: string; createdAt?: Date } => {
    let result: any = baseFactory(data);
    
    if (withId) {
      result.id = crypto.randomUUID();
    }
    
    if (withTimestamp) {
      result.createdAt = new Date();
    }
    
    return result;
  };
};

// Factory composition example
const withLogging = <T>(factory: Factory<T>, label: string): Factory<T> => {
  return (...args: any[]) => {
    console.log(`🏭 Creating ${label} with args:`, args);
    const result = factory(...args);
    console.log(`✅ Created ${label}:`, result);
    return result;
  };
};

const withValidation = <T>(
  factory: Factory<T>,
  validator: (item: T) => boolean,
  errorMessage: string
): Factory<T> => {
  return (...args: any[]) => {
    const result = factory(...args);
    if (!validator(result)) {
      throw new Error(errorMessage);
    }
    return result;
  };
};

// Demonstration functions
function demonstrateBasicFactories(): void {
  console.log("🏭 BASIC FACTORY FUNCTIONS");
  console.log("=" + "=".repeat(28));
  
  // Create different product types
  const products = [
    productFactory('book', 'The TypeScript Handbook', 39.99),
    productFactory('electronics', 'Wireless Headphones', 199.99),
    productFactory('clothing', 'Cotton T-Shirt', 24.99)
  ];
  
  console.log("Created products:");
  products.forEach(product => {
    console.log(`  📦 ${product.category}: ${product.name} - $${product.price}`);
  });
  
  console.log();
}

function demonstrateConfigurationFactory(): void {
  console.log("⚙️ CONFIGURATION FACTORY");
  console.log("=" + "=".repeat(26));
  
  const environments = ['development', 'staging', 'production'];
  
  environments.forEach(env => {
    const config = databaseConfigFactory(env);
    console.log(`\n🔧 ${env.toUpperCase()} Configuration:`);
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   SSL: ${config.ssl}`);
    console.log(`   Max Connections: ${config.maxConnections}`);
    console.log(`   Timeout: ${config.timeout}ms`);
  });
  
  console.log();
}

function demonstrateUserFactory(): void {
  console.log("👥 USER FACTORY");
  console.log("=" + "=".repeat(15));
  
  const users = [
    userFactory('guest', 'John Visitor', 'john@example.com'),
    userFactory('user', 'Jane Smith', 'jane@example.com'),
    userFactory('admin', 'Bob Admin', 'bob@admin.com')
  ];
  
  users.forEach(user => {
    console.log(`\n👤 ${user.role.toUpperCase()}: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Permissions: ${user.permissions.join(', ')}`);
    console.log(`   Created: ${user.createdAt.toISOString()}`);
  });
  
  console.log();
}

function demonstrateAdvancedFactories(): void {
  console.log("🚀 ADVANCED FACTORY PATTERNS");
  console.log("=" + "=".repeat(31));
  
  // Factory with logging
  const loggedProductFactory = withLogging(
    (category: string, name: string, price: number) => productFactory(category, name, price),
    'Product'
  );
  
  console.log("\n📋 Logged factory creation:");
  const loggedProduct = loggedProductFactory('electronics', 'Smart Watch', 299.99);
  
  // Factory with validation
  const validatedUserFactory = withValidation(
    (role: string, name: string, email: string) => userFactory(role, name, email),
    (user: User) => user.email.includes('@') && user.name.length > 0,
    'Invalid user data'
  );
  
  console.log("\n✅ Validated factory creation:");
  try {
    const validUser = validatedUserFactory('user', 'Valid User', 'valid@example.com');
    console.log(`Created valid user: ${validUser.name}`);
  } catch (error) {
    console.log(`Validation failed: ${error}`);
  }
  
  console.log();
}

function demonstrateFactoryComposition(): void {
  console.log("🔧 FACTORY COMPOSITION");
  console.log("=" + "=".repeat(23));
  
  // Compose multiple factory enhancements
  const enhancedFactory = withValidation(
    withLogging(
      (name: string, email: string) => createRegularUser(name, email),
      'Enhanced User'
    ),
    (user: User) => user.email.includes('@'),
    'Email validation failed'
  );
  
  console.log("Creating user with composed factory:");
  const composedUser = enhancedFactory('Composed User', 'composed@example.com');
  
  console.log();
}

function demonstrateParameterizedFactories(): void {
  console.log("📐 PARAMETERIZED FACTORIES");
  console.log("=" + "=".repeat(28));
  
  // Factory that creates other factories
  const createUserFactoryWithDefaults = (defaultRole: string, defaultPermissions: string[]) => {
    return (name: string, email: string): User => ({
      id: crypto.randomUUID(),
      name,
      email,
      role: defaultRole as any,
      permissions: defaultPermissions,
      createdAt: new Date()
    });
  };
  
  const guestUserFactory = createUserFactoryWithDefaults('guest', ['read']);
  const moderatorFactory = createUserFactoryWithDefaults('user', ['read', 'write', 'moderate']);
  
  console.log("\nParameterized factory results:");
  const guestUser = guestUserFactory('Guest User', 'guest@example.com');
  const moderator = moderatorFactory('Moderator User', 'mod@example.com');
  
  console.log(`Guest: ${guestUser.name} - Permissions: ${guestUser.permissions.join(', ')}`);
  console.log(`Moderator: ${moderator.name} - Permissions: ${moderator.permissions.join(', ')}`);
  
  console.log();
}

function showPerformanceComparison(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("=" + "=".repeat(26));
  
  const iterations = 100000;
  console.log(`Creating ${iterations} products...`);
  
  const startTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    productFactory('book', `Book ${i}`, Math.random() * 100);
  }
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  const creationsPerSecond = Math.round((iterations / duration) * 1000);
  
  console.log(`✨ Completed ${iterations} creations in ${duration}ms`);
  console.log(`📊 Performance: ~${creationsPerSecond} creations/second`);
  console.log(`🏃‍♂️ Average: ${(duration / iterations).toFixed(4)}ms per creation`);
  console.log();
  
  console.log("Key Performance Benefits:");
  console.log("• No class instantiation overhead");
  console.log("• Direct function calls");
  console.log("• Minimal memory allocation");
  console.log("• JIT optimization friendly");
  console.log();
}

function showUsageExamples(): void {
  console.log("💡 PRACTICAL USAGE EXAMPLES");
  console.log("=" + "=".repeat(30));
  
  console.log("1. Simple factory function:");
  console.log(`   const user = createUser('John', 'john@example.com');`);
  console.log();
  
  console.log("2. Factory with parameters:");
  console.log(`   const config = databaseConfigFactory('production');`);
  console.log();
  
  console.log("3. Factory composition:");
  console.log(`   const enhancedFactory = withLogging(withValidation(baseFactory));`);
  console.log();
  
  console.log("4. Parameterized factory creation:");
  console.log(`   const customFactory = createFactoryWithDefaults(defaults);`);
  console.log(`   const item = customFactory(specificData);`);
  console.log();
  
  console.log("5. Dynamic factory selection:");
  console.log(`   const factory = factories[type] || defaultFactory;`);
  console.log(`   const result = factory(data);`);
  console.log();
}

// Main execution
function main(): void {
  console.log("🎯 FACTORY PATTERN - FACTORY FUNCTIONS");
  console.log("=" + "=".repeat(40));
  console.log();
  console.log("This pattern replaces traditional factory classes with pure functions");
  console.log("that create objects based on parameters and configuration.");
  console.log();
  
  demonstrateBasicFactories();
  demonstrateConfigurationFactory();
  demonstrateUserFactory();
  demonstrateAdvancedFactories();
  demonstrateFactoryComposition();
  demonstrateParameterizedFactories();
  showPerformanceComparison();
  showUsageExamples();
  
  console.log("🚀 COMPREHENSIVE EXAMPLE");
  console.log("=" + "=".repeat(23));
  console.log("Run the HTTP client factory system:");
  console.log("npm run functional:factory:clients");
  console.log();
  console.log("Key Benefits:");
  console.log("• No class hierarchies needed");
  console.log("• Easy function composition");
  console.log("• Excellent performance");
  console.log("• Simple testing");
  console.log("• Type-safe with TypeScript");
}

// Run the demonstration
main();
exit(0); 