import { exit } from "process";

// ============================================================================
// LENS IMPLEMENTATION
// ============================================================================

/**
 * Lens for immutable data access and modification.
 * @template S - Source type
 * @template A - Focus type
 */
class Lens<S, A> {
  constructor(
    private readonly getter: (source: S) => A,
    private readonly setter: (source: S, value: A) => S
  ) {}

  /**
   * Get the focused value from the source.
   */
  get(source: S): A {
    return this.getter(source);
  }

  /**
   * Set the focused value in the source.
   */
  set(source: S, value: A): S {
    return this.setter(source, value);
  }

  /**
   * Update the focused value using a function.
   */
  update(source: S, updater: (value: A) => A): S {
    return this.set(source, updater(this.get(source)));
  }

  /**
   * Compose this lens with another lens.
   */
  compose<B>(other: Lens<A, B>): Lens<S, B> {
    return new Lens<S, B>(
      (source: S) => other.get(this.get(source)),
      (source: S, value: B) => this.update(source, a => other.set(a, value))
    );
  }

  /**
   * Map over the focused value.
   */
  map<B>(fn: (value: A) => B): Lens<S, B> {
    return new Lens<S, B>(
      (source: S) => fn(this.get(source)),
      (source: S, value: B) => source // This is a read-only lens
    );
  }

  /**
   * Create a lens that focuses on a property.
   */
  static prop<K extends keyof any, T extends Record<K, any>>(key: K): Lens<T, T[K]> {
    return new Lens<T, T[K]>(
      (source: T) => source[key],
      (source: T, value: T[K]) => ({ ...source, [key]: value })
    );
  }

  /**
   * Create a lens that focuses on an array index.
   */
  static index<T>(index: number): Lens<T[], T> {
    return new Lens<T[], T>(
      (source: T[]) => source[index],
      (source: T[], value: T) => {
        const newArray = [...source];
        newArray[index] = value;
        return newArray;
      }
    );
  }

  /**
   * Create a lens that focuses on a nested object.
   */
  static path(...keys: (string | number)[]): Lens<any, any> {
    return keys.reduce(
      (lens, key) => lens.compose(Lens.prop(key)),
      new Lens<any, any>(
        (source: any) => source,
        (source: any, value: any) => value
      )
    );
  }
}

// ============================================================================
// DATA MODELS
// ============================================================================

interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
}

interface Contact {
  email: string;
  phone: string;
  website?: string;
}

interface User {
  id: string;
  name: string;
  age: number;
  address: Address;
  contact: Contact;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  tags: string[];
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  shipping: {
    address: Address;
    method: 'standard' | 'express';
    cost: number;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    notes?: string;
  };
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Company {
  name: string;
  employees: User[];
  departments: Department[];
  settings: {
    timezone: string;
    currency: string;
    features: {
      chat: boolean;
      analytics: boolean;
      reporting: boolean;
    };
  };
}

interface Department {
  id: string;
  name: string;
  manager: User;
  members: User[];
  budget: number;
}

// ============================================================================
// LENS EXAMPLES
// ============================================================================

const demonstrateBasicLensOperations = () => {
  console.log("\n=== Basic Lens Operations ===");

  const user: User = {
    id: '1',
    name: 'Alice Johnson',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'New York',
      country: 'USA',
      zipCode: '10001'
    },
    contact: {
      email: 'alice@example.com',
      phone: '+1-555-0123'
    },
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    tags: ['developer', 'admin']
  };

  // Basic property lenses
  const nameLens = Lens.prop('name');
  const ageLens = Lens.prop('age');
  const addressLens = Lens.prop('address');
  const contactLens = Lens.prop('contact');

  console.log("Original name:", nameLens.get(user));
  console.log("Original age:", ageLens.get(user));

  // Update operations
  const updatedUser1 = nameLens.set(user, 'Alice Smith');
  const updatedUser2 = ageLens.update(user, age => age + 1);

  console.log("Updated name:", nameLens.get(updatedUser1));
  console.log("Updated age:", ageLens.get(updatedUser2));

  // Nested property access
  const streetLens = addressLens.compose(Lens.prop('street'));
  const cityLens = addressLens.compose(Lens.prop('city'));
  const emailLens = contactLens.compose(Lens.prop('email'));

  console.log("Street:", streetLens.get(user));
  console.log("City:", cityLens.get(user));
  console.log("Email:", emailLens.get(user));

  // Update nested properties
  const updatedUser3 = streetLens.set(user, '456 Oak Ave');
  const updatedUser4 = emailLens.set(user, 'alice.smith@example.com');

  console.log("Updated street:", streetLens.get(updatedUser3));
  console.log("Updated email:", emailLens.get(updatedUser4));
};

const demonstrateComplexLensComposition = () => {
  console.log("\n=== Complex Lens Composition ===");

  const order: Order = {
    id: 'o1',
    userId: 'u1',
    items: [
      { productId: 'p1', name: 'Laptop', quantity: 1, price: 999 },
      { productId: 'p2', name: 'Mouse', quantity: 2, price: 25 }
    ],
    total: 1049,
    status: 'pending',
    shipping: {
      address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
        zipCode: '10001'
      },
      method: 'standard',
      cost: 10
    },
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      notes: 'Handle with care'
    }
  };

  // Deep nested access
  const shippingAddressLens = Lens.prop('shipping').compose(Lens.prop('address'));
  const shippingCityLens = shippingAddressLens.compose(Lens.prop('city'));
  const shippingMethodLens = Lens.prop('shipping').compose(Lens.prop('method'));
  const firstItemLens = Lens.prop('items').compose(Lens.index(0));
  const firstItemNameLens = firstItemLens.compose(Lens.prop('name') as Lens<any, any>);
  const metadataNotesLens = Lens.prop('metadata').compose(Lens.prop('notes'));

  console.log("Shipping city:", shippingCityLens.get(order));
  console.log("Shipping method:", shippingMethodLens.get(order));
  console.log("First item name:", firstItemNameLens.get(order));
  console.log("Notes:", metadataNotesLens.get(order));

  // Update deep nested properties
  const updatedOrder1 = shippingCityLens.set(order, 'Los Angeles');
  const updatedOrder2 = shippingMethodLens.set(order, 'express');
  const updatedOrder3 = firstItemNameLens.set(order, 'Gaming Laptop');
  const updatedOrder4 = metadataNotesLens.set(order, 'Urgent delivery');

  console.log("Updated shipping city:", shippingCityLens.get(updatedOrder1));
  console.log("Updated shipping method:", shippingMethodLens.get(updatedOrder2));
  console.log("Updated first item name:", firstItemNameLens.get(updatedOrder3));
  console.log("Updated notes:", metadataNotesLens.get(updatedOrder4));
};

const demonstrateArrayLensOperations = () => {
  console.log("\n=== Array Lens Operations ===");

  const users: User[] = [
    {
      id: '1',
      name: 'Alice',
      age: 30,
      address: { street: '123 Main St', city: 'NYC', country: 'USA', zipCode: '10001' },
      contact: { email: 'alice@example.com', phone: '+1-555-0123' },
      preferences: { theme: 'light', notifications: true, language: 'en' },
      tags: ['developer']
    },
    {
      id: '2',
      name: 'Bob',
      age: 25,
      address: { street: '456 Oak Ave', city: 'LA', country: 'USA', zipCode: '90210' },
      contact: { email: 'bob@example.com', phone: '+1-555-0456' },
      preferences: { theme: 'dark', notifications: false, language: 'en' },
      tags: ['designer']
    },
    {
      id: '3',
      name: 'Charlie',
      age: 35,
      address: { street: '789 Pine St', city: 'SF', country: 'USA', zipCode: '94102' },
      contact: { email: 'charlie@example.com', phone: '+1-555-0789' },
      preferences: { theme: 'light', notifications: true, language: 'es' },
      tags: ['manager']
    }
  ];

  // Array index lenses
  const firstUserLens = Lens.index(0);
  const secondUserLens = Lens.index(1);
  const firstUserNameLens = firstUserLens.compose(Lens.prop('name') as Lens<any, any>);
  const secondUserAgeLens = secondUserLens.compose(Lens.prop('age') as Lens<any, any>);

  console.log("First user name:", firstUserNameLens.get(users));
  console.log("Second user age:", secondUserAgeLens.get(users));

  // Update array elements
  const updatedUsers1 = firstUserNameLens.set(users, 'Alice Smith');
  const updatedUsers2 = secondUserAgeLens.update(users, age => age + 1);

  console.log("Updated first user name:", firstUserNameLens.get(updatedUsers1));
  console.log("Updated second user age:", secondUserAgeLens.get(updatedUsers2));

  // Nested array operations
  const firstUserTagsLens = firstUserLens.compose(Lens.prop('tags') as Lens<any, any>);
  const firstUserFirstTagLens = firstUserTagsLens.compose(Lens.index(0));

  console.log("First user's first tag:", firstUserFirstTagLens.get(users));

  const updatedUsers3 = firstUserFirstTagLens.set(users, 'senior-developer');
  console.log("Updated first user's first tag:", firstUserFirstTagLens.get(updatedUsers3));
};

const demonstrateLensPathOperations = () => {
  console.log("\n=== Lens Path Operations ===");

  const company: Company = {
    name: 'TechCorp',
    employees: [
      {
        id: '1',
        name: 'Alice',
        age: 30,
        address: { street: '123 Main St', city: 'NYC', country: 'USA', zipCode: '10001' },
        contact: { email: 'alice@example.com', phone: '+1-555-0123' },
        preferences: { theme: 'light', notifications: true, language: 'en' },
        tags: ['developer']
      }
    ],
    departments: [
      {
        id: 'd1',
        name: 'Engineering',
        manager: {
          id: '2',
          name: 'Bob',
          age: 35,
          address: { street: '456 Oak Ave', city: 'LA', country: 'USA', zipCode: '90210' },
          contact: { email: 'bob@example.com', phone: '+1-555-0456' },
          preferences: { theme: 'dark', notifications: false, language: 'en' },
          tags: ['manager']
        },
        members: [],
        budget: 1000000
      }
    ],
    settings: {
      timezone: 'UTC',
      currency: 'USD',
      features: {
        chat: true,
        analytics: true,
        reporting: false
      }
    }
  };

  // Using path lenses
  const companyNameLens = Lens.path('name');
  const firstEmployeeLens = Lens.path('employees', 0);
  const firstEmployeeNameLens = Lens.path('employees', 0, 'name');
  const firstDepartmentLens = Lens.path('departments', 0);
  const firstDepartmentManagerLens = Lens.path('departments', 0, 'manager');
  const managerNameLens = Lens.path('departments', 0, 'manager', 'name');
  const chatFeatureLens = Lens.path('settings', 'features', 'chat');

  console.log("Company name:", companyNameLens.get(company));
  console.log("First employee name:", firstEmployeeNameLens.get(company));
  console.log("First department manager name:", managerNameLens.get(company));
  console.log("Chat feature enabled:", chatFeatureLens.get(company));

  // Update using path lenses
  const updatedCompany1 = companyNameLens.set(company, 'TechCorp Inc.');
  const updatedCompany2 = firstEmployeeNameLens.set(company, 'Alice Johnson');
  const updatedCompany3 = managerNameLens.set(company, 'Bob Smith');
  const updatedCompany4 = chatFeatureLens.set(company, false);

  console.log("Updated company name:", companyNameLens.get(updatedCompany1));
  console.log("Updated first employee name:", firstEmployeeNameLens.get(updatedCompany2));
  console.log("Updated manager name:", managerNameLens.get(updatedCompany3));
  console.log("Updated chat feature:", chatFeatureLens.get(updatedCompany4));
};

const demonstrateLensTransformations = () => {
  console.log("\n=== Lens Transformations ===");

  const user: User = {
    id: '1',
    name: 'Alice Johnson',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'New York',
      country: 'USA',
      zipCode: '10001'
    },
    contact: {
      email: 'alice@example.com',
      phone: '+1-555-0123'
    },
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    tags: ['developer', 'admin']
  };

  // Transform lenses
  const nameLengthLens = Lens.prop('name').map(name => name.length);
  const ageGroupLens = Lens.prop('age').map(age => age < 30 ? 'young' : age < 50 ? 'middle' : 'senior');
  const emailDomainLens = Lens.prop('contact').compose(Lens.prop('email')).map(email => email.split('@')[1]);
  const fullAddressLens = Lens.prop('address').map(addr => 
    `${addr.street}, ${addr.city}, ${addr.country} ${addr.zipCode}`
  );

  console.log("Name length:", nameLengthLens.get(user));
  console.log("Age group:", ageGroupLens.get(user));
  console.log("Email domain:", emailDomainLens.get(user));
  console.log("Full address:", fullAddressLens.get(user));

  // Complex transformations
  const userSummaryLens = Lens.prop('name').map(name => ({
    displayName: name.toUpperCase(),
    initials: name.split(' ').map((n: string) => n[0]).join(''),
    nameLength: name.length
  }));

  const preferencesSummaryLens = Lens.prop('preferences').map(prefs => ({
    theme: prefs.theme === 'dark' ? '🌙' : '☀️',
    notifications: prefs.notifications ? '🔔' : '🔕',
    language: prefs.language.toUpperCase()
  }));

  console.log("User summary:", userSummaryLens.get(user));
  console.log("Preferences summary:", preferencesSummaryLens.get(user));
};

const demonstrateLensCompositionPatterns = () => {
  console.log("\n=== Lens Composition Patterns ===");

  const users: User[] = [
    {
      id: '1',
      name: 'Alice',
      age: 30,
      address: { street: '123 Main St', city: 'NYC', country: 'USA', zipCode: '10001' },
      contact: { email: 'alice@example.com', phone: '+1-555-0123' },
      preferences: { theme: 'light', notifications: true, language: 'en' },
      tags: ['developer']
    },
    {
      id: '2',
      name: 'Bob',
      age: 25,
      address: { street: '456 Oak Ave', city: 'LA', country: 'USA', zipCode: '90210' },
      contact: { email: 'bob@example.com', phone: '+1-555-0456' },
      preferences: { theme: 'dark', notifications: false, language: 'en' },
      tags: ['designer']
    }
  ];

  // Create reusable lens patterns
  const createUserLens = (index: number) => Lens.index(index);
  const createUserNameLens = (index: number) => createUserLens(index).compose(Lens.prop('name') as Lens<any, any>);
  const createUserEmailLens = (index: number) => createUserLens(index).compose(Lens.path('contact', 'email'));
  const createUserAddressLens = (index: number) => createUserLens(index).compose(Lens.prop('address') as Lens<any, any>);

  // Apply patterns
  const aliceNameLens = createUserNameLens(0);
  const bobEmailLens = createUserEmailLens(1);
  const aliceAddressLens = createUserAddressLens(0);

  console.log("Alice's name:", aliceNameLens.get(users));
  console.log("Bob's email:", bobEmailLens.get(users));
  console.log("Alice's address:", aliceAddressLens.get(users));

  // Update using patterns
  const updatedUsers1 = aliceNameLens.set(users, 'Alice Smith');
  const updatedUsers2 = bobEmailLens.set(users, 'bob.smith@example.com');
  const updatedUsers3 = aliceAddressLens.update(users, addr => ({
    ...addr,
    city: 'Boston',
    zipCode: '02101'
  }));

  console.log("Updated Alice's name:", aliceNameLens.get(updatedUsers1));
  console.log("Updated Bob's email:", bobEmailLens.get(updatedUsers2));
  console.log("Updated Alice's address:", aliceAddressLens.get(updatedUsers3));
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = () => {
  console.log("🔍 Lens Pattern: Immutable Data Access");
  console.log("=".repeat(60));
  
  try {
    demonstrateBasicLensOperations();
    demonstrateComplexLensComposition();
    demonstrateArrayLensOperations();
    demonstrateLensPathOperations();
    demonstrateLensTransformations();
    demonstrateLensCompositionPatterns();
    
    console.log("\n✅ All Lens pattern examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running Lens examples:", error);
  }
};

// Run the examples
main();

exit(0); 