# Strategy Pattern

## What is the Pattern?

The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It allows the algorithm to vary independently from clients that use it. This pattern enables selecting an algorithm's implementation at runtime rather than compile time.

## Key Participants

| Participant | Description |
|-------------|-------------|
| **Strategy** | Defines the interface for all supported algorithms |
| **ConcreteStrategy** | Implements the algorithm using the Strategy interface |
| **Context** | Maintains a reference to a Strategy object and uses it to execute the algorithm |
| **Client** | Creates and configures a ConcreteStrategy object |

## Key Characteristics

- **Algorithm Encapsulation**: Each algorithm is encapsulated in its own class
- **Runtime Selection**: Algorithms can be swapped at runtime
- **Open/Closed Principle**: New strategies can be added without modifying existing code
- **Eliminates Conditionals**: Replaces complex conditional logic with polymorphic behavior
- **Single Responsibility**: Each strategy class has one specific algorithm

## How it Works

1. **Strategy Interface**: Defines a common interface for all concrete strategies
2. **Concrete Strategies**: Implement specific algorithms following the strategy interface
3. **Context**: Holds a reference to the current strategy and delegates work to it
4. **Client**: Creates and configures the appropriate strategy for the context

## Structure

```
┌─────────────────┐    ┌─────────────────────┐
│    Strategy     │    │      Context        │
├─────────────────┤    ├─────────────────────┤
│ + execute()     │◄───┤ - strategy: Strategy│
└─────────────────┘    ├─────────────────────┤
         ▲              │ + setStrategy()     │
         │              │ + executeStrategy() │
         │              └─────────────────────┘
         │
    ┌────┴────┐
    │         │
┌─────────┐ ┌─────────┐
│StrategyA│ │StrategyB│
├─────────┤ ├─────────┤
│+execute()│ │+execute()│
└─────────┘ └─────────┘
```

## Benefits

✅ **Eliminates conditional statements** - No more complex if/else chains  
✅ **Open/Closed Principle** - Easy to add new strategies without modifying existing code  
✅ **Runtime flexibility** - Switch algorithms at runtime based on conditions  
✅ **Single Responsibility** - Each strategy class focuses on one algorithm  
✅ **Testability** - Each strategy can be tested in isolation  
✅ **Reusability** - Strategies can be reused across different contexts  
✅ **Maintainability** - Changes to one algorithm don't affect others  

## Drawbacks

❌ **Increased number of classes** - Can lead to many small strategy classes  
❌ **Client awareness** - Clients must know about different strategies  
❌ **Communication overhead** - Strategy objects may not share data efficiently  
❌ **Complexity** - May be overkill for simple algorithms  
❌ **Performance** - Small overhead from polymorphic calls  

## When to Use / Avoid

### ✅ Use When:
- You have a family of related algorithms that differ only in their behavior
- You need to switch algorithms at runtime
- You want to avoid complex conditional statements
- You have multiple ways to perform the same operation
- You want to isolate algorithm implementation from the code that uses it

### ❌ Avoid When:
- You have only a few algorithms that rarely change
- The algorithms are simple and don't benefit from encapsulation
- The overhead of additional classes outweighs the benefits
- You need tight coupling between the context and strategy

## Real-World Examples

- **Payment Processing**: Different payment methods (Credit Card, PayPal, Crypto)
- **Sorting Algorithms**: Various sorting strategies (QuickSort, MergeSort, BubbleSort)
- **Compression**: Different compression algorithms (GZIP, ZIP, RAR)
- **Validation**: Multiple validation strategies (Email, Phone, Credit Card)
- **Pricing**: Different pricing strategies (Fixed, Percentage, Dynamic)
- **Authentication**: Various auth methods (JWT, OAuth, API Key)

## Common Implementation Variations

### 1. **Simple Strategy Interface**
```typescript
interface Strategy {
  execute(data: any): any;
}
```

### 2. **Parameterized Strategy**
```typescript
interface Strategy<T, R> {
  execute(input: T): R;
}
```

### 3. **Strategy with Context**
```typescript
interface Strategy {
  execute(context: Context): void;
}
```

### 4. **Strategy Registry**
```typescript
class StrategyRegistry {
  private strategies = new Map<string, Strategy>();
  
  register(name: string, strategy: Strategy): void {
    this.strategies.set(name, strategy);
  }
  
  get(name: string): Strategy | undefined {
    return this.strategies.get(name);
  }
}
```

### 5. **Functional Strategy**
```typescript
type Strategy<T, R> = (input: T) => R;
```

## Related Patterns

- **State Pattern** - Similar structure but focuses on state transitions
- **Command Pattern** - Encapsulates requests as objects
- **Template Method** - Defines algorithm skeleton with customizable steps
- **Factory Method** - Creates appropriate strategy objects
- **Decorator Pattern** - Can be used to add behavior to strategies

## Implementation Highlights

### Strategy Selection
- **Configuration-based**: Load strategies from configuration files
- **Factory-based**: Use factories to create appropriate strategies
- **Registry-based**: Maintain a registry of available strategies
- **Dependency Injection**: Inject strategies through DI containers

### Performance Considerations
- **Caching**: Cache strategy instances when appropriate
- **Lazy Loading**: Load strategies only when needed
- **Object Pooling**: Reuse strategy objects for expensive operations

### Testing Strategies
- **Mock Strategies**: Use mock strategies for testing context behavior
- **Strategy Testing**: Test each strategy in isolation
- **Integration Testing**: Test strategy selection and execution flow

## Sequence Diagram

```
Client          Context         StrategyA        StrategyB
  │                │                │                │
  │─create()──────►│                │                │
  │                │                │                │
  │─setStrategy()─►│                │                │
  │                │─new StrategyA()│                │
  │                │───────────────►│                │
  │                │                │                │
  │─execute()─────►│                │                │
  │                │─execute()─────►│                │
  │                │                │─algorithm()───►│
  │                │                │◄─result───────│
  │                │◄─result───────│                │
  │◄─result────────│                │                │
  │                │                │                │
  │─setStrategy()─►│                │                │
  │                │─new StrategyB()│                │
  │                │────────────────────────────────►│
  │                │                │                │
  │─execute()─────►│                │                │
  │                │─execute()──────────────────────►│
  │                │                │                │─algorithm()───►│
  │                │                │                │◄─result───────│
  │                │◄─result────────────────────────│
  │◄─result────────│                │                │
```

## Pitfalls & Anti-Patterns

### ❌ **Strategy Explosion**
- Creating too many strategies for minor variations
- **Solution**: Combine similar strategies or use parameters

### ❌ **Context Bloat**
- Putting too much logic in the context class
- **Solution**: Keep context focused on strategy delegation

### ❌ **Strategy Coupling**
- Strategies depending on each other or the context
- **Solution**: Keep strategies independent and stateless

### ❌ **Over-Engineering**
- Using strategy pattern for simple conditional logic
- **Solution**: Use simple if/else for straightforward cases

## Testing Tips

### Unit Testing Strategies
```typescript
describe('PaymentStrategy', () => {
  it('should process credit card payment', () => {
    const strategy = new CreditCardStrategy();
    const result = strategy.process(100);
    expect(result.success).toBe(true);
  });
});
```

### Context Testing
```typescript
describe('PaymentProcessor', () => {
  it('should use correct strategy', () => {
    const mockStrategy = jest.fn();
    const processor = new PaymentProcessor(mockStrategy);
    processor.processPayment(100);
    expect(mockStrategy).toHaveBeenCalledWith(100);
  });
});
```

## Performance Notes

- **Memory**: Each strategy instance consumes memory
- **CPU**: Polymorphic calls have minimal overhead
- **Caching**: Consider caching strategy instances for expensive operations
- **Lazy Loading**: Load strategies only when needed
- **Object Pooling**: Reuse strategy objects for high-frequency operations 