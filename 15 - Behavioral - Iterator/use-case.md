# Iterator Pattern Use Cases

## Overview

The Iterator pattern is fundamental for providing uniform access to different collection types while hiding their internal structure. It's essential for building flexible, maintainable systems that need to traverse various data structures without tight coupling to their implementations.

## Use Case 1: Database Result Set Iterator

### Problem
A database system needs to provide access to query results without loading all data into memory at once, especially for large result sets that could consume excessive memory.

### Solution
Implement a lazy iterator that fetches data on-demand, allowing the client to process results sequentially without knowing the database implementation details.

**Target Interface**: `ResultSetIterator` with `hasNext()`, `next()`, and `close()` methods  
**Key Features**: 
- Lazy loading with batch processing (configurable batch size)
- Database connection management and automatic cleanup
- Filtering iterator for conditional data access (e.g., department filtering)
- Memory-efficient large dataset handling (1000+ records)
- Reset functionality for re-iteration
- Error handling for connection and data access issues
- Simulated database with realistic employee data structure

**Demo**: `npm run iterator:database`

## Use Case 2: File System Traversal

### Problem
A file manager needs to traverse directories and files in different orders (breadth-first, depth-first, by size, by date) without exposing the file system's internal structure.

### Solution
Create different iterator implementations for various traversal strategies, allowing the same file system to be traversed in multiple ways.

**Target Interface**: `FileSystemIterator` with traversal strategy support  
**Key Features**: 
- Multiple traversal algorithms (depth-first, breadth-first, size-ordered, date-ordered)
- Hierarchical file system structure with nested directories
- File metadata tracking (size, modification date, hidden status)
- Path construction and display
- Reset functionality for re-traversal
- Realistic file system simulation with various file types and sizes
- Sorting capabilities for size and date-based iteration

**Demo**: `npm run iterator:filesystem`

## Use Case 3: Tree Structure Iterator

### Problem
A hierarchical data structure (like an organization chart or file tree) needs to be traversed in different orders (pre-order, post-order, level-order) for different processing needs.

### Solution
Implement specialized iterators for each traversal order, allowing the same tree to be processed in multiple ways without modifying the tree structure.

**Target Interface**: `TreeIterator` with different traversal strategies  
**Key Features**: 
- Three traversal strategies (pre-order, post-order, level-order)
- Generic tree implementation supporting any data type
- Organization chart example with employee hierarchy
- File system tree example demonstrating versatility
- Stack-based and queue-based traversal algorithms
- Reset functionality for multiple iterations
- Type-safe generic implementation

**Demo**: `npm run iterator:tree`

## Use Case 4: Stream Processing Iterator

### Problem
A data processing system needs to handle large data streams with different processing requirements (filtering, transformation, aggregation) without loading all data into memory.

### Solution
Create composable iterators that can be chained together for complex data processing pipelines.

**Target Interface**: `StreamIterator` with filtering and transformation capabilities  
**Key Features**: 
- Composable iterator pipeline (filter → transform → aggregate)
- Lazy evaluation for memory efficiency
- Real-time sensor data simulation (temperature, humidity, pressure, voltage)
- Filtering iterator for conditional data processing
- Transformation iterator for data conversion and alert generation
- Aggregation iterator for statistical analysis
- Complex pipeline composition (filter → transform)
- Error handling for stream processing failures
- Resource cleanup and stream closure

**Demo**: `npm run iterator:stream`

## Use Case 5: GUI Component Iterator

### Problem
A user interface framework needs to iterate over UI components for operations like validation, styling updates, or event handling, regardless of the component hierarchy structure.

### Solution
Implement iterators that can traverse UI component trees in different ways, providing uniform access to components regardless of their container type.

**Target Interface**: `ComponentIterator` with hierarchical traversal  
**Key Features**: 
- Four traversal strategies (depth-first, breadth-first, visible-only, enabled-only)
- Component hierarchy management with parent-child relationships
- Form validation with error collection and reporting
- Component state management (enable/disable, show/hide)
- Value collection from input components
- Bulk operations on component collections
- Realistic form structure with nested containers
- Component filtering based on visibility and enabled state
- Reset functionality for multiple operations

**Demo**: `npm run iterator:gui`

## Best Practices

- **Lazy Evaluation**: Load elements only when needed to conserve memory
- **Resource Management**: Ensure proper cleanup of resources (database connections, file handles)
- **Thread Safety**: Consider concurrent access when multiple iterators work simultaneously
- **Error Handling**: Provide graceful error handling for failed iterations
- **Performance Optimization**: Use appropriate data structures for the iteration pattern

## Anti-Patterns

- **Iterator Explosion**: Creating too many iterator types for simple collections
- **State Pollution**: Storing unnecessary state in iterators
- **Concurrent Modification**: Modifying collections while iterating without proper synchronization
- **Over-Engineering**: Using complex iterators when simple loops would suffice
- **Resource Leaks**: Not properly closing resources in iterators 