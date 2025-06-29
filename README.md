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
├── 6 - Structural - Adapter/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   ├── use-case-payment-gateway-adapter.ts     # Payment gateway integration
│   ├── use-case-database-driver-adapter.ts     # Database driver abstraction
│   ├── use-case-file-format-converter-adapter.ts # File format conversion
│   ├── use-case-soap-user-service-adapter.ts   # Legacy SOAP service adapter
│   └── use-case-logger-winston-adapter.ts      # Logger framework adapter
├── 7 - Structural - Bridge/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple bridge implementations]  # Abstraction-implementation separation
├── 8 - Structural - Composite/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple composite implementations] # Tree structure handling
├── 9 - Structural - Decorator/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple decorator implementations] # Dynamic behavior extension
├── 10 - Structural - Facade/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple facade implementations]  # Simplified subsystem interface
├── 11 - Structural - Flyweight/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple flyweight implementations] # Memory optimization
├── 12 - Structural - Proxy/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple proxy implementations]   # Access control and caching
├── 13 - Behavioral - Chain of Responsibility/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple chain implementations]   # Request processing pipeline
├── 14 - Behavioral - Command/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple command implementations] # Action encapsulation
├── 15 - Behavioral - Iterator/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple iterator implementations] # Collection traversal
├── 16 - Behavioral - Mediator/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple mediator implementations] # Object communication
├── 17 - Behavioral - Memento/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple memento implementations] # State restoration
├── 18 - Behavioral - Observer/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple observer implementations] # Event notification
├── 19 - Behavioral - State/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple state implementations]   # State-dependent behavior
├── 20 - Behavioral - Template Method/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple template implementations] # Algorithm skeleton
├── 21 - Behavioral - Visitor/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple visitor implementations] # Operation separation
├── 22 - Behavioral - Strategy/
│   ├── introduction.md                    # Pattern theory and concepts
│   ├── use-case.md                       # Real-world applications
│   ├── index.ts                          # Available use cases overview
│   └── [Multiple strategy implementations] # Algorithm selection
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
│   ├── factory-method-vs-abstract-factory.md # Practical decision guide
│   ├── adapter-pattern-in-functional-programming.md # FP perspective on adapters
│   ├── facade-composite-decorator-flyweight.md # Structural pattern comparison
│   ├── observer-vs-bridge-pattern-comparison.md # Communication pattern analysis
│   ├── template-method-vs-composite-pattern-comparison.md # Algorithm vs structure
│   └── oo-to-fp-pattern-mapping.md # Comprehensive OO to FP mapping
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

# Show available Adapter use cases
npm run adapter

# Run specific Adapter examples
npm run adapter:payment     # Payment Gateway Adapter
npm run adapter:database    # Database Driver Adapter
npm run adapter:file        # File Format Converter Adapter
npm run adapter:soap        # SOAP User Service Adapter
npm run adapter:logger      # Winston Logger Adapter

# Show available Bridge use cases
npm run bridge

# Run specific Bridge examples
npm run bridge:messaging    # Messaging Bridge
npm run bridge:shapes       # Shape Renderer Bridge
npm run bridge:storage      # Storage Provider Bridge
npm run bridge:featureflag  # Feature Flag Bridge
npm run bridge:payment      # Payment Gateway Bridge

# Show available Composite use cases
npm run composite

# Run specific Composite examples
npm run composite:filesystem # Filesystem Composite
npm run composite:widgets    # UI Widget Composite
npm run composite:org        # Organization Chart Composite
npm run composite:graphics   # Graphic Group Composite
npm run composite:menu       # Menu Composite

# Show available Decorator use cases
npm run decorator

# Run specific Decorator examples
npm run decorator:http       # HTTP Middleware Decorator
npm run decorator:logger     # Logger Decorator
npm run decorator:encrypt    # Encryption Stream Decorator
npm run decorator:ui         # UI Component Decorator
npm run decorator:repo       # Repository Validation Decorator

# Show available Facade use cases
npm run facade

# Run specific Facade examples
npm run facade:home          # Home Theater Facade
npm run facade:payment       # Payment Processing Facade
npm run facade:notify        # Notification Facade
npm run facade:cloud         # Cloud Deployment Facade
npm run facade:api           # API Client Facade

# Show available Flyweight use cases
npm run flyweight

# Run specific Flyweight examples
npm run flyweight:forest     # Forest Flyweight
npm run flyweight:map        # Map Marker Flyweight
npm run flyweight:particles  # Particle System Flyweight
npm run flyweight:glyphs     # Text Glyph Flyweight
npm run flyweight:styles     # UI Style Flyweight

# Show available Proxy use cases
npm run proxy

# Run specific Proxy examples
npm run proxy:cache          # Cache Proxy
npm run proxy:security       # Security Proxy
npm run proxy:remote         # Remote Proxy
npm run proxy:lazy           # Lazy Image Proxy
npm run proxy:rate           # Rate Limit Proxy

# Show available Chain of Responsibility use cases
npm run chain

# Run specific Chain of Responsibility examples
npm run chain:http           # HTTP Validation Chain
npm run chain:logging        # Logging Chain
npm run chain:purchase       # Purchase Approval Chain
npm run chain:support        # Support Escalation Chain
npm run chain:spam           # Email Spam Filter Chain

# Show available Command use cases
npm run command

# Run specific Command examples
npm run command:text-editor  # Text Editor Commands
npm run command:smart-home   # Smart Home Commands
npm run command:restaurant   # Restaurant Commands
npm run command:game-input   # Game Input Commands
npm run command:database     # Database Commands
npm run command:react-form   # React Form Commands

# Show available Iterator use cases
npm run iterator

# Run specific Iterator examples
npm run iterator:database    # Database Iterator
npm run iterator:filesystem  # Filesystem Iterator
npm run iterator:tree        # Tree Iterator
npm run iterator:stream      # Stream Iterator
npm run iterator:gui         # GUI Iterator
npm run iterator:notification # Notification Iterator

# Show available Mediator use cases
npm run mediator

# Run specific Mediator examples
npm run mediator:airtraffic  # Air Traffic Control
npm run mediator:chat        # Chat System
npm run mediator:smarthome   # Smart Home
npm run mediator:ecommerce   # E-commerce
npm run mediator:gameengine  # Game Engine
npm run mediator:car-system  # Car System

# Show available Memento use cases
npm run memento

# Run specific Memento examples
npm run memento:text-editor  # Text Editor Memento
npm run memento:graphics     # Graphics Memento
npm run memento:database     # Database Memento
npm run memento:game         # Game Memento
npm run memento:configuration # Configuration Memento

# Show available Observer use cases
npm run observer

# Run specific Observer examples
npm run observer:stock-market # Stock Market Observer
npm run observer:social-media # Social Media Observer
npm run observer:logging      # Logging Observer
npm run observer:weather      # Weather Station Observer
npm run observer:game-engine  # Game Engine Observer
npm run observer:slack        # Slack Notification Observer

# Show available State use cases
npm run state

# Run specific State examples
npm run state:document-workflow # Document Workflow State
npm run state:game-character    # Game Character State
npm run state:order-processing  # Order Processing State
npm run state:ticket-support    # Ticket Support State
npm run state:traffic-light     # Traffic Light State
npm run state:vending-machine   # Vending Machine State

# Show available Template Method use cases
npm run template-method

# Run specific Template Method examples
npm run template-method:build-system    # Build System Template
npm run template-method:data-processing # Data Processing Template
npm run template-method:database        # Database Operations Template
npm run template-method:game-engine     # Game Engine Template
npm run template-method:report-generator # Report Generator Template
npm run template-method:web-request     # Web Request Template

# Show available Visitor use cases
npm run visitor

# Run specific Visitor examples
npm run visitor:document      # Document Processing Visitor
npm run visitor:ast           # AST Compiler Visitor
npm run visitor:graphics      # Graphics System Visitor
npm run visitor:filesystem    # File System Visitor
npm run visitor:game          # Game Engine Visitor
npm run visitor:config        # Configuration System Visitor

# Show available Strategy use cases
npm run strategy

# Run specific Strategy examples
npm run strategy:payment      # Payment Processing Strategy
npm run strategy:validation   # Data Validation Strategy
npm run strategy:sorting      # Sorting Algorithms Strategy
npm run strategy:compression  # Compression System Strategy
npm run strategy:pricing      # Pricing Strategy
npm run strategy:authentication # Authentication Strategy
npm run strategy:notification # Notification Strategy

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

#### 2. Structural Patterns (Complete)
- **6 - Structural - Adapter** - Allows incompatible interfaces to work together
- **7 - Structural - Bridge** - Separates abstraction from implementation
- **8 - Structural - Composite** - Composes objects into tree structures
- **9 - Structural - Decorator** - Adds behavior to objects dynamically
- **10 - Structural - Facade** - Provides simplified interface to complex subsystem
- **11 - Structural - Flyweight** - Reduces memory usage by sharing common parts
- **12 - Structural - Proxy** - Provides surrogate or placeholder for another object

#### 3. Behavioral Patterns (Complete)
- **13 - Behavioral - Chain of Responsibility** - Passes requests along handler chain
- **14 - Behavioral - Command** - Encapsulates request as object
- **15 - Behavioral - Iterator** - Accesses elements of collection without exposing structure
- **16 - Behavioral - Mediator** - Reduces coupling between components
- **17 - Behavioral - Memento** - Captures and restores object state
- **18 - Behavioral - Observer** - Defines one-to-many dependency between objects
- **19 - Behavioral - State** - Allows object to alter behavior when state changes
- **20 - Behavioral - Template Method** - Defines algorithm skeleton in superclass
- **21 - Behavioral - Visitor** - Separates algorithm from object structure
- **22 - Behavioral - Strategy** - Defines family of algorithms and makes them interchangeable

#### 4. Functional Programming Patterns (F1-F10)

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

## 🔍 Pattern Structure

Each pattern folder contains:

1. **`introduction.md`** - Pattern definition, structure, benefits, and drawbacks
2. **`use-case.md`** - Real-world scenarios and practical applications
3. **Individual use case files** - Focused implementations:
   - Each includes usage demonstrations and unit testing
   - Production-ready code with proper error handling
   - Comprehensive examples with real-world complexity

## 💡 Learning Approach

### Recommended Learning Path:
1. **Read `introduction.md`** - Understand the pattern theory
2. **Review `use-case.md`** - See real-world applications  
3. **Run `npm run [pattern]`** - See available use cases
4. **Study individual use case files** - Focus on specific implementations
5. **Run examples** - `npm run [pattern]:[example]`
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
- **[Adapter Pattern in Functional Programming](./Reflection/adapter-pattern-in-functional-programming.md)** - FP perspective on adapter patterns with practical examples
- **[Facade, Composite, Decorator, Flyweight Comparison](./Reflection/facade-composite-decorator-flyweight.md)** - Structural pattern comparison and decision framework
- **[Observer vs Bridge Pattern Comparison](./Reflection/observer-vs-bridge-pattern-comparison.md)** - Communication pattern analysis and use case guidance
- **[Template Method vs Composite Pattern Comparison](./Reflection/template-method-vs-composite-pattern-comparison.md)** - Algorithm vs structure pattern comparison
- **[OO to FP Pattern Mapping](./Reflection/oo-to-fp-pattern-mapping.md)** - Comprehensive mapping of OO patterns to functional equivalents

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

# Creational Patterns
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

# Structural Patterns
npm run adapter                  # Show Adapter pattern use cases
npm run adapter:payment          # Run Payment Gateway Adapter example
npm run adapter:database         # Run Database Driver Adapter example
npm run adapter:file             # Run File Format Converter Adapter example
npm run adapter:soap             # Run SOAP User Service Adapter example
npm run adapter:logger           # Run Winston Logger Adapter example
npm run bridge                   # Show Bridge pattern use cases
npm run bridge:messaging         # Run Messaging Bridge example
npm run bridge:shapes            # Run Shape Renderer Bridge example
npm run bridge:storage           # Run Storage Provider Bridge example
npm run bridge:featureflag       # Run Feature Flag Bridge example
npm run bridge:payment           # Run Payment Gateway Bridge example
npm run composite                # Show Composite pattern use cases
npm run composite:filesystem     # Run Filesystem Composite example
npm run composite:widgets        # Run UI Widget Composite example
npm run composite:org            # Run Organization Chart Composite example
npm run composite:graphics       # Run Graphic Group Composite example
npm run composite:menu           # Run Menu Composite example
npm run decorator                # Show Decorator pattern use cases
npm run decorator:http           # Run HTTP Middleware Decorator example
npm run decorator:logger         # Run Logger Decorator example
npm run decorator:encrypt        # Run Encryption Stream Decorator example
npm run decorator:ui             # Run UI Component Decorator example
npm run decorator:repo           # Run Repository Validation Decorator example
npm run facade                   # Show Facade pattern use cases
npm run facade:home              # Run Home Theater Facade example
npm run facade:payment           # Run Payment Processing Facade example
npm run facade:notify            # Run Notification Facade example
npm run facade:cloud             # Run Cloud Deployment Facade example
npm run facade:api               # Run API Client Facade example
npm run flyweight                # Show Flyweight pattern use cases
npm run flyweight:forest         # Run Forest Flyweight example
npm run flyweight:map            # Run Map Marker Flyweight example
npm run flyweight:particles      # Run Particle System Flyweight example
npm run flyweight:glyphs         # Run Text Glyph Flyweight example
npm run flyweight:styles         # Run UI Style Flyweight example
npm run proxy                    # Show Proxy pattern use cases
npm run proxy:cache              # Run Cache Proxy example
npm run proxy:security           # Run Security Proxy example
npm run proxy:remote             # Run Remote Proxy example
npm run proxy:lazy               # Run Lazy Image Proxy example
npm run proxy:rate               # Run Rate Limit Proxy example

# Behavioral Patterns
npm run chain                    # Show Chain of Responsibility pattern use cases
npm run chain:http               # Run HTTP Validation Chain example
npm run chain:logging            # Run Logging Chain example
npm run chain:purchase           # Run Purchase Approval Chain example
npm run chain:support            # Run Support Escalation Chain example
npm run chain:spam               # Run Email Spam Filter Chain example
npm run command                  # Show Command pattern use cases
npm run command:text-editor      # Run Text Editor Commands example
npm run command:smart-home       # Run Smart Home Commands example
npm run command:restaurant       # Run Restaurant Commands example
npm run command:game-input       # Run Game Input Commands example
npm run command:database         # Run Database Commands example
npm run command:react-form       # Run React Form Commands example
npm run iterator                 # Show Iterator pattern use cases
npm run iterator:database        # Run Database Iterator example
npm run iterator:filesystem      # Run Filesystem Iterator example
npm run iterator:tree            # Run Tree Iterator example
npm run iterator:stream          # Run Stream Iterator example
npm run iterator:gui             # Run GUI Iterator example
npm run iterator:notification    # Run Notification Iterator example
npm run mediator                 # Show Mediator pattern use cases
npm run mediator:airtraffic      # Run Air Traffic Control example
npm run mediator:chat            # Run Chat System example
npm run mediator:smarthome       # Run Smart Home example
npm run mediator:ecommerce       # Run E-commerce example
npm run mediator:gameengine      # Run Game Engine example
npm run mediator:car-system      # Run Car System example
npm run memento                  # Show Memento pattern use cases
npm run memento:text-editor      # Run Text Editor Memento example
npm run memento:graphics         # Run Graphics Memento example
npm run memento:database         # Run Database Memento example
npm run memento:game             # Run Game Memento example
npm run memento:configuration    # Run Configuration Memento example
npm run observer                 # Show Observer pattern use cases
npm run observer:stock-market    # Run Stock Market Observer example
npm run observer:social-media    # Run Social Media Observer example
npm run observer:logging         # Run Logging Observer example
npm run observer:weather         # Run Weather Station Observer example
npm run observer:game-engine     # Run Game Engine Observer example
npm run observer:slack           # Run Slack Notification Observer example
npm run state                    # Show State pattern use cases
npm run state:document-workflow  # Run Document Workflow State example
npm run state:game-character     # Run Game Character State example
npm run state:order-processing   # Run Order Processing State example
npm run state:ticket-support     # Run Ticket Support State example
npm run state:traffic-light      # Run Traffic Light State example
npm run state:vending-machine    # Run Vending Machine State example
npm run template-method          # Show Template Method pattern use cases
npm run template-method:build-system    # Run Build System Template example
npm run template-method:data-processing # Run Data Processing Template example
npm run template-method:database        # Run Database Operations Template example
npm run template-method:game-engine     # Run Game Engine Template example
npm run template-method:report-generator # Run Report Generator Template example
npm run template-method:web-request     # Run Web Request Template example
npm run visitor                  # Show Visitor pattern use cases
npm run visitor:document         # Run Document Processing Visitor example
npm run visitor:ast              # Run AST Compiler Visitor example
npm run visitor:graphics         # Run Graphics System Visitor example
npm run visitor:filesystem       # Run File System Visitor example
npm run visitor:game             # Run Game Engine Visitor example
npm run visitor:config           # Run Configuration System Visitor example
npm run strategy                 # Show Strategy pattern use cases
npm run strategy:payment         # Run Payment Processing Strategy example
npm run strategy:validation      # Run Data Validation Strategy example
npm run strategy:sorting         # Run Sorting Algorithms Strategy example
npm run strategy:compression     # Run Compression System Strategy example
npm run strategy:pricing         # Run Pricing Strategy example
npm run strategy:authentication  # Run Authentication Strategy example
npm run strategy:notification    # Run Notification Strategy example

# Functional Patterns
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