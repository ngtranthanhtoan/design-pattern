import { exit } from 'process';

// Game State interfaces
interface PlayerState {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  experience: number;
  position: { x: number; y: number; z: number };
  inventory: Map<string, number>;
  skills: Map<string, number>;
  gold: number;
}

interface NPCState {
  id: string;
  name: string;
  type: 'merchant' | 'quest-giver' | 'enemy' | 'friendly';
  position: { x: number; y: number; z: number };
  health: number;
  isAlive: boolean;
  dialogue: string[];
  quests: string[];
}

interface WorldState {
  name: string;
  time: { day: number; hour: number; minute: number };
  weather: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
  events: string[];
  discoveredAreas: Set<string>;
  completedQuests: Set<string>;
}

interface GameState {
  player: PlayerState;
  npcs: Map<string, NPCState>;
  world: WorldState;
  gameTime: number;
  saveSlot: number;
  version: string;
}

// Memento interface
interface Memento {
  getState(): any;
  getTimestamp(): Date;
}

// Game Save Memento
class GameSaveMemento implements Memento {
  private state: GameState;
  private timestamp: Date;

  constructor(state: GameState) {
    // Deep copy the state to ensure immutability
    this.state = {
      player: {
        id: state.player.id,
        name: state.player.name,
        level: state.player.level,
        health: state.player.health,
        maxHealth: state.player.maxHealth,
        experience: state.player.experience,
        position: { ...state.player.position },
        inventory: new Map(state.player.inventory),
        skills: new Map(state.player.skills),
        gold: state.player.gold
      },
      npcs: new Map(),
      world: {
        name: state.world.name,
        time: { ...state.world.time },
        weather: state.world.weather,
        events: [...state.world.events],
        discoveredAreas: new Set(state.world.discoveredAreas),
        completedQuests: new Set(state.world.completedQuests)
      },
      gameTime: state.gameTime,
      saveSlot: state.saveSlot,
      version: state.version
    };

    // Deep copy NPCs
    state.npcs.forEach((npc, npcId) => {
      this.state.npcs.set(npcId, {
        id: npc.id,
        name: npc.name,
        type: npc.type,
        position: { ...npc.position },
        health: npc.health,
        isAlive: npc.isAlive,
        dialogue: [...npc.dialogue],
        quests: [...npc.quests]
      });
    });

    this.timestamp = new Date();
  }

  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  getTimestamp(): Date {
    return new Date(this.timestamp);
  }
}

// Game (Originator)
class Game {
  private state: GameState;
  private saveCounter: number = 0;

  constructor() {
    this.state = {
      player: {
        id: 'player-1',
        name: 'Hero',
        level: 1,
        health: 100,
        maxHealth: 100,
        experience: 0,
        position: { x: 0, y: 0, z: 0 },
        inventory: new Map([['sword', 1], ['potion', 5]]),
        skills: new Map([['sword-fighting', 1], ['magic', 0]]),
        gold: 100
      },
      npcs: new Map(),
      world: {
        name: 'Fantasy World',
        time: { day: 1, hour: 9, minute: 0 },
        weather: 'sunny',
        events: ['Game started'],
        discoveredAreas: new Set(['starting-village']),
        completedQuests: new Set()
      },
      gameTime: 0,
      saveSlot: 1,
      version: '1.0.0'
    };

    // Initialize NPCs
    this.addNPC('merchant-1', 'Shopkeeper', 'merchant', { x: 10, y: 0, z: 5 });
    this.addNPC('quest-1', 'Village Elder', 'quest-giver', { x: 20, y: 0, z: 10 });
    this.addNPC('enemy-1', 'Goblin', 'enemy', { x: 50, y: 0, z: 30 });
  }

  // Create memento of current state
  createMemento(): Memento {
    console.log('💾 Creating game save...');
    return new GameSaveMemento(this.state);
  }

  // Restore state from memento
  restore(memento: Memento): void {
    console.log('🔄 Loading game save...');
    this.state = memento.getState();
  }

  // Game operations
  movePlayer(x: number, y: number, z: number): void {
    this.state.player.position = { x, y, z };
    this.state.gameTime += 1;
    console.log(`🚶 Player moved to (${x}, ${y}, ${z})`);
  }

  gainExperience(amount: number): void {
    this.state.player.experience += amount;
    const newLevel = Math.floor(this.state.player.experience / 100) + 1;
    
    if (newLevel > this.state.player.level) {
      this.state.player.level = newLevel;
      this.state.player.maxHealth += 20;
      this.state.player.health = this.state.player.maxHealth;
      console.log(`🎉 Level up! Now level ${newLevel}`);
    }
    
    console.log(`📈 Gained ${amount} experience (Total: ${this.state.player.experience})`);
  }

  takeDamage(amount: number): void {
    this.state.player.health = Math.max(0, this.state.player.health - amount);
    console.log(`💔 Took ${amount} damage (Health: ${this.state.player.health}/${this.state.player.maxHealth})`);
    
    if (this.state.player.health === 0) {
      console.log('💀 Player died!');
    }
  }

  heal(amount: number): void {
    this.state.player.health = Math.min(this.state.player.maxHealth, this.state.player.health + amount);
    console.log(`❤️ Healed ${amount} health (Health: ${this.state.player.health}/${this.state.player.maxHealth})`);
  }

  addItem(item: string, quantity: number = 1): void {
    const currentQuantity = this.state.player.inventory.get(item) || 0;
    this.state.player.inventory.set(item, currentQuantity + quantity);
    console.log(`📦 Added ${quantity}x ${item} to inventory`);
  }

  removeItem(item: string, quantity: number = 1): boolean {
    const currentQuantity = this.state.player.inventory.get(item) || 0;
    if (currentQuantity < quantity) {
      console.log(`❌ Not enough ${item} in inventory`);
      return false;
    }
    
    this.state.player.inventory.set(item, currentQuantity - quantity);
    if (currentQuantity - quantity === 0) {
      this.state.player.inventory.delete(item);
    }
    console.log(`📦 Removed ${quantity}x ${item} from inventory`);
    return true;
  }

  gainGold(amount: number): void {
    this.state.player.gold += amount;
    console.log(`💰 Gained ${amount} gold (Total: ${this.state.player.gold})`);
  }

  spendGold(amount: number): boolean {
    if (this.state.player.gold < amount) {
      console.log(`❌ Not enough gold (Need: ${amount}, Have: ${this.state.player.gold})`);
      return false;
    }
    
    this.state.player.gold -= amount;
    console.log(`💰 Spent ${amount} gold (Remaining: ${this.state.player.gold})`);
    return true;
  }

  improveSkill(skill: string, points: number = 1): void {
    const currentLevel = this.state.player.skills.get(skill) || 0;
    this.state.player.skills.set(skill, currentLevel + points);
    console.log(`⚔️ Improved ${skill} by ${points} points (Level: ${currentLevel + points})`);
  }

  discoverArea(areaName: string): void {
    this.state.world.discoveredAreas.add(areaName);
    console.log(`🗺️ Discovered new area: ${areaName}`);
  }

  completeQuest(questName: string): void {
    this.state.world.completedQuests.add(questName);
    console.log(`✅ Completed quest: ${questName}`);
  }

  addWorldEvent(event: string): void {
    this.state.world.events.push(event);
    console.log(`📢 World event: ${event}`);
  }

  changeWeather(weather: WorldState['weather']): void {
    this.state.world.weather = weather;
    console.log(`🌤️ Weather changed to: ${weather}`);
  }

  advanceTime(hours: number): void {
    this.state.world.time.hour += hours;
    this.state.world.time.day += Math.floor(this.state.world.time.hour / 24);
    this.state.world.time.hour %= 24;
    console.log(`⏰ Time advanced by ${hours} hours (Day ${this.state.world.time.day}, ${this.state.world.time.hour}:00)`);
  }

  private addNPC(id: string, name: string, type: NPCState['type'], position: { x: number; y: number; z: number }): void {
    const npc: NPCState = {
      id,
      name,
      type,
      position,
      health: type === 'enemy' ? 50 : 100,
      isAlive: true,
      dialogue: [`Hello, I'm ${name}`],
      quests: type === 'quest-giver' ? ['Help the village'] : []
    };
    this.state.npcs.set(id, npc);
  }

  // Get current state
  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Display current state
  display(): void {
    console.log('\n🎮 Current Game State:');
    console.log(`Player: ${this.state.player.name} (Level ${this.state.player.level})`);
    console.log(`Health: ${this.state.player.health}/${this.state.player.maxHealth}`);
    console.log(`Experience: ${this.state.player.experience}`);
    console.log(`Position: (${this.state.player.position.x}, ${this.state.player.position.y}, ${this.state.player.position.z})`);
    console.log(`Gold: ${this.state.player.gold}`);
    console.log(`World: ${this.state.world.name} - Day ${this.state.world.time.day}, ${this.state.world.time.hour}:${this.state.world.time.minute.toString().padStart(2, '0')}`);
    console.log(`Weather: ${this.state.world.weather}`);
    console.log(`Discovered Areas: ${this.state.world.discoveredAreas.size}`);
    console.log(`Completed Quests: ${this.state.world.completedQuests.size}`);
    console.log(`NPCs: ${this.state.npcs.size}`);
    console.log('');
  }

  // Display detailed player info
  displayPlayerDetails(): void {
    console.log('\n👤 Player Details:');
    console.log(`Name: ${this.state.player.name}`);
    console.log(`Level: ${this.state.player.level}`);
    console.log(`Health: ${this.state.player.health}/${this.state.player.maxHealth}`);
    console.log(`Experience: ${this.state.player.experience}`);
    console.log(`Gold: ${this.state.player.gold}`);
    
    console.log('\n📦 Inventory:');
    this.state.player.inventory.forEach((quantity, item) => {
      console.log(`  ${item}: ${quantity}`);
    });
    
    console.log('\n⚔️ Skills:');
    this.state.player.skills.forEach((level, skill) => {
      console.log(`  ${skill}: Level ${level}`);
    });
    console.log('');
  }
}

// Caretaker - Manages save slots
class GameSaveManager {
  private saveSlots: Map<number, Memento> = new Map();
  private autoSaveMemento: Memento | null = null;

  // Save to specific slot
  saveToSlot(game: Game, slot: number): void {
    const memento = game.createMemento();
    this.saveSlots.set(slot, memento);
    console.log(`💾 Game saved to slot ${slot}`);
  }

  // Load from specific slot
  loadFromSlot(game: Game, slot: number): boolean {
    const memento = this.saveSlots.get(slot);
    if (!memento) {
      console.log(`❌ No save found in slot ${slot}`);
      return false;
    }

    game.restore(memento);
    console.log(`🔄 Game loaded from slot ${slot}`);
    return true;
  }

  // Auto save
  autoSave(game: Game): void {
    this.autoSaveMemento = game.createMemento();
    console.log('💾 Auto-save created');
  }

  // Load auto save
  loadAutoSave(game: Game): boolean {
    if (!this.autoSaveMemento) {
      console.log('❌ No auto-save available');
      return false;
    }

    game.restore(this.autoSaveMemento);
    console.log('🔄 Auto-save loaded');
    return true;
  }

  // Get save information
  getSaveInfo(): { slots: number[]; hasAutoSave: boolean } {
    return {
      slots: Array.from(this.saveSlots.keys()),
      hasAutoSave: this.autoSaveMemento !== null
    };
  }

  // Delete save slot
  deleteSlot(slot: number): boolean {
    if (this.saveSlots.delete(slot)) {
      console.log(`🗑️ Deleted save slot ${slot}`);
      return true;
    }
    console.log(`❌ No save found in slot ${slot}`);
    return false;
  }
}

// Demo
console.log('=== GAME SAVE SYSTEM DEMO ===\n');

// Create game and save manager
const game = new Game();
const saveManager = new GameSaveManager();

console.log('🚀 Starting new game...\n');

// Initial state
game.display();

// Perform various game operations
console.log('=== GAME OPERATIONS ===');

game.movePlayer(10, 0, 5);
game.gainExperience(50);
game.display();

saveManager.saveToSlot(game, 1);
game.display();

game.movePlayer(20, 0, 10);
game.discoverArea('forest');
game.gainExperience(30);
game.addItem('shield', 1);
game.display();

saveManager.saveToSlot(game, 2);
game.display();

game.movePlayer(50, 0, 30);
game.takeDamage(20);
game.heal(10);
game.gainGold(50);
game.improveSkill('sword-fighting', 2);
game.display();

saveManager.autoSave(game);
game.display();

game.completeQuest('Help the village');
game.changeWeather('rainy');
game.advanceTime(6);
game.display();

// Demonstrate save/load operations
console.log('=== SAVE/LOAD OPERATIONS ===');

console.log('\n🔄 Loading from slot 1...');
saveManager.loadFromSlot(game, 1);
game.display();

console.log('\n🔄 Loading from slot 2...');
saveManager.loadFromSlot(game, 2);
game.display();

console.log('\n🔄 Loading auto-save...');
saveManager.loadAutoSave(game);
game.display();

// Show save information
const saveInfo = saveManager.getSaveInfo();
console.log('\n📊 Save Information:');
console.log(`Available slots: ${saveInfo.slots.join(', ')}`);
console.log(`Has auto-save: ${saveInfo.hasAutoSave}`);

// Demonstrate multiple saves
console.log('\n=== MULTIPLE SAVES DEMO ===');

game.movePlayer(100, 0, 100);
game.discoverArea('mountain');
game.gainExperience(100);
game.addItem('magic-scroll', 3);
saveManager.saveToSlot(game, 3);
game.display();

game.movePlayer(200, 0, 200);
game.discoverArea('castle');
game.completeQuest('Defeat the dragon');
saveManager.saveToSlot(game, 4);
game.display();

console.log('\n🔄 Loading from slot 3...');
saveManager.loadFromSlot(game, 3);
game.display();

console.log('\n🔄 Loading from slot 4...');
saveManager.loadFromSlot(game, 4);
game.display();

// Demonstrate save management
console.log('\n=== SAVE MANAGEMENT ===');

console.log('\n🗑️ Deleting slot 2...');
saveManager.deleteSlot(2);

const updatedSaveInfo = saveManager.getSaveInfo();
console.log(`Updated available slots: ${updatedSaveInfo.slots.join(', ')}`);

console.log('\n✅ Game save system demo completed successfully');

exit(0); 