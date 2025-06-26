import { exit } from 'process';

// Command interface
interface Command {
  execute(): void;
  undo(): void;
  serialize(): string;
}

// Game state
interface GameState {
  playerX: number;
  playerY: number;
  health: number;
  score: number;
  inventory: string[];
}

// Game receiver
class Game {
  private state: GameState = {
    playerX: 0,
    playerY: 0,
    health: 100,
    score: 0,
    inventory: []
  };
  
  private previousStates: GameState[] = [];
  
  getState(): GameState {
    return { ...this.state };
  }
  
  setState(state: GameState): void {
    this.previousStates.push({ ...this.state });
    this.state = { ...state };
  }
  
  movePlayer(dx: number, dy: number): void {
    this.state.playerX += dx;
    this.state.playerY += dy;
    console.log(`🎮 Player moved to (${this.state.playerX}, ${this.state.playerY})`);
  }
  
  takeDamage(amount: number): void {
    this.state.health = Math.max(0, this.state.health - amount);
    console.log(`💔 Player took ${amount} damage. Health: ${this.state.health}`);
  }
  
  heal(amount: number): void {
    this.state.health = Math.min(100, this.state.health + amount);
    console.log(`❤️  Player healed ${amount} HP. Health: ${this.state.health}`);
  }
  
  addScore(points: number): void {
    this.state.score += points;
    console.log(`🏆 Score increased by ${points}. Total: ${this.state.score}`);
  }
  
  addToInventory(item: string): void {
    this.state.inventory.push(item);
    console.log(`🎒 Added ${item} to inventory`);
  }
  
  removeFromInventory(item: string): void {
    const index = this.state.inventory.indexOf(item);
    if (index !== -1) {
      this.state.inventory.splice(index, 1);
      console.log(`🎒 Removed ${item} from inventory`);
    }
  }
  
  undoLastAction(): void {
    if (this.previousStates.length > 0) {
      this.state = this.previousStates.pop()!;
      console.log('↩️  Game state restored');
    }
  }
  
  getPlayerPosition(): { x: number; y: number } {
    return { x: this.state.playerX, y: this.state.playerY };
  }
  
  getHealth(): number {
    return this.state.health;
  }
  
  getScore(): number {
    return this.state.score;
  }
  
  getInventory(): string[] {
    return [...this.state.inventory];
  }
}

// Game commands
class MoveCommand implements Command {
  private game: Game;
  private dx: number;
  private dy: number;
  private previousState: GameState;
  
  constructor(game: Game, dx: number, dy: number) {
    this.game = game;
    this.dx = dx;
    this.dy = dy;
    this.previousState = game.getState();
  }
  
  execute(): void {
    this.game.movePlayer(this.dx, this.dy);
  }
  
  undo(): void {
    this.game.setState(this.previousState);
  }
  
  serialize(): string {
    return `MOVE:${this.dx},${this.dy}`;
  }
}

class AttackCommand implements Command {
  private game: Game;
  private damage: number;
  private previousState: GameState;
  
  constructor(game: Game, damage: number) {
    this.game = game;
    this.damage = damage;
    this.previousState = game.getState();
  }
  
  execute(): void {
    this.game.takeDamage(this.damage);
  }
  
  undo(): void {
    this.game.setState(this.previousState);
  }
  
  serialize(): string {
    return `ATTACK:${this.damage}`;
  }
}

class HealCommand implements Command {
  private game: Game;
  private amount: number;
  private previousState: GameState;
  
  constructor(game: Game, amount: number) {
    this.game = game;
    this.amount = amount;
    this.previousState = game.getState();
  }
  
  execute(): void {
    this.game.heal(this.amount);
  }
  
  undo(): void {
    this.game.setState(this.previousState);
  }
  
  serialize(): string {
    return `HEAL:${this.amount}`;
  }
}

class CollectItemCommand implements Command {
  private game: Game;
  private item: string;
  private previousState: GameState;
  
  constructor(game: Game, item: string) {
    this.game = game;
    this.item = item;
    this.previousState = game.getState();
  }
  
  execute(): void {
    this.game.addToInventory(this.item);
    this.game.addScore(10);
  }
  
  undo(): void {
    this.game.setState(this.previousState);
  }
  
  serialize(): string {
    return `COLLECT:${this.item}`;
  }
}

// Input recorder
class InputRecorder {
  private recordedCommands: Command[] = [];
  private isRecording: boolean = false;
  
  startRecording(): void {
    this.recordedCommands = [];
    this.isRecording = true;
    console.log('🎙️  Started recording input');
  }
  
  stopRecording(): void {
    this.isRecording = false;
    console.log(`🎙️  Stopped recording. Captured ${this.recordedCommands.length} commands`);
  }
  
  recordCommand(command: Command): void {
    if (this.isRecording) {
      this.recordedCommands.push(command);
    }
  }
  
  replay(): void {
    console.log('🔄 Replaying recorded commands...');
    this.recordedCommands.forEach(cmd => cmd.execute());
  }
  
  getRecordedCommands(): Command[] {
    return [...this.recordedCommands];
  }
  
  exportRecording(): string[] {
    return this.recordedCommands.map(cmd => cmd.serialize());
  }
  
  importRecording(serializedCommands: string[]): void {
    console.log('📥 Importing recording...');
    // In a real implementation, you'd deserialize these back to commands
    console.log(`Imported ${serializedCommands.length} commands`);
  }
}

// Input handler
class InputHandler {
  private game: Game;
  private recorder: InputRecorder;
  private commandHistory: Command[] = [];
  
  constructor(game: Game) {
    this.game = game;
    this.recorder = new InputRecorder();
  }
  
  handleMove(dx: number, dy: number): void {
    const command = new MoveCommand(this.game, dx, dy);
    this.executeCommand(command);
  }
  
  handleAttack(damage: number): void {
    const command = new AttackCommand(this.game, damage);
    this.executeCommand(command);
  }
  
  handleHeal(amount: number): void {
    const command = new HealCommand(this.game, amount);
    this.executeCommand(command);
  }
  
  handleCollect(item: string): void {
    const command = new CollectItemCommand(this.game, item);
    this.executeCommand(command);
  }
  
  private executeCommand(command: Command): void {
    command.execute();
    this.commandHistory.push(command);
    this.recorder.recordCommand(command);
  }
  
  undoLastAction(): void {
    if (this.commandHistory.length > 0) {
      const command = this.commandHistory.pop()!;
      command.undo();
    }
  }
  
  startRecording(): void {
    this.recorder.startRecording();
  }
  
  stopRecording(): void {
    this.recorder.stopRecording();
  }
  
  replayRecording(): void {
    this.recorder.replay();
  }
  
  exportRecording(): string[] {
    return this.recorder.exportRecording();
  }
  
  getGameState(): GameState {
    return this.game.getState();
  }
}

// Demo
const game = new Game();
const inputHandler = new InputHandler(game);

console.log('=== GAME INPUT HANDLING DEMO ===\n');

// Start recording
inputHandler.startRecording();

// Simulate player input
console.log('--- Player Actions ---');
inputHandler.handleMove(5, 0);  // Move right
inputHandler.handleMove(0, 3);  // Move down
inputHandler.handleCollect('Sword');
inputHandler.handleAttack(15);  // Take damage
inputHandler.handleHeal(20);    // Heal
inputHandler.handleMove(-2, -1); // Move left and up

// Stop recording
inputHandler.stopRecording();

console.log('\n--- Current Game State ---');
const state = inputHandler.getGameState();
console.log(`Position: (${state.playerX}, ${state.playerY})`);
console.log(`Health: ${state.health}`);
console.log(`Score: ${state.score}`);
console.log(`Inventory: [${state.inventory.join(', ')}]`);

// Replay recording
console.log('\n--- Replaying Recording ---');
inputHandler.replayRecording();

// Export recording
console.log('\n--- Exporting Recording ---');
const exported = inputHandler.exportRecording();
console.log('Exported commands:', exported);

// Undo last action
console.log('\n--- Undoing Last Action ---');
inputHandler.undoLastAction();

console.log('\n--- Final Game State ---');
const finalState = inputHandler.getGameState();
console.log(`Position: (${finalState.playerX}, ${finalState.playerY})`);
console.log(`Health: ${finalState.health}`);
console.log(`Score: ${finalState.score}`);
console.log(`Inventory: [${finalState.inventory.join(', ')}]`);

exit(0); 