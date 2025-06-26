import { exit } from 'process';

// Mediator interface
interface Mediator {
  notify(sender: Colleague, event: string, data?: any): void;
}

// Colleague interface
interface Colleague {
  setMediator(mediator: Mediator): void;
  send(event: string, data?: any): void;
  receive(event: string, data?: any): void;
  getId(): string;
}

// Order class
class Order {
  constructor(
    public id: string,
    public customerId: string,
    public items: any[],
    public total: number,
    public status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'cancelled' = 'pending'
  ) {}
}

// Inventory Service
class InventoryService implements Colleague {
  private mediator: Mediator | null = null;
  private inventory: Map<string, number> = new Map();

  constructor(private id: string) {
    this.inventory.set('item-001', 100);
    this.inventory.set('item-002', 50);
    this.inventory.set('item-003', 200);
  }

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`📦 Inventory: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`📦 Inventory: Received ${event}`);
    
    if (event === 'check_availability') {
      const { orderId, items } = data;
      const available = items.every((item: any) => 
        (this.inventory.get(item.id) || 0) >= item.quantity
      );
      
      if (available) {
        console.log(`    📦 Inventory: Items available for order ${orderId}`);
        this.send('items_available', { orderId, items });
      } else {
        console.log(`    ❌ Inventory: Insufficient stock for order ${orderId}`);
        this.send('items_unavailable', { orderId });
      }
    }
  }

  getId(): string {
    return this.id;
  }
}

// Payment Service
class PaymentService implements Colleague {
  private mediator: Mediator | null = null;

  constructor(private id: string) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`💳 Payment: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`💳 Payment: Received ${event}`);
    
    if (event === 'process_payment') {
      const { orderId, amount } = data;
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        console.log(`    💳 Payment: Payment successful for order ${orderId}`);
        this.send('payment_successful', { orderId, amount });
      } else {
        console.log(`    ❌ Payment: Payment failed for order ${orderId}`);
        this.send('payment_failed', { orderId });
      }
    }
  }

  getId(): string {
    return this.id;
  }
}

// Shipping Service
class ShippingService implements Colleague {
  private mediator: Mediator | null = null;

  constructor(private id: string) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`🚚 Shipping: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`🚚 Shipping: Received ${event}`);
    
    if (event === 'create_shipment') {
      const { orderId } = data;
      const trackingNumber = `TRK-${Date.now()}`;
      
      console.log(`    🚚 Shipping: Shipment created for order ${orderId}`);
      this.send('shipment_created', { orderId, trackingNumber });
    }
  }

  getId(): string {
    return this.id;
  }
}

// Notification Service
class NotificationService implements Colleague {
  private mediator: Mediator | null = null;

  constructor(private id: string) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`📧 Notification: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`📧 Notification: Received ${event}`);
    
    if (event === 'send_notification') {
      const { customerId, type, message } = data;
      console.log(`    📧 Notification: ${type} sent to customer ${customerId}: ${message}`);
    }
  }

  getId(): string {
    return this.id;
  }
}

// Order Processing Mediator
class OrderProcessingMediator implements Mediator {
  private orders: Map<string, Order> = new Map();
  private inventoryService: InventoryService | null = null;
  private paymentService: PaymentService | null = null;
  private shippingService: ShippingService | null = null;
  private notificationService: NotificationService | null = null;

  setInventoryService(service: InventoryService): void {
    this.inventoryService = service;
    service.setMediator(this);
    console.log(`📦 Order Processing: Inventory service registered`);
  }

  setPaymentService(service: PaymentService): void {
    this.paymentService = service;
    service.setMediator(this);
    console.log(`💳 Order Processing: Payment service registered`);
  }

  setShippingService(service: ShippingService): void {
    this.shippingService = service;
    service.setMediator(this);
    console.log(`🚚 Order Processing: Shipping service registered`);
  }

  setNotificationService(service: NotificationService): void {
    this.notificationService = service;
    service.setMediator(this);
    console.log(`📧 Order Processing: Notification service registered`);
  }

  notify(sender: Colleague, event: string, data?: any): void {
    const senderId = sender.getId ? sender.getId() : 'mediator';
    console.log(`🎯 Order Processing: Routing ${event} from ${senderId}`);
    
    switch (event) {
      case 'place_order':
        this.handlePlaceOrder(data);
        break;
      case 'items_available':
        this.handleItemsAvailable(data);
        break;
      case 'items_unavailable':
        this.handleItemsUnavailable(data);
        break;
      case 'payment_successful':
        this.handlePaymentSuccessful(data);
        break;
      case 'payment_failed':
        this.handlePaymentFailed(data);
        break;
      case 'shipment_created':
        this.handleShipmentCreated(data);
        break;
    }
  }

  private handlePlaceOrder(data: any): void {
    const { orderId, customerId, items, total } = data;
    
    const order = new Order(orderId, customerId, items, total);
    this.orders.set(orderId, order);
    
    console.log(`🛒 Order Processing: Order ${orderId} placed`);
    
    if (this.inventoryService) {
      this.inventoryService.send('check_availability', { orderId, items });
    }
  }

  private handleItemsAvailable(data: any): void {
    const { orderId } = data;
    const order = this.orders.get(orderId);
    
    if (order) {
      order.status = 'processing';
      console.log(`📦 Order Processing: Items available for order ${orderId}`);
      
      if (this.paymentService) {
        this.paymentService.send('process_payment', { orderId, amount: order.total });
      }
    }
  }

  private handleItemsUnavailable(data: any): void {
    const { orderId } = data;
    const order = this.orders.get(orderId);
    
    if (order) {
      order.status = 'cancelled';
      console.log(`❌ Order Processing: Order ${orderId} cancelled - insufficient inventory`);
      
      if (this.notificationService) {
        this.notificationService.send('send_notification', {
          customerId: order.customerId,
          type: 'order_cancelled',
          message: `Order ${orderId} cancelled due to insufficient inventory.`
        });
      }
    }
  }

  private handlePaymentSuccessful(data: any): void {
    const { orderId } = data;
    const order = this.orders.get(orderId);
    
    if (order) {
      order.status = 'confirmed';
      console.log(`💳 Order Processing: Payment successful for order ${orderId}`);
      
      if (this.shippingService) {
        this.shippingService.send('create_shipment', { orderId });
      }
      
      if (this.notificationService) {
        this.notificationService.send('send_notification', {
          customerId: order.customerId,
          type: 'order_confirmed',
          message: `Order ${orderId} confirmed and being processed.`
        });
      }
    }
  }

  private handlePaymentFailed(data: any): void {
    const { orderId } = data;
    const order = this.orders.get(orderId);
    
    if (order) {
      order.status = 'cancelled';
      console.log(`❌ Order Processing: Payment failed for order ${orderId}`);
      
      if (this.notificationService) {
        this.notificationService.send('send_notification', {
          customerId: order.customerId,
          type: 'payment_failed',
          message: `Payment failed for order ${orderId}. Please update payment method.`
        });
      }
    }
  }

  private handleShipmentCreated(data: any): void {
    const { orderId, trackingNumber } = data;
    const order = this.orders.get(orderId);
    
    if (order) {
      order.status = 'shipped';
      console.log(`🚚 Order Processing: Shipment created for order ${orderId}`);
      
      if (this.notificationService) {
        this.notificationService.send('send_notification', {
          customerId: order.customerId,
          type: 'order_shipped',
          message: `Order ${orderId} shipped. Tracking: ${trackingNumber}`
        });
      }
    }
  }

  // Order processing-specific methods
  placeOrder(customerId: string, items: any[], total: number): string {
    const orderId = `order-${Date.now()}`;
    this.notify(this as any, 'place_order', { orderId, customerId, items, total });
    return orderId;
  }

  getOrderStatus(orderId: string): any {
    const order = this.orders.get(orderId);
    return order ? { ...order } : null;
  }
}

// Demo
console.log('=== E-COMMERCE ORDER PROCESSING MEDIATOR DEMO ===\n');

// Create mediator
const orderMediator = new OrderProcessingMediator();

// Create services
const inventoryService = new InventoryService('inv-001');
const paymentService = new PaymentService('pay-001');
const shippingService = new ShippingService('ship-001');
const notificationService = new NotificationService('notif-001');

// Register services
orderMediator.setInventoryService(inventoryService);
orderMediator.setPaymentService(paymentService);
orderMediator.setShippingService(shippingService);
orderMediator.setNotificationService(notificationService);

console.log('\n--- Order Processing Workflow ---');

// Place orders
const order1 = orderMediator.placeOrder('customer-001', [
  { id: 'item-001', quantity: 2, price: 25.00 },
  { id: 'item-002', quantity: 1, price: 50.00 }
], 100.00);

const order2 = orderMediator.placeOrder('customer-002', [
  { id: 'item-003', quantity: 5, price: 10.00 }
], 50.00);

// Check order status
setTimeout(() => {
  console.log('\n--- Order Status ---');
  console.log('Order 1:', orderMediator.getOrderStatus(order1));
  console.log('Order 2:', orderMediator.getOrderStatus(order2));
  
  console.log('\n✅ E-commerce order processing mediation completed successfully');
  
  exit(0);
}, 1000); 