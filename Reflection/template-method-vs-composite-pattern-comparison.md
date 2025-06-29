# Template Method vs Composite Pattern: A Comparative Analysis

## Executive Summary

While Template Method and Composite patterns may appear similar due to their hierarchical structures and polymorphic behavior, they serve fundamentally different purposes. Template Method focuses on **algorithm structure** with variable steps, while Composite focuses on **object composition** with uniform treatment. Understanding their differences is crucial for choosing the right pattern for your specific use case.

## Pattern Overview

### Template Method Pattern
- **Purpose**: Define the skeleton of an algorithm, deferring some steps to subclasses
- **Structure**: Inheritance-based hierarchy with abstract base class
- **Key Concept**: "Don't call us, we'll call you" - base class controls the flow
- **Use Cases**: Build systems, data processing pipelines, game loops, report generators

### Composite Pattern
- **Purpose**: Compose objects into tree structures and treat individual objects and compositions uniformly
- **Structure**: Composition-based hierarchy with component interface
- **Key Concept**: "Same interface, different behavior" - leaf and composite implement same operations
- **Use Cases**: File systems, UI component trees, organizational structures, menu systems

## Structural Comparison

### Template Method Structure
```
AbstractClass
├── templateMethod() [final]
│   ├── primitiveOp1() [abstract]
│   ├── primitiveOp2() [abstract]
│   ├── hook() [optional]
│   └── concreteOp() [common]
└── ConcreteClass
    ├── primitiveOp1() [implementation]
    ├── primitiveOp2() [implementation]
    └── hook() [override]
```

### Composite Structure
```
Component
├── operation() [interface]
├── add() [optional]
├── remove() [optional]
└── getChild() [optional]
├── Leaf
│   └── operation() [implementation]
└── Composite
    ├── operation() [implementation]
    ├── children: Component[]
    ├── add() [implementation]
    ├── remove() [implementation]
    └── getChild() [implementation]
```

## Key Similarities

### 1. Hierarchical Organization
Both patterns organize behavior in a hierarchical manner:
- **Template Method**: Inheritance hierarchy with base class defining structure
- **Composite**: Composition hierarchy with component interface defining contract

### 2. Polymorphic Behavior
Both leverage polymorphism to achieve different behaviors:
- **Template Method**: Different subclasses provide different implementations of primitive operations
- **Composite**: Different component types (leaf vs composite) provide different implementations of the same operations

### 3. Uniform Interface
Both provide consistent interfaces across different implementations:
- **Template Method**: All subclasses follow the same template method contract
- **Composite**: All components implement the same component interface

### 4. Algorithm Orchestration
Both involve orchestration of operations:
- **Template Method**: Base class orchestrates the algorithm flow
- **Composite**: Composite objects orchestrate operations across their children

## Key Differences

### 1. Primary Intent
| Aspect | Template Method | Composite |
|--------|----------------|-----------|
| **Focus** | Algorithm structure | Object composition |
| **Goal** | Define process with variable steps | Treat objects uniformly |
| **Relationship** | "Is-a" (inheritance) | "Has-a" (composition) |

### 2. Structure Characteristics
| Characteristic | Template Method | Composite |
|----------------|----------------|-----------|
| **Structure Type** | Linear algorithm | Tree structure |
| **Flow Control** | Fixed sequence | Recursive traversal |
| **Component Types** | Abstract + Concrete classes | Leaf + Composite objects |
| **Relationships** | Parent-child (inheritance) | Parent-child (composition) |

### 3. Implementation Approach
| Approach | Template Method | Composite |
|----------|----------------|-----------|
| **Coupling** | Tight (inheritance) | Loose (composition) |
| **Flexibility** | Fixed algorithm structure | Dynamic structure |
| **Extensibility** | New subclasses | New component types |
| **Runtime Changes** | Limited | Highly flexible |

## When to Use Each Pattern

### Use Template Method When:

#### ✅ Algorithm Structure is Fixed
```typescript
// Build system with fixed steps
abstract class BuildSystem {
  public final build(): BuildResult {
    this.setup();
    this.compile();
    this.test();
    this.package();
    this.deploy();
  }
  
  protected abstract compile(): BuildResult;
  protected abstract package(): BuildResult;
  protected abstract deploy(): BuildResult;
}
```

#### ✅ Steps Vary by Implementation
```typescript
// Different data processing pipelines
abstract class DataPipeline {
  public process(): ProcessingResult {
    this.extract();
    this.transform();
    this.load();
  }
  
  protected abstract extract(): ProcessingResult;
  protected abstract transform(): ProcessingResult;
  protected abstract load(): ProcessingResult;
}
```

#### ✅ You Need Consistent Process Flow
```typescript
// Game loop with consistent structure
abstract class GameEngine {
  public gameLoop(): void {
    this.processInput();
    this.update();
    this.render();
  }
  
  protected abstract update(): void;
  protected abstract render(): void;
}
```

### Use Composite When:

#### ✅ Objects Form Tree Structure
```typescript
// File system hierarchy
interface FileSystemComponent {
  display(): void;
  getSize(): number;
}

class File implements FileSystemComponent {
  display() { /* show file */ }
  getSize() { return this.size; }
}

class Directory implements FileSystemComponent {
  private children: FileSystemComponent[] = [];
  
  display() { 
    this.children.forEach(child => child.display());
  }
  
  getSize() {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }
}
```

#### ✅ You Need Uniform Treatment
```typescript
// UI component tree
interface UIComponent {
  render(): void;
  add(component: UIComponent): void;
  remove(component: UIComponent): void;
}

class Button implements UIComponent {
  render() { /* render button */ }
  add() { throw new Error("Cannot add to leaf"); }
  remove() { throw new Error("Cannot remove from leaf"); }
}

class Panel implements UIComponent {
  private children: UIComponent[] = [];
  
  render() {
    this.children.forEach(child => child.render());
  }
  
  add(component: UIComponent) {
    this.children.push(component);
  }
  
  remove(component: UIComponent) {
    const index = this.children.indexOf(component);
    if (index > -1) this.children.splice(index, 1);
  }
}
```

#### ✅ Operations Work Recursively
```typescript
// Organizational structure
interface Employee {
  getSalary(): number;
  addSubordinate(employee: Employee): void;
  removeSubordinate(employee: Employee): void;
}

class IndividualEmployee implements Employee {
  getSalary() { return this.salary; }
  addSubordinate() { throw new Error("Individual cannot have subordinates"); }
  removeSubordinate() { throw new Error("Individual cannot remove subordinates"); }
}

class Manager implements Employee {
  private subordinates: Employee[] = [];
  
  getSalary() {
    return this.baseSalary + this.subordinates.reduce((sum, emp) => sum + emp.getSalary(), 0);
  }
  
  addSubordinate(employee: Employee) {
    this.subordinates.push(employee);
  }
  
  removeSubordinate(employee: Employee) {
    const index = this.subordinates.indexOf(employee);
    if (index > -1) this.subordinates.splice(index, 1);
  }
}
```

## Decision Matrix

Use this decision matrix to choose between Template Method and Composite:

| Scenario | Template Method | Composite | Reasoning |
|----------|----------------|-----------|-----------|
| **Fixed algorithm with variable steps** | ✅ | ❌ | Template Method is designed for this |
| **Tree-like object structure** | ❌ | ✅ | Composite is designed for this |
| **Uniform treatment of objects** | ❌ | ✅ | Composite provides this naturally |
| **Algorithm orchestration** | ✅ | ❌ | Template Method excels at this |
| **Runtime structure changes** | ❌ | ✅ | Composite allows dynamic changes |
| **Inheritance-based behavior** | ✅ | ❌ | Template Method uses inheritance |
| **Composition-based behavior** | ❌ | ✅ | Composite uses composition |
| **Recursive operations** | ❌ | ✅ | Composite handles recursion naturally |

## Real-World Examples

### Template Method Examples
1. **Build Systems**: Maven, Gradle, Webpack
2. **Data Processing**: ETL pipelines, report generators
3. **Game Engines**: Unity, Unreal Engine game loops
4. **Web Frameworks**: Express.js middleware, Django request processing
5. **Database Operations**: ORM CRUD operations

### Composite Examples
1. **File Systems**: Windows Explorer, Unix file system
2. **UI Frameworks**: React components, DOM trees
3. **Menu Systems**: Application menus, navigation trees
4. **Organizational Charts**: Company hierarchies
5. **Graphics Systems**: SVG elements, drawing canvases

## Anti-Patterns and Pitfalls

### Template Method Anti-Patterns
- **Template Method Explosion**: Too many template methods in one class
- **Deep Inheritance**: Creating complex inheritance hierarchies
- **Rigid Structure**: Making templates too rigid to be useful
- **Hook Abuse**: Using too many hooks that make the flow unpredictable

### Composite Anti-Patterns
- **Type Checking**: Using instanceof or type checking instead of polymorphism
- **Leaf Operations**: Implementing add/remove in leaf classes
- **Complex Traversal**: Making traversal logic too complex
- **Memory Leaks**: Not properly managing child references

## Hybrid Approaches

Sometimes you might need both patterns together:

```typescript
// Template Method for algorithm + Composite for structure
abstract class ReportGenerator {
  public generateReport(): ReportResult {
    this.validate();
    this.process();
    this.format();
    this.output();
  }
  
  protected abstract process(): ReportResult;
  protected abstract format(): ReportResult;
  protected abstract output(): ReportResult;
}

class CompositeReportGenerator extends ReportGenerator {
  private components: ReportComponent[] = [];
  
  protected process(): ReportResult {
    // Use Composite pattern to process multiple components
    return this.components.reduce((result, component) => {
      return component.process(result);
    }, new ReportResult());
  }
  
  addComponent(component: ReportComponent) {
    this.components.push(component);
  }
}
```

## Performance Considerations

### Template Method
- **Pros**: Minimal overhead, direct method calls
- **Cons**: Inheritance coupling, less flexible
- **Best For**: Performance-critical algorithms with fixed structure

### Composite
- **Pros**: Highly flexible, dynamic structure
- **Cons**: Object creation overhead, potential memory usage
- **Best For**: Complex object hierarchies, dynamic structures

## Testing Considerations

### Template Method Testing
- Test each primitive operation independently
- Mock abstract methods to test template flow
- Test hook methods with different return values
- Verify algorithm structure is maintained

### Composite Testing
- Test leaf and composite implementations separately
- Test recursive operations with different tree depths
- Test edge cases (empty composite, single child)
- Verify uniform interface behavior

## Conclusion

Template Method and Composite patterns, while sharing some conceptual similarities, serve distinct purposes:

- **Template Method** is your choice when you have a **fixed algorithm structure** with **variable implementation steps**
- **Composite** is your choice when you have a **tree-like object structure** that needs **uniform treatment**

The key is understanding your specific requirements:
- Do you need to define an algorithm with consistent steps but variable implementations? → Template Method
- Do you need to treat individual objects and compositions uniformly? → Composite

Both patterns are powerful tools in the right context, and understanding their differences helps you make the right architectural decisions for your specific use case.

## Further Reading

- [Template Method Pattern Implementation](../20%20-%20Behavioral%20-%20Template%20Method/)
- [Composite Pattern Implementation](../8%20-%20Structural%20-%20Composite/)
- [Observer vs Bridge Pattern Comparison](./observer-vs-bridge-pattern-comparison.md)
- [Factory Method vs Abstract Factory Comparison](./factory-method-vs-abstract-factory.md) 