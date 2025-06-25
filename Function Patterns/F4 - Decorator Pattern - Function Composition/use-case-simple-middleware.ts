/**
 * Simplified HTTP Middleware Pipeline - Function Composition
 * 
 * A working demonstration of functional middleware patterns
 */

import { exit } from "process";

// Core Types
type Request = {
  path: string;
  method: string;
  headers: Record<string, string>;
};

type Response = {
  status: number;
  body: any;
  headers: Record<string, string>;
};

type Handler = (req: Request) => Response;
type Middleware = (handler: Handler) => Handler;

// Utility for composing middleware
const pipe = (...middleware: Middleware[]): Middleware => {
  return (handler: Handler): Handler => {
    return middleware.reduceRight((acc, mw) => mw(acc), handler);
  };
};

// Logging Middleware
const withLogging: Middleware = (handler: Handler): Handler => {
  return (req: Request): Response => {
    console.log(`📝 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    const response = handler(req);
    console.log(`📤 Response: ${response.status}`);
    return response;
  };
};

// CORS Middleware
const withCors: Middleware = (handler: Handler): Handler => {
  return (req: Request): Response => {
    const response = handler(req);
    return {
      ...response,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      }
    };
  };
};

// Authentication Middleware
const withAuth: Middleware = (handler: Handler): Handler => {
  return (req: Request): Response => {
    const token = req.headers['authorization'];
    
    if (!token || token !== 'Bearer valid-token') {
      return {
        status: 401,
        body: { error: 'Unauthorized' },
        headers: { 'Content-Type': 'application/json' }
      };
    }
    
    return handler(req);
  };
};

// Response Enhancement Middleware
const withMetadata: Middleware = (handler: Handler): Handler => {
  return (req: Request): Response => {
    const response = handler(req);
    return {
      ...response,
      body: {
        ...response.body,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7)
      }
    };
  };
};

// Timing Middleware
const withTiming: Middleware = (handler: Handler): Handler => {
  return (req: Request): Response => {
    const start = Date.now();
    const response = handler(req);
    const duration = Date.now() - start;
    
    console.log(`⏱️ Request took ${duration}ms`);
    
    return {
      ...response,
      headers: {
        ...response.headers,
        'X-Response-Time': `${duration}ms`
      }
    };
  };
};

// Sample Handler
const userHandler: Handler = (req: Request): Response => {
  const userId = req.path.split('/').pop();
  return {
    status: 200,
    body: {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com'
    },
    headers: { 'Content-Type': 'application/json' }
  };
};

// Demonstrations
function demonstrateBasicPipeline(): void {
  console.log("🔗 BASIC PIPELINE DEMONSTRATION");
  console.log("=" + "=".repeat(33));
  
  // Simple pipeline with logging and CORS
  const basicPipeline = pipe(withLogging, withCors);
  const enhancedHandler = basicPipeline(userHandler);
  
  const request: Request = {
    method: 'GET',
    path: '/api/users/123',
    headers: { 'user-agent': 'test-client' }
  };
  
  console.log("Testing basic pipeline...");
  const response = enhancedHandler(request);
  console.log("✅ Response:", {
    status: response.status,
    body: response.body,
    corsHeaders: {
      'Access-Control-Allow-Origin': response.headers['Access-Control-Allow-Origin']
    }
  });
  console.log();
}

function demonstrateAuthPipeline(): void {
  console.log("🔐 AUTHENTICATION PIPELINE");
  console.log("=" + "=".repeat(28));
  
  // Pipeline with authentication
  const authPipeline = pipe(withLogging, withAuth, withCors);
  const secureHandler = authPipeline(userHandler);
  
  // Test unauthorized request
  console.log("Testing unauthorized request...");
  const unauthorizedRequest: Request = {
    method: 'GET',
    path: '/api/users/123',
    headers: { 'user-agent': 'test-client' }
  };
  
  const unauthorizedResponse = secureHandler(unauthorizedRequest);
  console.log("❌ Unauthorized response:", unauthorizedResponse.status, unauthorizedResponse.body);
  
  // Test authorized request
  console.log("\nTesting authorized request...");
  const authorizedRequest: Request = {
    method: 'GET',
    path: '/api/users/123',
    headers: { 
      'user-agent': 'test-client',
      'authorization': 'Bearer valid-token'
    }
  };
  
  const authorizedResponse = secureHandler(authorizedRequest);
  console.log("✅ Authorized response:", authorizedResponse.status, authorizedResponse.body);
  console.log();
}

function demonstrateFullPipeline(): void {
  console.log("🚀 COMPREHENSIVE PIPELINE");
  console.log("=" + "=".repeat(28));
  
  // Full pipeline with all middleware
  const fullPipeline = pipe(
    withTiming,
    withLogging,
    withAuth,
    withCors,
    withMetadata
  );
  
  const fullHandler = fullPipeline(userHandler);
  
  const request: Request = {
    method: 'GET',
    path: '/api/users/456',
    headers: { 
      'user-agent': 'test-client',
      'authorization': 'Bearer valid-token'
    }
  };
  
  console.log("Testing comprehensive pipeline...");
  const response = fullHandler(request);
  console.log("✅ Full response:", {
    status: response.status,
    body: response.body,
    responseTime: response.headers['X-Response-Time'],
    cors: response.headers['Access-Control-Allow-Origin']
  });
  console.log();
}

function demonstrateComposition(): void {
  console.log("🔧 MIDDLEWARE COMPOSITION");
  console.log("=" + "=".repeat(27));
  
  console.log("1. Individual middleware:");
  console.log("   withLogging: adds request/response logging");
  console.log("   withAuth: validates authorization tokens");
  console.log("   withCors: adds CORS headers");
  console.log("   withMetadata: enhances response with metadata");
  console.log("   withTiming: measures and reports request duration");
  console.log();
  
  console.log("2. Composition patterns:");
  console.log("   Basic: pipe(withLogging, withCors)");
  console.log("   Secure: pipe(withLogging, withAuth, withCors)");
  console.log("   Full: pipe(withTiming, withLogging, withAuth, withCors, withMetadata)");
  console.log();
  
  console.log("3. Composition benefits:");
  console.log("   • Easy to add/remove middleware");
  console.log("   • Clear execution order (left to right)");
  console.log("   • Individual middleware is testable");
  console.log("   • No class hierarchies needed");
  console.log("   • Immutable request/response objects");
  console.log();
}

function showPerformanceComparison(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("=" + "=".repeat(26));
  
  const testRequest: Request = {
    method: 'GET',
    path: '/api/test',
    headers: { 'authorization': 'Bearer valid-token' }
  };
  
  const iterations = 100000;
  
  // Test plain handler
  const start1 = Date.now();
  for (let i = 0; i < iterations; i++) {
    userHandler(testRequest);
  }
  const plainDuration = Date.now() - start1;
  
  // Test with middleware
  const enhancedHandler = pipe(withAuth, withCors, withMetadata)(userHandler);
  
  const start2 = Date.now();
  for (let i = 0; i < iterations; i++) {
    enhancedHandler(testRequest);
  }
  const middlewareDuration = Date.now() - start2;
  
  const plainReqPerSec = Math.round((iterations / plainDuration) * 1000);
  const middlewareReqPerSec = Math.round((iterations / middlewareDuration) * 1000);
  const overhead = ((middlewareDuration - plainDuration) / plainDuration * 100).toFixed(2);
  
  console.log(`Plain handler: ${plainDuration}ms (~${plainReqPerSec} req/sec)`);
  console.log(`With middleware: ${middlewareDuration}ms (~${middlewareReqPerSec} req/sec)`);
  console.log(`Overhead: ${overhead}% (${middlewareDuration - plainDuration}ms)`);
  console.log();
  
  console.log("Performance benefits:");
  console.log("• No class instantiation overhead");
  console.log("• Direct function composition");
  console.log("• Minimal memory allocation");
  console.log("• Predictable execution pattern");
  console.log();
}

function showKeyBenefits(): void {
  console.log("💡 KEY BENEFITS OF FUNCTIONAL MIDDLEWARE");
  console.log("=" + "=".repeat(42));
  
  console.log("1. Composability:");
  console.log("   • Easy to combine middleware in different orders");
  console.log("   • Clear, declarative pipeline definition");
  console.log("   • Reusable middleware components");
  console.log();
  
  console.log("2. Immutability:");
  console.log("   • Request/response objects are never mutated");
  console.log("   • Predictable data flow through the pipeline");
  console.log("   • No side effects between middleware");
  console.log();
  
  console.log("3. Testability:");
  console.log("   • Each middleware is a pure function");
  console.log("   • Easy to test individual components");
  console.log("   • No complex mocking required");
  console.log();
  
  console.log("4. Type Safety:");
  console.log("   • Full TypeScript support");
  console.log("   • Compile-time guarantees");
  console.log("   • Clear input/output contracts");
  console.log();
  
  console.log("5. Performance:");
  console.log("   • No class hierarchies or inheritance");
  console.log("   • Direct function calls");
  console.log("   • Minimal runtime overhead");
  console.log();
}

// Main execution
function main(): void {
  console.log("🎯 FUNCTIONAL MIDDLEWARE PIPELINE DEMONSTRATION");
  console.log("=" + "=".repeat(49));
  console.log();
  console.log("This demonstrates how to build HTTP middleware using");
  console.log("function composition instead of traditional OOP patterns.");
  console.log();
  
  demonstrateBasicPipeline();
  demonstrateAuthPipeline();
  demonstrateFullPipeline();
  demonstrateComposition();
  showPerformanceComparison();
  showKeyBenefits();
  
  console.log("🎉 CONCLUSION");
  console.log("=" + "=".repeat(13));
  console.log("Functional middleware provides a clean, composable,");
  console.log("and performant alternative to traditional class-based");
  console.log("middleware systems with better testability and type safety.");
}

// Run the demonstration
main();
exit(0); 