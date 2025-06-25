# Design Patterns Learning Repository 🚀

A comprehensive collection of design pattern implementations in TypeScript for educational purposes. Each pattern includes detailed explanations, real-world use cases, practical code examples, and decision frameworks to help you choose the right pattern for your specific needs.

## 📁 Project Structure

```
design-pattern/
├── 1 - Creational - Singleton/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   ├── use-case-configuration-manager.ts # Config management example
│   ├── use-case-application-logger.ts    # Logging service example
│   ├── use-case-cache-manager.ts         # Caching system example
│   ├── use-case-database-manager.ts      # Database connection example
│   └── use-case-event-bus.ts            # Pub/Sub communication example
├── 2 - Creational - Factory Method/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   ├── use-case-database-connection-factory.ts # Multi-database support
│   ├── use-case-document-parser-factory.ts     # Multi-format parsing
│   ├── use-case-ui-component-factory.ts        # Multi-theme UI components
│   ├── use-case-logger-factory.ts              # Multi-destination logging
│   └── use-case-payment-processor-factory.ts   # Multi-provider payments
├── 3 - Creational - Abstract Factory/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   ├── use-case-cross-platform-ui-factory.ts  # Multi-platform UI components
│   ├── use-case-cloud-infrastructure-factory.ts # Multi-cloud resources
│   ├── use-case-ecommerce-platform-factory.ts  # Regional commerce services
│   ├── use-case-database-ecosystem-factory.ts  # Database type ecosystems
│   └── use-case-game-engine-component-factory.ts # Game engine backends
├── 4 - Creational - Builder/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple builder implementations] # Complex object construction
├── 5 - Creational - Prototype/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple prototype implementations] # Object cloning patterns
├── Function Patterns/
│   ├── introduction.md                    # Functional programming theory
│   ├── README.md                         # Quick reference guide
│   ├── index.ts                          # Interactive pattern overview
│   ├── F1 - Maybe-Option Pattern/
│   ├── F2 - Strategy Pattern - Higher-Order Functions/
│   ├── F3 - Factory Pattern - Factory Functions/
│   ├── F4 - Decorator Pattern - Function Composition/
│   ├── F5 - Observer Pattern - Pub-Sub with Closures/
│   ├── F6 - Builder Pattern - Fluent Interfaces/
│   ├── F7 - Command Pattern - Function Queues/
│   ├── F8 - Monad Pattern/
│   ├── F9 - Lens Pattern/
│   └── F10 - Reader Pattern/
├── Reflection/
│   └── factory-method-vs-abstract-factory.md # Practical decision guide
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify installation:**
   ```bash
   npm run build
   ```

## 🎯 Running Design Pattern Examples

### Method 1: Run Individual Use Cases
```bash
# Show available Singleton use cases
npm run singleton

# Run specific Singleton examples
npm run singleton:config    # Configuration Manager
npm run singleton:logger    # Application Logger  
npm run singleton:cache     # Cache Manager
npm run singleton:database  # Database Manager
npm run singleton:eventbus  # Event Bus

# Show available Factory Method use cases
npm run factory-method

# Run specific Factory Method examples
npm run factory-method:database  # Database Connection Factory
npm run factory-method:parser    # Document Parser Factory
npm run factory-method:ui        # UI Component Factory
npm run factory-method:logger    # Logger Factory
npm run factory-method:payment   # Payment Processor Factory

# Show available Abstract Factory use cases
npm run abstract-factory

# Run specific Abstract Factory examples
npm run abstract-factory:ui        # Cross-Platform UI Factory
npm run abstract-factory:cloud     # Cloud Infrastructure Factory
npm run abstract-factory:ecommerce # E-commerce Platform Factory
npm run abstract-factory:database  # Database Ecosystem Factory
npm run abstract-factory:game      # Game Engine Component Factory

# Show available Builder use cases
npm run builder

# Run specific Builder examples
npm run builder:config      # Configuration Builder
npm run builder:query       # Query Builder
npm run builder:document    # Document Builder
npm run builder:testdata    # Test Data Builder
npm run builder:http        # HTTP Request Builder

# Show available Prototype use cases
npm run prototype

# Run specific Prototype examples
npm run prototype:document      # Document Template Prototype
npm run prototype:configuration # Configuration Prototype
npm run prototype:game          # Game Object Prototype
npm run prototype:ui            # UI Component Prototype
npm run prototype:data          # Data Model Prototype

# Show available Functional Patterns overview
npm run functional

# Run specific Functional Pattern examples (F1-F10)
npm run f1:maybe                    # F1 - Maybe-Option Pattern
npm run f2:strategy                 # F2 - Strategy Pattern (Higher-Order Functions)
npm run f2:strategy:validation      # F2 - Data validation system example
npm run f3:factory                  # F3 - Factory Pattern (Factory Functions)
npm run f3:factory:clients          # F3 - HTTP client factory example
npm run f4:decorator                # F4 - Decorator Pattern (Function Composition)
npm run f4:decorator:middleware     # F4 - Middleware pipeline example
npm run f4:decorator:simple         # F4 - Simple middleware example
npm run f5:observer                 # F5 - Observer Pattern (Pub-Sub with Closures)
npm run f6:builder                  # F6 - Builder Pattern (Fluent Interfaces)
npm run f7:command                  # F7 - Command Pattern (Function Queues)
npm run f8:monad                    # F8 - Monad Pattern
npm run f9:lens                     # F9 - Lens Pattern
npm run f10:reader                  # F10 - Reader Pattern
```

### Method 2: Direct ts-node execution
```bash
# Run specific use case directly
npx ts-node "1 - Creational - Singleton/use-case-configuration-manager.ts"
npx ts-node "1 - Creational - Singleton/use-case-database-manager.ts"
```

### Method 3: Compile and run
```bash
# Compile TypeScript to JavaScript
npm run build

# Run compiled examples
node "dist/1 - Creational - Singleton/use-case-configuration-manager.js"
```

## 📚 Available Design Patterns

### ✅ Implemented Patterns

#### 1. Creational Patterns (Complete)
- **1 - Creational - Singleton** - Ensures single instance with global access
- **2 - Creational - Factory Method** - Provides interface for creating objects with subclass flexibility
- **3 - Creational - Abstract Factory** - Creates families of related objects that work together
- **4 - Creational - Builder** - Constructs complex objects step by step
- **5 - Creational - Prototype** - Creates objects by cloning existing instances

#### 2. Functional Programming Patterns (F1-F10)

**🏗️ Foundation Patterns**
- **F1 - Maybe-Option Pattern** - Type-safe null handling with functional composition
- **F2 - Strategy Pattern - Higher-Order Functions** - Behavior selection using higher-order functions
- **F3 - Factory Pattern - Factory Functions** - Object creation through pure functions

**🔧 Composition Patterns**  
- **F4 - Decorator Pattern - Function Composition** - Behavior enhancement through function composition
- **F5 - Observer Pattern - Pub-Sub with Closures** - Event-driven programming using closures

**🚀 Advanced Patterns**
- **F6 - Builder Pattern - Fluent Interfaces** - Fluent object construction with method chaining
- **F7 - Command Pattern - Function Queues** - Action encapsulation with functional queues
- **F8 - Monad Pattern** - Advanced composition with monadic structures
- **F9 - Lens Pattern** - Immutable data manipulation with focus
- **F10 - Reader Pattern** - Dependency injection through function composition

#### 🤔 Practical Guidance
- **Reflection/** - Decision guides, tips, and lessons learned from real implementations

#### 🔄 Coming Soon
- **6 - Structural - Adapter**
- **7 - Structural - Decorator** 
- **8 - Behavioral - Observer**
- **9 - Behavioral - Strategy**

## 🔍 Pattern Structure

Each pattern folder contains:

1. **`introduction.md`** - Pattern definition, structure, benefits, and drawbacks
2. **`use-case.md`** - Real-world scenarios and practical applications
3. **Individual use case files** - Focused implementations:
   - `use-case-configuration-manager.ts` - App settings management
   - `use-case-application-logger.ts` - Centralized logging service
   - `use-case-cache-manager.ts` - In-memory caching with TTL
   - `use-case-database-manager.ts` - Database connection simulation
   - `use-case-event-bus.ts` - Pub/Sub communication system
   - Each includes usage demonstrations and unit testing

## 💡 Learning Approach

### Recommended Learning Path:
1. **Read `introduction.md`** - Understand the pattern theory
2. **Review `use-case.md`** - See real-world applications  
3. **Run `npm run singleton`** - See available use cases
4. **Study individual use case files** - Focus on specific implementations
5. **Run examples** - `npm run singleton:config`, `npm run singleton:logger`, etc.
6. **Experiment** - Modify and extend the code

### Key Features:
- ✅ **Production-ready code** - Real-world implementations
- ✅ **Comprehensive examples** - 5+ practical use cases per pattern
- ✅ **Testing included** - Unit tests with reset capabilities
- ✅ **Immediate execution** - Run examples instantly
- ✅ **TypeScript support** - Full type safety and IntelliSense
- ✅ **Practical guidance** - Decision frameworks and real-world insights

## 🤔 Reflection & Practical Guidance

The **Reflection/** folder contains practical insights and decision frameworks gained from implementing these patterns in real-world scenarios. These reflections provide evidence-based guidance rather than theoretical advice, drawn directly from the implementations in this repository.

### 📚 Available Reflections:
- **[Factory Method vs Abstract Factory](./Reflection/factory-method-vs-abstract-factory.md)** - Comprehensive decision guide with practical examples, migration strategies, anti-patterns to avoid, and performance considerations

## 🚀 Example: Running Singleton Pattern

```bash
npm run singleton
```

**Output:**
```
🎯 Singleton Pattern - Individual Use Cases Available:
• ConfigurationManager - App settings management
• ApplicationLogger - Centralized logging
• CacheManager - In-memory caching with TTL
• DatabaseManager - Fake database connections
• EventBus - Pub/Sub communication

📋 Run individual examples:
npm run singleton:config    - Configuration Manager
npm run singleton:logger    - Application Logger
npm run singleton:cache     - Cache Manager
npm run singleton:database  - Database Manager
npm run singleton:eventbus  - Event Bus
```

**Individual Use Case Example:**
```bash
npm run singleton:config
```
**Output:**
```
=== CONFIGURATION MANAGER DEMO ===
API URL: https://api.example.com
Database URL: postgresql://localhost:5432/myapp
Is Production? true
Cache Enabled? true
Same instance? true

=== CONFIGURATION MANAGER TESTS ===
Test 1 - Default environment: development
Test 2 - Custom environment: testing
Test 3 - Same instance after reset? true
```

## 📖 Available Scripts

```bash
npm run build               # Compile TypeScript to JavaScript
npm run dev                 # Run with hot reload (ts-node-dev)
npm run test                # Run Jest tests
npm run lint                # Run ESLint
npm run format              # Format code with Prettier
npm run clean               # Clean build directory
npm run singleton                # Show Singleton pattern use cases
npm run singleton:config         # Run Configuration Manager example
npm run singleton:logger         # Run Application Logger example
npm run singleton:cache          # Run Cache Manager example
npm run singleton:database       # Run Database Manager example
npm run singleton:eventbus       # Run Event Bus example
npm run factory-method           # Show Factory Method pattern use cases
npm run factory-method:database  # Run Database Connection Factory example
npm run factory-method:parser    # Run Document Parser Factory example
npm run factory-method:ui        # Run UI Component Factory example
npm run factory-method:logger    # Run Logger Factory example
npm run factory-method:payment   # Run Payment Processor Factory example
npm run abstract-factory         # Show Abstract Factory pattern use cases
npm run abstract-factory:ui      # Run Cross-Platform UI Factory example
npm run abstract-factory:cloud   # Run Cloud Infrastructure Factory example
npm run abstract-factory:ecommerce # Run E-commerce Platform Factory example
npm run abstract-factory:database  # Run Database Ecosystem Factory example
npm run abstract-factory:game    # Run Game Engine Component Factory example
npm run builder                  # Show Builder pattern use cases
npm run builder:config           # Run Configuration Builder example
npm run builder:query            # Run Query Builder example
npm run builder:document         # Run Document Builder example
npm run builder:testdata         # Run Test Data Builder example
npm run builder:http             # Run HTTP Request Builder example
npm run prototype                # Show Prototype pattern use cases
npm run prototype:document       # Run Document Template Prototype example
npm run prototype:configuration  # Run Configuration Prototype example
npm run prototype:game           # Run Game Object Prototype example
npm run prototype:ui             # Run UI Component Prototype example
npm run prototype:data           # Run Data Model Prototype example
npm run functional               # Show Functional Patterns overview
npm run f1:maybe                 # F1 - Maybe-Option Pattern
npm run f2:strategy              # F2 - Strategy Pattern (Higher-Order Functions)
npm run f2:strategy:validation   # F2 - Data validation system example
npm run f3:factory               # F3 - Factory Pattern (Factory Functions)
npm run f3:factory:clients       # F3 - HTTP client factory example
npm run f4:decorator             # F4 - Decorator Pattern (Function Composition)
npm run f4:decorator:middleware  # F4 - Middleware pipeline example
npm run f4:decorator:simple      # F4 - Simple middleware example
npm run f5:observer              # F5 - Observer Pattern (Pub-Sub with Closures)
npm run f6:builder               # F6 - Builder Pattern (Fluent Interfaces)
npm run f7:command               # F7 - Command Pattern (Function Queues)
npm run f8:monad                 # F8 - Monad Pattern
npm run f9:lens                  # F9 - Lens Pattern
npm run f10:reader               # F10 - Reader Pattern
```

## 🎨 Code Quality

The project includes:
- **TypeScript** - Full type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing framework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing pattern structure
4. Add comprehensive examples and tests
5. Submit a pull request

## 📝 License

MIT License - Feel free to use this for learning and teaching!

## 🎯 Next Steps

After mastering these patterns:
1. Try implementing your own variations
2. Combine patterns for complex scenarios
3. Apply patterns to real projects
4. Explore advanced architectural patterns

---

**Happy Learning! 🎓**

*This repository is designed to make design patterns accessible and practical for developers at all levels.* 