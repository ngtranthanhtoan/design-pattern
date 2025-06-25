// ============================================================================
// EVENT BUS - Pub/Sub Pattern for Decoupled Communication
// ============================================================================

import { exit } from "process";

type CustomEventListener<T = any> = (data: T) => void;

interface EventSubscription {
  id: string;
  eventName: string;
  listener: CustomEventListener;
  once: boolean;
  subscribed: number;
}

class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventSubscription[]> = new Map();
  private eventHistory: Array<{ event: string; data: any; timestamp: number }> = [];
  private maxHistorySize: number = 100;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T = any>(eventName: string, listener: CustomEventListener<T>): string {
    return this.addListener(eventName, listener, false);
  }

  public subscribeOnce<T = any>(eventName: string, listener: CustomEventListener<T>): string {
    return this.addListener(eventName, listener, true);
  }

  private addListener<T = any>(eventName: string, listener: CustomEventListener<T>, once: boolean): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventName,
      listener,
      once,
      subscribed: Date.now()
    };

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    this.listeners.get(eventName)!.push(subscription);
    return subscriptionId;
  }

  public unsubscribe(subscriptionId: string): boolean {
    for (const [eventName, subscriptions] of this.listeners.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.listeners.delete(eventName);
        }
        return true;
      }
    }
    return false;
  }

  public emit<T = any>(eventName: string, data?: T): number {
    const subscriptions = this.listeners.get(eventName);
    if (!subscriptions) {
      return 0;
    }

    // Add to event history
    this.eventHistory.push({
      event: eventName,
      data,
      timestamp: Date.now()
    });

    // Maintain history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    let notifiedCount = 0;
    const toRemove: string[] = [];

    for (const subscription of subscriptions) {
      try {
        subscription.listener(data);
        notifiedCount++;

        if (subscription.once) {
          toRemove.push(subscription.id);
        }
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    }

    // Remove 'once' listeners
    toRemove.forEach(id => this.unsubscribe(id));

    return notifiedCount;
  }

  public getSubscriptionCount(eventName?: string): number {
    if (eventName) {
      return this.listeners.get(eventName)?.length || 0;
    }

    let total = 0;
    for (const subscriptions of this.listeners.values()) {
      total += subscriptions.length;
    }
    return total;
  }

  public getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  public getEventHistory(eventName?: string, limit?: number): Array<{ event: string; data: any; timestamp: number }> {
    let history = this.eventHistory;
    
    if (eventName) {
      history = history.filter(entry => entry.event === eventName);
    }

    if (limit && limit > 0) {
      history = history.slice(-limit);
    }

    return [...history]; // Return a copy
  }

  public clear(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
      this.eventHistory = [];
    }
  }

  public getStats(): {
    totalEvents: number;
    totalSubscriptions: number;
    eventTypes: number;
    historySize: number;
  } {
    return {
      totalEvents: this.eventHistory.length,
      totalSubscriptions: this.getSubscriptionCount(),
      eventTypes: this.listeners.size,
      historySize: this.eventHistory.length
    };
  }

  // For testing purposes only
  public static resetInstance(): void {
    if (EventBus.instance) {
      EventBus.instance.clear();
    }
    EventBus.instance = null as any;
  }
}

// Usage Example
function demonstrateEventBus(): void {
  console.log('=== EVENT BUS DEMO ===');
  
  const eventBus = EventBus.getInstance();
  
  // Subscribe to different events
  const userSub = eventBus.subscribe('user:login', (data: { userId: string, timestamp: number }) => {
    console.log(`User ${data.userId} logged in at ${new Date(data.timestamp).toISOString()}`);
  });

  const orderSub = eventBus.subscribe('order:created', (data: { orderId: string, amount: number }) => {
    console.log(`Order ${data.orderId} created for $${data.amount}`);
  });

  // Subscribe once to a system event
  eventBus.subscribeOnce('system:startup', (data: { version: string }) => {
    console.log(`System started with version ${data.version}`);
  });

  // Emit events
  eventBus.emit('user:login', { userId: 'user123', timestamp: Date.now() });
  eventBus.emit('order:created', { orderId: 'ord456', amount: 99.99 });
  eventBus.emit('system:startup', { version: '1.0.0' });
  eventBus.emit('system:startup', { version: '1.0.1' }); // Won't trigger - was 'once'

  console.log('Event stats:', eventBus.getStats());
  console.log('User login subscriptions:', eventBus.getSubscriptionCount('user:login'));
  console.log('System startup subscriptions:', eventBus.getSubscriptionCount('system:startup'));

  // Verify same instance
  const anotherEventBus = EventBus.getInstance();
  console.log('Same EventBus instance?', eventBus === anotherEventBus);
  console.log();
}

// Testing Example
function testEventBus(): void {
  console.log('=== EVENT BUS TESTS ===');
  
  // Test 1: Subscription and emission
  EventBus.resetInstance();
  const bus1 = EventBus.getInstance();
  let receivedData: any = null;
  
  bus1.subscribe('test:event', (data) => {
    receivedData = data;
  });
  
  const notified = bus1.emit('test:event', { test: 'data' });
  console.log('Test 1 - Event emitted and received?', notified === 1 && receivedData?.test === 'data');
  
  // Test 2: Once subscription
  let onceCount = 0;
  bus1.subscribeOnce('test:once', () => {
    onceCount++;
  });
  
  bus1.emit('test:once');
  bus1.emit('test:once');
  console.log('Test 2 - Once subscription worked?', onceCount === 1);
  
  // Test 3: Unsubscription
  const subId = bus1.subscribe('test:unsub', () => {});
  console.log('Test 3a - Subscription count before unsub:', bus1.getSubscriptionCount('test:unsub'));
  const unsubbed = bus1.unsubscribe(subId);
  console.log('Test 3b - Unsubscription successful?', unsubbed && bus1.getSubscriptionCount('test:unsub') === 0);
  
  // Test 4: Event history
  bus1.emit('test:history', { value: 1 });
  bus1.emit('test:history', { value: 2 });
  const history = bus1.getEventHistory('test:history');
  console.log('Test 4 - Event history tracked?', history.length === 2);
  console.log();
}

// Run demonstrations
demonstrateEventBus();
testEventBus();

export { EventBus, CustomEventListener, EventSubscription };
exit(0); 