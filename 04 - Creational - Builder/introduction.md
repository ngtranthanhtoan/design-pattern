# Builder Pattern

## 📖 What is the Builder Pattern?

The Builder pattern is a creational design pattern that provides a way to construct complex objects step by step. It allows you to create different types and representations of an object using the same construction code. The pattern separates the construction of a complex object from its representation, enabling the same construction process to create various representations.

## 🎯 Intent

**Separate the construction of a complex object from its representation so that the same construction process can create different representations.**

## 🏗️ Structure

The Builder pattern typically involves four main components:

### 1. **Product**
- The complex object being constructed
- Usually has multiple parts/properties
- May have validation rules or constraints

### 2. **Builder Interface**
- Declares the construction steps common to all builders
- Defines methods for building different parts of the product
- Usually includes a method to retrieve the final result

### 3. **Concrete Builder**
- Implements the Builder interface
- Provides specific implementations for construction steps
- Maintains the instance of the product being built
- Defines and keeps track of the representation it creates

### 4. **Director (Optional)**
- Defines the order of construction steps
- Works with Builder interface to construct the product
- Encapsulates the construction logic

## 💡 Key Characteristics

### **Step-by-Step Construction**
- Objects are built incrementally through method calls
- Each step can add or configure a part of the final object
- Construction order can be controlled and validated

### **Fluent Interface**
- Methods typically return the builder instance
- Enables method chaining for readable code
- Creates a domain-specific language for object construction

### **Immutable Products**
- Final objects are typically immutable after construction
- Builder maintains mutable state during construction
- `build()` method creates the final immutable product

### **Validation and Constraints**
- Builder can validate configuration during construction
- Required parameters can be enforced
- Invalid combinations can be prevented

## ✅ Benefits

### **1. Complex Object Creation**
- Handles objects with many parameters elegantly
- Eliminates telescoping constructor anti-pattern
- Provides clear construction process for complex objects

### **2. Readable and Maintainable Code**
```typescript
// Instead of: new User(name, email, age, role, permissions, preferences, settings, ...)
const user = new UserBuilder()
  .name('John Doe')
  .email('john@example.com')
  .age(30)
  .role('admin')
  .permissions(['read', 'write'])
  .preferences({ theme: 'dark' })
  .build();
```

### **3. Parameter Validation**
- Validate parameters as they're set
- Ensure required fields are provided
- Check business rules during construction

### **4. Immutable Objects**
- Products are immutable after construction
- Thread-safe final objects
- Prevents accidental modification

### **5. Different Representations**
- Same builder can create different object representations
- Support for multiple output formats
- Flexible construction process

### **6. Default Values and Optional Parameters**
- Handle optional parameters gracefully
- Provide sensible defaults
- Only specify what's different from defaults

## ❌ Drawbacks

### **1. Increased Complexity**
- More classes and interfaces to maintain
- Can be overkill for simple objects
- Additional abstraction layer

### **2. Memory Overhead**
- Builder objects consume memory during construction
- Temporary state maintenance
- May create multiple intermediate objects

### **3. Learning Curve**
- Pattern can be confusing for beginners
- Requires understanding of fluent interfaces
- More complex than direct instantiation

### **4. Verbose for Simple Cases**
- Over-engineering simple object creation
- More code than necessary for basic scenarios
- Can reduce performance for simple objects

## ⚡ When to Use Builder Pattern

### **✅ Use Builder When:**

1. **Complex Objects with Many Parameters**
   - Objects with 4+ constructor parameters
   - Many optional parameters
   - Parameter combinations need validation

2. **Step-by-Step Construction Required**
   - Construction process has multiple steps
   - Order of construction matters
   - Intermediate validation needed

3. **Multiple Representations Needed**
   - Same data in different formats
   - Different configuration combinations
   - Platform-specific variations

4. **Immutable Objects Desired**
   - Thread-safe final objects
   - Prevent accidental modification
   - Clear separation between construction and usage

5. **Fluent API Benefits**
   - Improve code readability
   - Create domain-specific language
   - Reduce parameter order mistakes

### **❌ Avoid Builder When:**

1. **Simple Objects**
   - Few parameters (1-3)
   - No optional parameters
   - Simple validation rules

2. **Performance Critical**
   - Object creation happens frequently
   - Memory usage is constrained
   - Construction overhead is significant

3. **Mutable Objects Preferred**
   - Objects need frequent modification
   - Builder overhead isn't justified
   - Simple setters are sufficient

## 🔄 Builder vs Other Patterns

### **Builder vs Factory Method**
- **Builder**: Complex step-by-step construction
- **Factory Method**: Simple object creation variations

### **Builder vs Abstract Factory**
- **Builder**: Single complex object with many configurations
- **Abstract Factory**: Families of related simple objects

### **Builder vs Prototype**
- **Builder**: Construct new objects from scratch
- **Prototype**: Clone existing objects and modify

## 📊 Pattern Variations

### **1. Fluent Builder**
```typescript
const query = new QueryBuilder()
  .select('name', 'email')
  .from('users')
  .where('active', true)
  .build();
```

### **2. Step Builder (Type-Safe)**
```typescript
const config = ConfigurationBuilder
  .newConfig()
  .setHost('localhost')      // Returns HostStep
  .setPort(5432)            // Returns PortStep
  .setDatabase('myapp')     // Returns DatabaseStep
  .build();                 // Only available after required steps
```

### **3. Hierarchical Builder**
```typescript
const document = DocumentBuilder
  .newDocument()
  .header()
    .title('Report')
    .logo('company.png')
    .done()
  .body()
    .section('Summary')
    .paragraph('Content...')
    .done()
  .build();
```

### **4. Director-Based Builder**
```typescript
const director = new HouseDirector();
const builder = new ModernHouseBuilder();
director.constructHouse(builder);
const house = builder.getResult();
```

## 🎨 Implementation Strategies

### **Validation Approaches**
1. **Immediate Validation**: Validate on each setter call
2. **Deferred Validation**: Validate only during build()
3. **Progressive Validation**: Validate as construction progresses

### **Required vs Optional Parameters**
1. **Constructor Requirements**: Pass required params to constructor
2. **Step Builder**: Type system enforces required steps
3. **Build-time Validation**: Check requirements during build()

### **Immutability Strategies**
1. **Copy on Build**: Builder creates copy during build()
2. **Transfer Ownership**: Builder gives up its state to product
3. **Defensive Copying**: Deep copy mutable properties

## 🚀 Modern TypeScript Features

### **Generic Builders**
```typescript
class Builder<T> {
  build(): T { /* implementation */ }
}
```

### **Type-Safe Fluent APIs**
```typescript
interface RequiredStep {
  required(value: string): OptionalStep;
}

interface OptionalStep {
  optional(value: string): OptionalStep;
  build(): Product;
}
```

### **Conditional Types**
```typescript
type BuilderState<T> = {
  [K in keyof T]?: T[K];
};
```

## 🔍 Common Use Cases

1. **Configuration Objects** - Database configs, application settings
2. **Query Builders** - SQL, NoSQL, search queries
3. **Document Generation** - PDF, HTML, reports
4. **Test Data Creation** - Mock objects, test fixtures
5. **HTTP Requests** - REST clients, API calls
6. **UI Components** - Complex widgets, forms
7. **Game Objects** - Characters, levels, items

## 🎓 Best Practices

1. **Keep Builders Focused** - One builder per product type
2. **Validate Appropriately** - Balance between immediate and deferred validation
3. **Provide Defaults** - Sensible defaults for optional parameters
4. **Make Products Immutable** - Separate construction from usage
5. **Use Type Safety** - Leverage TypeScript for compile-time validation
6. **Consider Performance** - Don't over-engineer simple objects
7. **Document Required Steps** - Clear API documentation for complex builders

## 📚 Related Patterns

- **Factory Method**: Can use builders internally for complex products
- **Abstract Factory**: Can return builders instead of products
- **Prototype**: Builders can use prototypes as starting points
- **Strategy**: Different building strategies for same product
- **Command**: Build commands for deferred execution

---

The Builder pattern is essential for creating complex objects in a controlled, readable, and maintainable way. It shines when dealing with objects that have many configuration options or require step-by-step construction processes. 