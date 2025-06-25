/**
 * Decorator Pattern - Function Composition
 * 
 * Demonstrates how to implement the Decorator pattern using function composition
 * instead of traditional decorator classes and wrapper hierarchies.
 */

import { exit } from "process";

// Core types for function composition
type Decorator<T> = (input: T) => T;
type FunctionDecorator<T extends (...args: any[]) => any> = (fn: T) => T;

// Pipe utility for left-to-right composition
const pipe = <T>(value: T, ...decorators: Decorator<T>[]): T =>
  decorators.reduce((acc, decorator) => decorator(acc), value);

// Compose utility for right-to-left composition
const compose = <T>(...decorators: Decorator<T>[]): Decorator<T> =>
  (value: T) => decorators.reduceRight((acc, decorator) => decorator(acc), value);

// Example 1: Coffee Shop - Classic decorator example
type Coffee = {
  name: string;
  cost: number;
  description: string;
};

const baseCoffee: Coffee = {
  name: "House Blend",
  cost: 2.50,
  description: "Rich house blend coffee"
};

// Coffee decorators
const withMilk: Decorator<Coffee> = (coffee) => ({
  ...coffee,
  cost: coffee.cost + 0.50,
  description: `${coffee.description}, steamed milk`
});

const withSugar: Decorator<Coffee> = (coffee) => ({
  ...coffee,
  cost: coffee.cost + 0.25,
  description: `${coffee.description}, sugar`
});

const withWhip: Decorator<Coffee> = (coffee) => ({
  ...coffee,
  cost: coffee.cost + 0.75,
  description: `${coffee.description}, whipped cream`
});

const withVanilla: Decorator<Coffee> = (coffee) => ({
  ...coffee,
  cost: coffee.cost + 0.60,
  description: `${coffee.description}, vanilla syrup`
});

// Example 2: Function enhancement decorators
const withTiming = <T extends (...args: any[]) => any>(fn: T): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`⏱️ Function executed in ${(end - start).toFixed(2)}ms`);
    return result;
  }) as T;
};

const withLogging = <T extends (...args: any[]) => any>(fn: T): T => {
  return ((...args: any[]) => {
    console.log(`📝 Calling function with args:`, args);
    const result = fn(...args);
    console.log(`📝 Function returned:`, result);
    return result;
  }) as T;
};

const withRetry = (maxAttempts: number = 3) => 
  <T extends (...args: any[]) => any>(fn: T): T => {
    return ((...args: any[]) => {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return fn(...args);
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxAttempts) {
            console.log(`🔄 Attempt ${attempt} failed, retrying...`);
          }
        }
      }
      
      throw lastError!;
    }) as T;
  };

const withMemoization = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, any>();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log(`💾 Cache hit for key: ${key}`);
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    console.log(`💿 Cached result for key: ${key}`);
    return result;
  }) as T;
};

// Example 3: Data object decorators
type User = {
  id: string;
  name: string;
  email: string;
};

const withTimestamp = <T extends object>(obj: T) => ({
  ...obj,
  createdAt: new Date(),
  updatedAt: new Date()
});

const withValidation = <T extends object>(obj: T) => ({
  ...obj,
  isValid: true,
  validatedAt: new Date()
});

const withMetadata = (metadata: Record<string, any>) => 
  <T extends object>(obj: T) => ({
    ...obj,
    metadata
  });

const withAudit = (action: string, userId: string) =>
  <T extends object>(obj: T) => ({
    ...obj,
    audit: {
      action,
      userId,
      timestamp: new Date()
    }
  });

// Example 4: HTTP Response decorators
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

const withSuccessFlag = <T>(response: ApiResponse<T>) => ({
  ...response,
  success: response.status >= 200 && response.status < 300
});

const withPagination = (page: number, limit: number, total: number) =>
  <T>(response: ApiResponse<T[]>) => ({
    ...response,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });

const withCaching = (ttl: number) =>
  <T>(response: ApiResponse<T>) => ({
    ...response,
    cache: {
      ttl,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttl
    }
  });

// Demonstration functions
function demonstrateCoffeeDecorators(): void {
  console.log("☕ COFFEE DECORATOR DEMONSTRATION");
  console.log("=" + "=".repeat(35));
  
  // Create different coffee combinations
  const simpleCoffee = baseCoffee;
  const milkCoffee = withMilk(baseCoffee);
  const fancyCoffee = pipe(baseCoffee, withMilk, withSugar, withWhip, withVanilla);
  
  console.log("Coffee variations:");
  console.log(`  Simple: ${simpleCoffee.description} - $${simpleCoffee.cost.toFixed(2)}`);
  console.log(`  With milk: ${milkCoffee.description} - $${milkCoffee.cost.toFixed(2)}`);
  console.log(`  Fancy: ${fancyCoffee.description} - $${fancyCoffee.cost.toFixed(2)}`);
  
  // Show composition flexibility
  const customOrder = pipe(
    baseCoffee,
    withVanilla,
    withMilk,
    withWhip
  );
  console.log(`  Custom: ${customOrder.description} - $${customOrder.cost.toFixed(2)}`);
  
  console.log();
}

function demonstrateFunctionDecorators(): void {
  console.log("🔧 FUNCTION DECORATOR DEMONSTRATION");
  console.log("=" + "=".repeat(37));
  
  // Base functions to enhance
  const add = (a: number, b: number): number => a + b;
  const fibonacci = (n: number): number => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  };
  
  // Create enhanced versions
  const enhancedAdd = pipe(
    add,
    withLogging,
    withTiming
  );
  
  const enhancedFibonacci = pipe(
    fibonacci,
    withMemoization,
    withTiming
  );
  
  console.log("Testing enhanced add function:");
  const sum = enhancedAdd(5, 3);
  console.log(`Result: ${sum}`);
  
  console.log("\nTesting enhanced fibonacci function:");
  const fib10 = enhancedFibonacci(10);
  console.log(`Fibonacci(10): ${fib10}`);
  
  // Test memoization
  console.log("\nTesting memoization (second call):");
  const fib10Again = enhancedFibonacci(10);
  console.log(`Fibonacci(10) again: ${fib10Again}`);
  
  console.log();
}

function demonstrateDataDecorators(): void {
  console.log("📄 DATA OBJECT DECORATORS");
  console.log("=" + "=".repeat(27));
  
  const user: User = {
    id: "user123",
    name: "John Doe",
    email: "john@example.com"
  };
  
  // Apply different decorator combinations
  const basicUser = withTimestamp(user);
  const validatedUser = pipe(
    user,
    withTimestamp,
    withValidation
  );
  
  const auditedUser = pipe(
    user,
    withTimestamp,
    withValidation,
    withMetadata({ source: "api", version: "1.0" }),
    withAudit("create", "admin123")
  );
  
  console.log("User object variations:");
  console.log("  Basic user:", { ...basicUser, createdAt: "[Date]", updatedAt: "[Date]" });
  console.log("  Validated user:", { 
    ...validatedUser, 
    createdAt: "[Date]", 
    updatedAt: "[Date]",
    validatedAt: "[Date]"
  });
  console.log("  Audited user keys:", Object.keys(auditedUser));
  
  console.log();
}

function demonstrateApiResponseDecorators(): void {
  console.log("🌐 API RESPONSE DECORATORS");
  console.log("=" + "=".repeat(29));
  
  const baseResponse: ApiResponse<string[]> = {
    data: ["item1", "item2", "item3", "item4", "item5"],
    status: 200,
    message: "Success"
  };
  
  // Apply different decorator combinations
  const successResponse = withSuccessFlag(baseResponse);
  
  const paginatedResponse = pipe(
    baseResponse,
    withSuccessFlag,
    withPagination(1, 3, 10)
  );
  
  const cachedResponse = pipe(
    baseResponse,
    withSuccessFlag,
    withPagination(1, 3, 10),
    withCaching(300000) // 5 minutes
  );
  
  console.log("API response variations:");
  console.log("  Success response:", { ...successResponse, data: "[Array]" });
  console.log("  Paginated response:", { 
    ...paginatedResponse, 
    data: "[Array]",
    pagination: (paginatedResponse as any).pagination
  });
  console.log("  Cached response keys:", Object.keys(cachedResponse));
  
  console.log();
}

function demonstrateConditionalDecorators(): void {
  console.log("🔀 CONDITIONAL DECORATORS");
  console.log("=" + "=".repeat(27));
  
  // Conditional decorator utility
  const when = <T>(condition: boolean, decorator: Decorator<T>): Decorator<T> =>
    condition ? decorator : (value: T) => value;
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Create environment-specific decorators
  const withDevInfo = when(
    isDevelopment,
    (obj: any) => ({
      ...obj,
      debug: {
        timestamp: Date.now(),
        environment: 'development'
      }
    })
  );
  
  const withProdOptimizations = when(
    isProduction,
    (obj: any) => ({
      ...obj,
      optimized: true,
      compressed: true
    })
  );
  
  const testData = { message: "Hello World" };
  const decoratedData = pipe(
    testData,
    withDevInfo,
    withProdOptimizations
  );
  
  console.log("Conditional decoration result:");
  console.log("  Original:", testData);
  console.log("  Decorated:", decoratedData);
  console.log("  Environment:", process.env.NODE_ENV || 'not set');
  
  console.log();
}

function demonstrateAsyncDecorators(): void {
  console.log("⏳ ASYNC DECORATORS");
  console.log("=" + "=".repeat(19));
  
  // Async decorator type
  type AsyncDecorator<T> = (input: T) => Promise<T>;
  
  const withAsyncLogging: AsyncDecorator<any> = async (obj) => {
    console.log("📡 Async logging started...");
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("📡 Async logging completed");
    return obj;
  };
  
  const withAsyncValidation: AsyncDecorator<{ id: string }> = async (obj) => {
    console.log("🔍 Async validation started...");
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (obj.id.length === 0) {
      throw new Error("Invalid ID");
    }
    
    console.log("✅ Async validation passed");
    return { ...obj, validated: true };
  };
  
  // Async pipe utility
  const asyncPipe = async <T>(
    value: T,
    ...decorators: Array<Decorator<T> | AsyncDecorator<T>>
  ): Promise<T> => {
    let result = value;
    for (const decorator of decorators) {
      result = await decorator(result);
    }
    return result;
  };
  
  // Note: This would normally be async, but for demo we'll just show the setup
  console.log("Async decorator setup completed");
  console.log("  - withAsyncLogging: logs asynchronously");
  console.log("  - withAsyncValidation: validates asynchronously");
  console.log("  - asyncPipe: composes async decorators");
  
  console.log();
}

function showPerformanceComparison(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("=" + "=".repeat(26));
  
  const baseObj = { value: 42 };
  const decorator1 = (obj: typeof baseObj) => ({ ...obj, prop1: true });
  const decorator2 = (obj: typeof baseObj) => ({ ...obj, prop2: "test" });
  const decorator3 = (obj: typeof baseObj) => ({ ...obj, prop3: new Date() });
  
  const iterations = 100000;
  console.log(`Applying 3 decorators to ${iterations} objects...`);
  
  const startTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    pipe(baseObj, decorator1, decorator2, decorator3);
  }
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  const operationsPerSecond = Math.round((iterations / duration) * 1000);
  
  console.log(`✨ Completed ${iterations} decorations in ${duration}ms`);
  console.log(`📊 Performance: ~${operationsPerSecond} decorations/second`);
  console.log(`🏃‍♂️ Average: ${(duration / iterations).toFixed(4)}ms per decoration`);
  console.log();
  
  console.log("Key Performance Benefits:");
  console.log("• No class instantiation overhead");
  console.log("• Efficient object spread operations");
  console.log("• Optimizable function composition");
  console.log("• Minimal memory allocation per decoration");
  console.log();
}

function showUsageExamples(): void {
  console.log("💡 PRACTICAL USAGE EXAMPLES");
  console.log("=" + "=".repeat(30));
  
  console.log("1. Simple object decoration:");
  console.log(`   const enhanced = withTimestamp(originalObject);`);
  console.log();
  
  console.log("2. Function enhancement:");
  console.log(`   const enhanced = withLogging(withTiming(originalFunction));`);
  console.log();
  
  console.log("3. Pipeline composition:");
  console.log(`   const result = pipe(data, decorator1, decorator2, decorator3);`);
  console.log();
  
  console.log("4. Conditional decoration:");
  console.log(`   const decorated = when(condition, decorator)(object);`);
  console.log();
  
  console.log("5. Parameterized decorators:");
  console.log(`   const withCustomMeta = withMetadata({ type: 'user' });`);
  console.log(`   const result = withCustomMeta(userData);`);
  console.log();
}

// Main execution
function main(): void {
  console.log("🎯 DECORATOR PATTERN - FUNCTION COMPOSITION");
  console.log("=" + "=".repeat(44));
  console.log();
  console.log("This pattern replaces traditional decorator classes with higher-order");
  console.log("functions that enhance objects and functions through composition.");
  console.log();
  
  demonstrateCoffeeDecorators();
  demonstrateFunctionDecorators();
  demonstrateDataDecorators();
  demonstrateApiResponseDecorators();
  demonstrateConditionalDecorators();
  demonstrateAsyncDecorators();
  showPerformanceComparison();
  showUsageExamples();
  
  console.log("🚀 COMPREHENSIVE EXAMPLE");
  console.log("=" + "=".repeat(23));
  console.log("Run the HTTP middleware pipeline:");
  console.log("npm run functional:decorator:middleware");
  console.log();
  console.log("Key Benefits:");
  console.log("• No class hierarchies needed");
  console.log("• Immutable transformations");
  console.log("• Easy function composition");
  console.log("• Highly testable components");
  console.log("• Type-safe decorations");
}

// Run the demonstration
main();
exit(0); 