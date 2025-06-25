/**
 * PROTOTYPE PATTERN - COMPREHENSIVE OVERVIEW
 * ========================================
 * 
 * The Prototype pattern allows objects to be created by cloning existing instances (prototypes)
 * rather than creating new objects from scratch. This pattern is particularly useful when:
 * 
 * - Object creation is expensive (loading files, database queries, complex calculations)
 * - Object types are determined at runtime
 * - You need to avoid complex class hierarchies for object creation
 * - You want to configure objects by cloning and modifying templates
 * 
 * PATTERN STRUCTURE:
 * ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
 * │    Prototype    │◄───│ ConcretePrototype│◄───│     Client      │
 * │   Interface     │    │                 │    │                 │
 * │  + clone()      │    │  + clone()      │    │ - prototype     │
 * └─────────────────┘    │  + data         │    │ + operation()   │
 *                        └─────────────────┘    └─────────────────┘
 * 
 * KEY BENEFITS:
 * - Flexible object creation without knowing exact classes
 * - Reduced object creation cost through cloning
 * - Dynamic product configuration at runtime
 * - Avoids complex class hierarchies
 * - Supports template-based object creation
 * 
 * IMPLEMENTATION APPROACHES:
 * 1. Registry-Based: Centralized prototype management
 * 2. Hierarchical: Parent-child prototype relationships  
 * 3. Parameterized: Clone with custom parameters
 * 4. Deep vs Shallow: Different cloning strategies
 */

import { exit } from "process";

// ============================================================================
// CORE PROTOTYPE INTERFACES
// ============================================================================

/**
 * Base Prototype interface defining the cloning contract
 * All prototypes must implement clone() method
 */
interface Prototype<T> {
  clone(): T;
  deepClone?(): T;
}

/**
 * Enhanced prototype interface with metadata and validation
 */
interface AdvancedPrototype<T> extends Prototype<T> {
  validate(): boolean;
  getMetadata(): PrototypeMetadata;
  customize(params: any): T;
}

interface PrototypeMetadata {
  type: string;
  version: string;
  created: Date;
  cloneCount: number;
}

// ============================================================================
// PROTOTYPE REGISTRY SYSTEM
// ============================================================================

/**
 * Type-safe prototype registry for managing prototype instances
 * Provides centralized prototype management with runtime registration
 */
class PrototypeRegistry<T extends Prototype<T>> {
  private prototypes = new Map<string, T>();
  private metadata = new Map<string, PrototypeMetadata>();

  /**
   * Register a prototype with a unique name
   */
  register(name: string, prototype: T, metadata?: Partial<PrototypeMetadata>): void {
    this.prototypes.set(name, prototype);
    this.metadata.set(name, {
      type: name,
      version: '1.0.0',
      created: new Date(),
      cloneCount: 0,
      ...metadata
    });
    console.log(`✅ Registered prototype: ${name}`);
  }

  /**
   * Create object by cloning registered prototype
   */
  create(name: string): T | null {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      console.log(`❌ Prototype not found: ${name}`);
      return null;
    }

    // Update clone count
    const meta = this.metadata.get(name);
    if (meta) {
      meta.cloneCount++;
    }

    const cloned = prototype.clone();
    console.log(`📋 Cloned prototype: ${name} (clone #${meta?.cloneCount})`);
    return cloned;
  }

  /**
   * List all registered prototypes
   */
  list(): string[] {
    return Array.from(this.prototypes.keys());
  }

  /**
   * Get prototype metadata
   */
  getMetadata(name: string): PrototypeMetadata | undefined {
    return this.metadata.get(name);
  }

  /**
   * Remove prototype from registry
   */
  unregister(name: string): boolean {
    const success = this.prototypes.delete(name) && this.metadata.delete(name);
    if (success) {
      console.log(`🗑️ Unregistered prototype: ${name}`);
    }
    return success;
  }
}

// ============================================================================
// EXAMPLE 1: SIMPLE DOCUMENT PROTOTYPE
// ============================================================================

interface DocumentData {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  tags: string[];
  metadata: Record<string, any>;
}

/**
 * Simple document prototype demonstrating basic cloning
 */
class DocumentPrototype implements Prototype<DocumentPrototype> {
  private data: DocumentData;

  constructor(data: Partial<DocumentData> = {}) {
    this.data = {
      title: 'Untitled Document',
      content: '',
      author: 'Unknown',
      createdAt: new Date(),
      tags: [],
      metadata: {},
      ...data
    };
  }

  clone(): DocumentPrototype {
    // Shallow clone with new date and array references
    return new DocumentPrototype({
      ...this.data,
      createdAt: new Date(),
      tags: [...this.data.tags],
      metadata: { ...this.data.metadata }
    });
  }

  setTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  setContent(content: string): this {
    this.data.content = content;
    return this;
  }

  setAuthor(author: string): this {
    this.data.author = author;
    return this;
  }

  addTag(tag: string): this {
    if (!this.data.tags.includes(tag)) {
      this.data.tags.push(tag);
    }
    return this;
  }

  setMetadata(key: string, value: any): this {
    this.data.metadata[key] = value;
    return this;
  }

  getData(): Readonly<DocumentData> {
    return Object.freeze({ ...this.data });
  }

  toString(): string {
    return `Document: "${this.data.title}" by ${this.data.author} (${this.data.tags.length} tags)`;
  }
}

// ============================================================================
// EXAMPLE 2: CONFIGURATION PROTOTYPE WITH DEEP CLONING
// ============================================================================

interface ConfigurationData {
  appName: string;
  version: string;
  environment: string;
  database: {
    host: string;
    port: number;
    name: string;
    ssl: boolean;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  logging: {
    level: string;
    output: string[];
    format: string;
  };
  features: Map<string, boolean>;
}

/**
 * Configuration prototype with deep cloning support
 * Demonstrates complex object cloning with nested structures
 */
class ConfigurationPrototype implements AdvancedPrototype<ConfigurationPrototype> {
  private data: ConfigurationData;
  private metadata: PrototypeMetadata;

  constructor(data: Partial<ConfigurationData> = {}) {
    this.data = {
      appName: 'MyApp',
      version: '1.0.0',
      environment: 'development',
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp_db',
        ssl: false
      },
      cache: {
        enabled: true,
        ttl: 3600,
        maxSize: 1000
      },
      logging: {
        level: 'info',
        output: ['console'],
        format: 'json'
      },
      features: new Map(),
      ...data
    };

    this.metadata = {
      type: 'configuration',
      version: '1.0.0',
      created: new Date(),
      cloneCount: 0
    };
  }

  clone(): ConfigurationPrototype {
    // Shallow clone for performance
    const cloned = new ConfigurationPrototype();
    cloned.data = {
      ...this.data,
      database: { ...this.data.database },
      cache: { ...this.data.cache },
      logging: { ...this.data.logging, output: [...this.data.logging.output] },
      features: new Map(this.data.features)
    };
    cloned.metadata = { ...this.metadata, cloneCount: 0 };
    return cloned;
  }

  deepClone(): ConfigurationPrototype {
    // Deep clone using JSON serialization (limited but simple)
    const serialized = JSON.stringify({
      ...this.data,
      features: Array.from(this.data.features.entries())
    });
    const parsed = JSON.parse(serialized);
    
    const cloned = new ConfigurationPrototype(parsed);
    cloned.data.features = new Map(parsed.features);
    return cloned;
  }

  customize(params: Partial<ConfigurationData>): ConfigurationPrototype {
    const cloned = this.clone();
    Object.assign(cloned.data, params);
    return cloned;
  }

  validate(): boolean {
    return !!(this.data.appName && this.data.version && this.data.environment);
  }

  getMetadata(): PrototypeMetadata {
    return { ...this.metadata };
  }

  setEnvironment(env: string): this {
    this.data.environment = env;
    return this;
  }

  setDatabase(config: Partial<ConfigurationData['database']>): this {
    Object.assign(this.data.database, config);
    return this;
  }

  enableFeature(name: string): this {
    this.data.features.set(name, true);
    return this;
  }

  disableFeature(name: string): this {
    this.data.features.set(name, false);
    return this;
  }

  toString(): string {
    return `Config: ${this.data.appName} v${this.data.version} (${this.data.environment})`;
  }
}

// ============================================================================
// EXAMPLE 3: PARAMETERIZED GAME CHARACTER PROTOTYPE
// ============================================================================

interface CharacterStats {
  health: number;
  mana: number;
  strength: number;
  defense: number;
  speed: number;
}

interface CharacterData {
  name: string;
  class: string;
  level: number;
  position: { x: number; y: number };
  stats: CharacterStats;
  equipment: string[];
  abilities: string[];
  experience: number;
}

interface CharacterCustomization {
  name?: string;
  level?: number;
  position?: { x: number; y: number };
  statModifiers?: Partial<CharacterStats>;
  equipment?: string[];
  abilities?: string[];
}

/**
 * Game character prototype with parameterized cloning
 * Demonstrates runtime customization during cloning
 */
class CharacterPrototype implements Prototype<CharacterPrototype> {
  private data: CharacterData;

  constructor(data: Partial<CharacterData> = {}) {
    this.data = {
      name: 'Unnamed Character',
      class: 'warrior',
      level: 1,
      position: { x: 0, y: 0 },
      stats: {
        health: 100,
        mana: 50,
        strength: 10,
        defense: 8,
        speed: 5
      },
      equipment: [],
      abilities: [],
      experience: 0,
      ...data
    };
  }

  clone(): CharacterPrototype {
    return new CharacterPrototype({
      ...this.data,
      position: { ...this.data.position },
      stats: { ...this.data.stats },
      equipment: [...this.data.equipment],
      abilities: [...this.data.abilities]
    });
  }

  /**
   * Clone with customization parameters
   */
  cloneWithCustomization(customization: CharacterCustomization): CharacterPrototype {
    const cloned = this.clone();
    
    if (customization.name) cloned.data.name = customization.name;
    if (customization.level) cloned.data.level = customization.level;
    if (customization.position) cloned.data.position = { ...customization.position };
    if (customization.equipment) cloned.data.equipment = [...customization.equipment];
    if (customization.abilities) cloned.data.abilities = [...customization.abilities];
    
    if (customization.statModifiers) {
      Object.assign(cloned.data.stats, customization.statModifiers);
    }

    return cloned;
  }

  scaleForLevel(level: number): this {
    const baseLevel = this.data.level;
    const multiplier = level / baseLevel;
    
    this.data.level = level;
    this.data.stats.health = Math.round(this.data.stats.health * multiplier);
    this.data.stats.mana = Math.round(this.data.stats.mana * multiplier);
    this.data.stats.strength = Math.round(this.data.stats.strength * multiplier);
    this.data.stats.defense = Math.round(this.data.stats.defense * multiplier);
    
    return this;
  }

  getData(): Readonly<CharacterData> {
    return Object.freeze({
      ...this.data,
      position: { ...this.data.position },
      stats: { ...this.data.stats },
      equipment: [...this.data.equipment],
      abilities: [...this.data.abilities]
    });
  }

  toString(): string {
    return `${this.data.name} (Level ${this.data.level} ${this.data.class}) - HP: ${this.data.stats.health}`;
  }
}

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

/**
 * Demonstrate basic prototype cloning
 */
function demonstrateBasicPrototyping(): void {
  console.log('\n🔄 BASIC PROTOTYPING DEMONSTRATION');
  console.log('=====================================');

  // Create original document prototype
  const originalDoc = new DocumentPrototype({
    title: 'Company Report Template',
    author: 'Template Creator',
    content: 'This is a template for company reports...',
  })
    .addTag('template')
    .addTag('official')
    .setMetadata('category', 'business');

  console.log('📄 Original:', originalDoc.toString());

  // Clone and customize for specific use
  const monthlyReport = originalDoc.clone()
    .setTitle('Monthly Sales Report - June 2024')
    .setAuthor('Sales Manager')
    .setContent('June sales performance exceeded expectations...')
    .addTag('sales')
    .addTag('monthly');

  const quarterlyReport = originalDoc.clone()
    .setTitle('Q2 Financial Report')
    .setAuthor('Finance Director')
    .setContent('Q2 financial results show strong growth...')
    .addTag('finance')
    .addTag('quarterly');

  console.log('📈 Monthly Report:', monthlyReport.toString());
  console.log('💰 Quarterly Report:', quarterlyReport.toString());

  // Verify independence
  originalDoc.addTag('original');
  console.log('\n🔍 After modifying original:');
  console.log('📄 Original tags:', originalDoc.getData().tags);
  console.log('📈 Monthly tags:', monthlyReport.getData().tags);
  console.log('💰 Quarterly tags:', quarterlyReport.getData().tags);
}

/**
 * Demonstrate prototype registry system
 */
function demonstratePrototypeRegistry(): void {
  console.log('\n📋 PROTOTYPE REGISTRY DEMONSTRATION');
  console.log('===================================');

  const registry = new PrototypeRegistry<ConfigurationPrototype>();

  // Create and register base configurations
  const baseConfig = new ConfigurationPrototype({
    appName: 'ECommerceApp',
    version: '2.0.0'
  });

  const developmentConfig = baseConfig.clone()
    .setEnvironment('development')
    .setDatabase({ host: 'localhost', port: 5432 })
    .enableFeature('debug_mode')
    .enableFeature('hot_reload');

  const productionConfig = baseConfig.clone()
    .setEnvironment('production')
    .setDatabase({ host: 'prod-db.company.com', port: 5432, ssl: true })
    .enableFeature('analytics')
    .disableFeature('debug_mode');

  // Register prototypes
  registry.register('base', baseConfig);
  registry.register('development', developmentConfig);
  registry.register('production', productionConfig);

  console.log('📋 Available prototypes:', registry.list());

  // Create instances from registry
  const devInstance = registry.create('development');
  const prodInstance = registry.create('production');
  const testInstance = registry.create('development'); // Clone dev for testing

  if (devInstance && prodInstance && testInstance) {
    console.log('🔧 Dev Config:', devInstance.toString());
    console.log('🚀 Prod Config:', prodInstance.toString());
    console.log('🧪 Test Config:', testInstance.toString());

    // Show metadata
    console.log('\n📊 Registry Statistics:');
    registry.list().forEach(name => {
      const meta = registry.getMetadata(name);
      console.log(`  ${name}: ${meta?.cloneCount} clones created`);
    });
  }
}

/**
 * Demonstrate parameterized cloning
 */
function demonstrateParameterizedCloning(): void {
  console.log('\n⚔️ PARAMETERIZED CLONING DEMONSTRATION');
  console.log('======================================');

  // Create warrior prototype
  const warriorPrototype = new CharacterPrototype({
    name: 'Warrior Template',
    class: 'warrior',
    level: 10,
    stats: {
      health: 150,
      mana: 30,
      strength: 20,
      defense: 15,
      speed: 8
    },
    equipment: ['iron_sword', 'leather_armor'],
    abilities: ['slash', 'defend', 'battle_cry']
  });

  console.log('⚔️ Warrior Prototype:', warriorPrototype.toString());

  // Create specific character instances with customization
  const playerWarrior = warriorPrototype.cloneWithCustomization({
    name: 'Sir Galahad',
    level: 15,
    position: { x: 100, y: 200 },
    equipment: ['legendary_sword', 'plate_armor', 'shield'],
    statModifiers: { strength: 25, defense: 20 }
  });

  const enemyWarrior = warriorPrototype.cloneWithCustomization({
    name: 'Orc Warrior',
    level: 8,
    position: { x: 500, y: 300 },
    statModifiers: { health: 120, strength: 18 }
  });

  const bossWarrior = warriorPrototype.clone().scaleForLevel(25);
  bossWarrior.getData(); // Get data to update name
  console.log('👑 Boss Warrior (scaled):', bossWarrior.toString());

  console.log('🏆 Player:', playerWarrior.toString());
  console.log('👹 Enemy:', enemyWarrior.toString());

  // Show stat differences
  console.log('\n📊 Character Stats Comparison:');
  const prototypeStats = warriorPrototype.getData().stats;
  const playerStats = playerWarrior.getData().stats;
  const enemyStats = enemyWarrior.getData().stats;

  console.log(`Strength - Prototype: ${prototypeStats.strength}, Player: ${playerStats.strength}, Enemy: ${enemyStats.strength}`);
  console.log(`Defense - Prototype: ${prototypeStats.defense}, Player: ${playerStats.defense}, Enemy: ${enemyStats.defense}`);
}

/**
 * Demonstrate cloning performance comparison
 */
function demonstratePerformanceComparison(): void {
  console.log('\n⚡ CLONING PERFORMANCE DEMONSTRATION');
  console.log('===================================');

  const iterations = 10000;

  // Create complex configuration prototype
  const complexConfig = new ConfigurationPrototype({
    appName: 'ComplexApp',
    version: '3.0.0',
    environment: 'production'
  });

  // Add many features
  for (let i = 0; i < 100; i++) {
    complexConfig.enableFeature(`feature_${i}`);
  }

  console.log(`🔧 Testing with ${iterations} iterations...`);

  // Test prototype cloning
  console.time('⚡ Prototype Cloning');
  for (let i = 0; i < iterations; i++) {
    const cloned = complexConfig.clone();
    cloned.setEnvironment(`env_${i % 5}`);
  }
  console.timeEnd('⚡ Prototype Cloning');

  // Test traditional object creation (simulation)
  console.time('🏗️ Traditional Creation');
  for (let i = 0; i < iterations; i++) {
    const created = new ConfigurationPrototype({
      appName: 'ComplexApp',
      version: '3.0.0',
      environment: `env_${i % 5}`
    });
    // Simulate expensive initialization
    for (let j = 0; j < 100; j++) {
      created.enableFeature(`feature_${j}`);
    }
  }
  console.timeEnd('🏗️ Traditional Creation');

  console.log('📈 Prototype cloning is typically faster for complex objects!');
}

/**
 * Main demonstration function
 */
function demonstratePrototypePattern(): void {
  console.log('🎯 PROTOTYPE PATTERN - COMPREHENSIVE DEMONSTRATION');
  console.log('==================================================');
  console.log('The Prototype pattern creates objects by cloning existing instances');
  console.log('rather than creating new objects from scratch.\n');

  demonstrateBasicPrototyping();
  demonstratePrototypeRegistry();
  demonstrateParameterizedCloning();
  demonstratePerformanceComparison();

  console.log('\n✅ PROTOTYPE PATTERN BENEFITS DEMONSTRATED:');
  console.log('- Flexible object creation without knowing exact classes');
  console.log('- Reduced object creation cost through cloning');
  console.log('- Dynamic product configuration at runtime');
  console.log('- Centralized prototype management via registry');
  console.log('- Parameterized cloning for customization');
  console.log('- Better performance for complex object creation');

  console.log('\n📚 LEARN MORE:');
  console.log('- Document Templates: npm run prototype:document');
  console.log('- Configuration Management: npm run prototype:configuration');
  console.log('- Game Object System: npm run prototype:game');
  console.log('- UI Components: npm run prototype:ui');
  console.log('- Data Models: npm run prototype:data');
}

// ============================================================================
// EXECUTION
// ============================================================================

if (require.main === module) {
  demonstratePrototypePattern();
}

export {
  Prototype,
  AdvancedPrototype,
  PrototypeRegistry,
  DocumentPrototype,
  ConfigurationPrototype,
  CharacterPrototype,
  demonstratePrototypePattern
};

exit(0); 