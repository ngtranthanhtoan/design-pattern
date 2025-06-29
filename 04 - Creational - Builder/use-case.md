# Builder Pattern Use Cases

## When to Use the Builder Pattern

The Builder pattern is ideal when you need to construct complex objects step by step, especially when the object has many optional parameters, requires validation during construction, or benefits from a fluent, readable API.

## Real-World Implemented Examples

The following use cases are implemented in our code files with complete working examples:

### 1. **Configuration Builder** 🔧
**Problem**: Application configurations often have dozens of optional parameters, default values, validation rules, and environment-specific settings. Traditional constructors become unwieldy, and it's easy to make mistakes with parameter order.

**Solution**: A builder that constructs configuration objects step by step, with validation, defaults, and a fluent API for readability.

**Real-world Implementation**:
```typescript
const dbConfig = new DatabaseConfigurationBuilder()
  .host('localhost')
  .port(5432)
  .database('myapp_production')
  .credentials('admin', 'secure_password')
  .poolSettings({ min: 2, max: 10, acquireTimeoutMillis: 30000 })
  .ssl(true)
  .timeout(45000)
  .retryOptions({ attempts: 3, delay: 1000 })
  .compression(true)
  .build();

const appConfig = new ApplicationConfigurationBuilder()
  .environment('production')
  .logging({ level: 'info', destination: 'file' })
  .cache({ ttl: 3600, maxSize: 1000 })
  .security({ cors: true, helmet: true })
  .build();
```

**Use Cases**:
- Database connection configurations
- Application settings and feature flags
- API client configurations
- Build system configurations
- Docker/Kubernetes deployment configs

### 2. **Query Builder** 📝
**Problem**: Building complex database queries programmatically is error-prone and hard to read. Different databases have different syntax, and queries often need to be constructed conditionally based on user input.

**Solution**: A builder that constructs queries step by step with type safety, validation, and support for different database dialects.

**Real-world Implementation**:
```typescript
const sqlQuery = new SQLQueryBuilder()
  .select(['u.name', 'u.email', 'p.bio'])
  .from('users u')
  .join('profiles p', 'u.id = p.user_id')
  .where('u.status', '=', 'active')
  .where('u.created_at', '>=', '2024-01-01')
  .orderBy('u.created_at', 'DESC')
  .limit(50)
  .offset(100)
  .build();

const elasticQuery = new ElasticsearchQueryBuilder()
  .index('products')
  .match('name', 'laptop')
  .filter('price', { gte: 500, lte: 2000 })
  .filter('category', ['electronics', 'computers'])
  .sort('price', 'asc')
  .size(20)
  .from(0)
  .build();
```

**Use Cases**:
- SQL query builders for ORMs
- NoSQL query construction
- Search engine queries (Elasticsearch, Solr)
- GraphQL query builders
- Reporting and analytics queries

### 3. **Document Builder** 📄
**Problem**: Generating complex documents (PDFs, HTML reports, emails) programmatically requires managing many elements, styles, layouts, and content blocks. The construction process is often complex and needs to be flexible.

**Solution**: A builder that constructs documents step by step, managing layout, styling, content hierarchy, and different output formats.

**Real-world Implementation**:
```typescript
const pdfReport = new PDFDocumentBuilder()
  .title('Monthly Sales Report')
  .metadata({ author: 'System', subject: 'Sales Analytics' })
  .header()
    .logo('./assets/company-logo.png')
    .title('Sales Department')
    .subtitle('Monthly Performance Report')
    .done()
  .section('Executive Summary')
    .paragraph('This month showed exceptional growth across all categories...')
    .chart('sales-trend', monthlySalesData)
    .done()
  .section('Detailed Analysis')
    .table('sales-by-region', regionData, { striped: true, borders: true })
    .pageBreak()
    .subSection('Top Performers')
      .list(topPerformers, 'ordered')
      .done()
    .done()
  .footer('Confidential - Internal Use Only')
  .build();

const emailTemplate = new EmailTemplateBuilder()
  .subject('Welcome to Our Platform!')
  .from('noreply@company.com')
  .template('welcome')
  .header({ logo: 'logo.png', title: 'Welcome!' })
  .content()
    .greeting('Hi {{firstName}}!')
    .paragraph('Thank you for joining our platform...')
    .button('Get Started', '{{activationLink}}')
    .done()
  .footer({ unsubscribe: true, social: ['twitter', 'linkedin'] })
  .build();
```

**Use Cases**:
- PDF report generation
- Email template builders
- HTML document generation
- Invoice and receipt builders
- Marketing material generators

### 4. **Test Data Builder** 🧪
**Problem**: Creating realistic test data is time-consuming and error-prone. Test objects often need many related properties, realistic relationships, and different variations for different test scenarios.

**Solution**: A builder that creates test objects with realistic defaults, relationships, and easy customization for specific test cases.

**Real-world Implementation**:
```typescript
const testUser = new UserTestDataBuilder()
  .name('John Doe')
  .email('john.doe@example.com')
  .age(30)
  .role('admin')
  .permissions(['read', 'write', 'delete'])
  .profile()
    .bio('Software engineer with 10 years experience')
    .avatar('https://example.com/avatars/john.jpg')
    .location('San Francisco, CA')
    .timezone('America/Los_Angeles')
    .done()
  .preferences()
    .theme('dark')
    .language('en-US')
    .notifications({ email: true, push: false })
    .done()
  .auditInfo()
    .createdAt(new Date('2023-01-15'))
    .lastLogin(new Date('2024-06-25'))
    .loginCount(156)
    .done()
  .build();

const testOrder = new OrderTestDataBuilder()
  .id('ORD-2024-001234')
  .customer(testUser)
  .status('pending')
  .items([
    { name: 'Laptop Pro', price: 2499.99, quantity: 1 },
    { name: 'Wireless Mouse', price: 79.99, quantity: 2 }
  ])
  .shipping()
    .address('123 Main St, San Francisco, CA 94105')
    .method('express')
    .cost(15.99)
    .estimatedDelivery(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))
    .done()
  .payment()
    .method('credit_card')
    .last4('1234')
    .status('authorized')
    .done()
  .build();
```

**Use Cases**:
- Unit test data creation
- Integration test scenarios
- Mock API responses
- Database seed data
- Performance test data generation

### 5. **HTTP Request Builder** 🌐
**Problem**: Building HTTP requests programmatically often involves many optional parameters (headers, query params, body, authentication, retry logic). Different APIs have different requirements, and requests need to be customizable and reusable.

**Solution**: A builder that constructs HTTP requests step by step with support for different authentication methods, retry strategies, and response handling.

**Real-world Implementation**:
```typescript
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
    .validateSchema(userSchema)
    .done()
  .build();

const uploadRequest = new HTTPRequestBuilder()
  .method('PUT')
  .url('/api/v1/files/upload')
  .multipart()
    .field('description', 'Profile picture')
    .file('avatar', fileBuffer, 'avatar.jpg')
    .done()
  .auth()
    .apiKey('X-API-Key', process.env.API_KEY!)
    .done()
  .progress((loaded, total) => {
    console.log(`Upload progress: ${(loaded / total * 100).toFixed(1)}%`);
  })
  .timeout(60000)
  .build();
```

**Use Cases**:
- REST API clients
- GraphQL request builders
- File upload handlers
- Webhook builders
- Microservice communication

## When NOT to Use Builder Pattern

### ❌ Avoid Builder When:

1. **Simple Objects** - Objects with 1-3 parameters that rarely change
2. **Performance Critical** - High-frequency object creation where builder overhead matters
3. **Mutable Objects** - Objects that need to be modified after creation
4. **Standard Constructors Suffice** - When parameter validation and defaults aren't complex

## Advanced Builder Patterns

### 1. **Type-Safe Step Builder**
```typescript
// Ensures required steps are completed at compile time
const config = DatabaseConfigurationBuilder
  .newConfig()
  .host('localhost')      // Returns HostSetBuilder
  .port(5432)            // Returns PortSetBuilder  
  .database('myapp')     // Returns DatabaseSetBuilder
  .build();              // Only available after all required steps
```

### 2. **Hierarchical Builder**
```typescript
// Supports nested object construction
const document = PDFDocumentBuilder
  .newDocument()
  .section('Chapter 1')
    .paragraph('Introduction...')
    .subSection('Overview')
      .paragraph('This chapter covers...')
      .done()
    .done()
  .build();
```

### 3. **Conditional Builder**
```typescript
// Supports conditional construction logic
const query = SQLQueryBuilder
  .select('*')
  .from('users')
  .conditionally(includeInactive, builder => 
    builder.where('status', 'IN', ['active', 'inactive'])
  )
  .conditionally(userRole === 'admin', builder =>
    builder.select('sensitive_data')
  )
  .build();
```

### 4. **Template Builder**
```typescript
// Supports predefined templates and customization
const emailTemplate = EmailTemplateBuilder
  .fromTemplate('welcome')
  .customize()
    .subject('Welcome to {{companyName}}!')
    .addSection('custom-promo')
    .done()
  .build();
```

## Modern TypeScript Features

### 1. **Generic Builders**
```typescript
class ConfigurationBuilder<T> {
  private config: Partial<T> = {};
  
  set<K extends keyof T>(key: K, value: T[K]): this {
    this.config[key] = value;
    return this;
  }
  
  build(): T {
    return this.config as T;
  }
}
```

### 2. **Branded Types for Validation**
```typescript
type ValidatedEmail = string & { __brand: 'ValidatedEmail' };
type ValidatedURL = string & { __brand: 'ValidatedURL' };

class RequestBuilder {
  email(email: ValidatedEmail): this { /*...*/ }
  url(url: ValidatedURL): this { /*...*/ }
}
```

### 3. **Conditional Methods**
```typescript
type BuilderWithAuth<T> = T extends { requiresAuth: true } 
  ? T & { auth(token: string): T }
  : T;
```

## Best Practices

1. **Start Simple** - Begin with basic fluent interface, add complexity as needed
2. **Validate Early** - Catch errors during construction, not at runtime
3. **Immutable Products** - Build immutable objects to prevent accidental modification
4. **Provide Defaults** - Sensible defaults for optional parameters
5. **Type Safety** - Use TypeScript features to prevent invalid construction
6. **Clear APIs** - Method names should clearly indicate what they do
7. **Consistent Naming** - Use consistent patterns across similar builders
8. **Documentation** - Document required vs optional methods clearly

## Industry Examples

- **Axios** - HTTP request configuration
- **Knex.js** - SQL query builder
- **Puppeteer** - Browser automation configuration
- **Jest** - Test configuration and mocking
- **Webpack** - Build configuration
- **Docker** - Dockerfile and compose builders
- **Terraform** - Infrastructure configuration
- **React Testing Library** - Test utilities and queries

## Testing Strategies

1. **Builder Testing** - Test each builder method individually
2. **Integration Testing** - Test complete construction workflows
3. **Validation Testing** - Test error cases and validation rules
4. **Default Testing** - Verify default values are applied correctly
5. **Immutability Testing** - Ensure products cannot be modified after construction

The Builder pattern is essential for creating complex objects in a maintainable and readable way. It provides excellent flexibility for object construction while maintaining type safety and validation. 