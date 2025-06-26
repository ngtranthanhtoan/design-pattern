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

// User class
class User implements Colleague {
  private mediator: Mediator | null = null;

  constructor(
    private id: string,
    private username: string
  ) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`👤 ${this.username}: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`👤 ${this.username}: Received ${event} - ${data?.message || ''}`);
  }

  getId(): string {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  // User-specific methods
  sendMessage(content: string, roomId: string): void {
    this.send('message', { content, roomId, sender: this.username });
  }

  sendDirectMessage(recipientId: string, content: string): void {
    this.send('direct_message', { recipientId, content, sender: this.username });
  }
}

// Room class
class Room implements Colleague {
  private mediator: Mediator | null = null;
  private members: Set<string> = new Set();

  constructor(
    private id: string,
    private name: string
  ) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`🏠 Room ${this.name}: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`🏠 Room ${this.name}: Received ${event}`);
    
    if (event === 'message') {
      this.broadcastMessage(data);
    }
  }

  getId(): string {
    return this.id;
  }

  addMember(username: string): void {
    this.members.add(username);
    console.log(`    👥 ${username} joined ${this.name}`);
  }

  removeMember(username: string): void {
    this.members.delete(username);
    console.log(`    👥 ${username} left ${this.name}`);
  }

  private broadcastMessage(data: any): void {
    this.send('broadcast_message', {
      roomId: this.id,
      message: data,
      recipients: Array.from(this.members)
    });
  }
}

// Chat Mediator
class ChatMediator implements Mediator {
  private users: Map<string, User> = new Map();
  private rooms: Map<string, Room> = new Map();

  addUser(user: User): void {
    this.users.set(user.getId(), user);
    user.setMediator(this);
    console.log(`👤 Chat: User ${user.getUsername()} registered`);
  }

  createRoom(room: Room): void {
    this.rooms.set(room.getId(), room);
    room.setMediator(this);
    console.log(`🏠 Chat: Room ${room.getId()} created`);
  }

  notify(sender: Colleague, event: string, data?: any): void {
    console.log(`🎯 Chat: Routing ${event} from ${sender.getId()}`);
    
    switch (event) {
      case 'message':
        this.handleMessage(sender as User, data);
        break;
      case 'direct_message':
        this.handleDirectMessage(sender as User, data);
        break;
      case 'broadcast_message':
        this.handleBroadcastMessage(sender as Room, data);
        break;
    }
  }

  private handleMessage(sender: User, data: any): void {
    const room = this.rooms.get(data.roomId);
    if (room) {
      room.addMember(sender.getUsername());
      room.send('message', data);
    }
  }

  private handleDirectMessage(sender: User, data: any): void {
    const recipient = this.users.get(data.recipientId);
    if (recipient) {
      recipient.send('direct_message', {
        message: `DM from ${sender.getUsername()}: ${data.content}`
      });
    }
  }

  private handleBroadcastMessage(room: Room, data: any): void {
    data.recipients.forEach((username: string) => {
      const user = Array.from(this.users.values()).find(u => u.getUsername() === username);
      if (user) {
        user.send('message', {
          message: `${data.message.sender}: ${data.message.content}`
        });
      }
    });
  }
}

// Demo
console.log('=== CHAT APPLICATION MEDIATOR DEMO ===\n');

// Create mediator
const chatMediator = new ChatMediator();

// Create users
const alice = new User('user-001', 'Alice');
const bob = new User('user-002', 'Bob');
const charlie = new User('user-003', 'Charlie');

// Create room
const generalRoom = new Room('room-001', 'General');

// Register users and room
chatMediator.addUser(alice);
chatMediator.addUser(bob);
chatMediator.addUser(charlie);
chatMediator.createRoom(generalRoom);

console.log('\n--- Chat Interactions ---');

// Send messages in room
alice.sendMessage('Hello everyone!', 'room-001');
bob.sendMessage('Hi Alice!', 'room-001');
charlie.sendMessage('Hey there!', 'room-001');

// Direct message
alice.sendDirectMessage('user-002', 'Bob, can we talk privately?');

console.log('\n✅ Chat application mediation completed successfully');

exit(0); 