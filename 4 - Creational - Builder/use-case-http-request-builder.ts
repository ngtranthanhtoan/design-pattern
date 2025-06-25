// ============================================================================
// HTTP REQUEST BUILDER - Complex HTTP Request Construction
// ============================================================================

import { exit } from "process";

// HTTP request interfaces and types
interface HTTPRequest {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly body?: any;
  readonly queryParams?: Record<string, string | number | boolean>;
  readonly auth?: AuthConfig;
  readonly timeout: number;
  readonly retryStrategy?: RetryStrategy;
  readonly responseHandling?: ResponseHandling;
  readonly multipart?: MultipartConfig;
  readonly progressCallback?: (loaded: number, total: number) => void;
}

interface AuthConfig {
  type: 'bearer' | 'basic' | 'apiKey' | 'oauth' | 'custom';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  customHeaders?: Record<string, string>;
  oauth?: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
    refreshToken?: string;
  };
}

interface RetryStrategy {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  maxDelay: number;
  retryOn: number[];
  shouldRetry?: (error: any, attempt: number) => boolean;
}

interface ResponseHandling {
  expectedStatus: number | number[];
  parseAs: 'json' | 'text' | 'blob' | 'stream' | 'buffer';
  validateSchema?: any;
  transformResponse?: (data: any) => any;
  errorHandler?: (error: any) => any;
}

interface MultipartConfig {
  fields: Record<string, string>;
  files: MultipartFile[];
  boundary?: string;
}

interface MultipartFile {
  fieldName: string;
  filename: string;
  data: Buffer | string;
  contentType?: string;
}

// ============================================================================
// HTTP REQUEST BUILDER
// ============================================================================

class HTTPRequestBuilder {
  private requestData: Partial<Omit<HTTPRequest, 'readonly'>> & {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    queryParams?: Record<string, string | number | boolean>;
    auth?: AuthConfig;
    timeout?: number;
    retryStrategy?: RetryStrategy;
    responseHandling?: ResponseHandling;
    multipart?: MultipartConfig;
    progressCallback?: (loaded: number, total: number) => void;
  } = {
    // Default values
    method: 'GET',
    headers: {
      'User-Agent': 'HTTPRequestBuilder/1.0',
      'Accept': '*/*'
    },
    timeout: 30000
  };

  method(method: HTTPRequest['method']): this {
    this.requestData.method = method;
    return this;
  }

  get(): this {
    return this.method('GET');
  }

  post(): this {
    return this.method('POST');
  }

  put(): this {
    return this.method('PUT');
  }

  delete(): this {
    return this.method('DELETE');
  }

  patch(): this {
    return this.method('PATCH');
  }

  url(url: string): this {
    if (!url || url.trim() === '') {
      throw new Error('URL cannot be empty');
    }
    
    // Basic URL validation
    try {
      new URL(url.startsWith('http') ? url : 'http://localhost' + url);
    } catch {
      throw new Error('Invalid URL format');
    }
    
    this.requestData.url = url.trim();
    return this;
  }

  headers(headers: Record<string, string>): this {
    this.requestData.headers = {
      ...this.requestData.headers!,
      ...headers
    };
    return this;
  }

  header(name: string, value: string): this {
    this.requestData.headers = {
      ...this.requestData.headers!,
      [name]: value
    };
    return this;
  }

  contentType(contentType: string): this {
    return this.header('Content-Type', contentType);
  }

  accept(accept: string): this {
    return this.header('Accept', accept);
  }

  body(body: any): this {
    this.requestData.body = body;
    
    // Auto-set content type for common body types
    if (typeof body === 'object' && body !== null && !Buffer.isBuffer(body)) {
      if (!this.requestData.headers!['Content-Type']) {
        this.requestData.headers!['Content-Type'] = 'application/json';
      }
    }
    
    return this;
  }

  json(data: any): this {
    this.requestData.body = data;
    return this.contentType('application/json');
  }

  form(data: Record<string, string>): this {
    this.requestData.body = data;
    return this.contentType('application/x-www-form-urlencoded');
  }

  queryParams(params: Record<string, string | number | boolean>): this {
    this.requestData.queryParams = { ...params };
    return this;
  }

  queryParam(name: string, value: string | number | boolean): this {
    this.requestData.queryParams = {
      ...this.requestData.queryParams!,
      [name]: value
    };
    return this;
  }

  auth(): AuthBuilder {
    return new AuthBuilder(this);
  }

  timeout(timeoutMs: number): this {
    if (timeoutMs < 0) {
      throw new Error('Timeout cannot be negative');
    }
    this.requestData.timeout = timeoutMs;
    return this;
  }

  retryStrategy(): RetryStrategyBuilder {
    return new RetryStrategyBuilder(this);
  }

  responseHandling(): ResponseHandlingBuilder {
    return new ResponseHandlingBuilder(this);
  }

  multipart(): MultipartBuilder {
    return new MultipartBuilder(this);
  }

  progress(callback: (loaded: number, total: number) => void): this {
    this.requestData.progressCallback = callback;
    return this;
  }

  build(): HTTPRequest {
    if (!this.requestData.url) {
      throw new Error('URL is required');
    }

    // Validate method and body combination
    if (this.requestData.method === 'GET' && this.requestData.body) {
      throw new Error('GET requests cannot have a body');
    }

    if (['POST', 'PUT', 'PATCH'].includes(this.requestData.method!) && 
        !this.requestData.body && !this.requestData.multipart) {
      console.warn(`${this.requestData.method} request without body`);
    }

    return Object.freeze({
      method: this.requestData.method!,
      url: this.requestData.url,
      headers: { ...this.requestData.headers! },
      body: this.requestData.body,
      queryParams: this.requestData.queryParams ? { ...this.requestData.queryParams } : undefined,
      auth: this.requestData.auth ? { ...this.requestData.auth } : undefined,
      timeout: this.requestData.timeout!,
      retryStrategy: this.requestData.retryStrategy ? { ...this.requestData.retryStrategy } : undefined,
      responseHandling: this.requestData.responseHandling ? { ...this.requestData.responseHandling } : undefined,
      multipart: this.requestData.multipart ? { ...this.requestData.multipart } : undefined,
      progressCallback: this.requestData.progressCallback
    });
  }

  // Static factory methods for common request types
  static get(url: string): HTTPRequestBuilder {
    return new HTTPRequestBuilder().get().url(url);
  }

  static post(url: string): HTTPRequestBuilder {
    return new HTTPRequestBuilder().post().url(url);
  }

  static put(url: string): HTTPRequestBuilder {
    return new HTTPRequestBuilder().put().url(url);
  }

  static delete(url: string): HTTPRequestBuilder {
    return new HTTPRequestBuilder().delete().url(url);
  }

  // Internal setter methods for builders
  setAuth(auth: AuthConfig): this {
    this.requestData.auth = auth;
    return this;
  }

  setRetryStrategy(retryStrategy: RetryStrategy): this {
    this.requestData.retryStrategy = retryStrategy;
    return this;
  }

  setResponseHandling(responseHandling: ResponseHandling): this {
    this.requestData.responseHandling = responseHandling;
    return this;
  }

  setMultipart(multipart: MultipartConfig): this {
    this.requestData.multipart = multipart;
    return this;
  }
}

// ============================================================================
// AUTH BUILDER
// ============================================================================

class AuthBuilder {
  private parent: HTTPRequestBuilder;
  private authData: Partial<AuthConfig> = {};

  constructor(parent: HTTPRequestBuilder) {
    this.parent = parent;
  }

  bearer(token: string): this {
    if (!token || token.trim() === '') {
      throw new Error('Bearer token cannot be empty');
    }
    
    this.authData = {
      type: 'bearer',
      token: token.trim()
    };
    return this;
  }

  basic(username: string, password: string): this {
    if (!username || !password) {
      throw new Error('Username and password are required for basic auth');
    }
    
    this.authData = {
      type: 'basic',
      username,
      password
    };
    return this;
  }

  apiKey(header: string, key: string): this {
    if (!header || !key) {
      throw new Error('Header name and API key are required');
    }
    
    this.authData = {
      type: 'apiKey',
      apiKeyHeader: header,
      apiKey: key
    };
    return this;
  }

  oauth(config: AuthConfig['oauth']): this {
    if (!config || !config.clientId || !config.accessToken) {
      throw new Error('OAuth client ID and access token are required');
    }
    
    this.authData = {
      type: 'oauth',
      oauth: { ...config }
    };
    return this;
  }

  custom(headers: Record<string, string>): this {
    if (!headers || Object.keys(headers).length === 0) {
      throw new Error('Custom headers cannot be empty');
    }
    
    this.authData = {
      type: 'custom',
      customHeaders: { ...headers }
    };
    return this;
  }

  done(): HTTPRequestBuilder {
    const auth: AuthConfig = {
      type: this.authData.type!,
      token: this.authData.token,
      username: this.authData.username,
      password: this.authData.password,
      apiKey: this.authData.apiKey,
      apiKeyHeader: this.authData.apiKeyHeader,
      customHeaders: this.authData.customHeaders,
      oauth: this.authData.oauth
    };
    
    return this.parent.setAuth(auth);
  }
}

// ============================================================================
// RETRY STRATEGY BUILDER
// ============================================================================

class RetryStrategyBuilder {
  private parent: HTTPRequestBuilder;
  private retryData: Partial<RetryStrategy> = {
    attempts: 3,
    delay: 1000,
    backoff: 'exponential',
    maxDelay: 30000,
    retryOn: [408, 429, 500, 502, 503, 504]
  };

  constructor(parent: HTTPRequestBuilder) {
    this.parent = parent;
  }

  attempts(attempts: number): this {
    if (attempts < 1 || attempts > 10) {
      throw new Error('Retry attempts must be between 1 and 10');
    }
    this.retryData.attempts = attempts;
    return this;
  }

  delay(delayMs: number): this {
    if (delayMs < 0) {
      throw new Error('Delay cannot be negative');
    }
    this.retryData.delay = delayMs;
    return this;
  }

  backoff(strategy: RetryStrategy['backoff']): this {
    this.retryData.backoff = strategy;
    return this;
  }

  maxDelay(maxDelayMs: number): this {
    if (maxDelayMs < 0) {
      throw new Error('Max delay cannot be negative');
    }
    this.retryData.maxDelay = maxDelayMs;
    return this;
  }

  retryOn(statusCodes: number[]): this {
    if (!statusCodes || statusCodes.length === 0) {
      throw new Error('Retry status codes cannot be empty');
    }
    
    // Validate status codes
    const invalidCodes = statusCodes.filter(code => code < 100 || code > 599);
    if (invalidCodes.length > 0) {
      throw new Error(`Invalid status codes: ${invalidCodes.join(', ')}`);
    }
    
    this.retryData.retryOn = [...statusCodes];
    return this;
  }

  condition(shouldRetry: (error: any, attempt: number) => boolean): this {
    this.retryData.shouldRetry = shouldRetry;
    return this;
  }

  done(): HTTPRequestBuilder {
    const retryStrategy: RetryStrategy = {
      attempts: this.retryData.attempts!,
      delay: this.retryData.delay!,
      backoff: this.retryData.backoff!,
      maxDelay: this.retryData.maxDelay!,
      retryOn: [...this.retryData.retryOn!],
      shouldRetry: this.retryData.shouldRetry
    };
    
    return this.parent.setRetryStrategy(retryStrategy);
  }
}

// ============================================================================
// RESPONSE HANDLING BUILDER
// ============================================================================

class ResponseHandlingBuilder {
  private parent: HTTPRequestBuilder;
  private responseData: Partial<ResponseHandling> = {
    expectedStatus: 200,
    parseAs: 'json'
  };

  constructor(parent: HTTPRequestBuilder) {
    this.parent = parent;
  }

  expect(statusCode: number | number[]): this {
    if (Array.isArray(statusCode)) {
      const invalidCodes = statusCode.filter(code => code < 100 || code > 599);
      if (invalidCodes.length > 0) {
        throw new Error(`Invalid status codes: ${invalidCodes.join(', ')}`);
      }
      this.responseData.expectedStatus = [...statusCode];
    } else {
      if (statusCode < 100 || statusCode > 599) {
        throw new Error('Status code must be between 100 and 599');
      }
      this.responseData.expectedStatus = statusCode;
    }
    return this;
  }

  parseAs(format: ResponseHandling['parseAs']): this {
    this.responseData.parseAs = format;
    return this;
  }

  validateSchema(schema: any): this {
    this.responseData.validateSchema = schema;
    return this;
  }

  transform(transformer: (data: any) => any): this {
    if (typeof transformer !== 'function') {
      throw new Error('Transformer must be a function');
    }
    this.responseData.transformResponse = transformer;
    return this;
  }

  onError(errorHandler: (error: any) => any): this {
    if (typeof errorHandler !== 'function') {
      throw new Error('Error handler must be a function');
    }
    this.responseData.errorHandler = errorHandler;
    return this;
  }

  done(): HTTPRequestBuilder {
    const responseHandling: ResponseHandling = {
      expectedStatus: this.responseData.expectedStatus!,
      parseAs: this.responseData.parseAs!,
      validateSchema: this.responseData.validateSchema,
      transformResponse: this.responseData.transformResponse,
      errorHandler: this.responseData.errorHandler
    };
    
    return this.parent.setResponseHandling(responseHandling);
  }
}

// ============================================================================
// MULTIPART BUILDER
// ============================================================================

class MultipartBuilder {
  private parent: HTTPRequestBuilder;
  private multipartData: Partial<MultipartConfig> = {
    fields: {},
    files: []
  };

  constructor(parent: HTTPRequestBuilder) {
    this.parent = parent;
  }

  field(name: string, value: string): this {
    if (!name || name.trim() === '') {
      throw new Error('Field name cannot be empty');
    }
    
    this.multipartData.fields = {
      ...this.multipartData.fields!,
      [name]: value
    };
    return this;
  }

  file(fieldName: string, data: Buffer | string, filename: string, contentType?: string): this {
    if (!fieldName || fieldName.trim() === '') {
      throw new Error('Field name cannot be empty');
    }
    if (!filename || filename.trim() === '') {
      throw new Error('Filename cannot be empty');
    }
    
    const file: MultipartFile = {
      fieldName: fieldName.trim(),
      filename: filename.trim(),
      data,
      contentType: contentType || this.guessContentType(filename)
    };
    
    this.multipartData.files = [
      ...this.multipartData.files!,
      file
    ];
    return this;
  }

  boundary(boundary: string): this {
    if (!boundary || boundary.trim() === '') {
      throw new Error('Boundary cannot be empty');
    }
    this.multipartData.boundary = boundary.trim();
    return this;
  }

  done(): HTTPRequestBuilder {
    if (!this.multipartData.files || this.multipartData.files.length === 0) {
      throw new Error('Multipart request must have at least one file');
    }
    
    const multipart: MultipartConfig = {
      fields: { ...this.multipartData.fields! },
      files: [...this.multipartData.files],
      boundary: this.multipartData.boundary || this.generateBoundary()
    };
    
    return this.parent.setMultipart(multipart);
  }

  private guessContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'json': 'application/json',
      'xml': 'application/xml',
      'zip': 'application/zip'
    };
    
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  private generateBoundary(): string {
    return 'boundary-' + Math.random().toString(36).substr(2, 16);
  }
}

// ============================================================================
// HTTP CLIENT SIMULATOR
// ============================================================================

class HTTPClient {
  static async execute(request: HTTPRequest): Promise<any> {
    console.log(`\n🌐 Executing ${request.method} ${request.url}`);
    
    // Simulate request processing
    await this.delay(100);
    
    // Log request details
    console.log(`Headers: ${Object.keys(request.headers).length} headers`);
    if (request.auth) {
      console.log(`Auth: ${request.auth.type}`);
    }
    if (request.body) {
      console.log(`Body: ${typeof request.body} (${JSON.stringify(request.body).length} chars)`);
    }
    if (request.queryParams) {
      console.log(`Query Params: ${Object.keys(request.queryParams).length} params`);
    }
    if (request.retryStrategy) {
      console.log(`Retry: ${request.retryStrategy.attempts} attempts, ${request.retryStrategy.backoff} backoff`);
    }
    
    // Simulate response based on request
    const response = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      data: this.generateMockResponse(request)
    };
    
    console.log(`✅ Response: ${response.status} (${JSON.stringify(response.data).length} chars)`);
    
    return response;
  }

  private static generateMockResponse(request: HTTPRequest): any {
    switch (request.method) {
      case 'GET':
        return { message: 'Data retrieved successfully', timestamp: new Date().toISOString() };
      case 'POST':
        return { message: 'Resource created successfully', id: Math.floor(Math.random() * 1000) };
      case 'PUT':
        return { message: 'Resource updated successfully', id: Math.floor(Math.random() * 1000) };
      case 'DELETE':
        return { message: 'Resource deleted successfully' };
      default:
        return { message: 'Request processed successfully' };
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// REQUEST ANALYZER
// ============================================================================

class RequestAnalyzer {
  static analyze(request: HTTPRequest): { score: number; recommendations: string[]; warnings: string[] } {
    const recommendations: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check authentication
    if (!request.auth) {
      recommendations.push('Consider adding authentication for security');
      score -= 10;
    }

    // Check timeout
    if (request.timeout > 60000) {
      warnings.push('Very long timeout - may impact user experience');
      score -= 5;
    }

    // Check retry strategy
    if (!request.retryStrategy) {
      recommendations.push('Consider adding retry strategy for better reliability');
      score -= 10;
    } else if (request.retryStrategy.attempts > 5) {
      warnings.push('High retry attempts may cause delays');
      score -= 5;
    }

    // Check headers
    if (!request.headers['Accept']) {
      recommendations.push('Specify Accept header for better content negotiation');
      score -= 5;
    }

    // Check body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && !request.body && !request.multipart) {
      warnings.push(`${request.method} request without body`);
      score -= 10;
    }

    // Check response handling
    if (!request.responseHandling) {
      recommendations.push('Add response handling for better error management');
      score -= 10;
    }

    return { score: Math.max(0, score), recommendations, warnings };
  }
}

// ============================================================================
// USAGE DEMONSTRATIONS
// ============================================================================

// Usage Example - Following the documented API exactly
async function demonstrateHTTPRequestBuilder(): Promise<void> {
  console.log('=== HTTP REQUEST BUILDER DEMO ===');
  console.log('Following the documented API pattern:\n');

  // Mock authentication token
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  const fileBuffer = Buffer.from('mock file content');

  // API Request Example
  console.log('--- API Request Building ---');
  
  try {
    const apiRequest = new HTTPRequestBuilder()
      .method('POST')
      .url('/api/v1/users')
      .headers({ 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Version': '1.0'
      })
      .body({ 
        name: 'John Doe', 
        email: 'john@example.com',
        role: 'user'
      })
      .auth()
        .bearer(authToken)
        .done()
      .timeout(10000)
      .retryStrategy()
        .attempts(3)
        .delay(1000)
        .backoff('exponential')
        .retryOn([408, 429, 500, 502, 503, 504])
        .done()
      .responseHandling()
        .expect(201)
        .parseAs('json')
        .transform((data: any) => ({ ...data, processed: true }))
        .done()
      .build();

    console.log('API Request Configuration:');
    console.log(`Method: ${apiRequest.method}`);
    console.log(`URL: ${apiRequest.url}`);
    console.log(`Headers: ${Object.keys(apiRequest.headers).length} headers`);
    console.log(`Body: ${typeof apiRequest.body}`);
    console.log(`Auth: ${apiRequest.auth?.type}`);
    console.log(`Timeout: ${apiRequest.timeout}ms`);
    console.log(`Retry Attempts: ${apiRequest.retryStrategy?.attempts}`);
    console.log(`Expected Status: ${apiRequest.responseHandling?.expectedStatus}`);

    // Analyze request
    const analysis = RequestAnalyzer.analyze(apiRequest);
    console.log(`\nRequest Analysis Score: ${analysis.score}/100`);
    if (analysis.recommendations.length > 0) {
      console.log(`Recommendations: ${analysis.recommendations.join(', ')}`);
    }
    if (analysis.warnings.length > 0) {
      console.log(`Warnings: ${analysis.warnings.join(', ')}`);
    }

    // Execute request (simulated)
    await HTTPClient.execute(apiRequest);

  } catch (error) {
    console.error('❌ API request error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // File Upload Request Example
  console.log('--- File Upload Request Building ---');
  
  try {
    const uploadRequest = new HTTPRequestBuilder()
      .method('PUT')
      .url('/api/v1/files/upload')
      .multipart()
        .field('description', 'Profile picture')
        .file('avatar', fileBuffer, 'avatar.jpg', 'image/jpeg')
        .done()
      .auth()
        .apiKey('X-API-Key', 'your-api-key-here')
        .done()
      .progress((loaded, total) => {
        console.log(`Upload progress: ${(loaded / total * 100).toFixed(1)}%`);
      })
      .timeout(60000)
      .responseHandling()
        .expect([200, 201])
        .parseAs('json')
        .done()
      .build();

    console.log('Upload Request Configuration:');
    console.log(`Method: ${uploadRequest.method}`);
    console.log(`URL: ${uploadRequest.url}`);
    console.log(`Auth: ${uploadRequest.auth?.type} (${uploadRequest.auth?.apiKeyHeader})`);
    console.log(`Multipart: ${uploadRequest.multipart?.files.length} files, ${Object.keys(uploadRequest.multipart?.fields || {}).length} fields`);
    console.log(`Timeout: ${uploadRequest.timeout}ms`);
    console.log(`Progress Callback: ${uploadRequest.progressCallback ? 'Yes' : 'No'}`);

    // Execute upload request (simulated)
    await HTTPClient.execute(uploadRequest);

  } catch (error) {
    console.error('❌ Upload request error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // Complex Query Request Example
  console.log('--- Complex Query Request ---');
  
  try {
    const queryRequest = new HTTPRequestBuilder()
      .get()
      .url('/api/v1/products')
      .queryParams({ 
        category: 'electronics',
        minPrice: 100,
        maxPrice: 1000,
        sortBy: 'price',
        sortOrder: 'asc',
        page: 1,
        limit: 20
      })
      .headers({
        'Accept': 'application/json',
        'X-Client-Version': '2.1.0'
      })
      .auth()
        .oauth({
          clientId: 'your-client-id',
          clientSecret: 'your-client-secret',
          accessToken: 'access-token-here'
        })
        .done()
      .timeout(15000)
      .retryStrategy()
        .attempts(2)
        .delay(500)
        .backoff('linear')
        .retryOn([500, 502, 503])
        .condition((error, attempt) => {
          console.log(`Retry condition check: attempt ${attempt}, error: ${error.message}`);
          return attempt < 2;
        })
        .done()
      .responseHandling()
        .expect(200)
        .parseAs('json')
        .transform((data: any) => {
          return {
            products: data.items || [],
            totalCount: data.total || 0,
            currentPage: data.page || 1
          };
        })
        .onError((error: any) => {
          console.error('Custom error handler:', error.message);
          return { products: [], totalCount: 0, error: error.message };
        })
        .done()
      .build();

    console.log('Query Request Configuration:');
    console.log(`Method: ${queryRequest.method}`);
    console.log(`URL: ${queryRequest.url}`);
    console.log(`Query Params: ${Object.keys(queryRequest.queryParams || {}).length} params`);
    console.log(`Auth: ${queryRequest.auth?.type}`);
    console.log(`Retry: ${queryRequest.retryStrategy?.backoff} backoff`);
    console.log(`Response Transform: ${queryRequest.responseHandling?.transformResponse ? 'Yes' : 'No'}`);

    // Execute query request (simulated)
    await HTTPClient.execute(queryRequest);

  } catch (error) {
    console.error('❌ Query request error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // Static Factory Methods Example
  console.log('--- Static Factory Methods ---');
  
  try {
    const getRequest = HTTPRequestBuilder
      .get('/api/v1/user/profile')
      .auth()
        .bearer('token-123')
        .done()
      .build();

    const postRequest = HTTPRequestBuilder
      .post('/api/v1/comments')
      .json({ comment: 'Great article!', articleId: 123 })
      .auth()
        .bearer('token-123')
        .done()
      .build();

    const deleteRequest = HTTPRequestBuilder
      .delete('/api/v1/posts/456')
      .auth()
        .basic('admin', 'password')
        .done()
      .retryStrategy()
        .attempts(1)
        .done()
      .build();

    console.log('Factory Methods:');
    console.log(`GET: ${getRequest.method} ${getRequest.url} (Auth: ${getRequest.auth?.type})`);
    console.log(`POST: ${postRequest.method} ${postRequest.url} (Body: ${typeof postRequest.body})`);
    console.log(`DELETE: ${deleteRequest.method} ${deleteRequest.url} (Retries: ${deleteRequest.retryStrategy?.attempts})`);

    // Execute factory-created requests (simulated)
    await HTTPClient.execute(getRequest);
    await HTTPClient.execute(postRequest);
    await HTTPClient.execute(deleteRequest);

  } catch (error) {
    console.error('❌ Factory methods error:', error instanceof Error ? error.message : String(error));
  }

  console.log(`\n✅ Successfully demonstrated HTTP request builders with comprehensive configuration`);
}

// Testing Example
async function testHTTPRequestBuilder(): Promise<void> {
  console.log('\n=== HTTP REQUEST BUILDER TESTS ===');
  
  // Test 1: Required field validation
  console.log('Test 1 - Required field validation:');
  try {
    new HTTPRequestBuilder().build();
    console.log('❌ Should have thrown error for missing URL');
  } catch (error) {
    console.log('✅ Correctly validates required URL field');
  }

  // Test 2: URL validation
  console.log('\nTest 2 - URL validation:');
  try {
    new HTTPRequestBuilder().url('invalid-url').build();
    console.log('❌ Should have thrown error for invalid URL');
  } catch (error) {
    console.log('✅ Correctly validates URL format');
  }

  // Test 3: Method and body validation
  console.log('\nTest 3 - Method and body validation:');
  try {
    new HTTPRequestBuilder()
      .get()
      .url('/test')
      .body({ data: 'test' })
      .build();
    console.log('❌ Should have thrown error for GET with body');
  } catch (error) {
    console.log('✅ Correctly validates GET requests cannot have body');
  }

  // Test 4: Auth builder chaining
  console.log('\nTest 4 - Auth builder chaining:');
  const requestWithAuth = new HTTPRequestBuilder()
    .get()
    .url('/test')
    .auth()
      .bearer('token-123')
      .done()
    .build();

  console.log(`✅ Auth chaining works: ${requestWithAuth.auth?.type === 'bearer'}`);

  // Test 5: Retry strategy validation
  console.log('\nTest 5 - Retry strategy validation:');
  try {
    new HTTPRequestBuilder()
      .get()
      .url('/test')
      .retryStrategy()
        .attempts(15)
        .done();
    console.log('❌ Should have thrown error for too many retry attempts');
  } catch (error) {
    console.log('✅ Correctly validates retry attempt limits');
  }

  // Test 6: Request analysis
  console.log('\nTest 6 - Request analysis:');
  const basicRequest = new HTTPRequestBuilder()
    .get()
    .url('/test')
    .build();

  const analysis = RequestAnalyzer.analyze(basicRequest);
  console.log(`✅ Analysis works: Score ${analysis.score}, ${analysis.recommendations.length} recommendations`);

  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateHTTPRequestBuilder();
  await testHTTPRequestBuilder();
  exit(0);
})();

export {
  HTTPRequestBuilder,
  AuthBuilder,
  RetryStrategyBuilder,
  ResponseHandlingBuilder,
  MultipartBuilder,
  HTTPClient,
  RequestAnalyzer,
  HTTPRequest,
  AuthConfig,
  RetryStrategy,
  ResponseHandling
}; 