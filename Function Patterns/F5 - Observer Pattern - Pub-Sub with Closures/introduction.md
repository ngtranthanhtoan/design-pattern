# Observer Pattern - Pub-Sub with Closures

## What is the Functional Observer Pattern?

The Observer pattern using pub-sub with closures replaces traditional subject-observer classes with functions that manage state through closures and provide event subscription/notification mechanisms. Instead of maintaining observer lists in classes, we use closures to encapsulate state and provide clean subscription APIs.

## Traditional vs Functional Approach

### Traditional OOP Observer Pattern
```typescript
interface Observer {
  update(data: any): void;
}

class Subject {
  private observers: Observer[] = [];
  
  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }
  
  unsubscribe(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  
  notify(data: any): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

class ConcreteObserver implements Observer {
  constructor(private name: string) {}
  
  update(data: any): void {
    console.log(`${this.name} received:`, data);
  }
}

// Usage
const subject = new Subject();
const observer1 = new ConcreteObserver("Observer1");
const observer2 = new ConcreteObserver("Observer2");

subject.subscribe(observer1);
subject.subscribe(observer2);
subject.notify("Hello World");
```

### Functional Pub-Sub with Closures
```typescript
type Listener<T> = (data: T) => void;
type Unsubscribe = () => void;

type EventEmitter<T> = {
  subscribe: (listener: Listener<T>) => Unsubscribe;
  emit: (data: T) => void;
  listenerCount: () => number;
};

const createEventEmitter = <T>(): EventEmitter<T> => {
  const listeners: Listener<T>[] = [];
  
  return {
    subscribe: (listener: Listener<T>): Unsubscribe => {
      listeners.push(listener);
      
      // Return unsubscribe function
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    
    emit: (data: T): void => {
      listeners.forEach(listener => listener(data));
    },
    
    listenerCount: (): number => listeners.length
  };
};

// Usage
const emitter = createEventEmitter<string>();

const unsubscribe1 = emitter.subscribe(data => 
  console.log("Listener 1:", data)
);

const unsubscribe2 = emitter.subscribe(data => 
  console.log("Listener 2:", data)
);

emitter.emit("Hello World");
unsubscribe1();
```

## Key Benefits

1. **Closure-based State**: Private state management without classes
2. **Functional Composition**: Easy to combine and extend event systems
3. **Automatic Cleanup**: Unsubscribe functions returned directly
4. **Type Safety**: Full TypeScript generics support
5. **Memory Efficient**: No object instances, just closures
6. **Immutable Events**: Event data can be made immutable
7. **Higher-Order Functions**: Easy event transformation and filtering

## Pattern Structure

### Core Components
1. **Event Emitter Factory**: Creates event emitters with closure state
2. **Subscription Functions**: Handle listener registration and cleanup
3. **Event Transformation**: Higher-order functions for event processing
4. **Multi-channel Support**: Named event channels and type safety
5. **Async Event Handling**: Promise-based and async event processing

### TypeScript Implementation
```typescript
// Basic event emitter type
type EventEmitter<T> = {
  subscribe: (listener: (data: T) => void) => (() => void);
  emit: (data: T) => void;
  once: (listener: (data: T) => void) => (() => void);
  clear: () => void;
};

// Multi-channel event bus type
type EventBus<Events extends Record<string, any>> = {
  on: <K extends keyof Events>(
    event: K, 
    listener: (data: Events[K]) => void
  ) => (() => void);
  emit: <K extends keyof Events>(event: K, data: Events[K]) => void;
  off: <K extends keyof Events>(event: K) => void;
};

// Async event emitter type
type AsyncEventEmitter<T> = {
  subscribe: (listener: (data: T) => Promise<void>) => (() => void);
  emit: (data: T) => Promise<void>;
  emitParallel: (data: T) => Promise<void>;
};

// Event transformation utilities
const mapEvents = <T, U>(
  emitter: EventEmitter<T>,
  transform: (data: T) => U
): EventEmitter<U> => {
  const mapped = createEventEmitter<U>();
  
  emitter.subscribe(data => {
    mapped.emit(transform(data));
  });
  
  return mapped;
};

const filterEvents = <T>(
  emitter: EventEmitter<T>,
  predicate: (data: T) => boolean
): EventEmitter<T> => {
  const filtered = createEventEmitter<T>();
  
  emitter.subscribe(data => {
    if (predicate(data)) {
      filtered.emit(data);
    }
  });
  
  return filtered;
};
```

## Common Use Cases

### 1. Application State Management
```typescript
type AppState = {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
};

const createStateManager = <T>(initialState: T) => {
  let state = initialState;
  const stateEmitter = createEventEmitter<T>();
  
  return {
    getState: (): T => state,
    
    setState: (newState: Partial<T>): void => {
      state = { ...state, ...newState };
      stateEmitter.emit(state);
    },
    
    subscribe: (listener: (state: T) => void) => {
      // Emit current state immediately
      listener(state);
      return stateEmitter.subscribe(listener);
    }
  };
};

const stateManager = createStateManager<AppState>({
  user: null,
  theme: 'light',
  notifications: []
});

// Subscribe to state changes
const unsubscribe = stateManager.subscribe(state => {
  console.log('State updated:', state);
});

// Update state
stateManager.setState({ theme: 'dark' });
```

### 2. Real-time Data Streams
```typescript
type DataPoint = {
  timestamp: number;
  value: number;
  source: string;
};

const createDataStream = () => {
  const dataEmitter = createEventEmitter<DataPoint>();
  let isRunning = false;
  
  const start = () => {
    if (isRunning) return;
    isRunning = true;
    
    const interval = setInterval(() => {
      dataEmitter.emit({
        timestamp: Date.now(),
        value: Math.random() * 100,
        source: 'sensor-1'
      });
    }, 1000);
    
    return () => {
      clearInterval(interval);
      isRunning = false;
    };
  };
  
  return {
    subscribe: dataEmitter.subscribe,
    start,
    listenerCount: dataEmitter.listenerCount
  };
};

const dataStream = createDataStream();

// Subscribe to data updates
const unsubscribe = dataStream.subscribe(data => {
  console.log('New data:', data);
});

// Start streaming
const stopStream = dataStream.start();
```

### 3. Event-Driven UI Components
```typescript
type ButtonEvents = {
  click: { x: number; y: number };
  hover: { isHovering: boolean };
  focus: { isFocused: boolean };
};

const createButton = () => {
  const eventBus = createEventBus<ButtonEvents>();
  
  const button = {
    onClick: (x: number, y: number) => {
      eventBus.emit('click', { x, y });
    },
    
    onHover: (isHovering: boolean) => {
      eventBus.emit('hover', { isHovering });
    },
    
    onFocus: (isFocused: boolean) => {
      eventBus.emit('focus', { isFocused });
    },
    
    // Event subscription methods
    onClickEvent: (handler: (data: { x: number; y: number }) => void) =>
      eventBus.on('click', handler),
      
    onHoverEvent: (handler: (data: { isHovering: boolean }) => void) =>
      eventBus.on('hover', handler),
      
    onFocusEvent: (handler: (data: { isFocused: boolean }) => void) =>
      eventBus.on('focus', handler)
  };
  
  return button;
};

const button = createButton();

// Subscribe to events
button.onClickEvent(({ x, y }) => {
  console.log(`Button clicked at (${x}, ${y})`);
});

button.onHoverEvent(({ isHovering }) => {
  console.log(`Button hover: ${isHovering}`);
});
```

### 4. Message Bus System
```typescript
type MessageBusEvents = {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string; reason: string };
  'order:created': { orderId: string; amount: number };
  'order:updated': { orderId: string; status: string };
  'notification:sent': { recipientId: string; type: string };
};

const createMessageBus = <Events extends Record<string, any>>() => {
  const channels = new Map<keyof Events, EventEmitter<any>>();
  
  const getChannel = <K extends keyof Events>(event: K): EventEmitter<Events[K]> => {
    if (!channels.has(event)) {
      channels.set(event, createEventEmitter<Events[K]>());
    }
    return channels.get(event)!;
  };
  
  return {
    publish: <K extends keyof Events>(event: K, data: Events[K]): void => {
      getChannel(event).emit(data);
    },
    
    subscribe: <K extends keyof Events>(
      event: K,
      handler: (data: Events[K]) => void
    ): (() => void) => {
      return getChannel(event).subscribe(handler);
    },
    
    once: <K extends keyof Events>(
      event: K,
      handler: (data: Events[K]) => void
    ): (() => void) => {
      return getChannel(event).once(handler);
    },
    
    clear: <K extends keyof Events>(event: K): void => {
      getChannel(event).clear();
    },
    
    listenerCount: <K extends keyof Events>(event: K): number => {
      return getChannel(event).listenerCount();
    }
  };
};

const messageBus = createMessageBus<MessageBusEvents>();

// Subscribe to user events
messageBus.subscribe('user:login', ({ userId, timestamp }) => {
  console.log(`User ${userId} logged in at ${timestamp}`);
});

// Subscribe to order events
messageBus.subscribe('order:created', ({ orderId, amount }) => {
  console.log(`Order ${orderId} created for $${amount}`);
});

// Publish events
messageBus.publish('user:login', {
  userId: 'user123',
  timestamp: Date.now()
});
```

### 5. HTTP Request/Response Events
```typescript
type HttpEvents = {
  'request:start': { id: string; url: string; method: string };
  'request:progress': { id: string; loaded: number; total: number };
  'request:complete': { id: string; status: number; data: any };
  'request:error': { id: string; error: Error };
};

const createHttpClient = () => {
  const eventBus = createEventBus<HttpEvents>();
  
  const request = async (url: string, options: RequestInit = {}) => {
    const id = Math.random().toString(36).substring(7);
    
    eventBus.emit('request:start', {
      id,
      url,
      method: options.method || 'GET'
    });
    
    try {
      // Simulate progress
      eventBus.emit('request:progress', {
        id,
        loaded: 0,
        total: 100
      });
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      eventBus.emit('request:complete', {
        id,
        status: response.status,
        data
      });
      
      return data;
    } catch (error) {
      eventBus.emit('request:error', {
        id,
        error: error as Error
      });
      throw error;
    }
  };
  
  return {
    request,
    on: eventBus.on,
    once: eventBus.once
  };
};

const httpClient = createHttpClient();

// Subscribe to HTTP events
httpClient.on('request:start', ({ id, url, method }) => {
  console.log(`Starting ${method} request to ${url} (ID: ${id})`);
});

httpClient.on('request:complete', ({ id, status, data }) => {
  console.log(`Request ${id} completed with status ${status}`);
});
```

## Advanced Patterns

### Event Composition and Transformation
```typescript
// Event mapping
const mapEvents = <T, U>(
  source: EventEmitter<T>,
  mapper: (data: T) => U
): EventEmitter<U> => {
  const mapped = createEventEmitter<U>();
  source.subscribe(data => mapped.emit(mapper(data)));
  return mapped;
};

// Event filtering
const filterEvents = <T>(
  source: EventEmitter<T>,
  predicate: (data: T) => boolean
): EventEmitter<T> => {
  const filtered = createEventEmitter<T>();
  source.subscribe(data => {
    if (predicate(data)) filtered.emit(data);
  });
  return filtered;
};

// Event merging
const mergeEvents = <T>(...sources: EventEmitter<T>[]): EventEmitter<T> => {
  const merged = createEventEmitter<T>();
  sources.forEach(source => {
    source.subscribe(data => merged.emit(data));
  });
  return merged;
};

// Event debouncing
const debounceEvents = <T>(
  source: EventEmitter<T>,
  delay: number
): EventEmitter<T> => {
  const debounced = createEventEmitter<T>();
  let timeoutId: NodeJS.Timeout;
  
  source.subscribe(data => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => debounced.emit(data), delay);
  });
  
  return debounced;
};

// Usage example
const sourceEmitter = createEventEmitter<number>();
const doubledEvents = mapEvents(sourceEmitter, x => x * 2);
const evenEvents = filterEvents(doubledEvents, x => x % 2 === 0);
const debouncedEvents = debounceEvents(evenEvents, 300);

debouncedEvents.subscribe(value => {
  console.log('Processed value:', value);
});
```

### Async Event Processing
```typescript
const createAsyncEventEmitter = <T>(): AsyncEventEmitter<T> => {
  const listeners: Array<(data: T) => Promise<void>> = [];
  
  return {
    subscribe: (listener: (data: T) => Promise<void>) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    
    // Sequential execution
    emit: async (data: T): Promise<void> => {
      for (const listener of listeners) {
        await listener(data);
      }
    },
    
    // Parallel execution
    emitParallel: async (data: T): Promise<void> => {
      await Promise.all(listeners.map(listener => listener(data)));
    }
  };
};

// Error handling in async events
const createSafeAsyncEmitter = <T>(): AsyncEventEmitter<T> => {
  const listeners: Array<(data: T) => Promise<void>> = [];
  
  return {
    subscribe: (listener: (data: T) => Promise<void>) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    
    emit: async (data: T): Promise<void> => {
      const results = await Promise.allSettled(
        listeners.map(listener => listener(data))
      );
      
      const errors = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected'
        )
        .map(result => result.reason);
        
      if (errors.length > 0) {
        console.error('Event listener errors:', errors);
      }
    },
    
    emitParallel: async (data: T): Promise<void> => {
      return this.emit(data);
    }
  };
};
```

### Event History and Replay
```typescript
const createReplayableEmitter = <T>(maxHistory: number = 100) => {
  const listeners: Array<(data: T) => void> = [];
  const history: T[] = [];
  
  return {
    subscribe: (listener: (data: T) => void, replayHistory = false) => {
      if (replayHistory) {
        history.forEach(data => listener(data));
      }
      
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    
    emit: (data: T): void => {
      // Add to history
      history.push(data);
      if (history.length > maxHistory) {
        history.shift();
      }
      
      // Emit to listeners
      listeners.forEach(listener => listener(data));
    },
    
    getHistory: (): readonly T[] => [...history],
    
    clearHistory: (): void => {
      history.length = 0;
    },
    
    replay: (listener: (data: T) => void): void => {
      history.forEach(data => listener(data));
    }
  };
};
```

## When to Use

### Choose Functional Pub-Sub When:
- You need event-driven architecture without classes
- Want clean subscription/unsubscription patterns
- Building reactive applications or components
- Need type-safe event handling
- Want composable event transformation
- Building real-time systems or data streams
- Need automatic memory management for listeners

### Avoid When:
- Simple synchronous communication is sufficient
- You need complex event hierarchies
- Performance is critical and function calls add overhead
- Team prefers traditional OOP observer patterns
- You need built-in event persistence or complex replay logic

## Performance Considerations

### Benefits:
- **No Class Overhead**: Just functions and closures
- **Efficient Subscriptions**: Direct function calls
- **Memory Efficient**: No object wrapper overhead
- **Garbage Collection Friendly**: Automatic cleanup with unsubscribe functions

### Considerations:
- **Closure Memory**: Each emitter maintains its own closure state
- **Function Call Overhead**: Multiple function calls per event
- **Event History**: Storing event history can use significant memory
- **Async Processing**: Promise chains can add latency

## Modern TypeScript Features

### Conditional Types for Events
```typescript
type EventPayload<T> = T extends (...args: any[]) => any 
  ? Parameters<T>[0] 
  : T;

type EventEmitterFor<T> = {
  subscribe: (listener: T extends (...args: any) => any ? T : (data: T) => void) => (() => void);
  emit: (data: EventPayload<T>) => void;
};
```

### Template Literal Event Names
```typescript
type EventNames<T extends string> = `${T}:${'start' | 'progress' | 'complete' | 'error'}`;

type HttpEventBus = {
  [K in EventNames<'request' | 'upload' | 'download'>]: any;
};
```

### Branded Event Types
```typescript
declare const __eventBrand: unique symbol;
type BrandedEvent<T, Brand extends string> = T & { [__eventBrand]: Brand };

type UserEvent = BrandedEvent<{ userId: string }, 'user'>;
type OrderEvent = BrandedEvent<{ orderId: string }, 'order'>;
```

## Testing Strategies

```typescript
describe('Event Emitter', () => {
  it('should notify all listeners', () => {
    const emitter = createEventEmitter<string>();
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    
    emitter.subscribe(listener1);
    emitter.subscribe(listener2);
    
    emitter.emit('test');
    
    expect(listener1).toHaveBeenCalledWith('test');
    expect(listener2).toHaveBeenCalledWith('test');
  });
  
  it('should unsubscribe correctly', () => {
    const emitter = createEventEmitter<string>();
    const listener = jest.fn();
    
    const unsubscribe = emitter.subscribe(listener);
    unsubscribe();
    
    emitter.emit('test');
    
    expect(listener).not.toHaveBeenCalled();
  });
});
```

## Conclusion

The functional Observer pattern using pub-sub with closures provides a clean, efficient alternative to traditional observer classes. It leverages JavaScript's closure mechanism to maintain private state while providing a clean, type-safe API for event handling.

Key advantages include automatic cleanup, function composition, type safety, and performance efficiency. This pattern is particularly well-suited for modern reactive applications, real-time systems, and event-driven architectures where clean separation of concerns and automatic resource management are important. 