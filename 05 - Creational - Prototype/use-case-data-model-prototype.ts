/**
 * PROTOTYPE PATTERN - DATA MODEL PROTOTYPE
 * =======================================
 * 
 * This example demonstrates the Prototype pattern for data model creation.
 * Data model creation often involves expensive operations like:
 * - Schema validation and type checking
 * - Database connection establishment
 * - Index creation and optimization
 * - Relationship mapping and foreign key setup
 * - Serialization/deserialization configuration
 * - Caching strategy initialization
 * 
 * Instead of repeating these expensive operations, we create prototype data models
 * that can be quickly cloned and customized for specific records or use cases.
 * 
 * REAL-WORLD APPLICATIONS:
 * - ORM frameworks (Sequelize, TypeORM, Mongoose)
 * - API response models and DTOs
 * - Database record templates
 * - Data validation and schema models
 * - Multi-tenant data isolation
 * - Test data generation systems
 */

import { exit } from "process";

// ============================================================================
// DATA MODEL INTERFACES AND TYPES
// ============================================================================

interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'uuid' | 'email' | 'url';
  required: boolean;
  unique?: boolean;
  indexed?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: RegExp;
  enum?: any[];
  default?: any;
  description?: string;
}

interface Schema {
  [fieldName: string]: SchemaField;
}

interface Relationship {
  type: 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';
  target: string;
  foreignKey?: string;
  sourceKey?: string;
  through?: string;
  as?: string;
}

interface Index {
  name: string;
  fields: string[];
  unique?: boolean;
  sparse?: boolean;
  type?: 'btree' | 'hash' | 'text' | 'geo';
}

interface ValidationError {
  field: string;
  message: string;
  value: any;
  rule: string;
}

interface ModelOptions {
  tableName?: string;
  timestamps?: boolean;
  softDelete?: boolean;
  paranoid?: boolean;
  version?: boolean;
  caching?: boolean;
  ttl?: number;
}

interface QueryOptions {
  select?: string[];
  where?: Record<string, any>;
  orderBy?: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
  limit?: number;
  offset?: number;
  include?: string[];
}

// ============================================================================
// BASE DATA MODEL PROTOTYPE
// ============================================================================

/**
 * Base data model prototype that manages schema, validation, and database operations
 * Simulates expensive model initialization operations
 */
abstract class DataModelPrototype {
  protected name: string;
  protected schema: Schema;
  protected relationships: Map<string, Relationship>;
  protected indexes: Index[];
  protected options: ModelOptions;
  protected data: Record<string, any>;
  protected validationRules: Map<string, ((value: any) => boolean)[]>;
  protected isInitialized: boolean = false;
  protected initializationCost: number = 0;
  protected connectionPool: any;
  protected cacheManager: any;

  constructor(name: string) {
    this.name = name;
    this.schema = {};
    this.relationships = new Map();
    this.indexes = [];
    this.options = {
      timestamps: true,
      caching: false,
      ttl: 3600
    };
    this.data = {};
    this.validationRules = new Map();
  }

  /**
   * Expensive initialization process (simulated)
   * In real-world scenarios, this might involve:
   * - Validating schema against database
   * - Creating database tables and indexes
   * - Setting up foreign key constraints
   * - Initializing connection pools
   * - Setting up caching strategies
   * - Compiling validation rules
   */
  async initializeModel(databaseConfig?: any): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    console.log(`🗄️ Starting expensive data model initialization for ${this.name}...`);
    const startTime = Date.now();

    // Simulate database connection
    await this.simulateDatabaseConnection(databaseConfig);
    
    // Simulate schema validation
    await this.simulateSchemaValidation();
    
    // Simulate table creation
    await this.simulateTableCreation();
    
    // Simulate index creation
    await this.simulateIndexCreation();
    
    // Simulate relationship setup
    await this.simulateRelationshipSetup();
    
    // Simulate cache initialization
    await this.simulateCacheInitialization();
    
    // Simulate validation compilation
    await this.simulateValidationCompilation();

    this.initializationCost = Date.now() - startTime;
    this.isInitialized = true;

    console.log(`✅ Data model initialized in ${this.initializationCost}ms`);
    return this;
  }

  /**
   * Clone the model (fast operation)
   */
  abstract clone(): DataModelPrototype;

  /**
   * Base clone implementation
   */
  protected baseClone<T extends DataModelPrototype>(constructor: new (name: string) => T): T {
    if (!this.isInitialized) {
      throw new Error('Data model must be initialized before cloning');
    }

    console.log(`📋 Cloning data model ${this.name} (fast operation)...`);
    const startTime = Date.now();

    const cloned = new constructor(this.name);
    
    // Copy all configuration without re-initialization
    cloned.schema = JSON.parse(JSON.stringify(this.schema));
    cloned.relationships = new Map(this.relationships);
    cloned.indexes = this.indexes.map(index => ({ ...index, fields: [...index.fields] }));
    cloned.options = { ...this.options };
    cloned.data = {}; // Start with empty data for new instance
    cloned.validationRules = new Map(this.validationRules);
    cloned.connectionPool = this.connectionPool;
    cloned.cacheManager = this.cacheManager;
    cloned.isInitialized = true;
    cloned.initializationCost = this.initializationCost;

    const cloneTime = Date.now() - startTime;
    console.log(`✅ Data model cloned in ${cloneTime}ms (${Math.round((this.initializationCost / cloneTime) * 100) / 100}x faster than initialization)`);

    return cloned;
  }

  // ============================================================================
  // SCHEMA CONFIGURATION METHODS
  // ============================================================================

  addField(name: string, field: SchemaField): this {
    this.schema[name] = field;
    return this;
  }

  addRelationship(name: string, relationship: Relationship): this {
    this.relationships.set(name, relationship);
    return this;
  }

  addIndex(index: Index): this {
    this.indexes.push(index);
    return this;
  }

  setOptions(options: Partial<ModelOptions>): this {
    Object.assign(this.options, options);
    return this;
  }

  // ============================================================================
  // DATA MANIPULATION METHODS
  // ============================================================================

  setData(data: Record<string, any>): this {
    this.data = { ...data };
    if (this.options.timestamps) {
      this.data.updatedAt = new Date();
      if (!this.data.createdAt) {
        this.data.createdAt = new Date();
      }
    }
    return this;
  }

  updateData(updates: Record<string, any>): this {
    Object.assign(this.data, updates);
    if (this.options.timestamps) {
      this.data.updatedAt = new Date();
    }
    return this;
  }

  getData(): Record<string, any> {
    return { ...this.data };
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  async validate(): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    for (const [fieldName, fieldSchema] of Object.entries(this.schema)) {
      const value = this.data[fieldName];
      const fieldErrors = await this.validateField(fieldName, value, fieldSchema);
      errors.push(...fieldErrors);
    }

    return errors;
  }

  private async validateField(fieldName: string, value: any, fieldSchema: SchemaField): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Required validation
    if (fieldSchema.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        value,
        rule: 'required'
      });
      return errors; // Don't validate further if required field is missing
    }

    // Skip other validations if field is not required and empty
    if (!fieldSchema.required && (value === undefined || value === null || value === '')) {
      return errors;
    }

    // Type validation
    const typeErrors = this.validateFieldType(fieldName, value, fieldSchema);
    errors.push(...typeErrors);

    // Length validation
    if (fieldSchema.minLength && typeof value === 'string' && value.length < fieldSchema.minLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${fieldSchema.minLength} characters`,
        value,
        rule: 'minLength'
      });
    }

    if (fieldSchema.maxLength && typeof value === 'string' && value.length > fieldSchema.maxLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be no more than ${fieldSchema.maxLength} characters`,
        value,
        rule: 'maxLength'
      });
    }

    // Numeric validation
    if (fieldSchema.minimum !== undefined && typeof value === 'number' && value < fieldSchema.minimum) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${fieldSchema.minimum}`,
        value,
        rule: 'minimum'
      });
    }

    if (fieldSchema.maximum !== undefined && typeof value === 'number' && value > fieldSchema.maximum) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be no more than ${fieldSchema.maximum}`,
        value,
        rule: 'maximum'
      });
    }

    // Pattern validation
    if (fieldSchema.pattern && typeof value === 'string' && !fieldSchema.pattern.test(value)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} format is invalid`,
        value,
        rule: 'pattern'
      });
    }

    // Enum validation
    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be one of: ${fieldSchema.enum.join(', ')}`,
        value,
        rule: 'enum'
      });
    }

    return errors;
  }

  private validateFieldType(fieldName: string, value: any, fieldSchema: SchemaField): ValidationError[] {
    const errors: ValidationError[] = [];

    switch (fieldSchema.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be a string`,
            value,
            rule: 'type'
          });
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be a number`,
            value,
            rule: 'type'
          });
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be a boolean`,
            value,
            rule: 'type'
          });
        }
        break;
      case 'date':
        if (!(value instanceof Date) && !Date.parse(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be a valid date`,
            value,
            rule: 'type'
          });
        }
        break;
      case 'email':
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({
              field: fieldName,
              message: `${fieldName} must be a valid email address`,
              value,
              rule: 'email'
            });
          }
        }
        break;
      case 'uuid':
        if (typeof value === 'string') {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(value)) {
            errors.push({
              field: fieldName,
              message: `${fieldName} must be a valid UUID`,
              value,
              rule: 'uuid'
            });
          }
        }
        break;
    }

    return errors;
  }

  // ============================================================================
  // DATABASE OPERATIONS (SIMULATED)
  // ============================================================================

  async save(): Promise<this> {
    const errors = await this.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }

    console.log(`💾 Saving ${this.name} to database...`);
    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
    
    if (this.options.timestamps && !this.data.id) {
      this.data.id = this.generateId();
      this.data.createdAt = new Date();
    }
    
    if (this.options.timestamps) {
      this.data.updatedAt = new Date();
    }

    return this;
  }

  async delete(): Promise<boolean> {
    console.log(`🗑️ Deleting ${this.name} from database...`);
    await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 15));
    
    if (this.options.softDelete) {
      this.data.deletedAt = new Date();
      return true;
    }
    
    // Simulate hard delete
    this.data = {};
    return true;
  }

  static async find(options: QueryOptions = {}): Promise<DataModelPrototype[]> {
    console.log('🔍 Querying database...');
    await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 40));
    
    // Simulate returning empty results for demo
    return [];
  }

  static async findById(id: string): Promise<DataModelPrototype | null> {
    console.log(`🔍 Finding record by ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 25));
    
    // Simulate not found for demo
    return null;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  protected generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  toJSON(): any {
    const result = { ...this.data };
    
    // Add virtual fields
    if (this.options.timestamps) {
      result.createdAt = this.data.createdAt;
      result.updatedAt = this.data.updatedAt;
    }
    
    return result;
  }

  toString(): string {
    const fieldCount = Object.keys(this.schema).length;
    const relationshipCount = this.relationships.size;
    return `${this.name}Model: ${fieldCount} fields, ${relationshipCount} relationships, ${this.indexes.length} indexes`;
  }

  getMetadata(): any {
    return {
      name: this.name,
      schema: this.schema,
      relationships: Object.fromEntries(this.relationships),
      indexes: this.indexes,
      options: this.options,
      isInitialized: this.isInitialized,
      initializationCost: this.initializationCost
    };
  }

  // ============================================================================
  // SIMULATION METHODS (EXPENSIVE OPERATIONS)
  // ============================================================================

  private async simulateDatabaseConnection(config?: any): Promise<void> {
    console.log('  🔗 Establishing database connection');
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
    this.connectionPool = { connected: true, maxConnections: 10 };
  }

  private async simulateSchemaValidation(): Promise<void> {
    console.log('  📋 Validating schema against database');
    await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120));
  }

  private async simulateTableCreation(): Promise<void> {
    console.log(`  🏗️ Creating/updating table: ${this.options.tableName || this.name}`);
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
  }

  private async simulateIndexCreation(): Promise<void> {
    console.log('  📇 Creating database indexes');
    await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 90));
  }

  private async simulateRelationshipSetup(): Promise<void> {
    console.log('  🔗 Setting up foreign key relationships');
    await new Promise(resolve => setTimeout(resolve, 70 + Math.random() * 100));
  }

  private async simulateCacheInitialization(): Promise<void> {
    console.log('  💾 Initializing cache manager');
    if (this.options.caching) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 80));
      this.cacheManager = { enabled: true, ttl: this.options.ttl };
    }
  }

  private async simulateValidationCompilation(): Promise<void> {
    console.log('  ✅ Compiling validation rules');
    await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 60));
  }
}

// ============================================================================
// USER MODEL PROTOTYPE
// ============================================================================

/**
 * User model prototype for user management systems
 */
class UserModelPrototype extends DataModelPrototype {
  constructor() {
    super('User');

    // Define user schema
    this.addField('id', {
      type: 'uuid',
      required: true,
      unique: true,
      description: 'User unique identifier'
    })
    .addField('email', {
      type: 'email',
      required: true,
      unique: true,
      maxLength: 255,
      description: 'User email address'
    })
    .addField('username', {
      type: 'string',
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
      description: 'User display name'
    })
    .addField('firstName', {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      description: 'User first name'
    })
    .addField('lastName', {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      description: 'User last name'
    })
    .addField('role', {
      type: 'string',
      required: true,
      enum: ['admin', 'moderator', 'user', 'guest'],
      default: 'user',
      description: 'User role'
    })
    .addField('isActive', {
      type: 'boolean',
      required: true,
      default: true,
      description: 'User account status'
    })
    .addField('lastLoginAt', {
      type: 'date',
      required: false,
      description: 'Last login timestamp'
    })
    .addField('preferences', {
      type: 'object',
      required: false,
      default: {},
      description: 'User preferences and settings'
    });

    // Add relationships
    this.addRelationship('profile', {
      type: 'hasOne',
      target: 'UserProfile',
      foreignKey: 'userId'
    })
    .addRelationship('orders', {
      type: 'hasMany',
      target: 'Order',
      foreignKey: 'userId'
    })
    .addRelationship('permissions', {
      type: 'belongsToMany',
      target: 'Permission',
      through: 'UserPermissions'
    });

    // Add indexes
    this.addIndex({ name: 'idx_email', fields: ['email'], unique: true })
    .addIndex({ name: 'idx_username', fields: ['username'], unique: true })
    .addIndex({ name: 'idx_role_active', fields: ['role', 'isActive'] });

    // Set options
    this.setOptions({
      tableName: 'users',
      timestamps: true,
      softDelete: true,
      caching: true,
      ttl: 1800
    });
  }

  override clone(): UserModelPrototype {
    const cloned = new UserModelPrototype();
    
    // Copy base class properties
    cloned.schema = JSON.parse(JSON.stringify(this.schema));
    cloned.relationships = new Map(this.relationships);
    cloned.indexes = this.indexes.map(index => ({ ...index, fields: [...index.fields] }));
    cloned.options = { ...this.options };
    cloned.data = {}; // Start with empty data for new instance
    cloned.validationRules = new Map(this.validationRules);
    cloned.connectionPool = this.connectionPool;
    cloned.cacheManager = this.cacheManager;
    cloned.isInitialized = true;
    cloned.initializationCost = this.initializationCost;
    
    return cloned;
  }

  // User-specific methods
  setUserData(userData: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): this {
    this.setData({
      ...userData,
      id: this.generateId(),
      role: userData.role || 'user',
      isActive: true,
      preferences: {}
    });
    return this;
  }

  updateLastLogin(): this {
    this.updateData({ lastLoginAt: new Date() });
    return this;
  }

  setPreferences(preferences: Record<string, any>): this {
    this.updateData({ preferences: { ...this.data.preferences, ...preferences } });
    return this;
  }

  deactivate(): this {
    this.updateData({ isActive: false });
    return this;
  }

  activate(): this {
    this.updateData({ isActive: true });
    return this;
  }


}

// ============================================================================
// PRODUCT MODEL PROTOTYPE
// ============================================================================

/**
 * Product model prototype for e-commerce systems
 */
class ProductModelPrototype extends DataModelPrototype {
  constructor() {
    super('Product');

    // Define product schema
    this.addField('id', {
      type: 'uuid',
      required: true,
      unique: true
    })
    .addField('name', {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 200
    })
    .addField('description', {
      type: 'string',
      required: false,
      maxLength: 5000
    })
    .addField('price', {
      type: 'number',
      required: true,
      minimum: 0
    })
    .addField('currency', {
      type: 'string',
      required: true,
      enum: ['USD', 'EUR', 'GBP', 'JPY'],
      default: 'USD'
    })
    .addField('category', {
      type: 'string',
      required: true,
      maxLength: 100
    })
    .addField('tags', {
      type: 'array',
      required: false,
      default: []
    })
    .addField('inStock', {
      type: 'boolean',
      required: true,
      default: true
    })
    .addField('stockQuantity', {
      type: 'number',
      required: true,
      minimum: 0,
      default: 0
    })
    .addField('sku', {
      type: 'string',
      required: true,
      unique: true,
      pattern: /^[A-Z0-9\-_]+$/
    })
    .addField('weight', {
      type: 'number',
      required: false,
      minimum: 0
    })
    .addField('dimensions', {
      type: 'object',
      required: false,
      default: {}
    });

    // Add relationships
    this.addRelationship('vendor', {
      type: 'belongsTo',
      target: 'Vendor',
      foreignKey: 'vendorId'
    })
    .addRelationship('reviews', {
      type: 'hasMany',
      target: 'ProductReview',
      foreignKey: 'productId'
    })
    .addRelationship('images', {
      type: 'hasMany',
      target: 'ProductImage',
      foreignKey: 'productId'
    });

    // Add indexes
    this.addIndex({ name: 'idx_sku', fields: ['sku'], unique: true })
    .addIndex({ name: 'idx_category_price', fields: ['category', 'price'] })
    .addIndex({ name: 'idx_stock', fields: ['inStock', 'stockQuantity'] });

    this.setOptions({
      tableName: 'products',
      timestamps: true,
      caching: true,
      ttl: 3600
    });
  }

  clone(): ProductModelPrototype {
    return this.baseClone(ProductModelPrototype);
  }

  // Product-specific methods
  setProductData(productData: {
    name: string;
    price: number;
    category: string;
    sku: string;
    description?: string;
    currency?: string;
  }): this {
    this.setData({
      ...productData,
      id: this.generateId(),
      currency: productData.currency || 'USD',
      inStock: true,
      stockQuantity: 0,
      tags: [],
      dimensions: {}
    });
    return this;
  }

  updateStock(quantity: number): this {
    this.updateData({
      stockQuantity: quantity,
      inStock: quantity > 0
    });
    return this;
  }

  addTags(tags: string[]): this {
    const currentTags = this.data.tags || [];
    this.updateData({
      tags: [...new Set([...currentTags, ...tags])]
    });
    return this;
  }

  setDimensions(length: number, width: number, height: number): this {
    this.updateData({
      dimensions: { length, width, height }
    });
    return this;
  }


}

// ============================================================================
// ORDER MODEL PROTOTYPE
// ============================================================================

/**
 * Order model prototype for order management systems
 */
class OrderModelPrototype extends DataModelPrototype {
  constructor() {
    super('Order');

    this.addField('id', {
      type: 'uuid',
      required: true,
      unique: true
    })
    .addField('orderNumber', {
      type: 'string',
      required: true,
      unique: true,
      pattern: /^ORD-\d{8}-[A-Z0-9]{6}$/
    })
    .addField('customerId', {
      type: 'uuid',
      required: true
    })
    .addField('status', {
      type: 'string',
      required: true,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    })
    .addField('items', {
      type: 'array',
      required: true,
      default: []
    })
    .addField('subtotal', {
      type: 'number',
      required: true,
      minimum: 0
    })
    .addField('tax', {
      type: 'number',
      required: true,
      minimum: 0
    })
    .addField('shipping', {
      type: 'number',
      required: true,
      minimum: 0
    })
    .addField('total', {
      type: 'number',
      required: true,
      minimum: 0
    })
    .addField('currency', {
      type: 'string',
      required: true,
      enum: ['USD', 'EUR', 'GBP'],
      default: 'USD'
    })
    .addField('shippingAddress', {
      type: 'object',
      required: true
    })
    .addField('billingAddress', {
      type: 'object',
      required: false
    })
    .addField('paymentMethod', {
      type: 'string',
      required: true,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer']
    });

    this.addRelationship('customer', {
      type: 'belongsTo',
      target: 'User',
      foreignKey: 'customerId'
    })
    .addRelationship('orderItems', {
      type: 'hasMany',
      target: 'OrderItem',
      foreignKey: 'orderId'
    });

    this.addIndex({ name: 'idx_order_number', fields: ['orderNumber'], unique: true })
    .addIndex({ name: 'idx_customer_status', fields: ['customerId', 'status'] })
    .addIndex({ name: 'idx_created_at', fields: ['createdAt'] });

    this.setOptions({
      tableName: 'orders',
      timestamps: true,
      caching: false
    });
  }

  clone(): OrderModelPrototype {
    return this.baseClone(OrderModelPrototype);
  }

  // Order-specific methods
  setOrderData(orderData: {
    customerId: string;
    items: any[];
    shippingAddress: any;
    paymentMethod: string;
  }): this {
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
    const total = subtotal + tax + shipping;

    this.setData({
      ...orderData,
      id: this.generateId(),
      orderNumber: this.generateOrderNumber(),
      status: 'pending',
      subtotal,
      tax,
      shipping,
      total,
      currency: 'USD'
    });
    return this;
  }

  updateStatus(status: string): this {
    if (this.schema.status.enum?.includes(status)) {
      this.updateData({ status });
    }
    return this;
  }

  addItem(item: { productId: string; name: string; price: number; quantity: number }): this {
    const items = [...(this.data.items || []), item];
    this.recalculateTotals(items);
    return this;
  }

  private recalculateTotals(items: any[]): void {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    this.updateData({ items, subtotal, tax, shipping, total });
  }



  private generateOrderNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `ORD-${date}-${random}`;
  }
}

// ============================================================================
// DATA MODEL REGISTRY
// ============================================================================

/**
 * Registry system for managing data model prototypes
 */
class DataModelRegistry {
  private prototypes = new Map<string, DataModelPrototype>();
  private schemas = new Map<string, Schema>();
  private usage = new Map<string, number>();

  async registerModel(name: string, prototype: DataModelPrototype): Promise<void> {
    const metadata = prototype.getMetadata();
    if (!metadata.isInitialized) {
      await prototype.initializeModel();
    }
    
    this.prototypes.set(name, prototype);
    this.schemas.set(name, metadata.schema);
    this.usage.set(name, 0);
    
    console.log(`📋 Registered data model: ${name}`);
  }

  createModel(name: string, data?: Record<string, any>): DataModelPrototype | null {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      console.log(`❌ Data model prototype not found: ${name}`);
      return null;
    }

    const current = this.usage.get(name) || 0;
    this.usage.set(name, current + 1);

    const cloned = prototype.clone();
    
    if (data) {
      cloned.setData(data);
    }

    return cloned;
  }

  listModels(): Array<{ name: string; fields: number; relationships: number }> {
    return Array.from(this.prototypes.entries()).map(([name, prototype]) => {
      const metadata = prototype.getMetadata();
      return {
        name,
        fields: Object.keys(metadata.schema).length,
        relationships: Object.keys(metadata.relationships).length
      };
    });
  }

  getSchema(name: string): Schema | undefined {
    return this.schemas.get(name);
  }

  getUsageStats(): Map<string, number> {
    return new Map(this.usage);
  }
}

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

/**
 * Demonstrate basic data model prototyping
 */
async function demonstrateBasicDataModelPrototyping(): Promise<void> {
  console.log('\n🗄️ BASIC DATA MODEL PROTOTYPING');
  console.log('================================');

  // Create user model prototype
  const userPrototype = new UserModelPrototype();
  await userPrototype.initializeModel({ host: 'localhost', database: 'app_db' });

  console.log('👤 User prototype:', userPrototype.toString());

  // Clone for specific users
  const adminUser = userPrototype.clone()
    .setUserData({
      email: 'admin@company.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    })
    .setPreferences({
      theme: 'dark',
      notifications: true,
      language: 'en'
    });

  const regularUser = userPrototype.clone()
    .setUserData({
      email: 'john.doe@example.com',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe'
    })
    .setPreferences({
      theme: 'light',
      notifications: false
    });

  console.log('👨‍💼 Admin user:', adminUser.toString());
  console.log('👤 Regular user:', regularUser.toString());

  // Validate and save
  const adminErrors = await adminUser.validate();
  const userErrors = await regularUser.validate();

  console.log(`✅ Admin validation: ${adminErrors.length === 0 ? 'passed' : 'failed'}`);
  console.log(`✅ User validation: ${userErrors.length === 0 ? 'passed' : 'failed'}`);

  if (adminErrors.length === 0) {
    await adminUser.save();
    console.log('💾 Admin user saved successfully');
  }

  if (userErrors.length === 0) {
    await regularUser.save();
    console.log('💾 Regular user saved successfully');
  }
}

/**
 * Demonstrate product and order model prototyping
 */
async function demonstrateProductOrderPrototyping(): Promise<void> {
  console.log('\n🛍️ PRODUCT AND ORDER MODEL PROTOTYPING');
  console.log('======================================');

  // Create product model prototype
  const productPrototype = new ProductModelPrototype();
  await productPrototype.initializeModel();

  // Create specific products
  const laptop = productPrototype.clone()
    .setProductData({
      name: 'Gaming Laptop Pro',
      price: 1299.99,
      category: 'Electronics',
      sku: 'LAPTOP-001',
      description: 'High-performance gaming laptop with RTX graphics'
    })
    .updateStock(25)
    .addTags(['gaming', 'laptop', 'electronics', 'portable'])
    .setDimensions(35.5, 24.2, 2.1);

  const smartphone = productPrototype.clone()
    .setProductData({
      name: 'Smartphone X1',
      price: 799.99,
      category: 'Electronics',
      sku: 'PHONE-001',
      description: 'Latest smartphone with advanced camera system'
    })
    .updateStock(50)
    .addTags(['smartphone', 'mobile', 'camera', 'android']);

  console.log('💻 Laptop:', laptop.toString());
  console.log('📱 Smartphone:', smartphone.toString());

  // Create order model prototype
  const orderPrototype = new OrderModelPrototype();
  await orderPrototype.initializeModel();

  // Create specific order
  const customerOrder = orderPrototype.clone()
    .setOrderData({
      customerId: 'user_123456789',
      items: [
        { productId: 'prod_laptop001', name: 'Gaming Laptop Pro', price: 1299.99, quantity: 1 },
        { productId: 'prod_phone001', name: 'Smartphone X1', price: 799.99, quantity: 2 }
      ],
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'credit_card'
    });

  console.log('🛒 Customer order:', customerOrder.toString());
  console.log('💰 Order total:', `$${customerOrder.getData().total.toFixed(2)}`);

  // Update order status
  customerOrder.updateStatus('confirmed');
  console.log('📦 Order status updated to confirmed');

  // Validate and save
  const orderErrors = await customerOrder.validate();
  if (orderErrors.length === 0) {
    await customerOrder.save();
    console.log('💾 Order saved successfully');
  } else {
    console.log('❌ Order validation failed:', orderErrors.map(e => e.message));
  }
}

/**
 * Demonstrate data model registry
 */
async function demonstrateDataModelRegistry(): Promise<void> {
  console.log('\n📋 DATA MODEL REGISTRY');
  console.log('======================');

  const registry = new DataModelRegistry();

  // Create and register model prototypes
  const userModel = new UserModelPrototype();
  const productModel = new ProductModelPrototype();
  const orderModel = new OrderModelPrototype();

  await registry.registerModel('User', userModel);
  await registry.registerModel('Product', productModel);
  await registry.registerModel('Order', orderModel);

  console.log('📋 Available models:');
  registry.listModels().forEach(({ name, fields, relationships }) => {
    console.log(`  ${name}: ${fields} fields, ${relationships} relationships`);
  });

  // Create model instances from registry
  const newUser = registry.createModel('User', {
    email: 'jane.smith@example.com',
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user'
  });

  const newProduct = registry.createModel('Product', {
    name: 'Wireless Headphones',
    price: 199.99,
    category: 'Audio',
    sku: 'AUDIO-001',
    description: 'Premium wireless noise-cancelling headphones'
  });

  if (newUser && newProduct) {
    console.log('✅ Created models from registry');
    console.log('👤 New user:', newUser.toString());
    console.log('🎧 New product:', newProduct.toString());
  }

  // Show usage statistics
  console.log('\n📊 Model Usage Statistics:');
  const stats = registry.getUsageStats();
  stats.forEach((count, name) => {
    console.log(`  ${name}: ${count} instances created`);
  });
}

/**
 * Demonstrate performance comparison
 */
async function demonstratePerformanceComparison(): Promise<void> {
  console.log('\n⚡ PERFORMANCE COMPARISON');
  console.log('========================');

  const iterations = 30;
  console.log(`🔧 Testing with ${iterations} model creations...`);

  // Create complex user prototype
  const complexUser = new UserModelPrototype();
  await complexUser.initializeModel();

  // Test prototype cloning
  console.time('⚡ Prototype Cloning');
  const clonedUsers = [];
  for (let i = 0; i < iterations; i++) {
    const user = complexUser.clone();
    user.setUserData({
      email: `user${i + 1}@example.com`,
      username: `user${i + 1}`,
      firstName: `User`,
      lastName: `${i + 1}`
    });
    clonedUsers.push(user);
  }
  console.timeEnd('⚡ Prototype Cloning');

  // Test traditional creation
  console.time('🏗️ Traditional Creation');
  const createdUsers = [];
  for (let i = 0; i < iterations; i++) {
    const user = new UserModelPrototype();
    await user.initializeModel(); // Expensive operation each time
    user.setUserData({
      email: `user${i + 1}@example.com`,
      username: `user${i + 1}`,
      firstName: `User`,
      lastName: `${i + 1}`
    });
    createdUsers.push(user);
  }
  console.timeEnd('🏗️ Traditional Creation');

  console.log(`🗄️ Created ${clonedUsers.length} cloned models and ${createdUsers.length} traditional models`);
  console.log('📈 Prototype cloning provides massive performance improvement for data models!');
}

/**
 * Main demonstration function
 */
async function demonstrateDataModelPrototype(): Promise<void> {
  console.log('🎯 DATA MODEL PROTOTYPE PATTERN');
  console.log('================================');
  console.log('Creating data models by cloning pre-initialized prototypes');
  console.log('instead of repeating expensive schema validation and database setup.\n');

  await demonstrateBasicDataModelPrototyping();
  await demonstrateProductOrderPrototyping();
  await demonstrateDataModelRegistry();
  await demonstratePerformanceComparison();

  console.log('\n✅ DATA MODEL PROTOTYPE BENEFITS:');
  console.log('- Massive performance improvement for complex model creation');
  console.log('- Consistent schema validation and database setup');
  console.log('- Easy model customization and data population');
  console.log('- Centralized model registry system');
  console.log('- Built-in validation and relationship management');
  console.log('- Support for caching and database optimization');

  console.log('\n🏭 REAL-WORLD APPLICATIONS:');
  console.log('- ORM frameworks (Sequelize, TypeORM, Mongoose)');
  console.log('- API response models and DTOs');
  console.log('- Database record templates and schemas');
  console.log('- Multi-tenant data isolation systems');
  console.log('- Test data generation and seeding');
  console.log('- Data validation and transformation pipelines');
}

// ============================================================================
// EXECUTION
// ============================================================================

if (require.main === module) {
  demonstrateDataModelPrototype().catch(console.error);
}

export {
  DataModelPrototype,
  UserModelPrototype,
  ProductModelPrototype,
  OrderModelPrototype,
  DataModelRegistry,
  demonstrateDataModelPrototype
};

exit(0); 