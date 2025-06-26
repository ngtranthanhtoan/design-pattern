import { exit } from 'process';

// Purchase request
interface PurchaseRequest {
  amount: number;
  item: string;
  requester: string;
}

// Handler interface
abstract class ApprovalHandler {
  protected next?: ApprovalHandler;
  protected name: string;
  protected limit: number;
  
  constructor(name: string, limit: number) {
    this.name = name;
    this.limit = limit;
  }
  
  setNext(handler: ApprovalHandler): ApprovalHandler {
    this.next = handler;
    return handler;
  }
  
  handle(request: PurchaseRequest): boolean {
    if (request.amount <= this.limit) {
      console.log(`✅ ${this.name} approved $${request.amount} for ${request.item}`);
      return true;
    }
    
    if (this.next) {
      console.log(`⏭️  ${this.name} cannot approve $${request.amount}, forwarding to ${this.next.name}`);
      return this.next.handle(request);
    }
    
    console.log(`❌ No one can approve $${request.amount} for ${request.item}`);
    return false;
  }
}

// Employee handler (up to $100)
class EmployeeHandler extends ApprovalHandler {
  constructor() { super('Employee', 100); }
}

// Manager handler (up to $1000)
class ManagerHandler extends ApprovalHandler {
  constructor() { super('Manager', 1000); }
}

// Director handler (up to $10000)
class DirectorHandler extends ApprovalHandler {
  constructor() { super('Director', 10000); }
}

// CEO handler (unlimited)
class CEOHandler extends ApprovalHandler {
  constructor() { super('CEO', Infinity); }
}

// Demo
const employee = new EmployeeHandler();
const manager = new ManagerHandler();
const director = new DirectorHandler();
const ceo = new CEOHandler();

// Build chain: Employee → Manager → Director → CEO
employee.setNext(manager).setNext(director).setNext(ceo);

console.log('=== PURCHASE APPROVAL CHAIN DEMO ===');

// Test different purchase amounts
const purchases: PurchaseRequest[] = [
  { amount: 50, item: 'Office supplies', requester: 'John' },
  { amount: 500, item: 'New monitor', requester: 'Jane' },
  { amount: 5000, item: 'Server hardware', requester: 'Bob' },
  { amount: 50000, item: 'Company car', requester: 'Alice' }
];

purchases.forEach(purchase => {
  console.log(`\n--- Processing $${purchase.amount} purchase ---`);
  employee.handle(purchase);
});

exit(0); 