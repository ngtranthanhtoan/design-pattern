# Command Pattern in React Forms: A Comprehensive Guide

## Overview

The Command pattern is incredibly powerful for React form management, especially when you need:
- **Undo/Redo functionality** for form changes
- **Form validation** with rollback capabilities
- **Complex form state management** with history
- **Form submission** with error handling
- **Form field transformations** and calculations

## Real-World React Implementation

### 1. Custom Form Hook with Command Pattern

```typescript
// hooks/useFormWithCommands.ts
import { useState, useCallback, useRef } from 'react';

interface Command {
  execute(): void;
  undo(): void;
  canExecute(): boolean;
}

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  isDirty: boolean;
  isSubmitting: boolean;
}

export function useFormWithCommands(initialValues: Record<string, any> = {}) {
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: {},
    isDirty: false,
    isSubmitting: false
  });
  
  const undoStack = useRef<Command[]>([]);
  const redoStack = useRef<Command[]>([]);
  const history = useRef<FormState[]>([]);

  const saveState = useCallback(() => {
    history.current.push({ ...state });
  }, [state]);

  const restoreState = useCallback(() => {
    if (history.current.length > 0) {
      const previousState = history.current.pop()!;
      setState(previousState);
    }
  }, []);

  const executeCommand = useCallback((command: Command) => {
    if (command.canExecute()) {
      saveState();
      command.execute();
      undoStack.current.push(command);
      redoStack.current = []; // Clear redo stack
    }
  }, [saveState]);

  const undo = useCallback(() => {
    if (undoStack.current.length > 0) {
      const command = undoStack.current.pop()!;
      command.undo();
      redoStack.current.push(command);
    }
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length > 0) {
      const command = redoStack.current.pop()!;
      command.execute();
      undoStack.current.push(command);
    }
  }, []);

  return {
    state,
    setState,
    executeCommand,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0
  };
}
```

### 2. Form Commands Implementation

```typescript
// commands/formCommands.ts
interface FormCommand extends Command {
  form: FormManager;
}

class SetFieldValueCommand implements FormCommand {
  constructor(
    private form: FormManager,
    private fieldName: string,
    private value: any,
    private previousValue: any
  ) {}

  execute(): void {
    this.form.setFieldValue(this.fieldName, this.value);
  }

  undo(): void {
    this.form.setFieldValue(this.fieldName, this.previousValue);
  }

  canExecute(): boolean {
    return this.value !== this.previousValue;
  }
}

class SetFieldErrorCommand implements FormCommand {
  constructor(
    private form: FormManager,
    private fieldName: string,
    private error: string,
    private previousError?: string
  ) {}

  execute(): void {
    this.form.setFieldError(this.fieldName, this.error);
  }

  undo(): void {
    if (this.previousError) {
      this.form.setFieldError(this.fieldName, this.previousError);
    } else {
      this.form.clearFieldError(this.fieldName);
    }
  }

  canExecute(): boolean {
    return this.error !== this.previousError;
  }
}

class ValidateFormCommand implements FormCommand {
  private validationErrors: Map<string, string> = new Map();

  constructor(private form: FormManager) {}

  execute(): void {
    // Run validation logic
    const fields = Object.keys(this.form.getState().values);
    fields.forEach(fieldName => {
      const error = this.validateField(fieldName, this.form.getFieldValue(fieldName));
      if (error) {
        this.validationErrors.set(fieldName, error);
        this.form.setFieldError(fieldName, error);
      }
    });
  }

  undo(): void {
    // Clear all validation errors
    this.validationErrors.forEach((error, fieldName) => {
      this.form.clearFieldError(fieldName);
    });
  }

  canExecute(): boolean {
    return true;
  }

  private validateField(name: string, value: any): string | null {
    // Implement your validation logic
    switch (name) {
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email' : null;
      case 'password':
        return value.length < 8 ? 'Password too short' : null;
      default:
        return null;
    }
  }
}
```

### 3. React Component Implementation

```typescript
// components/FormWithCommands.tsx
import React from 'react';
import { useFormWithCommands } from '../hooks/useFormWithCommands';
import { SetFieldValueCommand, SetFieldErrorCommand, ValidateFormCommand } from '../commands/formCommands';

interface FormWithCommandsProps {
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function FormWithCommands({ onSubmit }: FormWithCommandsProps) {
  const { state, setState, executeCommand, undo, redo, canUndo, canRedo } = useFormWithCommands();

  const handleFieldChange = (fieldName: string, value: any) => {
    const previousValue = state.values[fieldName];
    const command = new SetFieldValueCommand(
      { setState, getState: () => state },
      fieldName,
      value,
      previousValue
    );
    executeCommand(command);
  };

  const handleFieldBlur = (fieldName: string) => {
    const command = new ValidateFormCommand({ setState, getState: () => state });
    executeCommand(command);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validateCommand = new ValidateFormCommand({ setState, getState: () => state });
    executeCommand(validateCommand);

    if (Object.keys(state.errors).length === 0) {
      setState(prev => ({ ...prev, isSubmitting: true }));
      try {
        await onSubmit(state.values);
        console.log('Form submitted successfully');
      } catch (error) {
        console.error('Form submission failed:', error);
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Undo/Redo Controls */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ↩️ Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          ↻ Redo
        </button>
      </div>

      {/* Form Fields */}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={state.values.name || ''}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onBlur={() => handleFieldBlur('name')}
          className="w-full p-2 border rounded"
        />
        {state.errors.name && (
          <p className="text-red-500 text-sm mt-1">{state.errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={state.values.email || ''}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => handleFieldBlur('email')}
          className="w-full p-2 border rounded"
        />
        {state.errors.email && (
          <p className="text-red-500 text-sm mt-1">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={state.values.password || ''}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          onBlur={() => handleFieldBlur('password')}
          className="w-full p-2 border rounded"
        />
        {state.errors.password && (
          <p className="text-red-500 text-sm mt-1">{state.errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={state.isSubmitting || Object.keys(state.errors).length > 0}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {state.isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Advanced Use Cases

### 1. Form Field Transformations

```typescript
class TransformFieldCommand implements FormCommand {
  constructor(
    private form: FormManager,
    private fieldName: string,
    private transformer: (value: any) => any,
    private previousValue: any
  ) {}

  execute(): void {
    const currentValue = this.form.getFieldValue(this.fieldName);
    const transformedValue = this.transformer(currentValue);
    this.form.setFieldValue(this.fieldName, transformedValue);
  }

  undo(): void {
    this.form.setFieldValue(this.fieldName, this.previousValue);
  }

  canExecute(): boolean {
    return true;
  }
}

// Usage: Auto-format phone numbers
const formatPhoneCommand = new TransformFieldCommand(
  form,
  'phone',
  (value) => value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
  previousValue
);
```

### 2. Conditional Field Commands

```typescript
class ConditionalFieldCommand implements FormCommand {
  constructor(
    private form: FormManager,
    private condition: () => boolean,
    private command: FormCommand
  ) {}

  execute(): void {
    if (this.condition()) {
      this.command.execute();
    }
  }

  undo(): void {
    if (this.condition()) {
      this.command.undo();
    }
  }

  canExecute(): boolean {
    return this.condition() && this.command.canExecute();
  }
}

// Usage: Show/hide fields based on conditions
const showAddressCommand = new ConditionalFieldCommand(
  form,
  () => form.getFieldValue('hasAddress') === 'yes',
  new SetFieldValueCommand(form, 'address', '', '')
);
```

### 3. Form Submission with Retry

```typescript
class SubmitFormCommand implements FormCommand {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(
    private form: FormManager,
    private onSubmit: (data: any) => Promise<void>
  ) {}

  async execute(): Promise<void> {
    this.form.setSubmitting(true);
    
    try {
      await this.onSubmit(this.form.getFormData());
      this.form.setSubmitting(false);
    } catch (error) {
      this.retryCount++;
      if (this.retryCount < this.maxRetries) {
        // Retry logic
        setTimeout(() => this.execute(), 1000 * this.retryCount);
      } else {
        this.form.setSubmitting(false);
        throw error;
      }
    }
  }

  undo(): void {
    // Cannot undo submission, but can reset form
    this.form.resetForm();
  }

  canExecute(): boolean {
    return this.form.isFormValid() && !this.form.isSubmitting();
  }
}
```

## Benefits in React Forms

### ✅ **Undo/Redo Functionality**
- Users can undo accidental changes
- Redo functionality for restoring changes
- Complete form history tracking

### ✅ **Form Validation with Rollback**
- Validation errors can be undone
- Complex validation rules with command composition
- Field-level validation with state preservation

### ✅ **Complex Form State Management**
- Multi-step forms with history
- Conditional field visibility
- Form field transformations

### ✅ **Form Submission Control**
- Submission with retry logic
- Error handling with rollback
- Async operation management

### ✅ **Form Field Transformations**
- Auto-formatting (phone, credit card, etc.)
- Data normalization
- Conditional calculations

## Best Practices

### 1. **Command Granularity**
```typescript
// Good: Granular commands
new SetFieldValueCommand(form, 'email', 'new@email.com', 'old@email.com');

// Avoid: Too coarse commands
new UpdateEntireFormCommand(form, newFormData);
```

### 2. **State Management**
```typescript
// Always save state before executing commands
const saveState = () => {
  history.push({ ...currentState });
};

// Restore state on undo
const undo = () => {
  if (history.length > 0) {
    const previousState = history.pop();
    setState(previousState);
  }
};
```

### 3. **Command Composition**
```typescript
// Compose multiple commands for complex operations
const macroCommand = new MacroCommand([
  new SetFieldValueCommand(form, 'email', email, previousEmail),
  new ValidateFormCommand(form),
  new SetFieldErrorCommand(form, 'email', error, previousError)
]);
```

### 4. **Performance Considerations**
```typescript
// Limit history size to prevent memory issues
const MAX_HISTORY_SIZE = 50;

const saveState = () => {
  if (history.length >= MAX_HISTORY_SIZE) {
    history.shift(); // Remove oldest entry
  }
  history.push({ ...currentState });
};
```

## Integration with Form Libraries

### React Hook Form Integration
```typescript
import { useForm } from 'react-hook-form';

export function useFormWithCommandsAndReactHookForm() {
  const { register, handleSubmit, setValue, formState } = useForm();
  const { executeCommand, undo, redo } = useFormWithCommands();

  const handleFieldChange = (fieldName: string, value: any) => {
    const command = new SetFieldValueCommand(
      { setValue, getValues: () => formState },
      fieldName,
      value
    );
    executeCommand(command);
  };

  return {
    register,
    handleSubmit,
    handleFieldChange,
    undo,
    redo,
    formState
  };
}
```

### Formik Integration
```typescript
import { useFormik } from 'formik';

export function useFormikWithCommands() {
  const formik = useFormik({
    initialValues: { name: '', email: '' },
    onSubmit: (values) => console.log(values)
  });

  const { executeCommand, undo, redo } = useFormWithCommands();

  const handleFieldChange = (fieldName: string, value: any) => {
    const command = new SetFieldValueCommand(
      { setFieldValue: formik.setFieldValue, values: formik.values },
      fieldName,
      value
    );
    executeCommand(command);
  };

  return {
    ...formik,
    handleFieldChange,
    undo,
    redo
  };
}
```

This comprehensive approach to using the Command pattern in React forms provides powerful form management capabilities with undo/redo functionality, complex validation, and robust state management. 