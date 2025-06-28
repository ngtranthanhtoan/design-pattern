import { exit } from 'process';

// Observer interface
interface Observer {
  update(gameEvent: GameEvent): void;
}

// Subject interface
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(gameEvent: GameEvent): void;
}

// Game event interface
interface GameEvent {
  id: string;
  timestamp: Date;
  type: 'player_action' | 'enemy_spawn' | 'item_collected' | 'level_complete' | 'player_death' | 'achievement' | 'score_change' | 'power_up' | 'environment_change';
  data: {
    playerId?: string;
    playerName?: string;
    position?: { x: number; y: number; z: number };
    health?: number;
    score?: number;
    level?: number;
    enemyType?: string;
    itemType?: string;
    achievementId?: string;
    powerUpType?: string;
    environmentType?: string;
    [key: string]: any;
  };
  metadata?: {
    sessionId?: string;
    gameVersion?: string;
    difficulty?: string;
    [key: string]: any;
  };
}

// Game Engine (Subject)
class GameEngine implements Subject {
  private observers: Set<Observer> = new Set();
  private gameState: {
    isRunning: boolean;
    currentLevel: number;
    players: Map<string, Player>;
    enemies: Map<string, Enemy>;
    items: Map<string, Item>;
    score: number;
    sessionId: string;
  };
  private eventCounter: number = 0;

  constructor() {
    this.gameState = {
      isRunning: false,
      currentLevel: 1,
      players: new Map(),
      enemies: new Map(),
      items: new Map(),
      score: 0,
      sessionId: `session-${Date.now()}`
    };
  }

  attach(observer: Observer): void {
    this.observers.add(observer);
    console.log(`🎮 ${observer.constructor.name} subscribed to game engine`);
  }

  detach(observer: Observer): void {
    this.observers.delete(observer);
    console.log(`🎮 ${observer.constructor.name} unsubscribed from game engine`);
  }

  notify(gameEvent: GameEvent): void {
    console.log(`🔔 Game engine notifying ${this.observers.size} observers about ${gameEvent.type}`);
    this.observers.forEach(observer => {
      try {
        observer.update(gameEvent);
      } catch (error) {
        console.error(`❌ Error notifying ${observer.constructor.name}:`, error);
      }
    });
  }

  private createGameEvent(type: GameEvent['type'], data: GameEvent['data'], metadata?: GameEvent['metadata']): GameEvent {
    return {
      id: `event-${++this.eventCounter}`,
      timestamp: new Date(),
      type,
      data,
      metadata: {
        sessionId: this.gameState.sessionId,
        gameVersion: '1.0.0',
        difficulty: 'normal',
        ...metadata
      }
    };
  }

  startGame(): void {
    this.gameState.isRunning = true;
    console.log('🎮 Game started');
    
    const event = this.createGameEvent('environment_change', {
      environmentType: 'game_start'
    });
    this.notify(event);
  }

  stopGame(): void {
    this.gameState.isRunning = false;
    console.log('🎮 Game stopped');
  }

  addPlayer(player: Player): void {
    this.gameState.players.set(player.getId(), player);
    console.log(`👤 Player ${player.getName()} joined the game`);
  }

  removePlayer(playerId: string): void {
    this.gameState.players.delete(playerId);
    console.log(`👤 Player ${playerId} left the game`);
  }

  spawnEnemy(enemy: Enemy): void {
    this.gameState.enemies.set(enemy.getId(), enemy);
    
    const event = this.createGameEvent('enemy_spawn', {
      enemyType: enemy.getType(),
      position: enemy.getPosition()
    });
    this.notify(event);
  }

  removeEnemy(enemyId: string): void {
    this.gameState.enemies.delete(enemyId);
  }

  addItem(item: Item): void {
    this.gameState.items.set(item.getId(), item);
  }

  removeItem(itemId: string): void {
    this.gameState.items.delete(itemId);
  }

  updatePlayerAction(playerId: string, action: string, data: any): void {
    const player = this.gameState.players.get(playerId);
    if (!player) return;

    const event = this.createGameEvent('player_action', {
      playerId,
      playerName: player.getName(),
      position: player.getPosition(),
      health: player.getHealth(),
      score: player.getScore(),
      level: player.getLevel(),
      action,
      ...data
    });
    this.notify(event);
  }

  playerCollectItem(playerId: string, itemId: string): void {
    const player = this.gameState.players.get(playerId);
    const item = this.gameState.items.get(itemId);
    
    if (!player || !item) return;

    this.removeItem(itemId);
    player.addScore(item.getScoreValue());
    
    const event = this.createGameEvent('item_collected', {
      playerId,
      playerName: player.getName(),
      itemType: item.getType(),
      score: item.getScoreValue(),
      position: player.getPosition()
    });
    this.notify(event);
  }

  playerDefeatEnemy(playerId: string, enemyId: string): void {
    const player = this.gameState.players.get(playerId);
    const enemy = this.gameState.enemies.get(enemyId);
    
    if (!player || !enemy) return;

    this.removeEnemy(enemyId);
    player.addScore(enemy.getScoreValue());
    
    const event = this.createGameEvent('player_action', {
      playerId,
      playerName: player.getName(),
      action: 'defeat_enemy',
      enemyType: enemy.getType(),
      score: enemy.getScoreValue(),
      position: player.getPosition()
    });
    this.notify(event);
  }

  playerDeath(playerId: string): void {
    const player = this.gameState.players.get(playerId);
    if (!player) return;

    const event = this.createGameEvent('player_death', {
      playerId,
      playerName: player.getName(),
      position: player.getPosition(),
      score: player.getScore(),
      level: player.getLevel()
    });
    this.notify(event);
  }

  levelComplete(playerId: string): void {
    const player = this.gameState.players.get(playerId);
    if (!player) return;

    this.gameState.currentLevel++;
    player.levelUp();
    
    const event = this.createGameEvent('level_complete', {
      playerId,
      playerName: player.getName(),
      level: player.getLevel(),
      score: player.getScore(),
      position: player.getPosition()
    });
    this.notify(event);
  }

  getGameState(): any {
    return {
      ...this.gameState,
      players: Array.from(this.gameState.players.values()),
      enemies: Array.from(this.gameState.enemies.values()),
      items: Array.from(this.gameState.items.values())
    };
  }

  isRunning(): boolean {
    return this.gameState.isRunning;
  }
}

// Player class
class Player {
  private id: string;
  private name: string;
  private position: { x: number; y: number; z: number };
  private health: number;
  private maxHealth: number;
  private score: number;
  private level: number;
  private inventory: Set<string> = new Set();

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.position = { x: 0, y: 0, z: 0 };
    this.health = 100;
    this.maxHealth = 100;
    this.score = 0;
    this.level = 1;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getPosition(): { x: number; y: number; z: number } {
    return { ...this.position };
  }

  setPosition(position: { x: number; y: number; z: number }): void {
    this.position = { ...position };
  }

  getHealth(): number {
    return this.health;
  }

  setHealth(health: number): void {
    this.health = Math.max(0, Math.min(health, this.maxHealth));
  }

  takeDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  getScore(): number {
    return this.score;
  }

  addScore(points: number): void {
    this.score += points;
  }

  getLevel(): number {
    return this.level;
  }

  levelUp(): void {
    this.level++;
    this.maxHealth += 20;
    this.health = this.maxHealth;
  }

  addToInventory(itemId: string): void {
    this.inventory.add(itemId);
  }

  removeFromInventory(itemId: string): void {
    this.inventory.delete(itemId);
  }

  getInventory(): string[] {
    return Array.from(this.inventory);
  }
}

// Enemy class
class Enemy {
  private id: string;
  private type: string;
  private position: { x: number; y: number; z: number };
  private health: number;
  private damage: number;
  private scoreValue: number;

  constructor(id: string, type: string, position: { x: number; y: number; z: number }) {
    this.id = id;
    this.type = type;
    this.position = position;
    
    // Set properties based on enemy type
    switch (type) {
      case 'goblin':
        this.health = 30;
        this.damage = 10;
        this.scoreValue = 50;
        break;
      case 'orc':
        this.health = 60;
        this.damage = 20;
        this.scoreValue = 100;
        break;
      case 'dragon':
        this.health = 200;
        this.damage = 50;
        this.scoreValue = 500;
        break;
      default:
        this.health = 50;
        this.damage = 15;
        this.scoreValue = 75;
    }
  }

  getId(): string {
    return this.id;
  }

  getType(): string {
    return this.type;
  }

  getPosition(): { x: number; y: number; z: number } {
    return { ...this.position };
  }

  setPosition(position: { x: number; y: number; z: number }): void {
    this.position = { ...position };
  }

  getHealth(): number {
    return this.health;
  }

  takeDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage);
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  getDamage(): number {
    return this.damage;
  }

  getScoreValue(): number {
    return this.scoreValue;
  }
}

// Item class
class Item {
  private id: string;
  private type: string;
  private position: { x: number; y: number; z: number };
  private scoreValue: number;
  private effect: string;

  constructor(id: string, type: string, position: { x: number; y: number; z: number }) {
    this.id = id;
    this.type = type;
    this.position = position;
    
    // Set properties based on item type
    switch (type) {
      case 'coin':
        this.scoreValue = 10;
        this.effect = 'score';
        break;
      case 'gem':
        this.scoreValue = 50;
        this.effect = 'score';
        break;
      case 'health_potion':
        this.scoreValue = 0;
        this.effect = 'heal';
        break;
      case 'power_up':
        this.scoreValue = 25;
        this.effect = 'power';
        break;
      default:
        this.scoreValue = 5;
        this.effect = 'score';
    }
  }

  getId(): string {
    return this.id;
  }

  getType(): string {
    return this.type;
  }

  getPosition(): { x: number; y: number; z: number } {
    return { ...this.position };
  }

  getScoreValue(): number {
    return this.scoreValue;
  }

  getEffect(): string {
    return this.effect;
  }
}

// UI System (Observer)
class UISystem implements Observer {
  private name: string;
  private displayMode: 'minimal' | 'detailed' | 'debug';
  private showNotifications: boolean;

  constructor(name: string, options: {
    displayMode?: 'minimal' | 'detailed' | 'debug';
    showNotifications?: boolean;
  } = {}) {
    this.name = name;
    this.displayMode = options.displayMode || 'detailed';
    this.showNotifications = options.showNotifications ?? true;
  }

  update(gameEvent: GameEvent): void {
    if (!this.showNotifications) return;

    console.log(`\n🎮 ${this.name} UI Update:`);
    
    switch (gameEvent.type) {
      case 'player_action':
        this.handlePlayerAction(gameEvent);
        break;
      case 'enemy_spawn':
        this.handleEnemySpawn(gameEvent);
        break;
      case 'item_collected':
        this.handleItemCollected(gameEvent);
        break;
      case 'player_death':
        this.handlePlayerDeath(gameEvent);
        break;
      case 'level_complete':
        this.handleLevelComplete(gameEvent);
        break;
      case 'achievement':
        this.handleAchievement(gameEvent);
        break;
      case 'score_change':
        this.handleScoreChange(gameEvent);
        break;
      case 'power_up':
        this.handlePowerUp(gameEvent);
        break;
      case 'environment_change':
        this.handleEnvironmentChange(gameEvent);
        break;
    }

    if (this.displayMode === 'debug') {
      console.log(`   Debug: ${JSON.stringify(gameEvent.data)}`);
    }
  }

  private handlePlayerAction(event: GameEvent): void {
    const { playerName, action, position, health, score } = event.data;
    console.log(`   👤 ${playerName} performed ${action} at (${position?.x}, ${position?.y}, ${position?.z})`);
    console.log(`   ❤️ Health: ${health} | 🏆 Score: ${score}`);
  }

  private handleEnemySpawn(event: GameEvent): void {
    const { enemyType, position } = event.data;
    console.log(`   👹 ${enemyType} spawned at (${position?.x}, ${position?.y}, ${position?.z})`);
  }

  private handleItemCollected(event: GameEvent): void {
    const { playerName, itemType, score } = event.data;
    console.log(`   💎 ${playerName} collected ${itemType} (+${score} points)`);
  }

  private handlePlayerDeath(event: GameEvent): void {
    const { playerName, score, level } = event.data;
    console.log(`   💀 ${playerName} died at level ${level} with ${score} points`);
  }

  private handleLevelComplete(event: GameEvent): void {
    const { playerName, level, score } = event.data;
    console.log(`   🎉 ${playerName} completed level ${level} with ${score} points`);
  }

  private handleAchievement(event: GameEvent): void {
    const { playerName, achievementId } = event.data;
    console.log(`   🏅 ${playerName} unlocked achievement: ${achievementId}`);
  }

  private handleScoreChange(event: GameEvent): void {
    const { playerName, score } = event.data;
    console.log(`   📊 ${playerName} score updated: ${score}`);
  }

  private handlePowerUp(event: GameEvent): void {
    const { playerName, powerUpType } = event.data;
    console.log(`   ⚡ ${playerName} activated ${powerUpType}`);
  }

  private handleEnvironmentChange(event: GameEvent): void {
    const { environmentType } = event.data;
    console.log(`   🌍 Environment changed: ${environmentType}`);
  }

  getName(): string {
    return this.name;
  }
}

// Analytics System (Observer)
class AnalyticsSystem implements Observer {
  private name: string;
  private events: GameEvent[] = [];
  private playerStats: Map<string, {
    actions: number;
    itemsCollected: number;
    enemiesDefeated: number;
    deaths: number;
    totalScore: number;
    playTime: number;
  }> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  update(gameEvent: GameEvent): void {
    this.events.push(gameEvent);
    this.updatePlayerStats(gameEvent);
    
    console.log(`📊 ${this.name} recorded event: ${gameEvent.type}`);
  }

  private updatePlayerStats(event: GameEvent): void {
    const playerId = event.data.playerId;
    if (!playerId) return;

    if (!this.playerStats.has(playerId)) {
      this.playerStats.set(playerId, {
        actions: 0,
        itemsCollected: 0,
        enemiesDefeated: 0,
        deaths: 0,
        totalScore: 0,
        playTime: 0
      });
    }

    const stats = this.playerStats.get(playerId)!;

    switch (event.type) {
      case 'player_action':
        stats.actions++;
        break;
      case 'item_collected':
        stats.itemsCollected++;
        stats.totalScore += event.data.score || 0;
        break;
      case 'player_death':
        stats.deaths++;
        break;
      case 'score_change':
        stats.totalScore = event.data.score || stats.totalScore;
        break;
    }
  }

  getPlayerStats(playerId: string): any {
    return this.playerStats.get(playerId);
  }

  getAllPlayerStats(): Map<string, any> {
    return new Map(this.playerStats);
  }

  getEventCount(): number {
    return this.events.length;
  }

  getEventsByType(type: GameEvent['type']): GameEvent[] {
    return this.events.filter(event => event.type === type);
  }

  getName(): string {
    return this.name;
  }
}

// Achievement System (Observer)
class AchievementSystem implements Observer {
  private name: string;
  private achievements: Map<string, {
    id: string;
    name: string;
    description: string;
    condition: (event: GameEvent) => boolean;
    unlocked: boolean;
  }> = new Map();
  private unlockedAchievements: Set<string> = new Set();

  constructor(name: string) {
    this.name = name;
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    // First Blood achievement
    this.achievements.set('first_blood', {
      id: 'first_blood',
      name: 'First Blood',
      description: 'Defeat your first enemy',
      condition: (event: GameEvent) => event.type === 'player_action' && event.data.action === 'defeat_enemy',
      unlocked: false
    });

    // Collector achievement
    this.achievements.set('collector', {
      id: 'collector',
      name: 'Collector',
      description: 'Collect 10 items',
      condition: (event: GameEvent) => event.type === 'item_collected',
      unlocked: false
    });

    // Survivor achievement
    this.achievements.set('survivor', {
      id: 'survivor',
      name: 'Survivor',
      description: 'Complete a level without taking damage',
      condition: (event: GameEvent) => event.type === 'level_complete',
      unlocked: false
    });

    // High Scorer achievement
    this.achievements.set('high_scorer', {
      id: 'high_scorer',
      name: 'High Scorer',
      description: 'Reach 1000 points',
      condition: (event: GameEvent) => event.type === 'score_change' && (event.data.score || 0) >= 1000,
      unlocked: false
    });
  }

  update(gameEvent: GameEvent): void {
    console.log(`🏅 ${this.name} checking achievements for event: ${gameEvent.type}`);
    
    this.achievements.forEach((achievement, key) => {
      if (!achievement.unlocked && achievement.condition(gameEvent)) {
        this.unlockAchievement(key, gameEvent);
      }
    });
  }

  private unlockAchievement(achievementId: string, event: GameEvent): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return;

    achievement.unlocked = true;
    this.unlockedAchievements.add(achievementId);

    console.log(`🏅 ${this.name} ACHIEVEMENT UNLOCKED: ${achievement.name} - ${achievement.description}`);
    
    // Notify the game engine about the achievement
    // In a real implementation, this would trigger a new event
  }

  getUnlockedAchievements(): string[] {
    return Array.from(this.unlockedAchievements);
  }

  getAllAchievements(): Map<string, any> {
    return new Map(this.achievements);
  }

  getName(): string {
    return this.name;
  }
}

// Sound System (Observer)
class SoundSystem implements Observer {
  private name: string;
  private soundEnabled: boolean;
  private volume: number;
  private soundEffects: Map<string, string> = new Map();

  constructor(name: string, options: {
    enabled?: boolean;
    volume?: number;
  } = {}) {
    this.name = name;
    this.soundEnabled = options.enabled ?? true;
    this.volume = options.volume || 0.7;
    this.initializeSoundEffects();
  }

  private initializeSoundEffects(): void {
    this.soundEffects.set('player_action', 'action.wav');
    this.soundEffects.set('enemy_spawn', 'spawn.wav');
    this.soundEffects.set('item_collected', 'collect.wav');
    this.soundEffects.set('player_death', 'death.wav');
    this.soundEffects.set('level_complete', 'victory.wav');
    this.soundEffects.set('achievement', 'achievement.wav');
    this.soundEffects.set('power_up', 'powerup.wav');
  }

  update(gameEvent: GameEvent): void {
    if (!this.soundEnabled) return;

    const soundFile = this.soundEffects.get(gameEvent.type);
    if (soundFile) {
      console.log(`🔊 ${this.name} playing sound: ${soundFile} (volume: ${this.volume})`);
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 ${this.name} volume set to: ${this.volume}`);
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    console.log(`🔊 ${this.name} sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
  }

  getName(): string {
    return this.name;
  }
}

// Demo
console.log('=== GAME ENGINE DEMO ===\n');

// Create game engine
const gameEngine = new GameEngine();

// Create observers
const uiSystem = new UISystem('Main UI', {
  displayMode: 'detailed',
  showNotifications: true
});

const analyticsSystem = new AnalyticsSystem('Game Analytics');

const achievementSystem = new AchievementSystem('Achievement Tracker');

const soundSystem = new SoundSystem('Sound Manager', {
  enabled: true,
  volume: 0.8
});

// Add observers to game engine
gameEngine.attach(uiSystem);
gameEngine.attach(analyticsSystem);
gameEngine.attach(achievementSystem);
gameEngine.attach(soundSystem);

// Create players
const player1 = new Player('player1', 'Alice');
const player2 = new Player('player2', 'Bob');

gameEngine.addPlayer(player1);
gameEngine.addPlayer(player2);

console.log('\n=== SIMULATING GAMEPLAY ===');

// Start the game
gameEngine.startGame();

// Simulate player actions
gameEngine.updatePlayerAction('player1', 'move', { direction: 'north', distance: 10 });
player1.setPosition({ x: 10, y: 0, z: 0 });

gameEngine.updatePlayerAction('player2', 'move', { direction: 'east', distance: 15 });
player2.setPosition({ x: 0, y: 0, z: 15 });

// Spawn enemies
const goblin1 = new Enemy('enemy1', 'goblin', { x: 5, y: 0, z: 5 });
const orc1 = new Enemy('enemy2', 'orc', { x: 20, y: 0, z: 10 });

gameEngine.spawnEnemy(goblin1);
gameEngine.spawnEnemy(orc1);

// Add items
const coin1 = new Item('item1', 'coin', { x: 8, y: 0, z: 8 });
const gem1 = new Item('item2', 'gem', { x: 15, y: 0, z: 15 });
const healthPotion1 = new Item('item3', 'health_potion', { x: 12, y: 0, z: 12 });

gameEngine.addItem(coin1);
gameEngine.addItem(gem1);
gameEngine.addItem(healthPotion1);

// Player collects items
gameEngine.playerCollectItem('player1', 'item1');
gameEngine.playerCollectItem('player2', 'item2');

// Player defeats enemies
gameEngine.playerDefeatEnemy('player1', 'enemy1');
gameEngine.playerDefeatEnemy('player2', 'enemy2');

// Player takes damage
player1.takeDamage(30);
gameEngine.updatePlayerAction('player1', 'take_damage', { damage: 30, source: 'trap' });

// Player uses health potion
gameEngine.playerCollectItem('player1', 'item3');
player1.heal(50);
gameEngine.updatePlayerAction('player1', 'use_item', { itemType: 'health_potion', effect: 'heal' });

// Level complete
gameEngine.levelComplete('player1');

// Player death
player1.takeDamage(100);
gameEngine.playerDeath('player1');

console.log('\n=== DEMONSTRATING OBSERVER FEATURES ===');

// Show analytics
console.log('\n📊 Analytics Summary:');
const allStats = analyticsSystem.getAllPlayerStats();
allStats.forEach((stats, playerId) => {
  console.log(`Player ${playerId}:`);
  console.log(`  Actions: ${stats.actions}`);
  console.log(`  Items Collected: ${stats.itemsCollected}`);
  console.log(`  Enemies Defeated: ${stats.enemiesDefeated}`);
  console.log(`  Deaths: ${stats.deaths}`);
  console.log(`  Total Score: ${stats.totalScore}`);
});

console.log(`\nTotal Events Recorded: ${analyticsSystem.getEventCount()}`);

// Show achievements
console.log('\n🏅 Achievement Status:');
const achievements = achievementSystem.getAllAchievements();
achievements.forEach((achievement, id) => {
  const status = achievement.unlocked ? '✅' : '❌';
  console.log(`${status} ${achievement.name}: ${achievement.description}`);
});

// Show game state
console.log('\n🎮 Game State:');
const gameState = gameEngine.getGameState();
console.log(`Running: ${gameState.isRunning}`);
console.log(`Current Level: ${gameState.currentLevel}`);
console.log(`Players: ${gameState.players.length}`);
console.log(`Enemies: ${gameState.enemies.length}`);
console.log(`Items: ${gameState.items.length}`);

console.log('\n✅ Game engine demo completed successfully');

exit(0); 