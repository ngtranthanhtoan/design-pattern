# Singleton Pattern Use Cases

## When to Use the Singleton Pattern

The Singleton pattern should be used when you need to ensure that only one instance of a class exists throughout the application lifecycle.

## Real-World Implemented Examples

The following use cases are implemented in our `code.ts` file with complete working examples:

### 1. **Configuration Manager** 🔧
**Problem**: Multiple parts of an application need access to the same configuration settings (API URLs, database credentials, feature flags) without loading them multiple times.

**Solution**: A centralized configuration manager that loads settings once and provides global access.

**Real-world Implementation**:
```typescript
const config = ConfigurationManager.getInstance();
config.loadConfig({
  apiKey: 'secret-key-123',
  environment: 'production',
  database: { host: 'prod-db.com', port: 5432 }
});

// Accessed anywhere in the app
const apiUrl = config.get('apiUrl');
const isProduction = config.isProduction();
```

**Use Cases**:
- Environment-specific settings (dev/staging/prod)
- API endpoints and authentication keys
- Database connection parameters
- Feature toggles and A/B testing flags

### 2. **Application Logger** 📝
**Problem**: Different modules need to log messages consistently with proper formatting, levels, and centralized storage.

**Solution**: A global logger that maintains consistent formatting, filtering, and storage across the entire application.

**Real-world Implementation**:
```typescript
const logger = ApplicationLogger.getInstance();
logger.setLogLevel(LogLevel.DEBUG);

// Used throughout the application
logger.info('User authenticated', { userId: 123, method: 'OAuth' });
logger.error('Database connection failed', { 
  host: 'localhost', 
  error: 'timeout' 
});

// Export logs for analysis
const logData = logger.exportLogs();
```

**Use Cases**:
- Application debugging and monitoring
- User activity tracking
- Error reporting and analysis
- Performance monitoring
- Audit trails for compliance

### 3. **Cache Manager** ⚡
**Problem**: Multiple services need to cache expensive operations (API calls, database queries, computations) with consistent TTL and eviction policies.

**Solution**: A centralized cache that manages memory usage, TTL expiration, and provides hit/miss statistics.

**Real-world Implementation**:
```typescript
const cache = CacheManager.getInstance();

// Cache API responses
cache.set('user:123', userData, 60000); // 1 minute TTL
cache.set('api:weather', weatherData, 300000); // 5 minutes TTL

// Retrieve cached data
const user = cache.get('user:123');
const stats = cache.getStats(); // { size: 2, totalHits: 15, memoryUsage: "2.3 KB" }
```

**Use Cases**:
- API response caching
- Database query result caching
- Computed values caching (expensive calculations)
- Session data storage
- Temporary file storage

### 4. **Database Manager** 🗄️
**Problem**: Managing database connections efficiently across the application without creating too many connections or connection leaks.

**Solution**: A connection pool manager that maintains a fixed number of reusable database connections.

**Real-world Implementation**:
```typescript
const db = DatabaseManager.getInstance();
await db.initialize({ maxConnections: 10 });

// Execute queries with automatic connection management
const users = await db.executeQuery('SELECT * FROM users WHERE active = $1', [true]);
const orders = await db.executeQuery('SELECT * FROM orders WHERE date > $1', ['2024-01-01']);

// Monitor connection usage
const stats = db.getConnectionStats(); // { total: 10, active: 2, available: 8 }
```

**Use Cases**:
- Database connection pooling
- Connection lifecycle management
- Query execution with connection reuse
- Connection monitoring and health checks
- Resource cleanup and optimization

### 5. **Event Bus** 📡
**Problem**: Different parts of the application need to communicate without tight coupling (decoupled pub/sub messaging).

**Solution**: A centralized event bus that manages subscriptions, event emission, and maintains event history.

**Real-world Implementation**:
```typescript
const eventBus = EventBus.getInstance();

// Subscribe to events
eventBus.subscribe('user:login', (data) => {
  console.log(`User ${data.userId} logged in`);
});

eventBus.subscribe('order:created', (data) => {
  // Send email, update inventory, etc.
});

// Emit events from anywhere
eventBus.emit('user:login', { userId: 'user123', timestamp: Date.now() });
eventBus.emit('order:created', { orderId: 'ord456', amount: 99.99 });
```

**Use Cases**:
- Microservice communication
- UI component communication
- Event-driven architecture
- Analytics and tracking
- Real-time notifications
- System integration and workflows

## When NOT to Use Singleton

### ❌ Avoid Singleton When:

1. **You need multiple instances** - If there's any chance you'll need more than one instance
2. **Testing is important** - Singletons make unit testing difficult due to global state
3. **The class is stateless** - Use static methods instead
4. **Dependency injection is available** - Modern frameworks provide better alternatives
5. **You're using it just to avoid passing parameters** - This indicates poor design

## Modern Alternatives

### 1. **Dependency Injection**
```typescript
// Instead of Singleton
class DatabaseManager {
  constructor(private config: DatabaseConfig) {}
}

// Inject the same instance everywhere
container.registerSingleton(DatabaseManager);
```

### 2. **Module Pattern**
```typescript
// ES6 modules are singletons by nature
export const configManager = new ConfigManager();
```

### 3. **Factory Pattern**
```typescript
// Control instance creation without global state
class DatabaseFactory {
  private static instance: Database;
  
  static createDatabase(): Database {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}
```

## Best Practices

1. **Consider alternatives first** - Modern applications often have better solutions
2. **Make it thread-safe** - Use proper synchronization mechanisms
3. **Handle exceptions** - Ensure the singleton can handle initialization failures
4. **Avoid lazy initialization for critical services** - Initialize important singletons at startup
5. **Document the singleton behavior** - Make it clear to other developers why it's a singleton 