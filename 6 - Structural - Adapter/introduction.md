# Adapter Pattern

## What is the Adapter Pattern?

The Adapter pattern is a structural design pattern that allows incompatible interfaces to work together. It acts as a bridge between two incompatible interfaces by wrapping an existing class with a new interface, making it compatible with the client code.

Think of it like a power adapter - you have a device that needs a specific type of plug, but your outlet provides a different type. The adapter converts the interface so they can work together.

## Key Principles

1. **Interface Compatibility**: Converts the interface of a class into another interface that clients expect
2. **Legacy Integration**: Enables the use of existing classes with incompatible interfaces
3. **Client Isolation**: Clients don't need to know about the incompatible interface
4. **Single Responsibility**: The adapter has one job - making interfaces compatible

## Structure

```
Client → Target Interface → Adapter → Adaptee (Legacy/Third-party)
```

### Components

- **Target**: The interface that the client expects
- **Client**: The code that uses the target interface
- **Adapter**: The class that implements the target interface and wraps the adaptee
- **Adaptee**: The existing class with an incompatible interface

## Benefits

✅ **Legacy Integration**: Easily integrate existing code with new systems
✅ **Interface Compatibility**: Make incompatible interfaces work together
✅ **Client Isolation**: Clients don't need to change when using adapters
✅ **Reusability**: Adapters can be reused across different parts of the system
✅ **Maintainability**: Clear separation between old and new interfaces

## Drawbacks

❌ **Complexity**: Adds an extra layer of abstraction
❌ **Performance Overhead**: Small performance cost due to additional method calls
❌ **Debugging Difficulty**: Can make debugging more complex with multiple layers
❌ **Overuse**: Can lead to adapter proliferation if not managed properly

## When to Use

- **Legacy System Integration**: When integrating with old systems or third-party libraries
- **Interface Mismatch**: When existing interfaces don't match client expectations
- **API Versioning**: When working with different versions of APIs
- **Testing**: When creating test doubles for external dependencies
- **Gradual Migration**: When gradually migrating from old to new interfaces

## When to Avoid

- **Simple Cases**: When interfaces are already compatible
- **Performance Critical**: When every millisecond matters
- **Over-Engineering**: When the mismatch is minor and can be handled directly

## Related Patterns

- **Bridge**: Similar to adapter but focuses on abstraction and implementation separation
- **Decorator**: Adds behavior, while adapter changes interface
- **Facade**: Simplifies complex subsystem, while adapter makes incompatible interfaces work
- **Proxy**: Controls access to objects, while adapter changes interface

## Real-World Examples

1. **Database Drivers**: Converting different database APIs to a common interface
2. **Payment Gateways**: Adapting different payment provider APIs
3. **File Format Converters**: Converting between different file formats
4. **API Wrappers**: Wrapping third-party APIs to match internal interfaces
5. **Legacy System Integration**: Making old systems work with new interfaces

## Implementation Approaches

### Class Adapter (Inheritance)
```typescript
interface Target {
  request(): string;
}

class Adaptee {
  specificRequest(): string {
    return "Specific request";
  }
}

class Adapter extends Adaptee implements Target {
  request(): string {
    return this.specificRequest();
  }
}
```

### Object Adapter (Composition)
```typescript
interface Target {
  request(): string;
}

class Adaptee {
  specificRequest(): string {
    return "Specific request";
  }
}

class Adapter implements Target {
  private adaptee: Adaptee;

  constructor(adaptee: Adaptee) {
    this.adaptee = adaptee;
  }

  request(): string {
    return this.adaptee.specificRequest();
  }
}
```

## Best Practices

1. **Prefer Composition**: Object adapters are more flexible than class adapters
2. **Single Responsibility**: Each adapter should handle one specific interface conversion
3. **Error Handling**: Include proper error handling for incompatible operations
4. **Documentation**: Clearly document what the adapter does and its limitations
5. **Testing**: Test adapters thoroughly with both compatible and incompatible scenarios

## Anti-Patterns

- **God Adapter**: Creating adapters that do too much
- **Adapter Chain**: Creating multiple adapters for the same conversion
- **Interface Pollution**: Adding unnecessary methods to target interfaces
- **Performance Ignorance**: Not considering performance implications of adapters 