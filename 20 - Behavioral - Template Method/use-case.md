# Template Method Pattern - Use Cases

## Overview

The Template Method pattern is essential for defining algorithmic frameworks where the overall structure is fixed but specific steps vary. It's particularly valuable in scenarios where you need to ensure consistency across different implementations while allowing customization of individual steps. This pattern is widely used in frameworks, build systems, data processing pipelines, and any system that requires a standardized process with variable components.

## Use Cases

| Use Case | Problem | Solution | Demo File |
|----------|---------|----------|-----------|
| **Build System** | Different projects need different build steps but same overall process | Template method defines build pipeline with project-specific implementations | `use-case-build-system.ts` |
| **Data Processing Pipeline** | ETL processes vary by data source but follow same structure | Template method orchestrates extract-transform-load with source-specific steps | `use-case-data-processing.ts` |
| **Game Engine Loop** | Different games need different update/render logic but same loop structure | Template method defines game loop with game-specific update methods | `use-case-game-engine.ts` |
| **Report Generator** | Reports vary by data source and format but follow same generation process | Template method defines report creation with format-specific implementations | `use-case-report-generator.ts` |
| **Database Operations** | CRUD operations vary by entity but follow same validation/persistence pattern | Template method defines operation flow with entity-specific validation | `use-case-database-operations.ts` |
| **Web Request Processing** | Different endpoints need different handlers but same request flow | Template method defines request processing with endpoint-specific logic | `use-case-web-request.ts` |

## Use Case 1: Build System

### Problem
Different software projects require different build steps (compile, test, package, deploy) but all follow the same overall build process. Without a template, each project would duplicate the build logic, leading to inconsistencies and maintenance issues.

### Solution
The Template Method pattern defines a standardized build pipeline where the overall process is fixed, but each project can customize specific steps like compilation, testing, and deployment. The `BuildSystem` abstract class provides the template method `build()`, while concrete implementations like `JavaProject` and `NodeProject` provide project-specific implementations for each step.

**Target Interface**: `BuildSystem` with `build()` template method  
**Primitive Operations**: `compile()`, `test()`, `package()`, `deploy()`  
**Hook Methods**: `shouldRunTests()`, `shouldDeploy()`

## Use Case 2: Data Processing Pipeline

### Problem
ETL (Extract, Transform, Load) processes vary significantly by data source (databases, APIs, files) but all follow the same three-phase structure. Implementing each pipeline separately leads to code duplication and inconsistent error handling.

### Solution
The Template Method pattern defines a standardized ETL pipeline where the extract-transform-load structure is fixed, but each data source provides its own implementation for data extraction, transformation rules, and loading mechanisms. The `DataPipeline` abstract class orchestrates the process while concrete classes handle source-specific operations.

**Target Interface**: `DataPipeline` with `process()` template method  
**Primitive Operations**: `extract()`, `transform()`, `load()`  
**Hook Methods**: `validateData()`, `shouldTransform()`

## Use Case 3: Game Engine Loop

### Problem
Different games require different update and render logic, but all games follow the same basic loop structure (input → update → render). Without a template, each game would reimplement the loop, leading to inconsistencies and potential bugs.

### Solution
The Template Method pattern defines a standardized game loop where the overall structure (input processing, game state updates, rendering) is fixed, but each game provides its own implementation for game-specific logic. The `GameEngine` abstract class manages the loop while concrete game classes handle their specific update and render methods.

**Target Interface**: `GameEngine` with `gameLoop()` template method  
**Primitive Operations**: `processInput()`, `update()`, `render()`  
**Hook Methods**: `shouldContinue()`, `beforeRender()`

## Use Case 4: Report Generator

### Problem
Reports vary by data source (databases, APIs, files) and output format (PDF, HTML, CSV), but all follow the same generation process (fetch data, process, format, output). Implementing each report type separately leads to code duplication.

### Solution
The Template Method pattern defines a standardized report generation process where the overall flow is fixed, but each report type provides its own implementation for data fetching, processing, and formatting. The `ReportGenerator` abstract class orchestrates the process while concrete classes handle format-specific operations.

**Target Interface**: `ReportGenerator` with `generateReport()` template method  
**Primitive Operations**: `fetchData()`, `processData()`, `formatReport()`  
**Hook Methods**: `shouldIncludeCharts()`, `validateData()`

## Use Case 5: Database Operations

### Problem
CRUD operations vary by entity type (users, products, orders) but all follow the same pattern (validate → process → persist → notify). Implementing each operation separately leads to code duplication and inconsistent validation logic.

### Solution
The Template Method pattern defines a standardized CRUD operation flow where the overall process is fixed, but each entity provides its own implementation for validation, processing, and persistence logic. The `DatabaseOperation` abstract class manages the flow while concrete classes handle entity-specific operations.

**Target Interface**: `DatabaseOperation` with `execute()` template method  
**Primitive Operations**: `validate()`, `process()`, `persist()`  
**Hook Methods**: `shouldNotify()`, `beforePersist()`

## Use Case 6: Web Request Processing

### Problem
Different API endpoints require different request handling logic (authentication, validation, processing, response formatting) but all follow the same request processing flow. Implementing each endpoint separately leads to code duplication and inconsistent error handling.

### Solution
The Template Method pattern defines a standardized request processing pipeline where the overall flow is fixed, but each endpoint provides its own implementation for authentication, validation, and processing logic. The `RequestHandler` abstract class manages the pipeline while concrete classes handle endpoint-specific operations.

**Target Interface**: `RequestHandler` with `handleRequest()` template method  
**Primitive Operations**: `authenticate()`, `validate()`, `process()`  
**Hook Methods**: `shouldLog()`, `beforeResponse()`

## Best Practices / Anti-Patterns

### Best Practices
- **Keep Template Methods Simple**: The template method should focus on orchestrating the algorithm, not implementing complex logic
- **Use Hook Methods Sparingly**: Too many hooks can make the flow unpredictable and hard to understand
- **Document the Contract**: Clearly document what each primitive operation should do and what the template method guarantees
- **Provide Sensible Defaults**: Give hook methods sensible default implementations
- **Test Each Step Independently**: Ensure each primitive operation can be tested in isolation
- **Consider Composition**: For complex scenarios, consider combining Template Method with Strategy pattern

### Anti-Patterns
- **Template Method Explosion**: Having too many template methods in one class
- **Deep Inheritance Hierarchies**: Creating complex inheritance chains that are hard to understand
- **Rigid Templates**: Making templates so rigid that they're not useful for real-world scenarios
- **Hook Abuse**: Using hooks for everything, making the flow unpredictable
- **Violation of LSP**: Subclasses that don't follow the template contract
- **Over-Engineering**: Using Template Method for simple algorithms that don't need the structure 