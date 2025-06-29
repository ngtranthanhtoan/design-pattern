import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface AuthenticationCredentials {
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  sessionId?: string;
  twoFactorCode?: string;
}

interface AuthenticationResult {
  success: boolean;
  user?: User;
  token?: string;
  sessionId?: string;
  expiresAt?: Date;
  message: string;
  securityLevel: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  expiresAt?: Date;
}

interface RefreshResult {
  success: boolean;
  newToken?: string;
  expiresAt?: Date;
  message: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin: Date;
  isActive: boolean;
}

interface AuthenticationStrategy {
  authenticate(credentials: AuthenticationCredentials): AuthenticationResult;
  validate(token: string): ValidationResult;
  refresh(token: string): RefreshResult;
  getDescription(): string;
  getSecurityLevel(): 'low' | 'medium' | 'high';
  getSupportedFeatures(): string[];
  isEnabled(): boolean;
}

// ============================================================================
// CONCRETE STRATEGIES
// ============================================================================

class JwtStrategy implements AuthenticationStrategy {
  private readonly secretKey = 'your-secret-key';
  private readonly tokenExpiry = 3600; // 1 hour in seconds
  private readonly refreshExpiry = 86400; // 24 hours in seconds

  authenticate(credentials: AuthenticationCredentials): AuthenticationResult {
    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        message: "Username and password required",
        securityLevel: 'medium'
      };
    }

    // Simulate user validation
    const user = this.validateUser(credentials.username, credentials.password);
    if (!user) {
      return {
        success: false,
        message: "Invalid credentials",
        securityLevel: 'medium'
      };
    }

    // Generate JWT token
    const token = this.generateJwtToken(user);
    const expiresAt = new Date(Date.now() + this.tokenExpiry * 1000);

    return {
      success: true,
      user,
      token,
      expiresAt,
      message: "JWT authentication successful",
      securityLevel: 'high',
      metadata: {
        tokenType: 'JWT',
        algorithm: 'HS256',
        issuedAt: new Date().toISOString()
      }
    };
  }

  validate(token: string): ValidationResult {
    try {
      // Simulate JWT validation
      const isValid = this.validateJwtToken(token);
      if (!isValid) {
        return {
          isValid: false,
          message: "Invalid or expired JWT token"
        };
      }

      const expiresAt = new Date(Date.now() + this.tokenExpiry * 1000);
      return {
        isValid: true,
        message: "JWT token is valid",
        expiresAt
      };
    } catch (error) {
      return {
        isValid: false,
        message: "Token validation failed"
      };
    }
  }

  refresh(token: string): RefreshResult {
    try {
      // Simulate token refresh
      const isValid = this.validateJwtToken(token);
      if (!isValid) {
        return {
          success: false,
          message: "Invalid refresh token"
        };
      }

      const newToken = this.generateJwtToken({ id: 'user123', username: 'user', email: 'user@example.com', role: 'user', lastLogin: new Date(), isActive: true });
      const expiresAt = new Date(Date.now() + this.tokenExpiry * 1000);

      return {
        success: true,
        newToken,
        expiresAt,
        message: "JWT token refreshed successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "Token refresh failed"
      };
    }
  }

  private validateUser(username: string, password: string): User | null {
    // Simulate user database lookup
    if (username === 'admin' && password === 'admin123') {
      return {
        id: 'admin123',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        lastLogin: new Date(),
        isActive: true
      };
    }
    if (username === 'user' && password === 'user123') {
      return {
        id: 'user123',
        username: 'user',
        email: 'user@example.com',
        role: 'user',
        lastLogin: new Date(),
        isActive: true
      };
    }
    return null;
  }

  private generateJwtToken(user: User): string {
    // Simulate JWT generation
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + this.tokenExpiry
    };
    return `jwt.${btoa(JSON.stringify(payload))}.signature`;
  }

  private validateJwtToken(token: string): boolean {
    // Simulate JWT validation
    return token.startsWith('jwt.') && token.includes('.signature');
  }

  getDescription(): string {
    return "JWT - JSON Web Token authentication";
  }

  getSecurityLevel(): 'low' | 'medium' | 'high' {
    return 'high';
  }

  getSupportedFeatures(): string[] {
    return ['Stateless', 'Token-based', 'Refresh tokens', 'Claims-based'];
  }

  isEnabled(): boolean {
    return true;
  }
}

class OAuthStrategy implements AuthenticationStrategy {
  private readonly providers = ['google', 'facebook', 'github'];
  private readonly tokenExpiry = 7200; // 2 hours

  authenticate(credentials: AuthenticationCredentials): AuthenticationResult {
    if (!credentials.token) {
      return {
        success: false,
        message: "OAuth token required",
        securityLevel: 'high'
      };
    }

    // Simulate OAuth token validation
    const user = this.validateOAuthToken(credentials.token);
    if (!user) {
      return {
        success: false,
        message: "Invalid OAuth token",
        securityLevel: 'high'
      };
    }

    const expiresAt = new Date(Date.now() + this.tokenExpiry * 1000);

    return {
      success: true,
      user,
      token: credentials.token,
      expiresAt,
      message: "OAuth authentication successful",
      securityLevel: 'high',
      metadata: {
        provider: 'google',
        tokenType: 'OAuth2',
        scope: 'read write'
      }
    };
  }

  validate(token: string): ValidationResult {
    try {
      const isValid = this.validateOAuthToken(token);
      if (!isValid) {
        return {
          isValid: false,
          message: "Invalid OAuth token"
        };
      }

      const expiresAt = new Date(Date.now() + this.tokenExpiry * 1000);
      return {
        isValid: true,
        message: "OAuth token is valid",
        expiresAt
      };
    } catch (error) {
      return {
        isValid: false,
        message: "OAuth token validation failed"
      };
    }
  }

  refresh(token: string): RefreshResult {
    try {
      const isValid = this.validateOAuthToken(token);
      if (!isValid) {
        return {
          success: false,
          message: "Invalid OAuth refresh token"
        };
      }

      const newToken = `oauth.${Date.now()}.refreshed`;
      const expiresAt = new Date(Date.now() + this.tokenExpiry * 1000);

      return {
        success: true,
        newToken,
        expiresAt,
        message: "OAuth token refreshed successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "OAuth token refresh failed"
      };
    }
  }

  private validateOAuthToken(token: string): User | null {
    // Simulate OAuth token validation
    if (token.startsWith('oauth.')) {
      return {
        id: 'oauth123',
        username: 'oauth_user',
        email: 'oauth@example.com',
        role: 'user',
        lastLogin: new Date(),
        isActive: true
      };
    }
    return null;
  }

  getDescription(): string {
    return "OAuth - Third-party authentication";
  }

  getSecurityLevel(): 'low' | 'medium' | 'high' {
    return 'high';
  }

  getSupportedFeatures(): string[] {
    return ['Social login', 'Third-party providers', 'Scope-based access', 'Refresh tokens'];
  }

  isEnabled(): boolean {
    return true;
  }
}

class ApiKeyStrategy implements AuthenticationStrategy {
  private readonly validApiKeys = new Set(['api_key_123', 'api_key_456', 'api_key_789']);
  private readonly keyExpiry = 31536000; // 1 year

  authenticate(credentials: AuthenticationCredentials): AuthenticationResult {
    if (!credentials.apiKey) {
      return {
        success: false,
        message: "API key required",
        securityLevel: 'medium'
      };
    }

    // Validate API key
    if (!this.validApiKeys.has(credentials.apiKey)) {
      return {
        success: false,
        message: "Invalid API key",
        securityLevel: 'medium'
      };
    }

    const user = {
      id: 'api_user',
      username: 'api_user',
      email: 'api@example.com',
      role: 'api',
      lastLogin: new Date(),
      isActive: true
    };

    const expiresAt = new Date(Date.now() + this.keyExpiry * 1000);

    return {
      success: true,
      user,
      token: credentials.apiKey,
      expiresAt,
      message: "API key authentication successful",
      securityLevel: 'medium',
      metadata: {
        keyType: 'API',
        permissions: ['read', 'write'],
        rateLimit: '1000/hour'
      }
    };
  }

  validate(token: string): ValidationResult {
    const isValid = this.validApiKeys.has(token);
    if (!isValid) {
      return {
        isValid: false,
        message: "Invalid API key"
      };
    }

    const expiresAt = new Date(Date.now() + this.keyExpiry * 1000);
    return {
      isValid: true,
      message: "API key is valid",
      expiresAt
    };
  }

  refresh(token: string): RefreshResult {
    // API keys typically don't support refresh
    return {
      success: false,
      message: "API keys do not support refresh"
    };
  }

  getDescription(): string {
    return "API Key - Simple key-based authentication";
  }

  getSecurityLevel(): 'low' | 'medium' | 'high' {
    return 'medium';
  }

  getSupportedFeatures(): string[] {
    return ['Simple authentication', 'Rate limiting', 'Permission-based access'];
  }

  isEnabled(): boolean {
    return true;
  }
}

class SessionStrategy implements AuthenticationStrategy {
  private readonly sessions = new Map<string, { user: User; expiresAt: Date }>();
  private readonly sessionExpiry = 1800; // 30 minutes

  authenticate(credentials: AuthenticationCredentials): AuthenticationResult {
    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        message: "Username and password required",
        securityLevel: 'low'
      };
    }

    // Simulate user validation
    const user = this.validateUser(credentials.username, credentials.password);
    if (!user) {
      return {
        success: false,
        message: "Invalid credentials",
        securityLevel: 'low'
      };
    }

    // Create session
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + this.sessionExpiry * 1000);
    
    this.sessions.set(sessionId, { user, expiresAt });

    return {
      success: true,
      user,
      sessionId,
      expiresAt,
      message: "Session authentication successful",
      securityLevel: 'low',
      metadata: {
        sessionType: 'Server-side',
        timeout: this.sessionExpiry
      }
    };
  }

  validate(token: string): ValidationResult {
    const session = this.sessions.get(token);
    if (!session) {
      return {
        isValid: false,
        message: "Invalid session"
      };
    }

    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return {
        isValid: false,
        message: "Session expired"
      };
    }

    return {
      isValid: true,
      message: "Session is valid",
      expiresAt: session.expiresAt
    };
  }

  refresh(token: string): RefreshResult {
    const session = this.sessions.get(token);
    if (!session) {
      return {
        success: false,
        message: "Invalid session"
      };
    }

    // Extend session
    const newExpiresAt = new Date(Date.now() + this.sessionExpiry * 1000);
    session.expiresAt = newExpiresAt;

    return {
      success: true,
      expiresAt: newExpiresAt,
      message: "Session refreshed successfully"
    };
  }

  private validateUser(username: string, password: string): User | null {
    if (username === 'user' && password === 'password') {
      return {
        id: 'session_user',
        username: 'user',
        email: 'user@example.com',
        role: 'user',
        lastLogin: new Date(),
        isActive: true
      };
    }
    return null;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDescription(): string {
    return "Session - Server-side session management";
  }

  getSecurityLevel(): 'low' | 'medium' | 'high' {
    return 'low';
  }

  getSupportedFeatures(): string[] {
    return ['Server-side sessions', 'Automatic timeout', 'Session invalidation'];
  }

  isEnabled(): boolean {
    return true;
  }
}

// ============================================================================
// CONTEXT CLASS
// ============================================================================

class AuthenticationContext {
  private strategy: AuthenticationStrategy;

  constructor(strategy: AuthenticationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: AuthenticationStrategy): void {
    this.strategy = strategy;
  }

  authenticate(credentials: AuthenticationCredentials): AuthenticationResult {
    console.log(`Authenticating using: ${this.strategy.getDescription()}`);
    console.log(`Security level: ${this.strategy.getSecurityLevel()}`);
    console.log(`Supported features: ${this.strategy.getSupportedFeatures().join(', ')}`);
    console.log(`Enabled: ${this.strategy.isEnabled() ? "Yes" : "No"}`);
    
    const result = this.strategy.authenticate(credentials);
    
    console.log(`Result: ${result.success ? "SUCCESS" : "FAILED"}`);
    console.log(`Message: ${result.message}`);
    if (result.user) {
      console.log(`User: ${result.user.username} (${result.user.role})`);
    }
    if (result.token) {
      console.log(`Token: ${result.token.substring(0, 20)}...`);
    }
    if (result.sessionId) {
      console.log(`Session ID: ${result.sessionId}`);
    }
    if (result.expiresAt) {
      console.log(`Expires: ${result.expiresAt.toISOString()}`);
    }
    console.log("---");

    return result;
  }

  validate(token: string): ValidationResult {
    console.log(`Validating token using: ${this.strategy.getDescription()}`);
    
    const result = this.strategy.validate(token);
    
    console.log(`Valid: ${result.isValid ? "Yes" : "No"}`);
    console.log(`Message: ${result.message}`);
    if (result.expiresAt) {
      console.log(`Expires: ${result.expiresAt.toISOString()}`);
    }
    console.log("---");

    return result;
  }

  refresh(token: string): RefreshResult {
    console.log(`Refreshing token using: ${this.strategy.getDescription()}`);
    
    const result = this.strategy.refresh(token);
    
    console.log(`Success: ${result.success ? "Yes" : "No"}`);
    console.log(`Message: ${result.message}`);
    if (result.newToken) {
      console.log(`New token: ${result.newToken.substring(0, 20)}...`);
    }
    if (result.expiresAt) {
      console.log(`Expires: ${result.expiresAt.toISOString()}`);
    }
    console.log("---");

    return result;
  }

  getCurrentStrategy(): AuthenticationStrategy {
    return this.strategy;
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

function demonstrateAuthenticationStrategies(): void {
  console.log("=== AUTHENTICATION SYSTEM STRATEGY DEMO ===\n");

  const context = new AuthenticationContext(new JwtStrategy());

  // Test different authentication methods
  const scenarios = [
    {
      name: "JWT Authentication",
      strategy: new JwtStrategy(),
      credentials: {
        username: 'admin',
        password: 'admin123'
      }
    },
    {
      name: "OAuth Authentication",
      strategy: new OAuthStrategy(),
      credentials: {
        token: 'oauth.1234567890.valid'
      }
    },
    {
      name: "API Key Authentication",
      strategy: new ApiKeyStrategy(),
      credentials: {
        apiKey: 'api_key_123'
      }
    },
    {
      name: "Session Authentication",
      strategy: new SessionStrategy(),
      credentials: {
        username: 'user',
        password: 'password'
      }
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`Test ${index + 1}: ${scenario.name}`);
    context.setStrategy(scenario.strategy);
    const result = context.authenticate(scenario.credentials);
    
    if (result.success && result.token) {
      // Test validation
      context.validate(result.token);
      
      // Test refresh
      context.refresh(result.token);
    }
    console.log("");
  });
}

function demonstrateStrategyComparison(): void {
  console.log("=== AUTHENTICATION STRATEGY COMPARISON ===\n");

  const strategies = [
    new JwtStrategy(),
    new OAuthStrategy(),
    new ApiKeyStrategy(),
    new SessionStrategy()
  ];

  console.log("Authentication Strategy Comparison:");
  console.log("Strategy\t\t\tSecurity\tFeatures\t\t\tRefresh");
  console.log("--------\t\t\t--------\t--------\t\t\t-------");

  strategies.forEach(strategy => {
    const shortName = strategy.getDescription().split(' - ')[0];
    const features = strategy.getSupportedFeatures().slice(0, 2).join(', ');
    const refreshSupport = strategy.refresh('test').success ? "Yes" : "No";
    
    console.log(`${shortName.padEnd(20)}\t${strategy.getSecurityLevel()}\t\t${features.padEnd(20)}\t${refreshSupport}`);
  });
}

function demonstrateDynamicSelection(): void {
  console.log("=== DYNAMIC STRATEGY SELECTION ===\n");

  const context = new AuthenticationContext(new JwtStrategy());

  const scenarios = [
    {
      name: "Web application login",
      credentials: { username: 'user', password: 'password' },
      recommendedStrategy: "SessionStrategy",
      reason: "Traditional web app with server-side sessions"
    },
    {
      name: "Mobile app authentication",
      credentials: { username: 'user', password: 'password' },
      recommendedStrategy: "JwtStrategy",
      reason: "Stateless authentication for mobile apps"
    },
    {
      name: "Social media login",
      credentials: { token: 'oauth.1234567890.valid' },
      recommendedStrategy: "OAuthStrategy",
      reason: "Third-party authentication"
    },
    {
      name: "API access",
      credentials: { apiKey: 'api_key_123' },
      recommendedStrategy: "ApiKeyStrategy",
      reason: "Simple API authentication"
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    console.log(`Recommended: ${scenario.recommendedStrategy} - ${scenario.reason}`);
    
    // Select strategy based on scenario
    let selectedStrategy: AuthenticationStrategy;
    switch (scenario.recommendedStrategy) {
      case "JwtStrategy":
        selectedStrategy = new JwtStrategy();
        break;
      case "OAuthStrategy":
        selectedStrategy = new OAuthStrategy();
        break;
      case "ApiKeyStrategy":
        selectedStrategy = new ApiKeyStrategy();
        break;
      case "SessionStrategy":
        selectedStrategy = new SessionStrategy();
        break;
      default:
        selectedStrategy = new JwtStrategy();
    }

    context.setStrategy(selectedStrategy);
    const result = context.authenticate(scenario.credentials);
    
    console.log(`✅ Authentication: ${result.success ? "SUCCESS" : "FAILED"}\n`);
  });
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

function testAuthenticationStrategies(): void {
  console.log("=== AUTHENTICATION STRATEGY TESTS ===\n");

  const testCases = [
    {
      name: "Valid credentials test",
      credentials: { username: 'admin', password: 'admin123' },
      expectedSuccess: true
    },
    {
      name: "Invalid credentials test",
      credentials: { username: 'invalid', password: 'invalid' },
      expectedSuccess: false
    },
    {
      name: "Missing credentials test",
      credentials: {},
      expectedSuccess: false
    }
  ];

  const strategies = [
    new JwtStrategy(),
    new OAuthStrategy(),
    new ApiKeyStrategy(),
    new SessionStrategy()
  ];

  testCases.forEach((testCase, testIndex) => {
    console.log(`Test ${testIndex + 1}: ${testCase.name}`);
    
    strategies.forEach((strategy, strategyIndex) => {
      const result = strategy.authenticate(testCase.credentials);
      const passed = result.success === testCase.expectedSuccess;
      
      console.log(`  Strategy ${strategyIndex + 1} (${strategy.getDescription().split(' - ')[0]}): ${passed ? "✅ PASS" : "❌ FAIL"}`);
    });
    console.log("");
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main(): void {
  try {
    demonstrateAuthenticationStrategies();
    demonstrateStrategyComparison();
    demonstrateDynamicSelection();
    testAuthenticationStrategies();
    
    console.log("=== AUTHENTICATION SYSTEM STRATEGY PATTERN COMPLETED ===");
  } catch (error) {
    console.error("Error in authentication demo:", error);
  }
}

// Run the demonstration
main();

exit(0); 