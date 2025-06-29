# Adapter Pattern - Real-World Use Cases

## Overview

Below is a quick-glance table of the concrete adapters implemented in this repository.

| # | Title | npm Demo |
|---|-------|----------|
| 1 | Payment Gateway (Stripe, PayPal, Square) | `npm run adapter:payment` |
| 2 | Database Driver Abstraction (MySQL, Mongo) | `npm run adapter:database` |
| 3 | File Format Converters (JSON, XML, CSV) | `npm run adapter:file` |
| 4 | Legacy SOAP User Service | `npm run adapter:soap` |
| 5 | Winston Logger Wrapper | `npm run adapter:logger` |
| 6 | React Component Adapter | _example only_ |

---

The Adapter pattern is essential for integrating incompatible systems, legacy code, and third-party libraries. Here are practical examples demonstrating how adapters solve real-world interface compatibility problems.

## Use Case 1: Payment Gateway Integration

### Problem
Your e-commerce application needs to support multiple payment providers (Stripe, PayPal, Square), but each has different APIs and data formats.

### Solution
Create a unified payment interface with adapters for each provider.

**Target Interface:**
```typescript
interface PaymentProcessor {
  processPayment(amount: number, currency: string, cardToken: string): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount: number): Promise<RefundResult>;
}
```

**Stripe Adapter:**
```typescript
class StripeAdapter implements PaymentProcessor {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey);
  }

  async processPayment(amount: number, currency: string, cardToken: string): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: currency.toLowerCase(),
      payment_method: cardToken,
      confirm: true
    });

    return {
      success: paymentIntent.status === 'succeeded',
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount / 100
    };
  }

  async refundPayment(paymentId: string, amount: number): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount * 100
    });

    return {
      success: refund.status === 'succeeded',
      refundId: refund.id,
      amount: refund.amount / 100
    };
  }
}
```

## Use Case 2: Database Driver Abstraction

### Problem
Your application needs to work with multiple database systems (MySQL, PostgreSQL, MongoDB) without changing the business logic.

### Solution
Create a unified database interface with adapters for each database system.

**Target Interface:**
```typescript
interface DatabaseConnection {
  connect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any[]>;
  execute(sql: string, params?: any[]): Promise<number>;
  disconnect(): Promise<void>;
}
```

**MongoDB Adapter:**
```typescript
class MongoDBAdapter implements DatabaseConnection {
  private client: MongoClient;
  private db: Db;

  constructor(connectionString: string) {
    this.client = new MongoClient(connectionString);
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db();
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    // Convert SQL-like query to MongoDB aggregation
    const collection = this.db.collection(this.extractCollectionName(sql));
    const pipeline = this.convertSQLToAggregation(sql, params);
    return await collection.aggregate(pipeline).toArray();
  }

  async execute(sql: string, params?: any[]): Promise<number> {
    const collection = this.db.collection(this.extractCollectionName(sql));
    const operation = this.convertSQLToOperation(sql, params);
    const result = await collection[operation.type](operation.filter, operation.update);
    return result.modifiedCount || result.insertedCount || 0;
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  private extractCollectionName(sql: string): string {
    // Extract table name from SQL
    const match = sql.match(/FROM\s+(\w+)/i);
    return match ? match[1] : 'default';
  }

  private convertSQLToAggregation(sql: string, params?: any[]): any[] {
    // Simplified SQL to MongoDB aggregation conversion
    return [{ $match: {} }];
  }

  private convertSQLToOperation(sql: string, params?: any[]): any {
    // Simplified SQL to MongoDB operation conversion
    return { type: 'updateOne', filter: {}, update: {} };
  }
}
```

## Use Case 3: File Format Converter

### Problem
Your application needs to read and write data in multiple formats (JSON, XML, CSV) but has a unified data processing pipeline.

### Solution
Create adapters that convert between different file formats and a common data structure.

**Target Interface:**
```typescript
interface DataSerializer {
  serialize(data: any): string;
  deserialize(content: string): any;
  getFileExtension(): string;
}
```

**XML Adapter:**
```typescript
class XMLAdapter implements DataSerializer {
  serialize(data: any): string {
    const xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      format: true
    });

    const xmlObj = this.convertToXMLStructure(data);
    return xmlBuilder.build(xmlObj);
  }

  deserialize(content: string): any {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });

    const xmlObj = parser.parse(content);
    return this.convertFromXMLStructure(xmlObj);
  }

  getFileExtension(): string {
    return 'xml';
  }

  private convertToXMLStructure(data: any): any {
    if (Array.isArray(data)) {
      return { items: { item: data } };
    }
    return { root: data };
  }

  private convertFromXMLStructure(xmlObj: any): any {
    if (xmlObj.items && xmlObj.items.item) {
      return Array.isArray(xmlObj.items.item) ? xmlObj.items.item : [xmlObj.items.item];
    }
    return xmlObj.root || xmlObj;
  }
}
```

## Use Case 4: Legacy API Integration

### Problem
You need to integrate with a legacy SOAP web service that uses XML, but your modern application expects RESTful JSON APIs.

### Solution
Create an adapter that converts between SOAP XML and REST JSON formats.

**Target Interface:**
```typescript
interface UserService {
  getUser(id: string): Promise<User>;
  createUser(user: CreateUserRequest): Promise<User>;
  updateUser(id: string, user: UpdateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
```

**SOAP Adapter:**
```typescript
class SOAPUserServiceAdapter implements UserService {
  private soapClient: any;
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.soapClient = new SOAPClient(endpoint);
  }

  async getUser(id: string): Promise<User> {
    const soapRequest = this.buildSOAPRequest('GetUser', { userId: id });
    const soapResponse = await this.soapClient.send(soapRequest);
    
    return this.convertSOAPResponseToUser(soapResponse);
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    const soapRequest = this.buildSOAPRequest('CreateUser', {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
    
    const soapResponse = await this.soapClient.send(soapRequest);
    return this.convertSOAPResponseToUser(soapResponse);
  }

  async updateUser(id: string, user: UpdateUserRequest): Promise<User> {
    const soapRequest = this.buildSOAPRequest('UpdateUser', {
      userId: id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
    
    const soapResponse = await this.soapClient.send(soapRequest);
    return this.convertSOAPResponseToUser(soapResponse);
  }

  async deleteUser(id: string): Promise<void> {
    const soapRequest = this.buildSOAPRequest('DeleteUser', { userId: id });
    await this.soapClient.send(soapRequest);
  }

  private buildSOAPRequest(operation: string, data: any): string {
    return `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <${operation} xmlns="http://example.com/user">
            ${Object.entries(data).map(([key, value]) => `<${key}>${value}</${key}>`).join('')}
          </${operation}>
        </soap:Body>
      </soap:Envelope>
    `;
  }

  private convertSOAPResponseToUser(soapResponse: any): User {
    const userData = soapResponse.Body[0][`${Object.keys(soapResponse.Body[0])[0]}Response`][0];
    return {
      id: userData.userId[0],
      firstName: userData.firstName[0],
      lastName: userData.lastName[0],
      email: userData.email[0]
    };
  }
}
```

## Use Case 5: Third-Party Library Integration

### Problem
You want to use a third-party logging library that has a different interface than your application's logging system.

### Solution
Create an adapter that wraps the third-party library to match your application's logging interface.

**Target Interface:**
```typescript
interface Logger {
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
  debug(message: string, context?: any): void;
}
```

**Winston Adapter:**
```typescript
class WinstonAdapter implements Logger {
  private winston: any;

  constructor(config: any) {
    this.winston = winston.createLogger({
      level: config.level || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: config.file || 'app.log' })
      ]
    });
  }

  info(message: string, context?: any): void {
    this.winston.info(message, { context });
  }

  warn(message: string, context?: any): void {
    this.winston.warn(message, { context });
  }

  error(message: string, error?: Error, context?: any): void {
    this.winston.error(message, { 
      error: error?.message,
      stack: error?.stack,
      context 
    });
  }

  debug(message: string, context?: any): void {
    this.winston.debug(message, { context });
  }
}
```

## Use Case 6: UI Component Library Integration

### Problem
Your application uses a specific UI framework, but you need to integrate components from a different UI library.

### Solution
Create adapters that wrap foreign UI components to match your application's component interface.

**Target Interface:**
```typescript
interface UIComponent {
  render(): HTMLElement;
  setProps(props: any): void;
  addEventListener(event: string, handler: Function): void;
  removeEventListener(event: string, handler: Function): void;
}
```

**React Component Adapter:**
```typescript
class ReactComponentAdapter implements UIComponent {
  private reactComponent: any;
  private container: HTMLElement;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(ReactComponent: any, container: HTMLElement) {
    this.reactComponent = ReactComponent;
    this.container = container;
  }

  render(): HTMLElement {
    ReactDOM.render(React.createElement(this.reactComponent), this.container);
    return this.container;
  }

  setProps(props: any): void {
    ReactDOM.render(
      React.createElement(this.reactComponent, props),
      this.container
    );
  }

  addEventListener(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
    
    // Convert to React event handling
    this.container.addEventListener(this.convertEventName(event), handler as any);
  }

  removeEventListener(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
    
    this.container.removeEventListener(this.convertEventName(event), handler as any);
  }

  private convertEventName(event: string): string {
    // Convert custom events to DOM events
    const eventMap: { [key: string]: string } = {
      'click': 'click',
      'change': 'change',
      'submit': 'submit'
    };
    return eventMap[event] || event;
  }
}
```

## Best Practices for Adapter Implementation

1. **Error Handling**: Always include proper error handling for incompatible operations
2. **Performance**: Consider caching and optimization for frequently used adapters
3. **Testing**: Test adapters with both valid and invalid data
4. **Documentation**: Clearly document limitations and assumptions
5. **Versioning**: Handle different versions of the adapted system

## Common Anti-Patterns

- **God Adapter**: Creating adapters that do too much beyond interface conversion
- **Adapter Chain**: Creating multiple adapters for the same conversion
- **Interface Pollution**: Adding unnecessary methods to target interfaces
- **Performance Ignorance**: Not considering the performance impact of adapters
- **Tight Coupling**: Making adapters too specific to implementation details 