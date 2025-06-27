import { exit } from 'process';

// Memento interface
interface Memento {
  getState(): any;
  getTimestamp(): Date;
}

// Text Editor State
interface TextEditorState {
  content: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
  scrollPosition: number;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
}

// Text Editor Memento
class TextEditorMemento implements Memento {
  private state: TextEditorState;
  private timestamp: Date;

  constructor(state: TextEditorState) {
    // Deep copy the state to ensure immutability
    this.state = {
      content: state.content,
      cursorPosition: state.cursorPosition,
      selectionStart: state.selectionStart,
      selectionEnd: state.selectionEnd,
      scrollPosition: state.scrollPosition,
      fontFamily: state.fontFamily,
      fontSize: state.fontSize,
      isBold: state.isBold,
      isItalic: state.isItalic
    };
    this.timestamp = new Date();
  }

  getState(): TextEditorState {
    return { ...this.state };
  }

  getTimestamp(): Date {
    return new Date(this.timestamp);
  }
}

// Text Editor (Originator)
class TextEditor {
  private state: TextEditorState;

  constructor() {
    this.state = {
      content: '',
      cursorPosition: 0,
      selectionStart: 0,
      selectionEnd: 0,
      scrollPosition: 0,
      fontFamily: 'Arial',
      fontSize: 12,
      isBold: false,
      isItalic: false
    };
  }

  // Create memento of current state
  createMemento(): Memento {
    console.log('💾 Creating memento of current state...');
    return new TextEditorMemento(this.state);
  }

  // Restore state from memento
  restore(memento: Memento): void {
    console.log('🔄 Restoring state from memento...');
    this.state = memento.getState();
  }

  // Text editing operations
  insertText(text: string): void {
    console.log(`📝 Inserting text: "${text}"`);
    const before = this.state.content.substring(0, this.state.cursorPosition);
    const after = this.state.content.substring(this.state.cursorPosition);
    this.state.content = before + text + after;
    this.state.cursorPosition += text.length;
    this.state.selectionStart = this.state.cursorPosition;
    this.state.selectionEnd = this.state.cursorPosition;
  }

  deleteText(length: number): void {
    console.log(`🗑️ Deleting ${length} characters`);
    if (this.state.cursorPosition > 0) {
      const before = this.state.content.substring(0, this.state.cursorPosition - length);
      const after = this.state.content.substring(this.state.cursorPosition);
      this.state.content = before + after;
      this.state.cursorPosition = Math.max(0, this.state.cursorPosition - length);
      this.state.selectionStart = this.state.cursorPosition;
      this.state.selectionEnd = this.state.cursorPosition;
    }
  }

  selectText(start: number, end: number): void {
    console.log(`📋 Selecting text from ${start} to ${end}`);
    this.state.selectionStart = Math.max(0, start);
    this.state.selectionEnd = Math.min(this.state.content.length, end);
    this.state.cursorPosition = this.state.selectionEnd;
  }

  setBold(bold: boolean): void {
    console.log(`🔤 Setting bold: ${bold}`);
    this.state.isBold = bold;
  }

  setItalic(italic: boolean): void {
    console.log(`🔤 Setting italic: ${italic}`);
    this.state.isItalic = italic;
  }

  setFontSize(size: number): void {
    console.log(`📏 Setting font size: ${size}`);
    this.state.fontSize = size;
  }

  // Get current state
  getState(): TextEditorState {
    return { ...this.state };
  }

  // Display current state
  display(): void {
    console.log('\n📄 Current Document State:');
    console.log(`Content: "${this.state.content}"`);
    console.log(`Cursor Position: ${this.state.cursorPosition}`);
    console.log(`Selection: ${this.state.selectionStart}-${this.state.selectionEnd}`);
    console.log(`Font: ${this.state.fontFamily} ${this.state.fontSize}pt`);
    console.log(`Bold: ${this.state.isBold}, Italic: ${this.state.isItalic}`);
    console.log(`Scroll Position: ${this.state.scrollPosition}`);
    console.log('');
  }
}

// Caretaker - Manages memento history
class TextEditorCaretaker {
  private undoStack: Memento[] = [];
  private redoStack: Memento[] = [];
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 50) {
    this.maxHistorySize = maxHistorySize;
  }

  // Save current state
  save(editor: TextEditor): void {
    const memento = editor.createMemento();
    this.undoStack.push(memento);
    
    // Clear redo stack when new action is performed
    this.redoStack = [];
    
    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    
    console.log(`💾 State saved. Undo stack size: ${this.undoStack.length}`);
  }

  // Undo last action
  undo(editor: TextEditor): boolean {
    if (this.undoStack.length === 0) {
      console.log('❌ Nothing to undo');
      return false;
    }

    const currentMemento = editor.createMemento();
    this.redoStack.push(currentMemento);

    const previousMemento = this.undoStack.pop()!;
    editor.restore(previousMemento);

    console.log(`↩️ Undo performed. Undo stack: ${this.undoStack.length}, Redo stack: ${this.redoStack.length}`);
    return true;
  }

  // Redo last undone action
  redo(editor: TextEditor): boolean {
    if (this.redoStack.length === 0) {
      console.log('❌ Nothing to redo');
      return false;
    }

    const currentMemento = editor.createMemento();
    this.undoStack.push(currentMemento);

    const nextMemento = this.redoStack.pop()!;
    editor.restore(nextMemento);

    console.log(`↪️ Redo performed. Undo stack: ${this.undoStack.length}, Redo stack: ${this.redoStack.length}`);
    return true;
  }

  // Get history information
  getHistoryInfo(): { undoCount: number; redoCount: number } {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length
    };
  }

  // Clear all history
  clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
    console.log('🗑️ History cleared');
  }
}

// Demo
console.log('=== TEXT EDITOR UNDO/REDO SYSTEM DEMO ===\n');

// Create text editor and caretaker
const editor = new TextEditor();
const caretaker = new TextEditorCaretaker(10);

console.log('🚀 Starting text editing session...\n');

// Initial state
editor.display();

// Perform various editing operations
console.log('=== EDITING OPERATIONS ===');

caretaker.save(editor);
editor.insertText('Hello');
editor.display();

caretaker.save(editor);
editor.insertText(' World');
editor.display();

caretaker.save(editor);
editor.setBold(true);
editor.display();

caretaker.save(editor);
editor.insertText('!');
editor.display();

caretaker.save(editor);
editor.setFontSize(16);
editor.display();

caretaker.save(editor);
editor.selectText(0, 5);
editor.display();

caretaker.save(editor);
editor.deleteText(5);
editor.display();

// Demonstrate undo/redo
console.log('=== UNDO/REDO OPERATIONS ===');

console.log('\n🔄 Undoing last action...');
caretaker.undo(editor);
editor.display();

console.log('\n🔄 Undoing another action...');
caretaker.undo(editor);
editor.display();

console.log('\n🔄 Undoing font size change...');
caretaker.undo(editor);
editor.display();

console.log('\n↪️ Redoing font size change...');
caretaker.redo(editor);
editor.display();

console.log('\n↪️ Redoing selection...');
caretaker.redo(editor);
editor.display();

console.log('\n🔄 Undoing multiple actions...');
caretaker.undo(editor);
caretaker.undo(editor);
caretaker.undo(editor);
editor.display();

// Show history information
const history = caretaker.getHistoryInfo();
console.log('\n📊 History Information:');
console.log(`Undo stack: ${history.undoCount} items`);
console.log(`Redo stack: ${history.redoCount} items`);

// Demonstrate multiple undos
console.log('\n=== MULTIPLE UNDO DEMO ===');
for (let i = 0; i < 3; i++) {
  console.log(`\n🔄 Undo ${i + 1}:`);
  caretaker.undo(editor);
  editor.display();
}

// Demonstrate multiple redos
console.log('\n=== MULTIPLE REDO DEMO ===');
for (let i = 0; i < 3; i++) {
  console.log(`\n↪️ Redo ${i + 1}:`);
  caretaker.redo(editor);
  editor.display();
}

console.log('\n✅ Text editor undo/redo system demo completed successfully');

exit(0); 