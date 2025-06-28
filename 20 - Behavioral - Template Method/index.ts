/**
 * Template Method Pattern
 * 
 * Defines the skeleton of an algorithm in a method, deferring some steps to subclasses.
 * Lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure.
 * 
 * Key Benefits:
 * - Code reuse through common algorithm structure
 * - Extensibility through subclass implementations
 * - Consistency across different algorithm variants
 * - Maintainability through centralized algorithm logic
 * 
 * Use Cases:
 * - Build systems with project-specific steps
 * - Data processing pipelines (ETL)
 * - Game engine loops
 * - Report generators
 * - Database operations
 * - Web request processing
 */

import { exit } from "process";

console.log("🎯 Template Method Pattern Examples");
console.log("===================================");
console.log();

console.log("Available Examples:");
console.log("1. Build System - Different project build processes");
console.log("2. Data Processing Pipeline - ETL with different data sources");
console.log("3. Game Engine Loop - Game loop with different update logic");
console.log("4. Report Generator - Reports with different formats");
console.log("5. Database Operations - CRUD with different entities");
console.log("6. Web Request Processing - API endpoints with different handlers");
console.log();

console.log("Run specific examples:");
console.log("npm run template:build-system");
console.log("npm run template:data-processing");
console.log("npm run template:game-engine");
console.log("npm run template:report-generator");
console.log("npm run template:database-operations");
console.log("npm run template:web-request");
console.log();

console.log("Key Concepts:");
console.log("- Template Method: Defines algorithm structure");
console.log("- Primitive Operations: Abstract methods for subclasses");
console.log("- Hook Methods: Optional methods for customization");
console.log("- Concrete Classes: Implement specific algorithm steps");
console.log();

console.log("Pattern Structure:");
console.log("AbstractClass.templateMethod() → orchestrates algorithm");
console.log("  ├── primitiveOp1() → abstract, must implement");
console.log("  ├── primitiveOp2() → abstract, must implement");
console.log("  ├── hook() → optional, can override");
console.log("  └── concreteOp() → common, shared logic");
console.log();

exit(0); 