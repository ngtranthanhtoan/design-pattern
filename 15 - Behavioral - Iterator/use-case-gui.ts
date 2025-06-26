import { exit } from 'process';

// Iterator interface
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
  current(): T;
  reset(): void;
}

// UI Component interface
interface UIComponent {
  id: string;
  type: 'button' | 'input' | 'label' | 'container' | 'form' | 'table';
  name: string;
  visible: boolean;
  enabled: boolean;
  value?: string;
  children: UIComponent[];
  addChild(child: UIComponent): void;
  removeChild(childId: string): void;
  getChildren(): UIComponent[];
  setValue(value: string): void;
  getValue(): string | undefined;
  setVisible(visible: boolean): void;
  setEnabled(enabled: boolean): void;
}

// Base UI Component implementation
class BaseUIComponent implements UIComponent {
  public children: UIComponent[] = [];
  
  constructor(
    public id: string,
    public type: UIComponent['type'],
    public name: string,
    public visible: boolean = true,
    public enabled: boolean = true,
    public value?: string
  ) {}
  
  addChild(child: UIComponent): void {
    if (this.type === 'container' || this.type === 'form' || this.type === 'table') {
      this.children.push(child);
    }
  }
  
  removeChild(childId: string): void {
    this.children = this.children.filter(child => child.id !== childId);
  }
  
  getChildren(): UIComponent[] {
    return this.children;
  }
  
  setValue(value: string): void {
    this.value = value;
  }
  
  getValue(): string | undefined {
    return this.value;
  }
  
  setVisible(visible: boolean): void {
    this.visible = visible;
  }
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// GUI Collection interface
interface GUICollection {
  getRoot(): UIComponent;
  createIterator(strategy: 'depth-first' | 'breadth-first' | 'visible-only' | 'enabled-only'): Iterator<UIComponent>;
}

// GUI Collection implementation
class GUICollection implements GUICollection {
  private root: UIComponent;
  
  constructor(root: UIComponent) {
    this.root = root;
  }
  
  getRoot(): UIComponent {
    return this.root;
  }
  
  createIterator(strategy: 'depth-first' | 'breadth-first' | 'visible-only' | 'enabled-only'): Iterator<UIComponent> {
    switch (strategy) {
      case 'depth-first':
        return new DepthFirstGUIIterator(this.root);
      case 'breadth-first':
        return new BreadthFirstGUIIterator(this.root);
      case 'visible-only':
        return new VisibleOnlyGUIIterator(this.root);
      case 'enabled-only':
        return new EnabledOnlyGUIIterator(this.root);
      default:
        return new DepthFirstGUIIterator(this.root);
    }
  }
}

// Depth-first GUI iterator
class DepthFirstGUIIterator implements Iterator<UIComponent> {
  private stack: UIComponent[] = [];
  private currentIndex: number = 0;
  private items: UIComponent[] = [];
  
  constructor(private root: UIComponent) {
    this.traverse();
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.items.length;
  }
  
  next(): UIComponent {
    if (!this.hasNext()) {
      throw new Error('No more components');
    }
    return this.items[this.currentIndex++];
  }
  
  current(): UIComponent {
    if (this.currentIndex >= this.items.length) {
      throw new Error('No current component');
    }
    return this.items[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private traverse(): void {
    this.stack = [this.root];
    
    while (this.stack.length > 0) {
      const component = this.stack.pop()!;
      this.items.push(component);
      
      // Add children to stack (reverse order for correct traversal)
      for (let i = component.getChildren().length - 1; i >= 0; i--) {
        this.stack.push(component.getChildren()[i]);
      }
    }
  }
}

// Breadth-first GUI iterator
class BreadthFirstGUIIterator implements Iterator<UIComponent> {
  private queue: UIComponent[] = [];
  private currentIndex: number = 0;
  private items: UIComponent[] = [];
  
  constructor(private root: UIComponent) {
    this.traverse();
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.items.length;
  }
  
  next(): UIComponent {
    if (!this.hasNext()) {
      throw new Error('No more components');
    }
    return this.items[this.currentIndex++];
  }
  
  current(): UIComponent {
    if (this.currentIndex >= this.items.length) {
      throw new Error('No current component');
    }
    return this.items[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private traverse(): void {
    this.queue = [this.root];
    
    while (this.queue.length > 0) {
      const component = this.queue.shift()!;
      this.items.push(component);
      
      // Add children to queue
      for (const child of component.getChildren()) {
        this.queue.push(child);
      }
    }
  }
}

// Visible-only GUI iterator
class VisibleOnlyGUIIterator implements Iterator<UIComponent> {
  private iterator: Iterator<UIComponent>;
  private currentComponent: UIComponent | null = null;
  
  constructor(private root: UIComponent) {
    this.iterator = new DepthFirstGUIIterator(root);
  }
  
  hasNext(): boolean {
    // Look ahead for next visible component
    while (this.iterator.hasNext()) {
      const component = this.iterator.next();
      if (component.visible) {
        this.currentComponent = component;
        return true;
      }
    }
    return false;
  }
  
  next(): UIComponent {
    if (this.currentComponent === null) {
      throw new Error('No more visible components');
    }
    
    const result = this.currentComponent;
    this.currentComponent = null;
    return result;
  }
  
  current(): UIComponent {
    if (this.currentComponent === null) {
      throw new Error('No current component');
    }
    return this.currentComponent;
  }
  
  reset(): void {
    this.iterator = new DepthFirstGUIIterator(this.root);
    this.currentComponent = null;
  }
}

// Enabled-only GUI iterator
class EnabledOnlyGUIIterator implements Iterator<UIComponent> {
  private iterator: Iterator<UIComponent>;
  private currentComponent: UIComponent | null = null;
  
  constructor(private root: UIComponent) {
    this.iterator = new DepthFirstGUIIterator(root);
  }
  
  hasNext(): boolean {
    // Look ahead for next enabled component
    while (this.iterator.hasNext()) {
      const component = this.iterator.next();
      if (component.enabled) {
        this.currentComponent = component;
        return true;
      }
    }
    return false;
  }
  
  next(): UIComponent {
    if (this.currentComponent === null) {
      throw new Error('No more enabled components');
    }
    
    const result = this.currentComponent;
    this.currentComponent = null;
    return result;
  }
  
  current(): UIComponent {
    if (this.currentComponent === null) {
      throw new Error('No current component');
    }
    return this.currentComponent;
  }
  
  reset(): void {
    this.iterator = new DepthFirstGUIIterator(this.root);
    this.currentComponent = null;
  }
}

// GUI Operations
class GUIOperations {
  static validateForm(iterator: Iterator<UIComponent>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let valid = true;
    
    while (iterator.hasNext()) {
      const component = iterator.next();
      
      if (component.type === 'input' && component.visible && component.enabled) {
        const value = component.getValue();
        if (!value || value.trim() === '') {
          errors.push(`${component.name} is required`);
          valid = false;
        }
      }
    }
    
    return { valid, errors };
  }
  
  static updateStyles(iterator: Iterator<UIComponent>, styleUpdate: (component: UIComponent) => void): void {
    while (iterator.hasNext()) {
      const component = iterator.next();
      styleUpdate(component);
    }
  }
  
  static collectValues(iterator: Iterator<UIComponent>): Record<string, string> {
    const values: Record<string, string> = {};
    
    while (iterator.hasNext()) {
      const component = iterator.next();
      
      if (component.type === 'input' && component.getValue()) {
        values[component.name] = component.getValue()!;
      }
    }
    
    return values;
  }
  
  static disableComponents(iterator: Iterator<UIComponent>): void {
    while (iterator.hasNext()) {
      const component = iterator.next();
      component.setEnabled(false);
    }
  }
  
  static enableComponents(iterator: Iterator<UIComponent>): void {
    while (iterator.hasNext()) {
      const component = iterator.next();
      component.setEnabled(true);
    }
  }
}

// Demo
console.log('=== GUI COMPONENT ITERATOR DEMO ===\n');

// Build a complex GUI structure
const mainForm = new BaseUIComponent('main-form', 'form', 'User Registration Form');

const personalInfo = new BaseUIComponent('personal-info', 'container', 'Personal Information');
const nameInput = new BaseUIComponent('name-input', 'input', 'Full Name', true, true, '');
const emailInput = new BaseUIComponent('email-input', 'input', 'Email Address', true, true, '');
const nameLabel = new BaseUIComponent('name-label', 'label', 'Name Label', true, true, 'Full Name:');
const emailLabel = new BaseUIComponent('email-label', 'label', 'Email Label', true, true, 'Email:');

const addressInfo = new BaseUIComponent('address-info', 'container', 'Address Information');
const streetInput = new BaseUIComponent('street-input', 'input', 'Street Address', true, true, '');
const cityInput = new BaseUIComponent('city-input', 'input', 'City', true, true, '');
const streetLabel = new BaseUIComponent('street-label', 'label', 'Street Label', true, true, 'Street:');
const cityLabel = new BaseUIComponent('city-label', 'label', 'City Label', true, true, 'City:');

const submitButton = new BaseUIComponent('submit-btn', 'button', 'Submit', true, true, 'Submit');
const cancelButton = new BaseUIComponent('cancel-btn', 'button', 'Cancel', true, true, 'Cancel');
const hiddenField = new BaseUIComponent('hidden-field', 'input', 'Hidden Field', false, true, 'secret');

// Build the hierarchy
mainForm.addChild(personalInfo);
mainForm.addChild(addressInfo);
mainForm.addChild(submitButton);
mainForm.addChild(cancelButton);
mainForm.addChild(hiddenField);

personalInfo.addChild(nameLabel);
personalInfo.addChild(nameInput);
personalInfo.addChild(emailLabel);
personalInfo.addChild(emailInput);

addressInfo.addChild(streetLabel);
addressInfo.addChild(streetInput);
addressInfo.addChild(cityLabel);
addressInfo.addChild(cityInput);

// Create GUI collection
const guiCollection = new GUICollection(mainForm);

// Depth-first traversal
console.log('--- Depth-First Component Traversal ---');
const depthFirstIterator = guiCollection.createIterator('depth-first');
while (depthFirstIterator.hasNext()) {
  const component = depthFirstIterator.next();
  console.log(`  🎨 ${component.type.toUpperCase()}: ${component.name} (${component.id})`);
}

// Breadth-first traversal
console.log('\n--- Breadth-First Component Traversal ---');
const breadthFirstIterator = guiCollection.createIterator('breadth-first');
while (breadthFirstIterator.hasNext()) {
  const component = breadthFirstIterator.next();
  console.log(`  🎨 ${component.type.toUpperCase()}: ${component.name} (${component.id})`);
}

// Visible-only traversal
console.log('\n--- Visible-Only Component Traversal ---');
const visibleIterator = guiCollection.createIterator('visible-only');
while (visibleIterator.hasNext()) {
  const component = visibleIterator.next();
  console.log(`  👁️  ${component.type.toUpperCase()}: ${component.name} (${component.id})`);
}

// Form validation
console.log('\n--- Form Validation ---');
// Set some values for testing
nameInput.setValue('John Doe');
emailInput.setValue('john@example.com');
streetInput.setValue('123 Main St');
// Leave city empty to test validation

const validationIterator = guiCollection.createIterator('depth-first');
const validation = GUIOperations.validateForm(validationIterator);

if (validation.valid) {
  console.log('  ✅ Form is valid');
} else {
  console.log('  ❌ Form has errors:');
  validation.errors.forEach(error => console.log(`    - ${error}`));
}

// Collect form values
console.log('\n--- Collecting Form Values ---');
const valuesIterator = guiCollection.createIterator('depth-first');
const formValues = GUIOperations.collectValues(valuesIterator);
console.log('  📝 Form values:', formValues);

// Disable all components
console.log('\n--- Disabling All Components ---');
const disableIterator = guiCollection.createIterator('depth-first');
GUIOperations.disableComponents(disableIterator);

// Show enabled-only traversal (should be empty now)
console.log('--- Enabled-Only Component Traversal (After Disable) ---');
const enabledIterator = guiCollection.createIterator('enabled-only');
let enabledCount = 0;
while (enabledIterator.hasNext()) {
  const component = enabledIterator.next();
  console.log(`  ✅ ${component.type.toUpperCase()}: ${component.name} (${component.id})`);
  enabledCount++;
}

if (enabledCount === 0) {
  console.log('  📝 No enabled components found');
}

// Re-enable components
console.log('\n--- Re-enabling Components ---');
const enableIterator = guiCollection.createIterator('depth-first');
GUIOperations.enableComponents(enableIterator);

// Reset and iterate again
console.log('\n--- Reset and Iterate Again (Depth-First) ---');
depthFirstIterator.reset();
let count = 0;
while (depthFirstIterator.hasNext() && count < 5) {
  const component = depthFirstIterator.next();
  console.log(`  🎨 ${component.type.toUpperCase()}: ${component.name}`);
  count++;
}

console.log('\n✅ GUI component iteration completed successfully');

exit(0); 