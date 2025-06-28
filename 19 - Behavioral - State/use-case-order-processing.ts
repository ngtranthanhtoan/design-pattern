import { exit } from 'process';

// ===============================
// 1. Interfaces and Types
// ===============================

interface OrderState {
  confirm(): void;
  process(): void;
  ship(): void;
  deliver(): void;
  cancel(): void;
  refund(): void;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderData {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// ===============================
// 2. State Classes
// ===============================

class Order {
  private state: OrderState;
  private data: OrderData;
  private paymentStatus: 'pending' | 'paid' | 'failed' = 'pending';
  private inventoryReserved: boolean = false;
  private shippingLabel: string | null = null;
  private trackingNumber: string | null = null;

  constructor(orderData: Omit<OrderData, 'createdAt' | 'updatedAt'>) {
    this.data = {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.state = new PendingState(this);
  }

  setState(state: OrderState) {
    this.state = state;
    this.data.updatedAt = new Date();
  }

  getData(): OrderData {
    return { ...this.data };
  }

  updateData(updates: Partial<OrderData>) {
    this.data = { ...this.data, ...updates, updatedAt: new Date() };
  }

  setPaymentStatus(status: 'pending' | 'paid' | 'failed') {
    this.paymentStatus = status;
  }

  getPaymentStatus(): 'pending' | 'paid' | 'failed' {
    return this.paymentStatus;
  }

  setInventoryReserved(reserved: boolean) {
    this.inventoryReserved = reserved;
  }

  isInventoryReserved(): boolean {
    return this.inventoryReserved;
  }

  setShippingLabel(label: string | null) {
    this.shippingLabel = label;
  }

  getShippingLabel(): string | null {
    return this.shippingLabel;
  }

  setTrackingNumber(tracking: string | null) {
    this.trackingNumber = tracking;
  }

  getTrackingNumber(): string | null {
    return this.trackingNumber;
  }

  // State API
  confirm() { this.state.confirm(); }
  process() { this.state.process(); }
  ship() { this.state.ship(); }
  deliver() { this.state.deliver(); }
  cancel() { this.state.cancel(); }
  refund() { this.state.refund(); }

  // For demonstration
  printStatus() {
    const data = this.getData();
    console.log(`\n[ORDER ${data.orderId}] Status: ${this.state.constructor.name.replace('State', '')}`);
    console.log(`Customer: ${data.customerId}, Total: $${data.totalAmount.toFixed(2)}`);
    console.log(`Payment: ${this.paymentStatus}, Inventory: ${this.inventoryReserved ? 'Reserved' : 'Not Reserved'}`);
    console.log(`Shipping: ${this.shippingLabel ? 'Label Generated' : 'No Label'}, Tracking: ${this.trackingNumber || 'None'}`);
    console.log(`Items: ${data.items.length} products`);
    data.items.forEach(item => {
      console.log(`  - ${item.name} x${item.quantity} @ $${item.unitPrice} = $${item.totalPrice}`);
    });
  }
}

// -------------------------------
// Pending State
// -------------------------------
class PendingState implements OrderState {
  constructor(private order: Order) {}

  confirm(): void {
    const paymentStatus = this.order.getPaymentStatus();
    
    if (paymentStatus === 'failed') {
      console.log('❌ Cannot confirm order with failed payment.');
      return;
    }
    
    if (paymentStatus !== 'paid') {
      console.log('⚠️ Payment not completed. Cannot confirm order.');
      return;
    }
    
    console.log('✅ Order confirmed and payment verified.');
    this.order.setState(new ConfirmedState(this.order));
  }

  process(): void {
    console.log('⚠️ Order must be confirmed before processing.');
  }

  ship(): void {
    console.log('⚠️ Order must be processed before shipping.');
  }

  deliver(): void {
    console.log('⚠️ Order must be shipped before delivery.');
  }

  cancel(): void {
    console.log('✅ Order cancelled.');
    this.order.updateData({ notes: 'Order cancelled by customer' });
    this.order.setState(new CancelledState(this.order));
  }

  refund(): void {
    console.log('⚠️ Order not yet confirmed. No refund needed.');
  }
}

// -------------------------------
// Confirmed State
// -------------------------------
class ConfirmedState implements OrderState {
  constructor(private order: Order) {}

  confirm(): void {
    console.log('⚠️ Order already confirmed.');
  }

  process(): void {
    const data = this.order.getData();
    
    // Check inventory availability
    if (!this.order.isInventoryReserved()) {
      console.log('📦 Reserving inventory...');
      this.order.setInventoryReserved(true);
    }
    
    // Validate order items
    if (data.items.length === 0) {
      console.log('❌ Order has no items. Cannot process.');
      return;
    }
    
    console.log('⚙️ Processing order...');
    console.log('📋 Validating items and preparing for fulfillment.');
    
    this.order.setState(new ProcessingState(this.order));
  }

  ship(): void {
    console.log('⚠️ Order must be processed before shipping.');
  }

  deliver(): void {
    console.log('⚠️ Order must be shipped before delivery.');
  }

  cancel(): void {
    console.log('✅ Order cancelled after confirmation.');
    this.order.updateData({ notes: 'Order cancelled after confirmation' });
    this.order.setState(new CancelledState(this.order));
  }

  refund(): void {
    console.log('💰 Processing refund for confirmed order.');
    this.order.updateData({ notes: 'Refund processed' });
    this.order.setState(new CancelledState(this.order));
  }
}

// -------------------------------
// Processing State
// -------------------------------
class ProcessingState implements OrderState {
  constructor(private order: Order) {}

  confirm(): void {
    console.log('⚠️ Order already confirmed and being processed.');
  }

  process(): void {
    console.log('⚠️ Order is already being processed.');
  }

  ship(): void {
    const data = this.order.getData();
    
    if (!this.order.isInventoryReserved()) {
      console.log('❌ Inventory not reserved. Cannot ship.');
      return;
    }
    
    // Generate shipping label
    const shippingLabel = `SHIP-${data.orderId}-${Date.now()}`;
    this.order.setShippingLabel(shippingLabel);
    
    // Generate tracking number
    const trackingNumber = `TRK-${data.orderId.slice(-8)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    this.order.setTrackingNumber(trackingNumber);
    
    console.log('📦 Generating shipping label and tracking number...');
    console.log(`🚚 Order ready for shipping. Tracking: ${trackingNumber}`);
    
    this.order.setState(new ShippedState(this.order));
  }

  deliver(): void {
    console.log('⚠️ Order must be shipped before delivery.');
  }

  cancel(): void {
    console.log('✅ Order cancelled during processing.');
    this.order.updateData({ notes: 'Order cancelled during processing' });
    this.order.setState(new CancelledState(this.order));
  }

  refund(): void {
    console.log('💰 Processing refund for order in processing.');
    this.order.updateData({ notes: 'Refund processed during processing' });
    this.order.setState(new CancelledState(this.order));
  }
}

// -------------------------------
// Shipped State
// -------------------------------
class ShippedState implements OrderState {
  constructor(private order: Order) {}

  confirm(): void {
    console.log('⚠️ Order already confirmed and shipped.');
  }

  process(): void {
    console.log('⚠️ Order already processed and shipped.');
  }

  ship(): void {
    console.log('⚠️ Order already shipped.');
  }

  deliver(): void {
    const trackingNumber = this.order.getTrackingNumber();
    
    if (!trackingNumber) {
      console.log('❌ No tracking number available. Cannot mark as delivered.');
      return;
    }
    
    console.log('📦 Order delivered successfully!');
    console.log(`✅ Tracking number ${trackingNumber} marked as delivered.`);
    
    this.order.setState(new DeliveredState(this.order));
  }

  cancel(): void {
    console.log('⚠️ Order already shipped. Cannot cancel.');
  }

  refund(): void {
    console.log('💰 Processing refund for shipped order.');
    console.log('📦 Return shipping label will be provided.');
    this.order.updateData({ notes: 'Refund processed for shipped order' });
    this.order.setState(new CancelledState(this.order));
  }
}

// -------------------------------
// Delivered State
// -------------------------------
class DeliveredState implements OrderState {
  constructor(private order: Order) {}

  confirm(): void {
    console.log('⚠️ Order already delivered.');
  }

  process(): void {
    console.log('⚠️ Order already delivered.');
  }

  ship(): void {
    console.log('⚠️ Order already delivered.');
  }

  deliver(): void {
    console.log('⚠️ Order already delivered.');
  }

  cancel(): void {
    console.log('⚠️ Order already delivered. Cannot cancel.');
  }

  refund(): void {
    console.log('💰 Processing refund for delivered order.');
    console.log('📦 Return shipping label will be provided.');
    this.order.updateData({ notes: 'Refund processed for delivered order' });
    this.order.setState(new CancelledState(this.order));
  }
}

// -------------------------------
// Cancelled State
// -------------------------------
class CancelledState implements OrderState {
  constructor(private order: Order) {}

  confirm(): void {
    console.log('❌ Cannot confirm cancelled order.');
  }

  process(): void {
    console.log('❌ Cannot process cancelled order.');
  }

  ship(): void {
    console.log('❌ Cannot ship cancelled order.');
  }

  deliver(): void {
    console.log('❌ Cannot deliver cancelled order.');
  }

  cancel(): void {
    console.log('⚠️ Order already cancelled.');
  }

  refund(): void {
    console.log('⚠️ Refund already processed for cancelled order.');
  }
}

// ===============================
// 3. Usage Examples & Tests
// ===============================

function demoOrderProcessing() {
  // Create sample order
  const orderData = {
    orderId: 'ORD-2024-001',
    customerId: 'CUST-12345',
    items: [
      {
        productId: 'PROD-001',
        name: 'Laptop',
        quantity: 1,
        unitPrice: 999.99,
        totalPrice: 999.99
      },
      {
        productId: 'PROD-002',
        name: 'Mouse',
        quantity: 2,
        unitPrice: 29.99,
        totalPrice: 59.98
      }
    ],
    totalAmount: 1059.97,
    shippingAddress: '123 Main St, City, State 12345'
  };

  const order = new Order(orderData);
  
  console.log('--- Initial Order State ---');
  order.printStatus();
  
  // Test payment failure
  order.setPaymentStatus('failed');
  order.confirm();
  
  // Test successful payment and confirmation
  order.setPaymentStatus('paid');
  order.confirm();
  order.printStatus();
  
  // Test processing
  order.process();
  order.printStatus();
  
  // Test shipping
  order.ship();
  order.printStatus();
  
  // Test delivery
  order.deliver();
  order.printStatus();
  
  // Test refund after delivery
  order.refund();
  order.printStatus();
  
  console.log('\n--- Testing Cancellation Scenarios ---');
  
  // Create another order for cancellation testing
  const order2 = new Order({
    ...orderData,
    orderId: 'ORD-2024-002'
  });
  
  order2.setPaymentStatus('paid');
  order2.confirm();
  order2.printStatus();
  
  // Cancel during processing
  order2.process();
  order2.cancel();
  order2.printStatus();
  
  console.log('\n--- Testing Edge Cases ---');
  
  // Test invalid operations
  const order3 = new Order({
    ...orderData,
    orderId: 'ORD-2024-003'
  });
  
  order3.process(); // Should fail
  order3.ship(); // Should fail
  order3.deliver(); // Should fail
  order3.refund(); // Should fail
  
  order3.setPaymentStatus('paid');
  order3.confirm();
  order3.ship(); // Should fail - needs processing first
  order3.process();
  order3.ship();
  order3.deliver();
  order3.confirm(); // Should fail - already delivered
}

demoOrderProcessing();
exit(0);

export { Order, OrderState, PendingState, ConfirmedState, ProcessingState, ShippedState, DeliveredState, CancelledState, OrderData, OrderItem }; 