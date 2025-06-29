// ============================================================================
// UI COMPONENT FACTORY - Multi-Theme UI Component Creation
// ============================================================================

import { exit } from "process";

// Component styling and behavior interfaces
interface ComponentStyle {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
  };
  fonts: {
    family: string;
    sizes: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: string;
  shadows: Record<string, string>;
}

interface ComponentProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  onClick?: () => void;
  [key: string]: any;
}

// Product interface - what all UI components must implement
interface UIComponent {
  render(): string;
  getProps(): ComponentProps;
  setProps(props: Partial<ComponentProps>): void;
  getStyles(): ComponentStyle;
  addEventHandler(event: string, handler: () => void): void;
  destroy(): void;
}

// Factory product interfaces for different component types
interface Button extends UIComponent {
  click(): void;
  setLoading(loading: boolean): void;
  onClick(handler: () => void): void; // Add the documented API method
}

interface Input extends UIComponent {
  getValue(): string;
  setValue(value: string): void;
  validate(): boolean;
}

interface Modal extends UIComponent {
  show(): void;
  hide(): void;
  setContent(content: string): void;
}

// Abstract Creator - defines the factory methods
abstract class UIComponentFactory {
  // Factory methods - to be implemented by concrete creators
  abstract createButton(props?: ComponentProps): Button;
  abstract createInput(props?: ComponentProps): Input;
  abstract createModal(props?: ComponentProps): Modal;
  abstract getTheme(): ComponentStyle;
  
  // Template methods that use the factory methods
  public createComponentSet(config: any): { button: Button; input: Input; modal: Modal } {
    return {
      button: this.createButton(config.button),
      input: this.createInput(config.input),
      modal: this.createModal(config.modal)
    };
  }
  
  // Static method to create appropriate factory based on theme
  public static create(theme: string): UIComponentFactory {
    switch (theme.toLowerCase()) {
      case 'material-design':
      case 'material':
        return new MaterialDesignFactory();
      case 'bootstrap':
        return new BootstrapFactory();
      case 'tailwind':
        return new TailwindFactory();
      case 'antd':
      case 'ant-design':
        return new AntDesignFactory();
      case 'chakra':
        return new ChakraUIFactory();
      default:
        throw new Error(`Unsupported UI theme: ${theme}`);
    }
  }
}

// Base component implementation
abstract class BaseComponent implements UIComponent {
  protected props: ComponentProps;
  protected style: ComponentStyle;
  protected eventHandlers: Map<string, () => void> = new Map();

  constructor(props: ComponentProps, style: ComponentStyle) {
    this.props = props;
    this.style = style;
  }

  abstract render(): string;

  getProps(): ComponentProps {
    return { ...this.props };
  }

  setProps(props: Partial<ComponentProps>): void {
    this.props = { ...this.props, ...props };
  }

  getStyles(): ComponentStyle {
    return this.style;
  }

  addEventHandler(event: string, handler: () => void): void {
    this.eventHandlers.set(event, handler);
  }

  destroy(): void {
    this.eventHandlers.clear();
  }

  protected getVariantStyles(): string {
    const variant = this.props.variant || 'primary';
    switch (variant) {
      case 'primary':
        return `background-color: ${this.style.colors.primary}; color: white;`;
      case 'secondary':
        return `background-color: ${this.style.colors.secondary}; color: white;`;
      case 'outline':
        return `background-color: transparent; border: 2px solid ${this.style.colors.primary}; color: ${this.style.colors.primary};`;
      case 'ghost':
        return `background-color: transparent; color: ${this.style.colors.primary};`;
      default:
        return `background-color: ${this.style.colors.primary}; color: white;`;
    }
  }

  protected getSizeStyles(): string {
    const size = this.props.size || 'medium';
    switch (size) {
      case 'small':
        return `padding: ${this.style.spacing.sm}; font-size: ${this.style.fonts.sizes.sm};`;
      case 'medium':
        return `padding: ${this.style.spacing.md}; font-size: ${this.style.fonts.sizes.md};`;
      case 'large':
        return `padding: ${this.style.spacing.lg}; font-size: ${this.style.fonts.sizes.lg};`;
      default:
        return `padding: ${this.style.spacing.md}; font-size: ${this.style.fonts.sizes.md};`;
    }
  }
}

// Material Design Components
class MaterialButton extends BaseComponent implements Button {
  render(): string {
    const disabled = this.props.disabled ? 'disabled' : '';
    const loading = this.props.loading ? 'loading' : '';
    
    return `
      <button class="material-button ${disabled} ${loading}" 
              style="${this.getVariantStyles()} ${this.getSizeStyles()} 
                     border-radius: ${this.style.borderRadius}; 
                     font-family: ${this.style.fonts.family};
                     box-shadow: ${this.style.shadows.sm};
                     transition: all 0.2s ease;
                     text-transform: uppercase;
                     font-weight: 500;">
        ${this.props.loading ? '⏳ ' : ''}${this.props.icon ? this.props.icon + ' ' : ''}${this.props.text || 'Button'}
      </button>
    `;
  }

  click(): void {
    if (!this.props.disabled && !this.props.loading) {
      console.log(`Material button clicked: ${this.props.text}`);
      const handler = this.eventHandlers.get('click');
      if (handler) handler();
    }
  }

  setLoading(loading: boolean): void {
    this.setProps({ loading });
  }

  onClick(handler: () => void): void {
    this.addEventHandler('click', handler);
  }
}

class MaterialInput extends BaseComponent implements Input {
  private value: string = '';

  render(): string {
    return `
      <div class="material-input-container" style="margin: ${this.style.spacing.md} 0;">
        <input type="text" 
               class="material-input"
               value="${this.value}"
               style="border: none; 
                      border-bottom: 2px solid ${this.style.colors.border};
                      background: transparent;
                      padding: ${this.style.spacing.sm} 0;
                      font-family: ${this.style.fonts.family};
                      font-size: ${this.style.fonts.sizes.md};
                      color: ${this.style.colors.text};
                      width: 100%;
                      outline: none;
                      transition: border-color 0.2s ease;">
        <label class="material-label" 
               style="color: ${this.style.colors.text}; 
                      font-size: ${this.style.fonts.sizes.sm};
                      position: absolute;
                      transition: all 0.2s ease;">
          ${this.props.text || 'Input'}
        </label>
      </div>
    `;
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string): void {
    this.value = value;
    console.log(`Material input value set to: ${value}`);
  }

  validate(): boolean {
    return this.value.length > 0;
  }
}

class MaterialModal extends BaseComponent implements Modal {
  private visible: boolean = false;
  private content: string = '';

  render(): string {
    if (!this.visible) return '';
    
    return `
      <div class="material-modal-overlay" 
           style="position: fixed; 
                  top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(0,0,0,0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 1000;">
        <div class="material-modal-content"
             style="background: ${this.style.colors.background};
                    border-radius: ${this.style.borderRadius};
                    padding: ${this.style.spacing.xl};
                    box-shadow: ${this.style.shadows.lg};
                    max-width: 500px;
                    width: 90%;
                    font-family: ${this.style.fonts.family};">
          <h3 style="color: ${this.style.colors.text}; margin: 0 0 ${this.style.spacing.md} 0;">
            ${this.props.text || 'Modal'}
          </h3>
          <div style="color: ${this.style.colors.text};">
            ${this.content}
          </div>
        </div>
      </div>
    `;
  }

  show(): void {
    this.visible = true;
    console.log('Material modal shown');
  }

  hide(): void {
    this.visible = false;
    console.log('Material modal hidden');
  }

  setContent(content: string): void {
    this.content = content;
  }
}

// Bootstrap Components (simplified implementations)
class BootstrapButton extends BaseComponent implements Button {
  render(): string {
    const variant = this.props.variant || 'primary';
    const size = this.props.size || 'medium';
    const sizeClass = size === 'small' ? 'btn-sm' : size === 'large' ? 'btn-lg' : '';
    
    return `
      <button class="btn btn-${variant} ${sizeClass}" 
              style="font-family: ${this.style.fonts.family};"
              ${this.props.disabled ? 'disabled' : ''}>
        ${this.props.loading ? '<span class="spinner-border spinner-border-sm"></span> ' : ''}
        ${this.props.icon ? this.props.icon + ' ' : ''}${this.props.text || 'Button'}
      </button>
    `;
  }

  click(): void {
    if (!this.props.disabled && !this.props.loading) {
      console.log(`Bootstrap button clicked: ${this.props.text}`);
      const handler = this.eventHandlers.get('click');
      if (handler) handler();
    }
  }

  setLoading(loading: boolean): void {
    this.setProps({ loading });
  }

  onClick(handler: () => void): void {
    this.addEventHandler('click', handler);
  }
}

class BootstrapInput extends BaseComponent implements Input {
  private value: string = '';

  render(): string {
    return `
      <div class="form-group">
        <label class="form-label">${this.props.text || 'Input'}</label>
        <input type="text" 
               class="form-control" 
               value="${this.value}"
               style="font-family: ${this.style.fonts.family};">
      </div>
    `;
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string): void {
    this.value = value;
    console.log(`Bootstrap input value set to: ${value}`);
  }

  validate(): boolean {
    return this.value.length > 0;
  }
}

class BootstrapModal extends BaseComponent implements Modal {
  private visible: boolean = false;
  private content: string = '';

  render(): string {
    return `
      <div class="modal ${this.visible ? 'show' : ''}" 
           style="display: ${this.visible ? 'block' : 'none'};">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${this.props.text || 'Modal'}</h5>
            </div>
            <div class="modal-body">
              ${this.content}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  show(): void {
    this.visible = true;
    console.log('Bootstrap modal shown');
  }

  hide(): void {
    this.visible = false;
    console.log('Bootstrap modal hidden');
  }

  setContent(content: string): void {
    this.content = content;
  }
}

// Concrete Creator implementations
class MaterialDesignFactory extends UIComponentFactory {
  private theme: ComponentStyle = {
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      background: '#ffffff',
      text: '#212121',
      border: '#e0e0e0'
    },
    fonts: {
      family: 'Roboto, sans-serif',
      sizes: {
        sm: '12px',
        md: '14px',
        lg: '16px',
        xl: '18px'
      }
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    borderRadius: '4px',
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.1)',
      md: '0 4px 8px rgba(0,0,0,0.15)',
      lg: '0 8px 16px rgba(0,0,0,0.2)'
    }
  };

  createButton(props?: ComponentProps): Button {
    return new MaterialButton(props || {}, this.theme);
  }

  createInput(props?: ComponentProps): Input {
    return new MaterialInput(props || {}, this.theme);
  }

  createModal(props?: ComponentProps): Modal {
    return new MaterialModal(props || {}, this.theme);
  }

  getTheme(): ComponentStyle {
    return this.theme;
  }
}

class BootstrapFactory extends UIComponentFactory {
  private theme: ComponentStyle = {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      background: '#ffffff',
      text: '#212529',
      border: '#dee2e6'
    },
    fonts: {
      family: 'system-ui, -apple-system, sans-serif',
      sizes: {
        sm: '12px',
        md: '14px',
        lg: '16px',
        xl: '18px'
      }
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    borderRadius: '6px',
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)'
    }
  };

  createButton(props?: ComponentProps): Button {
    return new BootstrapButton(props || {}, this.theme);
  }

  createInput(props?: ComponentProps): Input {
    return new BootstrapInput(props || {}, this.theme);
  }

  createModal(props?: ComponentProps): Modal {
    return new BootstrapModal(props || {}, this.theme);
  }

  getTheme(): ComponentStyle {
    return this.theme;
  }
}

// Simplified factories for demo (using Bootstrap components)
class TailwindFactory extends BootstrapFactory {}
class AntDesignFactory extends BootstrapFactory {}
class ChakraUIFactory extends BootstrapFactory {}

// UI Builder Service - shows real-world usage
class UIBuilderService {
  constructor(private factory: UIComponentFactory) {}

  buildLoginForm(): { button: Button; input: Input; modal: Modal } {
    const emailInput = this.factory.createInput({ 
      text: 'Email Address',
      size: 'medium'
    });
    
    const loginButton = this.factory.createButton({ 
      text: 'Sign In',
      variant: 'primary',
      size: 'medium'
    });
    
    const modal = this.factory.createModal({ 
      text: 'Login Error'
    });

    // Set up interactions
    loginButton.addEventHandler('click', () => {
      if (!emailInput.validate()) {
        modal.setContent('Please enter a valid email address');
        modal.show();
      } else {
        console.log('Login attempted with:', emailInput.getValue());
      }
    });

    return { button: loginButton, input: emailInput, modal };
  }

  buildDashboard(): { buttons: Button[]; inputs: Input[]; modals: Modal[] } {
    const buttons = [
      this.factory.createButton({ text: 'Save', variant: 'primary', size: 'medium' }),
      this.factory.createButton({ text: 'Cancel', variant: 'secondary', size: 'medium' }),
      this.factory.createButton({ text: 'Delete', variant: 'outline', size: 'small' })
    ];

    const inputs = [
      this.factory.createInput({ text: 'Title', size: 'large' }),
      this.factory.createInput({ text: 'Description', size: 'medium' })
    ];

    const modals = [
      this.factory.createModal({ text: 'Confirm Delete' }),
      this.factory.createModal({ text: 'Save Success' })
    ];

    return { buttons, inputs, modals };
  }

  renderThemePreview(): string {
    const theme = this.factory.getTheme();
    return `
      <div class="theme-preview" style="font-family: ${theme.fonts.family}; padding: ${theme.spacing.lg};">
        <h2 style="color: ${theme.colors.text};">Theme Preview</h2>
        <p style="color: ${theme.colors.text};">Primary Color: ${theme.colors.primary}</p>
        <p style="color: ${theme.colors.text};">Secondary Color: ${theme.colors.secondary}</p>
        <p style="color: ${theme.colors.text};">Font Family: ${theme.fonts.family}</p>
        <p style="color: ${theme.colors.text};">Border Radius: ${theme.borderRadius}</p>
      </div>
    `;
  }

  switchTheme(newTheme: string): void {
    this.factory = UIComponentFactory.create(newTheme);
    console.log(`Switched to ${newTheme} theme`);
  }
}

// Usage Example - Following the documented API exactly
async function demonstrateUIComponentFactory(): Promise<void> {
  console.log('=== UI COMPONENT FACTORY DEMO ===');
  console.log('Following the documented API pattern:\n');

  const themes = ['material-design', 'bootstrap', 'tailwind'];

  for (const theme of themes) {
    console.log(`--- Testing ${theme.toUpperCase()} Theme ---`);
    
    try {
      // Following the exact documented API
      const componentFactory = UIComponentFactory.create(theme);
      const button = componentFactory.createButton({
        text: 'Submit',
        variant: 'primary',
        size: 'large'
      });

      button.render(); // Renders Material Design button
      button.onClick(() => console.log('Button clicked!'));
      
      console.log('Button created with theme:', theme);
      console.log('Button HTML preview:', button.render().substring(0, 150) + '...');
      
      // Test the onClick functionality
      button.click(); // This should trigger the onClick handler
      
      // Create other components with the same factory
      const input = componentFactory.createInput({
        text: 'Email Address',
        size: 'medium'
      });
      
      const modal = componentFactory.createModal({
        text: 'Confirmation Dialog',
        size: 'medium'
      });
      
      console.log('Input component created:', input.getProps().text);
      console.log('Modal component created:', modal.getProps().text);
      
      // Demonstrate input functionality
      input.setValue('user@example.com');
      console.log('Input value:', input.getValue());
      console.log('Input valid:', input.validate());
      
      // Demonstrate modal functionality
      modal.setContent('Are you sure you want to proceed?');
      modal.show();
      console.log('Modal shown');
      modal.hide();
      console.log('Modal hidden');
      
      // Show theme information
      const themeInfo = componentFactory.getTheme();
      console.log('Primary color:', themeInfo.colors.primary);
      console.log('Font family:', themeInfo.fonts.family);
      
    } catch (error) {
      console.error(`Failed to create ${theme} theme:`, error instanceof Error ? error.message : String(error));
    }
    
    console.log();
  }

  // Advanced usage example
  console.log('--- Advanced Component Factory Usage ---');
  const factory = UIComponentFactory.create('material-design');
  
  // Create a set of components
  const components = factory.createComponentSet({
    button: { text: 'Save', variant: 'primary', size: 'large' },
    input: { text: 'Full Name', size: 'medium' },  
    modal: { text: 'Success', size: 'medium' }
  });
  
  // Set up interactions
  components.button.onClick(() => {
    const name = components.input.getValue();
    if (name) {
      components.modal.setContent(`Hello, ${name}! Your data has been saved.`);
      components.modal.show();
    }
  });
  
  // Simulate user interaction
  components.input.setValue('John Doe');
  components.button.click(); // Should show modal with greeting
  
  console.log(`✅ Successfully demonstrated ${themes.length} UI themes with documented API`);
}

// Testing Example
async function testUIComponentFactory(): Promise<void> {
  console.log('=== UI COMPONENT FACTORY TESTS ===');
  
  // Test 1: Factory creation for different themes
  console.log('Test 1 - Theme factory creation:');
  const supportedThemes = ['material-design', 'bootstrap', 'tailwind', 'antd', 'chakra'];
  
  for (const theme of supportedThemes) {
    try {
      const factory = UIComponentFactory.create(theme);
      console.log(`✅ ${theme}: Factory created successfully`);
    } catch (error) {
      console.log(`❌ ${theme}: Failed to create factory`);
    }
  }
  
  // Test 2: Component creation consistency
  console.log('\nTest 2 - Component creation consistency:');
  const factory = UIComponentFactory.create('material-design');
  
  const button = factory.createButton();
  const input = factory.createInput();
  const modal = factory.createModal();
  
  console.log('✅ Button created:', typeof button.render === 'function');
  console.log('✅ Input created:', typeof input.getValue === 'function');
  console.log('✅ Modal created:', typeof modal.show === 'function');
  
  // Test 3: Theme switching
  console.log('\nTest 3 - Theme switching:');
  const builder = new UIBuilderService(UIComponentFactory.create('material-design'));
  const originalTheme = builder.buildLoginForm().button.getStyles().colors.primary;
  
  builder.switchTheme('bootstrap');
  const newTheme = builder.buildLoginForm().button.getStyles().colors.primary;
  
  console.log('✅ Theme switching works:', originalTheme !== newTheme);
  
  // Test 4: Component interaction
  console.log('\nTest 4 - Component interaction:');
  const testButton = factory.createButton({ text: 'Test' });
  let clicked = false;
  
  testButton.addEventHandler('click', () => { clicked = true; });
  testButton.click();
  
  console.log('✅ Event handling works:', clicked);
  
  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateUIComponentFactory();
  await testUIComponentFactory();
  exit(0);
})();

export {
  UIComponentFactory,
  UIComponent,
  Button,
  Input,
  Modal,
  ComponentStyle,
  ComponentProps,
  UIBuilderService
}; 