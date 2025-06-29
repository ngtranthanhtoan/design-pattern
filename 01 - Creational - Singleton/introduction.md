# Singleton Pattern

## What is the Singleton Pattern?

The Singleton pattern is a **creational design pattern** that ensures a class has only one instance and provides a global point of access to that instance.

## Key Characteristics

1. **Single Instance**: Only one instance of the class can exist
2. **Global Access**: Provides a global access point to the instance
3. **Lazy Initialization**: The instance is typically created when first needed
4. **Thread Safety**: Must handle concurrent access properly

## How it Works

The Singleton pattern restricts the instantiation of a class to a single object by:

- Making the constructor private
- Providing a static method that returns the same instance
- Storing the instance in a static variable

## Structure

```
┌─────────────────┐
│    Singleton    │
├─────────────────┤
│ - instance      │
├─────────────────┤
│ + getInstance() │
│ - constructor() │
└─────────────────┘
```

## Benefits

- **Controlled access** to the sole instance
- **Reduced namespace pollution** (no global variables)
- **Lazy initialization** saves memory
- **Consistent state** across the application

## Drawbacks

- **Difficult to test** (global state)
- **Violates Single Responsibility Principle** (manages both its creation and business logic)
- **Hidden dependencies** (not obvious from class interface)
- **Concurrency issues** if not implemented properly 