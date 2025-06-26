import { exit } from 'process';

// Command interface
interface Command {
  execute(): void;
  undo(): void;
}

// Text editor receiver
class TextEditor {
  private content: string = '';
  private selection: { start: number; end: number } = { start: 0, end: 0 };
  
  getContent(): string {
    return this.content;
  }
  
  setContent(content: string): void {
    this.content = content;
  }
  
  getSelection(): { start: number; end: number } {
    return { ...this.selection };
  }
  
  setSelection(start: number, end: number): void {
    this.selection = { start, end };
  }
  
  getSelectedText(): string {
    return this.content.substring(this.selection.start, this.selection.end);
  }
  
  insertText(text: string, position: number): void {
    this.content = this.content.substring(0, position) + text + this.content.substring(position);
  }
  
  deleteText(start: number, end: number): string {
    const deleted = this.content.substring(start, end);
    this.content = this.content.substring(0, start) + this.content.substring(end);
    return deleted;
  }
}

// Copy command
class CopyCommand implements Command {
  private editor: TextEditor;
  private clipboard: string = '';
  
  constructor(editor: TextEditor) {
    this.editor = editor;
  }
  
  execute(): void {
    this.clipboard = this.editor.getSelectedText();
    console.log(`📋 Copied: "${this.clipboard}"`);
  }
  
  undo(): void {
    // Copy doesn't change editor state, so undo is no-op
    console.log('↩️  Copy undo: no action needed');
  }
}

// Paste command
class PasteCommand implements Command {
  private editor: TextEditor;
  private clipboard: string;
  private previousContent: string = '';
  private previousSelection: { start: number; end: number } = { start: 0, end: 0 };
  
  constructor(editor: TextEditor, clipboard: string) {
    this.editor = editor;
    this.clipboard = clipboard;
  }
  
  execute(): void {
    this.previousContent = this.editor.getContent();
    this.previousSelection = this.editor.getSelection();
    
    const position = this.editor.getSelection().start;
    this.editor.insertText(this.clipboard, position);
    this.editor.setSelection(position + this.clipboard.length, position + this.clipboard.length);
    
    console.log(`📋 Pasted: "${this.clipboard}"`);
  }
  
  undo(): void {
    this.editor.setContent(this.previousContent);
    this.editor.setSelection(this.previousSelection.start, this.previousSelection.end);
    console.log('↩️  Paste undone');
  }
}

// Cut command
class CutCommand implements Command {
  private editor: TextEditor;
  private clipboard: string = '';
  private previousContent: string = '';
  private previousSelection: { start: number; end: number } = { start: 0, end: 0 };
  
  constructor(editor: TextEditor) {
    this.editor = editor;
  }
  
  execute(): void {
    this.previousContent = this.editor.getContent();
    this.previousSelection = this.editor.getSelection();
    
    this.clipboard = this.editor.getSelectedText();
    const deleted = this.editor.deleteText(this.previousSelection.start, this.previousSelection.end);
    this.editor.setSelection(this.previousSelection.start, this.previousSelection.start);
    
    console.log(`✂️  Cut: "${this.clipboard}"`);
  }
  
  undo(): void {
    this.editor.setContent(this.previousContent);
    this.editor.setSelection(this.previousSelection.start, this.previousSelection.end);
    console.log('↩️  Cut undone');
  }
}

// Delete command
class DeleteCommand implements Command {
  private editor: TextEditor;
  private deletedText: string = '';
  private previousContent: string = '';
  private previousSelection: { start: number; end: number } = { start: 0, end: 0 };
  
  constructor(editor: TextEditor) {
    this.editor = editor;
  }
  
  execute(): void {
    this.previousContent = this.editor.getContent();
    this.previousSelection = this.editor.getSelection();
    
    this.deletedText = this.editor.deleteText(this.previousSelection.start, this.previousSelection.end);
    this.editor.setSelection(this.previousSelection.start, this.previousSelection.start);
    
    console.log(`🗑️  Deleted: "${this.deletedText}"`);
  }
  
  undo(): void {
    this.editor.setContent(this.previousContent);
    this.editor.setSelection(this.previousSelection.start, this.previousSelection.end);
    console.log('↩️  Delete undone');
  }
}

// Command invoker
class CommandInvoker {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  
  executeCommand(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack when new command is executed
  }
  
  undo(): void {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop()!;
      command.undo();
      this.redoStack.push(command);
    } else {
      console.log('⚠️  Nothing to undo');
    }
  }
  
  redo(): void {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop()!;
      command.execute();
      this.undoStack.push(command);
    } else {
      console.log('⚠️  Nothing to redo');
    }
  }
}

// Demo
const editor = new TextEditor();
const invoker = new CommandInvoker();

// Set initial content
editor.setContent('Hello World!');
editor.setSelection(0, 5); // Select "Hello"

console.log('=== TEXT EDITOR COMMAND DEMO ===');
console.log(`Initial content: "${editor.getContent()}"`);
console.log(`Selection: "${editor.getSelectedText()}"\n`);

// Execute commands
console.log('--- Executing Commands ---');
invoker.executeCommand(new CopyCommand(editor));
invoker.executeCommand(new CutCommand(editor));
invoker.executeCommand(new PasteCommand(editor, 'Hi there'));
invoker.executeCommand(new DeleteCommand(editor));

console.log(`\nFinal content: "${editor.getContent()}"\n`);

// Undo operations
console.log('--- Undoing Commands ---');
invoker.undo(); // Undo delete
invoker.undo(); // Undo paste
invoker.undo(); // Undo cut
invoker.undo(); // Undo copy

console.log(`\nAfter undo: "${editor.getContent()}"\n`);

// Redo operations
console.log('--- Redoing Commands ---');
invoker.redo(); // Redo copy
invoker.redo(); // Redo cut
invoker.redo(); // Redo paste
invoker.redo(); // Redo delete

console.log(`\nAfter redo: "${editor.getContent()}"`);

exit(0); 