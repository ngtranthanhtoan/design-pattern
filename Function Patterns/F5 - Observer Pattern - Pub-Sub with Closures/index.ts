/**
 * Observer Pattern - Pub-Sub with Closures
 * 
 * Demonstrates event-driven programming using closures instead of 
 * traditional subject-observer class hierarchies.
 */

import { exit } from "process";

// Core types for pub-sub system
type Listener<T> = (data: T) => void;
type Unsubscribe = () => void;

type EventEmitter<T> = {
  subscribe: (listener: Listener<T>) => Unsubscribe;
  emit: (data: T) => void;
  once: (listener: Listener<T>) => Unsubscribe;
  clear: () => void;
  listenerCount: () => number;
};

// Basic event emitter factory
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
    
    once: (listener: Listener<T>): Unsubscribe => {
      const unsubscribe = () => {
        const index = listeners.indexOf(wrappedListener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
      
      const wrappedListener = (data: T) => {
        listener(data);
        unsubscribe();
      };
      
      listeners.push(wrappedListener);
      return unsubscribe;
    },
    
    clear: (): void => {
      listeners.length = 0;
    },
    
    listenerCount: (): number => listeners.length
  };
};

// Multi-channel event bus
type EventBus<Events extends Record<string, any>> = {
  on: <K extends keyof Events>(
    event: K, 
    listener: (data: Events[K]) => void
  ) => Unsubscribe;
  emit: <K extends keyof Events>(event: K, data: Events[K]) => void;
  once: <K extends keyof Events>(
    event: K, 
    listener: (data: Events[K]) => void
  ) => Unsubscribe;
  off: <K extends keyof Events>(event: K) => void;
  listenerCount: <K extends keyof Events>(event: K) => number;
};

const createEventBus = <Events extends Record<string, any>>(): EventBus<Events> => {
  const channels = new Map<keyof Events, EventEmitter<any>>();
  
  const getChannel = <K extends keyof Events>(event: K): EventEmitter<Events[K]> => {
    if (!channels.has(event)) {
      channels.set(event, createEventEmitter<Events[K]>());
    }
    return channels.get(event)!;
  };
  
  return {
    on: <K extends keyof Events>(
      event: K,
      listener: (data: Events[K]) => void
    ): Unsubscribe => {
      return getChannel(event).subscribe(listener);
    },
    
    emit: <K extends keyof Events>(event: K, data: Events[K]): void => {
      getChannel(event).emit(data);
    },
    
    once: <K extends keyof Events>(
      event: K,
      listener: (data: Events[K]) => void
    ): Unsubscribe => {
      return getChannel(event).once(listener);
    },
    
    off: <K extends keyof Events>(event: K): void => {
      getChannel(event).clear();
    },
    
    listenerCount: <K extends keyof Events>(event: K): number => {
      return getChannel(event).listenerCount();
    }
  };
};

// Example 1: Simple notification system
type NotificationEvents = {
  info: { message: string; timestamp: number };
  warning: { message: string; level: 'low' | 'medium' | 'high' };
  error: { message: string; code: number; stack?: string };
};

// Example 2: User activity tracking
type UserActivityEvents = {
  login: { userId: string; timestamp: number; ip: string };
  logout: { userId: string; duration: number };
  action: { userId: string; action: string; data: any };
};

// Example 3: Shopping cart events
type ShoppingCartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartEvents = {
  itemAdded: { item: ShoppingCartItem; total: number };
  itemRemoved: { itemId: string; total: number };
  checkout: { items: ShoppingCartItem[]; total: number };
  cleared: { timestamp: number };
};

// Advanced: Event emitter with history
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
    clearHistory: (): void => { history.length = 0; },
    listenerCount: (): number => listeners.length
  };
};

// Event transformation utilities
const mapEvents = <T, U>(
  source: EventEmitter<T>,
  mapper: (data: T) => U
): EventEmitter<U> => {
  const mapped = createEventEmitter<U>();
  source.subscribe(data => mapped.emit(mapper(data)));
  return mapped;
};

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

// Demonstration functions
function demonstrateBasicEventEmitter(): void {
  console.log("📻 BASIC EVENT EMITTER");
  console.log("=" + "=".repeat(24));
  
  const emitter = createEventEmitter<string>();
  
  // Subscribe multiple listeners
  const unsubscribe1 = emitter.subscribe(data => {
    console.log(`  Listener 1 received: ${data}`);
  });
  
  const unsubscribe2 = emitter.subscribe(data => {
    console.log(`  Listener 2 received: ${data}`);
  });
  
  console.log(`Current listeners: ${emitter.listenerCount()}`);
  
  // Emit events
  console.log("\nEmitting 'Hello World':");
  emitter.emit("Hello World");
  
  console.log("\nEmitting 'Second message':");
  emitter.emit("Second message");
  
  // Unsubscribe one listener
  unsubscribe1();
  console.log(`\nAfter unsubscribing listener 1: ${emitter.listenerCount()} listeners`);
  
  console.log("Emitting 'Third message':");
  emitter.emit("Third message");
  
  // Clean up
  unsubscribe2();
  console.log();
}

function demonstrateEventBus(): void {
  console.log("🚌 MULTI-CHANNEL EVENT BUS");
  console.log("=" + "=".repeat(29));
  
  const notificationBus = createEventBus<NotificationEvents>();
  
  // Subscribe to different event types
  const unsubscribeInfo = notificationBus.on('info', ({ message, timestamp }) => {
    console.log(`  ℹ️ INFO: ${message} (at ${new Date(timestamp).toISOString()})`);
  });
  
  const unsubscribeWarning = notificationBus.on('warning', ({ message, level }) => {
    console.log(`  ⚠️ WARNING [${level.toUpperCase()}]: ${message}`);
  });
  
  const unsubscribeError = notificationBus.on('error', ({ message, code }) => {
    console.log(`  ❌ ERROR ${code}: ${message}`);
  });
  
  // Emit different types of events
  console.log("Broadcasting notifications:");
  
  notificationBus.emit('info', {
    message: 'Application started successfully',
    timestamp: Date.now()
  });
  
  notificationBus.emit('warning', {
    message: 'High memory usage detected',
    level: 'medium'
  });
  
  notificationBus.emit('error', {
    message: 'Database connection failed',
    code: 500
  });
  
  // Show listener counts
  console.log(`\nListener counts:`);
  console.log(`  Info: ${notificationBus.listenerCount('info')}`);
  console.log(`  Warning: ${notificationBus.listenerCount('warning')}`);
  console.log(`  Error: ${notificationBus.listenerCount('error')}`);
  
  // Clean up
  unsubscribeInfo();
  unsubscribeWarning();
  unsubscribeError();
  console.log();
}

function demonstrateUserActivityTracking(): void {
  console.log("👤 USER ACTIVITY TRACKING");
  console.log("=" + "=".repeat(28));
  
  const activityBus = createEventBus<UserActivityEvents>();
  
  // Subscribe to user events
  const unsubscribeLogin = activityBus.on('login', ({ userId, timestamp, ip }) => {
    console.log(`  🔑 User ${userId} logged in from ${ip} at ${new Date(timestamp).toLocaleTimeString()}`);
  });
  
  const unsubscribeLogout = activityBus.on('logout', ({ userId, duration }) => {
    const minutes = Math.round(duration / 60000);
    console.log(`  🚪 User ${userId} logged out (session: ${minutes} minutes)`);
  });
  
  const unsubscribeAction = activityBus.on('action', ({ userId, action, data }) => {
    console.log(`  📝 User ${userId} performed: ${action}`, data);
  });
  
  // Simulate user activity
  console.log("Simulating user activity:");
  
  const loginTime = Date.now();
  activityBus.emit('login', {
    userId: 'user123',
    timestamp: loginTime,
    ip: '192.168.1.100'
  });
  
  activityBus.emit('action', {
    userId: 'user123',
    action: 'view_profile',
    data: { profileId: 'user123' }
  });
  
  activityBus.emit('action', {
    userId: 'user123',
    action: 'edit_profile',
    data: { field: 'name', newValue: 'John Doe' }
  });
  
  activityBus.emit('logout', {
    userId: 'user123',
    duration: Date.now() - loginTime
  });
  
  // Clean up
  unsubscribeLogin();
  unsubscribeLogout();
  unsubscribeAction();
  console.log();
}

function demonstrateShoppingCart(): void {
  console.log("🛒 SHOPPING CART EVENTS");
  console.log("=" + "=".repeat(26));
  
  const cartBus = createEventBus<CartEvents>();
  
  // Subscribe to cart events
  const unsubscribeAdded = cartBus.on('itemAdded', ({ item, total }) => {
    console.log(`  ➕ Added ${item.name} (x${item.quantity}) - Total: $${total.toFixed(2)}`);
  });
  
  const unsubscribeRemoved = cartBus.on('itemRemoved', ({ itemId, total }) => {
    console.log(`  ➖ Removed item ${itemId} - Total: $${total.toFixed(2)}`);
  });
  
  const unsubscribeCheckout = cartBus.on('checkout', ({ items, total }) => {
    console.log(`  💳 Checkout: ${items.length} items, Total: $${total.toFixed(2)}`);
  });
  
  const unsubscribeCleared = cartBus.on('cleared', ({ timestamp }) => {
    console.log(`  🗑️ Cart cleared at ${new Date(timestamp).toLocaleTimeString()}`);
  });
  
  // Simulate shopping cart usage
  console.log("Simulating shopping cart usage:");
  
  cartBus.emit('itemAdded', {
    item: { id: '1', name: 'Laptop', price: 999.99, quantity: 1 },
    total: 999.99
  });
  
  cartBus.emit('itemAdded', {
    item: { id: '2', name: 'Mouse', price: 29.99, quantity: 2 },
    total: 1059.97
  });
  
  cartBus.emit('itemRemoved', {
    itemId: '2',
    total: 999.99
  });
  
  cartBus.emit('checkout', {
    items: [{ id: '1', name: 'Laptop', price: 999.99, quantity: 1 }],
    total: 999.99
  });
  
  cartBus.emit('cleared', {
    timestamp: Date.now()
  });
  
  // Clean up
  unsubscribeAdded();
  unsubscribeRemoved();
  unsubscribeCheckout();
  unsubscribeCleared();
  console.log();
}

function demonstrateOnceListeners(): void {
  console.log("🔂 ONCE LISTENERS");
  console.log("=" + "=".repeat(18));
  
  const emitter = createEventEmitter<string>();
  
  // Regular listener
  const unsubscribeRegular = emitter.subscribe(data => {
    console.log(`  Regular listener: ${data}`);
  });
  
  // Once listener
  emitter.once(data => {
    console.log(`  Once listener: ${data}`);
  });
  
  console.log(`Initial listeners: ${emitter.listenerCount()}`);
  
  console.log("\nFirst emit:");
  emitter.emit("First message");
  console.log(`Listeners after first emit: ${emitter.listenerCount()}`);
  
  console.log("\nSecond emit:");
  emitter.emit("Second message");
  console.log(`Listeners after second emit: ${emitter.listenerCount()}`);
  
  // Clean up
  unsubscribeRegular();
  console.log();
}

function demonstrateEventTransformation(): void {
  console.log("🔄 EVENT TRANSFORMATION");
  console.log("=" + "=".repeat(26));
  
  const sourceEmitter = createEventEmitter<number>();
  
  // Transform events
  const doubledEvents = mapEvents(sourceEmitter, x => x * 2);
  const evenEvents = filterEvents(doubledEvents, x => x % 2 === 0);
  const debouncedEvents = debounceEvents(evenEvents, 100);
  
  // Subscribe to transformed events
  doubledEvents.subscribe(value => {
    console.log(`  Doubled: ${value}`);
  });
  
  evenEvents.subscribe(value => {
    console.log(`  Even: ${value}`);
  });
  
  debouncedEvents.subscribe(value => {
    console.log(`  Debounced: ${value}`);
  });
  
  console.log("Emitting numbers 1 through 5:");
  
  for (let i = 1; i <= 5; i++) {
    sourceEmitter.emit(i);
  }
  
  // Wait for debounced events
  setTimeout(() => {
    console.log("(Debounced events will appear after delay)");
  }, 150);
  
  console.log();
}

function demonstrateReplayableEvents(): void {
  console.log("📼 REPLAYABLE EVENTS");
  console.log("=" + "=".repeat(22));
  
  const replayEmitter = createReplayableEmitter<string>(5);
  
  // Emit some events before subscribing
  console.log("Emitting events before subscription:");
  replayEmitter.emit("Event 1");
  replayEmitter.emit("Event 2");
  replayEmitter.emit("Event 3");
  
  console.log(`History length: ${replayEmitter.getHistory().length}`);
  
  // Subscribe with replay
  console.log("\nSubscribing with replay enabled:");
  const unsubscribe = replayEmitter.subscribe(data => {
    console.log(`  Received: ${data}`);
  }, true); // replay = true
  
  // Emit new events
  console.log("\nEmitting new events:");
  replayEmitter.emit("Event 4");
  replayEmitter.emit("Event 5");
  
  // Clean up
  unsubscribe();
  console.log();
}

function showPerformanceComparison(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("=" + "=".repeat(26));
  
  const emitter = createEventEmitter<number>();
  const listeners = Array.from({ length: 1000 }, (_, i) => (data: number) => {
    // Simulate lightweight processing
    return data + i;
  });
  
  // Subscribe all listeners
  const unsubscribers = listeners.map(listener => emitter.subscribe(listener));
  
  const iterations = 10000;
  console.log(`Emitting ${iterations} events to ${listeners.length} listeners...`);
  
  const startTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    emitter.emit(i);
  }
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  const eventsPerSecond = Math.round((iterations / duration) * 1000);
  const notificationsPerSecond = Math.round((iterations * listeners.length / duration) * 1000);
  
  console.log(`✨ Completed ${iterations} events in ${duration}ms`);
  console.log(`📊 Performance: ~${eventsPerSecond} events/second`);
  console.log(`📢 Total notifications: ~${notificationsPerSecond} notifications/second`);
  console.log(`🏃‍♂️ Average: ${(duration / iterations).toFixed(4)}ms per event`);
  console.log();
  
  console.log("Key Performance Benefits:");
  console.log("• Direct function calls without object overhead");
  console.log("• Efficient closure-based state management");
  console.log("• Minimal memory allocation per subscription");
  console.log("• No class instantiation or inheritance overhead");
  
  // Clean up
  unsubscribers.forEach(unsub => unsub());
  console.log();
}

function showUsageExamples(): void {
  console.log("💡 PRACTICAL USAGE EXAMPLES");
  console.log("=" + "=".repeat(30));
  
  console.log("1. Basic event emitter:");
  console.log(`   const emitter = createEventEmitter<string>();`);
  console.log(`   const unsubscribe = emitter.subscribe(data => console.log(data));`);
  console.log();
  
  console.log("2. Multi-channel event bus:");
  console.log(`   const bus = createEventBus<Events>();`);
  console.log(`   bus.on('userLogin', ({ userId }) => track(userId));`);
  console.log();
  
  console.log("3. Event transformation:");
  console.log(`   const filtered = filterEvents(source, data => data.priority > 5);`);
  console.log(`   const debounced = debounceEvents(filtered, 1000);`);
  console.log();
  
  console.log("4. One-time listeners:");
  console.log(`   emitter.once(data => console.log('First time only:', data));`);
  console.log();
  
  console.log("5. Event history replay:");
  console.log(`   const replay = createReplayableEmitter(100);`);
  console.log(`   replay.subscribe(handler, true); // replay history`);
  console.log();
}

// Main execution
function main(): void {
  console.log("📻 OBSERVER PATTERN - PUB-SUB WITH CLOSURES");
  console.log("=" + "=".repeat(45));
  console.log();
  console.log("This pattern uses closures for event-driven programming,");
  console.log("providing automatic cleanup and type-safe event handling.");
  console.log();
  
  demonstrateBasicEventEmitter();
  demonstrateEventBus();
  demonstrateUserActivityTracking();
  demonstrateShoppingCart();
  demonstrateOnceListeners();
  demonstrateEventTransformation();
  demonstrateReplayableEvents();
  showPerformanceComparison();
  showUsageExamples();
  
  console.log("🚀 COMPREHENSIVE EXAMPLE");
  console.log("=" + "=".repeat(23));
  console.log("Run the real-time chat system:");
  console.log("npm run functional:observer:chat");
  console.log();
  console.log("Key Benefits:");
  console.log("• Closure-based state management without classes");
  console.log("• Automatic memory cleanup with unsubscribe functions");
  console.log("• Type-safe multi-channel event handling");
  console.log("• Composable event transformation and filtering");
  console.log("• High performance with minimal overhead");
}

// Run the demonstration
main();
exit(0); 