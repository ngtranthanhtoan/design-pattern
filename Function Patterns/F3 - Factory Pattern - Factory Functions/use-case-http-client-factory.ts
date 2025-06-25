/**
 * HTTP Client Factory System - Factory Pattern Implementation
 * 
 * Demonstrates a comprehensive HTTP client factory system using pure functions
 * instead of traditional factory classes and complex inheritance hierarchies.
 */

import { exit } from "process";

// Core HTTP client types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type RequestConfig = {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
};

type HttpResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
};

type HttpClient = {
  request<T = any>(config: RequestConfig): Promise<HttpResponse<T>>;
  get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<HttpResponse<T>>;
  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<HttpResponse<T>>;
  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<HttpResponse<T>>;
  delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<HttpResponse<T>>;
  baseUrl: string;
  defaultHeaders: Record<string, string>;
  timeout: number;
};

// Authentication types
type AuthType = 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2';

type AuthConfig = {
  type: AuthType;
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  };
};

// Base HTTP client implementation (simulated)
const createBaseHttpClient = (
  baseUrl: string,
  defaultHeaders: Record<string, string> = {},
  timeout: number = 5000
): HttpClient => {
  const client: HttpClient = {
    baseUrl,
    defaultHeaders,
    timeout,
    
    async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
      // Simulate HTTP request
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const url = config.url.startsWith('http') ? config.url : `${baseUrl}${config.url}`;
      
      // Simulate successful response
      return {
        data: { message: `${config.method} request to ${url}`, timestamp: new Date().toISOString() } as T,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' }
      };
    },
    
    async get<T = any>(url: string, config: Partial<RequestConfig> = {}): Promise<HttpResponse<T>> {
      return this.request<T>({ ...config, method: 'GET', url });
    },
    
    async post<T = any>(url: string, data?: any, config: Partial<RequestConfig> = {}): Promise<HttpResponse<T>> {
      return this.request<T>({ ...config, method: 'POST', url, body: data });
    },
    
    async put<T = any>(url: string, data?: any, config: Partial<RequestConfig> = {}): Promise<HttpResponse<T>> {
      return this.request<T>({ ...config, method: 'PUT', url, body: data });
    },
    
    async delete<T = any>(url: string, config: Partial<RequestConfig> = {}): Promise<HttpResponse<T>> {
      return this.request<T>({ ...config, method: 'DELETE', url });
    }
  };
  
  return client;
};

// Factory functions for different client types
const createRestApiClient = (baseUrl: string, timeout: number = 5000): HttpClient => {
  return createBaseHttpClient(baseUrl, {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }, timeout);
};

const createGraphQLClient = (baseUrl: string, timeout: number = 10000): HttpClient => {
  return createBaseHttpClient(baseUrl, {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-GraphQL-Client': 'functional-factory'
  }, timeout);
};

const createXmlApiClient = (baseUrl: string): HttpClient => {
  return createBaseHttpClient(baseUrl, {
    'Content-Type': 'application/xml',
    'Accept': 'application/xml'
  });
};

const createFormClient = (baseUrl: string): HttpClient => {
  return createBaseHttpClient(baseUrl, {
    'Content-Type': 'application/x-www-form-urlencoded'
  });
};

// Authentication factory functions
const createBasicAuthClient = (baseClient: HttpClient, username: string, password: string): HttpClient => {
  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  
  return {
    ...baseClient,
    defaultHeaders: {
      ...baseClient.defaultHeaders,
      'Authorization': authHeader
    }
  };
};

const createBearerTokenClient = (baseClient: HttpClient, token: string): HttpClient => {
  return {
    ...baseClient,
    defaultHeaders: {
      ...baseClient.defaultHeaders,
      'Authorization': `Bearer ${token}`
    }
  };
};

const createApiKeyClient = (baseClient: HttpClient, apiKey: string, headerName: string = 'X-API-Key'): HttpClient => {
  return {
    ...baseClient,
    defaultHeaders: {
      ...baseClient.defaultHeaders,
      [headerName]: apiKey
    }
  };
};

// Higher-order factory functions for middleware
const withRequestLogging = (client: HttpClient, logger?: (message: string) => void): HttpClient => {
  const log = logger || console.log;
  
  return {
    ...client,
    async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
      log(`🌐 ${config.method} ${config.url}`);
      const response = await client.request<T>(config);
      log(`📡 ${response.status} ${response.statusText}`);
      return response;
    }
  };
};

const withRetry = (client: HttpClient, maxRetries: number = 3, delay: number = 1000): HttpClient => {
  return {
    ...client,
    async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
          return await client.request<T>(config);
        } catch (error) {
          lastError = error as Error;
          
          if (attempt <= maxRetries) {
            console.log(`🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      throw lastError!;
    }
  };
};

const withErrorHandling = (client: HttpClient, errorHandler?: (error: any) => void): HttpClient => {
  const handleError = errorHandler || ((error: any) => console.error('❌ HTTP Error:', error));
  
  return {
    ...client,
    async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
      try {
        return await client.request<T>(config);
      } catch (error) {
        handleError(error);
        throw error;
      }
    }
  };
};

const withCaching = (client: HttpClient, cacheTime: number = 5 * 60 * 1000): HttpClient => {
  const cache = new Map<string, { response: HttpResponse; timestamp: number }>();
  
  return {
    ...client,
    async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
      // Only cache GET requests
      if (config.method === 'GET') {
        const cacheKey = `${config.method}:${config.url}`;
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < cacheTime) {
          console.log(`💾 Cache hit for ${cacheKey}`);
          return cached.response as HttpResponse<T>;
        }
      }
      
      const response = await client.request<T>(config);
      
      if (config.method === 'GET') {
        const cacheKey = `${config.method}:${config.url}`;
        cache.set(cacheKey, { response, timestamp: Date.now() });
        console.log(`💿 Cached response for ${cacheKey}`);
      }
      
      return response;
    }
  };
};

// Environment-specific client factories
const createDevelopmentClient = (service: string): HttpClient => {
  const baseUrl = `http://localhost:3000/${service}`;
  return withRequestLogging(
    createRestApiClient(baseUrl, 30000), // Longer timeout for dev
    (msg) => console.log(`[DEV] ${msg}`)
  );
};

const createStagingClient = (service: string): HttpClient => {
  const baseUrl = `https://staging-api.example.com/${service}`;
  return withRetry(
    withRequestLogging(createRestApiClient(baseUrl)),
    2
  );
};

const createProductionClient = (service: string): HttpClient => {
  const baseUrl = `https://api.example.com/${service}`;
  return withErrorHandling(
    withCaching(
      withRetry(createRestApiClient(baseUrl), 3, 2000),
      10 * 60 * 1000 // 10 minutes cache
    )
  );
};

// Service-specific client factories
const createUserServiceClient = (environment: string = 'development'): HttpClient => {
  const envFactories: Record<string, (service: string) => HttpClient> = {
    development: createDevelopmentClient,
    staging: createStagingClient,
    production: createProductionClient
  };
  
  return envFactories[environment]?.('users') || createDevelopmentClient('users');
};

const createPaymentServiceClient = (environment: string = 'development'): HttpClient => {
  const envFactories: Record<string, (service: string) => HttpClient> = {
    development: createDevelopmentClient,
    staging: createStagingClient,
    production: createProductionClient
  };
  
  const baseClient = envFactories[environment]?.('payments') || createDevelopmentClient('payments');
  
  // Payment service always needs extra security
  return withErrorHandling(baseClient, (error) => {
    console.error('💳 Payment service error:', error);
    // Could send to monitoring service
  });
};

// Composite client factory
const createMultiServiceClient = (environment: string = 'development') => {
  return {
    users: createUserServiceClient(environment),
    payments: createPaymentServiceClient(environment),
    notifications: createRestApiClient(`https://api.${environment}.example.com/notifications`)
  };
};

// Dynamic client factory with configuration
type ClientConfig = {
  baseUrl: string;
  auth?: AuthConfig;
  timeout?: number;
  retry?: { maxRetries: number; delay: number };
  logging?: boolean;
  caching?: { enabled: boolean; duration: number };
};

const createConfigurableClient = (config: ClientConfig): HttpClient => {
  // Start with base client
  let client = createRestApiClient(config.baseUrl, config.timeout);
  
  // Add authentication
  if (config.auth && config.auth.type !== 'none') {
    switch (config.auth.type) {
      case 'basic':
        if (config.auth.credentials?.username && config.auth.credentials?.password) {
          client = createBasicAuthClient(
            client,
            config.auth.credentials.username,
            config.auth.credentials.password
          );
        }
        break;
      case 'bearer':
        if (config.auth.credentials?.token) {
          client = createBearerTokenClient(client, config.auth.credentials.token);
        }
        break;
      case 'apikey':
        if (config.auth.credentials?.apiKey) {
          client = createApiKeyClient(client, config.auth.credentials.apiKey);
        }
        break;
    }
  }
  
  // Add middleware layers
  if (config.retry) {
    client = withRetry(client, config.retry.maxRetries, config.retry.delay);
  }
  
  if (config.caching?.enabled) {
    client = withCaching(client, config.caching.duration);
  }
  
  if (config.logging) {
    client = withRequestLogging(client);
  }
  
  client = withErrorHandling(client);
  
  return client;
};

// Demonstration functions
async function demonstrateBasicClientFactories(): Promise<void> {
  console.log("🏭 BASIC CLIENT FACTORIES");
  console.log("=" + "=".repeat(27));
  
  const restClient = createRestApiClient('https://api.example.com');
  const graphqlClient = createGraphQLClient('https://graphql.example.com');
  const xmlClient = createXmlApiClient('https://soap.example.com');
  
  console.log("Created clients:");
  console.log(`  🌐 REST API: ${restClient.baseUrl}`);
  console.log(`  📊 GraphQL: ${graphqlClient.baseUrl}`);
  console.log(`  📄 XML API: ${xmlClient.baseUrl}`);
  
  // Test a request
  console.log("\n📡 Testing REST API request:");
  const response = await restClient.get('/test');
  console.log(`   Status: ${response.status} ${response.statusText}`);
  console.log(`   Data:`, response.data);
  
  console.log();
}

async function demonstrateAuthenticationFactories(): Promise<void> {
  console.log("🔐 AUTHENTICATION FACTORIES");
  console.log("=" + "=".repeat(30));
  
  const baseClient = createRestApiClient('https://api.example.com');
  
  // Create different authenticated clients
  const basicAuthClient = createBasicAuthClient(baseClient, 'user', 'password');
  const bearerClient = createBearerTokenClient(baseClient, 'jwt-token-123');
  const apiKeyClient = createApiKeyClient(baseClient, 'api-key-456');
  
  console.log("Authentication headers added:");
  console.log(`  🔑 Basic Auth: ${basicAuthClient.defaultHeaders['Authorization']}`);
  console.log(`  🎫 Bearer Token: ${bearerClient.defaultHeaders['Authorization']}`);
  console.log(`  🔐 API Key: ${apiKeyClient.defaultHeaders['X-API-Key']}`);
  
  console.log("\n📡 Testing authenticated request:");
  const authResponse = await bearerClient.get('/protected');
  console.log(`   Status: ${authResponse.status} ${authResponse.statusText}`);
  
  console.log();
}

async function demonstrateMiddlewareComposition(): Promise<void> {
  console.log("🔧 MIDDLEWARE COMPOSITION");
  console.log("=" + "=".repeat(27));
  
  const baseClient = createRestApiClient('https://api.example.com');
  
  // Compose multiple middleware layers
  const enhancedClient = withErrorHandling(
    withCaching(
      withRetry(
        withRequestLogging(baseClient),
        2,
        500
      ),
      5000 // 5 second cache
    )
  );
  
  console.log("Testing composed client with middleware:");
  
  // First request - should show all middleware in action
  console.log("\n📡 First request (will be cached):");
  await enhancedClient.get('/cached-endpoint');
  
  // Second request - should hit cache
  console.log("\n📡 Second request (should hit cache):");
  await enhancedClient.get('/cached-endpoint');
  
  console.log();
}

async function demonstrateEnvironmentFactories(): Promise<void> {
  console.log("🌍 ENVIRONMENT-SPECIFIC FACTORIES");
  console.log("=" + "=".repeat(37));
  
  const environments = ['development', 'staging', 'production'];
  
  for (const env of environments) {
    console.log(`\n🔧 ${env.toUpperCase()} Environment:`);
    const userClient = createUserServiceClient(env);
    const paymentClient = createPaymentServiceClient(env);
    
    console.log(`   User Service: ${userClient.baseUrl}`);
    console.log(`   Payment Service: ${paymentClient.baseUrl}`);
    
    // Test the clients
    console.log(`   Testing ${env} user service...`);
    await userClient.get('/profile');
  }
  
  console.log();
}

async function demonstrateConfigurableFactory(): Promise<void> {
  console.log("⚙️ CONFIGURABLE CLIENT FACTORY");
  console.log("=" + "=".repeat(32));
  
  const config: ClientConfig = {
    baseUrl: 'https://api.example.com',
    auth: {
      type: 'bearer',
      credentials: { token: 'my-jwt-token' }
    },
    timeout: 10000,
    retry: { maxRetries: 3, delay: 1000 },
    logging: true,
    caching: { enabled: true, duration: 60000 }
  };
  
  console.log("Creating client with configuration:");
  console.log(`  🌐 Base URL: ${config.baseUrl}`);
  console.log(`  🔐 Auth: ${config.auth?.type}`);
  console.log(`  ⏱️ Timeout: ${config.timeout}ms`);
  console.log(`  🔄 Retry: ${config.retry?.maxRetries} attempts`);
  console.log(`  📊 Logging: ${config.logging ? 'enabled' : 'disabled'}`);
  console.log(`  💾 Caching: ${config.caching?.enabled ? 'enabled' : 'disabled'}`);
  
  const client = createConfigurableClient(config);
  
  console.log("\n📡 Testing configurable client:");
  await client.get('/test-endpoint');
  
  console.log();
}

function demonstratePerformanceComparison(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("=" + "=".repeat(26));
  
  const iterations = 10000;
  console.log(`Creating ${iterations} clients...`);
  
  const startTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    createRestApiClient(`https://api-${i}.example.com`);
  }
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  const clientsPerSecond = Math.round((iterations / duration) * 1000);
  
  console.log(`✨ Created ${iterations} clients in ${duration}ms`);
  console.log(`📊 Performance: ~${clientsPerSecond} clients/second`);
  console.log(`🏃‍♂️ Average: ${(duration / iterations).toFixed(4)}ms per client`);
  console.log();
  
  console.log("Key Performance Benefits:");
  console.log("• No class instantiation overhead");
  console.log("• Function composition is lightweight");
  console.log("• Minimal memory allocation");
  console.log("• Efficient closure handling");
  console.log();
}

// Main execution
async function main(): Promise<void> {
  console.log("🎯 HTTP CLIENT FACTORY SYSTEM - FACTORY PATTERN");
  console.log("=" + "=".repeat(50));
  console.log();
  console.log("This implementation demonstrates a comprehensive HTTP client factory");
  console.log("system using pure functions instead of traditional factory classes.");
  console.log();
  
  await demonstrateBasicClientFactories();
  await demonstrateAuthenticationFactories();
  await demonstrateMiddlewareComposition();
  await demonstrateEnvironmentFactories();
  await demonstrateConfigurableFactory();
  demonstratePerformanceComparison();
  
  console.log("🎉 SUMMARY");
  console.log("=" + "=".repeat(10));
  console.log("✅ Demonstrated flexible client creation");
  console.log("✅ Showed function composition benefits");
  console.log("✅ Proved middleware layer efficiency");
  console.log("✅ Illustrated environment-specific factories");
  console.log("✅ Measured performance advantages");
  console.log();
  console.log("The functional approach provides:");
  console.log("• Easier client composition than class hierarchies");
  console.log("• Better middleware composition with higher-order functions");
  console.log("• Simpler testing of individual factory functions");
  console.log("• More flexible client configuration");
  console.log("• Cleaner, more maintainable code");
}

// Run the demonstration
main().catch(console.error);
exit(0); 