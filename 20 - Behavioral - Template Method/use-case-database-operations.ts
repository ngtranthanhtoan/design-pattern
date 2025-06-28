/**
 * Template Method Pattern - Database Operations Use Case
 *
 * Demonstrates how to use Template Method to create a standardized CRUD operation flow
 * where different entities (User, Product) can customize validation, processing, and persistence
 * while maintaining the same overall operation structure.
 */

import { exit } from "process";

// =============================================================================
// INTERFACES AND TYPES
// =============================================================================

interface Entity {
  id: string;
}

interface User extends Entity {
  username: string;
  email: string;
  isActive: boolean;
}

interface Product extends Entity {
  name: string;
  price: number;
  inStock: boolean;
}

interface OperationResult {
  success: boolean;
  message: string;
  entityId?: string;
  errors?: string[];
}

interface OperationContext<T extends Entity> {
  entity: T;
  operation: 'create' | 'update' | 'delete';
  notify: boolean;
}

// =============================================================================
// ABSTRACT CLASS - DATABASE OPERATION TEMPLATE
// =============================================================================

abstract class DatabaseOperation<T extends Entity> {
  protected context: OperationContext<T>;

  constructor(context: OperationContext<T>) {
    this.context = context;
  }

  /**
   * Template Method: Defines the overall CRUD operation flow
   */
  public execute(): OperationResult {
    console.log(`\n🔄 Starting ${this.context.operation} operation for entity: ${this.context.entity.id}`);
    try {
      // Step 1: Validate entity
      const validation = this.validate();
      if (!validation.success) return validation;

      // Step 2: Pre-persistence hook
      this.beforePersist();

      // Step 3: Process entity (e.g., transform, enrich)
      const processing = this.process();
      if (!processing.success) return processing;

      // Step 4: Persist entity
      const persistence = this.persist();
      if (!persistence.success) return persistence;

      // Step 5: Post-persistence notification (optional)
      if (this.shouldNotify()) {
        this.notify();
      }

      return {
        success: true,
        message: `✅ ${this.context.operation} operation successful for entity: ${this.context.entity.id}`,
        entityId: this.context.entity.id
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // =============================================================================
  // PRIMITIVE OPERATIONS - Must be implemented by subclasses
  // =============================================================================

  protected abstract validate(): OperationResult;
  protected abstract process(): OperationResult;
  protected abstract persist(): OperationResult;

  // =============================================================================
  // HOOK METHODS - Optional methods that subclasses can override
  // =============================================================================

  protected shouldNotify(): boolean {
    return this.context.notify;
  }

  protected beforePersist(): void {
    // Optional hook
  }

  // =============================================================================
  // CONCRETE OPERATIONS - Common implementations shared by all subclasses
  // =============================================================================

  protected notify(): void {
    console.log(`📢 Notifying about ${this.context.operation} of entity: ${this.context.entity.id}`);
  }
}

// =============================================================================
// CONCRETE IMPLEMENTATIONS
// =============================================================================

class UserOperation extends DatabaseOperation<User> {
  protected override validate(): OperationResult {
    const { username, email } = this.context.entity;
    if (!username || username.length < 3) {
      return { success: false, message: "Invalid username", errors: ["Username must be at least 3 chars"] };
    }
    if (!email || !email.includes("@")) {
      return { success: false, message: "Invalid email", errors: ["Email must be valid"] };
    }
    return { success: true, message: "User validation passed" };
  }

  protected override process(): OperationResult {
    // Simulate user-specific processing
    if (this.context.operation === 'create') {
      this.context.entity.isActive = true;
    }
    return { success: true, message: "User processed" };
  }

  protected override persist(): OperationResult {
    // Simulate DB persistence
    const success = Math.random() > 0.05;
    if (success) {
      console.log(`💾 User ${this.context.operation}d: ${this.context.entity.username}`);
      return { success: true, message: "User persisted" };
    } else {
      return { success: false, message: "User persistence failed", errors: ["DB error"] };
    }
  }

  protected override beforePersist(): void {
    console.log(`🔍 Auditing user before persistence: ${this.context.entity.username}`);
  }
}

class ProductOperation extends DatabaseOperation<Product> {
  protected override validate(): OperationResult {
    const { name, price } = this.context.entity;
    if (!name || name.length < 2) {
      return { success: false, message: "Invalid product name", errors: ["Name must be at least 2 chars"] };
    }
    if (price < 0) {
      return { success: false, message: "Invalid price", errors: ["Price must be non-negative"] };
    }
    return { success: true, message: "Product validation passed" };
  }

  protected override process(): OperationResult {
    // Simulate product-specific processing
    if (this.context.operation === 'create') {
      this.context.entity.inStock = true;
    }
    return { success: true, message: "Product processed" };
  }

  protected override persist(): OperationResult {
    // Simulate DB persistence
    const success = Math.random() > 0.1;
    if (success) {
      console.log(`💾 Product ${this.context.operation}d: ${this.context.entity.name}`);
      return { success: true, message: "Product persisted" };
    } else {
      return { success: false, message: "Product persistence failed", errors: ["DB error"] };
    }
  }

  protected override beforePersist(): void {
    console.log(`🔍 Checking product inventory before persistence: ${this.context.entity.name}`);
  }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

function demonstrateDatabaseOperations(): void {
  console.log("\n🔄 Database Operations Template Method Pattern Demo");
  console.log("====================================================");

  // User create operation
  const userContext: OperationContext<User> = {
    entity: { id: "u1", username: "alice", email: "alice@example.com", isActive: false },
    operation: 'create',
    notify: true
  };
  const userOp = new UserOperation(userContext);
  const userResult = userOp.execute();
  console.log(`   User Result: ${userResult.message}`);

  // Product update operation
  const productContext: OperationContext<Product> = {
    entity: { id: "p1", name: "Widget", price: 19.99, inStock: false },
    operation: 'update',
    notify: false
  };
  const productOp = new ProductOperation(productContext);
  const productResult = productOp.execute();
  console.log(`   Product Result: ${productResult.message}`);
}

function testDatabaseOperations(): void {
  console.log("\n🧪 Testing Database Operation Edge Cases");
  console.log("========================================");

  // Invalid user
  const badUserContext: OperationContext<User> = {
    entity: { id: "u2", username: "a", email: "bademail", isActive: false },
    operation: 'create',
    notify: false
  };
  const badUserOp = new UserOperation(badUserContext);
  const badUserResult = badUserOp.execute();
  console.log(`   Bad User Result: ${badUserResult.message}`);
  if (badUserResult.errors) console.log(`   Errors: ${badUserResult.errors.join(', ')}`);

  // Invalid product
  const badProductContext: OperationContext<Product> = {
    entity: { id: "p2", name: "", price: -5, inStock: false },
    operation: 'create',
    notify: true
  };
  const badProductOp = new ProductOperation(badProductContext);
  const badProductResult = badProductOp.execute();
  console.log(`   Bad Product Result: ${badProductResult.message}`);
  if (badProductResult.errors) console.log(`   Errors: ${badProductResult.errors.join(', ')}`);
}

// =============================================================================
// DEMONSTRATION
// =============================================================================

function main(): void {
  try {
    demonstrateDatabaseOperations();
    testDatabaseOperations();
    console.log("\n✅ Template Method Pattern - Database Operations demonstration completed");
  } catch (error) {
    console.error("❌ Error during demonstration:", error);
  }
}

main();
exit(0); 