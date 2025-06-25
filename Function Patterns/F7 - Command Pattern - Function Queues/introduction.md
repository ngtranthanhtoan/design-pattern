# Command Pattern - Function Queues

## What is the Command Pattern in Functional Programming?

The Command Pattern with Function Queues encapsulates operations as first-class functions that can be stored, queued, executed, undone, and composed. Unlike traditional OOP command patterns that rely on classes and interfaces, functional command patterns use pure functions, closures, and higher-order functions to create flexible, composable command systems.

## Core Principles

### 1. **Functions as Commands**
Commands are represented as functions that can be stored and executed later:
```typescript
type Command<T = void> = () => T;
type AsyncCommand<T = void> = () => Promise<T>;

const saveDocumentCommand: Command = () => {
  console.log('Document saved');
};
```

### 2. **Command Queues**
Commands are stored in queues and processed sequentially or in parallel:
```typescript
type CommandQueue<T = void> = {
  enqueue: (command: Command<T>) => void;
  execute: () => T[];
  executeAsync: () => Promise<T[]>;
  clear: () => void;
  size: () => number;
};
```

### 3. **Reversible Commands**
Commands can include undo functionality through closure:
```typescript
type ReversibleCommand = {
  execute: () => void;
  undo: () => void;
  description: string;
};

const createUndoableCommand = (
  action: () => void,
  undoAction: () => void,
  description: string
): ReversibleCommand => ({
  execute: action,
  undo: undoAction,
  description
});
```

### 4. **Command Composition**
Commands can be composed and combined into complex operations:
```typescript
const composeCommands = (...commands: Command[]): Command => 
  () => commands.forEach(cmd => cmd());

const batchCommand = composeCommands(
  saveDocumentCommand,
  validateDocumentCommand,
  notifyUsersCommand
);
```

## Traditional OOP vs Functional Command

### Traditional OOP Command
```typescript
interface ICommand {
  execute(): void;
  undo(): void;
}

class SaveDocumentCommand implements ICommand {
  constructor(private document: Document) {}
  
  execute(): void {
    this.document.save();
  }
  
  undo(): void {
    this.document.revert();
  }
}

class CommandInvoker {
  private commands: ICommand[] = [];
  
  addCommand(command: ICommand): void {
    this.commands.push(command);
  }
  
  executeAll(): void {
    this.commands.forEach(cmd => cmd.execute());
  }
}
```

### Functional Command with Queues
```typescript
type Command<T = void> = () => T;
type UndoableCommand<T = void> = {
  execute: () => T;
  undo: () => void;
  description: string;
};

const createCommandQueue = <T = void>() => {
  const commands: Command<T>[] = [];
  
  return {
    enqueue: (command: Command<T>) => commands.push(command),
    execute: (): T[] => commands.map(cmd => cmd()),
    clear: () => commands.splice(0),
    size: () => commands.length
  };
};

const createUndoStack = () => {
  const history: UndoableCommand[] = [];
  
  return {
    execute: (command: UndoableCommand) => {
      const result = command.execute();
      history.push(command);
      return result;
    },
    undo: () => {
      const command = history.pop();
      return command ? command.undo() : undefined;
    },
    canUndo: () => history.length > 0,
    getHistory: () => [...history]
  };
};
```

## Advanced Functional Command Patterns

### 1. **Async Command Queues**
```typescript
type AsyncCommand<T = void> = () => Promise<T>;

const createAsyncCommandQueue = <T>() => {
  const commands: AsyncCommand<T>[] = [];
  
  return {
    enqueue: (command: AsyncCommand<T>) => commands.push(command),
    executeSequential: async (): Promise<T[]> => {
      const results: T[] = [];
      for (const command of commands) {
        results.push(await command());
      }
      return results;
    },
    executeParallel: (): Promise<T[]> => 
      Promise.all(commands.map(cmd => cmd())),
    executeConcurrent: async (limit: number): Promise<T[]> => {
      const results: T[] = [];
      for (let i = 0; i < commands.length; i += limit) {
        const batch = commands.slice(i, i + limit);
        const batchResults = await Promise.all(batch.map(cmd => cmd()));
        results.push(...batchResults);
      }
      return results;
    }
  };
};
```

### 2. **Command Middleware Pipeline**
```typescript
type CommandMiddleware<T> = (
  command: Command<T>,
  next: () => T
) => T;

const createCommandPipeline = <T>(...middlewares: CommandMiddleware<T>[]) =>
  (command: Command<T>): Command<T> => () => {
    let index = -1;
    
    const dispatch = (i: number): T => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      
      const middleware = middlewares[i];
      if (!middleware) return command();
      
      return middleware(command, () => dispatch(i + 1));
    };
    
    return dispatch(0);
  };

// Middleware examples
const loggingMiddleware: CommandMiddleware<any> = (command, next) => {
  console.log('Executing command...');
  const result = next();
  console.log('Command completed');
  return result;
};

const timingMiddleware: CommandMiddleware<any> = (command, next) => {
  const start = Date.now();
  const result = next();
  console.log(`Command took ${Date.now() - start}ms`);
  return result;
};
```

### 3. **Event Sourcing with Commands**
```typescript
type Event = {
  type: string;
  payload: any;
  timestamp: number;
  id: string;
};

type EventStore = {
  append: (event: Event) => void;
  getEvents: (fromId?: string) => Event[];
  replay: (handlers: Record<string, (payload: any) => void>) => void;
};

const createEventSourcingSystem = () => {
  const events: Event[] = [];
  
  const createEvent = (type: string, payload: any): Event => ({
    type,
    payload,
    timestamp: Date.now(),
    id: crypto.randomUUID()
  });
  
  return {
    createCommand: <T>(
      type: string,
      action: (payload: T) => void
    ) => (payload: T): Command => () => {
      const event = createEvent(type, payload);
      events.push(event);
      action(payload);
    },
    
    getEvents: () => [...events],
    
    replay: (handlers: Record<string, (payload: any) => void>) => {
      events.forEach(event => {
        const handler = handlers[event.type];
        if (handler) handler(event.payload);
      });
    }
  };
};
```

### 4. **Command Scheduling and Retry Logic**
```typescript
type ScheduledCommand<T> = {
  command: AsyncCommand<T>;
  delay: number;
  retries: number;
  retryDelay: number;
};

const createCommandScheduler = () => {
  const scheduled: Array<{
    command: ScheduledCommand<any>;
    timeoutId: NodeJS.Timeout;
  }> = [];
  
  return {
    schedule: <T>(scheduledCommand: ScheduledCommand<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        const executeWithRetry = async (attemptsLeft: number): Promise<T> => {
          try {
            return await scheduledCommand.command();
          } catch (error) {
            if (attemptsLeft > 0) {
              await new Promise(res => setTimeout(res, scheduledCommand.retryDelay));
              return executeWithRetry(attemptsLeft - 1);
            }
            throw error;
          }
        };
        
        const timeoutId = setTimeout(async () => {
          try {
            const result = await executeWithRetry(scheduledCommand.retries);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, scheduledCommand.delay);
        
        scheduled.push({ command: scheduledCommand, timeoutId });
      });
    },
    
    cancelAll: () => {
      scheduled.forEach(({ timeoutId }) => clearTimeout(timeoutId));
      scheduled.splice(0);
    }
  };
};
```

## Benefits of Functional Commands

### ✅ **Advantages**

1. **Simplicity**: Functions are simpler than classes and interfaces
2. **Composability**: Commands can be easily combined and nested
3. **Immutability**: Command state is captured in closures
4. **Type Safety**: Full TypeScript support with generic types
5. **Functional Composition**: Works naturally with pipe and compose operations
6. **Memory Efficiency**: No class instantiation overhead

### ⚠️ **Considerations**

1. **Closure Memory**: Commands may capture large contexts in closures
2. **Debugging**: Stack traces may be less clear with deeply nested functions
3. **Learning Curve**: Requires understanding of functional concepts
4. **Serialization**: Functions cannot be serialized for persistence

## When to Use Functional Commands

### ✅ **Good Use Cases**

- **Undo/Redo Systems**: Text editors, graphic design tools, form builders
- **Batch Operations**: Database migrations, data processing pipelines
- **Event Sourcing**: Audit logs, state reconstruction, time travel debugging
- **Workflow Orchestration**: Multi-step business processes, approval workflows
- **Queue Processing**: Background jobs, message processing, task scheduling
- **Macro Recording**: User action replay, automated testing, tutorials

### ❌ **Avoid When**

- **Simple CRUD Operations**: Basic create/read/update/delete operations
- **Performance Critical**: When function call overhead matters
- **Persistence Required**: When commands need to be stored permanently
- **Complex State**: When command state is too complex for closures

## Integration with Other Patterns

### **With Observer Pattern (F5)**
```typescript
const commandWithEvents = (command: Command, eventBus: EventBus) => () => {
  eventBus.emit('commandStart', { command });
  const result = command();
  eventBus.emit('commandComplete', { command, result });
  return result;
};
```

### **With Maybe Pattern (F1)**
```typescript
const safeCommand = <T>(command: Command<T>): Command<Maybe<T>> => () => {
  try {
    return some(command());
  } catch (error) {
    console.error('Command failed:', error);
    return none();
  }
};
```

### **With Factory Pattern (F3)**
```typescript
const createCommandFactory = <T>(
  actionFactory: (params: any) => () => T
) => (params: any): Command<T> => actionFactory(params);

const apiCommandFactory = createCommandFactory((url: string) => 
  () => fetch(url).then(r => r.json())
);
```

## Modern TypeScript Features

### **Generic Command Types**
```typescript
type Command<TResult = void, TError = Error> = () => TResult | never;
type AsyncCommand<TResult = void, TError = Error> = () => Promise<TResult>;
type SafeCommand<TResult = void> = () => Either<Error, TResult>;
```

### **Template Literal Types for Command Names**
```typescript
type CommandType = 'user' | 'order' | 'product';
type Action = 'create' | 'update' | 'delete';
type CommandName = `${CommandType}_${Action}`;

type TypedCommand<T extends CommandName> = {
  type: T;
  execute: () => void;
};
```

### **Conditional Types for Command Results**
```typescript
type CommandResult<T> = T extends AsyncCommand<infer R> 
  ? Promise<R>
  : T extends Command<infer R>
  ? R
  : never;
```

## Performance Considerations

### **Function Pool Pattern**
```typescript
const createCommandPool = <T>(
  factory: () => Command<T>,
  maxSize: number = 100
) => {
  const pool: Command<T>[] = [];
  
  return {
    acquire: (): Command<T> => pool.pop() || factory(),
    release: (command: Command<T>) => {
      if (pool.length < maxSize) pool.push(command);
    }
  };
};
```

### **Lazy Command Evaluation**
```typescript
const lazyCommand = <T>(factory: () => Command<T>): Command<T> => {
  let command: Command<T> | null = null;
  return () => {
    if (!command) command = factory();
    return command();
  };
};
```

## Real-World Applications

1. **Text Editor Undo/Redo**: Capturing user edits as reversible commands
2. **Database Migrations**: Ordered, reversible schema changes
3. **Workflow Automation**: Business process steps as composable commands
4. **Event Sourcing Systems**: Domain events as command sequences
5. **Background Job Queues**: Deferred task execution with retry logic
6. **Macro Systems**: Recording and replaying user interactions

## Related Patterns

- **F5 - Observer Pattern**: For command event notification
- **F1 - Maybe Pattern**: For safe command execution
- **F3 - Factory Pattern**: For creating command instances
- **F8 - Monad Pattern**: For command result composition

The Command Pattern with Function Queues provides a powerful, functional approach to encapsulating operations, enabling features like undo/redo, batch processing, and event sourcing while maintaining immutability and type safety. 