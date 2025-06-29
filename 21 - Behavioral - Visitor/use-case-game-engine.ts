/**
 * Visitor Pattern - Game Engine Use Case
 * 
 * This example demonstrates how the Visitor pattern can be used in game engines
 * to separate different operations (update, render, serialize, collision detection)
 * from game object classes.
 */

import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface GameVisitor {
  visitPlayer(player: Player): void;
  visitEnemy(enemy: Enemy): void;
  visitItem(item: Item): void;
  visitObstacle(obstacle: Obstacle): void;
}

interface GameObject {
  accept(visitor: GameVisitor): void;
  getId(): string;
  getX(): number;
  getY(): number;
  getWidth(): number;
  getHeight(): number;
}

// ============================================================================
// CONCRETE GAME OBJECT CLASSES
// ============================================================================

class Player implements GameObject {
  private health: number = 100;
  private score: number = 0;
  private inventory: string[] = [];

  constructor(
    private id: string,
    private x: number,
    private y: number,
    private width: number = 32,
    private height: number = 32,
    private name: string = "Player"
  ) {}

  getId(): string {
    return this.id;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getName(): string {
    return this.name;
  }

  getHealth(): number {
    return this.health;
  }

  getScore(): number {
    return this.score;
  }

  getInventory(): string[] {
    return [...this.inventory];
  }

  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  addScore(points: number): void {
    this.score += points;
  }

  addToInventory(item: string): void {
    this.inventory.push(item);
  }

  accept(visitor: GameVisitor): void {
    visitor.visitPlayer(this);
  }
}

class Enemy implements GameObject {
  private health: number = 50;
  private damage: number = 10;
  private speed: number = 2;

  constructor(
    private id: string,
    private x: number,
    private y: number,
    private width: number = 24,
    private height: number = 24,
    private type: string = "goblin"
  ) {}

  getId(): string {
    return this.id;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getType(): string {
    return this.type;
  }

  getHealth(): number {
    return this.health;
  }

  getDamage(): number {
    return this.damage;
  }

  getSpeed(): number {
    return this.speed;
  }

  moveTowards(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  accept(visitor: GameVisitor): void {
    visitor.visitEnemy(this);
  }
}

class Item implements GameObject {
  private collected: boolean = false;

  constructor(
    private id: string,
    private x: number,
    private y: number,
    private width: number = 16,
    private height: number = 16,
    private type: string = "coin",
    private value: number = 10
  ) {}

  getId(): string {
    return this.id;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getType(): string {
    return this.type;
  }

  getValue(): number {
    return this.value;
  }

  isCollected(): boolean {
    return this.collected;
  }

  collect(): void {
    this.collected = true;
  }

  accept(visitor: GameVisitor): void {
    visitor.visitItem(this);
  }
}

class Obstacle implements GameObject {
  constructor(
    private id: string,
    private x: number,
    private y: number,
    private width: number = 64,
    private height: number = 64,
    private type: string = "wall"
  ) {}

  getId(): string {
    return this.id;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getType(): string {
    return this.type;
  }

  accept(visitor: GameVisitor): void {
    visitor.visitObstacle(this);
  }
}

// ============================================================================
// CONCRETE VISITOR CLASSES
// ============================================================================

class UpdateVisitor implements GameVisitor {
  private deltaTime: number = 16.67;
  private playerTarget?: Player;

  constructor(deltaTime: number = 16.67, playerTarget?: Player) {
    this.deltaTime = deltaTime;
    this.playerTarget = playerTarget;
  }

  visitPlayer(player: Player): void {
    console.log(`[UPDATE] Player ${player.getName()} at (${player.getX().toFixed(1)}, ${player.getY().toFixed(1)})`);
    console.log(`[UPDATE] Health: ${player.getHealth()}, Score: ${player.getScore()}`);
  }

  visitEnemy(enemy: Enemy): void {
    if (enemy.isAlive()) {
      if (this.playerTarget) {
        enemy.moveTowards(this.playerTarget.getX(), this.playerTarget.getY());
      }
      console.log(`[UPDATE] Enemy ${enemy.getType()} at (${enemy.getX().toFixed(1)}, ${enemy.getY().toFixed(1)})`);
      console.log(`[UPDATE] Health: ${enemy.getHealth()}`);
    } else {
      console.log(`[UPDATE] Enemy ${enemy.getType()} is dead`);
    }
  }

  visitItem(item: Item): void {
    if (!item.isCollected()) {
      console.log(`[UPDATE] Item ${item.getType()} at (${item.getX().toFixed(1)}, ${item.getY().toFixed(1)})`);
      console.log(`[UPDATE] Value: ${item.getValue()}, Available: true`);
    } else {
      console.log(`[UPDATE] Item ${item.getType()} has been collected`);
    }
  }

  visitObstacle(obstacle: Obstacle): void {
    console.log(`[UPDATE] Obstacle ${obstacle.getType()} at (${obstacle.getX().toFixed(1)}, ${obstacle.getY().toFixed(1)})`);
  }

  setPlayerTarget(player: Player): void {
    this.playerTarget = player;
  }
}

class RenderVisitor implements GameVisitor {
  private renderLog: string[] = [];

  visitPlayer(player: Player): void {
    this.renderLog.push(`[RENDER] Player ${player.getName()}:`);
    this.renderLog.push(`[RENDER]   Position: (${player.getX().toFixed(1)}, ${player.getY().toFixed(1)})`);
    this.renderLog.push(`[RENDER]   Health: ${player.getHealth()}/100`);
    this.renderLog.push(`[RENDER]   Score: ${player.getScore()}`);
  }

  visitEnemy(enemy: Enemy): void {
    if (enemy.isAlive()) {
      this.renderLog.push(`[RENDER] Enemy ${enemy.getType()}:`);
      this.renderLog.push(`[RENDER]   Position: (${enemy.getX().toFixed(1)}, ${enemy.getY().toFixed(1)})`);
      this.renderLog.push(`[RENDER]   Health: ${enemy.getHealth()}/50`);
    }
  }

  visitItem(item: Item): void {
    if (!item.isCollected()) {
      this.renderLog.push(`[RENDER] Item ${item.getType()}:`);
      this.renderLog.push(`[RENDER]   Position: (${item.getX().toFixed(1)}, ${item.getY().toFixed(1)})`);
      this.renderLog.push(`[RENDER]   Value: ${item.getValue()}`);
    }
  }

  visitObstacle(obstacle: Obstacle): void {
    this.renderLog.push(`[RENDER] Obstacle ${obstacle.getType()}:`);
    this.renderLog.push(`[RENDER]   Position: (${obstacle.getX().toFixed(1)}, ${obstacle.getY().toFixed(1)})`);
  }

  getRenderLog(): string[] {
    return this.renderLog;
  }
}

class SerializeVisitor implements GameVisitor {
  private gameState: any = {
    players: [],
    enemies: [],
    items: [],
    obstacles: []
  };

  visitPlayer(player: Player): void {
    this.gameState.players.push({
      id: player.getId(),
      name: player.getName(),
      x: player.getX(),
      y: player.getY(),
      health: player.getHealth(),
      score: player.getScore(),
      inventory: player.getInventory()
    });
  }

  visitEnemy(enemy: Enemy): void {
    this.gameState.enemies.push({
      id: enemy.getId(),
      type: enemy.getType(),
      x: enemy.getX(),
      y: enemy.getY(),
      health: enemy.getHealth(),
      alive: enemy.isAlive()
    });
  }

  visitItem(item: Item): void {
    this.gameState.items.push({
      id: item.getId(),
      type: item.getType(),
      x: item.getX(),
      y: item.getY(),
      value: item.getValue(),
      collected: item.isCollected()
    });
  }

  visitObstacle(obstacle: Obstacle): void {
    this.gameState.obstacles.push({
      id: obstacle.getId(),
      type: obstacle.getType(),
      x: obstacle.getX(),
      y: obstacle.getY()
    });
  }

  getSerializedState(): string {
    return JSON.stringify(this.gameState, null, 2);
  }
}

class CollisionVisitor implements GameVisitor {
  private collisions: string[] = [];
  private player?: Player;

  setPlayer(player: Player): void {
    this.player = player;
  }

  visitPlayer(player: Player): void {
    // Player collision detection is handled by other objects
  }

  visitEnemy(enemy: Enemy): void {
    if (this.player && enemy.isAlive()) {
      if (this.checkCollision(this.player, enemy)) {
        this.collisions.push(`[COLLISION] Player ${this.player.getName()} collided with enemy ${enemy.getType()}`);
        this.player.takeDamage(enemy.getDamage());
        console.log(`[COLLISION] Player took ${enemy.getDamage()} damage! Health: ${this.player.getHealth()}`);
      }
    }
  }

  visitItem(item: Item): void {
    if (this.player && !item.isCollected()) {
      if (this.checkCollision(this.player, item)) {
        this.collisions.push(`[COLLISION] Player ${this.player.getName()} collected item ${item.getType()}`);
        item.collect();
        this.player.addScore(item.getValue());
        this.player.addToInventory(item.getType());
        console.log(`[COLLISION] Player collected ${item.getType()}! Score: ${this.player.getScore()}`);
      }
    }
  }

  visitObstacle(obstacle: Obstacle): void {
    if (this.player) {
      if (this.checkCollision(this.player, obstacle)) {
        this.collisions.push(`[COLLISION] Player ${this.player.getName()} hit obstacle ${obstacle.getType()}`);
        console.log(`[COLLISION] Player hit ${obstacle.getType()}! Movement blocked.`);
      }
    }
  }

  private checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    return obj1.getX() < obj2.getX() + obj2.getWidth() &&
           obj1.getX() + obj1.getWidth() > obj2.getX() &&
           obj1.getY() < obj2.getY() + obj2.getHeight() &&
           obj1.getY() + obj1.getHeight() > obj2.getY();
  }

  getCollisions(): string[] {
    return this.collisions;
  }
}

// ============================================================================
// GAME WORLD
// ============================================================================

class GameWorld {
  private objects: GameObject[] = [];

  addObject(object: GameObject): void {
    this.objects.push(object);
  }

  accept(visitor: GameVisitor): void {
    this.objects.forEach(obj => obj.accept(visitor));
  }

  getObjectCount(): number {
    return this.objects.length;
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

function demonstrateGameEngine(): void {
  console.log("🎮 Game Engine with Visitor Pattern");
  console.log("===================================\n");

  // Create a game world with various objects
  const world = new GameWorld();
  
  // Add a player
  const player = new Player("player1", 100, 100, 32, 32, "Hero");
  world.addObject(player);
  
  // Add enemies
  const enemy1 = new Enemy("enemy1", 200, 150, 24, 24, "goblin");
  const enemy2 = new Enemy("enemy2", 300, 200, 24, 24, "orc");
  world.addObject(enemy1);
  world.addObject(enemy2);
  
  // Add items
  const coin = new Item("coin1", 150, 120, 16, 16, "coin", 10);
  const potion = new Item("potion1", 250, 180, 16, 16, "potion", 25);
  world.addObject(coin);
  world.addObject(potion);
  
  // Add obstacles
  const wall = new Obstacle("wall1", 180, 100, 64, 64, "wall");
  const tree = new Obstacle("tree1", 350, 150, 48, 48, "tree");
  world.addObject(wall);
  world.addObject(tree);

  console.log(`Game world created with ${world.getObjectCount()} objects\n`);

  // Test 1: Update Operation
  console.log("1️⃣ Update Operation:");
  console.log("-------------------");
  const updateVisitor = new UpdateVisitor(16.67, player);
  world.accept(updateVisitor);
  console.log();

  // Test 2: Render Operation
  console.log("2️⃣ Render Operation:");
  console.log("-------------------");
  const renderVisitor = new RenderVisitor();
  world.accept(renderVisitor);
  
  console.log("Render log:");
  renderVisitor.getRenderLog().forEach(log => console.log(log));
  console.log();

  // Test 3: Serialization
  console.log("3️⃣ Serialization Operation:");
  console.log("----------------------------");
  const serializeVisitor = new SerializeVisitor();
  world.accept(serializeVisitor);
  
  console.log("Serialized game state:");
  console.log(serializeVisitor.getSerializedState());
  console.log();

  // Test 4: Collision Detection
  console.log("4️⃣ Collision Detection:");
  console.log("------------------------");
  const collisionVisitor = new CollisionVisitor();
  collisionVisitor.setPlayer(player);
  world.accept(collisionVisitor);
  
  console.log("Collision log:");
  collisionVisitor.getCollisions().forEach(collision => console.log(collision));
  console.log();

  // Test 5: Game Loop Simulation
  console.log("5️⃣ Game Loop Simulation:");
  console.log("-------------------------");
  
  // Move player and simulate game loop
  player.move(50, 30);
  enemy1.takeDamage(20);
  
  const gameLoopVisitor = new UpdateVisitor(16.67, player);
  world.accept(gameLoopVisitor);
  
  const gameLoopCollision = new CollisionVisitor();
  gameLoopCollision.setPlayer(player);
  world.accept(gameLoopCollision);
  
  console.log("Game loop collision results:");
  gameLoopCollision.getCollisions().forEach(collision => console.log(collision));
  console.log();
}

if (require.main === module) {
  try {
    demonstrateGameEngine();
    console.log("✅ All game engine operations completed successfully!");
  } catch (error) {
    console.error("❌ Error during game engine operations:", error);
    exit(1);
  }
}

export {
  GameVisitor,
  GameObject,
  Player,
  Enemy,
  Item,
  Obstacle,
  UpdateVisitor,
  RenderVisitor,
  SerializeVisitor,
  CollisionVisitor,
  GameWorld
}; 