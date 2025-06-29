# Strategy Pattern - Use Cases

## Overview

The Strategy pattern is one of the most practical design patterns in software development, solving the common problem of having multiple algorithms for the same task. It eliminates complex conditional statements and makes systems more flexible and maintainable. This pattern is particularly valuable in scenarios where you need to switch between different algorithms at runtime, such as payment processing, data validation, sorting, compression, and pricing calculations.

## Use Case 1: Payment Processing System

### Problem
An e-commerce platform needs to support multiple payment methods (credit card, PayPal, cryptocurrency, bank transfer) with different processing logic, security requirements, and fee structures. Using conditional statements for each payment type creates complex, hard-to-maintain code that violates the Open/Closed Principle.

### Solution
Implement a payment strategy pattern where each payment method is encapsulated in its own strategy class. The payment processor context can switch between strategies at runtime based on user selection, making the system extensible and maintainable.

**Target Interface**: `PaymentStrategy`
**Key Strategies**: `CreditCardStrategy`, `PayPalStrategy`, `CryptoStrategy`, `BankTransferStrategy`

```typescript
interface PaymentStrategy {
  process(amount: number, currency: string): PaymentResult;
  getFees(): number;
  getProcessingTime(): number;
}
```

**Demo**: `npm run strategy:payment`

## Use Case 2: Data Validation Framework

### Problem
A form validation system needs to validate different types of data (email, phone numbers, credit cards, postal codes) with varying rules and formats. Hard-coding validation logic creates tight coupling and makes it difficult to add new validation types or modify existing rules.

### Solution
Create a validation strategy pattern where each validation type is a separate strategy. The validation context can dynamically select the appropriate validator based on the field type, allowing for easy extension and modification of validation rules.

**Target Interface**: `ValidationStrategy`
**Key Strategies**: `EmailValidationStrategy`, `PhoneValidationStrategy`, `CreditCardValidationStrategy`, `PostalCodeValidationStrategy`

```typescript
interface ValidationStrategy {
  validate(value: string): ValidationResult;
  getErrorMessage(): string;
}
```

**Demo**: `npm run strategy:validation`

## Use Case 3: Sorting Algorithm Selection

### Problem
A data processing application needs to sort large datasets using different algorithms (QuickSort, MergeSort, BubbleSort) based on data characteristics, size, and performance requirements. The choice of algorithm significantly impacts performance and memory usage.

### Solution
Implement a sorting strategy pattern where each sorting algorithm is encapsulated in its own strategy. The sorting context can select the optimal algorithm based on data size, type, and performance requirements, providing flexibility and performance optimization.

**Target Interface**: `SortingStrategy`
**Key Strategies**: `QuickSortStrategy`, `MergeSortStrategy`, `BubbleSortStrategy`, `HeapSortStrategy`

```typescript
interface SortingStrategy<T> {
  sort(data: T[]): T[];
  getTimeComplexity(): string;
  getSpaceComplexity(): string;
}
```

**Demo**: `npm run strategy:sorting`

## Use Case 4: Compression System

### Problem
A file management system needs to compress files using different algorithms (GZIP, ZIP, RAR, LZMA) based on file type, size, and compression requirements. Each algorithm has different compression ratios, speed, and compatibility characteristics.

### Solution
Create a compression strategy pattern where each compression algorithm is a separate strategy. The compression context can select the appropriate algorithm based on file characteristics and user preferences, providing optimal compression for different scenarios.

**Target Interface**: `CompressionStrategy`
**Key Strategies**: `GzipStrategy`, `ZipStrategy`, `RarStrategy`, `LzmaStrategy`

```typescript
interface CompressionStrategy {
  compress(data: Buffer): Buffer;
  decompress(data: Buffer): Buffer;
  getCompressionRatio(): number;
  getSpeed(): 'fast' | 'medium' | 'slow';
}
```

**Demo**: `npm run strategy:compression`

## Use Case 5: Pricing Strategy System

### Problem
An e-commerce platform needs to calculate prices using different strategies (fixed pricing, percentage-based pricing, dynamic pricing, bulk pricing) based on product type, customer tier, and market conditions. The pricing logic varies significantly between strategies.

### Solution
Implement a pricing strategy pattern where each pricing method is encapsulated in its own strategy. The pricing context can switch between strategies based on product configuration, customer type, and business rules, enabling flexible and complex pricing models.

**Target Interface**: `PricingStrategy`
**Key Strategies**: `FixedPricingStrategy`, `PercentagePricingStrategy`, `DynamicPricingStrategy`, `BulkPricingStrategy`

```typescript
interface PricingStrategy {
  calculatePrice(basePrice: number, context: PricingContext): number;
  getDiscount(): number;
  getDescription(): string;
}
```

**Demo**: `npm run strategy:pricing`

## Use Case 6: Authentication System

### Problem
A web application needs to support multiple authentication methods (JWT, OAuth, API Key, Session-based) with different security requirements, token handling, and user session management. Each authentication method has unique implementation details and security considerations.

### Solution
Create an authentication strategy pattern where each authentication method is a separate strategy. The authentication context can select the appropriate strategy based on user preferences, security requirements, and system configuration.

**Target Interface**: `AuthenticationStrategy`
**Key Strategies**: `JwtStrategy`, `OAuthStrategy`, `ApiKeyStrategy`, `SessionStrategy`

```typescript
interface AuthenticationStrategy {
  authenticate(credentials: any): AuthenticationResult;
  validate(token: string): ValidationResult;
  refresh(token: string): RefreshResult;
}
```

**Demo**: `npm run strategy:authentication`

## Use Case 7: Notification System

### Problem
A notification system needs to send messages through different channels (email, SMS, push notification, Slack, Discord) with varying delivery mechanisms, rate limits, and formatting requirements. Each channel has different API requirements and message formats.

### Solution
Implement a notification strategy pattern where each notification channel is encapsulated in its own strategy. The notification context can select the appropriate channel based on user preferences, message urgency, and delivery requirements.

**Target Interface**: `NotificationStrategy`
**Key Strategies**: `EmailStrategy`, `SmsStrategy`, `PushNotificationStrategy`, `SlackStrategy`

```typescript
interface NotificationStrategy {
  send(message: NotificationMessage): SendResult;
  getDeliveryTime(): number;
  getSuccessRate(): number;
}
```

**Demo**: `npm run strategy:notification`

## Best Practices / Anti-Patterns

### ✅ Best Practices
- **Keep strategies stateless** - Avoid storing state in strategy objects
- **Use dependency injection** - Inject strategies through constructors or setters
- **Implement strategy registry** - Use a registry pattern for dynamic strategy selection
- **Provide default strategies** - Always have a fallback strategy
- **Test strategies in isolation** - Each strategy should be independently testable
- **Use meaningful strategy names** - Choose descriptive names that indicate the algorithm's purpose

### ❌ Anti-Patterns
- **Strategy explosion** - Creating too many strategies for minor variations
- **Context bloat** - Putting too much logic in the context class
- **Strategy coupling** - Making strategies depend on each other or the context
- **Over-engineering** - Using strategy pattern for simple conditional logic
- **Performance ignorance** - Not considering the performance impact of strategy switching
- **Inconsistent interfaces** - Having different method signatures across strategies

### 🔧 Implementation Tips
- **Use factories** - Create strategy factories for complex strategy instantiation
- **Implement caching** - Cache strategy instances when appropriate
- **Consider composition** - Combine strategies using the decorator pattern
- **Monitor performance** - Track strategy performance and usage patterns
- **Document trade-offs** - Clearly document the pros and cons of each strategy 