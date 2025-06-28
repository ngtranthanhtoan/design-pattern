import { exit } from 'process';

// ===============================
// 1. Interfaces and Types
// ===============================

interface CharacterState {
  move(direction: string): void;
  jump(): void;
  attack(): void;
  takeDamage(amount: number): void;
  update(): void;
}

interface CharacterStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
}

// ===============================
// 2. State Classes
// ===============================

class Character {
  private state: CharacterState;
  private stats: CharacterStats;
  private name: string;
  private isGrounded: boolean = true;
  private attackCooldown: number = 0;
  private stunDuration: number = 0;

  constructor(name: string) {
    this.name = name;
    this.stats = {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 }
    };
    this.state = new IdleState(this);
  }

  setState(state: CharacterState) {
    this.state = state;
  }

  getStats(): CharacterStats {
    return { ...this.stats };
  }

  updateStats(updates: Partial<CharacterStats>) {
    this.stats = { ...this.stats, ...updates };
  }

  getName(): string {
    return this.name;
  }

  setGrounded(grounded: boolean) {
    this.isGrounded = grounded;
  }

  isOnGround(): boolean {
    return this.isGrounded;
  }

  setAttackCooldown(cooldown: number) {
    this.attackCooldown = cooldown;
  }

  canAttack(): boolean {
    return this.attackCooldown <= 0;
  }

  setStunDuration(duration: number) {
    this.stunDuration = duration;
  }

  isStunned(): boolean {
    return this.stunDuration > 0;
  }

  // State API
  move(direction: string) { this.state.move(direction); }
  jump() { this.state.jump(); }
  attack() { this.state.attack(); }
  takeDamage(amount: number) { this.state.takeDamage(amount); }
  update() { this.state.update(); }

  // For demonstration
  printStatus() {
    const stats = this.getStats();
    console.log(`\n[${this.name}] Health: ${stats.health}/${stats.maxHealth}, Stamina: ${stats.stamina}/${stats.maxStamina}`);
    console.log(`Position: (${stats.position.x}, ${stats.position.y}), Velocity: (${stats.velocity.x}, ${stats.velocity.y})`);
    console.log(`Grounded: ${this.isOnGround()}, Can Attack: ${this.canAttack()}, Stunned: ${this.isStunned()}`);
  }
}

// -------------------------------
// Idle State
// -------------------------------
class IdleState implements CharacterState {
  constructor(private character: Character) {}

  move(direction: string): void {
    const stats = this.character.getStats();
    const newVelocity = { ...stats.velocity };
    
    switch (direction) {
      case 'left':
        newVelocity.x = -2;
        break;
      case 'right':
        newVelocity.x = 2;
        break;
      default:
        console.log('⚠️ Invalid direction.');
        return;
    }
    
    this.character.updateStats({ velocity: newVelocity });
    console.log(`🚶 ${this.character.getName()} starts walking ${direction}.`);
    this.character.setState(new WalkingState(this.character));
  }

  jump(): void {
    if (!this.character.isOnGround()) {
      console.log('⚠️ Already in the air.');
      return;
    }
    
    const stats = this.character.getStats();
    if (stats.stamina < 20) {
      console.log('⚠️ Not enough stamina to jump.');
      return;
    }
    
    const newVelocity = { ...stats.velocity, y: -8 };
    this.character.updateStats({ 
      velocity: newVelocity,
      stamina: stats.stamina - 20
    });
    this.character.setGrounded(false);
    console.log(`🦘 ${this.character.getName()} jumps!`);
    this.character.setState(new JumpingState(this.character));
  }

  attack(): void {
    if (!this.character.canAttack()) {
      console.log('⚠️ Attack on cooldown.');
      return;
    }
    
    const stats = this.character.getStats();
    if (stats.stamina < 30) {
      console.log('⚠️ Not enough stamina to attack.');
      return;
    }
    
    this.character.updateStats({ stamina: stats.stamina - 30 });
    this.character.setAttackCooldown(60); // 60 frames cooldown
    console.log(`⚔️ ${this.character.getName()} attacks!`);
    this.character.setState(new AttackingState(this.character));
  }

  takeDamage(amount: number): void {
    const stats = this.character.getStats();
    const newHealth = Math.max(0, stats.health - amount);
    this.character.updateStats({ health: newHealth });
    
    console.log(`💥 ${this.character.getName()} takes ${amount} damage!`);
    
    if (newHealth === 0) {
      console.log(`💀 ${this.character.getName()} is defeated!`);
      this.character.setState(new DefeatedState(this.character));
    } else if (amount > 20) {
      console.log(`😵 ${this.character.getName()} is stunned!`);
      this.character.setStunDuration(120); // 120 frames stun
      this.character.setState(new StunnedState(this.character));
    }
  }

  update(): void {
    // Idle state - character recovers stamina
    const stats = this.character.getStats();
    if (stats.stamina < stats.maxStamina) {
      this.character.updateStats({ stamina: Math.min(stats.maxStamina, stats.stamina + 2) });
    }
  }
}

// -------------------------------
// Walking State
// -------------------------------
class WalkingState implements CharacterState {
  constructor(private character: Character) {}

  move(direction: string): void {
    const stats = this.character.getStats();
    const newVelocity = { ...stats.velocity };
    
    switch (direction) {
      case 'left':
        newVelocity.x = -4;
        break;
      case 'right':
        newVelocity.x = 4;
        break;
      case 'stop':
        newVelocity.x = 0;
        console.log(`🛑 ${this.character.getName()} stops walking.`);
        this.character.setState(new IdleState(this.character));
        return;
      default:
        console.log('⚠️ Invalid direction.');
        return;
    }
    
    this.character.updateStats({ velocity: newVelocity });
    console.log(`🏃 ${this.character.getName()} is running ${direction}.`);
    this.character.setState(new RunningState(this.character));
  }

  jump(): void {
    if (!this.character.isOnGround()) {
      console.log('⚠️ Already in the air.');
      return;
    }
    
    const stats = this.character.getStats();
    if (stats.stamina < 15) {
      console.log('⚠️ Not enough stamina to jump.');
      return;
    }
    
    const newVelocity = { ...stats.velocity, y: -10 };
    this.character.updateStats({ 
      velocity: newVelocity,
      stamina: stats.stamina - 15
    });
    this.character.setGrounded(false);
    console.log(`🦘 ${this.character.getName()} jumps while walking!`);
    this.character.setState(new JumpingState(this.character));
  }

  attack(): void {
    if (!this.character.canAttack()) {
      console.log('⚠️ Attack on cooldown.');
      return;
    }
    
    const stats = this.character.getStats();
    if (stats.stamina < 25) {
      console.log('⚠️ Not enough stamina to attack.');
      return;
    }
    
    this.character.updateStats({ stamina: stats.stamina - 25 });
    this.character.setAttackCooldown(45); // Faster attack while walking
    console.log(`⚔️ ${this.character.getName()} attacks while walking!`);
    this.character.setState(new AttackingState(this.character));
  }

  takeDamage(amount: number): void {
    const stats = this.character.getStats();
    const newHealth = Math.max(0, stats.health - amount);
    this.character.updateStats({ health: newHealth });
    
    console.log(`💥 ${this.character.getName()} takes ${amount} damage while walking!`);
    
    if (newHealth === 0) {
      console.log(`💀 ${this.character.getName()} is defeated!`);
      this.character.setState(new DefeatedState(this.character));
    } else if (amount > 15) {
      console.log(`😵 ${this.character.getName()} is stunned!`);
      this.character.setStunDuration(90);
      this.character.setState(new StunnedState(this.character));
    }
  }

  update(): void {
    // Walking state - moderate stamina recovery
    const stats = this.character.getStats();
    if (stats.stamina < stats.maxStamina) {
      this.character.updateStats({ stamina: Math.min(stats.maxStamina, stats.stamina + 1) });
    }
  }
}

// -------------------------------
// Running State
// -------------------------------
class RunningState implements CharacterState {
  constructor(private character: Character) {}

  move(direction: string): void {
    const stats = this.character.getStats();
    const newVelocity = { ...stats.velocity };
    
    switch (direction) {
      case 'left':
        newVelocity.x = -6;
        break;
      case 'right':
        newVelocity.x = 6;
        break;
      case 'stop':
        newVelocity.x = 0;
        console.log(`🛑 ${this.character.getName()} stops running.`);
        this.character.setState(new IdleState(this.character));
        return;
      default:
        console.log('⚠️ Invalid direction.');
        return;
    }
    
    this.character.updateStats({ velocity: newVelocity });
  }

  jump(): void {
    if (!this.character.isOnGround()) {
      console.log('⚠️ Already in the air.');
      return;
    }
    
    const stats = this.character.getStats();
    if (stats.stamina < 10) {
      console.log('⚠️ Not enough stamina to jump.');
      return;
    }
    
    const newVelocity = { ...stats.velocity, y: -12 };
    this.character.updateStats({ 
      velocity: newVelocity,
      stamina: stats.stamina - 10
    });
    this.character.setGrounded(false);
    console.log(`🦘 ${this.character.getName()} jumps while running!`);
    this.character.setState(new JumpingState(this.character));
  }

  attack(): void {
    if (!this.character.canAttack()) {
      console.log('⚠️ Attack on cooldown.');
      return;
    }
    
    const stats = this.character.getStats();
    if (stats.stamina < 20) {
      console.log('⚠️ Not enough stamina to attack.');
      return;
    }
    
    this.character.updateStats({ stamina: stats.stamina - 20 });
    this.character.setAttackCooldown(30); // Fastest attack while running
    console.log(`⚔️ ${this.character.getName()} attacks while running!`);
    this.character.setState(new AttackingState(this.character));
  }

  takeDamage(amount: number): void {
    const stats = this.character.getStats();
    const newHealth = Math.max(0, stats.health - amount);
    this.character.updateStats({ health: newHealth });
    
    console.log(`💥 ${this.character.getName()} takes ${amount} damage while running!`);
    
    if (newHealth === 0) {
      console.log(`💀 ${this.character.getName()} is defeated!`);
      this.character.setState(new DefeatedState(this.character));
    } else if (amount > 10) {
      console.log(`😵 ${this.character.getName()} is stunned!`);
      this.character.setStunDuration(60);
      this.character.setState(new StunnedState(this.character));
    }
  }

  update(): void {
    // Running state - consumes stamina
    const stats = this.character.getStats();
    this.character.updateStats({ stamina: Math.max(0, stats.stamina - 1) });
    
    if (stats.stamina === 0) {
      console.log(`😰 ${this.character.getName()} is exhausted from running!`);
      this.character.setState(new IdleState(this.character));
    }
  }
}

// -------------------------------
// Jumping State
// -------------------------------
class JumpingState implements CharacterState {
  constructor(private character: Character) {}

  move(direction: string): void {
    const stats = this.character.getStats();
    const newVelocity = { ...stats.velocity };
    
    switch (direction) {
      case 'left':
        newVelocity.x = -3;
        break;
      case 'right':
        newVelocity.x = 3;
        break;
      default:
        console.log('⚠️ Invalid direction.');
        return;
    }
    
    this.character.updateStats({ velocity: newVelocity });
    console.log(`🦘 ${this.character.getName()} moves ${direction} while jumping.`);
  }

  jump(): void {
    console.log('⚠️ Already jumping.');
  }

  attack(): void {
    if (!this.character.canAttack()) {
      console.log('⚠️ Attack on cooldown.');
      return;
    }
    
    const stats = this.character.getStats();
    if (stats.stamina < 35) {
      console.log('⚠️ Not enough stamina to attack while jumping.');
      return;
    }
    
    this.character.updateStats({ stamina: stats.stamina - 35 });
    this.character.setAttackCooldown(90); // Slower attack while jumping
    console.log(`⚔️ ${this.character.getName()} attacks while jumping!`);
    this.character.setState(new AttackingState(this.character));
  }

  takeDamage(amount: number): void {
    const stats = this.character.getStats();
    const newHealth = Math.max(0, stats.health - amount);
    this.character.updateStats({ health: newHealth });
    
    console.log(`💥 ${this.character.getName()} takes ${amount} damage while jumping!`);
    
    if (newHealth === 0) {
      console.log(`💀 ${this.character.getName()} is defeated!`);
      this.character.setState(new DefeatedState(this.character));
    } else if (amount > 25) {
      console.log(`😵 ${this.character.getName()} is stunned!`);
      this.character.setStunDuration(150);
      this.character.setState(new StunnedState(this.character));
    }
  }

  update(): void {
    // Jumping state - apply gravity
    const stats = this.character.getStats();
    const newVelocity = { ...stats.velocity, y: stats.velocity.y + 0.5 };
    const newPosition = { 
      x: stats.position.x + stats.velocity.x,
      y: stats.position.y + stats.velocity.y
    };
    
    this.character.updateStats({ 
      velocity: newVelocity,
      position: newPosition
    });
    
    // Check if landed
    if (newPosition.y >= 0) {
      this.character.updateStats({ 
        position: { x: newPosition.x, y: 0 },
        velocity: { x: newPosition.x > 0 ? 2 : -2, y: 0 }
      });
      this.character.setGrounded(true);
      console.log(`🛬 ${this.character.getName()} lands!`);
      this.character.setState(new WalkingState(this.character));
    }
  }
}

// -------------------------------
// Attacking State
// -------------------------------
class AttackingState implements CharacterState {
  private attackFrame: number = 0;
  
  constructor(private character: Character) {}

  move(direction: string): void {
    console.log('⚠️ Cannot move while attacking.');
  }

  jump(): void {
    console.log('⚠️ Cannot jump while attacking.');
  }

  attack(): void {
    console.log('⚠️ Already attacking.');
  }

  takeDamage(amount: number): void {
    const stats = this.character.getStats();
    const newHealth = Math.max(0, stats.health - amount);
    this.character.updateStats({ health: newHealth });
    
    console.log(`💥 ${this.character.getName()} takes ${amount} damage while attacking!`);
    
    if (newHealth === 0) {
      console.log(`💀 ${this.character.getName()} is defeated!`);
      this.character.setState(new DefeatedState(this.character));
    } else if (amount > 30) {
      console.log(`😵 ${this.character.getName()} is stunned!`);
      this.character.setStunDuration(180);
      this.character.setState(new StunnedState(this.character));
    }
  }

  update(): void {
    this.attackFrame++;
    
    if (this.attackFrame >= 30) { // Attack animation lasts 30 frames
      console.log(`✅ ${this.character.getName()} finishes attacking.`);
      this.character.setState(new IdleState(this.character));
    }
  }
}

// -------------------------------
// Stunned State
// -------------------------------
class StunnedState implements CharacterState {
  constructor(private character: Character) {}

  move(direction: string): void {
    console.log('⚠️ Cannot move while stunned.');
  }

  jump(): void {
    console.log('⚠️ Cannot jump while stunned.');
  }

  attack(): void {
    console.log('⚠️ Cannot attack while stunned.');
  }

  takeDamage(amount: number): void {
    const stats = this.character.getStats();
    const newHealth = Math.max(0, stats.health - amount);
    this.character.updateStats({ health: newHealth });
    
    console.log(`💥 ${this.character.getName()} takes ${amount} damage while stunned!`);
    
    if (newHealth === 0) {
      console.log(`💀 ${this.character.getName()} is defeated!`);
      this.character.setState(new DefeatedState(this.character));
    }
  }

  update(): void {
    this.character.setStunDuration(this.character.isStunned() ? this.character['stunDuration'] - 1 : 0);
    
    if (!this.character.isStunned()) {
      console.log(`😤 ${this.character.getName()} recovers from stun!`);
      this.character.setState(new IdleState(this.character));
    }
  }
}

// -------------------------------
// Defeated State
// -------------------------------
class DefeatedState implements CharacterState {
  constructor(private character: Character) {}

  move(direction: string): void {
    console.log('💀 Cannot move while defeated.');
  }

  jump(): void {
    console.log('💀 Cannot jump while defeated.');
  }

  attack(): void {
    console.log('💀 Cannot attack while defeated.');
  }

  takeDamage(amount: number): void {
    console.log('💀 Already defeated.');
  }

  update(): void {
    // Defeated state - no recovery
  }
}

// ===============================
// 3. Usage Examples & Tests
// ===============================

function demoGameCharacter() {
  const hero = new Character('Hero');
  
  console.log('--- Initial State ---');
  hero.printStatus();
  
  // Test movement and state transitions
  hero.move('right');
  hero.printStatus();
  
  hero.move('right'); // Should transition to running
  hero.printStatus();
  
  hero.move('stop');
  hero.printStatus();
  
  // Test jumping
  hero.jump();
  hero.printStatus();
  
  // Simulate landing
  for (let i = 0; i < 5; i++) {
    hero.update();
  }
  hero.printStatus();
  
  // Test attacking
  hero.attack();
  hero.printStatus();
  
  // Simulate attack completion
  for (let i = 0; i < 35; i++) {
    hero.update();
  }
  hero.printStatus();
  
  // Test damage and stun
  hero.takeDamage(25);
  hero.printStatus();
  
  // Simulate stun recovery
  for (let i = 0; i < 125; i++) {
    hero.update();
  }
  hero.printStatus();
  
  // Test running until exhaustion
  hero.move('right');
  hero.move('right');
  for (let i = 0; i < 110; i++) {
    hero.update();
  }
  hero.printStatus();
  
  // Test fatal damage
  hero.takeDamage(100);
  hero.printStatus();
}

demoGameCharacter();
exit(0);

export { Character, CharacterState, IdleState, WalkingState, RunningState, JumpingState, AttackingState, StunnedState, DefeatedState, CharacterStats }; 