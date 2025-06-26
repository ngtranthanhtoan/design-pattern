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

// Game Object base class
abstract class GameObject implements Colleague {
  protected mediator: Mediator | null = null;
  protected position: { x: number; y: number } = { x: 0, y: 0 };
  protected active: boolean = true;

  constructor(
    protected id: string,
    protected name: string
  ) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`🎮 ${this.name}: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`🎮 ${this.name}: Received ${event}`);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  abstract update(): void;
  abstract getStatus(): any;
}

// Player class
class Player extends GameObject {
  private health: number = 100;

  update(): void {
    this.send('player_update', { position: this.position });
  }

  getStatus(): any {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      health: this.health,
      active: this.active
    };
  }

  move(direction: { x: number; y: number }): void {
    this.position.x += direction.x;
    this.position.y += direction.y;
    this.send('player_moved', { position: this.position });
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    console.log(`    🎮 ${this.name}: Took ${amount} damage. Health: ${this.health}`);
    
    if (this.health <= 0) {
      this.active = false;
      this.send('player_died', { playerId: this.id });
    }
  }
}

// Enemy class
class Enemy extends GameObject {
  private health: number = 50;

  update(): void {
    this.send('enemy_update', { position: this.position });
  }

  getStatus(): any {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      health: this.health,
      active: this.active
    };
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    console.log(`    🎮 ${this.name}: Took ${amount} damage. Health: ${this.health}`);
    
    if (this.health <= 0) {
      this.active = false;
      this.send('enemy_died', { enemyId: this.id });
    }
  }
}

// Physics Component
class PhysicsComponent implements Colleague {
  private mediator: Mediator | null = null;

  constructor(private id: string) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`⚡ Physics: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`⚡ Physics: Received ${event}`);
    
    if (event === 'update_physics') {
      console.log(`    ⚡ Physics: Updating physics simulation`);
      this.send('physics_updated');
    }
  }

  getId(): string {
    return this.id;
  }
}

// Rendering Component
class RenderingComponent implements Colleague {
  private mediator: Mediator | null = null;
  private renderQueue: any[] = [];

  constructor(private id: string) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`🎨 Rendering: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`🎨 Rendering: Received ${event}`);
    
    if (event === 'render_object') {
      const { objectId, position } = data;
      this.renderQueue.push({ objectId, position });
      console.log(`    🎨 Rendering: Added ${objectId} to render queue`);
    }
    
    if (event === 'render_frame') {
      const { frameNumber } = data;
      console.log(`    🎨 Rendering: Rendering frame ${frameNumber} (${this.renderQueue.length} objects)`);
      this.renderQueue = [];
    }
  }

  getId(): string {
    return this.id;
  }
}

// Audio Component
class AudioComponent implements Colleague {
  private mediator: Mediator | null = null;

  constructor(private id: string) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`🔊 Audio: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`🔊 Audio: Received ${event}`);
    
    if (event === 'play_sound') {
      const { soundId } = data;
      console.log(`    🔊 Audio: Playing sound ${soundId}`);
    }
  }

  getId(): string {
    return this.id;
  }
}

// Input Component
class InputComponent implements Colleague {
  private mediator: Mediator | null = null;

  constructor(private id: string) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`⌨️  Input: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`⌨️  Input: Received ${event}`);
    
    if (event === 'key_press') {
      const { key } = data;
      console.log(`    ⌨️  Input: Key pressed: ${key}`);
      this.send('input_event', { type: 'key_press', key });
    }
  }

  getId(): string {
    return this.id;
  }
}

// Game Engine Mediator
class GameEngineMediator implements Mediator {
  private gameObjects: Map<string, GameObject> = new Map();
  private physicsComponent: PhysicsComponent | null = null;
  private renderingComponent: RenderingComponent | null = null;
  private audioComponent: AudioComponent | null = null;
  private inputComponent: InputComponent | null = null;
  private frameCount: number = 0;

  setPhysicsComponent(component: PhysicsComponent): void {
    this.physicsComponent = component;
    component.setMediator(this);
    console.log(`⚡ Game Engine: Physics component registered`);
  }

  setRenderingComponent(component: RenderingComponent): void {
    this.renderingComponent = component;
    component.setMediator(this);
    console.log(`🎨 Game Engine: Rendering component registered`);
  }

  setAudioComponent(component: AudioComponent): void {
    this.audioComponent = component;
    component.setMediator(this);
    console.log(`🔊 Game Engine: Audio component registered`);
  }

  setInputComponent(component: InputComponent): void {
    this.inputComponent = component;
    component.setMediator(this);
    console.log(`⌨️  Game Engine: Input component registered`);
  }

  notify(sender: Colleague, event: string, data?: any): void {
    console.log(`🎯 Game Engine: Routing ${event} from ${sender.getId()}`);
    
    switch (event) {
      case 'add_game_object':
        this.handleAddGameObject(data);
        break;
      case 'player_moved':
        this.handlePlayerMoved(sender as Player, data);
        break;
      case 'player_died':
        this.handlePlayerDied(data);
        break;
      case 'enemy_died':
        this.handleEnemyDied(data);
        break;
      case 'input_event':
        this.handleInputEvent(data);
        break;
    }
  }

  private handleAddGameObject(data: any): void {
    const { gameObject } = data;
    this.gameObjects.set(gameObject.getId(), gameObject);
    gameObject.setMediator(this);
    
    console.log(`🎮 Game Engine: Game object ${gameObject.getName()} added`);
    
    // Register with rendering
    if (this.renderingComponent) {
      this.renderingComponent.send('render_object', {
        objectId: gameObject.getId(),
        position: gameObject.getStatus().position
      });
    }
  }

  private handlePlayerMoved(player: Player, data: any): void {
    const { position } = data;
    
    // Update physics
    if (this.physicsComponent) {
      this.physicsComponent.send('update_physics');
    }
    
    // Play movement sound
    if (this.audioComponent) {
      this.audioComponent.send('play_sound', { soundId: 'footstep' });
    }
  }

  private handlePlayerDied(data: any): void {
    const { playerId } = data;
    console.log(`💀 Game Engine: Player ${playerId} died`);
    
    // Play death sound
    if (this.audioComponent) {
      this.audioComponent.send('play_sound', { soundId: 'player_death' });
    }
  }

  private handleEnemyDied(data: any): void {
    const { enemyId } = data;
    console.log(`💀 Game Engine: Enemy ${enemyId} died`);
    
    // Play death sound
    if (this.audioComponent) {
      this.audioComponent.send('play_sound', { soundId: 'enemy_death' });
    }
  }

  private handleInputEvent(data: any): void {
    const { type, key } = data;
    
    // Handle player input
    this.gameObjects.forEach(gameObject => {
      if (gameObject instanceof Player) {
        if (type === 'key_press') {
          switch (key) {
            case 'w':
              gameObject.move({ x: 0, y: -1 });
              break;
            case 's':
              gameObject.move({ x: 0, y: 1 });
              break;
            case 'a':
              gameObject.move({ x: -1, y: 0 });
              break;
            case 'd':
              gameObject.move({ x: 1, y: 0 });
              break;
          }
        }
      }
    });
  }

  // Game engine-specific methods
  addGameObject(gameObject: GameObject): void {
    this.handleAddGameObject({ gameObject });
  }

  update(): void {
    this.frameCount++;
    
    // Update all game objects
    this.gameObjects.forEach(gameObject => {
      if (gameObject.getStatus().active) {
        gameObject.update();
      }
    });
    
    // Render frame
    if (this.renderingComponent) {
      this.renderingComponent.send('render_frame', { frameNumber: this.frameCount });
    }
  }

  getGameStatus(): any {
    return {
      frameCount: this.frameCount,
      activeObjects: Array.from(this.gameObjects.values()).filter(obj => obj.getStatus().active).length,
      totalObjects: this.gameObjects.size
    };
  }
}

// Demo
console.log('=== GAME ENGINE COMPONENT SYSTEM MEDIATOR DEMO ===\n');

// Create mediator
const gameEngine = new GameEngineMediator();

// Create components
const physicsComponent = new PhysicsComponent('physics-001');
const renderingComponent = new RenderingComponent('rendering-001');
const audioComponent = new AudioComponent('audio-001');
const inputComponent = new InputComponent('input-001');

// Register components
gameEngine.setPhysicsComponent(physicsComponent);
gameEngine.setRenderingComponent(renderingComponent);
gameEngine.setAudioComponent(audioComponent);
gameEngine.setInputComponent(inputComponent);

// Create game objects
const player = new Player('player-001', 'Hero');
const enemy1 = new Enemy('enemy-001', 'Goblin');
const enemy2 = new Enemy('enemy-002', 'Orc');

// Add game objects
gameEngine.addGameObject(player);
gameEngine.addGameObject(enemy1);
gameEngine.addGameObject(enemy2);

console.log('\n--- Game Engine Interactions ---');

// Simulate game loop
for (let i = 0; i < 3; i++) {
  console.log(`\n--- Frame ${i + 1} ---`);
  gameEngine.update();
  
  // Simulate input
  if (i === 1) {
    inputComponent.send('key_press', { key: 'w' });
  }
}

// Simulate combat
player.takeDamage(20);
enemy1.takeDamage(30);

console.log('\n--- Game Status ---');
const status = gameEngine.getGameStatus();
console.log('Game Status:', status);

console.log('\n✅ Game engine component system mediation completed successfully');

exit(0); 