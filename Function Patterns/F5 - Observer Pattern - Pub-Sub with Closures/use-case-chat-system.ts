import { exit } from "process";

// ============================================================================
// FUNCTIONAL PUB-SUB IMPLEMENTATION
// ============================================================================

/**
 * Event emitter using functional pub-sub with closures.
 * Provides type-safe event handling and automatic cleanup.
 */
class EventEmitter<T extends Record<string, any>> {
  private subscribers: Map<keyof T, Set<(data: any) => void>> = new Map();
  private history: Map<keyof T, any[]> = new Map();
  private maxHistory: number;

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory;
  }

  /**
   * Subscribe to an event type.
   * @returns Unsubscribe function for cleanup
   */
  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
      this.history.set(event, []);
    }

    const eventSubscribers = this.subscribers.get(event)!;
    eventSubscribers.add(callback);

    // Send historical events to new subscriber
    const history = this.history.get(event)!;
    history.forEach(data => callback(data));

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(event);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  /**
   * Emit an event to all subscribers.
   */
  emit<K extends keyof T>(event: K, data: T[K]): void {
    const subscribers = this.subscribers.get(event);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${String(event)}:`, error);
        }
      });
    }

    // Store in history
    const history = this.history.get(event) || [];
    history.push(data);
    if (history.length > this.maxHistory) {
      history.shift();
    }
    this.history.set(event, history);
  }

  /**
   * Get current subscriber count for an event.
   */
  getSubscriberCount<K extends keyof T>(event: K): number {
    return this.subscribers.get(event)?.size || 0;
  }

  /**
   * Clear all subscribers for an event.
   */
  clear<K extends keyof T>(event: K): void {
    this.subscribers.delete(event);
    this.history.delete(event);
  }

  /**
   * Clear all subscribers and history.
   */
  clearAll(): void {
    this.subscribers.clear();
    this.history.clear();
  }
}

// ============================================================================
// CHAT SYSTEM TYPES AND INTERFACES
// ============================================================================

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    fileUrl?: string;
    fileSize?: number;
    imageUrl?: string;
    replyTo?: string;
  };
}

interface UserStatus {
  userId: string;
  userName: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  avatar?: string;
}

interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  roomId: string;
}

interface ChatRoomEvents {
  message: ChatMessage;
  userJoined: UserStatus;
  userLeft: UserStatus;
  userStatusChange: UserStatus;
  typingStart: TypingIndicator;
  typingStop: TypingIndicator;
  roomInfo: {
    roomId: string;
    name: string;
    participantCount: number;
    maxParticipants: number;
  };
}

// ============================================================================
// CHAT ROOM IMPLEMENTATION
// ============================================================================

interface ChatRoomConfig {
  maxHistory: number;
  typing: {
    timeout: number;
  };
  presence: {
    timeout: number;
  };
}

class ChatRoom {
  private emitter: EventEmitter<ChatRoomEvents>;
  private config: ChatRoomConfig;
  private participants: Map<string, UserStatus> = new Map();
  private typingUsers: Map<string, NodeJS.Timeout> = new Map();
  private roomId: string;
  private roomName: string;

  constructor(roomId: string, roomName: string, config: ChatRoomConfig) {
    this.roomId = roomId;
    this.roomName = roomName;
    this.config = config;
    this.emitter = new EventEmitter<ChatRoomEvents>(config.maxHistory);
  }

  /**
   * Subscribe to chat messages.
   */
  onMessage(callback: (message: ChatMessage) => void): () => void {
    return this.emitter.on('message', callback);
  }

  /**
   * Subscribe to user join events.
   */
  onUserJoined(callback: (user: UserStatus) => void): () => void {
    return this.emitter.on('userJoined', callback);
  }

  /**
   * Subscribe to user leave events.
   */
  onUserLeft(callback: (user: UserStatus) => void): () => void {
    return this.emitter.on('userLeft', callback);
  }

  /**
   * Subscribe to user status changes.
   */
  onUserStatusChange(callback: (user: UserStatus) => void): () => void {
    return this.emitter.on('userStatusChange', callback);
  }

  /**
   * Subscribe to typing indicators.
   */
  onTyping(callback: (indicator: TypingIndicator) => void): () => void {
    return this.emitter.on('typingStart', callback);
  }

  /**
   * Subscribe to typing stop events.
   */
  onTypingStop(callback: (indicator: TypingIndicator) => void): () => void {
    return this.emitter.on('typingStop', callback);
  }

  /**
   * Subscribe to room info updates.
   */
  onRoomInfo(callback: (info: ChatRoomEvents['roomInfo']) => void): () => void {
    return this.emitter.on('roomInfo', callback);
  }

  /**
   * Send a message to the room.
   */
  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const fullMessage: ChatMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.emitter.emit('message', fullMessage);
  }

  /**
   * Join the room.
   */
  join(user: Omit<UserStatus, 'lastSeen'>): void {
    const userStatus: UserStatus = {
      ...user,
      lastSeen: new Date()
    };

    this.participants.set(user.userId, userStatus);
    this.emitter.emit('userJoined', userStatus);
    this.updateRoomInfo();
  }

  /**
   * Leave the room.
   */
  leave(userId: string): void {
    const user = this.participants.get(userId);
    if (user) {
      this.participants.delete(userId);
      this.emitter.emit('userLeft', { ...user, status: 'offline' });
      this.updateRoomInfo();
    }
  }

  /**
   * Update user status.
   */
  updateUserStatus(userId: string, status: UserStatus['status']): void {
    const user = this.participants.get(userId);
    if (user) {
      const updatedUser: UserStatus = {
        ...user,
        status,
        lastSeen: new Date()
      };
      this.participants.set(userId, updatedUser);
      this.emitter.emit('userStatusChange', updatedUser);
    }
  }

  /**
   * Start typing indicator.
   */
  startTyping(userId: string, userName: string): void {
    // Clear existing typing timeout
    const existingTimeout = this.typingUsers.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Emit typing start
    this.emitter.emit('typingStart', {
      userId,
      userName,
      isTyping: true,
      roomId: this.roomId
    });

    // Set timeout to stop typing
    const timeout = setTimeout(() => {
      this.stopTyping(userId, userName);
    }, this.config.typing.timeout);

    this.typingUsers.set(userId, timeout);
  }

  /**
   * Stop typing indicator.
   */
  stopTyping(userId: string, userName: string): void {
    const timeout = this.typingUsers.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      this.typingUsers.delete(userId);
    }

    this.emitter.emit('typingStop', {
      userId,
      userName,
      isTyping: false,
      roomId: this.roomId
    });
  }

  /**
   * Get current participants.
   */
  getParticipants(): UserStatus[] {
    return Array.from(this.participants.values());
  }

  /**
   * Get room information.
   */
  getRoomInfo(): ChatRoomEvents['roomInfo'] {
    return {
      roomId: this.roomId,
      name: this.roomName,
      participantCount: this.participants.size,
      maxParticipants: 100 // Could be configurable
    };
  }

  /**
   * Update room info and emit to subscribers.
   */
  private updateRoomInfo(): void {
    this.emitter.emit('roomInfo', this.getRoomInfo());
  }

  /**
   * Generate unique message ID.
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// CHAT ROOM FACTORY
// ============================================================================

const createChatRoom = (roomId: string, roomName: string, config: ChatRoomConfig = {
  maxHistory: 1000,
  typing: { timeout: 3000 },
  presence: { timeout: 30000 }
}): ChatRoom => {
  return new ChatRoom(roomId, roomName, config);
};

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

const demonstrateBasicChat = () => {
  console.log("\n=== Basic Chat Functionality ===");
  
  const chatRoom = createChatRoom('general', 'General Chat');
  
  // Subscribe to messages
  const unsubscribeMessages = chatRoom.onMessage(message => {
    console.log(`[${message.timestamp.toLocaleTimeString()}] ${message.userName}: ${message.text}`);
  });
  
  // Subscribe to user events
  const unsubscribeJoins = chatRoom.onUserJoined(user => {
    console.log(`👋 ${user.userName} joined the room`);
  });
  
  const unsubscribeLeaves = chatRoom.onUserLeft(user => {
    console.log(`👋 ${user.userName} left the room`);
  });
  
  // Join users
  chatRoom.join({ userId: 'user1', userName: 'Alice', status: 'online' as const });
  chatRoom.join({ userId: 'user2', userName: 'Bob', status: 'online' as const });
  
  // Send messages
  chatRoom.sendMessage({
    text: 'Hello everyone!',
    userId: 'user1',
    userName: 'Alice',
    type: 'text'
  });
  
  chatRoom.sendMessage({
    text: 'Hi Alice! How are you?',
    userId: 'user2',
    userName: 'Bob',
    type: 'text'
  });
  
  // Leave room
  chatRoom.leave('user1');
  
  // Cleanup
  setTimeout(() => {
    unsubscribeMessages();
    unsubscribeJoins();
    unsubscribeLeaves();
  }, 1000);
};

const demonstrateTypingIndicators = () => {
  console.log("\n=== Typing Indicators ===");
  
  const chatRoom = createChatRoom('typing-demo', 'Typing Demo');
  
  // Subscribe to typing events
  const unsubscribeTyping = chatRoom.onTyping(indicator => {
    if (indicator.isTyping) {
      console.log(`⌨️  ${indicator.userName} is typing...`);
    }
  });
  
  const unsubscribeTypingStop = chatRoom.onTypingStop(indicator => {
    console.log(`✅ ${indicator.userName} stopped typing`);
  });
  
  // Join users
  chatRoom.join({ userId: 'user1', userName: 'Alice', status: 'online' as const });
  chatRoom.join({ userId: 'user2', userName: 'Bob', status: 'online' as const });
  
  // Simulate typing
  chatRoom.startTyping('user1', 'Alice');
  
  setTimeout(() => {
    chatRoom.sendMessage({
      text: 'This is a long message that took some time to type...',
      userId: 'user1',
      userName: 'Alice',
      type: 'text'
    });
  }, 2000);
  
  // Cleanup
  setTimeout(() => {
    unsubscribeTyping();
    unsubscribeTypingStop();
  }, 5000);
};

const demonstrateUserStatus = () => {
  console.log("\n=== User Status Management ===");
  
  const chatRoom = createChatRoom('status-demo', 'Status Demo');
  
  // Subscribe to status changes
  const unsubscribeStatus = chatRoom.onUserStatusChange(user => {
    console.log(`👤 ${user.userName} is now ${user.status}`);
  });
  
  // Subscribe to room info
  const unsubscribeRoomInfo = chatRoom.onRoomInfo(info => {
    console.log(`📊 Room: ${info.name} (${info.participantCount}/${info.maxParticipants} participants)`);
  });
  
  // Join users
  chatRoom.join({ userId: 'user1', userName: 'Alice', status: 'online' as const });
  chatRoom.join({ userId: 'user2', userName: 'Bob', status: 'online' as const });
  chatRoom.join({ userId: 'user3', userName: 'Charlie', status: 'online' as const });
  
  // Update statuses
  setTimeout(() => {
    chatRoom.updateUserStatus('user1', 'away');
  }, 1000);
  
  setTimeout(() => {
    chatRoom.updateUserStatus('user2', 'busy');
  }, 2000);
  
  setTimeout(() => {
    chatRoom.updateUserStatus('user1', 'online');
  }, 3000);
  
  // Cleanup
  setTimeout(() => {
    unsubscribeStatus();
    unsubscribeRoomInfo();
  }, 5000);
};

const demonstrateMessageHistory = () => {
  console.log("\n=== Message History ===");
  
  const chatRoom = createChatRoom('history-demo', 'History Demo', {
    maxHistory: 5,
    typing: { timeout: 3000 },
    presence: { timeout: 30000 }
  });
  
  // Join user
  chatRoom.join({ userId: 'user1', userName: 'Alice', status: 'online' as const });
  
  // Send messages
  for (let i = 1; i <= 7; i++) {
    chatRoom.sendMessage({
      text: `Message ${i}`,
      userId: 'user1',
      userName: 'Alice',
      type: 'text'
    });
  }
  
  // Subscribe to messages (should receive only the last 5 due to maxHistory)
  const unsubscribeMessages = chatRoom.onMessage(message => {
    console.log(`📝 ${message.text}`);
  });
  
  // Cleanup
  setTimeout(() => {
    unsubscribeMessages();
  }, 1000);
};

const demonstrateMultipleRooms = () => {
  console.log("\n=== Multiple Chat Rooms ===");
  
  const generalRoom = createChatRoom('general', 'General');
  const techRoom = createChatRoom('tech', 'Tech Discussion');
  const randomRoom = createChatRoom('random', 'Random');
  
  // User joins multiple rooms
  const user = { userId: 'user1', userName: 'Alice', status: 'online' as const };
  
  generalRoom.join(user);
  techRoom.join(user);
  randomRoom.join(user);
  
  // Subscribe to messages in all rooms
  const unsubscribeGeneral = generalRoom.onMessage(message => {
    console.log(`[General] ${message.userName}: ${message.text}`);
  });
  
  const unsubscribeTech = techRoom.onMessage(message => {
    console.log(`[Tech] ${message.userName}: ${message.text}`);
  });
  
  const unsubscribeRandom = randomRoom.onMessage(message => {
    console.log(`[Random] ${message.userName}: ${message.text}`);
  });
  
  // Send messages to different rooms
  generalRoom.sendMessage({
    text: 'Hello everyone in general!',
    userId: 'user1',
    userName: 'Alice',
    type: 'text'
  });
  
  techRoom.sendMessage({
    text: 'Anyone interested in TypeScript?',
    userId: 'user1',
    userName: 'Alice',
    type: 'text'
  });
  
  randomRoom.sendMessage({
    text: 'Random thought of the day!',
    userId: 'user1',
    userName: 'Alice',
    type: 'text'
  });
  
  // Cleanup
  setTimeout(() => {
    unsubscribeGeneral();
    unsubscribeTech();
    unsubscribeRandom();
  }, 1000);
};

const demonstrateErrorHandling = () => {
  console.log("\n=== Error Handling ===");
  
  const chatRoom = createChatRoom('error-demo', 'Error Demo');
  
  // Subscribe with error-prone handler
  const unsubscribeMessages = chatRoom.onMessage(message => {
    if (message.text.includes('error')) {
      throw new Error('Simulated error in message handler');
    }
    console.log(`✅ ${message.userName}: ${message.text}`);
  });
  
  // Join user
  chatRoom.join({ userId: 'user1', userName: 'Alice', status: 'online' as const });
  
  // Send messages (one will cause error)
  chatRoom.sendMessage({
    text: 'This is a normal message',
    userId: 'user1',
    userName: 'Alice',
    type: 'text'
  });
  
  chatRoom.sendMessage({
    text: 'This message contains error',
    userId: 'user1',
    userName: 'Alice',
    type: 'text'
  });
  
  chatRoom.sendMessage({
    text: 'This message should still work',
    userId: 'user1',
    userName: 'Alice',
    type: 'text'
  });
  
  // Cleanup
  setTimeout(() => {
    unsubscribeMessages();
  }, 1000);
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = () => {
  console.log("💬 Observer Pattern: Real-Time Chat System");
  console.log("=".repeat(60));
  
  try {
    demonstrateBasicChat();
    demonstrateTypingIndicators();
    demonstrateUserStatus();
    demonstrateMessageHistory();
    demonstrateMultipleRooms();
    demonstrateErrorHandling();
    
    console.log("\n✅ All Observer pattern examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running Observer examples:", error);
  }
};

// Run the examples
main();

exit(0); 