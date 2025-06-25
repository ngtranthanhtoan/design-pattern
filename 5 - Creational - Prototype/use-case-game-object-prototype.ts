/**
 * PROTOTYPE PATTERN - GAME OBJECT PROTOTYPE
 * ========================================
 * 
 * This example demonstrates the Prototype pattern for game object creation.
 * Game object creation often involves expensive operations like:
 * - Loading 3D models and textures from disk
 * - Parsing animation data and rigging information
 * - Loading sound effects and music files
 * - Initializing physics simulations
 * - Setting up AI behavior systems
 * - Loading particle effects and shaders
 * 
 * Instead of repeating these expensive operations, we create prototype game objects
 * that can be quickly cloned and customized for specific instances in the game.
 * 
 * REAL-WORLD APPLICATIONS:
 * - Game engines (Unity, Unreal Engine, Godot)
 * - Character creation systems
 * - Item and equipment generators
 * - Environment and level object systems
 * - NPC (Non-Player Character) management
 * - Projectile and effect systems
 */

import { exit } from "process";

// ============================================================================
// GAME OBJECT INTERFACES AND TYPES
// ============================================================================

interface Position3D {
  x: number;
  y: number;
  z: number;
}

interface Rotation3D {
  x: number;
  y: number;
  z: number;
  w: number; // quaternion w component
}

interface Scale3D {
  x: number;
  y: number;
  z: number;
}

interface Transform {
  position: Position3D;
  rotation: Rotation3D;
  scale: Scale3D;
}

interface Stats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  defense: number;
  speed: number;
  intelligence: number;
  luck: number;
}

interface Equipment {
  weapon?: string;
  armor?: string;
  helmet?: string;
  boots?: string;
  accessories: string[];
}

interface Inventory {
  items: Map<string, number>;
  maxSlots: number;
  weight: number;
  maxWeight: number;
}

interface Animation {
  name: string;
  duration: number;
  loop: boolean;
  frames: number;
  filePath: string;
}

interface AudioClip {
  name: string;
  filePath: string;
  volume: number;
  loop: boolean;
}

interface AIBehavior {
  type: 'aggressive' | 'defensive' | 'neutral' | 'friendly' | 'custom';
  aggroRange: number;
  patrolRadius: number;
  reactionTime: number;
  customBehavior?: string;
}

interface PhysicsProperties {
  mass: number;
  friction: number;
  restitution: number;
  isKinematic: boolean;
  collisionLayer: string;
  collisionMask: string[];
}

// ============================================================================
// BASE GAME OBJECT PROTOTYPE
// ============================================================================

/**
 * Base game object prototype that can be extended for specific game entity types
 * Simulates expensive game object initialization operations
 */
abstract class GameObjectPrototype {
  protected id: string;
  protected name: string;
  protected type: string;
  protected transform: Transform;
  protected stats: Stats;
  protected animations: Map<string, Animation>;
  protected audioClips: Map<string, AudioClip>;
  protected physicsProperties: PhysicsProperties;
  protected isInitialized: boolean = false;
  protected initializationCost: number = 0;
  protected assetPaths: Map<string, string>;

  constructor(type: string) {
    this.id = this.generateId();
    this.name = `${type}_${this.id}`;
    this.type = type;
    
    this.transform = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1, z: 1 }
    };

    this.stats = {
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      strength: 10,
      defense: 5,
      speed: 5,
      intelligence: 5,
      luck: 5
    };

    this.animations = new Map();
    this.audioClips = new Map();
    this.assetPaths = new Map();
    
    this.physicsProperties = {
      mass: 1.0,
      friction: 0.5,
      restitution: 0.3,
      isKinematic: false,
      collisionLayer: 'default',
      collisionMask: ['default']
    };
  }

  /**
   * Expensive initialization process (simulated)
   * In real-world scenarios, this might involve:
   * - Loading 3D models from disk
   * - Parsing texture atlases and materials
   * - Loading animation sequences
   * - Initializing audio systems
   * - Setting up physics colliders
   * - Loading particle effect data
   */
  async initializeGameObject(assetBasePath?: string): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    console.log(`🎮 Starting expensive game object initialization for ${this.type}...`);
    const startTime = Date.now();

    // Simulate loading 3D model
    await this.simulateModelLoading(assetBasePath);
    
    // Simulate loading textures
    await this.simulateTextureLoading();
    
    // Simulate loading animations
    await this.simulateAnimationLoading();
    
    // Simulate loading audio
    await this.simulateAudioLoading();
    
    // Simulate physics setup
    await this.simulatePhysicsSetup();
    
    // Simulate shader compilation
    await this.simulateShaderCompilation();

    this.initializationCost = Date.now() - startTime;
    this.isInitialized = true;

    console.log(`✅ Game object initialized in ${this.initializationCost}ms`);
    return this;
  }

  /**
   * Clone the game object (fast operation)
   */
  abstract clone(): GameObjectPrototype;

  /**
   * Base clone implementation
   */
  protected baseClone<T extends GameObjectPrototype>(constructor: new (type: string) => T): T {
    if (!this.isInitialized) {
      throw new Error('Game object must be initialized before cloning');
    }

    console.log(`📋 Cloning game object ${this.type} (fast operation)...`);
    const startTime = Date.now();

    const cloned = new constructor(this.type);
    
    // Copy all data without re-initialization
    cloned.name = `${this.type}_${cloned.generateId()}`;
    cloned.transform = {
      position: { ...this.transform.position },
      rotation: { ...this.transform.rotation },
      scale: { ...this.transform.scale }
    };
    cloned.stats = { ...this.stats };
    cloned.animations = new Map(this.animations);
    cloned.audioClips = new Map(this.audioClips);
    cloned.assetPaths = new Map(this.assetPaths);
    cloned.physicsProperties = { ...this.physicsProperties, collisionMask: [...this.physicsProperties.collisionMask] };
    cloned.isInitialized = true;
    cloned.initializationCost = this.initializationCost;

    const cloneTime = Date.now() - startTime;
    console.log(`✅ Game object cloned in ${cloneTime}ms (${Math.round((this.initializationCost / cloneTime) * 100) / 100}x faster than initialization)`);

    return cloned;
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setPosition(x: number, y: number, z: number): this {
    this.transform.position = { x, y, z };
    return this;
  }

  setRotation(x: number, y: number, z: number, w: number = 1): this {
    this.transform.rotation = { x, y, z, w };
    return this;
  }

  setScale(x: number, y: number, z: number): this {
    this.transform.scale = { x, y, z };
    return this;
  }

  setStats(stats: Partial<Stats>): this {
    Object.assign(this.stats, stats);
    return this;
  }

  scaleStats(multiplier: number): this {
    this.stats.health = Math.round(this.stats.health * multiplier);
    this.stats.maxHealth = Math.round(this.stats.maxHealth * multiplier);
    this.stats.mana = Math.round(this.stats.mana * multiplier);
    this.stats.maxMana = Math.round(this.stats.maxMana * multiplier);
    this.stats.strength = Math.round(this.stats.strength * multiplier);
    this.stats.defense = Math.round(this.stats.defense * multiplier);
    this.stats.speed = Math.round(this.stats.speed * multiplier);
    this.stats.intelligence = Math.round(this.stats.intelligence * multiplier);
    this.stats.luck = Math.round(this.stats.luck * multiplier);
    return this;
  }

  setPhysicsProperties(properties: Partial<PhysicsProperties>): this {
    Object.assign(this.physicsProperties, properties);
    return this;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getMetadata(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      isInitialized: this.isInitialized,
      initializationCost: this.initializationCost,
      animationCount: this.animations.size,
      audioClipCount: this.audioClips.size,
      assetCount: this.assetPaths.size
    };
  }

  toString(): string {
    return `${this.type}(${this.name}): HP=${this.stats.health}/${this.stats.maxHealth}, STR=${this.stats.strength}`;
  }

  // ============================================================================
  // SIMULATION METHODS (EXPENSIVE OPERATIONS)
  // ============================================================================

  private async simulateModelLoading(basePath?: string): Promise<void> {
    const modelPath = `${basePath || './assets/models'}/${this.type}.fbx`;
    this.assetPaths.set('model', modelPath);
    console.log(`  🎯 Loading 3D model: ${modelPath}`);
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));
  }

  private async simulateTextureLoading(): Promise<void> {
    console.log('  🖼️ Loading textures and materials');
    const textures = ['diffuse', 'normal', 'specular', 'roughness'];
    for (const texture of textures) {
      this.assetPaths.set(`texture_${texture}`, `./assets/textures/${this.type}_${texture}.png`);
    }
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
  }

  private async simulateAnimationLoading(): Promise<void> {
    console.log('  🏃 Loading animation sequences');
    const commonAnimations = ['idle', 'walk', 'run', 'death'];
    for (const animName of commonAnimations) {
      this.animations.set(animName, {
        name: animName,
        duration: 1.0 + Math.random() * 2.0,
        loop: animName !== 'death',
        frames: 30 + Math.floor(Math.random() * 30),
        filePath: `./assets/animations/${this.type}_${animName}.anim`
      });
    }
    await new Promise(resolve => setTimeout(resolve, 120 + Math.random() * 180));
  }

  private async simulateAudioLoading(): Promise<void> {
    console.log('  🔊 Loading audio clips');
    const commonSounds = ['footstep', 'hurt', 'death'];
    for (const soundName of commonSounds) {
      this.audioClips.set(soundName, {
        name: soundName,
        filePath: `./assets/audio/${this.type}_${soundName}.wav`,
        volume: 0.7 + Math.random() * 0.3,
        loop: false
      });
    }
    await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120));
  }

  private async simulatePhysicsSetup(): Promise<void> {
    console.log('  ⚛️ Setting up physics colliders');
    await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 90));
  }

  private async simulateShaderCompilation(): Promise<void> {
    console.log('  🎨 Compiling shaders');
    await new Promise(resolve => setTimeout(resolve, 90 + Math.random() * 130));
  }
}

// ============================================================================
// CHARACTER PROTOTYPE
// ============================================================================

/**
 * Character prototype for player characters and NPCs
 */
class CharacterPrototype extends GameObjectPrototype {
  private level: number;
  private experience: number;
  private equipment: Equipment;
  private inventory: Inventory;
  private abilities: Map<string, any>;
  private aiBehavior?: AIBehavior;

  constructor() {
    super('character');
    
    this.level = 1;
    this.experience = 0;
    this.equipment = { accessories: [] };
    this.inventory = {
      items: new Map(),
      maxSlots: 20,
      weight: 0,
      maxWeight: 100
    };
    this.abilities = new Map();
  }

  async initializeCharacter(characterClass: string): Promise<this> {
    await this.initializeGameObject(`./assets/characters/${characterClass}`);
    
    // Add character-specific animations
    this.animations.set('attack', {
      name: 'attack',
      duration: 0.5,
      loop: false,
      frames: 15,
      filePath: `./assets/animations/${characterClass}_attack.anim`
    });
    
    this.animations.set('cast', {
      name: 'cast',
      duration: 1.2,
      loop: false,
      frames: 36,
      filePath: `./assets/animations/${characterClass}_cast.anim`
    });

    // Add character-specific sounds
    this.audioClips.set('attack', {
      name: 'attack',
      filePath: `./assets/audio/${characterClass}_attack.wav`,
      volume: 0.8,
      loop: false
    });

    return this;
  }

  clone(): CharacterPrototype {
    const cloned = this.baseClone(CharacterPrototype);
    cloned.level = this.level;
    cloned.experience = this.experience;
    cloned.equipment = {
      weapon: this.equipment.weapon,
      armor: this.equipment.armor,
      helmet: this.equipment.helmet,
      boots: this.equipment.boots,
      accessories: [...this.equipment.accessories]
    };
    cloned.inventory = {
      items: new Map(this.inventory.items),
      maxSlots: this.inventory.maxSlots,
      weight: this.inventory.weight,
      maxWeight: this.inventory.maxWeight
    };
    cloned.abilities = new Map(this.abilities);
    cloned.aiBehavior = this.aiBehavior ? { ...this.aiBehavior } : undefined;
    return cloned;
  }

  setLevel(level: number): this {
    this.level = level;
    // Scale stats based on level
    const baseHealth = 100;
    const baseMana = 50;
    const baseStats = 10;
    
    this.stats.maxHealth = baseHealth + (level - 1) * 15;
    this.stats.health = this.stats.maxHealth;
    this.stats.maxMana = baseMana + (level - 1) * 8;
    this.stats.mana = this.stats.maxMana;
    this.stats.strength = baseStats + (level - 1) * 2;
    this.stats.defense = baseStats + (level - 1) * 2;
    this.stats.speed = baseStats + (level - 1) * 1;
    this.stats.intelligence = baseStats + (level - 1) * 2;
    
    return this;
  }

  addExperience(exp: number): this {
    this.experience += exp;
    return this;
  }

  equipItem(slot: keyof Equipment, item: string): this {
    if (slot === 'accessories') {
      this.equipment.accessories.push(item);
    } else {
      (this.equipment as any)[slot] = item;
    }
    return this;
  }

  addAbility(name: string, ability: any): this {
    this.abilities.set(name, ability);
    return this;
  }

  setAIBehavior(behavior: AIBehavior): this {
    this.aiBehavior = behavior;
    return this;
  }

  override toString(): string {
    return `Character(${this.name}): Level ${this.level}, HP=${this.stats.health}/${this.stats.maxHealth}, ${this.abilities.size} abilities`;
  }
}

// ============================================================================
// ITEM PROTOTYPE
// ============================================================================

/**
 * Item prototype for weapons, armor, consumables, and collectibles
 */
class ItemPrototype extends GameObjectPrototype {
  private itemType: 'weapon' | 'armor' | 'consumable' | 'collectible' | 'key';
  private rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  private value: number;
  private weight: number;
  private durability: number;
  private maxDurability: number;
  private enchantments: Map<string, any>;
  private requirements: Map<string, number>;

  constructor() {
    super('item');
    
    this.itemType = 'collectible';
    this.rarity = 'common';
    this.value = 1;
    this.weight = 0.1;
    this.durability = 100;
    this.maxDurability = 100;
    this.enchantments = new Map();
    this.requirements = new Map();
  }

  async initializeItem(itemCategory: string): Promise<this> {
    await this.initializeGameObject(`./assets/items/${itemCategory}`);
    
    // Items don't need complex animations, just simple ones
    this.animations.set('pickup', {
      name: 'pickup',
      duration: 0.3,
      loop: false,
      frames: 9,
      filePath: `./assets/animations/item_pickup.anim`
    });

    // Add item-specific sounds
    this.audioClips.set('pickup', {
      name: 'pickup',
      filePath: './assets/audio/item_pickup.wav',
      volume: 0.6,
      loop: false
    });

    return this;
  }

  clone(): ItemPrototype {
    const cloned = this.baseClone(ItemPrototype);
    cloned.itemType = this.itemType;
    cloned.rarity = this.rarity;
    cloned.value = this.value;
    cloned.weight = this.weight;
    cloned.durability = this.durability;
    cloned.maxDurability = this.maxDurability;
    cloned.enchantments = new Map(this.enchantments);
    cloned.requirements = new Map(this.requirements);
    return cloned;
  }

  setItemType(type: ItemPrototype['itemType']): this {
    this.itemType = type;
    return this;
  }

  setRarity(rarity: ItemPrototype['rarity']): this {
    this.rarity = rarity;
    
    // Adjust value based on rarity
    const rarityMultipliers = {
      common: 1,
      uncommon: 2,
      rare: 5,
      epic: 10,
      legendary: 25
    };
    
    this.value = Math.round(this.value * rarityMultipliers[rarity]);
    return this;
  }

  setValue(value: number): this {
    this.value = value;
    return this;
  }

  setWeight(weight: number): this {
    this.weight = weight;
    return this;
  }

  setDurability(durability: number, maxDurability?: number): this {
    this.durability = durability;
    if (maxDurability !== undefined) {
      this.maxDurability = maxDurability;
    }
    return this;
  }

  addEnchantment(name: string, effect: any): this {
    this.enchantments.set(name, effect);
    return this;
  }

  addRequirement(attribute: string, value: number): this {
    this.requirements.set(attribute, value);
    return this;
  }

  override toString(): string {
    return `Item(${this.name}): ${this.rarity} ${this.itemType}, Value: ${this.value}, ${this.enchantments.size} enchantments`;
  }
}

// ============================================================================
// ENVIRONMENT OBJECT PROTOTYPE
// ============================================================================

/**
 * Environment object prototype for interactive world objects
 */
class EnvironmentObjectPrototype extends GameObjectPrototype {
  private objectType: 'static' | 'interactive' | 'destructible' | 'animated';
  private isInteractable: boolean;
  private interactionType?: 'pickup' | 'activate' | 'examine' | 'open';
  private healthPoints?: number;
  private maxHealthPoints?: number;
  private dropTable: Map<string, number>; // item -> drop chance
  private triggerEvents: Map<string, any>;

  constructor() {
    super('environment');
    
    this.objectType = 'static';
    this.isInteractable = false;
    this.dropTable = new Map();
    this.triggerEvents = new Map();
  }

  async initializeEnvironmentObject(objectCategory: string): Promise<this> {
    await this.initializeGameObject(`./assets/environment/${objectCategory}`);
    
    // Add environment-specific animations
    if (this.objectType === 'animated' || this.objectType === 'interactive') {
      this.animations.set('activate', {
        name: 'activate',
        duration: 0.8,
        loop: false,
        frames: 24,
        filePath: `./assets/animations/${objectCategory}_activate.anim`
      });
    }

    if (this.objectType === 'destructible') {
      this.animations.set('destroy', {
        name: 'destroy',
        duration: 1.0,
        loop: false,
        frames: 30,
        filePath: `./assets/animations/${objectCategory}_destroy.anim`
      });
    }

    return this;
  }

  clone(): EnvironmentObjectPrototype {
    const cloned = this.baseClone(EnvironmentObjectPrototype);
    cloned.objectType = this.objectType;
    cloned.isInteractable = this.isInteractable;
    cloned.interactionType = this.interactionType;
    cloned.healthPoints = this.healthPoints;
    cloned.maxHealthPoints = this.maxHealthPoints;
    cloned.dropTable = new Map(this.dropTable);
    cloned.triggerEvents = new Map(this.triggerEvents);
    return cloned;
  }

  setObjectType(type: EnvironmentObjectPrototype['objectType']): this {
    this.objectType = type;
    return this;
  }

  setInteractable(interactable: boolean, type?: EnvironmentObjectPrototype['interactionType']): this {
    this.isInteractable = interactable;
    this.interactionType = type;
    return this;
  }

  setDestructible(health: number): this {
    this.objectType = 'destructible';
    this.healthPoints = health;
    this.maxHealthPoints = health;
    return this;
  }

  addDropItem(item: string, chance: number): this {
    this.dropTable.set(item, chance);
    return this;
  }

  addTriggerEvent(event: string, data: any): this {
    this.triggerEvents.set(event, data);
    return this;
  }

  override toString(): string {
    return `Environment(${this.name}): ${this.objectType} ${this.isInteractable ? '(interactable)' : ''}, ${this.dropTable.size} drops`;
  }
}

// ============================================================================
// GAME OBJECT REGISTRY
// ============================================================================

/**
 * Registry system for managing game object prototypes
 */
class GameObjectRegistry {
  private prototypes = new Map<string, GameObjectPrototype>();
  private categories = new Map<string, string[]>();
  private usage = new Map<string, number>();

  async registerPrototype(name: string, prototype: GameObjectPrototype, category: string = 'general'): Promise<void> {
    const metadata = prototype.getMetadata();
    if (!metadata.isInitialized) {
      await prototype.initializeGameObject();
    }
    
    this.prototypes.set(name, prototype);
    this.usage.set(name, 0);
    
    // Add to category
    const categoryPrototypes = this.categories.get(category) || [];
    categoryPrototypes.push(name);
    this.categories.set(category, categoryPrototypes);
    
    console.log(`📋 Registered game object prototype: ${name} in category: ${category}`);
  }

  createGameObject(name: string, customization?: any): GameObjectPrototype | null {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      console.log(`❌ Game object prototype not found: ${name}`);
      return null;
    }

    const current = this.usage.get(name) || 0;
    this.usage.set(name, current + 1);

    const cloned = prototype.clone();
    
    // Apply customization if provided
    if (customization) {
      if (customization.position) {
        cloned.setPosition(customization.position.x, customization.position.y, customization.position.z);
      }
      if (customization.scale) {
        cloned.setScale(customization.scale.x, customization.scale.y, customization.scale.z);
      }
      if (customization.name) {
        cloned.setName(customization.name);
      }
      if (customization.stats) {
        cloned.setStats(customization.stats);
      }
    }

    return cloned;
  }

  listPrototypes(): Array<{ name: string; category: string; type: string }> {
    const result: Array<{ name: string; category: string; type: string }> = [];
    
    this.categories.forEach((prototypes, category) => {
      prototypes.forEach(name => {
        const prototype = this.prototypes.get(name);
        if (prototype) {
          const metadata = prototype.getMetadata();
          result.push({ name, category, type: metadata.type });
        }
      });
    });
    
    return result;
  }

  getPrototypesByCategory(category: string): string[] {
    return this.categories.get(category) || [];
  }

  getUsageStats(): Map<string, number> {
    return new Map(this.usage);
  }
}

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

/**
 * Demonstrate basic game object prototyping
 */
async function demonstrateBasicGameObjectPrototyping(): Promise<void> {
  console.log('\n🎮 BASIC GAME OBJECT PROTOTYPING');
  console.log('================================');

  // Create character prototypes
  const warriorPrototype = new CharacterPrototype();
  await warriorPrototype.initializeCharacter('warrior');
  warriorPrototype
    .setName('Warrior Template')
    .setStats({ strength: 20, defense: 15, health: 150, maxHealth: 150 })
    .addAbility('slash', { damage: 25, cooldown: 2.0 })
    .addAbility('defend', { damageReduction: 0.5, duration: 3.0 });

  console.log('⚔️ Warrior prototype:', warriorPrototype.toString());

  // Clone for specific instances
  const playerWarrior = warriorPrototype.clone()
    .setName('Sir Galahad')
    .setLevel(15)
    .setPosition(100, 0, 200)
    .equipItem('weapon', 'legendary_sword')
    .equipItem('armor', 'plate_armor')
    .addExperience(5000);

  const enemyWarrior = warriorPrototype.clone()
    .setName('Orc Warrior')
    .setLevel(12)
    .setPosition(500, 0, 300)
    .scaleStats(0.8)
    .setAIBehavior({
      type: 'aggressive',
      aggroRange: 15,
      patrolRadius: 10,
      reactionTime: 0.5
    });

  console.log('🏆 Player warrior:', playerWarrior.toString());
  console.log('👹 Enemy warrior:', enemyWarrior.toString());

  // Create item prototypes
  const swordPrototype = new ItemPrototype();
  await swordPrototype.initializeItem('weapons');
  swordPrototype
    .setName('Iron Sword')
    .setItemType('weapon')
    .setRarity('common')
    .setValue(100)
    .setWeight(3.5)
    .addRequirement('strength', 10);

  const magicSword = swordPrototype.clone()
    .setName('Flame Blade')
    .setRarity('legendary')
    .addEnchantment('fire_damage', { damage: 15, duration: 3 })
    .addEnchantment('critical_strike', { chance: 0.15, multiplier: 2.0 });

  console.log('⚔️ Magic sword:', magicSword.toString());
}

/**
 * Demonstrate environment object prototyping
 */
async function demonstrateEnvironmentObjectPrototyping(): Promise<void> {
  console.log('\n🌍 ENVIRONMENT OBJECT PROTOTYPING');
  console.log('=================================');

  // Create chest prototype
  const chestPrototype = new EnvironmentObjectPrototype();
  await chestPrototype.initializeEnvironmentObject('containers');
  chestPrototype
    .setName('Treasure Chest')
    .setObjectType('interactive')
    .setInteractable(true, 'open')
    .addDropItem('gold_coins', 0.8)
    .addDropItem('health_potion', 0.4)
    .addDropItem('rare_gem', 0.1);

  // Create specific chest instances
  const bossChest = chestPrototype.clone()
    .setName('Boss Treasure Chest')
    .setPosition(0, 0, 0)
    .addDropItem('legendary_weapon', 0.3)
    .addDropItem('epic_armor', 0.5);

  const hiddenChest = chestPrototype.clone()
    .setName('Hidden Chest')
    .setPosition(-50, 0, 75)
    .addDropItem('secret_key', 1.0)
    .addDropItem('ancient_scroll', 0.6);

  console.log('💰 Boss chest:', bossChest.toString());
  console.log('🗝️ Hidden chest:', hiddenChest.toString());

  // Create destructible object prototype
  const barrelPrototype = new EnvironmentObjectPrototype();
  await barrelPrototype.initializeEnvironmentObject('destructibles');
  barrelPrototype
    .setName('Wooden Barrel')
    .setDestructible(25)
    .addDropItem('wood_scrap', 0.7)
    .addDropItem('iron_nails', 0.3);

  const explosiveBarrel = barrelPrototype.clone()
    .setName('Explosive Barrel')
    .addTriggerEvent('explosion', { radius: 5, damage: 50 })
    .addDropItem('gunpowder', 0.9);

  console.log('🛢️ Explosive barrel:', explosiveBarrel.toString());
}

/**
 * Demonstrate game object registry
 */
async function demonstrateGameObjectRegistry(): Promise<void> {
  console.log('\n📋 GAME OBJECT REGISTRY');
  console.log('=======================');

  const registry = new GameObjectRegistry();

  // Create and register various prototypes
  const magePrototype = new CharacterPrototype();
  await magePrototype.initializeCharacter('mage');
  magePrototype
    .setStats({ intelligence: 25, mana: 100, maxMana: 100 })
    .addAbility('fireball', { damage: 35, cost: 15 })
    .addAbility('heal', { healing: 40, cost: 20 });

  const archerPrototype = new CharacterPrototype();
  await archerPrototype.initializeCharacter('archer');
  archerPrototype
    .setStats({ speed: 18, strength: 15 })
    .addAbility('arrow_shot', { damage: 20, range: 50 })
    .addAbility('rapid_fire', { shots: 3, damage: 15 });

  const potionPrototype = new ItemPrototype();
  await potionPrototype.initializeItem('consumables');
  potionPrototype
    .setName('Health Potion')
    .setItemType('consumable')
    .setValue(25)
    .setWeight(0.3);

  // Create warrior prototype for registry
  const warriorPrototype = new CharacterPrototype();
  await warriorPrototype.initializeCharacter('warrior');
  warriorPrototype
    .setStats({ strength: 20, defense: 15, health: 150, maxHealth: 150 })
    .addAbility('slash', { damage: 25, cooldown: 2.0 })
    .addAbility('defend', { damageReduction: 0.5, duration: 3.0 });

  // Register prototypes
  await registry.registerPrototype('warrior', warriorPrototype, 'characters');
  await registry.registerPrototype('mage', magePrototype, 'characters');
  await registry.registerPrototype('archer', archerPrototype, 'characters');
  await registry.registerPrototype('health_potion', potionPrototype, 'items');

  console.log('📋 Available prototypes:');
  registry.listPrototypes().forEach(({ name, category, type }) => {
    console.log(`  ${name} (${category}/${type})`);
  });

  // Create game objects from registry
  const player = registry.createGameObject('mage', {
    name: 'Player Mage',
    position: { x: 0, y: 0, z: 0 },
    stats: { level: 20 }
  });

  const enemies = [
    registry.createGameObject('warrior', { name: 'Orc Warrior', position: { x: 10, y: 0, z: 5 } }),
    registry.createGameObject('archer', { name: 'Goblin Archer', position: { x: -8, y: 0, z: 12 } })
  ];

  if (player && enemies.every(e => e)) {
    console.log('✅ Created game objects from registry');
    console.log('🧙 Player:', player.toString());
    enemies.forEach((enemy, i) => {
      console.log(`👹 Enemy ${i + 1}:`, enemy?.toString());
    });
  }

  // Show usage statistics
  console.log('\n📊 Usage Statistics:');
  const stats = registry.getUsageStats();
  stats.forEach((count, name) => {
    console.log(`  ${name}: ${count} instances created`);
  });
}

/**
 * Demonstrate performance comparison
 */
async function demonstratePerformanceComparison(): Promise<void> {
  console.log('\n⚡ PERFORMANCE COMPARISON');
  console.log('========================');

  const iterations = 20;
  console.log(`🔧 Testing with ${iterations} game object creations...`);

  // Create complex character prototype
  const complexCharacter = new CharacterPrototype();
  await complexCharacter.initializeCharacter('paladin');
  complexCharacter
    .setLevel(25)
    .setStats({ strength: 30, defense: 25, intelligence: 20 })
    .addAbility('holy_strike', { damage: 40, cost: 20 })
    .addAbility('heal', { healing: 50, cost: 25 })
    .addAbility('blessing', { buff: 'strength', value: 10, duration: 60 })
    .equipItem('weapon', 'holy_sword')
    .equipItem('armor', 'blessed_armor');

  // Test prototype cloning
  console.time('⚡ Prototype Cloning');
  const clonedCharacters = [];
  for (let i = 0; i < iterations; i++) {
    const character = complexCharacter.clone();
    character.setName(`Paladin_${i + 1}`);
    character.setPosition(i * 10, 0, 0);
    clonedCharacters.push(character);
  }
  console.timeEnd('⚡ Prototype Cloning');

  // Test traditional creation
  console.time('🏗️ Traditional Creation');
  const createdCharacters = [];
  for (let i = 0; i < iterations; i++) {
    const character = new CharacterPrototype();
    await character.initializeCharacter('paladin'); // Expensive operation each time
    character
      .setName(`Paladin_${i + 1}`)
      .setLevel(25)
      .setPosition(i * 10, 0, 0)
      .setStats({ strength: 30, defense: 25, intelligence: 20 })
      .addAbility('holy_strike', { damage: 40, cost: 20 })
      .addAbility('heal', { healing: 50, cost: 25 })
      .addAbility('blessing', { buff: 'strength', value: 10, duration: 60 })
      .equipItem('weapon', 'holy_sword')
      .equipItem('armor', 'blessed_armor');
    createdCharacters.push(character);
  }
  console.timeEnd('🏗️ Traditional Creation');

  console.log(`🎮 Created ${clonedCharacters.length} cloned characters and ${createdCharacters.length} traditional characters`);
  console.log('📈 Prototype cloning provides massive performance improvement for complex game objects!');
}

/**
 * Main demonstration function
 */
async function demonstrateGameObjectPrototype(): Promise<void> {
  console.log('🎯 GAME OBJECT PROTOTYPE PATTERN');
  console.log('=================================');
  console.log('Creating game objects by cloning pre-initialized prototypes');
  console.log('instead of repeating expensive asset loading and setup operations.\n');

  await demonstrateBasicGameObjectPrototyping();
  await demonstrateEnvironmentObjectPrototyping();
  await demonstrateGameObjectRegistry();
  await demonstratePerformanceComparison();

  console.log('\n✅ GAME OBJECT PROTOTYPE BENEFITS:');
  console.log('- Massive performance improvement for complex game objects');
  console.log('- Consistent asset loading and initialization');
  console.log('- Easy customization of cloned game objects');
  console.log('- Centralized prototype management via registry');
  console.log('- Support for characters, items, and environment objects');
  console.log('- Hierarchical prototype inheritance system');

  console.log('\n🏭 REAL-WORLD APPLICATIONS:');
  console.log('- Game engines (Unity prefabs, Unreal Engine blueprints)');
  console.log('- Character creation and customization systems');
  console.log('- Item and equipment generation systems');
  console.log('- Environment and level object management');
  console.log('- NPC and enemy spawning systems');
  console.log('- Particle effect and projectile systems');
}

// ============================================================================
// EXECUTION
// ============================================================================

if (require.main === module) {
  demonstrateGameObjectPrototype().catch(console.error);
}

export {
  GameObjectPrototype,
  CharacterPrototype,
  ItemPrototype,
  EnvironmentObjectPrototype,
  GameObjectRegistry,
  demonstrateGameObjectPrototype
};

exit(0); 