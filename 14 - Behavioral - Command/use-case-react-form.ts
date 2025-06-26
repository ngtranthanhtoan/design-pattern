import { exit } from 'process';

// Simulating React-like environment for demonstration
// In real React, these would be actual React hooks and components

// Command interface
interface Command {
  execute(): void;
  undo(): void;
}

// Form field interface
interface FormField {
  name: string;
  value: string;
  isValid: boolean;
  error?: string;
}

// Form state
interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  isDirty: boolean;
}

// Form manager (simulates React form state)
class FormManager {
  private state: FormState = { values: {}, errors: {}, isDirty: false };
  private history: FormState[] = [];
  
  setFieldValue(name: string, value: string): void {
    this.saveState();
    this.state.values[name] = value;
    this.state.isDirty = true;
    console.log(`📝 Set ${name}: "${value}"`);
  }
  
  setFieldError(name: string, error: string): void {
    this.saveState();
    this.state.errors[name] = error;
    console.log(`❌ Error ${name}: "${error}"`);
  }
  
  clearFieldError(name: string): void {
    this.saveState();
    delete this.state.errors[name];
    console.log(`✅ Cleared error for ${name}`);
  }
  
  resetForm(): void {
    this.saveState();
    this.state = { values: {}, errors: {}, isDirty: false };
    console.log('🔄 Form reset');
  }
  
  private saveState(): void {
    this.history.push({
      values: { ...this.state.values },
      errors: { ...this.state.errors },
      isDirty: this.state.isDirty
    });
  }
  
  restoreState(): void {
    if (this.history.length > 0) {
      this.state = this.history.pop()!;
      console.log('↩️  State restored');
    }
  }
  
  getState(): FormState {
    return { ...this.state };
  }
}

// Form commands
class SetFieldCommand implements Command {
  private form: FormManager;
  private name: string;
  private value: string;
  
  constructor(form: FormManager, name: string, value: string) {
    this.form = form;
    this.name = name;
    this.value = value;
  }
  
  execute(): void {
    this.form.setFieldValue(this.name, this.value);
  }
  
  undo(): void {
    this.form.restoreState();
  }
}

class SetErrorCommand implements Command {
  private form: FormManager;
  private name: string;
  private error: string;
  
  constructor(form: FormManager, name: string, error: string) {
    this.form = form;
    this.name = name;
    this.error = error;
  }
  
  execute(): void {
    this.form.setFieldError(this.name, this.error);
  }
  
  undo(): void {
    this.form.restoreState();
  }
}

class ResetFormCommand implements Command {
  private form: FormManager;
  
  constructor(form: FormManager) {
    this.form = form;
  }
  
  execute(): void {
    this.form.resetForm();
  }
  
  undo(): void {
    this.form.restoreState();
  }
}

// Form invoker (simulates React form hook)
class FormInvoker {
  private form: FormManager;
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  
  constructor(form: FormManager) {
    this.form = form;
  }
  
  executeCommand(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
  }
  
  undo(): void {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop()!;
      command.undo();
      this.redoStack.push(command);
    }
  }
  
  redo(): void {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop()!;
      command.execute();
      this.undoStack.push(command);
    }
  }
  
  getFormState(): FormState {
    return this.form.getState();
  }
}

// Simulated React component
class RegistrationForm {
  private form: FormManager;
  private invoker: FormInvoker;
  
  constructor() {
    this.form = new FormManager();
    this.invoker = new FormInvoker(this.form);
  }
  
  // Simulate React event handlers
  handleFieldChange(fieldName: string, value: string): void {
    const command = new SetFieldCommand(this.form, fieldName, value);
    this.invoker.executeCommand(command);
  }
  
  handleFieldBlur(fieldName: string): void {
    const command = new SetErrorCommand(this.form, fieldName, 'Invalid email format');
    this.invoker.executeCommand(command);
  }
  
  handleSubmit(): void {
    const submitCommand = new ResetFormCommand(this.form);
    this.invoker.executeCommand(submitCommand);
  }
  
  handleReset(): void {
    const resetCommand = new ResetFormCommand(this.form);
    this.invoker.executeCommand(resetCommand);
  }
  
  handleUndo(): void {
    this.invoker.undo();
  }
  
  handleRedo(): void {
    this.invoker.redo();
  }
  
  getFormState(): FormState {
    return this.invoker.getFormState();
  }
}

// Demo
console.log('=== REACT FORM COMMAND PATTERN DEMO ===\n');

const formManager = new FormManager();
const invoker = new FormInvoker(formManager);

// Simulate form interactions
console.log('--- Filling Form ---');
invoker.executeCommand(new SetFieldCommand(formManager, 'name', 'John Doe'));
invoker.executeCommand(new SetFieldCommand(formManager, 'email', 'john@example.com'));
invoker.executeCommand(new SetFieldCommand(formManager, 'password', 'password123'));

console.log('\n--- Form State ---');
console.log(invoker.getFormState());

console.log('\n--- Adding Validation Error ---');
invoker.executeCommand(new SetErrorCommand(formManager, 'email', 'Invalid email format'));

console.log('\n--- Undoing Error ---');
invoker.undo();

console.log('\n--- Redoing Error ---');
invoker.redo();

console.log('\n--- Resetting Form ---');
invoker.executeCommand(new ResetFormCommand(formManager));

console.log('\n--- Final State ---');
console.log(invoker.getFormState());

exit(0); 