# Factory Method Pattern

## What is the Factory Method Pattern?

The Factory Method pattern is a **creational design pattern** that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created. Instead of calling a constructor directly, you call a factory method.

## Key Characteristics

1. **Object Creation Abstraction**: Delegates object creation to factory methods
2. **Loose Coupling**: Client code doesn't depend on concrete classes
3. **Extensibility**: Easy to add new product types without changing existing code
4. **Single Responsibility**: Separates object creation from object usage

## How it Works

The Factory Method pattern defines a method for creating objects, but lets subclasses decide which class to instantiate:

- **Creator**: Abstract class that declares the factory method
- **Concrete Creator**: Implements the factory method to create specific products
- **Product**: Interface or abstract class for objects the factory creates
- **Concrete Product**: Specific implementations of the product interface

## Structure

```
┌─────────────────┐         ┌─────────────────┐
│    Creator      │         │    Product      │
├─────────────────┤         ├─────────────────┤
│ + factoryMethod │◇────────│ + operation()   │
│ + someOperation │         └─────────────────┘
└─────────────────┘                 △
        △                           │
        │                           │
┌─────────────────┐         ┌─────────────────┐
│ ConcreteCreator │         │ ConcreteProduct │
├─────────────────┤         ├─────────────────┤
│ + factoryMethod │─────────│ + operation()   │
└─────────────────┘         └─────────────────┘
```

## Benefits

- **Flexibility**: Easy to introduce new product types
- **Decoupling**: Eliminates tight coupling between creator and concrete products
- **Code Reusability**: Common creation logic can be shared
- **Single Responsibility Principle**: Separates product creation from product usage
- **Open/Closed Principle**: Open for extension, closed for modification

## Drawbacks

- **Complexity**: Can make code more complex for simple object creation
- **Class Proliferation**: May require many creator classes
- **Indirection**: Extra layer of abstraction might be unnecessary for simple cases

## When to Use

✅ **Use Factory Method when:**
- You don't know beforehand the exact types and dependencies of objects your code should work with
- You want to provide users with a way to extend internal components
- You want to save system resources by reusing existing objects
- You need to decouple object creation from object usage

❌ **Don't use when:**
- Object creation is simple and unlikely to change
- You only have one type of product to create
- The added complexity doesn't provide clear benefits

## Related Patterns

- **Abstract Factory**: Factory Method is often used within Abstract Factory
- **Template Method**: Factory Method is a specialization of Template Method
- **Prototype**: Can use Prototype to avoid subclassing Creator classes 