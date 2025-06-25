# Functional Programming Patterns

A comprehensive collection of functional programming patterns that provide modern alternatives to traditional Object-Oriented design patterns.

## Pattern Catalog (F1-F10)

### 🏗️ Foundation Patterns
**F1 - Maybe-Option Pattern** `npm run f1:maybe`
- Type-safe null handling with functional composition
- 🟢 Beginner | ✅ Complete

**F2 - Strategy Pattern - Higher-Order Functions** `npm run f2:strategy`
- Behavior selection using higher-order functions  
- 🟢 Beginner | ✅ Complete

**F3 - Factory Pattern - Factory Functions** `npm run f3:factory`
- Object creation through pure functions
- 🟢 Beginner | ✅ Complete

### 🔧 Composition Patterns
**F4 - Decorator Pattern - Function Composition** `npm run f4:decorator`
- Behavior enhancement through function composition
- 🟡 Intermediate | ✅ Complete

**F5 - Observer Pattern - Pub-Sub with Closures** `npm run f5:observer`
- Event-driven programming using closures
- 🟡 Intermediate | ✅ Complete

### 🚀 Advanced Patterns
**F6 - Builder Pattern - Fluent Interfaces** `npm run f6:builder`
- Fluent object construction with method chaining
- 🟡 Intermediate | 📋 Planned

**F7 - Command Pattern - Function Queues** `npm run f7:command`
- Action encapsulation with functional queues
- 🟡 Intermediate | 📋 Planned

**F8 - Monad Pattern** `npm run f8:monad`
- Advanced composition with monadic structures
- 🔴 Advanced | 📋 Planned

**F9 - Lens Pattern** `npm run f9:lens`
- Immutable data manipulation with focus
- 🔴 Advanced | 📋 Planned

**F10 - Reader Pattern** `npm run f10:reader`
- Dependency injection through function composition
- 🔴 Advanced | 📋 Planned

## Quick Start

```bash
# Overview of all patterns
npm run functional

# Foundation patterns (start here)
npm run f1:maybe          # Type-safe null handling
npm run f2:strategy       # Higher-order functions  
npm run f3:factory        # Function factories

# Composition patterns
npm run f4:decorator      # Function composition
npm run f5:observer       # Event-driven programming

# Advanced examples
npm run f2:strategy:validation    # Data validation system
npm run f3:factory:clients        # HTTP client factory
npm run f4:decorator:simple       # Simple middleware
```

## Key Benefits

- **🎯 Type Safety**: Compile-time guarantees vs runtime errors
- **⚡ Performance**: Direct function calls with minimal overhead  
- **🔧 Composability**: Natural function composition
- **🧪 Testability**: Pure functions are easier to test
- **♻️ Immutability**: Eliminates many concurrency bugs
- **📦 Modularity**: Clear separation of concerns

## 📋 Pattern Categories

### Reimagined OOP Patterns
- **Strategy Pattern** - Higher-Order Functions (`npm run functional:strategy`)
- **Factory Pattern** - Factory Functions (`npm run functional:factory`)
- **Decorator Pattern** - Function Composition (`npm run functional:decorator`)
- **Observer Pattern** - Pub/Sub with Closures (`npm run functional:observer`)
- **Command Pattern** - Function Queues (`npm run functional:command`)
- **Builder Pattern** - Fluent Interfaces (`npm run functional:builder`)

### Pure Functional Patterns
- **Maybe/Option Pattern** - Null-safe operations (`npm run functional:maybe`)
- **Monad Pattern** - Composable computations (`npm run functional:monad`)
- **Lens Pattern** - Immutable nested updates (`npm run functional:lens`)
- **Reader Pattern** - Dependency injection (`npm run functional:reader`)

## 🎓 Learning Path

1. **Beginner**: Start with Strategy and Factory patterns
2. **Intermediate**: Explore Decorator, Observer, Command, Builder, and Maybe patterns
3. **Advanced**: Master Monad, Lens, and Reader patterns

## 📚 Documentation

- **[introduction.md](./introduction.md)** - Comprehensive theory and concepts
- **[index.ts](./index.ts)** - Interactive overview and examples
- Individual pattern folders contain detailed implementations

## 💡 Key Benefits

- **Immutability** - No side effects, predictable code
- **Composability** - Easy function combination
- **Type Safety** - Better compile-time guarantees
- **Testability** - Pure functions are easier to test
- **Concurrency** - Thread-safe by default

Each pattern folder demonstrates real-world applications with comprehensive examples and modern TypeScript features. 