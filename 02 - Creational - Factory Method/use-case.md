# Factory Method Pattern Use Cases

## When to Use the Factory Method Pattern

The Factory Method pattern is ideal when you need to create objects but don't know the exact types until runtime, or when you want to delegate object creation to subclasses.

## Real-World Implemented Examples

The following use cases are implemented in our code files with complete working examples:

### 1. **Database Connection Factory** 🗄️
**Problem**: Your application needs to connect to different database types (MySQL, PostgreSQL, MongoDB) based on configuration, but you want consistent interface and don't want to scatter database-specific logic throughout your code.

**Solution**: A factory that creates appropriate database connections based on the database type, while providing a unified interface.

**Real-world Implementation**:
```typescript
const dbFactory = DatabaseConnectionFactory.create('postgresql');
const connection = await dbFactory.connect({
  host: 'localhost',
  database: 'myapp',
  username: 'user',
  password: 'pass'
});

// Same interface regardless of database type
const users = await connection.query('SELECT * FROM users');
```

**Use Cases**:
- Multi-tenant applications supporting different databases
- Microservices with different data storage needs
- Development/staging/production environment differences
- Database migration scenarios
- Cloud provider flexibility

### 2. **Document Parser Factory** 📄
**Problem**: Your application needs to parse different document formats (PDF, Excel, Word, JSON, XML) but you want a unified parsing interface without coupling your code to specific parser libraries.

**Solution**: A factory that creates appropriate parsers based on file type or content, providing consistent parsing methods.

**Real-world Implementation**:
```typescript
const parserFactory = DocumentParserFactory.createParser('application/pdf');
const document = await parserFactory.parse('./invoice.pdf');

console.log('Title:', document.getTitle());
console.log('Text:', document.getText());
console.log('Metadata:', document.getMetadata());
```

**Use Cases**:
- Document management systems
- Data extraction pipelines
- Content management platforms
- Report generation systems
- File processing workflows

### 3. **UI Component Factory** 🎨
**Problem**: Your application needs to render different UI components based on themes, platforms, or user preferences, but you want consistent component interfaces.

**Solution**: A factory that creates platform-specific or theme-specific UI components while maintaining the same interface.

**Real-world Implementation**:
```typescript
const componentFactory = UIComponentFactory.create('material-design');
const button = componentFactory.createButton({
  text: 'Submit',
  variant: 'primary',
  size: 'large'
});

button.render(); // Renders Material Design button
button.onClick(() => console.log('Button clicked!'));
```

**Use Cases**:
- Cross-platform applications
- White-label applications with different themes
- Responsive design with different layouts
- A/B testing different UI versions
- Accessibility variations

### 4. **Logger Factory** 📝
**Problem**: Your application needs different logging strategies (console, file, remote service, database) based on environment or configuration, but you want a unified logging interface.

**Solution**: A factory that creates appropriate loggers based on environment or configuration while providing consistent logging methods.

**Real-world Implementation**:
```typescript
const loggerFactory = LoggerFactory.create('file', {
  filename: './logs/app.log',
  level: 'info'
});

const logger = loggerFactory.getLogger('UserService');
logger.info('User created', { userId: 123, email: 'user@example.com' });
logger.error('Login failed', { attempt: 3, ip: '192.168.1.1' });
```

**Use Cases**:
- Environment-specific logging (dev vs prod)
- Centralized logging systems
- Audit trail requirements
- Performance monitoring
- Debugging and troubleshooting

### 5. **Payment Processor Factory** 💳
**Problem**: Your e-commerce application needs to support multiple payment methods (credit cards, PayPal, cryptocurrency, bank transfers) but you want a unified payment interface.

**Solution**: A factory that creates appropriate payment processors based on the chosen payment method while providing consistent payment operations.

**Real-world Implementation**:
```typescript
const paymentFactory = PaymentProcessorFactory.create('stripe');
const processor = paymentFactory.createProcessor({
  apiKey: 'sk_test_...',
  environment: 'sandbox'
});

const result = await processor.processPayment({
  amount: 9999, // $99.99
  currency: 'USD',
  paymentMethod: 'card',
  description: 'Premium subscription'
});
```

**Use Cases**:
- E-commerce platforms
- Subscription services
- Marketplace applications
- Multi-regional payment support
- Payment method A/B testing

## When NOT to Use Factory Method

### ❌ Avoid Factory Method When:

1. **Simple object creation** - If you're just creating one type of object
2. **No variation needed** - When object creation logic won't change
3. **Over-engineering** - Adding unnecessary complexity for simple scenarios
4. **Performance critical** - When the extra abstraction layer impacts performance
5. **Small applications** - When the flexibility isn't worth the added complexity

## Modern Alternatives and Variations

### 1. **Dependency Injection**
```typescript
// Instead of Factory Method
class OrderService {
  constructor(private paymentProcessor: PaymentProcessor) {}
}

// Inject the specific implementation
container.bind(PaymentProcessor).to(StripePaymentProcessor);
```

### 2. **Factory Functions (Functional Approach)**
```typescript
// Simpler factory function approach
const createDatabase = (type: string) => {
  switch (type) {
    case 'postgres': return new PostgreSQLDatabase();
    case 'mysql': return new MySQLDatabase();
    default: throw new Error(`Unknown database type: ${type}`);
  }
};
```

### 3. **Builder Pattern with Factory**
```typescript
// Combining Builder with Factory for complex object creation
const database = DatabaseBuilder
  .forType('postgresql')
  .withHost('localhost')
  .withCredentials('user', 'pass')
  .withPoolSize(10)
  .build();
```

## Best Practices

1. **Use interfaces/abstract classes** - Define clear contracts for products
2. **Keep factories focused** - Each factory should create related objects
3. **Consider configuration** - Use dependency injection for factory configuration
4. **Handle errors gracefully** - Provide meaningful error messages for unknown types
5. **Document factory capabilities** - Make it clear what types can be created
6. **Test thoroughly** - Ensure all factory paths work correctly
7. **Version compatibility** - Consider how new product types affect existing code

## Industry Examples

- **Hibernate ORM** - Creates different database dialects
- **Jackson JSON** - Creates parsers for different data formats
- **Spring Framework** - Bean factories for dependency injection
- **React** - Component factories for different rendering strategies
- **Express.js** - Middleware factories for different authentication strategies

The Factory Method pattern is particularly powerful in frameworks and libraries where you need to provide extension points for users while maintaining a consistent interface. 