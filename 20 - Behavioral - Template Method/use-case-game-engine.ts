/**
 * Template Method Pattern - Game Engine Loop Use Case
 * 
 * Demonstrates how to use Template Method to create a standardized game loop
 * where different games can customize specific update and render logic while
 * maintaining the same overall game loop structure.
 */

import { exit } from "process";

// =============================================================================
// INTERFACES AND TYPES
// =============================================================================

interface GameState {
  isRunning: boolean;
  currentFrame: number;
  deltaTime: number;
  fps: number;
  entities: GameEntity[];
  score: number;
  level: number;
}

interface GameEntity {
  id: string;
  x: number;
  y: number;
  velocity: { x: number; y: number };
  health: number;
  isActive: boolean;
}

interface InputState {
  keys: { [key: string]: boolean };
  mouse: { x: number; y: number; buttons: { [button: number]: boolean } };
  gamepad?: { axes: number[]; buttons: boolean[] };
}

interface GameConfig {
  name: string;
  targetFps: number;
  maxFrames: number;
  maxEntities: number;
  enablePhysics: boolean;
  enableAudio: boolean;
  enableNetworking: boolean;
}

interface GameResult {
  success: boolean;
  message: string;
  framesProcessed: number;
  averageFps: number;
  errors?: string[];
}

// =============================================================================
// ABSTRACT CLASS - GAME ENGINE TEMPLATE
// =============================================================================

abstract class GameEngine {
  protected config: GameConfig;
  protected state: GameState;
  protected input: InputState;
  protected frameCount: number = 0;
  protected startTime: number = Date.now();
  protected lastFrameTime: number = 0;

  constructor(config: GameConfig) {
    this.config = config;
    this.state = {
      isRunning: false,
      currentFrame: 0,
      deltaTime: 0,
      fps: 0,
      entities: [],
      score: 0,
      level: 1
    };
    this.input = {
      keys: {},
      mouse: { x: 0, y: 0, buttons: {} }
    };
  }

  /**
   * Template Method: Defines the overall game loop
   * This method orchestrates the input → update → render cycle
   */
  public gameLoop(): GameResult {
    console.log(`🎮 Starting game loop for ${this.config.name}`);
    console.log(`   Target FPS: ${this.config.targetFps}`);
    console.log(`   Physics: ${this.config.enablePhysics ? 'Enabled' : 'Disabled'}`);
    console.log(`   Audio: ${this.config.enableAudio ? 'Enabled' : 'Disabled'}`);
    
    try {
      // Step 1: Initialize the game
      this.initialize();
      
      // Step 2: Start the main game loop
      this.state.isRunning = true;
      
      while (this.state.isRunning && this.shouldContinue()) {
        const currentTime = Date.now();
        this.state.deltaTime = currentTime - this.lastFrameTime;
        this.state.currentFrame = this.frameCount;
        
        // Step 3: Process input
        this.processInput();
        
        // Step 4: Update game state
        const updateResult = this.update();
        if (!updateResult.success) {
          return updateResult;
        }
        
        // Step 5: Render the game
        const renderResult = this.render();
        if (!renderResult.success) {
          return renderResult;
        }
        
        // Step 6: Handle frame timing
        this.handleFrameTiming();
        
        this.frameCount++;
        this.lastFrameTime = currentTime;
        
        // Step 7: Check for game over conditions
        if (this.isGameOver()) {
          this.state.isRunning = false;
        }
      }
      
      // Step 8: Cleanup and finalize
      this.cleanup();
      
      const totalTime = (Date.now() - this.startTime) / 1000;
      const averageFps = this.frameCount / totalTime;
      
      return {
        success: true,
        message: `✅ Game loop completed successfully for ${this.config.name}`,
        framesProcessed: this.frameCount,
        averageFps: Math.round(averageFps)
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Game loop failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        framesProcessed: this.frameCount,
        averageFps: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // =============================================================================
  // PRIMITIVE OPERATIONS - Must be implemented by subclasses
  // =============================================================================

  /**
   * Update game state - must be implemented by each game type
   */
  protected abstract update(): GameResult;

  /**
   * Render the game - must be implemented by each game type
   */
  protected abstract render(): GameResult;

  /**
   * Initialize game-specific components - must be implemented by each game type
   */
  protected abstract initialize(): void;

  // =============================================================================
  // HOOK METHODS - Optional methods that subclasses can override
  // =============================================================================

  /**
   * Hook method: Should the game continue running?
   * Default implementation returns the running state
   */
  protected shouldContinue(): boolean {
    return this.state.isRunning;
  }

  /**
   * Hook method: Should run before rendering
   * Default implementation does nothing
   */
  protected beforeRender(): void {
    // Optional hook - subclasses can override
  }

  /**
   * Hook method: Should run after updating
   * Default implementation does nothing
   */
  protected afterUpdate(): void {
    // Optional hook - subclasses can override
  }

  /**
   * Hook method: Should run before input processing
   * Default implementation does nothing
   */
  protected beforeInput(): void {
    // Optional hook - subclasses can override
  }

  // =============================================================================
  // CONCRETE OPERATIONS - Common implementations shared by all subclasses
  // =============================================================================

  /**
   * Process input from various sources
   */
  protected processInput(): void {
    this.beforeInput(); // Hook method call
    
    // Simulate input processing
    this.input.keys = {
      'ArrowUp': Math.random() > 0.7,
      'ArrowDown': Math.random() > 0.7,
      'ArrowLeft': Math.random() > 0.7,
      'ArrowRight': Math.random() > 0.7,
      'Space': Math.random() > 0.9,
      'Escape': Math.random() > 0.95
    };
    
    this.input.mouse = {
      x: Math.random() * 800,
      y: Math.random() * 600,
      buttons: {
        0: Math.random() > 0.8, // Left click
        2: Math.random() > 0.9  // Right click
      }
    };
    
    if (this.config.enableNetworking) {
      // Simulate network input processing
      console.log(`   🌐 Processing network input`);
    }
  }

  /**
   * Handle frame timing and FPS limiting
   */
  protected handleFrameTiming(): void {
    const targetFrameTime = 1000 / this.config.targetFps;
    const actualFrameTime = this.state.deltaTime;
    
    if (actualFrameTime < targetFrameTime) {
      // Frame was too fast, add delay
      const delay = targetFrameTime - actualFrameTime;
      // In a real implementation, this would use setTimeout or similar
    }
    
    this.state.fps = Math.round(1000 / actualFrameTime);
  }

  /**
   * Check if the game should end
   */
  protected isGameOver(): boolean {
    return this.state.score < 0 || this.state.level > 100;
  }

  /**
   * Cleanup resources
   */
  protected cleanup(): void {
    console.log(`🧹 Cleaning up game resources for ${this.config.name}`);
    this.state.entities = [];
  }
}

// =============================================================================
// CONCRETE IMPLEMENTATIONS
// =============================================================================

/**
 * Platformer Game Engine
 */
class PlatformerEngine extends GameEngine {
  private playerPosition = { x: 100, y: 300 };

  protected override initialize(): void {
    console.log(`🏃 Initializing platformer game: ${this.config.name}`);
    console.log(`   ✅ Platformer game initialized`);
    
    // Create player entity
    this.state.entities.push({
      id: 'player',
      x: 100,
      y: 300,
      velocity: { x: 0, y: 0 },
      health: 100,
      isActive: true
    });
    
    // Create some platforms
    for (let i = 0; i < 5; i++) {
      this.state.entities.push({
        id: `platform_${i}`,
        x: i * 200,
        y: 400 + (i % 2) * 50,
        velocity: { x: 0, y: 0 },
        health: 1,
        isActive: true
      });
    }
    
    console.log(`   ✅ Created ${this.state.entities.length} entities`);
  }

  protected override update(): GameResult {
    console.log(`🔄 Updating platformer game state (Frame ${this.state.currentFrame})`);
    
    // Simulate platformer-specific updates
    const updateSuccess = Math.random() > 0.05; // 95% success rate
    
    if (updateSuccess) {
      // Update player physics
      const player = this.state.entities.find(e => e.id === 'player');
      if (player) {
        // Apply gravity
        player.velocity.y += 0.5;
        
        // Handle input
        if (this.input.keys['ArrowLeft']) {
          player.velocity.x = -5;
        } else if (this.input.keys['ArrowRight']) {
          player.velocity.x = 5;
        } else {
          player.velocity.x *= 0.8; // Friction
        }
        
        if (this.input.keys['Space'] && player.y >= 350) {
          player.velocity.y = -15; // Jump
        }
        
        // Update position
        player.x += player.velocity.x;
        player.y += player.velocity.y;
        
        // Simple collision detection with ground
        if (player.y > 350) {
          player.y = 350;
          player.velocity.y = 0;
        }
      }
      
      // Update score based on player position
      this.state.score = Math.floor(player?.x || 0);
      
      this.afterUpdate(); // Hook method call
      return { 
        success: true, 
        message: "Platformer update completed", 
        framesProcessed: this.state.currentFrame,
        averageFps: this.state.fps
      };
    } else {
      console.log(`   ❌ Platformer update failed`);
      return { 
        success: false, 
        message: "Platformer update failed", 
        framesProcessed: this.state.currentFrame,
        averageFps: 0,
        errors: ["Update error"]
      };
    }
  }

  protected override render(): GameResult {
    this.beforeRender(); // Hook method call
    
    console.log(`🎨 Rendering platformer game (Frame ${this.state.currentFrame})`);
    
    // Simulate platformer-specific rendering
    const renderSuccess = Math.random() > 0.08; // 92% success rate
    
    if (renderSuccess) {
      const player = this.state.entities.find(e => e.id === 'player');
      if (player) {
        console.log(`   👤 Player at (${Math.round(player.x)}, ${Math.round(player.y)})`);
        console.log(`   🏃 Velocity: (${player.velocity.x.toFixed(1)}, ${player.velocity.y.toFixed(1)})`);
      }
      
      console.log(`   📊 Score: ${this.state.score}, Level: ${this.state.level}`);
      console.log(`   🎯 FPS: ${this.state.fps}`);
      
      return { 
        success: true, 
        message: "Platformer render completed", 
        framesProcessed: this.state.currentFrame,
        averageFps: this.state.fps
      };
    } else {
      console.log(`   ❌ Platformer render failed`);
      return { 
        success: false, 
        message: "Platformer render failed", 
        framesProcessed: this.state.currentFrame,
        averageFps: 0,
        errors: ["Render error"]
      };
    }
  }

  protected override shouldContinue(): boolean {
    return this.state.isRunning && this.state.currentFrame < this.config.maxFrames && this.state.score < 500;
  }

  protected override beforeRender(): void {
    console.log(`   🎬 Preparing platformer scene`);
  }

  protected override afterUpdate(): void {
    console.log(`   ⚡ Applying platformer physics`);
  }

  protected override beforeInput(): void {
    console.log(`   🎮 Processing platformer input`);
  }
}

/**
 * Shooter Game Engine
 */
class ShooterEngine extends GameEngine {
  private playerHealth = 100;
  private enemies = 3;

  protected override initialize(): void {
    console.log(`🔫 Initializing shooter game: ${this.config.name}`);
    console.log(`   ✅ Shooter game initialized with ${this.enemies} enemies`);
    
    // Create player entity
    this.state.entities.push({
      id: 'player',
      x: 400,
      y: 300,
      velocity: { x: 0, y: 0 },
      health: 100,
      isActive: true
    });
    
    // Create some enemies
    for (let i = 0; i < 3; i++) {
      this.state.entities.push({
        id: `enemy_${i}`,
        x: 100 + i * 150,
        y: 100 + i * 50,
        velocity: { x: 2, y: 0 },
        health: 50,
        isActive: true
      });
    }
    
    console.log(`   ✅ Created ${this.state.entities.length} entities`);
  }

  protected override update(): GameResult {
    console.log(`🔄 Updating shooter game state (Frame ${this.state.currentFrame})`);
    
    // Simulate shooter-specific updates
    const updateSuccess = Math.random() > 0.06; // 94% success rate
    
    if (updateSuccess) {
      // Update player movement
      const player = this.state.entities.find(e => e.id === 'player');
      if (player) {
        if (this.input.keys['ArrowLeft']) {
          player.x -= 3;
        }
        if (this.input.keys['ArrowRight']) {
          player.x += 3;
        }
        if (this.input.keys['ArrowUp']) {
          player.y -= 3;
        }
        if (this.input.keys['ArrowDown']) {
          player.y += 3;
        }
        
        // Keep player in bounds
        player.x = Math.max(0, Math.min(800, player.x));
        player.y = Math.max(0, Math.min(600, player.y));
      }
      
      // Update enemies
      this.state.entities
        .filter(e => e.id.startsWith('enemy'))
        .forEach(enemy => {
          enemy.x += enemy.velocity.x;
          
          // Bounce off walls
          if (enemy.x <= 0 || enemy.x >= 800) {
            enemy.velocity.x *= -1;
          }
          
          // Simple AI: move towards player
          if (player && Math.random() > 0.95) {
            enemy.velocity.x = player.x > enemy.x ? 1 : -1;
          }
        });
      
      // Handle shooting
      if (this.input.keys['Space']) {
        this.state.score += 10;
      }
      
      // Check collisions
      this.checkCollisions();
      
      this.afterUpdate(); // Hook method call
      return { 
        success: true, 
        message: "Shooter update completed", 
        framesProcessed: this.state.currentFrame,
        averageFps: this.state.fps
      };
    } else {
      console.log(`   ❌ Shooter update failed`);
      return { 
        success: false, 
        message: "Shooter update failed", 
        framesProcessed: this.state.currentFrame,
        averageFps: 0,
        errors: ["Update error"]
      };
    }
  }

  protected override render(): GameResult {
    this.beforeRender(); // Hook method call
    
    console.log(`🎨 Rendering shooter game (Frame ${this.state.currentFrame})`);
    
    // Simulate shooter-specific rendering
    const renderSuccess = Math.random() > 0.1; // 90% success rate
    
    if (renderSuccess) {
      const player = this.state.entities.find(e => e.id === 'player');
      const enemies = this.state.entities.filter(e => e.id.startsWith('enemy'));
      
      if (player) {
        console.log(`   👤 Player at (${Math.round(player.x)}, ${Math.round(player.y)}) - Health: ${player.health}`);
      }
      
      console.log(`   👾 Enemies: ${enemies.length} active`);
      console.log(`   🎯 Score: ${this.state.score}, Level: ${this.state.level}`);
      console.log(`   🎯 FPS: ${this.state.fps}`);
      
      return { 
        success: true, 
        message: "Shooter render completed", 
        framesProcessed: this.state.currentFrame,
        averageFps: this.state.fps
      };
    } else {
      console.log(`   ❌ Shooter render failed`);
      return { 
        success: false, 
        message: "Shooter render failed", 
        framesProcessed: this.state.currentFrame,
        averageFps: 0,
        errors: ["Render error"]
      };
    }
  }

  protected override shouldContinue(): boolean {
    return this.state.isRunning && this.state.currentFrame < this.config.maxFrames && this.playerHealth > 0;
  }

  protected override beforeRender(): void {
    console.log(`   🎬 Preparing shooter scene with effects`);
  }

  protected override afterUpdate(): void {
    console.log(`   ⚡ Applying shooter physics and collision detection`);
  }

  protected override beforeInput(): void {
    console.log(`   🎮 Processing shooter input with aim assist`);
  }

  private checkCollisions(): void {
    const player = this.state.entities.find(e => e.id === 'player');
    const enemies = this.state.entities.filter(e => e.id.startsWith('enemy'));
    
    if (player) {
      enemies.forEach(enemy => {
        const distance = Math.sqrt(
          Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
        );
        
        if (distance < 30) {
          player.health -= 1;
          enemy.health -= 10;
          
          if (enemy.health <= 0) {
            enemy.isActive = false;
            this.state.score += 100;
          }
        }
      });
    }
  }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

function demonstrateGameEngine(): void {
  console.log("🎮 Game Engine Template Method Pattern Demo");
  console.log("===========================================");
  console.log();

  // Create different game configurations
  const platformerConfig: GameConfig = {
    name: "Super Adventure",
    targetFps: 60,
    maxFrames: 1000,
    maxEntities: 100,
    enablePhysics: true,
    enableAudio: true,
    enableNetworking: false
  };

  const shooterConfig: GameConfig = {
    name: "Space Warriors",
    targetFps: 120,
    maxFrames: 1000,
    maxEntities: 50,
    enablePhysics: true,
    enableAudio: true,
    enableNetworking: true
  };

  // Create game engines
  const platformerEngine = new PlatformerEngine(platformerConfig);
  const shooterEngine = new ShooterEngine(shooterConfig);

  // Run game loops (simplified for demo)
  console.log("1. Running Platformer Game:");
  const platformerResult = platformerEngine.gameLoop();
  console.log(`   Result: ${platformerResult.message}`);
  console.log(`   Frames: ${platformerResult.framesProcessed}, Avg FPS: ${platformerResult.averageFps}`);
  console.log();

  console.log("2. Running Shooter Game:");
  const shooterResult = shooterEngine.gameLoop();
  console.log(`   Result: ${shooterResult.message}`);
  console.log(`   Frames: ${shooterResult.framesProcessed}, Avg FPS: ${shooterResult.averageFps}`);
  console.log();
}

function testGameEngine(): void {
  console.log("🧪 Testing Game Engine Edge Cases");
  console.log("=================================");
  console.log();

  // Test with different configurations
  const testConfigs: GameConfig[] = [
    {
      name: "Test Platformer",
      targetFps: 30,
      maxFrames: 1000,
      maxEntities: 10,
      enablePhysics: false,
      enableAudio: false,
      enableNetworking: false
    },
    {
      name: "Test Shooter",
      targetFps: 60,
      maxFrames: 1000,
      maxEntities: 5,
      enablePhysics: true,
      enableAudio: false,
      enableNetworking: false
    }
  ];

  testConfigs.forEach((config, index) => {
    console.log(`Test ${index + 1}: ${config.name}`);
    
    const engine = config.name.includes('Platformer') 
      ? new PlatformerEngine(config)
      : new ShooterEngine(config);
    
    const result = engine.gameLoop();
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Frames: ${result.framesProcessed}, FPS: ${result.averageFps}`);
    if (result.errors) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
    console.log();
  });
}

// =============================================================================
// DEMONSTRATION
// =============================================================================

function main(): void {
  try {
    demonstrateGameEngine();
    testGameEngine();
    
    console.log("✅ Template Method Pattern - Game Engine demonstration completed");
  } catch (error) {
    console.error("❌ Error during demonstration:", error);
  }
}

// Run the demonstration
main();

exit(0); 