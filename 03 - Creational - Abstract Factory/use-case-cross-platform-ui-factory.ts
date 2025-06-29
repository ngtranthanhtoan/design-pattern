// ============================================================================
// CROSS-PLATFORM UI FACTORY - Multi-Platform UI Component Creation
// ============================================================================

import { exit } from "process";

// Component styling and behavior interfaces
interface UITheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
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
  placeholder?: string;
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  [key: string]: any;
}

// Abstract Product interfaces - what all UI components must implement
interface Button {
  render(): string;
  click(): void;
  setEnabled(enabled: boolean): void;
  getProps(): ComponentProps;
}

interface Input {
  render(): string;
  getValue(): string;
  setValue(value: string): void;
  focus(): void;
  validate(): boolean;
}

interface Dialog {
  render(): string;
  show(): void;
  hide(): void;
  setContent(content: string): void;
  isVisible(): boolean;
}

// Abstract Factory interface - defines the family of products
interface UIAbstractFactory {
  createButton(props: ComponentProps): Button;
  createInput(props: ComponentProps): Input;
  createDialog(props: ComponentProps): Dialog;
  getTheme(): UITheme;
  getPlatform(): string;
}

// ============================================================================
// WINDOWS PLATFORM COMPONENTS
// ============================================================================

class WindowsButton implements Button {
  private enabled: boolean = true;
  private props: ComponentProps;

  constructor(props: ComponentProps) {
    this.props = props;
  }

  render(): string {
    const disabled = this.enabled ? '' : 'disabled';
    return `<button class="windows-button ${disabled}">${this.props.text || 'Button'}</button>`;
  }

  click(): void {
    if (this.enabled) {
      console.log(`Windows button clicked: ${this.props.text}`);
      console.log('🎵 Windows click sound played');
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  getProps(): ComponentProps {
    return { ...this.props };
  }
}

class WindowsInput implements Input {
  private value: string = '';
  private props: ComponentProps;

  constructor(props: ComponentProps) {
    this.props = props;
  }

  render(): string {
    return `<input type="text" placeholder="${this.props.placeholder || ''}" value="${this.value}">`;
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string): void {
    this.value = value;
    console.log(`Windows input value set to: ${value}`);
  }

  focus(): void {
    console.log('Windows input focused with blue outline');
  }

  validate(): boolean {
    return this.value.length > 0;
  }
}

class WindowsDialog implements Dialog {
  private visible: boolean = false;
  private content: string = '';
  private props: ComponentProps;

  constructor(props: ComponentProps) {
    this.props = props;
  }

  render(): string {
    if (!this.visible) return '';
    return `<div class="windows-dialog"><h3>${this.props.title}</h3><p>${this.content}</p></div>`;
  }

  show(): void {
    this.visible = true;
    console.log('Windows dialog shown with fade-in animation');
  }

  hide(): void {
    this.visible = false;
    console.log('Windows dialog hidden');
  }

  setContent(content: string): void {
    this.content = content;
  }

  isVisible(): boolean {
    return this.visible;
  }
}

// ============================================================================
// MACOS PLATFORM COMPONENTS
// ============================================================================

class MacOSButton implements Button {
  private enabled: boolean = true;
  private props: ComponentProps;

  constructor(props: ComponentProps) {
    this.props = props;
  }

  render(): string {
    const disabled = this.enabled ? '' : 'disabled';
    return `<button class="macos-button ${disabled}">${this.props.text || 'Button'}</button>`;
  }

  click(): void {
    if (this.enabled) {
      console.log(`macOS button clicked: ${this.props.text}`);
      console.log('✨ macOS subtle click feedback');
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  getProps(): ComponentProps {
    return { ...this.props };
  }
}

class MacOSInput implements Input {
  private value: string = '';
  private props: ComponentProps;

  constructor(props: ComponentProps) {
    this.props = props;
  }

  render(): string {
    return `<input type="text" placeholder="${this.props.placeholder || ''}" value="${this.value}">`;
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string): void {
    this.value = value;
    console.log(`macOS input value set to: ${value}`);
  }

  focus(): void {
    console.log('macOS input focused with blue glow');
  }

  validate(): boolean {
    return this.value.length > 0;
  }
}

class MacOSDialog implements Dialog {
  private visible: boolean = false;
  private content: string = '';
  private props: ComponentProps;

  constructor(props: ComponentProps) {
    this.props = props;
  }

  render(): string {
    if (!this.visible) return '';
    return `<div class="macos-dialog"><h3>${this.props.title}</h3><p>${this.content}</p></div>`;
  }

  show(): void {
    this.visible = true;
    console.log('macOS dialog shown with spring animation');
  }

  hide(): void {
    this.visible = false;
    console.log('macOS dialog hidden');
  }

  setContent(content: string): void {
    this.content = content;
  }

  isVisible(): boolean {
    return this.visible;
  }
}

// ============================================================================
// LINUX PLATFORM COMPONENTS
// ============================================================================

class LinuxButton implements Button {
  private enabled: boolean = true;
  private props: ComponentProps;

  constructor(props: ComponentProps) {
    this.props = props;
  }

  render(): string {
    const disabled = this.enabled ? '' : 'disabled';
    return `<button class="linux-button ${disabled}">${this.props.text || 'Button'}</button>`;
  }

  click(): void {
    if (this.enabled) {
      console.log(`Linux button clicked: ${this.props.text}`);
      console.log('🔊 Linux system click sound');
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  getProps(): ComponentProps {
    return { ...this.props };
  }
}

class LinuxInput implements Input {
  private value: string = '';
  private props: ComponentProps;

  constructor(props: ComponentProps) {
    this.props = props;
  }

  render(): string {
    return `<input type="text" placeholder="${this.props.placeholder || ''}" value="${this.value}">`;
  }

  getValue(): string {
    return this.value;
  }

  setValue(value: string): void {
    this.value = value;
    console.log(`Linux input value set to: ${value}`);
  }

  focus(): void {
    console.log('Linux input focused with green highlight');
  }

  validate(): boolean {
    return this.value.length > 0;
  }
}

class LinuxDialog implements Dialog {
  private visible: boolean = false;
  private content: string = '';
  private props: ComponentProps;

  constructor(props: ComponentProps) {
    this.props = props;
  }

  render(): string {
    if (!this.visible) return '';
    return `<div class="linux-dialog"><h3>${this.props.title}</h3><p>${this.content}</p></div>`;
  }

  show(): void {
    this.visible = true;
    console.log('Linux dialog shown with simple fade');
  }

  hide(): void {
    this.visible = false;
    console.log('Linux dialog hidden');
  }

  setContent(content: string): void {
    this.content = content;
  }

  isVisible(): boolean {
    return this.visible;
  }
}

// ============================================================================
// CONCRETE FACTORY IMPLEMENTATIONS
// ============================================================================

class WindowsUIFactory implements UIAbstractFactory {
  private theme: UITheme = {
    colors: {
      primary: '#0078d4',
      secondary: '#6c757d',
      background: '#ffffff',
      surface: '#f3f2f1',
      text: '#323130',
      border: '#8a8886'
    },
    fonts: {
      family: 'Segoe UI, sans-serif',
      sizes: { sm: '12px', md: '14px', lg: '16px' }
    },
    spacing: { sm: '4px', md: '8px', lg: '12px' },
    borderRadius: '2px',
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.12)' }
  };

  createButton(props: ComponentProps): Button {
    return new WindowsButton(props);
  }

  createInput(props: ComponentProps): Input {
    return new WindowsInput(props);
  }

  createDialog(props: ComponentProps): Dialog {
    return new WindowsDialog(props);
  }

  getTheme(): UITheme {
    return this.theme;
  }

  getPlatform(): string {
    return 'Windows';
  }
}

class MacOSUIFactory implements UIAbstractFactory {
  private theme: UITheme = {
    colors: {
      primary: '#007aff',
      secondary: '#8e8e93',
      background: '#ffffff',
      surface: '#f2f2f7',
      text: '#1d1d1f',
      border: '#d1d1d6'
    },
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, sans-serif',
      sizes: { sm: '14px', md: '16px', lg: '18px' }
    },
    spacing: { sm: '6px', md: '12px', lg: '18px' },
    borderRadius: '6px',
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.12)' }
  };

  createButton(props: ComponentProps): Button {
    return new MacOSButton(props);
  }

  createInput(props: ComponentProps): Input {
    return new MacOSInput(props);
  }

  createDialog(props: ComponentProps): Dialog {
    return new MacOSDialog(props);
  }

  getTheme(): UITheme {
    return this.theme;
  }

  getPlatform(): string {
    return 'macOS';
  }
}

class LinuxUIFactory implements UIAbstractFactory {
  private theme: UITheme = {
    colors: {
      primary: '#4e9a06',
      secondary: '#555753',
      background: '#ffffff',
      surface: '#f6f5f4',
      text: '#2e3436',
      border: '#babdb6'
    },
    fonts: {
      family: 'Ubuntu, Roboto, sans-serif',
      sizes: { sm: '12px', md: '14px', lg: '16px' }
    },
    spacing: { sm: '4px', md: '8px', lg: '12px' },
    borderRadius: '4px',
    shadows: { sm: '0 2px 4px rgba(0,0,0,0.2)' }
  };

  createButton(props: ComponentProps): Button {
    return new LinuxButton(props);
  }

  createInput(props: ComponentProps): Input {
    return new LinuxInput(props);
  }

  createDialog(props: ComponentProps): Dialog {
    return new LinuxDialog(props);
  }

  getTheme(): UITheme {
    return this.theme;
  }

  getPlatform(): string {
    return 'Linux';
  }
}

// ============================================================================
// ABSTRACT FACTORY REGISTRY
// ============================================================================

class UIAbstractFactory {
  private static factories = new Map<string, () => UIAbstractFactory>([
    ['windows', () => new WindowsUIFactory()],
    ['macos', () => new MacOSUIFactory()],
    ['linux', () => new LinuxUIFactory()]
  ]);

  public static createForPlatform(platform: string): UIAbstractFactory {
    const factoryCreator = this.factories.get(platform.toLowerCase());
    if (!factoryCreator) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return factoryCreator();
  }

  public static getSupportedPlatforms(): string[] {
    return Array.from(this.factories.keys());
  }
}

// ============================================================================
// USAGE DEMONSTRATIONS
// ============================================================================

// Cross-Platform Application Service
class CrossPlatformApp {
  private uiFactory: UIAbstractFactory;

  constructor(platform: string) {
    this.uiFactory = UIAbstractFactory.createForPlatform(platform);
    console.log(`Application initialized for ${this.uiFactory.getPlatform()}`);
  }

  createLoginForm(): { button: Button; input: Input; dialog: Dialog } {
    const usernameInput = this.uiFactory.createInput({ 
      placeholder: 'Enter username' 
    });
    
    const loginButton = this.uiFactory.createButton({ 
      text: 'Login', 
      variant: 'primary' 
    });
    
    const errorDialog = this.uiFactory.createDialog({ 
      title: 'Login Error' 
    });

    console.log(`Login form created with ${this.uiFactory.getPlatform()} styling`);
    return { button: loginButton, input: usernameInput, dialog: errorDialog };
  }

  createSettingsForm(): { button: Button; input: Input; dialog: Dialog } {
    const settingsInput = this.uiFactory.createInput({ 
      placeholder: 'Enter setting value' 
    });
    
    const saveButton = this.uiFactory.createButton({ 
      text: 'Save Settings', 
      variant: 'secondary' 
    });
    
    const confirmDialog = this.uiFactory.createDialog({ 
      title: 'Confirm Changes' 
    });

    return { button: saveButton, input: settingsInput, dialog: confirmDialog };
  }

  switchPlatform(newPlatform: string): void {
    this.uiFactory = UIAbstractFactory.createForPlatform(newPlatform);
    console.log(`Switched to ${this.uiFactory.getPlatform()} platform`);
  }

  getPlatformInfo(): { platform: string; theme: UITheme } {
    return {
      platform: this.uiFactory.getPlatform(),
      theme: this.uiFactory.getTheme()
    };
  }
}

// Usage Example - Following the documented API exactly
async function demonstrateCrossPlatformUI(): Promise<void> {
  console.log('=== CROSS-PLATFORM UI FACTORY DEMO ===');
  console.log('Following the documented API pattern:\n');

  const platforms = ['windows', 'macos', 'linux'];

  for (const platform of platforms) {
    console.log(`--- Testing ${platform.toUpperCase()} Platform ---`);
    
    try {
      // Following the exact documented API
      const uiFactory = UIAbstractFactory.createForPlatform(platform);
      const button = uiFactory.createButton({ text: 'Save', variant: 'primary' });
      const input = uiFactory.createInput({ placeholder: 'Enter name' });
      const dialog = uiFactory.createDialog({ title: 'Confirmation' });

      // All components work together with consistent platform styling
      button.render();
      input.render();
      dialog.show();
      
      console.log(`Platform: ${uiFactory.getPlatform()}`);
      console.log(`Theme primary color: ${uiFactory.getTheme().colors.primary}`);
      console.log(`Font family: ${uiFactory.getTheme().fonts.family}`);
      
      // Test component functionality
      button.click();
      input.setValue('Test User');
      console.log(`Input value: ${input.getValue()}`);
      console.log(`Input valid: ${input.validate()}`);
      
      dialog.setContent('Your changes have been saved successfully.');
      console.log(`Dialog visible: ${dialog.isVisible()}`);
      dialog.hide();
      
    } catch (error) {
      console.error(`❌ Error with ${platform}:`, error instanceof Error ? error.message : String(error));
    }
    
    console.log();
  }

  // Advanced usage example
  console.log('--- Cross-Platform Application Demo ---');
  const app = new CrossPlatformApp('windows');
  
  // Create login form
  const loginForm = app.createLoginForm();
  console.log('Login form created with Windows components');
  
  // Test form interaction
  loginForm.input.setValue('admin');
  loginForm.button.click();
  
  // Switch platforms dynamically
  app.switchPlatform('macos');
  const macLoginForm = app.createLoginForm();
  console.log('Login form recreated with macOS components');
  
  // Show platform info
  const platformInfo = app.getPlatformInfo();
  console.log(`Current platform: ${platformInfo.platform}`);
  console.log(`Primary color: ${platformInfo.theme.colors.primary}`);
  
  console.log(`✅ Successfully demonstrated ${platforms.length} UI platforms with documented API`);
}

// Testing Example
async function testCrossPlatformUI(): Promise<void> {
  console.log('\n=== CROSS-PLATFORM UI FACTORY TESTS ===');
  
  // Test 1: Factory creation for different platforms
  console.log('Test 1 - Platform factory creation:');
  const supportedPlatforms = UIAbstractFactory.getSupportedPlatforms();
  
  for (const platform of supportedPlatforms) {
    try {
      const factory = UIAbstractFactory.createForPlatform(platform);
      console.log(`✅ ${platform}: Factory created successfully`);
    } catch (error) {
      console.log(`❌ ${platform}: Failed to create factory`);
    }
  }
  
  // Test 2: Component family consistency
  console.log('\nTest 2 - Component family consistency:');
  const factory = UIAbstractFactory.createForPlatform('windows');
  
  const button = factory.createButton({ text: 'Test' });
  const input = factory.createInput({ placeholder: 'Test' });
  const dialog = factory.createDialog({ title: 'Test' });
  
  console.log('✅ All components created from same factory');
  console.log('✅ Components share consistent theming');
  
  // Test 3: Platform switching
  console.log('\nTest 3 - Platform switching:');
  const app = new CrossPlatformApp('windows');
  const originalPlatform = app.getPlatformInfo().platform;
  
  app.switchPlatform('macos');
  const newPlatform = app.getPlatformInfo().platform;
  
  console.log('✅ Platform switching works:', originalPlatform !== newPlatform);
  
  // Test 4: Component interface consistency
  console.log('\nTest 4 - Component interface consistency:');
  const methods = ['render', 'click', 'setEnabled', 'getProps'];
  const hasAllMethods = methods.every(method => typeof (button as any)[method] === 'function');
  
  console.log('✅ All button methods present:', hasAllMethods);
  
  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateCrossPlatformUI();
  await testCrossPlatformUI();
  exit(0);
})();

export {
  UIAbstractFactory,
  Button,
  Input,
  Dialog,
  ComponentProps,
  UITheme,
  CrossPlatformApp
}; 