// ============================================================================
// TEST DATA BUILDER - Realistic Test Data Generation
// ============================================================================

import { exit } from "process";

// Test data interfaces and types
interface UserProfile {
  bio: string;
  avatar: string;
  location: string;
  timezone: string;
  phoneNumber?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhoneNumber: boolean;
  };
}

interface UserAuditInfo {
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  loginCount: number;
  lastLoginIP?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly age: number;
  readonly role: 'user' | 'admin' | 'moderator' | 'premium';
  readonly permissions: string[];
  readonly profile: UserProfile;
  readonly preferences: UserPreferences;
  readonly auditInfo: UserAuditInfo;
  readonly isActive: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  sku?: string;
  discount?: number;
}

interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  method: 'standard' | 'express' | 'overnight' | 'pickup';
  cost: number;
  estimatedDelivery: Date;
  trackingNumber?: string;
}

interface PaymentInfo {
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto';
  last4?: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  transactionId: string;
  processedAt?: Date;
  processor: string;
}

interface Order {
  readonly id: string;
  readonly customer: User;
  readonly status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  readonly items: OrderItem[];
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly shipping: ShippingInfo;
  readonly payment: PaymentInfo;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly notes?: string;
}

// ============================================================================
// USER TEST DATA BUILDER
// ============================================================================

class UserTestDataBuilder {
  private userData: Partial<Omit<User, 'readonly'>> & {
    id?: string;
    name?: string;
    email?: string;
    age?: number;
    role?: 'user' | 'admin' | 'moderator' | 'premium';
    permissions?: string[];
    profile?: UserProfile;
    preferences?: UserPreferences;
    auditInfo?: UserAuditInfo;
    isActive?: boolean;
  } = {
    // Default values
    id: this.generateId(),
    role: 'user',
    permissions: ['read'],
    isActive: true,
    profile: {
      bio: 'Default user bio',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      location: 'Unknown',
      timezone: 'UTC'
    },
    preferences: {
      theme: 'light',
      language: 'en-US',
      notifications: { email: true, push: false, sms: false },
      privacy: { profileVisibility: 'public', showEmail: false, showPhoneNumber: false }
    },
    auditInfo: {
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      loginCount: 1,
      emailVerified: false,
      phoneVerified: false
    }
  };

  id(id: string): this {
    this.userData.id = id;
    return this;
  }

  name(name: string): this {
    if (!name || name.trim() === '') {
      throw new Error('Name cannot be empty');
    }
    this.userData.name = name.trim();
    return this;
  }

  email(email: string): this {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
    this.userData.email = email;
    return this;
  }

  age(age: number): this {
    if (age < 13 || age > 120) {
      throw new Error('Age must be between 13 and 120');
    }
    this.userData.age = age;
    return this;
  }

  role(role: User['role']): this {
    this.userData.role = role;
    
    // Auto-assign permissions based on role
    switch (role) {
      case 'admin':
        this.userData.permissions = ['read', 'write', 'delete', 'manage_users', 'admin'];
        break;
      case 'moderator':
        this.userData.permissions = ['read', 'write', 'moderate', 'manage_content'];
        break;
      case 'premium':
        this.userData.permissions = ['read', 'write', 'premium_features'];
        break;
      default:
        this.userData.permissions = ['read'];
    }
    
    return this;
  }

  permissions(permissions: string[]): this {
    this.userData.permissions = [...permissions];
    return this;
  }

  profile(): UserProfileBuilder {
    return new UserProfileBuilder(this);
  }

  preferences(): UserPreferencesBuilder {
    return new UserPreferencesBuilder(this);
  }

  auditInfo(): UserAuditInfoBuilder {
    return new UserAuditInfoBuilder(this);
  }

  active(isActive: boolean = true): this {
    this.userData.isActive = isActive;
    return this;
  }

  inactive(): this {
    return this.active(false);
  }

  build(): User {
    // Validate required fields
    if (!this.userData.name) {
      throw new Error('Name is required');
    }
    if (!this.userData.email) {
      throw new Error('Email is required');
    }
    if (!this.userData.age) {
      throw new Error('Age is required');
    }

    return Object.freeze({
      id: this.userData.id!,
      name: this.userData.name,
      email: this.userData.email,
      age: this.userData.age,
      role: this.userData.role!,
      permissions: [...this.userData.permissions!],
      profile: { ...this.userData.profile! },
      preferences: {
        ...this.userData.preferences!,
        notifications: { ...this.userData.preferences!.notifications },
        privacy: { ...this.userData.preferences!.privacy }
      },
      auditInfo: { ...this.userData.auditInfo! },
      isActive: this.userData.isActive!
    });
  }

  // Static factory methods for common user types
  static admin(): UserTestDataBuilder {
    return new UserTestDataBuilder()
      .role('admin')
      .name('Admin User')
      .email('admin@example.com')
      .age(35)
      .profile()
        .bio('System administrator with full access')
        .location('System')
        .timezone('UTC')
        .done()
      .auditInfo()
        .emailVerified(true)
        .loginCount(500)
        .done();
  }

  static regularUser(): UserTestDataBuilder {
    return new UserTestDataBuilder()
      .role('user')
      .name('John Doe')
      .email('john.doe@example.com')
      .age(28)
      .profile()
        .bio('Regular user account')
        .location('New York, NY')
        .timezone('America/New_York')
        .done();
  }

  static premiumUser(): UserTestDataBuilder {
    return new UserTestDataBuilder()
      .role('premium')
      .name('Premium User')
      .email('premium@example.com')
      .age(32)
      .profile()
        .bio('Premium subscription user')
        .location('San Francisco, CA')
        .timezone('America/Los_Angeles')  
        .done()
      .auditInfo()
        .emailVerified(true)
        .loginCount(150)
        .done();
  }

  // Helper methods
  private generateId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Internal setter methods for builders
  setProfile(profile: UserProfile): this {
    this.userData.profile = profile;
    return this;
  }

  setPreferences(preferences: UserPreferences): this {
    this.userData.preferences = preferences;
    return this;
  }

  setAuditInfo(auditInfo: UserAuditInfo): this {
    this.userData.auditInfo = auditInfo;
    return this;
  }
}

// Profile builder for hierarchical construction
class UserProfileBuilder {
  private parent: UserTestDataBuilder;
  private profileData: UserProfile;

  constructor(parent: UserTestDataBuilder) {
    this.parent = parent;
    this.profileData = { ...parent['userData'].profile! };
  }

  bio(bio: string): this {
    this.profileData.bio = bio;
    return this;
  }

  avatar(avatarUrl: string): this {
    this.profileData.avatar = avatarUrl;
    return this;
  }

  location(location: string): this {
    this.profileData.location = location;
    return this;
  }

  timezone(timezone: string): this {
    this.profileData.timezone = timezone;
    return this;
  }

  phoneNumber(phone: string): this {
    this.profileData.phoneNumber = phone;
    return this;
  }

  website(website: string): this {
    if (website && !website.startsWith('http')) {
      website = 'https://' + website;
    }
    this.profileData.website = website;
    return this;
  }

  socialLinks(links: UserProfile['socialLinks']): this {
    this.profileData.socialLinks = links;
    return this;
  }

  twitter(handle: string): this {
    if (!this.profileData.socialLinks) {
      this.profileData.socialLinks = {};
    }
    this.profileData.socialLinks.twitter = handle.startsWith('@') ? handle : '@' + handle;
    return this;
  }

  linkedin(url: string): this {
    if (!this.profileData.socialLinks) {
      this.profileData.socialLinks = {};
    }
    this.profileData.socialLinks.linkedin = url;
    return this;
  }

  github(username: string): this {
    if (!this.profileData.socialLinks) {
      this.profileData.socialLinks = {};
    }
    this.profileData.socialLinks.github = username;
    return this;
  }

  done(): UserTestDataBuilder {
    return this.parent.setProfile(this.profileData);
  }
}

// Preferences builder for hierarchical construction
class UserPreferencesBuilder {
  private parent: UserTestDataBuilder;
  private preferencesData: UserPreferences;

  constructor(parent: UserTestDataBuilder) {
    this.parent = parent;
    this.preferencesData = { ...parent['userData'].preferences! };
  }

  theme(theme: UserPreferences['theme']): this {
    this.preferencesData.theme = theme;
    return this;
  }

  language(language: string): this {
    this.preferencesData.language = language;
    return this;
  }

  notifications(notifications: Partial<UserPreferences['notifications']>): this {
    this.preferencesData.notifications = {
      ...this.preferencesData.notifications,
      ...notifications
    };
    return this;
  }

  privacy(privacy: Partial<UserPreferences['privacy']>): this {
    this.preferencesData.privacy = {
      ...this.preferencesData.privacy,
      ...privacy
    };
    return this;
  }

  done(): UserTestDataBuilder {
    return this.parent.setPreferences(this.preferencesData);
  }
}

// Audit info builder for hierarchical construction
class UserAuditInfoBuilder {
  private parent: UserTestDataBuilder;
  private auditData: UserAuditInfo;

  constructor(parent: UserTestDataBuilder) {
    this.parent = parent;
    this.auditData = { ...parent['userData'].auditInfo! };
  }

  createdAt(date: Date): this {
    this.auditData.createdAt = date;
    return this;
  }

  updatedAt(date: Date): this {
    this.auditData.updatedAt = date;
    return this;
  }

  lastLogin(date: Date): this {
    this.auditData.lastLogin = date;
    return this;
  }

  loginCount(count: number): this {
    if (count < 0) {
      throw new Error('Login count cannot be negative');
    }
    this.auditData.loginCount = count;
    return this;
  }

  lastLoginIP(ip: string): this {
    this.auditData.lastLoginIP = ip;
    return this;
  }

  emailVerified(verified: boolean = true): this {
    this.auditData.emailVerified = verified;
    return this;
  }

  phoneVerified(verified: boolean = true): this {
    this.auditData.phoneVerified = verified;
    return this;
  }

  done(): UserTestDataBuilder {
    return this.parent.setAuditInfo(this.auditData);
  }
}

// ============================================================================
// ORDER TEST DATA BUILDER
// ============================================================================

class OrderTestDataBuilder {
  private orderData: Partial<Omit<Order, 'readonly'>> & {
    id?: string;
    customer?: User;
    status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    items?: OrderItem[];
    subtotal?: number;
    tax?: number;
    total?: number;
    shipping?: ShippingInfo;
    payment?: PaymentInfo;
    createdAt?: Date;
    updatedAt?: Date;
    notes?: string;
  } = {
    // Default values
    id: this.generateOrderId(),
    status: 'pending',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  id(id: string): this {
    this.orderData.id = id;
    return this;
  }

  customer(customer: User): this {
    this.orderData.customer = customer;
    return this;
  }

  status(status: Order['status']): this {
    this.orderData.status = status;
    return this;
  }

  items(items: Partial<OrderItem>[]): this {
    this.orderData.items = items.map(item => ({
      id: item.id || this.generateItemId(),
      name: item.name || 'Unknown Item',
      price: item.price || 0,
      quantity: item.quantity || 1,
      category: item.category || 'General',
      sku: item.sku,
      discount: item.discount || 0
    }));
    
    // Recalculate totals
    this.calculateTotals();
    return this;
  }

  addItem(item: Partial<OrderItem>): this {
    const orderItem: OrderItem = {
      id: item.id || this.generateItemId(),
      name: item.name || 'Unknown Item',
      price: item.price || 0,
      quantity: item.quantity || 1,
      category: item.category || 'General',
      sku: item.sku,
      discount: item.discount || 0
    };
    
    this.orderData.items = [...(this.orderData.items || []), orderItem];
    this.calculateTotals();
    return this;
  }

  shipping(): OrderShippingBuilder {
    return new OrderShippingBuilder(this);
  }

  payment(): OrderPaymentBuilder {
    return new OrderPaymentBuilder(this);
  }

  notes(notes: string): this {
    this.orderData.notes = notes;
    return this;
  }

  createdAt(date: Date): this {
    this.orderData.createdAt = date;
    return this;
  }

  updatedAt(date: Date): this {
    this.orderData.updatedAt = date;
    return this;
  }

  build(): Order {
    // Validate required fields
    if (!this.orderData.customer) {
      throw new Error('Customer is required');
    }
    if (!this.orderData.items || this.orderData.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    if (!this.orderData.shipping) {
      throw new Error('Shipping information is required');
    }
    if (!this.orderData.payment) {
      throw new Error('Payment information is required');
    }

    return Object.freeze({
      id: this.orderData.id!,
      customer: this.orderData.customer,
      status: this.orderData.status!,
      items: [...this.orderData.items],
      subtotal: this.orderData.subtotal!,
      tax: this.orderData.tax!,
      total: this.orderData.total!,
      shipping: { ...this.orderData.shipping },
      payment: { ...this.orderData.payment },
      createdAt: this.orderData.createdAt!,
      updatedAt: this.orderData.updatedAt!,
      notes: this.orderData.notes
    });
  }

  // Static factory methods for common order types
  static pending(): OrderTestDataBuilder {
    return new OrderTestDataBuilder()
      .status('pending')
      .createdAt(new Date());
  }

  static completed(): OrderTestDataBuilder {
    return new OrderTestDataBuilder()
      .status('delivered')
      .createdAt(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 1 week ago
      .updatedAt(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)); // 2 days ago
  }

  // Helper methods
  private generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  private generateItemId(): string {
    return 'item_' + Math.random().toString(36).substr(2, 8);
  }

  private calculateTotals(): void {
    if (!this.orderData.items || this.orderData.items.length === 0) {
      this.orderData.subtotal = 0;
      this.orderData.tax = 0;
      this.orderData.total = 0;
      return;
    }

    this.orderData.subtotal = this.orderData.items.reduce((sum, item) => {
      const itemTotal = (item.price * item.quantity) - (item.discount || 0);
      return sum + itemTotal;
    }, 0);

    this.orderData.tax = Math.round(this.orderData.subtotal * 0.08 * 100) / 100; // 8% tax
    this.orderData.total = this.orderData.subtotal + this.orderData.tax + (this.orderData.shipping?.cost || 0);
  }

  // Internal setter methods for builders
  setShipping(shipping: ShippingInfo): this {
    this.orderData.shipping = shipping;
    this.calculateTotals(); // Recalculate with shipping cost
    return this;
  }

  setPayment(payment: PaymentInfo): this {
    this.orderData.payment = payment;
    return this;
  }
}

// Shipping builder for hierarchical construction
class OrderShippingBuilder {
  private parent: OrderTestDataBuilder;
  private shippingData: Partial<ShippingInfo> = {
    method: 'standard',
    cost: 9.99,
    country: 'US'
  };

  constructor(parent: OrderTestDataBuilder) {
    this.parent = parent;
  }

  address(address: string): this {
    this.shippingData.address = address;
    return this;
  }

  city(city: string): this {
    this.shippingData.city = city;
    return this;
  }

  state(state: string): this {
    this.shippingData.state = state;
    return this;
  }

  zipCode(zipCode: string): this {
    this.shippingData.zipCode = zipCode;
    return this;
  }

  country(country: string): this {
    this.shippingData.country = country;
    return this;
  }

  method(method: ShippingInfo['method']): this {
    this.shippingData.method = method;
    
    // Auto-set cost based on method
    switch (method) {
      case 'standard':
        this.shippingData.cost = 9.99;
        this.shippingData.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'express':
        this.shippingData.cost = 15.99;
        this.shippingData.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        break;
      case 'overnight':
        this.shippingData.cost = 29.99;
        this.shippingData.estimatedDelivery = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
        break;
      case 'pickup':
        this.shippingData.cost = 0;
        this.shippingData.estimatedDelivery = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
        break;
    }
    
    return this;
  }

  cost(cost: number): this {
    if (cost < 0) {
      throw new Error('Shipping cost cannot be negative');
    }
    this.shippingData.cost = cost;
    return this;
  }

  estimatedDelivery(date: Date): this {
    this.shippingData.estimatedDelivery = date;
    return this;
  }

  trackingNumber(trackingNumber: string): this {
    this.shippingData.trackingNumber = trackingNumber;
    return this;
  }

  done(): OrderTestDataBuilder {
    // Validate required fields
    if (!this.shippingData.address) {
      throw new Error('Shipping address is required');
    }
    
    const shippingInfo: ShippingInfo = {
      address: this.shippingData.address,
      city: this.shippingData.city || 'Unknown City',
      state: this.shippingData.state || 'Unknown State',
      zipCode: this.shippingData.zipCode || '00000',
      country: this.shippingData.country!,
      method: this.shippingData.method!,
      cost: this.shippingData.cost!,
      estimatedDelivery: this.shippingData.estimatedDelivery!,
      trackingNumber: this.shippingData.trackingNumber
    };
    
    return this.parent.setShipping(shippingInfo);
  }
}

// Payment builder for hierarchical construction
class OrderPaymentBuilder {
  private parent: OrderTestDataBuilder;
  private paymentData: Partial<PaymentInfo> = {
    status: 'pending',
    processor: 'Stripe'
  };

  constructor(parent: OrderTestDataBuilder) {
    this.parent = parent;
  }

  method(method: PaymentInfo['method']): this {
    this.paymentData.method = method;
    
    // Auto-set processor based on method
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        this.paymentData.processor = 'Stripe';
        break;
      case 'paypal':
        this.paymentData.processor = 'PayPal';
        break;
      case 'bank_transfer':
        this.paymentData.processor = 'Bank';
        break;
      case 'crypto':
        this.paymentData.processor = 'CoinBase';
        break;
    }
    
    return this;
  }

  last4(last4: string): this {
    if (last4.length !== 4) {
      throw new Error('Last 4 digits must be exactly 4 characters');
    }
    this.paymentData.last4 = last4;
    return this;
  }

  status(status: PaymentInfo['status']): this {
    this.paymentData.status = status;
    
    if (status === 'captured' || status === 'refunded') {
      this.paymentData.processedAt = new Date();
    }
    
    return this;
  }

  transactionId(transactionId: string): this {
    this.paymentData.transactionId = transactionId;
    return this;
  }

  processor(processor: string): this {
    this.paymentData.processor = processor;
    return this;
  }

  processedAt(date: Date): this {
    this.paymentData.processedAt = date;
    return this;
  }

  done(): OrderTestDataBuilder {
    const paymentInfo: PaymentInfo = {
      method: this.paymentData.method || 'credit_card',
      last4: this.paymentData.last4,
      status: this.paymentData.status!,
      transactionId: this.paymentData.transactionId || this.generateTransactionId(),
      processedAt: this.paymentData.processedAt,
      processor: this.paymentData.processor!
    };
    
    return this.parent.setPayment(paymentInfo);
  }

  private generateTransactionId(): string {
    return 'txn_' + Math.random().toString(36).substr(2, 16);
  }
}

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

class TestDataGenerator {
  // Generate realistic names
  static generateName(): string {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Ashley'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Wilson'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  // Generate realistic email based on name
  static generateEmail(name: string): string {
    const domains = ['example.com', 'test.com', 'demo.org', 'sample.net'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const username = name.toLowerCase().replace(' ', '.');
    
    return `${username}@${domain}`;
  }

  // Generate realistic addresses
  static generateAddress(): { address: string; city: string; state: string; zipCode: string } {
    const streets = ['Main St', 'Oak Ave', 'Park Rd', 'First St', 'Second Ave', 'Elm St', 'Maple Ave'];
    const cities = ['Springfield', 'Franklin', 'Georgetown', 'Madison', 'Arlington', 'Salem', 'Bristol'];
    const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const zipCode = Math.floor(Math.random() * 90000) + 10000;
    
    return {
      address: `${streetNumber} ${street}`,
      city,
      state,
      zipCode: zipCode.toString()
    };
  }

  // Generate realistic product data
  static generateProducts(): Partial<OrderItem>[] {
    const products = [
      { name: 'Laptop Pro', price: 2499.99, category: 'Electronics', sku: 'LAPTOP-001' },
      { name: 'Wireless Mouse', price: 79.99, category: 'Electronics', sku: 'MOUSE-001' },
      { name: 'Mechanical Keyboard', price: 159.99, category: 'Electronics', sku: 'KEYBOARD-001' },
      { name: 'USB-C Hub', price: 49.99, category: 'Electronics', sku: 'HUB-001' },
      { name: 'Bluetooth Headphones', price: 199.99, category: 'Electronics', sku: 'HEADPHONES-001' },
      { name: 'Smartphone Case', price: 29.99, category: 'Accessories', sku: 'CASE-001' },
      { name: 'Portable Charger', price: 39.99, category: 'Electronics', sku: 'CHARGER-001' }
    ];
    
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const selectedProducts = [];
    
    for (let i = 0; i < count; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      selectedProducts.push({
        ...product,
        quantity: Math.floor(Math.random() * 3) + 1, // 1-3 quantity
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 10 : 0 // 30% chance of discount
      });
    }
    
    return selectedProducts;
  }

  // Generate a complete realistic user
  static generateUser(): User {
    const name = this.generateName();
    const email = this.generateEmail(name);
    const age = Math.floor(Math.random() * 50) + 18; // 18-67 years old
    const roles: User['role'][] = ['user', 'premium', 'moderator'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    return new UserTestDataBuilder()
      .name(name)
      .email(email)
      .age(age)
      .role(role)
      .profile()
        .bio(`${name} is a ${role} with ${age} years of experience.`)
        .location('San Francisco, CA')
        .timezone('America/Los_Angeles')
        .phoneNumber(`+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`)
        .done()
      .auditInfo()
        .emailVerified(Math.random() > 0.2) // 80% verified
        .loginCount(Math.floor(Math.random() * 200) + 1)
        .lastLogin(new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000))
        .done()
      .build();
  }

  // Generate a complete realistic order
  static generateOrder(): Order {
    const user = this.generateUser();
    const address = this.generateAddress();
    const products = this.generateProducts();
    const shippingMethods: ShippingInfo['method'][] = ['standard', 'express', 'overnight'];
    const paymentMethods: PaymentInfo['method'][] = ['credit_card', 'debit_card', 'paypal'];
    
    return new OrderTestDataBuilder()
      .customer(user)
      .status('confirmed')
      .items(products)
      .shipping()
        .address(address.address)
        .city(address.city)
        .state(address.state)
        .zipCode(address.zipCode)
        .method(shippingMethods[Math.floor(Math.random() * shippingMethods.length)])
        .done()
      .payment()
        .method(paymentMethods[Math.floor(Math.random() * paymentMethods.length)])
        .last4(Math.floor(Math.random() * 9000) + 1000 + '')
        .status('captured')
        .done()
      .build();
  }
}

// ============================================================================
// USAGE DEMONSTRATIONS
// ============================================================================

// Usage Example - Following the documented API exactly
async function demonstrateTestDataBuilder(): Promise<void> {
  console.log('=== TEST DATA BUILDER DEMO ===');
  console.log('Following the documented API pattern:\n');

  // User Test Data Example
  console.log('--- User Test Data Building ---');
  
  let testUser: User;
  try {
    testUser = new UserTestDataBuilder()
      .name('John Doe')
      .email('john.doe@example.com')
      .age(30)
      .role('admin')
      .permissions(['read', 'write', 'delete'])
      .profile()
        .bio('Software engineer with 10 years experience')
        .avatar('https://example.com/avatars/john.jpg')
        .location('San Francisco, CA')
        .timezone('America/Los_Angeles')
        .twitter('@johndoe')
        .linkedin('https://linkedin.com/in/johndoe')
        .github('johndoe')
        .done()
      .preferences()
        .theme('dark')
        .language('en-US')
        .notifications({ email: true, push: false, sms: false })
        .privacy({ profileVisibility: 'public', showEmail: false, showPhoneNumber: false })
        .done()
      .auditInfo()
        .createdAt(new Date('2023-01-15'))
        .lastLogin(new Date('2024-06-25'))
        .loginCount(156)
        .emailVerified(true)
        .done()
      .build();

    console.log('Generated User:');
    console.log(`ID: ${testUser.id}`);
    console.log(`Name: ${testUser.name}`);
    console.log(`Email: ${testUser.email}`);
    console.log(`Age: ${testUser.age}`);
    console.log(`Role: ${testUser.role}`);
    console.log(`Permissions: ${testUser.permissions.join(', ')}`);
    console.log(`Bio: ${testUser.profile.bio}`);
    console.log(`Location: ${testUser.profile.location}`);
    console.log(`Theme: ${testUser.preferences.theme}`);
    console.log(`Email Verified: ${testUser.auditInfo.emailVerified}`);
    console.log(`Login Count: ${testUser.auditInfo.loginCount}`);
    console.log(`Active: ${testUser.isActive}`);

  } catch (error) {
    console.error('❌ User data error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // Order Test Data Example
  console.log('--- Order Test Data Building ---');
  
  try {
    // Create a user for the order
    const orderUser = UserTestDataBuilder.regularUser().build();
    
    const testOrder = new OrderTestDataBuilder()
      .id('ORD-2024-001234')
      .customer(orderUser)
      .status('pending')
      .items([
        { name: 'Laptop Pro', price: 2499.99, quantity: 1, category: 'Electronics', sku: 'LAPTOP-001' },
        { name: 'Wireless Mouse', price: 79.99, quantity: 2, category: 'Electronics', sku: 'MOUSE-001' }
      ])
      .shipping()
        .address('123 Main St')
        .city('San Francisco')
        .state('CA')
        .zipCode('94105')
        .method('express')
        .cost(15.99)
        .estimatedDelivery(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))
        .trackingNumber('1Z999AA1234567890')
        .done()
      .payment()
        .method('credit_card')
        .last4('1234')
        .status('authorized')
        .processor('Stripe')
        .done()
      .notes('Please handle with care')
      .build();

    console.log('Generated Order:');
    console.log(`Order ID: ${testOrder.id}`);
    console.log(`Customer: ${testOrder.customer.name} (${testOrder.customer.email})`);
    console.log(`Status: ${testOrder.status}`);
    console.log(`Items: ${testOrder.items.length}`);
    console.log(`Subtotal: $${testOrder.subtotal.toFixed(2)}`);
    console.log(`Tax: $${testOrder.tax.toFixed(2)}`);
    console.log(`Total: $${testOrder.total.toFixed(2)}`);
    console.log(`Shipping: ${testOrder.shipping.method} - $${testOrder.shipping.cost}`);
    console.log(`Payment: ${testOrder.payment.method} (*${testOrder.payment.last4}) - ${testOrder.payment.status}`);
    console.log(`Notes: ${testOrder.notes}`);

  } catch (error) {
    console.error('❌ Order data error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // Factory Methods Example
  console.log('--- Factory Methods ---');
  
  try {
    const adminUser = UserTestDataBuilder.admin()
      .name('Super Admin')
      .email('superadmin@company.com')
      .build();

    const premiumUser = UserTestDataBuilder.premiumUser()
      .name('Premium Customer')
      .email('premium@customer.com')
      .build();

    const completedOrder = OrderTestDataBuilder.completed()
      .customer(premiumUser)
      .addItem({ name: 'Premium Service', price: 99.99, quantity: 1, category: 'Services' })
      .shipping()
        .address('456 Premium Ave')
        .city('Los Angeles')
        .state('CA')
        .zipCode('90210')
        .method('express')
        .done()
      .payment()
        .method('credit_card')
        .last4('9999')
        .status('captured')
        .done()
      .build();

    console.log('Factory-generated Users:');
    console.log(`Admin: ${adminUser.name} (${adminUser.role}) - ${adminUser.permissions.length} permissions`);
    console.log(`Premium: ${premiumUser.name} (${premiumUser.role}) - ${premiumUser.permissions.length} permissions`);
    console.log(`Completed Order: ${completedOrder.id} - ${completedOrder.status} - $${completedOrder.total.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Factory methods error:', error instanceof Error ? error.message : String(error));
  }

  console.log();

  // Realistic Data Generation
  console.log('--- Realistic Data Generation ---');
  
  try {
    const realisticUsers = [];
    const realisticOrders = [];

    // Generate 3 realistic users
    for (let i = 0; i < 3; i++) {
      realisticUsers.push(TestDataGenerator.generateUser());
    }

    // Generate 2 realistic orders
    for (let i = 0; i < 2; i++) {
      realisticOrders.push(TestDataGenerator.generateOrder());
    }

    console.log('Generated Realistic Data:');
    console.log(`Users: ${realisticUsers.length}`);
    realisticUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log(`Orders: ${realisticOrders.length}`);
    realisticOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.id} - ${order.customer.name} - $${order.total.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Realistic data error:', error instanceof Error ? error.message : String(error));
  }

  console.log(`\n✅ Successfully demonstrated test data builders with realistic data generation`);
}

// Testing Example
async function testTestDataBuilder(): Promise<void> {
  console.log('\n=== TEST DATA BUILDER TESTS ===');
  
  // Test 1: Required field validation
  console.log('Test 1 - Required field validation:');
  try {
    new UserTestDataBuilder().build();
    console.log('❌ Should have thrown error for missing required fields');
  } catch (error) {
    console.log('✅ Correctly validates required fields');
  }

  // Test 2: Email validation
  console.log('\nTest 2 - Email validation:');
  try {
    new UserTestDataBuilder()
      .name('Test User')
      .email('invalid-email')
      .age(25);
    console.log('❌ Should have thrown error for invalid email');
  } catch (error) {
    console.log('✅ Correctly validates email format');
  }

  // Test 3: Age validation
  console.log('\nTest 3 - Age validation:');
  try {
    new UserTestDataBuilder()
      .name('Test User')
      .email('test@example.com')
      .age(5);
    console.log('❌ Should have thrown error for invalid age');
  } catch (error) {
    console.log('✅ Correctly validates age range');
  }

  // Test 4: Hierarchical builders
  console.log('\nTest 4 - Hierarchical builders:');
  const userWithProfile = new UserTestDataBuilder()
    .name('Test User')
    .email('test@example.com')
    .age(25)
    .profile()
      .bio('Test bio')
      .location('Test City')
      .done()
    .build();

  console.log(`✅ Hierarchical profile builder works: ${userWithProfile.profile.bio === 'Test bio'}`);

  // Test 5: Total calculation
  console.log('\nTest 5 - Order total calculation:');
  const testUser = UserTestDataBuilder.regularUser().build();
  const order = new OrderTestDataBuilder()
    .customer(testUser)
    .addItem({ name: 'Test Item', price: 100, quantity: 2 })
    .shipping()
      .address('123 Test St')
      .method('standard')
      .done()
    .payment()
      .method('credit_card')
      .done()
    .build();

  const expectedSubtotal = 200; // 100 * 2
  const expectedTax = 16; // 8% of 200
  const expectedTotal = expectedSubtotal + expectedTax + 9.99; // + shipping

  console.log(`✅ Order totals calculated correctly: ${Math.abs(order.total - expectedTotal) < 0.01}`);

  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateTestDataBuilder();
  await testTestDataBuilder();
  exit(0);
})();

export {
  UserTestDataBuilder,
  UserProfileBuilder,
  UserPreferencesBuilder,
  UserAuditInfoBuilder,
  OrderTestDataBuilder,
  OrderShippingBuilder,
  OrderPaymentBuilder,
  TestDataGenerator,
  User,
  Order
}; 