import { exit } from 'process';

// ===============================
// 1. Interfaces and Types
// ===============================

interface VendingMachineState {
  insertCoin(): void;
  selectProduct(product: string): void;
  dispense(): void;
  refund(): void;
}

interface Product {
  name: string;
  price: number;
  stock: number;
}

// ===============================
// 2. State Classes
// ===============================

class VendingMachineContext {
  private state: VendingMachineState;
  private products: Map<string, Product>;
  private balance: number = 0;
  private selectedProduct: string | null = null;

  constructor(products: Product[]) {
    this.products = new Map(products.map(p => [p.name, { ...p }]));
    this.state = new IdleState(this);
  }

  setState(state: VendingMachineState) {
    this.state = state;
  }

  getProduct(product: string): Product | undefined {
    return this.products.get(product);
  }

  updateProductStock(product: string, delta: number) {
    const p = this.products.get(product);
    if (p) {
      p.stock += delta;
    }
  }

  getBalance(): number {
    return this.balance;
  }

  addBalance(amount: number) {
    this.balance += amount;
  }

  resetBalance() {
    this.balance = 0;
  }

  getSelectedProduct(): string | null {
    return this.selectedProduct;
  }

  setSelectedProduct(product: string | null) {
    this.selectedProduct = product;
  }

  // State API
  insertCoin() { this.state.insertCoin(); }
  selectProduct(product: string) { this.state.selectProduct(product); }
  dispense() { this.state.dispense(); }
  refund() { this.state.refund(); }

  // For demonstration
  printStatus() {
    console.log(`\n[STATUS] Balance: $${this.balance.toFixed(2)}, Selected: ${this.selectedProduct ?? 'None'}`);
    console.log('Products:');
    for (const p of this.products.values()) {
      console.log(`- ${p.name}: $${p.price.toFixed(2)} (${p.stock} in stock)`);
    }
  }
}

// -------------------------------
// Idle State
// -------------------------------
class IdleState implements VendingMachineState {
  constructor(private context: VendingMachineContext) {}

  insertCoin(): void {
    this.context.addBalance(1); // Assume $1 per coin
    console.log('💰 Coin inserted.');
    this.context.setState(new HasCoinState(this.context));
  }

  selectProduct(product: string): void {
    console.log('⚠️ Please insert coin first.');
  }

  dispense(): void {
    console.log('⚠️ Please insert coin and select product first.');
  }

  refund(): void {
    console.log('⚠️ No balance to refund.');
  }
}

// -------------------------------
// Has Coin State
// -------------------------------
class HasCoinState implements VendingMachineState {
  constructor(private context: VendingMachineContext) {}

  insertCoin(): void {
    this.context.addBalance(1);
    console.log('💰 Additional coin inserted.');
  }

  selectProduct(product: string): void {
    const p = this.context.getProduct(product);
    if (!p) {
      console.log('❌ Product not found.');
      return;
    }
    if (p.stock <= 0) {
      console.log('❌ Product out of stock.');
      this.context.setState(new OutOfStockState(this.context));
      return;
    }
    if (this.context.getBalance() < p.price) {
      console.log(`⚠️ Insufficient balance. ${p.name} costs $${p.price.toFixed(2)}.`);
      return;
    }
    this.context.setSelectedProduct(product);
    console.log(`✅ Product selected: ${product}`);
    this.context.setState(new DispensingState(this.context));
  }

  dispense(): void {
    console.log('⚠️ Please select a product first.');
  }

  refund(): void {
    const refund = this.context.getBalance();
    this.context.resetBalance();
    this.context.setSelectedProduct(null);
    console.log(`💸 Refunded $${refund.toFixed(2)}.`);
    this.context.setState(new IdleState(this.context));
  }
}

// -------------------------------
// Dispensing State
// -------------------------------
class DispensingState implements VendingMachineState {
  constructor(private context: VendingMachineContext) {}

  insertCoin(): void {
    console.log('⚠️ Dispensing in progress. Please wait.');
  }

  selectProduct(product: string): void {
    console.log('⚠️ Dispensing in progress. Please wait.');
  }

  dispense(): void {
    const productName = this.context.getSelectedProduct();
    if (!productName) {
      console.log('❌ No product selected.');
      this.context.setState(new IdleState(this.context));
      return;
    }
    const p = this.context.getProduct(productName);
    if (!p || p.stock <= 0) {
      console.log('❌ Product out of stock.');
      this.context.setState(new OutOfStockState(this.context));
      return;
    }
    if (this.context.getBalance() < p.price) {
      console.log('❌ Insufficient balance.');
      this.context.setState(new HasCoinState(this.context));
      return;
    }
    this.context.updateProductStock(productName, -1);
    this.context.addBalance(-p.price);
    console.log(`🥤 Dispensing ${productName}... Enjoy!`);
    this.context.setSelectedProduct(null);
    if (this.context.getBalance() > 0) {
      console.log(`💸 Returning change: $${this.context.getBalance().toFixed(2)}`);
      this.context.resetBalance();
    }
    // Check if all products are out of stock
    const allOut = Array.from(['Coke', 'Pepsi', 'Water']).every(
      name => (this.context.getProduct(name)?.stock ?? 0) === 0
    );
    if (allOut) {
      this.context.setState(new OutOfStockState(this.context));
    } else {
      this.context.setState(new IdleState(this.context));
    }
  }

  refund(): void {
    console.log('⚠️ Dispensing in progress. Cannot refund now.');
  }
}

// -------------------------------
// Out Of Stock State
// -------------------------------
class OutOfStockState implements VendingMachineState {
  constructor(private context: VendingMachineContext) {}

  insertCoin(): void {
    console.log('❌ Machine is out of stock. Coin returned.');
  }

  selectProduct(product: string): void {
    console.log('❌ Machine is out of stock.');
  }

  dispense(): void {
    console.log('❌ Machine is out of stock.');
  }

  refund(): void {
    const refund = this.context.getBalance();
    if (refund > 0) {
      this.context.resetBalance();
      console.log(`💸 Refunded $${refund.toFixed(2)}.`);
    } else {
      console.log('⚠️ No balance to refund.');
    }
  }
}

// ===============================
// 3. Usage Examples & Tests
// ===============================

function demoVendingMachine() {
  const products: Product[] = [
    { name: 'Coke', price: 1.5, stock: 2 },
    { name: 'Pepsi', price: 1.25, stock: 1 },
    { name: 'Water', price: 1.0, stock: 0 },
  ];
  const vm = new VendingMachineContext(products);

  console.log('--- Initial State ---');
  vm.printStatus();

  // Try to select product without coin
  vm.selectProduct('Coke');

  // Insert coin and select product
  vm.insertCoin();
  vm.selectProduct('Coke');
  vm.dispense();
  vm.printStatus();

  // Insert insufficient coins for Pepsi
  vm.insertCoin();
  vm.selectProduct('Pepsi'); // Not enough
  vm.insertCoin();
  vm.selectProduct('Pepsi');
  vm.dispense();
  vm.printStatus();

  // Try to buy out-of-stock Water
  vm.insertCoin();
  vm.selectProduct('Water');
  vm.refund();

  // Try to buy Coke again (should be last one)
  vm.insertCoin();
  vm.insertCoin();
  vm.selectProduct('Coke');
  vm.dispense();
  vm.printStatus();

  // Try to buy when all are out of stock
  vm.insertCoin();
  vm.selectProduct('Coke');
  vm.refund();
}

demoVendingMachine();
exit(0);

export { VendingMachineContext, VendingMachineState, IdleState, HasCoinState, DispensingState, OutOfStockState, Product }; 