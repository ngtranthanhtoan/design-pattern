import { exit } from 'process';

// Observer interface
interface Observer {
  update(user: User, post: Post): void;
}

// Subject interface
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(post: Post): void;
}

// Post data interface
interface Post {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'link';
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  hashtags: string[];
  mentions: string[];
}

// User data interface
interface UserData {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  followers: Set<string>;
  following: Set<string>;
  posts: Post[];
  isPrivate: boolean;
  notificationPreferences: {
    posts: boolean;
    likes: boolean;
    comments: boolean;
    mentions: boolean;
  };
}

// User (Subject)
class User implements Subject {
  private observers: Set<Observer> = new Set();
  private data: UserData;
  private postCounter: number = 0;

  constructor(id: string, username: string, displayName: string, bio: string = '') {
    this.data = {
      id,
      username,
      displayName,
      bio,
      followers: new Set(),
      following: new Set(),
      posts: [],
      isPrivate: false,
      notificationPreferences: {
        posts: true,
        likes: true,
        comments: true,
        mentions: true
      }
    };
  }

  attach(observer: Observer): void {
    this.observers.add(observer);
    console.log(`📱 ${observer.constructor.name} subscribed to ${this.data.username}`);
  }

  detach(observer: Observer): void {
    this.observers.delete(observer);
    console.log(`📱 ${observer.constructor.name} unsubscribed from ${this.data.username}`);
  }

  notify(post: Post): void {
    console.log(`🔔 ${this.data.username} notifying ${this.observers.size} observers about new post`);
    this.observers.forEach(observer => {
      try {
        observer.update(this, post);
      } catch (error) {
        console.error(`❌ Error notifying ${observer.constructor.name}:`, error);
      }
    });
  }

  createPost(content: string, type: Post['type'] = 'text', hashtags: string[] = [], mentions: string[] = []): Post {
    const post: Post = {
      id: `post-${++this.postCounter}`,
      content,
      type,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      hashtags,
      mentions
    };

    this.data.posts.push(post);
    console.log(`📝 ${this.data.username} created a new ${type} post: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    
    this.notify(post);
    return post;
  }

  follow(user: User): void {
    if (user.data.id !== this.data.id) {
      this.data.following.add(user.data.id);
      user.data.followers.add(this.data.id);
      console.log(`👥 ${this.data.username} started following ${user.data.username}`);
    }
  }

  unfollow(user: User): void {
    this.data.following.delete(user.data.id);
    user.data.followers.delete(this.data.id);
    console.log(`👋 ${this.data.username} unfollowed ${user.data.username}`);
  }

  likePost(post: Post): void {
    post.likes++;
    console.log(`❤️ ${this.data.username} liked a post`);
  }

  commentOnPost(post: Post, comment: string): void {
    post.comments++;
    console.log(`💬 ${this.data.username} commented on a post: "${comment.substring(0, 30)}${comment.length > 30 ? '...' : ''}"`);
  }

  sharePost(post: Post): void {
    post.shares++;
    console.log(`📤 ${this.data.username} shared a post`);
  }

  getData(): UserData {
    return {
      ...this.data,
      followers: new Set(this.data.followers),
      following: new Set(this.data.following),
      posts: [...this.data.posts]
    };
  }

  getUsername(): string {
    return this.data.username;
  }

  getFollowers(): Set<string> {
    return new Set(this.data.followers);
  }

  getPosts(): Post[] {
    return [...this.data.posts];
  }
}

// Follower (Observer)
class Follower implements Observer {
  private name: string;
  private feed: Post[] = [];
  private followedUsers: Set<string> = new Set();
  private contentPreferences: {
    types: Post['type'][];
    hashtags: string[];
    maxPostsPerDay: number;
  };

  constructor(name: string, preferences: { types: Post['type'][]; hashtags: string[]; maxPostsPerDay: number }) {
    this.name = name;
    this.contentPreferences = preferences;
  }

  update(user: User, post: Post): void {
    const username = user.getUsername();
    
    if (this.followedUsers.has(username)) {
      console.log(`👤 ${this.name} received update from ${username}: "${post.content.substring(0, 30)}${post.content.length > 30 ? '...' : ''}"`);
      
      // Check content preferences
      if (this.shouldShowPost(post)) {
        this.addToFeed(post);
        this.processPost(post);
      } else {
        console.log(`🚫 ${this.name} filtered out post from ${username} (doesn't match preferences)`);
      }
    }
  }

  private shouldShowPost(post: Post): boolean {
    // Check if post type is preferred
    if (!this.contentPreferences.types.includes(post.type)) {
      return false;
    }

    // Check if post has preferred hashtags
    if (this.contentPreferences.hashtags.length > 0) {
      const hasPreferredHashtag = post.hashtags.some(tag => 
        this.contentPreferences.hashtags.includes(tag)
      );
      if (!hasPreferredHashtag) {
        return false;
      }
    }

    // Check daily post limit
    const todayPosts = this.feed.filter(p => 
      p.timestamp.toDateString() === new Date().toDateString()
    );
    if (todayPosts.length >= this.contentPreferences.maxPostsPerDay) {
      return false;
    }

    return true;
  }

  private addToFeed(post: Post): void {
    this.feed.unshift(post); // Add to beginning of feed
    console.log(`📰 ${this.name} added post to feed (${this.feed.length} total posts)`);
  }

  private processPost(post: Post): void {
    // Simulate user engagement based on content
    const engagement = Math.random();
    
    if (engagement > 0.7) {
      console.log(`❤️ ${this.name} liked the post`);
    } else if (engagement > 0.5) {
      console.log(`💬 ${this.name} might comment on this post`);
    } else if (engagement > 0.3) {
      console.log(`👀 ${this.name} viewed the post`);
    }
  }

  followUser(user: User): void {
    this.followedUsers.add(user.getUsername());
    console.log(`👥 ${this.name} started following ${user.getUsername()}`);
  }

  unfollowUser(user: User): void {
    this.followedUsers.delete(user.getUsername());
    console.log(`👋 ${this.name} unfollowed ${user.getUsername()}`);
  }

  getFeed(): Post[] {
    return [...this.feed];
  }

  getName(): string {
    return this.name;
  }
}

// Notification Service (Observer)
class NotificationService implements Observer {
  private notifications: Array<{ user: string; message: string; timestamp: Date; type: string }> = [];
  private notificationTypes: Set<string> = new Set(['posts', 'likes', 'comments', 'mentions']);

  update(user: User, post: Post): void {
    const username = user.getUsername();
    const userData = user.getData();
    
    // Notify followers about new post
    userData.followers.forEach(followerId => {
      this.sendNotification(followerId, `New post from ${username}: "${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}"`, 'posts');
    });

    // Check for mentions
    post.mentions.forEach(mention => {
      this.sendNotification(mention, `${username} mentioned you in a post`, 'mentions');
    });

    console.log(`📧 NotificationService sent notifications for ${username}'s post`);
  }

  private sendNotification(userId: string, message: string, type: string): void {
    const notification = {
      user: userId,
      message,
      timestamp: new Date(),
      type
    };
    
    this.notifications.push(notification);
    
    // Simulate different notification methods
    this.sendPushNotification(userId, message);
    this.sendEmail(userId, message);
  }

  private sendPushNotification(userId: string, message: string): void {
    console.log(`📱 Push notification to ${userId}: ${message}`);
  }

  private sendEmail(userId: string, message: string): void {
    console.log(`📧 Email to ${userId}: ${message}`);
  }

  getNotifications(): Array<{ user: string; message: string; timestamp: Date; type: string }> {
    return [...this.notifications];
  }

  getNotificationsByUser(userId: string): Array<{ user: string; message: string; timestamp: Date; type: string }> {
    return this.notifications.filter(n => n.user === userId);
  }
}

// Content Filter (Observer)
class ContentFilter implements Observer {
  private blockedWords: Set<string> = new Set(['spam', 'inappropriate', 'blocked']);
  private flaggedPosts: Array<{ post: Post; reason: string; timestamp: Date }> = [];
  private moderationQueue: Post[] = [];

  update(user: User, post: Post): void {
    const username = user.getUsername();
    
    console.log(`🔍 ContentFilter analyzing post from ${username}`);
    
    // Check for blocked words
    const hasBlockedWords = this.blockedWords.has(post.content.toLowerCase());
    if (hasBlockedWords) {
      this.flagPost(post, 'Contains blocked words');
      console.log(`🚫 Post from ${username} flagged for blocked words`);
      return;
    }

    // Check for excessive hashtags
    if (post.hashtags.length > 5) {
      this.flagPost(post, 'Too many hashtags');
      console.log(`⚠️ Post from ${username} flagged for excessive hashtags`);
      return;
    }

    // Check for spam patterns
    if (this.isSpam(post)) {
      this.flagPost(post, 'Spam detected');
      console.log(`🚫 Post from ${username} flagged as spam`);
      return;
    }

    console.log(`✅ Post from ${username} passed content filter`);
  }

  private isSpam(post: Post): boolean {
    // Simple spam detection: repeated characters, excessive caps, etc.
    const content = post.content;
    const repeatedChars = /(.)\1{4,}/; // 5 or more repeated characters
    const excessiveCaps = /[A-Z]{10,}/; // 10 or more consecutive caps
    
    return repeatedChars.test(content) || excessiveCaps.test(content);
  }

  private flagPost(post: Post, reason: string): void {
    this.flaggedPosts.push({
      post,
      reason,
      timestamp: new Date()
    });
    
    this.moderationQueue.push(post);
  }

  getFlaggedPosts(): Array<{ post: Post; reason: string; timestamp: Date }> {
    return [...this.flaggedPosts];
  }

  getModerationQueue(): Post[] {
    return [...this.moderationQueue];
  }

  addBlockedWord(word: string): void {
    this.blockedWords.add(word.toLowerCase());
    console.log(`🚫 Added "${word}" to blocked words list`);
  }

  removeBlockedWord(word: string): void {
    this.blockedWords.delete(word.toLowerCase());
    console.log(`✅ Removed "${word}" from blocked words list`);
  }
}

// Social Media Platform
class SocialMediaPlatform {
  private users: Map<string, User> = new Map();
  private followers: Follower[] = [];
  private notificationService: NotificationService;
  private contentFilter: ContentFilter;

  constructor() {
    this.notificationService = new NotificationService();
    this.contentFilter = new ContentFilter();
  }

  registerUser(id: string, username: string, displayName: string, bio: string = ''): User {
    const user = new User(id, username, displayName, bio);
    this.users.set(id, user);
    
    // Subscribe to notifications and content filtering
    user.attach(this.notificationService);
    user.attach(this.contentFilter);
    
    console.log(`👤 Registered user: ${username}`);
    return user;
  }

  addFollower(follower: Follower): void {
    this.followers.push(follower);
    console.log(`👥 Added follower: ${follower.getName()}`);
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getNotificationService(): NotificationService {
    return this.notificationService;
  }

  getContentFilter(): ContentFilter {
    return this.contentFilter;
  }
}

// Demo
console.log('=== SOCIAL MEDIA FEED DEMO ===\n');

// Create social media platform
const platform = new SocialMediaPlatform();

// Create users
const alice = platform.registerUser('1', 'alice_tech', 'Alice Johnson', 'Tech enthusiast and developer');
const bob = platform.registerUser('2', 'bob_photography', 'Bob Smith', 'Professional photographer');
const carol = platform.registerUser('3', 'carol_fitness', 'Carol Davis', 'Fitness coach and wellness advocate');
const david = platform.registerUser('4', 'david_food', 'David Wilson', 'Food blogger and chef');

// Create followers with different preferences
const techFollower = new Follower('Tech Enthusiast', {
  types: ['text', 'link'],
  hashtags: ['tech', 'programming', 'ai'],
  maxPostsPerDay: 10
});

const photoFollower = new Follower('Photo Lover', {
  types: ['image', 'video'],
  hashtags: ['photography', 'art', 'nature'],
  maxPostsPerDay: 5
});

const fitnessFollower = new Follower('Fitness Fanatic', {
  types: ['text', 'image', 'video'],
  hashtags: ['fitness', 'workout', 'health'],
  maxPostsPerDay: 8
});

const foodFollower = new Follower('Foodie', {
  types: ['image', 'text'],
  hashtags: ['food', 'cooking', 'recipe'],
  maxPostsPerDay: 6
});

// Add followers to platform
platform.addFollower(techFollower);
platform.addFollower(photoFollower);
platform.addFollower(fitnessFollower);
platform.addFollower(foodFollower);

// Set up following relationships
console.log('=== SETTING UP FOLLOWING RELATIONSHIPS ===');

techFollower.followUser(alice);
techFollower.followUser(bob);

photoFollower.followUser(bob);
photoFollower.followUser(carol);

fitnessFollower.followUser(carol);
fitnessFollower.followUser(david);

foodFollower.followUser(david);
foodFollower.followUser(alice);

// Users follow each other
alice.follow(bob);
alice.follow(carol);
bob.follow(alice);
bob.follow(carol);
carol.follow(david);
david.follow(alice);

console.log('\n=== CREATING POSTS ===');

// Alice creates tech posts
alice.createPost('Just finished building a new AI chatbot! The possibilities are endless. #tech #ai #programming', 'text', ['tech', 'ai', 'programming']);
alice.createPost('Check out this amazing article about machine learning: https://example.com/ml-article', 'link', ['tech', 'machine-learning']);

// Bob creates photography posts
bob.createPost('Beautiful sunset captured today! Nature never fails to amaze. #photography #nature #sunset', 'text', ['photography', 'nature', 'sunset']);
bob.createPost('Behind the scenes of my latest photo shoot. #photography #behindthescenes', 'image', ['photography', 'behindthescenes']);

// Carol creates fitness posts
carol.createPost('Morning workout complete! 30 minutes of cardio and strength training. #fitness #workout #morning', 'text', ['fitness', 'workout', 'morning']);
carol.createPost('New yoga routine for beginners. Try this at home! #fitness #yoga #beginner', 'video', ['fitness', 'yoga', 'beginner']);

// David creates food posts
david.createPost('Homemade pasta with fresh ingredients! Recipe in comments. #food #cooking #pasta', 'text', ['food', 'cooking', 'pasta']);
david.createPost('Today\'s special: Grilled salmon with herbs. #food #cooking #salmon', 'image', ['food', 'cooking', 'salmon']);

// Test content filtering
console.log('\n=== TESTING CONTENT FILTERING ===');

const spamUser = platform.registerUser('5', 'spam_bot', 'Spam Bot', '');
spamUser.createPost('BUY NOW!!! AMAZING OFFER!!! LIMITED TIME!!! SPAM SPAM SPAM!!!', 'text', ['spam', 'offer']);
spamUser.createPost('This is inappropriate content that should be blocked', 'text', ['inappropriate']);

// Test mentions
alice.createPost('Great photo @bob_photography! Love your work! #photography', 'text', ['photography'], ['bob_photography']);

console.log('\n=== DEMONSTRATING FEED UPDATES ===');

// Show follower feeds
console.log('\n📰 Tech Enthusiast Feed:');
techFollower.getFeed().slice(0, 3).forEach(post => {
  console.log(`- ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`);
});

console.log('\n📰 Photo Lover Feed:');
photoFollower.getFeed().slice(0, 3).forEach(post => {
  console.log(`- ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`);
});

console.log('\n📰 Fitness Fanatic Feed:');
fitnessFollower.getFeed().slice(0, 3).forEach(post => {
  console.log(`- ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`);
});

console.log('\n📰 Foodie Feed:');
foodFollower.getFeed().slice(0, 3).forEach(post => {
  console.log(`- ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`);
});

// Show notifications
console.log('\n📧 Notification History:');
const notifications = platform.getNotificationService().getNotifications();
notifications.slice(0, 5).forEach(notification => {
  console.log(`${notification.timestamp.toLocaleTimeString()}: ${notification.message}`);
});

// Show flagged content
console.log('\n🚫 Flagged Content:');
const flaggedPosts = platform.getContentFilter().getFlaggedPosts();
flaggedPosts.forEach(flagged => {
  console.log(`- ${flagged.reason}: "${flagged.post.content.substring(0, 50)}${flagged.post.content.length > 50 ? '...' : ''}"`);
});

// Show user statistics
console.log('\n📊 User Statistics:');
platform.getUsers().forEach(user => {
  const data = user.getData();
  console.log(`${data.username}: ${data.posts.length} posts, ${data.followers.size} followers, ${data.following.size} following`);
});

console.log('\n✅ Social media feed demo completed successfully');

exit(0); 