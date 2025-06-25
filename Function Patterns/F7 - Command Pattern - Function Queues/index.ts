/**
 * F7 - Command Pattern - Function Queues
 */

import { exit } from "process";

// Basic command types
type Command<T = void> = () => T;
type AsyncCommand<T = void> = () => Promise<T>;

// Undoable command
type UndoableCommand<T = void> = {
  execute: () => T;
  undo: () => void;
  description: string;
};

// Command queue interface
interface CommandQueue<T = void> {
  enqueue: (command: Command<T>) => void;
  execute: () => T[];
  clear: () => void;
  size: () => number;
}

// Create a basic command queue
function createCommandQueue<T = void>(): CommandQueue<T> {
  const commands: Command<T>[] = [];

  return {
    enqueue: (command: Command<T>) => commands.push(command),
    execute: (): T[] => {
      const results: T[] = [];
      while (commands.length > 0) {
        const command = commands.shift()!;
        results.push(command());
      }
      return results;
    },
    clear: () => commands.splice(0),
    size: () => commands.length
  };
}

// Async command queue
interface AsyncCommandQueue<T = void> {
  enqueue: (command: AsyncCommand<T>) => void;
  executeSequential: () => Promise<T[]>;
  executeParallel: () => Promise<T[]>;
  clear: () => void;
  size: () => number;
}

function createAsyncCommandQueue<T = void>(): AsyncCommandQueue<T> {
  const commands: AsyncCommand<T>[] = [];

  return {
    enqueue: (command: AsyncCommand<T>) => commands.push(command),
    
    executeSequential: async (): Promise<T[]> => {
      const results: T[] = [];
      while (commands.length > 0) {
        const command = commands.shift()!;
        results.push(await command());
      }
      return results;
    },
    
    executeParallel: async (): Promise<T[]> => {
      const commandsToExecute = [...commands];
      commands.splice(0);
      return Promise.all(commandsToExecute.map(cmd => cmd()));
    },
    
    clear: () => commands.splice(0),
    size: () => commands.length
  };
}

// Undo/Redo system
interface UndoRedoSystem {
  execute: (command: UndoableCommand) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistory: () => string[];
  clear: () => void;
}

function createUndoRedoSystem(): UndoRedoSystem {
  const undoStack: UndoableCommand[] = [];
  const redoStack: UndoableCommand[] = [];

  return {
    execute: (command: UndoableCommand) => {
      command.execute();
      undoStack.push(command);
      redoStack.splice(0); // Clear redo stack when new command is executed
    },

    undo: (): boolean => {
      const command = undoStack.pop();
      if (command) {
        command.undo();
        redoStack.push(command);
        return true;
      }
      return false;
    },

    redo: (): boolean => {
      const command = redoStack.pop();
      if (command) {
        command.execute();
        undoStack.push(command);
        return true;
      }
      return false;
    },

    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    getHistory: () => undoStack.map(cmd => cmd.description),
    clear: () => {
      undoStack.splice(0);
      redoStack.splice(0);
    }
  };
}

// Helper function to create undoable commands
function createUndoableCommand<T = void>(
  executeAction: () => T,
  undoAction: () => void,
  description: string
): UndoableCommand<T> {
  return {
    execute: executeAction,
    undo: undoAction,
    description
  };
}

// Simple text editor simulation
class SimpleTextEditor {
  private content: string = '';
  private cursorPosition: number = 0;

  getContent(): string {
    return this.content;
  }

  getCursorPosition(): number {
    return this.cursorPosition;
  }

  insertText(text: string, position: number): void {
    this.content = this.content.slice(0, position) + text + this.content.slice(position);
    this.cursorPosition = position + text.length;
  }

  deleteText(position: number, length: number): string {
    const deletedText = this.content.slice(position, position + length);
    this.content = this.content.slice(0, position) + this.content.slice(position + length);
    this.cursorPosition = position;
    return deletedText;
  }

  setCursorPosition(position: number): void {
    this.cursorPosition = Math.max(0, Math.min(position, this.content.length));
  }
}

// Editor command factory
function createEditorCommands(editor: SimpleTextEditor) {
  return {
    insertText: (text: string, position: number): UndoableCommand => 
      createUndoableCommand(
        () => editor.insertText(text, position),
        () => editor.deleteText(position, text.length),
        `Insert "${text}" at position ${position}`
      ),

    deleteText: (position: number, length: number): UndoableCommand => {
      let deletedText = '';
      return createUndoableCommand(
        () => {
          deletedText = editor.deleteText(position, length);
          return deletedText;
        },
        () => editor.insertText(deletedText, position),
        `Delete ${length} characters at position ${position}`
      );
    },

    replaceText: (position: number, length: number, newText: string): UndoableCommand => {
      let oldText = '';
      return createUndoableCommand(
        () => {
          oldText = editor.deleteText(position, length);
          editor.insertText(newText, position);
          return oldText;
        },
        () => {
          editor.deleteText(position, newText.length);
          editor.insertText(oldText, position);
        },
        `Replace ${length} characters at position ${position} with "${newText}"`
      );
    }
  };
}

// Batch command processing
function batchCommands<T>(...commands: Command<T>[]): Command<T[]> {
  return () => commands.map(cmd => cmd());
}

// Command with retry logic
function createRetryCommand<T>(
  command: AsyncCommand<T>,
  maxRetries: number = 3,
  delay: number = 1000
): AsyncCommand<T> {
  return async () => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await command();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError!;
  };
}

// Demonstration functions
function demonstrateBasicCommands(): void {
  console.log("⚡ BASIC COMMAND QUEUE");
  console.log("=====================");
  console.log();

  const queue = createCommandQueue<string>();
  
  // Add some commands
  queue.enqueue(() => {
    console.log("  Executing command 1");
    return "Result 1";
  });
  
  queue.enqueue(() => {
    console.log("  Executing command 2");
    return "Result 2";
  });
  
  queue.enqueue(() => {
    console.log("  Executing command 3");
    return "Result 3";
  });

  console.log(`Queue size: ${queue.size()}`);
  console.log("Executing all commands:");
  const results = queue.execute();
  console.log("Results:", results);
  console.log(`Queue size after execution: ${queue.size()}`);
  console.log();
}

function demonstrateAsyncCommands(): void {
  console.log("🔄 ASYNC COMMAND QUEUE");
  console.log("======================");
  console.log();

  const asyncQueue = createAsyncCommandQueue<string>();
  
  // Add async commands with different delays
  asyncQueue.enqueue(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("  Async command 1 completed");
    return "Async Result 1";
  });
  
  asyncQueue.enqueue(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log("  Async command 2 completed");
    return "Async Result 2";
  });
  
  asyncQueue.enqueue(async () => {
    await new Promise(resolve => setTimeout(resolve, 75));
    console.log("  Async command 3 completed");
    return "Async Result 3";
  });

  // Execute sequentially (one after another)
  console.log("Executing commands sequentially...");
  asyncQueue.executeSequential().then(results => {
    console.log("Sequential results:", results);
    console.log();
  });
}

function demonstrateUndoRedoSystem(): void {
  console.log("↩️ UNDO/REDO SYSTEM");
  console.log("===================");
  console.log();

  const editor = new SimpleTextEditor();
  const commands = createEditorCommands(editor);
  const undoRedo = createUndoRedoSystem();

  console.log("Initial editor state:");
  console.log(`Content: "${editor.getContent()}"`);
  console.log();

  // Execute some commands
  console.log("Executing commands...");
  undoRedo.execute(commands.insertText("Hello", 0));
  console.log(`After insert: "${editor.getContent()}"`);

  undoRedo.execute(commands.insertText(" World", 5));
  console.log(`After insert: "${editor.getContent()}"`);

  undoRedo.execute(commands.insertText("!", 11));
  console.log(`After insert: "${editor.getContent()}"`);

  console.log();
  console.log("Command history:", undoRedo.getHistory());
  console.log();

  // Test undo
  console.log("Undoing commands...");
  while (undoRedo.canUndo()) {
    undoRedo.undo();
    console.log(`After undo: "${editor.getContent()}"`);
  }

  console.log();

  // Test redo
  console.log("Redoing commands...");
  while (undoRedo.canRedo()) {
    undoRedo.redo();
    console.log(`After redo: "${editor.getContent()}"`);
  }

  console.log();
}

function demonstrateBatchCommands(): void {
  console.log("📦 BATCH COMMAND PROCESSING");
  console.log("===========================");
  console.log();

  const editor = new SimpleTextEditor();
  const commands = createEditorCommands(editor);

  // Create a batch command
  const batchEdit = batchCommands(
    () => {
      console.log("  Executing: Insert 'Hello'");
      return commands.insertText("Hello", 0).execute();
    },
    () => {
      console.log("  Executing: Insert ' '");
      return commands.insertText(" ", 5).execute();
    },
    () => {
      console.log("  Executing: Insert 'World'");
      return commands.insertText("World", 6).execute();
    }
  );

  console.log("Executing batch command:");
  batchEdit();
  console.log(`Final content: "${editor.getContent()}"`);
  console.log();
}

function demonstrateRetryLogic(): void {
  console.log("🔁 COMMAND RETRY LOGIC");
  console.log("======================");
  console.log();

  let attemptCount = 0;
  const flakyCommand: AsyncCommand<string> = async () => {
    attemptCount++;
    console.log(`  Attempt ${attemptCount}`);
    
    if (attemptCount < 3) {
      throw new Error("Simulated failure");
    }
    
    return "Success!";
  };

  const retryCommand = createRetryCommand(flakyCommand, 3, 100);

  console.log("Executing command with retry logic...");
  retryCommand()
    .then(result => {
      console.log(`Command succeeded: ${result}`);
      console.log();
    })
    .catch(error => {
      console.log(`Command failed: ${error.message}`);
      console.log();
    });
}

function demonstratePerformance(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("========================");
  console.log();

  const iterations = 100000;
  
  // Command queue performance
  console.log(`Creating and executing ${iterations} commands...`);
  const start = Date.now();
  
  const queue = createCommandQueue<number>();
  
  for (let i = 0; i < iterations; i++) {
    queue.enqueue(() => i * 2);
  }
  
  const results = queue.execute();
  const duration = Date.now() - start;
  const opsPerSec = Math.round(iterations / (duration / 1000));
  
  console.log(`✨ Completed ${iterations} command operations in ${duration}ms`);
  console.log(`📊 Performance: ~${opsPerSec.toLocaleString()} operations/second`);
  console.log(`🏃‍♂️ Average: ${(duration / iterations).toFixed(4)}ms per command`);
  console.log(`📋 Sample results: [${results.slice(0, 5).join(', ')}, ...]`);
  console.log();

  console.log("Key Performance Benefits:");
  console.log("• Function-based commands with minimal overhead");
  console.log("• Efficient queue processing with array operations");
  console.log("• Memory-efficient closure-based state capture");
  console.log("• Type-safe command execution and composition");
  console.log();
}

// Main execution
function main(): void {
  console.log("🎯 F7 - COMMAND PATTERN - FUNCTION QUEUES");
  console.log("==========================================");
  console.log();
  console.log("Functional implementation of the Command pattern using function queues");
  console.log("for encapsulating operations, undo/redo systems, and batch processing.");
  console.log();

  demonstrateBasicCommands();
  demonstrateUndoRedoSystem();
  demonstrateBatchCommands();
  demonstrateRetryLogic();
  demonstratePerformance();

  // Async demo with delay to show it working
  setTimeout(() => {
    demonstrateAsyncCommands();
    
    setTimeout(() => {
      console.log("💡 PRACTICAL USAGE EXAMPLES");
      console.log("===============================");
      console.log();
      
      console.log("1. Text editor with undo/redo:");
      console.log(`const editor = createUndoRedoSystem();
editor.execute(insertTextCommand("Hello", 0));
editor.execute(insertTextCommand(" World", 5));
editor.undo(); // Removes " World"
editor.redo(); // Adds " World" back`);
      console.log();

      console.log("2. Database migration system:");
      console.log(`const migrationQueue = createCommandQueue();
migrationQueue.enqueue(createMigrationCommand(
  'CREATE TABLE users...',
  'DROP TABLE users',
  'create_users_table'
));`);
      console.log();

      console.log("3. Background job processing:");
      console.log(`const jobQueue = createAsyncCommandQueue();
jobQueue.enqueue(() => sendEmail(user, template));
jobQueue.enqueue(() => updateUserProfile(userId, data));
await jobQueue.executeParallel();`);
      console.log();
      
      console.log("🚀 COMPREHENSIVE EXAMPLES");
      console.log("=========================");
      console.log("Run command pattern examples:");
      console.log("npm run f7:command         # This comprehensive overview");
      console.log();
      
      console.log("Key Benefits:");
      console.log("• Function-based commands without class overhead");
      console.log("• Built-in undo/redo with closure-based state");
      console.log("• Composable command operations and batching");
      console.log("• Async command processing with error handling");
      console.log("• Type-safe command queues and execution");
      
      exit(0);
    }, 1000);
  }, 500);
}

// Run the demonstration
main(); 