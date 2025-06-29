/**
 * PROTOTYPE PATTERN - UI COMPONENT PROTOTYPE
 * =========================================
 * 
 * This example demonstrates the Prototype pattern for UI component creation.
 * UI component creation often involves expensive operations like:
 * - Loading and parsing CSS styles and themes
 * - Setting up event handlers and DOM manipulations
 * - Configuring accessibility features (ARIA, keyboard navigation)
 * - Initializing animations and transitions
 * - Loading icon fonts and image assets
 * - Setting up responsive design breakpoints
 * 
 * Instead of repeating these expensive operations, we create prototype UI components
 * that can be quickly cloned and customized for specific use cases and contexts.
 * 
 * REAL-WORLD APPLICATIONS:
 * - Component libraries (Material-UI, Ant Design, Bootstrap)
 * - Modal and dialog systems
 * - Form and input component frameworks
 * - Data visualization widget libraries
 * - Navigation and menu systems
 * - Design system implementations
 */

import { exit } from "process";

// ============================================================================
// UI COMPONENT INTERFACES AND TYPES
// ============================================================================

interface ComponentStyle {
  width?: string;
  height?: string;
  maxWidth?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  color?: string;
  border?: string;
  borderRadius?: string;
  fontSize?: string;
  fontFamily?: string;
  boxShadow?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  position?: string;
  zIndex?: number;
  opacity?: number;
  transform?: string;
  transition?: string;
  gap?: string;
  cursor?: string;
  textDecoration?: string;
}

interface ComponentProps {
  id?: string;
  className?: string;
  style?: ComponentStyle;
  disabled?: boolean;
  visible?: boolean;
  testId?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}

interface EventHandlers {
  onClick?: (event: Event) => void;
  onMouseEnter?: (event: Event) => void;
  onMouseLeave?: (event: Event) => void;
  onFocus?: (event: Event) => void;
  onBlur?: (event: Event) => void;
  onKeyDown?: (event: any) => void;
  onKeyUp?: (event: any) => void;
  onChange?: (value: any) => void;
  onSubmit?: (data: any) => void;
}

interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

interface Animation {
  name: string;
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  styles: ComponentStyle;
}

// ============================================================================
// BASE UI COMPONENT PROTOTYPE
// ============================================================================

/**
 * Base UI component prototype that can be extended for specific component types
 * Simulates expensive UI component initialization operations
 */
abstract class UIComponentPrototype {
  protected id: string;
  protected type: string;
  protected props: ComponentProps;
  protected style: ComponentStyle;
  protected eventHandlers: EventHandlers;
  protected animations: Map<string, Animation>;
  protected breakpoints: ResponsiveBreakpoint[];
  protected isInitialized: boolean = false;
  protected initializationCost: number = 0;
  protected theme: string = 'default';
  protected assetPaths: Map<string, string>;

  constructor(type: string) {
    this.id = this.generateId();
    this.type = type;
    this.props = {
      id: this.id,
      className: `${type}-component`,
      visible: true,
      disabled: false
    };
    this.style = {};
    this.eventHandlers = {};
    this.animations = new Map();
    this.breakpoints = [];
    this.assetPaths = new Map();
  }

  /**
   * Expensive initialization process (simulated)
   * In real-world scenarios, this might involve:
   * - Loading and parsing CSS files
   * - Setting up DOM event listeners
   * - Configuring accessibility features
   * - Loading fonts and image assets
   * - Compiling SCSS/LESS stylesheets
   * - Setting up responsive breakpoints
   */
  async initializeComponent(themePath?: string): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    console.log(`🎨 Starting expensive UI component initialization for ${this.type}...`);
    const startTime = Date.now();

    // Simulate loading theme and styles
    await this.simulateThemeLoading(themePath || './themes/default');
    
    // Simulate CSS compilation
    await this.simulateCSSCompilation();
    
    // Simulate asset loading
    await this.simulateAssetLoading();
    
    // Simulate accessibility setup
    await this.simulateAccessibilitySetup();
    
    // Simulate event handler setup
    await this.simulateEventHandlerSetup();
    
    // Simulate responsive breakpoint setup
    await this.simulateResponsiveSetup();

    this.initializationCost = Date.now() - startTime;
    this.isInitialized = true;

    console.log(`✅ UI component initialized in ${this.initializationCost}ms`);
    return this;
  }

  /**
   * Clone the component (fast operation)
   */
  abstract clone(): UIComponentPrototype;

  /**
   * Base clone implementation
   */
  protected baseClone<T extends UIComponentPrototype>(constructor: new (type: string) => T): T {
    if (!this.isInitialized) {
      throw new Error('UI component must be initialized before cloning');
    }

    console.log(`📋 Cloning UI component ${this.type} (fast operation)...`);
    const startTime = Date.now();

    const cloned = new constructor(this.type);
    
    // Copy all data without re-initialization
    cloned.id = cloned.generateId();
    cloned.props = { ...this.props, id: cloned.id };
    cloned.style = { ...this.style };
    cloned.eventHandlers = { ...this.eventHandlers };
    cloned.animations = new Map(this.animations);
    cloned.breakpoints = this.breakpoints.map(bp => ({
      ...bp,
      styles: { ...bp.styles }
    }));
    cloned.theme = this.theme;
    cloned.assetPaths = new Map(this.assetPaths);
    cloned.isInitialized = true;
    cloned.initializationCost = this.initializationCost;

    const cloneTime = Date.now() - startTime;
    console.log(`✅ UI component cloned in ${cloneTime}ms (${Math.round((this.initializationCost / cloneTime) * 100) / 100}x faster than initialization)`);

    return cloned;
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  setProps(props: Partial<ComponentProps>): this {
    Object.assign(this.props, props);
    return this;
  }

  setStyle(style: ComponentStyle): this {
    Object.assign(this.style, style);
    return this;
  }

  setTheme(theme: string): this {
    this.theme = theme;
    return this;
  }

  addEventListener(event: keyof EventHandlers, handler: any): this {
    this.eventHandlers[event] = handler;
    return this;
  }

  addAnimation(name: string, animation: Animation): this {
    this.animations.set(name, animation);
    return this;
  }

  addBreakpoint(breakpoint: ResponsiveBreakpoint): this {
    this.breakpoints.push(breakpoint);
    return this;
  }

  // ============================================================================
  // RENDERING METHODS
  // ============================================================================

  /**
   * Generate HTML representation of the component
   */
  abstract render(): string;

  /**
   * Generate CSS for the component
   */
  generateCSS(): string {
    const baseCSS = this.styleObjectToCSS(this.style);
    
    let responsiveCSS = '';
    this.breakpoints.forEach(breakpoint => {
      const media = breakpoint.maxWidth 
        ? `@media (min-width: ${breakpoint.minWidth}px) and (max-width: ${breakpoint.maxWidth}px)`
        : `@media (min-width: ${breakpoint.minWidth}px)`;
      
      responsiveCSS += `
        ${media} {
          #${this.id} {
            ${this.styleObjectToCSS(breakpoint.styles)}
          }
        }
      `;
    });

    return `
      #${this.id} {
        ${baseCSS}
      }
      ${responsiveCSS}
    `;
  }

  protected styleObjectToCSS(style: ComponentStyle): string {
    return Object.entries(style)
      .map(([key, value]) => `${this.camelToKebabCase(key)}: ${value};`)
      .join('\n        ');
  }

  protected camelToKebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateId(): string {
    return `${this.type}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetadata(): any {
    return {
      id: this.id,
      type: this.type,
      theme: this.theme,
      isInitialized: this.isInitialized,
      initializationCost: this.initializationCost,
      animationCount: this.animations.size,
      breakpointCount: this.breakpoints.length,
      assetCount: this.assetPaths.size
    };
  }

  toString(): string {
    return `${this.type}(${this.id}): theme=${this.theme}, ${this.animations.size} animations, ${this.breakpoints.length} breakpoints`;
  }

  // ============================================================================
  // SIMULATION METHODS (EXPENSIVE OPERATIONS)
  // ============================================================================

  private async simulateThemeLoading(themePath: string): Promise<void> {
    console.log(`  🎨 Loading theme: ${themePath}`);
    this.assetPaths.set('theme', `${themePath}/theme.css`);
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
  }

  private async simulateCSSCompilation(): Promise<void> {
    console.log('  📝 Compiling CSS and stylesheets');
    await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120));
  }

  private async simulateAssetLoading(): Promise<void> {
    console.log('  🖼️ Loading component assets');
    const assets = ['icons', 'fonts', 'images'];
    assets.forEach(asset => {
      this.assetPaths.set(asset, `./assets/${asset}/${this.type}.css`);
    });
    await new Promise(resolve => setTimeout(resolve, 90 + Math.random() * 130));
  }

  private async simulateAccessibilitySetup(): Promise<void> {
    console.log('  ♿ Setting up accessibility features');
    await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 90));
  }

  private async simulateEventHandlerSetup(): Promise<void> {
    console.log('  🖱️ Setting up event handlers');
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 80));
  }

  private async simulateResponsiveSetup(): Promise<void> {
    console.log('  📱 Setting up responsive breakpoints');
    await new Promise(resolve => setTimeout(resolve, 70 + Math.random() * 100));
  }
}

// ============================================================================
// MODAL COMPONENT PROTOTYPE
// ============================================================================

/**
 * Modal component prototype for dialog boxes and overlays
 */
class ModalPrototype extends UIComponentPrototype {
  private title: string;
  private content: string;
  private size: 'small' | 'medium' | 'large' | 'fullscreen';
  private closable: boolean;
  private backdrop: boolean;
  private buttons: Array<{ text: string; action: () => void; variant?: string }>;

  constructor() {
    super('modal');
    
    this.title = 'Modal Title';
    this.content = '';
    this.size = 'medium';
    this.closable = true;
    this.backdrop = true;
    this.buttons = [];
  }

  async initializeModal(modalType: string = 'default'): Promise<this> {
    await this.initializeComponent(`./themes/modals/${modalType}`);
    
    // Set modal-specific styles
    this.setStyle({
      position: 'fixed',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      opacity: 0,
      transition: 'opacity 0.3s ease'
    });

    // Add modal-specific animations
    this.addAnimation('fadeIn', {
      name: 'fadeIn',
      duration: 300,
      easing: 'ease-in-out'
    });

    this.addAnimation('slideIn', {
      name: 'slideIn',
      duration: 400,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    });

    // Add responsive breakpoints
    this.addBreakpoint({
      name: 'mobile',
      minWidth: 0,
      maxWidth: 768,
      styles: {
        width: '95%',
        height: '90%',
        margin: '5%'
      }
    });

    this.addBreakpoint({
      name: 'desktop',
      minWidth: 769,
      styles: {
        width: '50%',
        maxWidth: '800px'
      }
    });

    return this;
  }

  clone(): ModalPrototype {
    const cloned = this.baseClone(ModalPrototype);
    cloned.title = this.title;
    cloned.content = this.content;
    cloned.size = this.size;
    cloned.closable = this.closable;
    cloned.backdrop = this.backdrop;
    cloned.buttons = this.buttons.map(btn => ({ ...btn }));
    return cloned;
  }

  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  setContent(content: string): this {
    this.content = content;
    return this;
  }

  setSize(size: ModalPrototype['size']): this {
    this.size = size;
    
    const sizeStyles = {
      small: { width: '300px', height: 'auto' },
      medium: { width: '500px', height: 'auto' },
      large: { width: '800px', height: '600px' },
      fullscreen: { width: '100vw', height: '100vh' }
    };
    
    this.setStyle(sizeStyles[size]);
    return this;
  }

  setClosable(closable: boolean): this {
    this.closable = closable;
    return this;
  }

  addButton(text: string, action: () => void, variant: string = 'primary'): this {
    this.buttons.push({ text, action, variant });
    return this;
  }

  render(): string {
    const buttonsHTML = this.buttons.map(btn => 
      `<button class="modal-button modal-button-${btn.variant}" onclick="${btn.action}">${btn.text}</button>`
    ).join('');

    const closeButton = this.closable ? 
      '<button class="modal-close" onclick="closeModal()">&times;</button>' : '';

    return `
      <div id="${this.id}" class="${this.props.className}" style="display: none;">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">${this.title}</h2>
            ${closeButton}
          </div>
          <div class="modal-body">
            ${this.content}
          </div>
          <div class="modal-footer">
            ${buttonsHTML}
          </div>
        </div>
      </div>
    `;
  }

  override toString(): string {
    return `Modal(${this.id}): "${this.title}" ${this.size}, ${this.buttons.length} buttons`;
  }
}

// ============================================================================
// FORM COMPONENT PROTOTYPE
// ============================================================================

/**
 * Form component prototype for data input and validation
 */
class FormPrototype extends UIComponentPrototype {
  private fields: Map<string, any>;
  private validationRules: Map<string, ValidationRule[]>;
  private submitHandler?: (data: any) => void;
  private layout: 'vertical' | 'horizontal' | 'inline';

  constructor() {
    super('form');
    
    this.fields = new Map();
    this.validationRules = new Map();
    this.layout = 'vertical';
  }

  async initializeForm(formType: string = 'default'): Promise<this> {
    await this.initializeComponent(`./themes/forms/${formType}`);
    
    // Set form-specific styles
    this.setStyle({
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.5rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff'
    });

    return this;
  }

  clone(): FormPrototype {
    const cloned = this.baseClone(FormPrototype);
    cloned.fields = new Map(this.fields);
    cloned.validationRules = new Map(
      Array.from(this.validationRules.entries()).map(([key, rules]) => [
        key,
        rules.map(rule => ({ ...rule }))
      ])
    );
    cloned.submitHandler = this.submitHandler;
    cloned.layout = this.layout;
    return cloned;
  }

  addField(name: string, type: string, options: any = {}): this {
    this.fields.set(name, {
      type,
      label: options.label || name,
      placeholder: options.placeholder || '',
      required: options.required || false,
      disabled: options.disabled || false,
      value: options.value || ''
    });
    return this;
  }

  addValidation(fieldName: string, rule: ValidationRule): this {
    const existingRules = this.validationRules.get(fieldName) || [];
    existingRules.push(rule);
    this.validationRules.set(fieldName, existingRules);
    return this;
  }

  setLayout(layout: FormPrototype['layout']): this {
    this.layout = layout;
    
    const layoutStyles = {
      vertical: { flexDirection: 'column' },
      horizontal: { flexDirection: 'row', flexWrap: 'wrap' },
      inline: { flexDirection: 'row', alignItems: 'center' }
    };
    
    this.setStyle(layoutStyles[layout] as ComponentStyle);
    return this;
  }

  setSubmitHandler(handler: (data: any) => void): this {
    this.submitHandler = handler;
    return this;
  }

  render(): string {
    const fieldsHTML = Array.from(this.fields.entries()).map(([name, field]) => {
      const validationRules = this.validationRules.get(name) || [];
      const requiredAttr = field.required ? 'required' : '';
      const disabledAttr = field.disabled ? 'disabled' : '';
      
      return `
        <div class="form-field">
          <label for="${name}" class="form-label">${field.label}</label>
          <input 
            type="${field.type}" 
            id="${name}" 
            name="${name}" 
            placeholder="${field.placeholder}"
            value="${field.value}"
            ${requiredAttr}
            ${disabledAttr}
            class="form-input"
          />
          <div class="form-validation" id="${name}-validation"></div>
        </div>
      `;
    }).join('');

    return `
      <form id="${this.id}" class="${this.props.className}">
        ${fieldsHTML}
        <div class="form-actions">
          <button type="submit" class="form-submit">Submit</button>
          <button type="reset" class="form-reset">Reset</button>
        </div>
      </form>
    `;
  }

  override toString(): string {
    return `Form(${this.id}): ${this.fields.size} fields, ${this.layout} layout`;
  }
}

// ============================================================================
// BUTTON COMPONENT PROTOTYPE
// ============================================================================

/**
 * Button component prototype for interactive actions
 */
class ButtonPrototype extends UIComponentPrototype {
  private text: string;
  private variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  private size: 'small' | 'medium' | 'large';
  private icon?: string;
  private loading: boolean;

  constructor() {
    super('button');
    
    this.text = 'Button';
    this.variant = 'primary';
    this.size = 'medium';
    this.loading = false;
  }

  async initializeButton(buttonType: string = 'default'): Promise<this> {
    await this.initializeComponent(`./themes/buttons/${buttonType}`);
    
    // Set button-specific styles
    this.setStyle({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    });

    // Add button-specific animations
    this.addAnimation('hover', {
      name: 'hover',
      duration: 200,
      easing: 'ease-in-out'
    });

    this.addAnimation('click', {
      name: 'click',
      duration: 100,
      easing: 'ease-in-out'
    });

    return this;
  }

  clone(): ButtonPrototype {
    const cloned = this.baseClone(ButtonPrototype);
    cloned.text = this.text;
    cloned.variant = this.variant;
    cloned.size = this.size;
    cloned.icon = this.icon;
    cloned.loading = this.loading;
    return cloned;
  }

  setText(text: string): this {
    this.text = text;
    return this;
  }

  setVariant(variant: ButtonPrototype['variant']): this {
    this.variant = variant;
    
    const variantStyles = {
      primary: { backgroundColor: '#007bff', color: '#fff' },
      secondary: { backgroundColor: '#6c757d', color: '#fff' },
      success: { backgroundColor: '#28a745', color: '#fff' },
      warning: { backgroundColor: '#ffc107', color: '#212529' },
      danger: { backgroundColor: '#dc3545', color: '#fff' },
      info: { backgroundColor: '#17a2b8', color: '#fff' }
    };
    
    this.setStyle(variantStyles[variant]);
    return this;
  }

  setSize(size: ButtonPrototype['size']): this {
    this.size = size;
    
    const sizeStyles = {
      small: { padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
      medium: { padding: '0.5rem 1rem', fontSize: '1rem' },
      large: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' }
    };
    
    this.setStyle(sizeStyles[size]);
    return this;
  }

  setIcon(icon: string): this {
    this.icon = icon;
    return this;
  }

  setLoading(loading: boolean): this {
    this.loading = loading;
    return this;
  }

  render(): string {
    const iconHTML = this.icon ? `<i class="icon-${this.icon}"></i>` : '';
    const loadingHTML = this.loading ? '<div class="loading-spinner"></div>' : '';
    const disabledAttr = this.loading || this.props.disabled ? 'disabled' : '';

    return `
      <button 
        id="${this.id}" 
        class="${this.props.className} btn btn-${this.variant} btn-${this.size}"
        ${disabledAttr}
      >
        ${loadingHTML}
        ${iconHTML}
        <span class="btn-text">${this.text}</span>
      </button>
    `;
  }

  override toString(): string {
    return `Button(${this.id}): "${this.text}" ${this.variant} ${this.size}`;
  }
}

// ============================================================================
// UI COMPONENT REGISTRY
// ============================================================================

/**
 * Registry system for managing UI component prototypes
 */
class UIComponentRegistry {
  private prototypes = new Map<string, UIComponentPrototype>();
  private themes = new Map<string, string>();
  private usage = new Map<string, number>();

  async registerComponent(name: string, prototype: UIComponentPrototype, theme: string = 'default'): Promise<void> {
    const metadata = prototype.getMetadata();
    if (!metadata.isInitialized) {
      await prototype.initializeComponent();
    }
    
    this.prototypes.set(name, prototype);
    this.themes.set(name, theme);
    this.usage.set(name, 0);
    
    console.log(`📋 Registered UI component: ${name} with theme: ${theme}`);
  }

  createComponent(name: string, customization?: any): UIComponentPrototype | null {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      console.log(`❌ UI component prototype not found: ${name}`);
      return null;
    }

    const current = this.usage.get(name) || 0;
    this.usage.set(name, current + 1);

    const cloned = prototype.clone();
    
    // Apply customization if provided
    if (customization) {
      if (customization.props) {
        cloned.setProps(customization.props);
      }
      if (customization.style) {
        cloned.setStyle(customization.style);
      }
      if (customization.theme) {
        cloned.setTheme(customization.theme);
      }
    }

    return cloned;
  }

  listComponents(): Array<{ name: string; type: string; theme: string }> {
    return Array.from(this.prototypes.entries()).map(([name, prototype]) => {
      const metadata = prototype.getMetadata();
      return {
        name,
        type: metadata.type,
        theme: this.themes.get(name) || 'default'
      };
    });
  }

  getUsageStats(): Map<string, number> {
    return new Map(this.usage);
  }
}

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

/**
 * Demonstrate basic UI component prototyping
 */
async function demonstrateBasicUIComponentPrototyping(): Promise<void> {
  console.log('\n🎨 BASIC UI COMPONENT PROTOTYPING');
  console.log('=================================');

  // Create modal prototype
  const modalPrototype = new ModalPrototype();
  await modalPrototype.initializeModal('modern');
  modalPrototype
    .setTitle('Modal Template')
    .setSize('medium')
    .setClosable(true)
    .addButton('Cancel', () => console.log('Cancelled'), 'secondary')
    .addButton('Confirm', () => console.log('Confirmed'), 'primary');

  console.log('🖼️ Modal prototype:', modalPrototype.toString());

  // Clone for specific use cases
  const confirmDialog = modalPrototype.clone()
    .setTitle('Confirm Delete')
    .setContent('Are you sure you want to delete this item? This action cannot be undone.')
    .setSize('small');

  const imageGallery = modalPrototype.clone()
    .setTitle('Image Gallery')
    .setContent('<div class="image-gallery">Gallery content here...</div>')
    .setSize('large')
    .addButton('Previous', () => console.log('Previous'), 'secondary')
    .addButton('Next', () => console.log('Next'), 'secondary');

  console.log('❓ Confirm dialog:', confirmDialog.toString());
  console.log('🖼️ Image gallery:', imageGallery.toString());

  // Create button prototype
  const buttonPrototype = new ButtonPrototype();
  await buttonPrototype.initializeButton();
  buttonPrototype
    .setText('Primary Button')
    .setVariant('primary')
    .setSize('medium');

  const submitButton = buttonPrototype.clone()
    .setText('Submit Form')
    .setVariant('success')
    .setIcon('check');

  const deleteButton = buttonPrototype.clone()
    .setText('Delete')
    .setVariant('danger')
    .setSize('small')
    .setIcon('trash');

  console.log('🔘 Submit button:', submitButton.toString());
  console.log('🗑️ Delete button:', deleteButton.toString());
}

/**
 * Demonstrate form component prototyping
 */
async function demonstrateFormComponentPrototyping(): Promise<void> {
  console.log('\n📝 FORM COMPONENT PROTOTYPING');
  console.log('=============================');

  // Create form prototype
  const formPrototype = new FormPrototype();
  await formPrototype.initializeForm('material');
  formPrototype.setLayout('vertical');

  // Create contact form
  const contactForm = formPrototype.clone()
    .addField('name', 'text', { label: 'Full Name', required: true })
    .addField('email', 'email', { label: 'Email Address', required: true })
    .addField('subject', 'text', { label: 'Subject' })
    .addField('message', 'textarea', { label: 'Message', required: true })
    .addValidation('name', { type: 'required', message: 'Name is required' })
    .addValidation('email', { type: 'email', message: 'Valid email is required' })
    .addValidation('message', { type: 'minLength', value: 10, message: 'Message must be at least 10 characters' })
    .setSubmitHandler((data) => console.log('Contact form submitted:', data));

  // Create registration form
  const registrationForm = formPrototype.clone()
    .addField('username', 'text', { label: 'Username', required: true })
    .addField('email', 'email', { label: 'Email', required: true })
    .addField('password', 'password', { label: 'Password', required: true })
    .addField('confirmPassword', 'password', { label: 'Confirm Password', required: true })
    .addField('terms', 'checkbox', { label: 'I agree to the terms and conditions', required: true })
    .setLayout('vertical')
    .setSubmitHandler((data) => console.log('Registration submitted:', data));

  console.log('📞 Contact form:', contactForm.toString());
  console.log('👤 Registration form:', registrationForm.toString());

  // Show rendered HTML (abbreviated)
  console.log('\n🔍 Contact Form HTML Preview:');
  console.log(contactForm.render().substring(0, 200) + '...');
}

/**
 * Demonstrate UI component registry
 */
async function demonstrateUIComponentRegistry(): Promise<void> {
  console.log('\n📋 UI COMPONENT REGISTRY');
  console.log('========================');

  const registry = new UIComponentRegistry();

  // Create and register various component prototypes
  const primaryButton = new ButtonPrototype();
  await primaryButton.initializeButton();
  primaryButton.setVariant('primary').setSize('medium');

  const successButton = new ButtonPrototype();
  await successButton.initializeButton();
  successButton.setVariant('success').setSize('medium');

  const basicModal = new ModalPrototype();
  await basicModal.initializeModal();
  basicModal.setSize('medium').setClosable(true);

  const simpleForm = new FormPrototype();
  await simpleForm.initializeForm();
  simpleForm.setLayout('vertical');

  // Register components
  await registry.registerComponent('primary-button', primaryButton, 'default');
  await registry.registerComponent('success-button', successButton, 'default');
  await registry.registerComponent('basic-modal', basicModal, 'modern');
  await registry.registerComponent('simple-form', simpleForm, 'material');

  console.log('📋 Available components:');
  registry.listComponents().forEach(({ name, type, theme }) => {
    console.log(`  ${name}: ${type} (${theme} theme)`);
  });

  // Create components from registry
  const saveButton = registry.createComponent('success-button', {
    props: { id: 'save-btn' },
    style: { width: '120px' }
  });

  const loginModal = registry.createComponent('basic-modal', {
    props: { ariaLabel: 'Login dialog' }
  });

  if (saveButton && loginModal) {
    console.log('✅ Created components from registry');
    console.log('💾 Save button:', saveButton.toString());
    console.log('🔐 Login modal:', loginModal.toString());
  }

  // Show usage statistics
  console.log('\n📊 Component Usage Statistics:');
  const stats = registry.getUsageStats();
  stats.forEach((count, name) => {
    console.log(`  ${name}: ${count} instances created`);
  });
}

/**
 * Demonstrate performance comparison
 */
async function demonstratePerformanceComparison(): Promise<void> {
  console.log('\n⚡ PERFORMANCE COMPARISON');
  console.log('========================');

  const iterations = 50;
  console.log(`🔧 Testing with ${iterations} component creations...`);

  // Create complex modal prototype
  const complexModal = new ModalPrototype();
  await complexModal.initializeModal('enterprise');
  complexModal
    .setTitle('Complex Modal Template')
    .setSize('large')
    .setClosable(true)
    .addButton('Cancel', () => {}, 'secondary')
    .addButton('Save Draft', () => {}, 'info')
    .addButton('Publish', () => {}, 'success')
    .addAnimation('slideIn', { name: 'slideIn', duration: 500, easing: 'ease-out' })
    .addBreakpoint({ name: 'tablet', minWidth: 768, styles: { width: '80%' } })
    .addBreakpoint({ name: 'mobile', minWidth: 0, maxWidth: 767, styles: { width: '95%' } });

  // Test prototype cloning
  console.time('⚡ Prototype Cloning');
  const clonedModals = [];
  for (let i = 0; i < iterations; i++) {
    const modal = complexModal.clone();
    modal.setTitle(`Modal ${i + 1}`);
    clonedModals.push(modal);
  }
  console.timeEnd('⚡ Prototype Cloning');

  // Test traditional creation
  console.time('🏗️ Traditional Creation');
  const createdModals = [];
  for (let i = 0; i < iterations; i++) {
    const modal = new ModalPrototype();
    await modal.initializeModal('enterprise'); // Expensive operation each time
    modal
      .setTitle(`Modal ${i + 1}`)
      .setSize('large')
      .setClosable(true)
      .addButton('Cancel', () => {}, 'secondary')
      .addButton('Save Draft', () => {}, 'info')
      .addButton('Publish', () => {}, 'success')
      .addAnimation('slideIn', { name: 'slideIn', duration: 500, easing: 'ease-out' })
      .addBreakpoint({ name: 'tablet', minWidth: 768, styles: { width: '80%' } })
      .addBreakpoint({ name: 'mobile', minWidth: 0, maxWidth: 767, styles: { width: '95%' } });
    createdModals.push(modal);
  }
  console.timeEnd('🏗️ Traditional Creation');

  console.log(`🎨 Created ${clonedModals.length} cloned components and ${createdModals.length} traditional components`);
  console.log('📈 Prototype cloning provides significant performance improvement for complex UI components!');
}

/**
 * Main demonstration function
 */
async function demonstrateUIComponentPrototype(): Promise<void> {
  console.log('🎯 UI COMPONENT PROTOTYPE PATTERN');
  console.log('==================================');
  console.log('Creating UI components by cloning pre-initialized prototypes');
  console.log('instead of repeating expensive setup and styling operations.\n');

  await demonstrateBasicUIComponentPrototyping();
  await demonstrateFormComponentPrototyping();
  await demonstrateUIComponentRegistry();
  await demonstratePerformanceComparison();

  console.log('\n✅ UI COMPONENT PROTOTYPE BENEFITS:');
  console.log('- Fast component creation through cloning vs. initialization');
  console.log('- Consistent styling and theming across components');
  console.log('- Easy component customization and configuration');
  console.log('- Centralized component registry system');
  console.log('- Responsive design and accessibility built-in');
  console.log('- Animation and interaction management');

  console.log('\n🏭 REAL-WORLD APPLICATIONS:');
  console.log('- Component libraries (Material-UI, Ant Design, Chakra UI)');
  console.log('- Modal and dialog systems');
  console.log('- Form and input component frameworks');
  console.log('- Data visualization widget libraries');
  console.log('- Design system implementations');
  console.log('- Content management system interfaces');
}

// ============================================================================
// EXECUTION
// ============================================================================

if (require.main === module) {
  demonstrateUIComponentPrototype().catch(console.error);
}

export {
  UIComponentPrototype,
  ModalPrototype,
  FormPrototype,
  ButtonPrototype,
  UIComponentRegistry,
  demonstrateUIComponentPrototype
};

exit(0); 