import { exit } from "process";

// ============================================================================
// COMMAND PATTERN IMPLEMENTATION
// ============================================================================

/**
 * Command interface for function-based commands.
 */
interface Command<T = any> {
  execute(): T;
  undo?(): void;
  canExecute(): boolean;
  getDescription(): string;
}

/**
 * Command queue for processing commands sequentially.
 */
class CommandQueue {
  private commands: Command[] = [];
  private history: Command[] = [];
  private maxHistory: number;
  private isProcessing: boolean = false;

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory;
  }

  /**
   * Add a command to the queue.
   */
  enqueue(command: Command): void {
    this.commands.push(command);
    console.log(`📝 Command queued: ${command.getDescription()}`);
  }

  /**
   * Process all commands in the queue.
   */
  async process(): Promise<void> {
    if (this.isProcessing) {
      console.log("⚠️  Queue is already processing");
      return;
    }

    this.isProcessing = true;
    console.log(`🚀 Processing ${this.commands.length} commands...`);

    while (this.commands.length > 0) {
      const command = this.commands.shift()!;
      
      try {
        if (command.canExecute()) {
          const result = command.execute();
          this.addToHistory(command);
          console.log(`✅ Executed: ${command.getDescription()}`);
          
          if (result !== undefined) {
            console.log(`📊 Result: ${JSON.stringify(result)}`);
          }
        } else {
          console.log(`❌ Cannot execute: ${command.getDescription()}`);
        }
      } catch (error) {
        console.error(`💥 Error executing ${command.getDescription()}:`, error);
      }
    }

    this.isProcessing = false;
    console.log("🏁 Queue processing completed");
  }

  /**
   * Process commands with a delay between each.
   */
  async processWithDelay(delayMs: number): Promise<void> {
    if (this.isProcessing) {
      console.log("⚠️  Queue is already processing");
      return;
    }

    this.isProcessing = true;
    console.log(`🚀 Processing ${this.commands.length} commands with ${delayMs}ms delay...`);

    while (this.commands.length > 0) {
      const command = this.commands.shift()!;
      
      try {
        if (command.canExecute()) {
          const result = command.execute();
          this.addToHistory(command);
          console.log(`✅ Executed: ${command.getDescription()}`);
          
          if (result !== undefined) {
            console.log(`📊 Result: ${JSON.stringify(result)}`);
          }
        } else {
          console.log(`❌ Cannot execute: ${command.getDescription()}`);
        }
      } catch (error) {
        console.error(`💥 Error executing ${command.getDescription()}:`, error);
      }

      if (this.commands.length > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    this.isProcessing = false;
    console.log("🏁 Queue processing completed");
  }

  /**
   * Undo the last executed command.
   */
  undo(): boolean {
    const lastCommand = this.history.pop();
    if (lastCommand && lastCommand.undo) {
      try {
        lastCommand.undo();
        console.log(`↩️  Undone: ${lastCommand.getDescription()}`);
        return true;
      } catch (error) {
        console.error(`💥 Error undoing ${lastCommand.getDescription()}:`, error);
        return false;
      }
    }
    return false;
  }

  /**
   * Clear the command queue.
   */
  clear(): void {
    this.commands = [];
    console.log("🗑️  Command queue cleared");
  }

  /**
   * Get queue status.
   */
  getStatus(): { queued: number; history: number; processing: boolean } {
    return {
      queued: this.commands.length,
      history: this.history.length,
      processing: this.isProcessing
    };
  }

  /**
   * Add command to history.
   */
  private addToHistory(command: Command): void {
    this.history.push(command);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }
}

// ============================================================================
// FILE SYSTEM COMMANDS
// ============================================================================

interface FileSystem {
  files: Map<string, string>;
  directories: Set<string>;
}

class FileSystemCommand implements Command {
  constructor(
    protected fs: FileSystem,
    private operation: () => any,
    private description: string,
    private undoOperation?: () => void
  ) {}

  execute(): any {
    return this.operation();
  }

  undo(): void {
    if (this.undoOperation) {
      this.undoOperation();
    }
  }

  canExecute(): boolean {
    return true;
  }

  getDescription(): string {
    return this.description;
  }
}

class CreateFileCommand extends FileSystemCommand {
  constructor(fs: FileSystem, private filename: string, private content: string) {
    const originalContent = fs.files.get(filename);
    
    super(
      fs,
      () => {
        fs.files.set(filename, content);
        return { filename, content };
      },
      `Create file: ${filename}`,
      () => {
        if (originalContent !== undefined) {
          fs.files.set(filename, originalContent);
        } else {
          fs.files.delete(filename);
        }
      }
    );
  }
}

class DeleteFileCommand extends FileSystemCommand {
  constructor(fs: FileSystem, private filename: string) {
    const originalContent = fs.files.get(filename);
    
    super(
      fs,
      () => {
        const content = fs.files.get(filename);
        fs.files.delete(filename);
        return { filename, deletedContent: content };
      },
      `Delete file: ${filename}`,
      () => {
        if (originalContent !== undefined) {
          fs.files.set(filename, originalContent);
        }
      }
    );
  }

  override canExecute(): boolean {
    return this.fs.files.has(this.filename);
  }
}

class UpdateFileCommand extends FileSystemCommand {
  constructor(fs: FileSystem, private filename: string, private newContent: string) {
    const originalContent = fs.files.get(filename);
    
    super(
      fs,
      () => {
        const oldContent = fs.files.get(filename);
        fs.files.set(filename, this.newContent);
        return { filename, oldContent, newContent: this.newContent };
      },
      `Update file: ${filename}`,
      () => {
        if (originalContent !== undefined) {
          fs.files.set(filename, originalContent);
        }
      }
    );
  }

  override canExecute(): boolean {
    return this.fs.files.has(this.filename);
  }
}

// ============================================================================
// DATABASE COMMANDS
// ============================================================================

interface Database {
  tables: Map<string, Map<string, any>>;
}

class DatabaseCommand implements Command {
  constructor(
    protected db: Database,
    private operation: () => any,
    private description: string,
    private undoOperation?: () => void
  ) {}

  execute(): any {
    return this.operation();
  }

  undo(): void {
    if (this.undoOperation) {
      this.undoOperation();
    }
  }

  canExecute(): boolean {
    return true;
  }

  getDescription(): string {
    return this.description;
  }
}

class InsertRecordCommand extends DatabaseCommand {
  constructor(db: Database, private table: string, private record: any) {
    const originalRecord = db.tables.get(table)?.get(record.id);
    
    super(
      db,
      () => {
        if (!db.tables.has(table)) {
          db.tables.set(table, new Map());
        }
        const tableData = db.tables.get(table)!;
        tableData.set(record.id, record);
        return { table, record };
      },
      `Insert record into ${table}: ${record.id}`,
      () => {
        if (originalRecord !== undefined) {
          db.tables.get(table)?.set(record.id, originalRecord);
        } else {
          db.tables.get(table)?.delete(record.id);
        }
      }
    );
  }
}

class UpdateRecordCommand extends DatabaseCommand {
  constructor(db: Database, private table: string, private id: string, private updates: any) {
    const originalRecord = db.tables.get(table)?.get(id);
    
    super(
      db,
      () => {
        const tableData = db.tables.get(table);
        if (!tableData || !tableData.has(id)) {
          throw new Error(`Record ${id} not found in table ${table}`);
        }
        const oldRecord = tableData.get(id);
        const newRecord = { ...oldRecord, ...updates };
        tableData.set(id, newRecord);
        return { table, id, oldRecord, newRecord };
      },
      `Update record ${id} in ${table}`,
      () => {
        if (originalRecord !== undefined) {
          db.tables.get(table)?.set(id, originalRecord);
        }
      }
    );
  }

  override canExecute(): boolean {
    return this.db.tables.has(this.table) && this.db.tables.get(this.table)!.has(this.id);
  }
}

class DeleteRecordCommand extends DatabaseCommand {
  constructor(db: Database, private table: string, private id: string) {
    const originalRecord = db.tables.get(table)?.get(id);
    
    super(
      db,
      () => {
        const tableData = db.tables.get(table);
        if (!tableData || !tableData.has(id)) {
          throw new Error(`Record ${id} not found in table ${table}`);
        }
        const record = tableData.get(id);
        tableData.delete(id);
        return { table, id, deletedRecord: record };
      },
      `Delete record ${id} from ${table}`,
      () => {
        if (originalRecord !== undefined) {
          this.db.tables.get(this.table)?.set(this.id, originalRecord);
        }
      }
    );
  }

  override canExecute(): boolean {
    return this.db.tables.has(this.table) && this.db.tables.get(this.table)!.has(this.id);
  }
}

// ============================================================================
// EMAIL COMMANDS
// ============================================================================

interface EmailService {
  sentEmails: any[];
  draftEmails: any[];
}

class EmailCommand implements Command {
  constructor(
    private emailService: EmailService,
    private operation: () => any,
    private description: string,
    private undoOperation?: () => void
  ) {}

  execute(): any {
    return this.operation();
  }

  undo(): void {
    if (this.undoOperation) {
      this.undoOperation();
    }
  }

  canExecute(): boolean {
    return true;
  }

  getDescription(): string {
    return this.description;
  }
}

class SendEmailCommand extends EmailCommand {
  constructor(emailService: EmailService, private email: any) {
    super(
      emailService,
      () => {
        // Simulate email sending
        const sentEmail = {
          ...email,
          id: `email_${Date.now()}`,
          sentAt: new Date(),
          status: 'sent'
        };
        emailService.sentEmails.push(sentEmail);
        return sentEmail;
      },
      `Send email to ${email.to}`,
      () => {
        const index = emailService.sentEmails.findIndex(e => e.id === email.id);
        if (index !== -1) {
          emailService.sentEmails.splice(index, 1);
        }
      }
    );
  }
}

class SaveDraftCommand extends EmailCommand {
  constructor(emailService: EmailService, private email: any) {
    super(
      emailService,
      () => {
        const draft = {
          ...email,
          id: `draft_${Date.now()}`,
          savedAt: new Date(),
          status: 'draft'
        };
        emailService.draftEmails.push(draft);
        return draft;
      },
      `Save draft email to ${email.to}`,
      () => {
        const index = emailService.draftEmails.findIndex(e => e.id === email.id);
        if (index !== -1) {
          emailService.draftEmails.splice(index, 1);
        }
      }
    );
  }
}

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

const demonstrateFileSystemCommands = () => {
  console.log("\n=== File System Commands ===");
  
  const fs: FileSystem = {
    files: new Map(),
    directories: new Set()
  };
  
  const queue = new CommandQueue();
  
  // Queue file operations
  queue.enqueue(new CreateFileCommand(fs, 'config.json', '{"debug": true}'));
  queue.enqueue(new CreateFileCommand(fs, 'readme.md', '# Project Documentation'));
  queue.enqueue(new UpdateFileCommand(fs, 'config.json', '{"debug": false, "port": 3000}'));
  queue.enqueue(new CreateFileCommand(fs, 'temp.txt', 'Temporary file'));
  queue.enqueue(new DeleteFileCommand(fs, 'temp.txt'));
  
  // Process commands
  queue.process();
  
  console.log("Final file system state:");
  fs.files.forEach((content, filename) => {
    console.log(`📄 ${filename}: ${content}`);
  });
  
  // Undo last command
  console.log("\nUndoing last command:");
  queue.undo();
  
  console.log("After undo:");
  fs.files.forEach((content, filename) => {
    console.log(`📄 ${filename}: ${content}`);
  });
};

const demonstrateDatabaseCommands = () => {
  console.log("\n=== Database Commands ===");
  
  const db: Database = {
    tables: new Map()
  };
  
  const queue = new CommandQueue();
  
  // Queue database operations
  queue.enqueue(new InsertRecordCommand(db, 'users', { id: '1', name: 'Alice', email: 'alice@example.com' }));
  queue.enqueue(new InsertRecordCommand(db, 'users', { id: '2', name: 'Bob', email: 'bob@example.com' }));
  queue.enqueue(new UpdateRecordCommand(db, 'users', '1', { name: 'Alice Smith', age: 30 }));
  queue.enqueue(new InsertRecordCommand(db, 'products', { id: 'p1', name: 'Laptop', price: 999 }));
  queue.enqueue(new DeleteRecordCommand(db, 'users', '2'));
  
  // Process commands
  queue.process();
  
  console.log("Final database state:");
  db.tables.forEach((tableData, tableName) => {
    console.log(`📊 Table: ${tableName}`);
    tableData.forEach((record, id) => {
      console.log(`  ${id}: ${JSON.stringify(record)}`);
    });
  });
};

const demonstrateEmailCommands = () => {
  console.log("\n=== Email Commands ===");
  
  const emailService: EmailService = {
    sentEmails: [],
    draftEmails: []
  };
  
  const queue = new CommandQueue();
  
  // Queue email operations
  queue.enqueue(new SendEmailCommand(emailService, {
    to: 'user@example.com',
    subject: 'Welcome!',
    body: 'Welcome to our platform!'
  }));
  
  queue.enqueue(new SaveDraftCommand(emailService, {
    to: 'support@example.com',
    subject: 'Bug Report',
    body: 'I found a bug in the application...'
  }));
  
  queue.enqueue(new SendEmailCommand(emailService, {
    to: 'admin@example.com',
    subject: 'Monthly Report',
    body: 'Here is the monthly report...'
  }));
  
  // Process commands
  queue.process();
  
  console.log("Sent emails:", emailService.sentEmails.length);
  console.log("Draft emails:", emailService.draftEmails.length);
};

const demonstrateCommandQueueFeatures = () => {
  console.log("\n=== Command Queue Features ===");
  
  const queue = new CommandQueue();
  
  // Add commands with delays
  queue.enqueue(new FileSystemCommand(
    { files: new Map(), directories: new Set() },
    () => {
      console.log("Processing command 1...");
      return "Result 1";
    },
    "Command 1"
  ));
  
  queue.enqueue(new FileSystemCommand(
    { files: new Map(), directories: new Set() },
    () => {
      console.log("Processing command 2...");
      return "Result 2";
    },
    "Command 2"
  ));
  
  queue.enqueue(new FileSystemCommand(
    { files: new Map(), directories: new Set() },
    () => {
      console.log("Processing command 3...");
      return "Result 3";
    },
    "Command 3"
  ));
  
  // Process with delay
  queue.processWithDelay(1000);
  
  // Show status
  setTimeout(() => {
    const status = queue.getStatus();
    console.log("Queue status:", status);
  }, 4000);
};

const demonstrateErrorHandling = () => {
  console.log("\n=== Error Handling ===");
  
  const queue = new CommandQueue();
  
  // Add commands that might fail
  queue.enqueue(new FileSystemCommand(
    { files: new Map(), directories: new Set() },
    () => {
      console.log("This command will succeed");
      return "Success";
    },
    "Successful command"
  ));
  
  queue.enqueue(new FileSystemCommand(
    { files: new Map(), directories: new Set() },
    () => {
      throw new Error("This command will fail");
    },
    "Failing command"
  ));
  
  queue.enqueue(new FileSystemCommand(
    { files: new Map(), directories: new Set() },
    () => {
      console.log("This command will also succeed");
      return "Another success";
    },
    "Another successful command"
  ));
  
  // Process commands (should handle errors gracefully)
  queue.process();
};

const demonstrateBatchProcessing = () => {
  console.log("\n=== Batch Processing ===");
  
  const fs: FileSystem = {
    files: new Map(),
    directories: new Set()
  };
  
  const queue = new CommandQueue();
  
  // Create batch of commands
  for (let i = 1; i <= 5; i++) {
    queue.enqueue(new CreateFileCommand(fs, `file${i}.txt`, `Content of file ${i}`));
  }
  
  // Process in batch
  queue.process();
  
  console.log(`Created ${fs.files.size} files in batch`);
  
  // Undo multiple commands
  console.log("\nUndoing last 3 commands:");
  for (let i = 0; i < 3; i++) {
    queue.undo();
  }
  
  console.log(`Remaining files: ${fs.files.size}`);
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = () => {
  console.log("⚡ Command Pattern: Function Queues");
  console.log("=".repeat(60));
  
  try {
    demonstrateFileSystemCommands();
    demonstrateDatabaseCommands();
    demonstrateEmailCommands();
    demonstrateCommandQueueFeatures();
    demonstrateErrorHandling();
    demonstrateBatchProcessing();
    
    console.log("\n✅ All Command pattern examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running Command examples:", error);
  }
};

// Run the examples
main();

exit(0); 