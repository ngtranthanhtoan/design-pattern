import { exit } from 'process';

// Support ticket
interface SupportTicket {
  id: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  customer: string;
}

// Handler interface
abstract class SupportHandler {
  protected next?: SupportHandler;
  protected level: string;
  protected expertise: string[];
  
  constructor(level: string, expertise: string[]) {
    this.level = level;
    this.expertise = expertise;
  }
  
  setNext(handler: SupportHandler): SupportHandler {
    this.next = handler;
    return handler;
  }
  
  handle(ticket: SupportTicket): boolean {
    if (this.canHandle(ticket)) {
      console.log(`✅ ${this.level} resolved ticket ${ticket.id}: ${ticket.issue}`);
      return true;
    }
    
    if (this.next) {
      console.log(`⏭️  ${this.level} cannot handle, escalating to ${this.next.level}`);
      return this.next.handle(ticket);
    }
    
    console.log(`❌ No one can handle ticket ${ticket.id}`);
    return false;
  }
  
  protected canHandle(ticket: SupportTicket): boolean {
    return this.expertise.some(exp => 
      ticket.issue.toLowerCase().includes(exp.toLowerCase())
    );
  }
}

// Level 1: Basic support
class Level1Handler extends SupportHandler {
  constructor() { 
    super('Level 1', ['password reset', 'account access', 'basic setup']); 
  }
}

// Level 2: Technical support
class Level2Handler extends SupportHandler {
  constructor() { 
    super('Level 2', ['software installation', 'configuration', 'performance']); 
  }
}

// Level 3: Expert support
class Level3Handler extends SupportHandler {
  constructor() { 
    super('Level 3', ['database', 'network', 'security', 'integration']); 
  }
}

// Demo
const level1 = new Level1Handler();
const level2 = new Level2Handler();
const level3 = new Level3Handler();

// Build chain: Level 1 → Level 2 → Level 3
level1.setNext(level2).setNext(level3);

console.log('=== SUPPORT TICKET ESCALATION CHAIN DEMO ===');

// Test different support tickets
const tickets: SupportTicket[] = [
  { id: 'T001', issue: 'Cannot reset password', priority: 'medium', customer: 'John' },
  { id: 'T002', issue: 'Software installation failed', priority: 'high', customer: 'Jane' },
  { id: 'T003', issue: 'Database connection timeout', priority: 'critical', customer: 'Bob' },
  { id: 'T004', issue: 'Unknown error message', priority: 'low', customer: 'Alice' }
];

tickets.forEach(ticket => {
  console.log(`\n--- Processing ticket ${ticket.id} ---`);
  level1.handle(ticket);
});

exit(0); 