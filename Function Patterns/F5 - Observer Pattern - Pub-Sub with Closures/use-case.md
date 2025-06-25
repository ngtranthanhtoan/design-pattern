# Use Case: Real-Time Chat System

## Problem Statement

Modern chat applications require sophisticated event-driven architectures to handle:
- Real-time message broadcasting to multiple participants
- User presence and status updates
- Typing indicators and read receipts
- Room-based message distribution
- Connection state management
- Message history and offline message queuing
- Cross-tab synchronization for web applications

Traditional observer implementations often involve:
- Complex class hierarchies for different event types
- Manual memory management for observer cleanup
- Difficult testing due to tight coupling
- Inconsistent API patterns across different components
- Memory leaks from forgotten unsubscriptions

## Solution: Functional Pub-Sub Chat System

Using functional pub-sub with closures, we can create a clean chat architecture where:
- Each chat room is an independent event emitter with closure state
- Message broadcasting is handled through pure functions
- User subscriptions are automatically cleaned up
- Event types are strongly typed for compile-time safety
- Components can be easily tested in isolation
- Real-time features are composable and reusable

## Implementation Highlights

### Key Features

1. **Room-based Messaging**: Independent event emitters for each chat room
2. **Type-safe Events**: Strongly typed message and status events
3. **Automatic Cleanup**: Unsubscribe functions prevent memory leaks
4. **Presence Management**: Real-time user status and typing indicators
5. **Message History**: Event replay for new participants
6. **Cross-tab Sync**: Shared state management across browser tabs
7. **Offline Support**: Message queuing and synchronization

### Core Components

1. **Chat Room Factory**: Creates isolated chat room instances
2. **Message Broadcasting**: Efficient message distribution to subscribers
3. **User Presence**: Real-time status updates and activity tracking
4. **Event History**: Message storage and replay capabilities
5. **Connection Manager**: WebSocket connection state management
6. **Notification System**: Cross-cutting notification events

### Real-World Applications

- **Team Chat Applications**: Slack, Microsoft Teams, Discord
- **Customer Support**: Live chat widgets and support systems
- **Gaming Chat**: Real-time communication in multiplayer games
- **Social Media**: Comments, reactions, and live updates
- **Collaborative Tools**: Real-time editing and communication
- **Video Conferencing**: Chat alongside video calls

## Benefits Demonstrated

1. **Scalability**: Easy to add new event types and features
2. **Type Safety**: Compile-time guarantees for event contracts
3. **Memory Management**: Automatic cleanup prevents memory leaks
4. **Modularity**: Independent components that can be composed
5. **Performance**: Efficient event distribution with minimal overhead
6. **Testing**: Easy to mock and test individual components
7. **Real-time**: Sub-millisecond event propagation

## Usage Example

```typescript
// Create a chat room
const chatRoom = createChatRoom('general', {
  maxHistory: 1000,
  typing: { timeout: 3000 }
});

// Subscribe to messages
const unsubscribeMessages = chatRoom.onMessage(message => {
  displayMessage(message);
});

// Subscribe to typing indicators
const unsubscribeTyping = chatRoom.onTyping(({ userId, isTyping }) => {
  updateTypingIndicator(userId, isTyping);
});

// Subscribe to user presence
const unsubscribePresence = chatRoom.onUserStatusChange(({ userId, status }) => {
  updateUserStatus(userId, status);
});

// Send a message
chatRoom.sendMessage({
  text: 'Hello everyone!',
  userId: 'user123',
  type: 'text'
});

// Start typing
chatRoom.startTyping('user123');

// Update user status
chatRoom.updateUserStatus('user123', 'online');

// Cleanup when leaving room
const cleanup = () => {
  unsubscribeMessages();
  unsubscribeTyping();
  unsubscribePresence();
};
```

This use case demonstrates how functional pub-sub patterns can create a more maintainable and scalable real-time communication system compared to traditional class-based observer implementations, with better type safety, automatic memory management, and easier testing. 