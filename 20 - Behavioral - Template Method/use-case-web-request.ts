/**
 * Template Method Pattern - Web Request Processing Use Case
 *
 * Demonstrates how to use Template Method to create a standardized request processing pipeline
 * where different endpoints (User, Product) can customize authentication, validation, and processing
 * while maintaining the same overall request flow.
 */

import { exit } from "process";

// =============================================================================
// INTERFACES AND TYPES
// =============================================================================

interface Request {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  user?: { id: string; role: string };
}

interface Response {
  status: number;
  body: any;
  headers?: Record<string, string>;
}

interface HandlerResult {
  success: boolean;
  message: string;
  status: number;
  data?: any;
  errors?: string[];
}

// =============================================================================
// ABSTRACT CLASS - REQUEST HANDLER TEMPLATE
// =============================================================================

abstract class RequestHandler {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  /**
   * Template Method: Defines the overall request processing flow
   */
  public handleRequest(): HandlerResult {
    console.log(`\n🌐 Handling ${this.request.method} ${this.request.path}`);
    try {
      // Step 1: Authenticate
      const auth = this.authenticate();
      if (!auth.success) return auth;

      // Step 2: Validate
      const validation = this.validate();
      if (!validation.success) return validation;

      // Step 3: Pre-processing hook
      this.beforeProcess();

      // Step 4: Process
      const processing = this.process();
      if (!processing.success) return processing;

      // Step 5: Post-processing hook
      this.afterProcess();

      // Step 6: Format response
      return this.formatResponse(processing);
    } catch (error) {
      return {
        success: false,
        message: `❌ Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 500,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // =============================================================================
  // PRIMITIVE OPERATIONS - Must be implemented by subclasses
  // =============================================================================

  protected abstract authenticate(): HandlerResult;
  protected abstract validate(): HandlerResult;
  protected abstract process(): HandlerResult;

  // =============================================================================
  // HOOK METHODS - Optional methods that subclasses can override
  // =============================================================================

  protected beforeProcess(): void {
    // Optional hook
  }

  protected afterProcess(): void {
    // Optional hook
  }

  protected formatResponse(result: HandlerResult): HandlerResult {
    // Default formatting
    return {
      success: result.success,
      message: result.message,
      status: result.status,
      data: result.data,
      errors: result.errors
    };
  }
}

// =============================================================================
// CONCRETE IMPLEMENTATIONS
// =============================================================================

class UserRequestHandler extends RequestHandler {
  protected override authenticate(): HandlerResult {
    if (!this.request.user) {
      return { success: false, message: "Unauthorized", status: 401 };
    }
    return { success: true, message: "Authenticated", status: 200 };
  }

  protected override validate(): HandlerResult {
    if (this.request.method === 'POST' && (!this.request.body || !this.request.body.username)) {
      return { success: false, message: "Missing username", status: 400 };
    }
    return { success: true, message: "Validated", status: 200 };
  }

  protected override process(): HandlerResult {
    if (this.request.method === 'POST') {
      // Simulate user creation
      return {
        success: true,
        message: "User created",
        status: 201,
        data: { id: "u123", ...this.request.body }
      };
    } else if (this.request.method === 'GET') {
      // Simulate user fetch
      return {
        success: true,
        message: "User fetched",
        status: 200,
        data: { id: "u123", username: "alice", email: "alice@example.com" }
      };
    }
    return { success: false, message: "Method not allowed", status: 405 };
  }

  protected override beforeProcess(): void {
    console.log(`🔍 Logging user request: ${this.request.method} ${this.request.path}`);
  }

  protected override afterProcess(): void {
    console.log(`✅ User request processed.`);
  }
}

class ProductRequestHandler extends RequestHandler {
  protected override authenticate(): HandlerResult {
    // Allow public GET, require user for POST/PUT/DELETE
    if (['POST', 'PUT', 'DELETE'].includes(this.request.method) && !this.request.user) {
      return { success: false, message: "Unauthorized", status: 401 };
    }
    return { success: true, message: "Authenticated", status: 200 };
  }

  protected override validate(): HandlerResult {
    if (this.request.method === 'POST' && (!this.request.body || !this.request.body.name)) {
      return { success: false, message: "Missing product name", status: 400 };
    }
    return { success: true, message: "Validated", status: 200 };
  }

  protected override process(): HandlerResult {
    if (this.request.method === 'POST') {
      // Simulate product creation
      return {
        success: true,
        message: "Product created",
        status: 201,
        data: { id: "p123", ...this.request.body }
      };
    } else if (this.request.method === 'GET') {
      // Simulate product fetch
      return {
        success: true,
        message: "Product fetched",
        status: 200,
        data: { id: "p123", name: "Widget", price: 19.99 }
      };
    }
    return { success: false, message: "Method not allowed", status: 405 };
  }

  protected override beforeProcess(): void {
    console.log(`🔍 Logging product request: ${this.request.method} ${this.request.path}`);
  }

  protected override afterProcess(): void {
    console.log(`✅ Product request processed.`);
  }

  protected override formatResponse(result: HandlerResult): HandlerResult {
    // Custom formatting for product responses
    return {
      ...result,
      message: `[Product API] ${result.message}`
    };
  }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

function demonstrateWebRequestProcessing(): void {
  console.log("\n🌐 Web Request Processing Template Method Pattern Demo");
  console.log("========================================================");

  // User POST request
  const userPostReq: Request = {
    path: "/users",
    method: 'POST',
    body: { username: "alice", email: "alice@example.com" },
    user: { id: "admin", role: "admin" }
  };
  const userHandler = new UserRequestHandler(userPostReq);
  const userPostRes = userHandler.handleRequest();
  console.log(`   User POST Result: ${userPostRes.message} (Status: ${userPostRes.status})`);

  // Product GET request (public)
  const productGetReq: Request = {
    path: "/products/1",
    method: 'GET'
  };
  const productHandler = new ProductRequestHandler(productGetReq);
  const productGetRes = productHandler.handleRequest();
  console.log(`   Product GET Result: ${productGetRes.message} (Status: ${productGetRes.status})`);
}

function testWebRequestProcessing(): void {
  console.log("\n🧪 Testing Web Request Processing Edge Cases");
  console.log("================================================");

  // Unauthorized user POST
  const badUserReq: Request = {
    path: "/users",
    method: 'POST',
    body: { username: "bob" }
    // no user
  };
  const badUserHandler = new UserRequestHandler(badUserReq);
  const badUserRes = badUserHandler.handleRequest();
  console.log(`   Bad User POST Result: ${badUserRes.message} (Status: ${badUserRes.status})`);

  // Product POST without name
  const badProductReq: Request = {
    path: "/products",
    method: 'POST',
    body: { price: 10.0 },
    user: { id: "admin", role: "admin" }
  };
  const badProductHandler = new ProductRequestHandler(badProductReq);
  const badProductRes = badProductHandler.handleRequest();
  console.log(`   Bad Product POST Result: ${badProductRes.message} (Status: ${badProductRes.status})`);
}

// =============================================================================
// DEMONSTRATION
// =============================================================================

function main(): void {
  try {
    demonstrateWebRequestProcessing();
    testWebRequestProcessing();
    console.log("\n✅ Template Method Pattern - Web Request Processing demonstration completed");
  } catch (error) {
    console.error("❌ Error during demonstration:", error);
  }
}

main();
exit(0); 