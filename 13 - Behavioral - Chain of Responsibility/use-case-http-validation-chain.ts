import { exit } from 'process';

// Request object
interface Request {
  token?: string;
  userId: string;
  endpoint: string;
  timestamp: number;
}

// Handler interface
abstract class Handler {
  protected next?: Handler;
  
  setNext(handler: Handler): Handler {
    this.next = handler;
    return handler;
  }
  
  abstract handle(request: Request): boolean;
}

// Authentication handler
class AuthHandler extends Handler {
  handle(request: Request): boolean {
    if (!request.token) {
      console.log('❌ AuthHandler: No token provided');
      return false;
    }
    console.log('✅ AuthHandler: Token validated');
    return this.next ? this.next.handle(request) : true;
  }
}

// Rate limiting handler
class RateLimitHandler extends Handler {
  private requests = new Map<string, number[]>();
  
  handle(request: Request): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(request.userId) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= 10) {
      console.log('❌ RateLimitHandler: Too many requests');
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(request.userId, recentRequests);
    console.log('✅ RateLimitHandler: Request allowed');
    return this.next ? this.next.handle(request) : true;
  }
}

// Authorization handler
class AuthorizationHandler extends Handler {
  handle(request: Request): boolean {
    if (request.endpoint.startsWith('/admin') && request.userId !== 'admin') {
      console.log('❌ AuthorizationHandler: Admin access required');
      return false;
    }
    console.log('✅ AuthorizationHandler: Access granted');
    return this.next ? this.next.handle(request) : true;
  }
}

// Demo
const auth = new AuthHandler();
const rateLimit = new RateLimitHandler();
const authorization = new AuthorizationHandler();

// Build chain
auth.setNext(rateLimit).setNext(authorization);

console.log('=== HTTP VALIDATION CHAIN DEMO ===');

// Test 1: Valid request
console.log('\n--- Test 1: Valid request ---');
const validRequest: Request = {
  token: 'valid-token',
  userId: 'user123',
  endpoint: '/api/data',
  timestamp: Date.now()
};
auth.handle(validRequest);

// Test 2: Missing token
console.log('\n--- Test 2: Missing token ---');
const invalidRequest: Request = {
  userId: 'user123',
  endpoint: '/api/data',
  timestamp: Date.now()
};
auth.handle(invalidRequest);

// Test 3: Admin access
console.log('\n--- Test 3: Admin access ---');
const adminRequest: Request = {
  token: 'valid-token',
  userId: 'admin',
  endpoint: '/admin/users',
  timestamp: Date.now()
};
auth.handle(adminRequest);

exit(0); 