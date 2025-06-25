import { exit } from "process";

// ============================================================================
// FLUENT API BUILDER IMPLEMENTATION
// ============================================================================

/**
 * Base class for fluent builders with common functionality.
 */
abstract class FluentBuilder<T> {
  protected value: T;

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  /**
   * Build and return the final value.
   */
  build(): T {
    return this.value;
  }

  /**
   * Get the current value without building.
   */
  getValue(): T {
    return this.value;
  }
}

// ============================================================================
// HTTP REQUEST BUILDER
// ============================================================================

interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: any;
  timeout: number;
  retries: number;
  cache: boolean;
}

class HttpRequestBuilder extends FluentBuilder<HttpRequest> {
  constructor() {
    super({
      method: 'GET',
      url: '',
      headers: {},
      timeout: 30000,
      retries: 0,
      cache: false
    });
  }

  method(method: HttpRequest['method']): this {
    this.value.method = method;
    return this;
  }

  url(url: string): this {
    this.value.url = url;
    return this;
  }

  header(key: string, value: string): this {
    this.value.headers[key] = value;
    return this;
  }

  headers(headers: Record<string, string>): this {
    this.value.headers = { ...this.value.headers, ...headers };
    return this;
  }

  body(body: any): this {
    this.value.body = body;
    return this;
  }

  timeout(timeout: number): this {
    this.value.timeout = timeout;
    return this;
  }

  retries(retries: number): this {
    this.value.retries = retries;
    return this;
  }

  cache(enable: boolean = true): this {
    this.value.cache = enable;
    return this;
  }

  // Convenience methods
  get(url: string): this {
    return this.method('GET').url(url);
  }

  post(url: string, body?: any): this {
    return this.method('POST').url(url).body(body);
  }

  put(url: string, body?: any): this {
    return this.method('PUT').url(url).body(body);
  }

  delete(url: string): this {
    return this.method('DELETE').url(url);
  }

  json(): this {
    return this.header('Content-Type', 'application/json');
  }

  auth(token: string): this {
    return this.header('Authorization', `Bearer ${token}`);
  }

  userAgent(agent: string): this {
    return this.header('User-Agent', agent);
  }
}

// ============================================================================
// DATABASE QUERY BUILDER
// ============================================================================

interface SqlQuery {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  columns: string[];
  where: string[];
  orderBy: string[];
  limit?: number;
  offset?: number;
  values: any[];
  joins: string[];
}

class SqlQueryBuilder extends FluentBuilder<SqlQuery> {
  constructor() {
    super({
      type: 'SELECT',
      table: '',
      columns: ['*'],
      where: [],
      orderBy: [],
      values: [],
      joins: []
    });
  }

  select(...columns: string[]): this {
    this.value.type = 'SELECT';
    this.value.columns = columns.length > 0 ? columns : ['*'];
    return this;
  }

  insert(table: string): this {
    this.value.type = 'INSERT';
    this.value.table = table;
    return this;
  }

  update(table: string): this {
    this.value.type = 'UPDATE';
    this.value.table = table;
    return this;
  }

  delete(table: string): this {
    this.value.type = 'DELETE';
    this.value.table = table;
    return this;
  }

  from(table: string): this {
    this.value.table = table;
    return this;
  }

  where(condition: string, ...params: any[]): this {
    this.value.where.push(condition);
    this.value.values.push(...params);
    return this;
  }

  andWhere(condition: string, ...params: any[]): this {
    return this.where(`AND ${condition}`, ...params);
  }

  orWhere(condition: string, ...params: any[]): this {
    return this.where(`OR ${condition}`, ...params);
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.value.orderBy.push(`${column} ${direction}`);
    return this;
  }

  limit(limit: number): this {
    this.value.limit = limit;
    return this;
  }

  offset(offset: number): this {
    this.value.offset = offset;
    return this;
  }

  join(table: string, condition: string): this {
    this.value.joins.push(`JOIN ${table} ON ${condition}`);
    return this;
  }

  leftJoin(table: string, condition: string): this {
    this.value.joins.push(`LEFT JOIN ${table} ON ${condition}`);
    return this;
  }

  values(data: Record<string, any>): this {
    if (this.value.type === 'INSERT') {
      const columns = Object.keys(data);
      const values = Object.values(data);
      this.value.columns = columns;
      this.value.values = values;
    }
    return this;
  }

  set(data: Record<string, any>): this {
    if (this.value.type === 'UPDATE') {
      const sets = Object.entries(data).map(([key, value]) => `${key} = ?`);
      this.value.columns = sets;
      this.value.values = Object.values(data);
    }
    return this;
  }

  // Build the final SQL string
  toSql(): string {
    const query = this.value;
    let sql = '';

    switch (query.type) {
      case 'SELECT':
        sql = `SELECT ${query.columns.join(', ')} FROM ${query.table}`;
        break;
      case 'INSERT':
        const columns = query.columns.join(', ');
        const placeholders = query.columns.map(() => '?').join(', ');
        sql = `INSERT INTO ${query.table} (${columns}) VALUES (${placeholders})`;
        break;
      case 'UPDATE':
        const sets = query.columns.join(', ');
        sql = `UPDATE ${query.table} SET ${sets}`;
        break;
      case 'DELETE':
        sql = `DELETE FROM ${query.table}`;
        break;
    }

    if (query.joins.length > 0) {
      sql += ' ' + query.joins.join(' ');
    }

    if (query.where.length > 0) {
      sql += ' WHERE ' + query.where.join(' ');
    }

    if (query.orderBy.length > 0) {
      sql += ' ORDER BY ' + query.orderBy.join(', ');
    }

    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
    }

    if (query.offset) {
      sql += ` OFFSET ${query.offset}`;
    }

    return sql;
  }
}

// ============================================================================
// EMAIL BUILDER
// ============================================================================

interface Email {
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  attachments: string[];
  priority: 'low' | 'normal' | 'high';
  replyTo?: string;
}

class EmailBuilder extends FluentBuilder<Email> {
  constructor() {
    super({
      from: '',
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      body: '',
      attachments: [],
      priority: 'normal'
    });
  }

  from(sender: string): this {
    this.value.from = sender;
    return this;
  }

  to(recipient: string | string[]): this {
    const recipients = Array.isArray(recipient) ? recipient : [recipient];
    this.value.to.push(...recipients);
    return this;
  }

  cc(recipient: string | string[]): this {
    const recipients = Array.isArray(recipient) ? recipient : [recipient];
    this.value.cc.push(...recipients);
    return this;
  }

  bcc(recipient: string | string[]): this {
    const recipients = Array.isArray(recipient) ? recipient : [recipient];
    this.value.bcc.push(...recipients);
    return this;
  }

  subject(subject: string): this {
    this.value.subject = subject;
    return this;
  }

  body(body: string): this {
    this.value.body = body;
    return this;
  }

  html(html: string): this {
    this.value.body = html;
    return this;
  }

  text(text: string): this {
    this.value.body = text;
    return this;
  }

  attachment(file: string): this {
    this.value.attachments.push(file);
    return this;
  }

  attachments(files: string[]): this {
    this.value.attachments.push(...files);
    return this;
  }

  priority(priority: Email['priority']): this {
    this.value.priority = priority;
    return this;
  }

  replyTo(email: string): this {
    this.value.replyTo = email;
    return this;
  }

  // Convenience methods
  highPriority(): this {
    return this.priority('high');
  }

  lowPriority(): this {
    return this.priority('low');
  }

  urgent(): this {
    return this.priority('high');
  }
}

// ============================================================================
// CONFIGURATION BUILDER
// ============================================================================

interface AppConfig {
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  server: {
    port: number;
    host: string;
    cors: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file: string;
    console: boolean;
  };
  features: {
    cache: boolean;
    rateLimit: boolean;
    compression: boolean;
  };
}

class ConfigBuilder extends FluentBuilder<AppConfig> {
  constructor() {
    super({
      database: {
        host: 'localhost',
        port: 5432,
        name: 'app',
        user: 'postgres',
        password: ''
      },
      server: {
        port: 3000,
        host: 'localhost',
        cors: false
      },
      logging: {
        level: 'info',
        file: 'app.log',
        console: true
      },
      features: {
        cache: false,
        rateLimit: false,
        compression: false
      }
    });
  }

  database(config: Partial<AppConfig['database']>): this {
    this.value.database = { ...this.value.database, ...config };
    return this;
  }

  server(config: Partial<AppConfig['server']>): this {
    this.value.server = { ...this.value.server, ...config };
    return this;
  }

  logging(config: Partial<AppConfig['logging']>): this {
    this.value.logging = { ...this.value.logging, ...config };
    return this;
  }

  features(config: Partial<AppConfig['features']>): this {
    this.value.features = { ...this.value.features, ...config };
    return this;
  }

  // Convenience methods
  development(): this {
    return this
      .logging({ level: 'debug', console: true })
      .features({ cache: false, rateLimit: false, compression: false });
  }

  production(): this {
    return this
      .logging({ level: 'warn', console: false })
      .features({ cache: true, rateLimit: true, compression: true });
  }

  testing(): this {
    return this
      .database({ name: 'test_db' })
      .server({ port: 0 })
      .logging({ level: 'error', console: false });
  }
}

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

const demonstrateHttpRequestBuilder = () => {
  console.log("\n=== HTTP Request Builder ===");
  
  // Simple GET request
  const getRequest = new HttpRequestBuilder()
    .get('https://api.example.com/users')
    .json()
    .userAgent('MyApp/1.0')
    .timeout(5000)
    .build();
  
  console.log("GET Request:", JSON.stringify(getRequest, null, 2));
  
  // Complex POST request
  const postRequest = new HttpRequestBuilder()
    .post('https://api.example.com/users', { name: 'John', email: 'john@example.com' })
    .json()
    .auth('abc123')
    .header('X-Request-ID', 'req-123')
    .timeout(10000)
    .retries(3)
    .cache(false)
    .build();
  
  console.log("POST Request:", JSON.stringify(postRequest, null, 2));
  
  // API client style
  const apiClient = {
    getUsers: () => new HttpRequestBuilder()
      .get('https://api.example.com/users')
      .json()
      .auth('token123')
      .build(),
    
    createUser: (userData: any) => new HttpRequestBuilder()
      .post('https://api.example.com/users', userData)
      .json()
      .auth('token123')
      .build()
  };
  
  console.log("API Client - Get Users:", apiClient.getUsers());
  console.log("API Client - Create User:", apiClient.createUser({ name: 'Alice' }));
};

const demonstrateSqlQueryBuilder = () => {
  console.log("\n=== SQL Query Builder ===");
  
  // SELECT query
  const selectQuery = new SqlQueryBuilder()
    .select('id', 'name', 'email')
    .from('users')
    .where('age > ?', 18)
    .andWhere('status = ?', 'active')
    .orderBy('name', 'ASC')
    .limit(10)
    .offset(0);
  
  console.log("SELECT Query SQL:", selectQuery.toSql());
  console.log("SELECT Query Values:", selectQuery.getValue().values);
  
  // INSERT query
  const insertQuery = new SqlQueryBuilder()
    .insert('users')
    .values({ name: 'John Doe', email: 'john@example.com', age: 30 });
  
  console.log("INSERT Query SQL:", insertQuery.toSql());
  console.log("INSERT Query Values:", insertQuery.getValue().values);
  
  // UPDATE query
  const updateQuery = new SqlQueryBuilder()
    .update('users')
    .set({ status: 'inactive', updated_at: new Date() })
    .where('id = ?', 123);
  
  console.log("UPDATE Query SQL:", updateQuery.toSql());
  console.log("UPDATE Query Values:", updateQuery.getValue().values);
  
  // Complex query with joins
  const complexQuery = new SqlQueryBuilder()
    .select('u.name', 'u.email', 'p.title')
    .from('users u')
    .leftJoin('profiles p', 'u.id = p.user_id')
    .where('u.created_at > ?', '2023-01-01')
    .orderBy('u.name', 'ASC')
    .limit(50);
  
  console.log("Complex Query SQL:", complexQuery.toSql());
};

const demonstrateEmailBuilder = () => {
  console.log("\n=== Email Builder ===");
  
  // Simple email
  const simpleEmail = new EmailBuilder()
    .from('noreply@example.com')
    .to('user@example.com')
    .subject('Welcome to our platform!')
    .text('Thank you for joining us.')
    .build();
  
  console.log("Simple Email:", JSON.stringify(simpleEmail, null, 2));
  
  // Complex email
  const complexEmail = new EmailBuilder()
    .from('support@example.com')
    .to(['user1@example.com', 'user2@example.com'])
    .cc('manager@example.com')
    .bcc('admin@example.com')
    .subject('Important: System Maintenance')
    .html('<h1>System Maintenance</h1><p>Please be aware of scheduled maintenance.</p>')
    .attachment('maintenance-schedule.pdf')
    .highPriority()
    .replyTo('tech-support@example.com')
    .build();
  
  console.log("Complex Email:", JSON.stringify(complexEmail, null, 2));
  
  // Email templates
  const emailTemplates = {
    welcome: (userName: string) => new EmailBuilder()
      .from('welcome@example.com')
      .subject(`Welcome ${userName}!`)
      .html(`<h1>Welcome ${userName}!</h1><p>We're excited to have you on board.</p>`)
      .build(),
    
    passwordReset: (resetLink: string) => new EmailBuilder()
      .from('security@example.com')
      .subject('Password Reset Request')
      .html(`<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`)
      .highPriority()
      .build()
  };
  
  console.log("Welcome Template:", emailTemplates.welcome('Alice'));
  console.log("Password Reset Template:", emailTemplates.passwordReset('https://reset.example.com/token123'));
};

const demonstrateConfigBuilder = () => {
  console.log("\n=== Configuration Builder ===");
  
  // Development config
  const devConfig = new ConfigBuilder()
    .development()
    .database({ name: 'dev_db', password: 'dev_pass' })
    .server({ port: 3001 })
    .build();
  
  console.log("Development Config:", JSON.stringify(devConfig, null, 2));
  
  // Production config
  const prodConfig = new ConfigBuilder()
    .production()
    .database({ 
      host: 'prod-db.example.com', 
      name: 'prod_db', 
      password: 'prod_pass' 
    })
    .server({ port: 80, host: '0.0.0.0' })
    .build();
  
  console.log("Production Config:", JSON.stringify(prodConfig, null, 2));
  
  // Custom config
  const customConfig = new ConfigBuilder()
    .database({ host: 'custom-db', port: 5433 })
    .server({ port: 8080, cors: true })
    .logging({ level: 'debug', file: 'custom.log' })
    .features({ cache: true, rateLimit: true, compression: false })
    .build();
  
  console.log("Custom Config:", JSON.stringify(customConfig, null, 2));
};

const demonstrateBuilderComposition = () => {
  console.log("\n=== Builder Composition ===");
  
  // Compose multiple builders
  const createApiRequest = (endpoint: string, data?: any) => {
    const builder = new HttpRequestBuilder()
      .url(`https://api.example.com${endpoint}`)
      .json()
      .auth('api-token')
      .timeout(10000);
    
    if (data) {
      builder.post(endpoint, data);
    } else {
      builder.get(endpoint);
    }
    
    return builder.build();
  };
  
  const createUserQuery = (filters: Record<string, any>) => {
    const builder = new SqlQueryBuilder()
      .select('*')
      .from('users');
    
    Object.entries(filters).forEach(([key, value]) => {
      builder.where(`${key} = ?`, value);
    });
    
    return builder;
  };
  
  console.log("API Request:", createApiRequest('/users/123'));
  console.log("User Query:", createUserQuery({ status: 'active', role: 'user' }).toSql());
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = () => {
  console.log("🔨 Builder Pattern: Fluent API Builders");
  console.log("=".repeat(60));
  
  try {
    demonstrateHttpRequestBuilder();
    demonstrateSqlQueryBuilder();
    demonstrateEmailBuilder();
    demonstrateConfigBuilder();
    demonstrateBuilderComposition();
    
    console.log("\n✅ All Builder pattern examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running Builder examples:", error);
  }
};

// Run the examples
main();

exit(0); 