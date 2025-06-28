import { exit } from 'process';

// ===============================
// 1. Interfaces and Types
// ===============================

interface TicketState {
  assign(agentId: string): void;
  startWork(): void;
  requestInfo(customerId: string): void;
  provideInfo(customerId: string, info: string): void;
  resolve(solution: string): void;
  close(): void;
  reopen(reason: string): void;
}

interface TicketData {
  ticketId: string;
  customerId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  assignedAgent?: string;
  solution?: string;
  notes: string[];
}

interface Agent {
  id: string;
  name: string;
  department: string;
  skills: string[];
  currentTickets: number;
  maxTickets: number;
}

// ===============================
// 2. State Classes
// ===============================

class SupportTicket {
  private state: TicketState;
  private data: TicketData;
  private waitingForCustomer: boolean = false;
  private customerResponseTimer: number = 0;
  private slaTimer: number = 0;
  private escalationLevel: number = 0;

  constructor(ticketData: Omit<TicketData, 'createdAt' | 'updatedAt' | 'notes'>) {
    this.data = {
      ...ticketData,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: []
    };
    this.state = new NewState(this);
  }

  setState(state: TicketState) {
    this.state = state;
    this.data.updatedAt = new Date();
  }

  getData(): TicketData {
    return { ...this.data };
  }

  updateData(updates: Partial<TicketData>) {
    this.data = { ...this.data, ...updates, updatedAt: new Date() };
  }

  addNote(note: string) {
    this.data.notes.push(`${new Date().toISOString()}: ${note}`);
  }

  setAssignedAgent(agentId: string) {
    this.data.assignedAgent = agentId;
  }

  getAssignedAgent(): string | undefined {
    return this.data.assignedAgent;
  }

  setSolution(solution: string) {
    this.data.solution = solution;
  }

  getSolution(): string | undefined {
    return this.data.solution;
  }

  setWaitingForCustomer(waiting: boolean) {
    this.waitingForCustomer = waiting;
    if (waiting) {
      this.customerResponseTimer = 0;
    }
  }

  isWaitingForCustomer(): boolean {
    return this.waitingForCustomer;
  }

  getCustomerResponseTimer(): number {
    return this.customerResponseTimer;
  }

  incrementCustomerResponseTimer() {
    this.customerResponseTimer++;
  }

  getSlaTimer(): number {
    return this.slaTimer;
  }

  incrementSlaTimer() {
    this.slaTimer++;
  }

  getEscalationLevel(): number {
    return this.escalationLevel;
  }

  incrementEscalationLevel() {
    this.escalationLevel++;
  }

  // State API
  assign(agentId: string) { this.state.assign(agentId); }
  startWork() { this.state.startWork(); }
  requestInfo(customerId: string) { this.state.requestInfo(customerId); }
  provideInfo(customerId: string, info: string) { this.state.provideInfo(customerId, info); }
  resolve(solution: string) { this.state.resolve(solution); }
  close() { this.state.close(); }
  reopen(reason: string) { this.state.reopen(reason); }

  // For demonstration
  printStatus() {
    const data = this.getData();
    console.log(`\n[TICKET ${data.ticketId}] Status: ${this.state.constructor.name.replace('State', '')}`);
    console.log(`Subject: ${data.subject}, Priority: ${data.priority}, Category: ${data.category}`);
    console.log(`Customer: ${data.customerId}, Assigned: ${data.assignedAgent || 'Unassigned'}`);
    console.log(`SLA Timer: ${this.slaTimer}s, Customer Response: ${this.customerResponseTimer}s`);
    console.log(`Escalation Level: ${this.escalationLevel}, Waiting for Customer: ${this.waitingForCustomer}`);
    if (data.solution) {
      console.log(`Solution: ${data.solution.substring(0, 50)}...`);
    }
    if (data.notes.length > 0) {
      console.log(`Notes: ${data.notes.length} entries`);
    }
  }
}

// -------------------------------
// New State
// -------------------------------
class NewState implements TicketState {
  constructor(private ticket: SupportTicket) {}

  assign(agentId: string): void {
    console.log(`👤 Assigning ticket to agent ${agentId}.`);
    this.ticket.setAssignedAgent(agentId);
    this.ticket.addNote(`Ticket assigned to agent ${agentId}`);
    this.ticket.setState(new AssignedState(this.ticket));
  }

  startWork(): void {
    console.log('⚠️ Cannot start work on unassigned ticket.');
  }

  requestInfo(customerId: string): void {
    console.log('⚠️ Cannot request info from customer on unassigned ticket.');
  }

  provideInfo(customerId: string, info: string): void {
    console.log('⚠️ Cannot provide info on unassigned ticket.');
  }

  resolve(solution: string): void {
    console.log('⚠️ Cannot resolve unassigned ticket.');
  }

  close(): void {
    console.log('⚠️ Cannot close unassigned ticket.');
  }

  reopen(reason: string): void {
    console.log('⚠️ Cannot reopen new ticket.');
  }
}

// -------------------------------
// Assigned State
// -------------------------------
class AssignedState implements TicketState {
  constructor(private ticket: SupportTicket) {}

  assign(agentId: string): void {
    const currentAgent = this.ticket.getAssignedAgent();
    if (currentAgent === agentId) {
      console.log('⚠️ Ticket already assigned to this agent.');
      return;
    }
    
    console.log(`👤 Reassigning ticket from ${currentAgent} to ${agentId}.`);
    this.ticket.setAssignedAgent(agentId);
    this.ticket.addNote(`Ticket reassigned from ${currentAgent} to ${agentId}`);
  }

  startWork(): void {
    console.log('🔧 Agent starting work on ticket.');
    this.ticket.addNote('Agent started working on ticket');
    this.ticket.setState(new InProgressState(this.ticket));
  }

  requestInfo(customerId: string): void {
    console.log('⚠️ Cannot request info before starting work.');
  }

  provideInfo(customerId: string, info: string): void {
    console.log('⚠️ Cannot provide info before starting work.');
  }

  resolve(solution: string): void {
    console.log('⚠️ Cannot resolve ticket before starting work.');
  }

  close(): void {
    console.log('⚠️ Cannot close ticket before starting work.');
  }

  reopen(reason: string): void {
    console.log('⚠️ Cannot reopen assigned ticket.');
  }
}

// -------------------------------
// In Progress State
// -------------------------------
class InProgressState implements TicketState {
  constructor(private ticket: SupportTicket) {}

  assign(agentId: string): void {
    const currentAgent = this.ticket.getAssignedAgent();
    if (currentAgent === agentId) {
      console.log('⚠️ Ticket already assigned to this agent.');
      return;
    }
    
    console.log(`👤 Reassigning ticket from ${currentAgent} to ${agentId}.`);
    this.ticket.setAssignedAgent(agentId);
    this.ticket.addNote(`Ticket reassigned from ${currentAgent} to ${agentId}`);
  }

  startWork(): void {
    console.log('⚠️ Work already in progress.');
  }

  requestInfo(customerId: string): void {
    console.log(`📧 Requesting additional information from customer ${customerId}.`);
    this.ticket.setWaitingForCustomer(true);
    this.ticket.addNote(`Information requested from customer ${customerId}`);
    this.ticket.setState(new WaitingForCustomerState(this.ticket));
  }

  provideInfo(customerId: string, info: string): void {
    console.log('⚠️ Cannot provide info while working on ticket.');
  }

  resolve(solution: string): void {
    if (!solution || solution.trim().length === 0) {
      console.log('❌ Cannot resolve ticket without a solution.');
      return;
    }
    
    console.log('✅ Resolving ticket with solution.');
    this.ticket.setSolution(solution);
    this.ticket.addNote(`Ticket resolved: ${solution.substring(0, 100)}...`);
    this.ticket.setState(new ResolvedState(this.ticket));
  }

  close(): void {
    console.log('⚠️ Cannot close ticket while work is in progress.');
  }

  reopen(reason: string): void {
    console.log('⚠️ Cannot reopen ticket while work is in progress.');
  }
}

// -------------------------------
// Waiting for Customer State
// -------------------------------
class WaitingForCustomerState implements TicketState {
  private readonly CUSTOMER_TIMEOUT = 72; // 72 hours timeout
  
  constructor(private ticket: SupportTicket) {}

  assign(agentId: string): void {
    const currentAgent = this.ticket.getAssignedAgent();
    if (currentAgent === agentId) {
      console.log('⚠️ Ticket already assigned to this agent.');
      return;
    }
    
    console.log(`👤 Reassigning ticket from ${currentAgent} to ${agentId}.`);
    this.ticket.setAssignedAgent(agentId);
    this.ticket.addNote(`Ticket reassigned from ${currentAgent} to ${agentId}`);
  }

  startWork(): void {
    console.log('⚠️ Cannot start work while waiting for customer response.');
  }

  requestInfo(customerId: string): void {
    console.log('⚠️ Already waiting for customer response.');
  }

  provideInfo(customerId: string, info: string): void {
    console.log(`📧 Customer ${customerId} provided information: ${info.substring(0, 50)}...`);
    this.ticket.setWaitingForCustomer(false);
    this.ticket.addNote(`Customer provided information: ${info.substring(0, 100)}...`);
    this.ticket.setState(new InProgressState(this.ticket));
  }

  resolve(solution: string): void {
    console.log('⚠️ Cannot resolve ticket while waiting for customer response.');
  }

  close(): void {
    console.log('⚠️ Cannot close ticket while waiting for customer response.');
  }

  reopen(reason: string): void {
    console.log('⚠️ Cannot reopen ticket while waiting for customer response.');
  }
}

// -------------------------------
// Resolved State
// -------------------------------
class ResolvedState implements TicketState {
  constructor(private ticket: SupportTicket) {}

  assign(agentId: string): void {
    console.log('⚠️ Cannot reassign resolved ticket.');
  }

  startWork(): void {
    console.log('⚠️ Cannot start work on resolved ticket.');
  }

  requestInfo(customerId: string): void {
    console.log('⚠️ Cannot request info on resolved ticket.');
  }

  provideInfo(customerId: string, info: string): void {
    console.log('⚠️ Cannot provide info on resolved ticket.');
  }

  resolve(solution: string): void {
    console.log('⚠️ Ticket already resolved.');
  }

  close(): void {
    console.log('✅ Closing resolved ticket.');
    this.ticket.addNote('Ticket closed after resolution');
    this.ticket.setState(new ClosedState(this.ticket));
  }

  reopen(reason: string): void {
    console.log('🔄 Reopening resolved ticket.');
    this.ticket.addNote(`Ticket reopened: ${reason}`);
    this.ticket.setState(new InProgressState(this.ticket));
  }
}

// -------------------------------
// Closed State
// -------------------------------
class ClosedState implements TicketState {
  constructor(private ticket: SupportTicket) {}

  assign(agentId: string): void {
    console.log('⚠️ Cannot assign closed ticket.');
  }

  startWork(): void {
    console.log('⚠️ Cannot start work on closed ticket.');
  }

  requestInfo(customerId: string): void {
    console.log('⚠️ Cannot request info on closed ticket.');
  }

  provideInfo(customerId: string, info: string): void {
    console.log('⚠️ Cannot provide info on closed ticket.');
  }

  resolve(solution: string): void {
    console.log('⚠️ Cannot resolve closed ticket.');
  }

  close(): void {
    console.log('⚠️ Ticket already closed.');
  }

  reopen(reason: string): void {
    console.log('🔄 Reopening closed ticket.');
    this.ticket.addNote(`Ticket reopened: ${reason}`);
    this.ticket.setState(new InProgressState(this.ticket));
  }
}

// ===============================
// 3. Usage Examples & Tests
// ===============================

function demoTicketSupport() {
  // Create sample ticket
  const ticketData = {
    ticketId: 'TKT-2024-001',
    customerId: 'CUST-12345',
    subject: 'Cannot access email account',
    description: 'I am unable to log into my email account. Getting error message "Invalid credentials".',
    priority: 'high' as const,
    category: 'Email Support'
  };

  const ticket = new SupportTicket(ticketData);
  
  console.log('--- Initial Ticket State ---');
  ticket.printStatus();
  
  // Test ticket lifecycle
  console.log('\n--- Ticket Lifecycle ---');
  
  // Assign ticket
  ticket.assign('AGENT-001');
  ticket.printStatus();
  
  // Start work
  ticket.startWork();
  ticket.printStatus();
  
  // Request info from customer
  ticket.requestInfo('CUST-12345');
  ticket.printStatus();
  
  // Simulate customer response
  ticket.provideInfo('CUST-12345', 'I changed my password yesterday and it worked fine until this morning.');
  ticket.printStatus();
  
  // Resolve ticket
  ticket.resolve('Customer password was reset. New password sent to registered email address.');
  ticket.printStatus();
  
  // Close ticket
  ticket.close();
  ticket.printStatus();
  
  console.log('\n--- Testing Reopen Scenario ---');
  
  // Reopen ticket
  ticket.reopen('Customer still cannot access account after password reset');
  ticket.printStatus();
  
  // Reassign to different agent
  ticket.assign('AGENT-002');
  ticket.printStatus();
  
  // Resolve again
  ticket.resolve('Account was locked due to multiple failed attempts. Unlocked account and provided new password.');
  ticket.printStatus();
  
  // Close again
  ticket.close();
  ticket.printStatus();
  
  console.log('\n--- Testing Edge Cases ---');
  
  // Create another ticket for edge case testing
  const ticket2 = new SupportTicket({
    ...ticketData,
    ticketId: 'TKT-2024-002',
    priority: 'urgent' as const
  });
  
  // Try invalid operations on new ticket
  ticket2.startWork(); // Should fail
  ticket2.resolve('test'); // Should fail
  ticket2.close(); // Should fail
  ticket2.reopen('test'); // Should fail
  
  // Assign and start work
  ticket2.assign('AGENT-003');
  ticket2.startWork();
  
  // Try to resolve without solution
  ticket2.resolve(''); // Should fail
  
  // Try to resolve with solution
  ticket2.resolve('Issue resolved by clearing browser cache');
  ticket2.printStatus();
  
  // Test customer timeout scenario
  console.log('\n--- Testing Customer Timeout ---');
  const ticket3 = new SupportTicket({
    ...ticketData,
    ticketId: 'TKT-2024-003'
  });
  
  ticket3.assign('AGENT-004');
  ticket3.startWork();
  ticket3.requestInfo('CUST-12345');
  
  // Simulate customer not responding
  for (let i = 0; i < 75; i++) {
    ticket3.incrementCustomerResponseTimer();
    ticket3.incrementSlaTimer();
  }
  
  ticket3.printStatus();
  
  // Simulate customer finally responding
  ticket3.provideInfo('CUST-12345', 'Sorry for the delay. I can now access my account.');
  ticket3.printStatus();
}

demoTicketSupport();
exit(0);

export { SupportTicket, TicketState, NewState, AssignedState, InProgressState, WaitingForCustomerState, ResolvedState, ClosedState, TicketData, Agent }; 