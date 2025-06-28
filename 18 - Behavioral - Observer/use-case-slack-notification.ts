import { exit } from 'process';

// Observer Pattern – Slack Notification Use Case
// Demonstrates how a Slack-like workspace notifies different observers (user clients, channels, bots)
// about real-time events such as messages, mentions, reactions, and file sharing.
// ---------------------------------------------------

/*************************
 * 1. Common Interfaces  *
 *************************/

// Observer interface
interface Observer {
  update(event: SlackEvent): void;
}

// Subject interface
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(event: SlackEvent): void;
}

// Event types that can occur in the workspace
export type SlackEventType =
  | 'message'
  | 'mention'
  | 'reaction_added'
  | 'reaction_removed'
  | 'file_shared'
  | 'channel_joined'
  | 'thread_reply'
  | 'app_mention';

// Core event structure delivered to observers
export interface SlackEvent {
  id: string;
  type: SlackEventType;
  timestamp: Date;
  channelId: string;
  userId: string;
  content?: string; // Message text, reply text, etc.
  targetUserId?: string; // For mentions/reactions
  parentMessageId?: string; // For threads/replies/reactions
  reaction?: string; // :emoji:
  fileUrl?: string;
  [key: string]: any;
}

/*************************
 * 2. Subject – Workspace *
 *************************/

class SlackWorkspace implements Subject {
  private observers: Set<Observer> = new Set();
  private eventCounter = 0;

  constructor(public readonly name: string) {}

  attach(observer: Observer): void {
    this.observers.add(observer);
    console.log(`👀 ${observer.constructor.name} subscribed to workspace ${this.name}`);
  }

  detach(observer: Observer): void {
    if (this.observers.delete(observer)) {
      console.log(`🚫 ${observer.constructor.name} unsubscribed from workspace ${this.name}`);
    }
  }

  notify(event: SlackEvent): void {
    // Deliver the event to all observers – each can decide whether to react
    this.observers.forEach(obs => {
      try {
        obs.update(event);
      } catch (err) {
        console.error(`❌ Error notifying ${obs.constructor.name}:`, err);
      }
    });
  }

  // Utility to create events
  private createEvent(partial: Omit<SlackEvent, 'id' | 'timestamp'>): SlackEvent {
    return {
      id: `evt-${++this.eventCounter}`,
      timestamp: new Date(),
      ...partial
    } as SlackEvent;
  }

  /*********************
   * Workspace actions *
   *********************/

  sendMessage(userId: string, channelId: string, content: string): void {
    const evt = this.createEvent({ type: 'message', userId, channelId, content });
    console.log(`💬 [${channelId}] ${userId}: ${content}`);
    this.notify(evt);
  }

  mentionUser(userId: string, channelId: string, targetUserId: string, content: string): void {
    const evt = this.createEvent({ type: 'mention', userId, channelId, targetUserId, content });
    console.log(`📢 [${channelId}] ${userId} mentioned ${targetUserId}: ${content}`);
    this.notify(evt);
  }

  addReaction(userId: string, channelId: string, parentMessageId: string, reaction: string): void {
    const evt = this.createEvent({
      type: 'reaction_added',
      userId,
      channelId,
      parentMessageId,
      reaction
    });
    console.log(`➕ ${userId} reacted ${reaction} to ${parentMessageId}`);
    this.notify(evt);
  }

  shareFile(userId: string, channelId: string, fileUrl: string): void {
    const evt = this.createEvent({ type: 'file_shared', userId, channelId, fileUrl });
    console.log(`📎 ${userId} shared file in ${channelId}: ${fileUrl}`);
    this.notify(evt);
  }
}

/*************************
 * 3. Observer – Clients *
 *************************/

// User desktop/mobile client
class SlackUserClient implements Observer {
  private readonly joinedChannels: Set<string> = new Set();
  private readonly mutedChannels: Set<string> = new Set();
  private readonly notifications: SlackEvent[] = [];

  constructor(private readonly userId: string, private readonly displayName: string) {}

  joinChannel(channelId: string): void {
    this.joinedChannels.add(channelId);
  }

  muteChannel(channelId: string): void {
    this.mutedChannels.add(channelId);
  }

  update(event: SlackEvent): void {
    const { type, channelId, userId, targetUserId } = event;

    // Determine interest
    const isMember = this.joinedChannels.has(channelId);
    const isMention = type === 'mention' && targetUserId === this.userId;
    const isDm = channelId === this.userId; // simplistic DM rule

    if (!isMember && !isMention && !isDm) return; // Irrelevant

    if (this.mutedChannels.has(channelId) && !isMention && !isDm) return; // Muted

    // store & display
    this.notifications.push(event);
    this.displayNotification(event);
  }

  private displayNotification(event: SlackEvent): void {
    const time = event.timestamp.toLocaleTimeString();
    switch (event.type) {
      case 'message':
        console.log(`🔔 [${time}] ${this.displayName} received message in ${event.channelId}: ${event.content}`);
        break;
      case 'mention':
        console.log(`📣 [${time}] ${this.displayName} mentioned by ${event.userId} in ${event.channelId}: ${event.content}`);
        break;
      case 'reaction_added':
        if (event.parentMessageId)
          console.log(`😊 [${time}] ${this.displayName} sees reaction ${event.reaction} on ${event.parentMessageId}`);
        break;
      case 'file_shared':
        console.log(`📎 [${time}] ${this.displayName} sees file shared: ${event.fileUrl}`);
        break;
    }
  }

  getNotifications(): SlackEvent[] {
    return [...this.notifications];
  }

  getUserId(): string {
    return this.userId;
  }
}

// Channel dashboard (e.g., admin analytics screen)
class ChannelDashboard implements Observer {
  private messageCount = 0;
  private reactionCount = 0;

  constructor(private readonly channelId: string) {}

  update(event: SlackEvent): void {
    if (event.channelId !== this.channelId) return;

    switch (event.type) {
      case 'message':
        this.messageCount++;
        break;
      case 'reaction_added':
        this.reactionCount++;
        break;
    }
  }

  report(): void {
    console.log(`📊 Stats for #${this.channelId}: messages=${this.messageCount}, reactions=${this.reactionCount}`);
  }
}

// Central logging bot
class SlackLoggingBot implements Observer {
  private logs: SlackEvent[] = [];

  update(event: SlackEvent): void {
    this.logs.push(event);
    // Keep log size reasonable
    if (this.logs.length > 200) this.logs.shift();
  }

  query(type?: SlackEventType): SlackEvent[] {
    return type ? this.logs.filter(l => l.type === type) : [...this.logs];
  }
}

// Simple analytics collector
class SlackAnalytics implements Observer {
  private counts: Record<SlackEventType, number> = {
    message: 0,
    mention: 0,
    reaction_added: 0,
    reaction_removed: 0,
    file_shared: 0,
    channel_joined: 0,
    thread_reply: 0,
    app_mention: 0 // Not used in this simplified demo
  } as Record<SlackEventType, number>;

  update(event: SlackEvent): void {
    this.counts[event.type] = (this.counts[event.type] || 0) + 1;
  }

  report(): void {
    console.log('📈 Event counts:', this.counts);
  }
}

/*************************
 * 4. Demonstration Flow *
 *************************/

console.log('=== SLACK NOTIFICATION DEMO ===');

const workspace = new SlackWorkspace('AwesomeCo');

// Observers
const aliceClient = new SlackUserClient('U1', 'Alice');
const bobClient = new SlackUserClient('U2', 'Bob');
const eveClient = new SlackUserClient('U3', 'Eve');

// Users join channels
aliceClient.joinChannel('general');
aliceClient.joinChannel('dev');

bobClient.joinChannel('general');

eveClient.joinChannel('random');

// Attach to workspace
workspace.attach(aliceClient);
workspace.attach(bobClient);
workspace.attach(eveClient);

const generalDashboard = new ChannelDashboard('general');
workspace.attach(generalDashboard);

const loggerBot = new SlackLoggingBot();
workspace.attach(loggerBot);

const analytics = new SlackAnalytics();
workspace.attach(analytics);

console.log('\n--- Conversation ---');
workspace.sendMessage('U1', 'general', 'Hey team, stand-up in 10 minutes.');
workspace.sendMessage('U2', 'general', 'Roger that!');
workspace.mentionUser('U2', 'general', 'U1', 'Alice, can you review my PR?');

workspace.sendMessage('U1', 'dev', 'Pushed new feature branch.');
workspace.addReaction('U2', 'general', 'evt-1', ':thumbsup:');
workspace.shareFile('U3', 'random', 'https://cats.example/cute.png');

console.log('\n--- Reports ---');

generalDashboard.report();
analytics.report();

console.log('\n--- Alice Notifications ---');
console.log(aliceClient.getNotifications().map(e => `${e.type} in ${e.channelId}`));

console.log('\n✅ Slack notification demo completed');

exit(0); 