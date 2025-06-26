import { exit } from 'process';

// Command interface
interface Command {
  execute(): void;
  undo(): void;
}

// Order item
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

// Kitchen staff receivers
class Chef {
  private name: string;
  private speciality: string;
  
  constructor(name: string, speciality: string) {
    this.name = name;
    this.speciality = speciality;
  }
  
  cookItem(item: OrderItem): void {
    console.log(`👨‍🍳 ${this.name} cooking ${item.quantity}x ${item.name}`);
    if (item.specialInstructions) {
      console.log(`   Special instructions: ${item.specialInstructions}`);
    }
  }
  
  cancelItem(item: OrderItem): void {
    console.log(`❌ ${this.name} cancelled ${item.quantity}x ${item.name}`);
  }
}

class PrepCook {
  private name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  prepareItem(item: OrderItem): void {
    console.log(`🥬 ${this.name} preparing ${item.quantity}x ${item.name}`);
  }
  
  cancelPreparation(item: OrderItem): void {
    console.log(`❌ ${this.name} cancelled preparation of ${item.quantity}x ${item.name}`);
  }
}

class DeliveryDriver {
  private name: string;
  private isAvailable: boolean = true;
  
  constructor(name: string) {
    this.name = name;
  }
  
  getName(): string {
    return this.name;
  }
  
  deliverOrder(orderId: string, address: string): void {
    this.isAvailable = false;
    console.log(`🚚 ${this.name} delivering order ${orderId} to ${address}`);
  }
  
  returnFromDelivery(): void {
    this.isAvailable = true;
    console.log(`🏠 ${this.name} returned from delivery`);
  }
  
  isDriverAvailable(): boolean {
    return this.isAvailable;
  }
}

// Order commands
class CookingCommand implements Command {
  private chef: Chef;
  private item: OrderItem;
  private isExecuted: boolean = false;
  
  constructor(chef: Chef, item: OrderItem) {
    this.chef = chef;
    this.item = item;
  }
  
  execute(): void {
    this.chef.cookItem(this.item);
    this.isExecuted = true;
  }
  
  undo(): void {
    if (this.isExecuted) {
      this.chef.cancelItem(this.item);
      this.isExecuted = false;
    }
  }
}

class PreparationCommand implements Command {
  private prepCook: PrepCook;
  private item: OrderItem;
  private isExecuted: boolean = false;
  
  constructor(prepCook: PrepCook, item: OrderItem) {
    this.prepCook = prepCook;
    this.item = item;
  }
  
  execute(): void {
    this.prepCook.prepareItem(this.item);
    this.isExecuted = true;
  }
  
  undo(): void {
    if (this.isExecuted) {
      this.prepCook.cancelPreparation(this.item);
      this.isExecuted = false;
    }
  }
}

class DeliveryCommand implements Command {
  private driver: DeliveryDriver;
  private orderId: string;
  private address: string;
  private isExecuted: boolean = false;
  
  constructor(driver: DeliveryDriver, orderId: string, address: string) {
    this.driver = driver;
    this.orderId = orderId;
    this.address = address;
  }
  
  execute(): void {
    if (this.driver.isDriverAvailable()) {
      this.driver.deliverOrder(this.orderId, this.address);
      this.isExecuted = true;
    } else {
      console.log(`⚠️  Driver ${this.driver.getName()} is not available`);
    }
  }
  
  undo(): void {
    if (this.isExecuted) {
      this.driver.returnFromDelivery();
      this.isExecuted = false;
    }
  }
}

// Order management
class Order {
  private id: string;
  private items: OrderItem[] = [];
  private status: 'pending' | 'preparing' | 'cooking' | 'ready' | 'delivered' = 'pending';
  private orderType: 'dine-in' | 'takeout' | 'delivery';
  private deliveryAddress?: string;
  
  constructor(id: string, orderType: 'dine-in' | 'takeout' | 'delivery', deliveryAddress?: string) {
    this.id = id;
    this.orderType = orderType;
    this.deliveryAddress = deliveryAddress;
  }
  
  addItem(item: OrderItem): void {
    this.items.push(item);
  }
  
  removeItem(itemId: string): OrderItem | undefined {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      return this.items.splice(index, 1)[0];
    }
    return undefined;
  }
  
  getItems(): OrderItem[] {
    return [...this.items];
  }
  
  getId(): string {
    return this.id;
  }
  
  getOrderType(): 'dine-in' | 'takeout' | 'delivery' {
    return this.orderType;
  }
  
  getDeliveryAddress(): string | undefined {
    return this.deliveryAddress;
  }
  
  setStatus(status: 'pending' | 'preparing' | 'cooking' | 'ready' | 'delivered'): void {
    this.status = status;
    console.log(`📋 Order ${this.id} status: ${status}`);
  }
  
  getStatus(): 'pending' | 'preparing' | 'cooking' | 'ready' | 'delivered' {
    return this.status;
  }
  
  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}

// Macro command for processing entire order
class ProcessOrderCommand implements Command {
  private order: Order;
  private commands: Command[] = [];
  private isExecuted: boolean = false;
  
  constructor(order: Order, commands: Command[]) {
    this.order = order;
    this.commands = commands;
  }
  
  execute(): void {
    console.log(`🍽️  Processing order ${this.order.getId()}`);
    this.order.setStatus('preparing');
    
    this.commands.forEach(cmd => cmd.execute());
    
    this.order.setStatus('ready');
    console.log(`✅ Order ${this.order.getId()} is ready!`);
    this.isExecuted = true;
  }
  
  undo(): void {
    if (this.isExecuted) {
      console.log(`↩️  Cancelling order ${this.order.getId()}`);
      this.order.setStatus('pending');
      
      // Undo commands in reverse order
      for (let i = this.commands.length - 1; i >= 0; i--) {
        this.commands[i].undo();
      }
      
      this.isExecuted = false;
    }
  }
}

// Restaurant management system
class RestaurantManager {
  private orderQueue: Command[] = [];
  private completedOrders: Order[] = [];
  
  submitOrder(command: Command): void {
    this.orderQueue.push(command);
    console.log(`📝 Order added to queue`);
  }
  
  processNextOrder(): void {
    if (this.orderQueue.length > 0) {
      const command = this.orderQueue.shift()!;
      command.execute();
    } else {
      console.log('⚠️  No orders in queue');
    }
  }
  
  cancelLastOrder(): void {
    if (this.orderQueue.length > 0) {
      const command = this.orderQueue.pop()!;
      command.undo();
    } else {
      console.log('⚠️  No orders to cancel');
    }
  }
  
  getQueueLength(): number {
    return this.orderQueue.length;
  }
}

// Demo
const chef = new Chef('Gordon', 'Main dishes');
const prepCook = new PrepCook('Alice');
const driver = new DeliveryDriver('Bob');

const manager = new RestaurantManager();

console.log('=== RESTAURANT ORDER SYSTEM DEMO ===\n');

// Create orders
const dineInOrder = new Order('D001', 'dine-in');
dineInOrder.addItem({ id: '1', name: 'Caesar Salad', quantity: 2, price: 12.99 });
dineInOrder.addItem({ id: '2', name: 'Grilled Salmon', quantity: 1, price: 24.99, specialInstructions: 'Medium rare' });

const deliveryOrder = new Order('D002', 'delivery', '123 Main St');
deliveryOrder.addItem({ id: '3', name: 'Margherita Pizza', quantity: 1, price: 18.99 });
deliveryOrder.addItem({ id: '4', name: 'Garlic Bread', quantity: 1, price: 6.99 });

console.log('--- Processing Dine-in Order ---');
const dineInCommands = [
  new PreparationCommand(prepCook, dineInOrder.getItems()[0]),
  new CookingCommand(chef, dineInOrder.getItems()[1])
];

const processDineIn = new ProcessOrderCommand(dineInOrder, dineInCommands);
manager.submitOrder(processDineIn);
manager.processNextOrder();

console.log('\n--- Processing Delivery Order ---');
const deliveryCommands = [
  new PreparationCommand(prepCook, deliveryOrder.getItems()[0]),
  new PreparationCommand(prepCook, deliveryOrder.getItems()[1]),
  new DeliveryCommand(driver, deliveryOrder.getId(), deliveryOrder.getDeliveryAddress()!)
];

const processDelivery = new ProcessOrderCommand(deliveryOrder, deliveryCommands);
manager.submitOrder(processDelivery);
manager.processNextOrder();

console.log('\n--- Cancelling Last Order ---');
manager.cancelLastOrder();

console.log(`\nQueue length: ${manager.getQueueLength()}`);

exit(0); 