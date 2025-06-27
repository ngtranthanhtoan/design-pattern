# Memento Pattern

## What is the Pattern?

The Memento pattern provides the ability to restore an object to its previous state (undo via rollback). It captures and externalizes an object's internal state so that the object can be restored to this state later, without violating encapsulation.

## Key Participants

| Participant | Description |
|-------------|-------------|
| **Originator** | Creates a memento containing a snapshot of its current internal state. Uses the memento to restore its internal state. |
| **Memento** | Stores the internal state of the Originator. The memento may store as much or as little of the originator's internal state as necessary at its originator's discretion. |
| **Caretaker** | Is responsible for the memento's safekeeping. Never operates on or examines the contents of a memento. |

## Key Characteristics

- **Encapsulation Preservation**: The internal state is encapsulated within the memento, preventing direct access
- **State Restoration**: Provides a way to restore objects to previous states
- **Undo/Redo Support**: Enables undo and redo functionality in applications
- **History Management**: Maintains a history of object states
- **Memory Efficient**: Can implement selective state saving to optimize memory usage

## How it Works

1. The **Originator** creates a **Memento** containing a snapshot of its current state
2. The **Caretaker** stores the memento in a history stack
3. When undo is requested, the **Caretaker** retrieves the most recent memento
4. The **Originator** uses the memento to restore its previous state
5. The process can be repeated for multiple undo levels

## Structure

```
┌─────────────────┐    creates    ┌─────────────────┐
│   Originator    │──────────────▶│     Memento     │
│                 │               │                 │
│ - state         │               │ - state         │
│ + createMemento()│               │ + getState()    │
│ + restore()     │               │                 │
└─────────────────┘               └─────────────────┘
         │                                   ▲
         │ restores                          │
         ▼                                   │
┌─────────────────┐    stores     ┌─────────────────┐
│    Caretaker    │──────────────▶│   MementoStack  │
│                 │               │                 │
│ - mementos      │               │ - history       │
│ + save()        │               │ + push()        │
│ + undo()        │               │ + pop()         │
│ + redo()        │               │ + clear()       │
└─────────────────┘               └─────────────────┘
```

## Benefits

✅ **Encapsulation**: Preserves encapsulation boundaries while allowing state restoration  
✅ **Undo/Redo**: Provides clean undo and redo functionality  
✅ **State History**: Maintains a complete history of object states  
✅ **Flexibility**: Can save partial or complete state as needed  
✅ **Memory Management**: Can implement selective state saving strategies  
✅ **Separation of Concerns**: Separates state management from business logic  

## Drawbacks

❌ **Memory Usage**: Can consume significant memory with large state histories  
❌ **Performance Overhead**: State serialization/deserialization can be expensive  
❌ **Complexity**: Adds complexity to the codebase  
❌ **State Synchronization**: Can be challenging to keep mementos synchronized  
❌ **Deep Copy Issues**: Complex object graphs may require deep copying  

## When to Use / Avoid

### Use When:
- You need to implement undo/redo functionality
- You want to save and restore object states
- You need to maintain a history of object changes
- You want to implement checkpoints in applications
- You need to implement transaction rollback mechanisms

### Avoid When:
- The object state is simple and doesn't change frequently
- Memory usage is a critical concern
- The state contains sensitive information that shouldn't be stored
- The object's state is too large to efficiently store
- You only need simple undo (single level)

## Real-World Examples

- **Text Editors**: Undo/redo functionality for text changes
- **Graphics Applications**: History of drawing operations
- **Database Transactions**: Rollback mechanisms
- **Game Save Systems**: Saving and loading game states
- **Configuration Management**: Reverting configuration changes

## Common Implementation Variations

### 1. Command-based Memento
```typescript
class Command {
  execute() { /* perform action */ }
  undo() { /* restore previous state */ }
}
```

### 2. Snapshot-based Memento
```typescript
class Memento {
  private state: any;
  constructor(state: any) { this.state = state; }
  getState() { return this.state; }
}
```

### 3. Incremental Memento
```typescript
class IncrementalMemento {
  private changes: Change[];
  addChange(change: Change) { this.changes.push(change); }
  applyChanges() { /* apply all changes */ }
}
```

## Related Patterns

- **Command**: Often used together to implement undo/redo
- **State**: Can use memento to restore previous states
- **Prototype**: Can be used to create deep copies for mementos
- **Observer**: Can notify observers when state is restored

## Implementation Highlights

- **Immutable Mementos**: Mementos should be immutable to prevent state corruption
- **Selective State Saving**: Only save necessary state to optimize memory usage
- **Memento Lifecycle**: Implement proper cleanup of old mementos
- **Thread Safety**: Consider thread safety for concurrent access

## Sequence Diagram

```
Originator    Caretaker    Memento
     │            │           │
     │ save()     │           │
     │───────────▶│           │
     │            │           │
     │ createMemento()        │
     │───────────────────────▶│
     │            │           │
     │◀───────────────────────│
     │            │           │
     │◀───────────│           │
     │            │           │
     │ undo()     │           │
     │───────────▶│           │
     │            │           │
     │◀───────────│           │
     │            │           │
     │ restore()  │           │
     │───────────────────────▶│
     │            │           │
     │◀───────────────────────│
```

## Pitfalls & Anti-Patterns

- **God Memento**: Storing too much state in a single memento
- **Mutable Mementos**: Allowing mementos to be modified after creation
- **Memory Leaks**: Not cleaning up old mementos
- **Deep Copy Overhead**: Unnecessarily copying large object graphs
- **State Synchronization**: Failing to keep mementos synchronized with originator

## Testing Tips

- Test undo/redo functionality with various state changes
- Verify memento immutability
- Test memory usage with large state histories
- Validate state restoration accuracy
- Test concurrent access scenarios

## Performance Notes

- Use shallow copying when possible to reduce overhead
- Implement memento limits to prevent memory issues
- Consider lazy loading for large state objects
- Profile memory usage with realistic data sizes
- Use object pooling for frequently created mementos 