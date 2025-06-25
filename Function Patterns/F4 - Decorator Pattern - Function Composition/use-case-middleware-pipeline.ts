/**
 * Use Case: HTTP Middleware Pipeline with Function Composition
 * 
 * This implementation demonstrates how to build a complete HTTP middleware
 * system using functional decorators and composition instead of traditional
 * class-based middleware patterns.
 */

import { exit } from "process";

// Core Types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

type HttpRequest = {
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: any;
  user?: User;
  timestamp?: number;
  id?: string;
};

type HttpResponse = {
  status: number;
  headers: Record<string, string>;
  body: any;
  timestamp?: number;
  duration?: number;
};

type User = {
  id: string;
  username: string;
  roles: string[];
};

type Handler = (req: HttpRequest) => HttpResponse | Promise<HttpResponse>;
type Middleware = (handler: Handler) => Handler;

// Utility for async pipe composition
const asyncPipe = async <T>(
  value: T,
  ...functions: Array<(input: T) => T | Promise<T>>
): Promise<T> => {
  let result = value;
  for (const fn of functions) {
    result = await fn(result);
  }
  return result;
};

// Standard pipe for synchronous composition
const pipe = <T>(value: T, ...functions: Array<(input: T) => T>): T =>
  functions.reduce((acc, fn) => fn(acc), value);

// Core Middleware Components

// 1. Logging Middleware
const createLoggingMiddleware = (options: {
  level?: 'debug' | 'info' | 'warn' | 'error';
  includeBody?: boolean;
  includeHeaders?: boolean;
} = {}): Middleware => {
  const { level = 'info', includeBody = false, includeHeaders = false } = options;
  
  return (handler: Handler): Handler => {
    return async (req: HttpRequest) => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(7);
      
      // Log request
      const logData: any = {
        id: requestId,
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
      };
      
      if (includeHeaders) logData.headers = req.headers;
      if (includeBody && req.body) logData.body = req.body;
      
      console.log(`[${level.toUpperCase()}] Request:`, logData);
      
      try {
        // Enhanced request with ID and timestamp
        const enhancedReq = {
          ...req,
          id: requestId,
          timestamp: startTime
        };
        
        const response = await handler(enhancedReq);
        const duration = Date.now() - startTime;
        
        // Log response
        console.log(`[${level.toUpperCase()}] Response:`, {
          id: requestId,
          status: response.status,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });
        
        return {
          ...response,
          duration
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[ERROR] Request failed:`, {
          id: requestId,
          error: (error as Error).message,
          duration: `${duration}ms`
        });
        throw error;
      }
    };
  };
};

// 2. Authentication Middleware
const createAuthMiddleware = (options: {
  secret: string;
  validateToken?: (token: string) => User | null;
  skipPaths?: string[];
}): Middleware => {
  const { secret, validateToken, skipPaths = [] } = options;
  
  // Mock token validation
  const defaultValidateToken = (token: string): User | null => {
    if (token === `Bearer ${secret}`) {
      return {
        id: 'user123',
        username: 'john_doe',
        roles: ['user', 'admin']
      };
    }
    return null;
  };
  
  const tokenValidator = validateToken || defaultValidateToken;
  
  return (handler: Handler): Handler => {
    return async (req: HttpRequest) => {
      // Skip authentication for certain paths
      if (skipPaths.some(path => req.path.startsWith(path))) {
        return await handler(req);
      }
      
      const authHeader = req.headers['authorization'];
      
      if (!authHeader) {
        return {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Authorization header required' }
        };
      }
      
      const user = tokenValidator(authHeader);
      
      if (!user) {
        return {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Invalid or expired token' }
        };
      }
      
      // Add user to request
      const authenticatedReq = {
        ...req,
        user
      };
      
      return await handler(authenticatedReq);
    };
  };
};

// 3. CORS Middleware
const createCorsMiddleware = (options: {
  origin?: string | string[];
  methods?: HttpMethod[];
  allowedHeaders?: string[];
  credentials?: boolean;
} = {}): Middleware => {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = false
  } = options;
  
  return (handler: Handler): Handler => {
    return async (req: HttpRequest) => {
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        const corsHeaders: Record<string, string> = {
          'Access-Control-Allow-Origin': Array.isArray(origin) ? origin.join(', ') : origin,
          'Access-Control-Allow-Methods': methods.join(', '),
          'Access-Control-Allow-Headers': allowedHeaders.join(', '),
          'Access-Control-Allow-Credentials': credentials.toString(),
          'Access-Control-Max-Age': '86400'
        };
        
        return {
          status: 200,
          headers: corsHeaders,
          body: null
        };
      }
      
      const response = await handler(req);
      
      // Add CORS headers to response
      const corsHeaders: Record<string, string> = {
        'Access-Control-Allow-Origin': Array.isArray(origin) ? origin.join(', ') : origin,
        'Access-Control-Allow-Credentials': credentials.toString()
      };
      
      return {
        ...response,
        headers: {
          ...response.headers,
          ...corsHeaders
        }
      };
    };
  };
};

// 4. Rate Limiting Middleware
const createRateLimitMiddleware = (options: {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: HttpRequest) => string;
  skipPaths?: string[];
}): Middleware => {
  const { maxRequests, windowMs, keyGenerator, skipPaths = [] } = options;
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  const defaultKeyGenerator = (req: HttpRequest): string => {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           'unknown';
  };
  
  const getKey = keyGenerator || defaultKeyGenerator;
  
  return (handler: Handler): Handler => {
    return async (req: HttpRequest) => {
      // Skip rate limiting for certain paths
      if (skipPaths.some(path => req.path.startsWith(path))) {
        return await handler(req);
      }
      
      const key = getKey(req);
      const now = Date.now();
      const record = requestCounts.get(key);
      
      if (!record || now > record.resetTime) {
        requestCounts.set(key, {
          count: 1,
          resetTime: now + windowMs
        });
        return await handler(req);
      }
      
      if (record.count >= maxRequests) {
        return {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': record.resetTime.toString()
          },
          body: { error: 'Too many requests' }
        };
      }
      
      record.count++;
      const response = await handler(req);
      
      return {
        ...response,
        headers: {
          ...response.headers,
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': (maxRequests - record.count).toString(),
          'X-RateLimit-Reset': record.resetTime.toString()
        }
      };
    };
  };
};

// 5. Input Validation Middleware
const createValidationMiddleware = (options: {
  validateHeaders?: (headers: Record<string, string>) => boolean;
  validateBody?: (body: any) => boolean;
  validateQuery?: (query: Record<string, string>) => boolean;
}): Middleware => {
  const { validateHeaders, validateBody, validateQuery } = options;
  
  return (handler: Handler): Handler => {
    return async (req: HttpRequest) => {
      // Validate headers
      if (validateHeaders && !validateHeaders(req.headers)) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Invalid headers' }
        };
      }
      
      // Validate query parameters
      if (validateQuery && !validateQuery(req.query)) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Invalid query parameters' }
        };
      }
      
      // Validate body
      if (validateBody && req.body && !validateBody(req.body)) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Invalid request body' }
        };
      }
      
      return await handler(req);
    };
  };
};

// 6. Error Handling Middleware
const createErrorHandlingMiddleware = (options: {
  includeStack?: boolean;
  logger?: (error: Error, req: HttpRequest) => void;
} = {}): Middleware => {
  const { includeStack = false, logger } = options;
  
  return (handler: Handler): Handler => {
    return async (req: HttpRequest) => {
      try {
        return await handler(req);
      } catch (error) {
        const err = error as Error;
        
        // Log error if logger provided
        if (logger) {
          logger(err, req);
        } else {
          console.error('Request error:', {
            message: err.message,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
          });
        }
        
        // Return error response
        return {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: {
            error: 'Internal server error',
            message: err.message,
            ...(includeStack && { stack: err.stack })
          }
        };
      }
    };
  };
};

// 7. Response Caching Middleware
const createCachingMiddleware = (options: {
  ttl: number;
  keyGenerator?: (req: HttpRequest) => string;
  shouldCache?: (req: HttpRequest, res: HttpResponse) => boolean;
}): Middleware => {
  const { ttl, keyGenerator, shouldCache } = options;
  const cache = new Map<string, { response: HttpResponse; expiresAt: number }>();
  
  const defaultKeyGenerator = (req: HttpRequest): string => {
    return `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
  };
  
  const defaultShouldCache = (req: HttpRequest, res: HttpResponse): boolean => {
    return req.method === 'GET' && res.status === 200;
  };
  
  const getKey = keyGenerator || defaultKeyGenerator;
  const canCache = shouldCache || defaultShouldCache;
  
  return (handler: Handler): Handler => {
    return async (req: HttpRequest) => {
      const key = getKey(req);
      const now = Date.now();
      
      // Check cache
      const cached = cache.get(key);
      if (cached && now < cached.expiresAt) {
        console.log(`💾 Cache hit for key: ${key}`);
        return {
          ...cached.response,
          headers: {
            ...cached.response.headers,
            'X-Cache': 'HIT'
          }
        };
      }
      
      const response = await handler(req);
      
      // Cache response if eligible
      if (canCache(req, response)) {
        cache.set(key, {
          response: { ...response },
          expiresAt: now + ttl
        });
        console.log(`💿 Cached response for key: ${key}`);
      }
      
      return {
        ...response,
        headers: {
          ...response.headers,
          'X-Cache': 'MISS'
        }
      };
    };
  };
};

// Pipeline Composition Utilities
const createPipeline = (...middleware: Middleware[]): Middleware => {
  return (handler: Handler): Handler => {
    return middleware.reduceRight((acc, mw) => mw(acc), handler);
  };
};

// Sample Handlers
const createSampleHandlers = () => {
  const getUserHandler: Handler = async (req: HttpRequest) => {
    const userId = req.path.split('/').pop();
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        requestedBy: req.user?.username || 'anonymous'
      }
    };
  };
  
  const createUserHandler: Handler = async (req: HttpRequest) => {
    if (!req.body || !req.body.name || !req.body.email) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Name and email are required' }
      };
    }
    
    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: {
        id: Math.random().toString(36),
        name: req.body.name,
        email: req.body.email,
        createdBy: req.user?.username || 'anonymous'
      }
    };
  };
  
  const errorHandler: Handler = async (req: HttpRequest) => {
    throw new Error('Simulated error for testing');
  };
  
  return { getUserHandler, createUserHandler, errorHandler };
};

// Demonstration Functions
async function demonstrateBasicPipeline(): Promise<void> {
  console.log("🔗 BASIC MIDDLEWARE PIPELINE");
  console.log("=" + "=".repeat(30));
  
  const { getUserHandler } = createSampleHandlers();
  
  // Create middleware
  const logging = createLoggingMiddleware({ level: 'info' });
  const cors = createCorsMiddleware();
  
  // Compose pipeline
  const pipeline = createPipeline(logging, cors);
  const enhancedHandler = pipeline(getUserHandler);
  
  // Test request
  const request: HttpRequest = {
    method: 'GET',
    path: '/api/users/123',
    headers: { 'user-agent': 'test-client' },
    query: {}
  };
  
  console.log("Testing basic pipeline...");
  const response = await enhancedHandler(request);
  console.log("Response:", { ...response, body: JSON.stringify(response.body) });
  console.log();
}

async function demonstrateAuthenticationPipeline(): Promise<void> {
  console.log("🔐 AUTHENTICATION PIPELINE");
  console.log("=" + "=".repeat(28));
  
  const { getUserHandler } = createSampleHandlers();
  
  // Create middleware
  const logging = createLoggingMiddleware({ level: 'info' });
  const auth = createAuthMiddleware({ 
    secret: 'secret-key',
    skipPaths: ['/api/public']
  });
  const cors = createCorsMiddleware();
  
  // Compose pipeline
  const pipeline = createPipeline(logging, cors, auth);
  const enhancedHandler = pipeline(getUserHandler);
  
  // Test unauthorized request
  console.log("Testing unauthorized request...");
  const unauthorizedRequest: HttpRequest = {
    method: 'GET',
    path: '/api/users/123',
    headers: { 'user-agent': 'test-client' },
    query: {}
  };
  
  const unauthorizedResponse = await enhancedHandler(unauthorizedRequest);
  console.log("Unauthorized response:", unauthorizedResponse.status, unauthorizedResponse.body);
  
  // Test authorized request
  console.log("\nTesting authorized request...");
  const authorizedRequest: HttpRequest = {
    method: 'GET',
    path: '/api/users/123',
    headers: { 
      'user-agent': 'test-client',
      'authorization': 'Bearer secret-key'
    },
    query: {}
  };
  
  const authorizedResponse = await enhancedHandler(authorizedRequest);
  console.log("Authorized response:", authorizedResponse.status, JSON.stringify(authorizedResponse.body));
  console.log();
}

async function demonstrateRateLimitingPipeline(): Promise<void> {
  console.log("⏱️ RATE LIMITING PIPELINE");
  console.log("=" + "=".repeat(27));
  
  const { getUserHandler } = createSampleHandlers();
  
  // Create middleware
  const logging = createLoggingMiddleware({ level: 'info' });
  const rateLimit = createRateLimitMiddleware({
    maxRequests: 3,
    windowMs: 60000, // 1 minute
    keyGenerator: (req) => req.headers['x-client-id'] || 'default'
  });
  
  // Compose pipeline
  const pipeline = createPipeline(logging, rateLimit);
  const enhancedHandler = pipeline(getUserHandler);
  
  // Test multiple requests
  const request: HttpRequest = {
    method: 'GET',
    path: '/api/users/123',
    headers: { 
      'user-agent': 'test-client',
      'x-client-id': 'client-123'
    },
    query: {}
  };
  
  console.log("Testing rate limiting (max 3 requests)...");
  
  for (let i = 1; i <= 5; i++) {
    console.log(`\nRequest ${i}:`);
    const response = await enhancedHandler(request);
    console.log(`Status: ${response.status}`);
    if (response.status === 429) {
      console.log(`Rate limited! Retry after: ${response.headers['Retry-After']}s`);
    }
  }
  console.log();
}

async function demonstrateFullPipeline(): Promise<void> {
  console.log("🚀 COMPREHENSIVE PIPELINE");
  console.log("=" + "=".repeat(28));
  
  const { createUserHandler, errorHandler } = createSampleHandlers();
  
  // Create all middleware
  const logging = createLoggingMiddleware({ 
    level: 'info', 
    includeBody: true 
  });
  
  const errorHandling = createErrorHandlingMiddleware({ 
    includeStack: false 
  });
  
  const cors = createCorsMiddleware({
    origin: ['http://localhost:3000', 'https://app.example.com'],
    credentials: true
  });
  
  const auth = createAuthMiddleware({ 
    secret: 'secret-key',
    skipPaths: ['/api/public', '/api/health']
  });
  
  const validation = createValidationMiddleware({
    validateBody: (body) => {
      return body && typeof body.name === 'string' && typeof body.email === 'string';
    }
  });
  
  const caching = createCachingMiddleware({
    ttl: 300000, // 5 minutes
    shouldCache: (req, res) => req.method === 'GET' && res.status === 200
  });
  
  const rateLimit = createRateLimitMiddleware({
    maxRequests: 10,
    windowMs: 60000
  });
  
  // Compose comprehensive pipeline
  const pipeline = createPipeline(
    errorHandling, // Error handling should be outermost
    logging,
    cors,
    rateLimit,
    auth,
    validation,
    caching
  );
  
  const enhancedHandler = pipeline(createUserHandler);
  
  // Test successful request
  console.log("Testing successful request...");
  const successRequest: HttpRequest = {
    method: 'POST',
    path: '/api/users',
    headers: {
      'user-agent': 'test-client',
      'authorization': 'Bearer secret-key',
      'content-type': 'application/json'
    },
    query: {},
    body: {
      name: 'Jane Doe',
      email: 'jane@example.com'
    }
  };
  
  const successResponse = await enhancedHandler(successRequest);
  console.log("Success response:", successResponse.status, JSON.stringify(successResponse.body));
  
  // Test validation error
  console.log("\nTesting validation error...");
  const invalidRequest: HttpRequest = {
    ...successRequest,
    body: { name: 'Invalid User' } // Missing email
  };
  
  const validationResponse = await enhancedHandler(invalidRequest);
  console.log("Validation response:", validationResponse.status, JSON.stringify(validationResponse.body));
  
  // Test error handling
  console.log("\nTesting error handling...");
  const errorPipeline = createPipeline(errorHandling, logging);
  const errorHandlerEnhanced = errorPipeline(errorHandler);
  
  const errorRequest: HttpRequest = {
    method: 'GET',
    path: '/api/error',
    headers: { 'user-agent': 'test-client' },
    query: {}
  };
  
  const errorResponse = await errorHandlerEnhanced(errorRequest);
  console.log("Error response:", errorResponse.status, JSON.stringify(errorResponse.body));
  console.log();
}

function showPerformanceComparison(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("=" + "=".repeat(26));
  
  const simpleHandler: Handler = (req) => ({
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { message: 'Hello World' }
  });
  
  const simpleRequest: HttpRequest = {
    method: 'GET',
    path: '/api/test',
    headers: { 'user-agent': 'benchmark' },
    query: {}
  };
  
  // Test plain handler
  const iterations = 10000;
  console.log(`Running ${iterations} requests...`);
  
  const startTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    simpleHandler(simpleRequest);
  }
  const plainDuration = Date.now() - startTime;
  
  // Test with middleware pipeline
  const logging = createLoggingMiddleware({ level: 'info' });
  const cors = createCorsMiddleware();
  const pipeline = createPipeline(logging, cors);
  const enhancedHandler = pipeline(simpleHandler);
  
  // Temporarily disable console.log for benchmarking
  const originalLog = console.log;
  console.log = () => {};
  
  const middlewareStartTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    enhancedHandler(simpleRequest);
  }
  const middlewareDuration = Date.now() - middlewareStartTime;
  
  // Restore console.log
  console.log = originalLog;
  
  const plainRequestsPerSecond = Math.round((iterations / plainDuration) * 1000);
  const middlewareRequestsPerSecond = Math.round((iterations / middlewareDuration) * 1000);
  const overhead = ((middlewareDuration - plainDuration) / plainDuration * 100).toFixed(2);
  
  console.log(`✨ Plain handler: ${plainDuration}ms (~${plainRequestsPerSecond} req/s)`);
  console.log(`🔗 With middleware: ${middlewareDuration}ms (~${middlewareRequestsPerSecond} req/s)`);
  console.log(`📊 Overhead: ${overhead}% (${middlewareDuration - plainDuration}ms)`);
  console.log();
  
  console.log("Performance Benefits:");
  console.log("• Function composition is highly optimizable");
  console.log("• No class instantiation overhead");
  console.log("• Minimal memory allocation per request");
  console.log("• Predictable performance characteristics");
  console.log();
}

function showArchitecturalBenefits(): void {
  console.log("🏗️ ARCHITECTURAL BENEFITS");
  console.log("=" + "=".repeat(27));
  
  console.log("1. Composability:");
  console.log("   • Easy to add, remove, or reorder middleware");
  console.log("   • Clean separation of concerns");
  console.log("   • Reusable middleware components");
  console.log();
  
  console.log("2. Testability:");
  console.log("   • Each middleware can be tested in isolation");
  console.log("   • Easy to mock dependencies");
  console.log("   • Predictable input/output contracts");
  console.log();
  
  console.log("3. Type Safety:");
  console.log("   • Full TypeScript support with inference");
  console.log("   • Compile-time guarantees about middleware compatibility");
  console.log("   • Clear request/response type contracts");
  console.log();
  
  console.log("4. Immutability:");
  console.log("   • Request/response objects are never mutated");
  console.log("   • Predictable data flow through pipeline");
  console.log("   • Easier debugging and reasoning about state");
  console.log();
  
  console.log("5. Performance:");
  console.log("   • No class hierarchies or complex inheritance");
  console.log("   • Optimizable function composition");
  console.log("   • Minimal runtime overhead");
  console.log();
}

// Main execution
async function main(): Promise<void> {
  console.log("🌐 HTTP MIDDLEWARE PIPELINE - FUNCTION COMPOSITION");
  console.log("=" + "=".repeat(52));
  console.log();
  console.log("Demonstrating how to build a complete HTTP middleware system");
  console.log("using functional decorators and composition patterns.");
  console.log();
  
  await demonstrateBasicPipeline();
  await demonstrateAuthenticationPipeline();
  await demonstrateRateLimitingPipeline();
  await demonstrateFullPipeline();
  
  showPerformanceComparison();
  showArchitecturalBenefits();
  
  console.log("🎯 KEY TAKEAWAYS");
  console.log("=" + "=".repeat(17));
  console.log("• Middleware as pure functions provides better composability");
  console.log("• Immutable request/response objects prevent side effects");
  console.log("• Function composition is more flexible than class inheritance");
  console.log("• Each middleware component is easily testable in isolation");
  console.log("• TypeScript provides excellent type safety throughout the pipeline");
  console.log("• Performance is excellent with minimal overhead");
  console.log();
  
  console.log("This functional approach to middleware provides a clean,");
  console.log("testable, and performant alternative to traditional");
  console.log("class-based middleware systems.");
}

// Run the demonstration
main().catch(console.error);
exit(0); 