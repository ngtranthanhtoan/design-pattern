import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface NotificationMessage {
  id: string;
  title: string;
  content: string;
  recipient: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  metadata?: Record<string, any>;
}

interface SendResult {
  success: boolean;
  messageId: string;
  deliveryTime: number;
  status: 'sent' | 'failed' | 'pending' | 'delivered';
  errorMessage?: string;
  retryCount: number;
  cost: number;
}

interface NotificationStrategy {
  send(message: NotificationMessage): SendResult;
  getDeliveryTime(): number;
  getSuccessRate(): number;
  getDescription(): string;
  getSupportedFeatures(): string[];
  getCostPerMessage(): number;
  isAvailable(): boolean;
  getMaxMessageLength(): number;
}

// ============================================================================
// CONCRETE STRATEGIES
// ============================================================================

class EmailStrategy implements NotificationStrategy {
  private readonly deliveryTime = 5000; // 5 seconds
  private readonly successRate = 0.95; // 95%
  private readonly costPerMessage = 0.001; // $0.001 per email
  private readonly maxLength = 10000; // 10KB

  send(message: NotificationMessage): SendResult {
    const startTime = Date.now();
    
    // Simulate email sending
    const success = Math.random() < this.successRate;
    const deliveryTime = this.deliveryTime + Math.random() * 2000; // Add some variance
    
    // Simulate processing delay
    while (Date.now() - startTime < deliveryTime) {
      // Simulate email processing
    }

    if (!success) {
      return {
        success: false,
        messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deliveryTime,
        status: 'failed',
        errorMessage: 'Email delivery failed - recipient not found',
        retryCount: 0,
        cost: this.costPerMessage
      };
    }

    return {
      success: true,
      messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deliveryTime,
      status: 'delivered',
      retryCount: 0,
      cost: this.costPerMessage
    };
  }

  getDeliveryTime(): number {
    return this.deliveryTime;
  }

  getSuccessRate(): number {
    return this.successRate;
  }

  getDescription(): string {
    return "Email - Traditional email delivery";
  }

  getSupportedFeatures(): string[] {
    return ['Rich text', 'Attachments', 'HTML formatting', 'Bulk sending', 'Templates'];
  }

  getCostPerMessage(): number {
    return this.costPerMessage;
  }

  isAvailable(): boolean {
    return true;
  }

  getMaxMessageLength(): number {
    return this.maxLength;
  }
}

class SmsStrategy implements NotificationStrategy {
  private readonly deliveryTime = 2000; // 2 seconds
  private readonly successRate = 0.98; // 98%
  private readonly costPerMessage = 0.05; // $0.05 per SMS
  private readonly maxLength = 160; // 160 characters

  send(message: NotificationMessage): SendResult {
    const startTime = Date.now();
    
    // Check message length
    if (message.content.length > this.maxLength) {
      return {
        success: false,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deliveryTime: 0,
        status: 'failed',
        errorMessage: `Message too long (${message.content.length} chars, max ${this.maxLength})`,
        retryCount: 0,
        cost: 0
      };
    }

    // Simulate SMS sending
    const success = Math.random() < this.successRate;
    const deliveryTime = this.deliveryTime + Math.random() * 1000;
    
    // Simulate processing delay
    while (Date.now() - startTime < deliveryTime) {
      // Simulate SMS processing
    }

    if (!success) {
      return {
        success: false,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deliveryTime,
        status: 'failed',
        errorMessage: 'SMS delivery failed - invalid phone number',
        retryCount: 0,
        cost: this.costPerMessage
      };
    }

    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deliveryTime,
      status: 'delivered',
      retryCount: 0,
      cost: this.costPerMessage
    };
  }

  getDeliveryTime(): number {
    return this.deliveryTime;
  }

  getSuccessRate(): number {
    return this.successRate;
  }

  getDescription(): string {
    return "SMS - Text message delivery";
  }

  getSupportedFeatures(): string[] {
    return ['Quick delivery', 'High reliability', 'Global reach', 'Two-way messaging'];
  }

  getCostPerMessage(): number {
    return this.costPerMessage;
  }

  isAvailable(): boolean {
    return true;
  }

  getMaxMessageLength(): number {
    return this.maxLength;
  }
}

class PushNotificationStrategy implements NotificationStrategy {
  private readonly deliveryTime = 1000; // 1 second
  private readonly successRate = 0.92; // 92%
  private readonly costPerMessage = 0.0001; // $0.0001 per push
  private readonly maxLength = 256; // 256 characters

  send(message: NotificationMessage): SendResult {
    const startTime = Date.now();
    
    // Check if device is online
    const deviceOnline = Math.random() > 0.1; // 90% chance device is online
    
    if (!deviceOnline) {
      return {
        success: false,
        messageId: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deliveryTime: 0,
        status: 'pending',
        errorMessage: 'Device offline - notification queued',
        retryCount: 0,
        cost: 0
      };
    }

    // Simulate push notification sending
    const success = Math.random() < this.successRate;
    const deliveryTime = this.deliveryTime + Math.random() * 500;
    
    // Simulate processing delay
    while (Date.now() - startTime < deliveryTime) {
      // Simulate push processing
    }

    if (!success) {
      return {
        success: false,
        messageId: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deliveryTime,
        status: 'failed',
        errorMessage: 'Push notification failed - app not installed',
        retryCount: 0,
        cost: this.costPerMessage
      };
    }

    return {
      success: true,
      messageId: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deliveryTime,
      status: 'delivered',
      retryCount: 0,
      cost: this.costPerMessage
    };
  }

  getDeliveryTime(): number {
    return this.deliveryTime;
  }

  getSuccessRate(): number {
    return this.successRate;
  }

  getDescription(): string {
    return "Push Notification - Mobile app notifications";
  }

  getSupportedFeatures(): string[] {
    return ['Instant delivery', 'Rich media', 'Interactive buttons', 'Silent notifications'];
  }

  getCostPerMessage(): number {
    return this.costPerMessage;
  }

  isAvailable(): boolean {
    return true;
  }

  getMaxMessageLength(): number {
    return this.maxLength;
  }
}

class SlackStrategy implements NotificationStrategy {
  private readonly deliveryTime = 3000; // 3 seconds
  private readonly successRate = 0.99; // 99%
  private readonly costPerMessage = 0.0005; // $0.0005 per message
  private readonly maxLength = 4000; // 4000 characters

  send(message: NotificationMessage): SendResult {
    const startTime = Date.now();
    
    // Simulate Slack message sending
    const success = Math.random() < this.successRate;
    const deliveryTime = this.deliveryTime + Math.random() * 1500;
    
    // Simulate processing delay
    while (Date.now() - startTime < deliveryTime) {
      // Simulate Slack API processing
    }

    if (!success) {
      return {
        success: false,
        messageId: `slack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deliveryTime,
        status: 'failed',
        errorMessage: 'Slack delivery failed - channel not found',
        retryCount: 0,
        cost: this.costPerMessage
      };
    }

    return {
      success: true,
      messageId: `slack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deliveryTime,
      status: 'delivered',
      retryCount: 0,
      cost: this.costPerMessage
    };
  }

  getDeliveryTime(): number {
    return this.deliveryTime;
  }

  getSuccessRate(): number {
    return this.successRate;
  }

  getDescription(): string {
    return "Slack - Team collaboration platform";
  }

  getSupportedFeatures(): string[] {
    return ['Team channels', 'Threads', 'File sharing', 'Emoji reactions', 'Mentions'];
  }

  getCostPerMessage(): number {
    return this.costPerMessage;
  }

  isAvailable(): boolean {
    return true;
  }

  getMaxMessageLength(): number {
    return this.maxLength;
  }
}

class DiscordStrategy implements NotificationStrategy {
  private readonly deliveryTime = 2500; // 2.5 seconds
  private readonly successRate = 0.97; // 97%
  private readonly costPerMessage = 0.0003; // $0.0003 per message
  private readonly maxLength = 2000; // 2000 characters

  send(message: NotificationMessage): SendResult {
    const startTime = Date.now();
    
    // Simulate Discord message sending
    const success = Math.random() < this.successRate;
    const deliveryTime = this.deliveryTime + Math.random() * 1200;
    
    // Simulate processing delay
    while (Date.now() - startTime < deliveryTime) {
      // Simulate Discord API processing
    }

    if (!success) {
      return {
        success: false,
        messageId: `discord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deliveryTime,
        status: 'failed',
        errorMessage: 'Discord delivery failed - server unavailable',
        retryCount: 0,
        cost: this.costPerMessage
      };
    }

    return {
      success: true,
      messageId: `discord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deliveryTime,
      status: 'delivered',
      retryCount: 0,
      cost: this.costPerMessage
    };
  }

  getDeliveryTime(): number {
    return this.deliveryTime;
  }

  getSuccessRate(): number {
    return this.successRate;
  }

  getDescription(): string {
    return "Discord - Gaming and community platform";
  }

  getSupportedFeatures(): string[] {
    return ['Voice channels', 'Server management', 'Bot integration', 'Role-based access'];
  }

  getCostPerMessage(): number {
    return this.costPerMessage;
  }

  isAvailable(): boolean {
    return true;
  }

  getMaxMessageLength(): number {
    return this.maxLength;
  }
}

// ============================================================================
// CONTEXT CLASS
// ============================================================================

class NotificationContext {
  private strategy: NotificationStrategy;

  constructor(strategy: NotificationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: NotificationStrategy): void {
    this.strategy = strategy;
  }

  send(message: NotificationMessage): SendResult {
    console.log(`Sending notification using: ${this.strategy.getDescription()}`);
    console.log(`Delivery time: ${this.strategy.getDeliveryTime()}ms`);
    console.log(`Success rate: ${(this.strategy.getSuccessRate() * 100).toFixed(1)}%`);
    console.log(`Cost per message: $${this.strategy.getCostPerMessage().toFixed(4)}`);
    console.log(`Max message length: ${this.strategy.getMaxMessageLength()} characters`);
    console.log(`Features: ${this.strategy.getSupportedFeatures().join(', ')}`);
    console.log(`Available: ${this.strategy.isAvailable() ? "Yes" : "No"}`);
    console.log(`Message: "${message.title}" to ${message.recipient}`);
    console.log(`Priority: ${message.priority}`);
    
    const result = this.strategy.send(message);
    
    console.log(`Result: ${result.success ? "SUCCESS" : "FAILED"}`);
    console.log(`Status: ${result.status}`);
    console.log(`Delivery time: ${result.deliveryTime.toFixed(0)}ms`);
    console.log(`Cost: $${result.cost.toFixed(4)}`);
    if (result.errorMessage) {
      console.log(`Error: ${result.errorMessage}`);
    }
    console.log("---");

    return result;
  }

  getCurrentStrategy(): NotificationStrategy {
    return this.strategy;
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

function demonstrateNotificationStrategies(): void {
  console.log("=== NOTIFICATION SYSTEM STRATEGY DEMO ===\n");

  const context = new NotificationContext(new EmailStrategy());

  // Test different notification methods
  const scenarios = [
    {
      name: "Email Notification",
      strategy: new EmailStrategy(),
      message: {
        id: 'msg_1',
        title: 'Welcome to our platform!',
        content: 'Thank you for joining us. We\'re excited to have you on board.',
        recipient: 'user@example.com',
        priority: 'medium' as const,
        category: 'welcome'
      }
    },
    {
      name: "SMS Notification",
      strategy: new SmsStrategy(),
      message: {
        id: 'msg_2',
        title: 'Security Alert',
        content: 'Your account has been accessed from a new device. Reply Y to confirm.',
        recipient: '+1234567890',
        priority: 'high' as const,
        category: 'security'
      }
    },
    {
      name: "Push Notification",
      strategy: new PushNotificationStrategy(),
      message: {
        id: 'msg_3',
        title: 'New Message',
        content: 'You have a new message from John Doe',
        recipient: 'device_token_123',
        priority: 'medium' as const,
        category: 'social'
      }
    },
    {
      name: "Slack Notification",
      strategy: new SlackStrategy(),
      message: {
        id: 'msg_4',
        title: 'Deployment Complete',
        content: 'Production deployment v2.1.0 has been completed successfully.',
        recipient: '#deployments',
        priority: 'low' as const,
        category: 'system'
      }
    },
    {
      name: "Discord Notification",
      strategy: new DiscordStrategy(),
      message: {
        id: 'msg_5',
        title: 'Server Maintenance',
        content: 'Scheduled maintenance will begin in 30 minutes. Expected downtime: 2 hours.',
        recipient: '#announcements',
        priority: 'high' as const,
        category: 'maintenance'
      }
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`Test ${index + 1}: ${scenario.name}`);
    context.setStrategy(scenario.strategy);
    context.send(scenario.message);
    console.log("");
  });
}

function demonstrateStrategyComparison(): void {
  console.log("=== NOTIFICATION STRATEGY COMPARISON ===\n");

  const strategies = [
    new EmailStrategy(),
    new SmsStrategy(),
    new PushNotificationStrategy(),
    new SlackStrategy(),
    new DiscordStrategy()
  ];

  console.log("Notification Strategy Comparison:");
  console.log("Strategy\t\t\tDelivery\tSuccess\tCost\t\tMax Length");
  console.log("--------\t\t\t--------\t-------\t----\t\t----------");

  strategies.forEach(strategy => {
    const shortName = strategy.getDescription().split(' - ')[0];
    const delivery = `${strategy.getDeliveryTime()}ms`;
    const success = `${(strategy.getSuccessRate() * 100).toFixed(0)}%`;
    const cost = `$${strategy.getCostPerMessage().toFixed(4)}`;
    const maxLength = strategy.getMaxMessageLength();
    
    console.log(`${shortName.padEnd(20)}\t${delivery}\t\t${success}\t\t${cost}\t\t${maxLength}`);
  });
}

function demonstrateDynamicSelection(): void {
  console.log("=== DYNAMIC STRATEGY SELECTION ===\n");

  const context = new NotificationContext(new EmailStrategy());

  const scenarios = [
    {
      name: "User registration confirmation",
      message: {
        id: 'reg_1',
        title: 'Welcome!',
        content: 'Thank you for registering. Please verify your email address.',
        recipient: 'newuser@example.com',
        priority: 'medium' as const,
        category: 'registration'
      },
      recommendedStrategy: "EmailStrategy",
      reason: "Detailed confirmation with verification link"
    },
    {
      name: "Two-factor authentication code",
      message: {
        id: '2fa_1',
        title: 'Security Code',
        content: 'Your verification code is: 123456',
        recipient: '+1234567890',
        priority: 'high' as const,
        category: 'security'
      },
      recommendedStrategy: "SmsStrategy",
      reason: "Quick delivery for time-sensitive security codes"
    },
    {
      name: "App update notification",
      message: {
        id: 'app_1',
        title: 'Update Available',
        content: 'A new version of the app is available with bug fixes and improvements.',
        recipient: 'device_token_456',
        priority: 'low' as const,
        category: 'app'
      },
      recommendedStrategy: "PushNotificationStrategy",
      reason: "Direct to mobile device for app users"
    },
    {
      name: "Team deployment notification",
      message: {
        id: 'deploy_1',
        title: 'Deployment Status',
        content: 'Production deployment completed successfully. All systems operational.',
        recipient: '#engineering',
        priority: 'medium' as const,
        category: 'deployment'
      },
      recommendedStrategy: "SlackStrategy",
      reason: "Team collaboration platform for technical updates"
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    console.log(`Recommended: ${scenario.recommendedStrategy} - ${scenario.reason}`);
    
    // Select strategy based on scenario
    let selectedStrategy: NotificationStrategy;
    switch (scenario.recommendedStrategy) {
      case "EmailStrategy":
        selectedStrategy = new EmailStrategy();
        break;
      case "SmsStrategy":
        selectedStrategy = new SmsStrategy();
        break;
      case "PushNotificationStrategy":
        selectedStrategy = new PushNotificationStrategy();
        break;
      case "SlackStrategy":
        selectedStrategy = new SlackStrategy();
        break;
      case "DiscordStrategy":
        selectedStrategy = new DiscordStrategy();
        break;
      default:
        selectedStrategy = new EmailStrategy();
    }

    context.setStrategy(selectedStrategy);
    const result = context.send(scenario.message);
    
    console.log(`✅ Notification: ${result.success ? "SENT" : "FAILED"}\n`);
  });
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

function testNotificationStrategies(): void {
  console.log("=== NOTIFICATION STRATEGY TESTS ===\n");

  const testCases = [
    {
      name: "Valid message test",
      message: {
        id: 'test_1',
        title: 'Test Message',
        content: 'This is a test message',
        recipient: 'test@example.com',
        priority: 'medium' as const,
        category: 'test'
      },
      expectedSuccess: true
    },
    {
      name: "Long message test",
      message: {
        id: 'test_2',
        title: 'Long Message',
        content: 'A'.repeat(1000), // Very long message
        recipient: 'test@example.com',
        priority: 'medium' as const,
        category: 'test'
      },
      expectedSuccess: true
    }
  ];

  const strategies = [
    new EmailStrategy(),
    new SmsStrategy(),
    new PushNotificationStrategy(),
    new SlackStrategy(),
    new DiscordStrategy()
  ];

  testCases.forEach((testCase, testIndex) => {
    console.log(`Test ${testIndex + 1}: ${testCase.name}`);
    
    strategies.forEach((strategy, strategyIndex) => {
      const result = strategy.send(testCase.message);
      const passed = result.success === testCase.expectedSuccess;
      
      console.log(`  Strategy ${strategyIndex + 1} (${strategy.getDescription().split(' - ')[0]}): ${passed ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`    Delivery time: ${result.deliveryTime.toFixed(0)}ms`);
      console.log(`    Cost: $${result.cost.toFixed(4)}`);
    });
    console.log("");
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main(): void {
  try {
    demonstrateNotificationStrategies();
    demonstrateStrategyComparison();
    demonstrateDynamicSelection();
    testNotificationStrategies();
    
    console.log("=== NOTIFICATION SYSTEM STRATEGY PATTERN COMPLETED ===");
  } catch (error) {
    console.error("Error in notification demo:", error);
  }
}

// Run the demonstration
main();

exit(0); 