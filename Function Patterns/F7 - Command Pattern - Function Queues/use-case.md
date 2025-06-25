# F7 - Command Pattern - Function Queues: Use Cases

## Primary Use Case: Undo/Redo System for Text Editor

### Problem Statement
Modern text editors need sophisticated undo/redo functionality that can handle complex editing operations like multi-cursor edits, find-and-replace operations, formatting changes, and collaborative editing scenarios. Traditional approaches using mutable state and imperative commands become complex to manage, debug, and extend when dealing with composite operations and branching undo histories.

### Solution Approach
Implement a functional command system using function queues where each editing operation is represented as a reversible command function. Commands capture their execution and undo logic in closures, enabling clean composition, batching, and history management. The system provides type-safe command execution, automatic history tracking, and efficient memory management for large editing sessions.

### Implementation Benefits
- **Immutable History**: Command history is append-only and cannot be corrupted
- **Composable Operations**: Complex edits can be built from simple command primitives
- **Type Safety**: TypeScript ensures command interfaces are correctly implemented
- **Memory Efficiency**: Commands only store necessary state in closures
- **Debugging**: Clear command history provides audit trail for complex operations

## Real-World Use Cases

### 1. **Database Migration System**
**Problem**: Execute and rollback database schema changes with dependency tracking
**Solution**: Command queue system for managing migration scripts with automatic rollback
```typescript
const createMigrationCommand = (
  migrationSql: string,
  rollbackSql: string,
  version: string
) => ({
  execute: () => db.execute(migrationSql),
  undo: () => db.execute(rollbackSql),
  description: `Migration ${version}`
});

const migrationQueue = createCommandQueue<void>();
migrationQueue.enqueue(createMigrationCommand(
  'CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(255))',
  'DROP TABLE users',
  '001_create_users'
));
```

### 2. **Background Job Processing System**
**Problem**: Manage background tasks with retry logic, priority queues, and error handling
**Solution**: Async command queues with scheduling, concurrency control, and monitoring
```typescript
const jobQueue = createAsyncCommandQueue<JobResult>();
const emailCommand = () => sendEmail(recipient, template, data);
const webhookCommand = () => callWebhook(url, payload);

jobQueue.enqueue(emailCommand);
jobQueue.enqueue(webhookCommand);
await jobQueue.executeConcurrent(5); // Max 5 concurrent jobs
```

### 3. **Event Sourcing and CQRS System**
**Problem**: Implement event sourcing with command/query separation for audit and replay
**Solution**: Command pattern with event store for capturing all state changes
```typescript
const eventStore = createEventSourcingSystem();

const userCreatedCommand = eventStore.createCommand(
  'USER_CREATED',
  (payload: { name: string; email: string }) => {
    users.create(payload);
  }
);

const command = userCreatedCommand({ name: 'John', email: 'john@example.com' });
command(); // Executes and stores event
```

### 4. **Workflow Orchestration Engine**
**Problem**: Manage complex business processes with conditional steps and error handling
**Solution**: Composable command system for workflow definition and execution
```typescript
const approvalWorkflow = composeCommands(
  () => validateRequest(request),
  () => notifyManager(request.managerId),
  () => waitForApproval(request.id),
  () => executeIfApproved(request),
  () => notifyRequester(request.userId)
);

const workflowQueue = createCommandQueue();
workflowQueue.enqueue(approvalWorkflow);
```

### 5. **Form Builder with Undo/Redo**
**Problem**: Build dynamic forms with complex validation and user action tracking
**Solution**: Command system for form field operations with full history support
```typescript
const formCommands = {
  addField: (fieldType: string, position: number) => 
    createUndoableCommand(
      () => form.insertField(fieldType, position),
      () => form.removeField(position),
      `Add ${fieldType} field at position ${position}`
    ),
  
  moveField: (from: number, to: number) =>
    createUndoableCommand(
      () => form.moveField(from, to),
      () => form.moveField(to, from),
      `Move field from ${from} to ${to}`
    )
};
```

### 6. **API Request Batching and Retry System**
**Problem**: Optimize API calls with intelligent batching, caching, and failure recovery
**Solution**: Command queues with automatic batching and exponential backoff retry
```typescript
const apiCommandQueue = createAsyncCommandQueue<ApiResponse>();

const createApiCommand = (
  endpoint: string,
  data: any,
  retries: number = 3
): AsyncCommand<ApiResponse> => async () => {
  let attempts = 0;
  while (attempts < retries) {
    try {
      return await api.call(endpoint, data);
    } catch (error) {
      attempts++;
      if (attempts >= retries) throw error;
      await delay(Math.pow(2, attempts) * 1000); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
};
```

## Implementation Patterns

### 1. **Command Composition and Batching**
```typescript
const batchCommands = (...commands: Command[]): Command => () => {
  const results = commands.map(cmd => cmd());
  return results;
};

const transactionalCommand = (commands: Command[]): Command => () => {
  const undoStack: (() => void)[] = [];
  try {
    commands.forEach((cmd, index) => {
      const result = cmd();
      // Store undo logic if command is reversible
      if (isReversible(cmd)) {
        undoStack.push(cmd.undo);
      }
    });
  } catch (error) {
    // Rollback all executed commands
    undoStack.reverse().forEach(undo => undo());
    throw error;
  }
};
```

### 2. **Priority Command Queues**
```typescript
type PriorityCommand<T> = {
  command: Command<T>;
  priority: number;
  timestamp: number;
};

const createPriorityQueue = <T>() => {
  const queue: PriorityCommand<T>[] = [];
  
  return {
    enqueue: (command: Command<T>, priority: number = 0) => {
      queue.push({ command, priority, timestamp: Date.now() });
      queue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
    },
    
    execute: (): T[] => {
      const results: T[] = [];
      while (queue.length > 0) {
        const { command } = queue.shift()!;
        results.push(command());
      }
      return results;
    }
  };
};
```

### 3. **Command Middleware and Decoration**
```typescript
const withLogging = <T>(command: Command<T>): Command<T> => () => {
  console.log('Executing command...');
  const result = command();
  console.log('Command completed');
  return result;
};

const withTiming = <T>(command: Command<T>): Command<T> => () => {
  const start = performance.now();
  const result = command();
  const duration = performance.now() - start;
  console.log(`Command took ${duration.toFixed(2)}ms`);
  return result;
};

const decoratedCommand = withTiming(withLogging(originalCommand));
```

### 4. **Command Persistence and Serialization**
```typescript
type SerializableCommand = {
  type: string;
  payload: any;
  timestamp: number;
};

const commandRegistry = new Map<string, (payload: any) => Command>();

const serializeCommand = (
  type: string,
  payload: any
): SerializableCommand => ({
  type,
  payload,
  timestamp: Date.now()
});

const deserializeCommand = (
  serialized: SerializableCommand
): Command => {
  const factory = commandRegistry.get(serialized.type);
  if (!factory) throw new Error(`Unknown command type: ${serialized.type}`);
  return factory(serialized.payload);
};
```

## Architecture Benefits

### **Separation of Concerns**
- Command definition separated from execution logic
- Undo logic encapsulated with forward operations
- Queue management separated from command implementation

### **Testability**
- Commands are pure functions that are easy to test
- Queue behavior can be tested independently
- Mock commands can be injected for testing

### **Scalability**
- Commands can be distributed across multiple workers
- Queue processing can be horizontally scaled
- Memory usage is predictable and controllable

### **Maintainability**
- New command types can be added without changing existing code
- Command composition enables complex operations from simple primitives
- Clear separation between command definition and execution

## Performance Considerations

### **Memory Management**
```typescript
const createBoundedCommandQueue = <T>(maxSize: number) => {
  const commands: Command<T>[] = [];
  
  return {
    enqueue: (command: Command<T>) => {
      if (commands.length >= maxSize) {
        commands.shift(); // Remove oldest command
      }
      commands.push(command);
    },
    
    size: () => commands.length,
    clear: () => commands.splice(0)
  };
};
```

### **Lazy Command Execution**
```typescript
const createLazyCommand = <T>(
  factory: () => Command<T>
): Command<T> => {
  let command: Command<T> | null = null;
  return () => {
    if (!command) command = factory();
    return command();
  };
};
```

### **Command Pooling**
```typescript
const createCommandPool = <T>(
  commandFactory: () => Command<T>,
  poolSize: number = 10
) => {
  const pool: Command<T>[] = [];
  
  for (let i = 0; i < poolSize; i++) {
    pool.push(commandFactory());
  }
  
  return {
    acquire: (): Command<T> => pool.pop() || commandFactory(),
    release: (command: Command<T>) => {
      if (pool.length < poolSize) pool.push(command);
    }
  };
};
```

This use case demonstrates how the Command Pattern with Function Queues provides a robust, scalable solution for managing complex operations while maintaining functional programming principles of immutability, composability, and type safety. 