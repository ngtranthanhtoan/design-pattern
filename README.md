# Design Patterns Learning Repository 🚀

A comprehensive collection of design pattern implementations in TypeScript for educational purposes. Each pattern includes detailed explanations, real-world use cases, and practical code examples.

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

#### 1. Creational Patterns
- **1 - Creational - Singleton** - Ensures single instance with global access

#### 🔄 Coming Soon
- **2 - Creational - Factory Method**
- **3 - Creational - Abstract Factory**
- **4 - Creational - Builder**
- **5 - Structural - Adapter**
- **6 - Structural - Decorator**
- **7 - Behavioral - Observer**
- **8 - Behavioral - Strategy**

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
npm run singleton           # Show Singleton pattern use cases
npm run singleton:config    # Run Configuration Manager example
npm run singleton:logger    # Run Application Logger example
npm run singleton:cache     # Run Cache Manager example
npm run singleton:database  # Run Database Manager example
npm run singleton:eventbus  # Run Event Bus example
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