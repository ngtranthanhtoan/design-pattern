import { exit } from 'process';

// Notification types
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  category: 'system' | 'user' | 'security' | 'update';
}

// Iterator interface
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
  reset(): void;
}

// Aggregate interface
interface Aggregate<T> {
  createIterator(): Iterator<T>;
  getSize(): number;
}

// Notification Collection
class NotificationCollection implements Aggregate<Notification> {
  private notifications: Notification[] = [];

  addNotification(notification: Notification): void {
    this.notifications.push(notification);
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getSize(): number {
    return this.notifications.length;
  }

  createIterator(): Iterator<Notification> {
    return new NotificationIterator(this.notifications);
  }

  // Create specialized iterators
  createUnreadIterator(): Iterator<Notification> {
    return new UnreadNotificationIterator(this.notifications);
  }

  createPriorityIterator(priority: Notification['priority']): Iterator<Notification> {
    return new PriorityNotificationIterator(this.notifications, priority);
  }

  createTypeIterator(type: Notification['type']): Iterator<Notification> {
    return new TypeNotificationIterator(this.notifications, type);
  }

  createCategoryIterator(category: Notification['category']): Iterator<Notification> {
    return new CategoryNotificationIterator(this.notifications, category);
  }

  createTimeRangeIterator(startDate: Date, endDate: Date): Iterator<Notification> {
    return new TimeRangeNotificationIterator(this.notifications, startDate, endDate);
  }
}

// Base Notification Iterator
class NotificationIterator implements Iterator<Notification> {
  protected index: number = 0;
  protected notifications: Notification[];

  constructor(notifications: Notification[]) {
    this.notifications = [...notifications];
  }

  hasNext(): boolean {
    return this.index < this.notifications.length;
  }

  next(): Notification {
    if (this.hasNext()) {
      return this.notifications[this.index++];
    }
    throw new Error('No more notifications');
  }

  reset(): void {
    this.index = 0;
  }
}

// Unread Notification Iterator
class UnreadNotificationIterator extends NotificationIterator {
  constructor(notifications: Notification[]) {
    super(notifications.filter(n => !n.read));
  }
}

// Priority Notification Iterator
class PriorityNotificationIterator extends NotificationIterator {
  constructor(notifications: Notification[], priority: Notification['priority']) {
    super(notifications.filter(n => n.priority === priority));
  }
}

// Type Notification Iterator
class TypeNotificationIterator extends NotificationIterator {
  constructor(notifications: Notification[], type: Notification['type']) {
    super(notifications.filter(n => n.type === type));
  }
}

// Category Notification Iterator
class CategoryNotificationIterator extends NotificationIterator {
  constructor(notifications: Notification[], category: Notification['category']) {
    super(notifications.filter(n => n.category === category));
  }
}

// Time Range Notification Iterator
class TimeRangeNotificationIterator extends NotificationIterator {
  constructor(notifications: Notification[], startDate: Date, endDate: Date) {
    super(notifications.filter(n => 
      n.timestamp >= startDate && n.timestamp <= endDate
    ));
  }
}

// Notification Renderer
class NotificationRenderer {
  private collection: NotificationCollection;

  constructor(collection: NotificationCollection) {
    this.collection = collection;
  }

  // Render all notifications
  renderAll(): void {
    console.log('\n=== ALL NOTIFICATIONS ===');
    const iterator = this.collection.createIterator();
    this.renderWithIterator(iterator, 'All Notifications');
  }

  // Render unread notifications
  renderUnread(): void {
    console.log('\n=== UNREAD NOTIFICATIONS ===');
    const iterator = this.collection.createUnreadIterator();
    this.renderWithIterator(iterator, 'Unread Notifications');
  }

  // Render by priority
  renderByPriority(priority: Notification['priority']): void {
    console.log(`\n=== ${priority.toUpperCase()} PRIORITY NOTIFICATIONS ===`);
    const iterator = this.collection.createPriorityIterator(priority);
    this.renderWithIterator(iterator, `${priority} Priority Notifications`);
  }

  // Render by type
  renderByType(type: Notification['type']): void {
    console.log(`\n=== ${type.toUpperCase()} NOTIFICATIONS ===`);
    const iterator = this.collection.createTypeIterator(type);
    this.renderWithIterator(iterator, `${type} Notifications`);
  }

  // Render by category
  renderByCategory(category: Notification['category']): void {
    console.log(`\n=== ${category.toUpperCase()} NOTIFICATIONS ===`);
    const iterator = this.collection.createCategoryIterator(category);
    this.renderWithIterator(iterator, `${category} Notifications`);
  }

  // Render by time range
  renderByTimeRange(startDate: Date, endDate: Date): void {
    console.log(`\n=== NOTIFICATIONS FROM ${startDate.toLocaleDateString()} TO ${endDate.toLocaleDateString()} ===`);
    const iterator = this.collection.createTimeRangeIterator(startDate, endDate);
    this.renderWithIterator(iterator, 'Time Range Notifications');
  }

  // Render with custom formatting
  renderWithCustomFormat(format: 'compact' | 'detailed' | 'summary'): void {
    console.log(`\n=== ${format.toUpperCase()} FORMAT ===`);
    const iterator = this.collection.createIterator();
    
    switch (format) {
      case 'compact':
        this.renderCompact(iterator);
        break;
      case 'detailed':
        this.renderDetailed(iterator);
        break;
      case 'summary':
        this.renderSummary(iterator);
        break;
    }
  }

  private renderWithIterator(iterator: Iterator<Notification>, title: string): void {
    let count = 0;
    while (iterator.hasNext()) {
      const notification = iterator.next();
      this.renderNotification(notification);
      count++;
    }
    console.log(`\n📊 ${title}: ${count} items`);
  }

  private renderNotification(notification: Notification): void {
    const statusIcon = notification.read ? '✅' : '🔴';
    const priorityIcon = this.getPriorityIcon(notification.priority);
    
    // Different display styles based on notification type
    switch (notification.type) {
      case 'info':
        this.renderInfoNotification(notification, statusIcon, priorityIcon);
        break;
      case 'warning':
        this.renderWarningNotification(notification, statusIcon, priorityIcon);
        break;
      case 'error':
        this.renderErrorNotification(notification, statusIcon, priorityIcon);
        break;
      case 'success':
        this.renderSuccessNotification(notification, statusIcon, priorityIcon);
        break;
    }
  }

  private renderInfoNotification(notification: Notification, statusIcon: string, priorityIcon: string): void {
    console.log(`📋 ${statusIcon} ${priorityIcon} [${notification.id}] ${notification.title}`);
    console.log(`   ℹ️  ${notification.message}`);
    console.log(`   📅 ${notification.timestamp.toLocaleString()} | 🏷️ ${notification.category}`);
    console.log('');
  }

  private renderWarningNotification(notification: Notification, statusIcon: string, priorityIcon: string): void {
    console.log(`⚠️  ${statusIcon} ${priorityIcon} [${notification.id}] ${notification.title}`);
    console.log(`   ⚠️  ${notification.message}`);
    console.log(`   📅 ${notification.timestamp.toLocaleString()} | 🏷️ ${notification.category}`);
    console.log('');
  }

  private renderErrorNotification(notification: Notification, statusIcon: string, priorityIcon: string): void {
    console.log(`🚨 ${statusIcon} ${priorityIcon} [${notification.id}] ${notification.title}`);
    console.log(`   ❌ ${notification.message}`);
    console.log(`   📅 ${notification.timestamp.toLocaleString()} | 🏷️ ${notification.category}`);
    console.log('');
  }

  private renderSuccessNotification(notification: Notification, statusIcon: string, priorityIcon: string): void {
    console.log(`🎉 ${statusIcon} ${priorityIcon} [${notification.id}] ${notification.title}`);
    console.log(`   ✅ ${notification.message}`);
    console.log(`   📅 ${notification.timestamp.toLocaleString()} | 🏷️ ${notification.category}`);
    console.log('');
  }

  private renderCompact(iterator: Iterator<Notification>): void {
    let count = 0;
    while (iterator.hasNext()) {
      const notification = iterator.next();
      const statusIcon = notification.read ? '✅' : '🔴';
      const priorityIcon = this.getPriorityIcon(notification.priority);
      
      // Compact display with type-specific formatting
      switch (notification.type) {
        case 'info':
          console.log(`📋 ${statusIcon} ${priorityIcon} ${notification.title} (${notification.type})`);
          break;
        case 'warning':
          console.log(`⚠️  ${statusIcon} ${priorityIcon} ${notification.title} (${notification.type})`);
          break;
        case 'error':
          console.log(`🚨 ${statusIcon} ${priorityIcon} ${notification.title} (${notification.type})`);
          break;
        case 'success':
          console.log(`🎉 ${statusIcon} ${priorityIcon} ${notification.title} (${notification.type})`);
          break;
      }
      count++;
    }
    console.log(`\n📊 Compact view: ${count} items`);
  }

  private renderDetailed(iterator: Iterator<Notification>): void {
    let count = 0;
    while (iterator.hasNext()) {
      const notification = iterator.next();
      console.log(`\n🔔 NOTIFICATION #${++count}`);
      console.log(`ID: ${notification.id}`);
      console.log(`Type: ${notification.type.toUpperCase()}`);
      console.log(`Priority: ${notification.priority.toUpperCase()}`);
      console.log(`Category: ${notification.category.toUpperCase()}`);
      console.log(`Title: ${notification.title}`);
      console.log(`Message: ${notification.message}`);
      console.log(`Timestamp: ${notification.timestamp.toISOString()}`);
      console.log(`Read: ${notification.read ? 'Yes' : 'No'}`);
      console.log('─'.repeat(50));
    }
    console.log(`\n📊 Detailed view: ${count} items`);
  }

  private renderSummary(iterator: Iterator<Notification>): void {
    const stats = {
      total: 0,
      unread: 0,
      byType: { info: 0, warning: 0, error: 0, success: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      byCategory: { system: 0, user: 0, security: 0, update: 0 }
    };

    while (iterator.hasNext()) {
      const notification = iterator.next();
      stats.total++;
      if (!notification.read) stats.unread++;
      stats.byType[notification.type]++;
      stats.byPriority[notification.priority]++;
      stats.byCategory[notification.category]++;
    }

    console.log('📊 NOTIFICATION SUMMARY');
    console.log(`Total: ${stats.total} | Unread: ${stats.unread}`);
    console.log('\nBy Type:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${this.getTypeIcon(type as any)} ${type}: ${count}`);
    });
    console.log('\nBy Priority:');
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      console.log(`  ${this.getPriorityIcon(priority as any)} ${priority}: ${count}`);
    });
    console.log('\nBy Category:');
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(`  🏷️ ${category}: ${count}`);
    });
  }

  private getPriorityIcon(priority: Notification['priority']): string {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  private getTypeIcon(type: Notification['type']): string {
    switch (type) {
      case 'info': return '📋';
      case 'warning': return '⚠️';
      case 'error': return '🚨';
      case 'success': return '🎉';
      default: return '📢';
    }
  }
}

// Demo
console.log('=== NOTIFICATION SYSTEM ITERATOR DEMO ===\n');

// Create notification collection
const notificationCollection = new NotificationCollection();

// Add sample notifications
const notifications: Omit<Notification, 'id'>[] = [
  {
    type: 'info',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight at 2 AM',
    timestamp: new Date('2024-01-15T10:00:00'),
    priority: 'medium',
    read: false,
    category: 'system'
  },
  {
    type: 'warning',
    title: 'Storage Space Low',
    message: 'Your storage is 85% full. Consider cleaning up files.',
    timestamp: new Date('2024-01-15T11:30:00'),
    priority: 'high',
    read: false,
    category: 'system'
  },
  {
    type: 'error',
    title: 'Login Failed',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100',
    timestamp: new Date('2024-01-15T12:15:00'),
    priority: 'urgent',
    read: false,
    category: 'security'
  },
  {
    type: 'success',
    title: 'Backup Completed',
    message: 'Daily backup completed successfully. 2.5GB of data backed up.',
    timestamp: new Date('2024-01-15T13:00:00'),
    priority: 'low',
    read: true,
    category: 'system'
  },
  {
    type: 'info',
    title: 'New Message',
    message: 'You have received a new message from John Doe',
    timestamp: new Date('2024-01-15T14:20:00'),
    priority: 'medium',
    read: false,
    category: 'user'
  },
  {
    type: 'warning',
    title: 'Password Expiring',
    message: 'Your password will expire in 3 days. Please update it.',
    timestamp: new Date('2024-01-15T15:45:00'),
    priority: 'high',
    read: false,
    category: 'security'
  },
  {
    type: 'success',
    title: 'Update Available',
    message: 'Version 2.1.0 is now available for download',
    timestamp: new Date('2024-01-15T16:30:00'),
    priority: 'medium',
    read: true,
    category: 'update'
  },
  {
    type: 'error',
    title: 'Service Unavailable',
    message: 'Email service is temporarily unavailable. Retrying in 5 minutes.',
    timestamp: new Date('2024-01-15T17:00:00'),
    priority: 'urgent',
    read: false,
    category: 'system'
  }
];

// Add notifications to collection
notifications.forEach((notification, index) => {
  notificationCollection.addNotification({
    ...notification,
    id: `notif-${index + 1}`
  });
});

// Create renderer
const renderer = new NotificationRenderer(notificationCollection);

console.log(`📊 Total notifications: ${notificationCollection.getSize()}`);

// Demonstrate different rendering strategies
renderer.renderAll();
renderer.renderUnread();
renderer.renderByPriority('urgent');
renderer.renderByType('error');
renderer.renderByCategory('security');
renderer.renderByTimeRange(
  new Date('2024-01-15T12:00:00'),
  new Date('2024-01-15T16:00:00')
);

// Demonstrate different formats
renderer.renderWithCustomFormat('compact');
renderer.renderWithCustomFormat('detailed');
renderer.renderWithCustomFormat('summary');

console.log('\n✅ Notification system iterator demo completed successfully');

exit(0); 