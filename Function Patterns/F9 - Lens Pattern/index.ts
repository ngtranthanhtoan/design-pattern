import { exit } from "process";

// ============================================================================
// LENS INTERFACE AND BASE IMPLEMENTATION
// ============================================================================

// Base lens interface
interface Lens<S, A> {
  get: (source: S) => A;
  set: (value: A, source: S) => S;
  modify: (fn: (value: A) => A, source: S) => S;
  compose<B>(other: Lens<A, B>): Lens<S, B>;
}

// Basic lens implementation
class SimpleLens<S, A> implements Lens<S, A> {
  constructor(
    private getter: (source: S) => A,
    private setter: (value: A, source: S) => S
  ) {}

  get(source: S): A {
    return this.getter(source);
  }

  set(value: A, source: S): S {
    return this.setter(value, source);
  }

  modify(fn: (value: A) => A, source: S): S {
    return this.set(fn(this.get(source)), source);
  }

  compose<B>(other: Lens<A, B>): Lens<S, B> {
    return new SimpleLens<S, B>(
      (source: S) => other.get(this.get(source)),
      (value: B, source: S) => this.set(other.set(value, this.get(source)), source)
    );
  }
}

// ============================================================================
// LENS FACTORIES
// ============================================================================

// Property lens factory
const prop = <T, K extends keyof T>(key: K): Lens<T, T[K]> => {
  return new SimpleLens<T, T[K]>(
    (obj: T) => obj[key],
    (value: T[K], obj: T) => ({ ...obj, [key]: value })
  );
};

// Array index lens
const index = <T>(idx: number): Lens<T[], T> => {
  return new SimpleLens<T[], T>(
    (arr: T[]) => arr[idx],
    (value: T, arr: T[]) => {
      if (idx < 0 || idx >= arr.length) {
        return arr; // Return original array if index is out of bounds
      }
      const newArr = [...arr];
      newArr[idx] = value;
      return newArr;
    }
  );
};

// Optional array lens for safe access
const safeIndex = <T>(index: number): Lens<T[], T | undefined> => {
  return new SimpleLens<T[], T | undefined>(
    (arr: T[]) => arr[index],
    (value: T | undefined, arr: T[]) => {
      if (index < 0 || index >= arr.length) {
        return arr;
      }
      if (value === undefined) {
        return arr.filter((_, i) => i !== index);
      }
      const newArr = [...arr];
      newArr[index] = value;
      return newArr;
    }
  );
};

// Optional lens for nullable values
const optional = <T>(): Lens<T | null, T> => {
  return new SimpleLens<T | null, T>(
    (value: T | null) => value!,
    (newValue: T, value: T | null) => newValue
  );
};

// ============================================================================
// DATA STRUCTURES
// ============================================================================

// User data structure
interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  address: Address;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
}

// Shopping cart structure
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface ShoppingCart {
  id: string;
  items: CartItem[];
  total: number;
}

// Form field state
interface FieldState<T> {
  value: T;
  touched: boolean;
  dirty: boolean;
  error?: string;
}

// Form state
interface FormState {
  personal: {
    firstName: FieldState<string>;
    lastName: FieldState<string>;
    email: FieldState<string>;
  };
  address: {
    street: FieldState<string>;
    city: FieldState<string>;
    zipCode: FieldState<string>;
  };
  preferences: {
    newsletter: FieldState<boolean>;
    notifications: FieldState<boolean>;
  };
}

// Configuration structure
interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  credentials: {
    username: string;
    password: string;
  };
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  database: DatabaseConfig;
  api: ApiConfig;
  features: {
    analytics: boolean;
    caching: boolean;
    logging: boolean;
  };
}

// Product data structure
interface Product {
  id: number;
  name: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
  tags: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

interface ProductCatalog {
  products: Product[];
  totalCount: number;
  categories: {
    id: number;
    name: string;
    productCount: number;
  }[];
}

// ============================================================================
// LENS COMPOSITIONS
// ============================================================================

// User lenses
const userAddressLens = prop<User, 'address'>('address');
const addressStreetLens = prop<Address, 'street'>('street');
const addressCityLens = prop<Address, 'city'>('city');
const userPreferencesLens = prop<User, 'preferences'>('preferences');
const themeLens = prop<{ theme: string; language: string; notifications: boolean }, 'theme'>('theme');

// Compose lenses for deep access
const userStreetLens = userAddressLens.compose(addressStreetLens);
const userThemeLens = userPreferencesLens.compose(themeLens);

// Cart lenses
const cartItemsLens = prop<ShoppingCart, 'items'>('items');
const cartTotalLens = prop<ShoppingCart, 'total'>('total');

// Compose lenses for item access
const firstItemLens = cartItemsLens.compose(index<CartItem>(0));
const secondItemLens = cartItemsLens.compose(index<CartItem>(1));

// Form field lenses
const fieldValue = <T>(): Lens<FieldState<T>, T> => {
  return new SimpleLens<FieldState<T>, T>(
    (field) => field.value,
    (value, field) => ({ ...field, value, dirty: true })
  );
};

const fieldError = <T>(): Lens<FieldState<T>, string | undefined> => {
  return new SimpleLens<FieldState<T>, string | undefined>(
    (field) => field.error,
    (error, field) => ({ ...field, error })
  );
};

const fieldTouched = <T>(): Lens<FieldState<T>, boolean> => {
  return new SimpleLens<FieldState<T>, boolean>(
    (field) => field.touched,
    (touched, field) => ({ ...field, touched })
  );
};

// Form section lenses
const personalLens = prop<FormState, 'personal'>('personal');
const addressLens = prop<FormState, 'address'>('address');
const preferencesLens = prop<FormState, 'preferences'>('preferences');

const firstNameLens = personalLens.compose(prop<FormState['personal'], 'firstName'>('firstName'));
const firstNameValueLens = firstNameLens.compose(fieldValue<string>());
const firstNameErrorLens = firstNameLens.compose(fieldError<string>());

const emailLens = personalLens.compose(prop<FormState['personal'], 'email'>('email'));
const emailValueLens = emailLens.compose(fieldValue<string>());

// Configuration lenses
const config = {
  database: prop<AppConfig, 'database'>('database'),
  api: prop<AppConfig, 'api'>('api'),
  features: prop<AppConfig, 'features'>('features'),
  
  // Database lenses
  dbHost: prop<AppConfig, 'database'>('database').compose(prop<DatabaseConfig, 'host'>('host')),
  dbPort: prop<AppConfig, 'database'>('database').compose(prop<DatabaseConfig, 'port'>('port')),
  dbCredentials: prop<AppConfig, 'database'>('database').compose(prop<DatabaseConfig, 'credentials'>('credentials')),
  
  // API lenses
  apiBaseUrl: prop<AppConfig, 'api'>('api').compose(prop<ApiConfig, 'baseUrl'>('baseUrl')),
  apiTimeout: prop<AppConfig, 'api'>('api').compose(prop<ApiConfig, 'timeout'>('timeout')),
  apiHeaders: prop<AppConfig, 'api'>('api').compose(prop<ApiConfig, 'headers'>('headers')),
  
  // Feature lenses
  analyticsEnabled: prop<AppConfig, 'features'>('features').compose(prop<AppConfig['features'], 'analytics'>('analytics')),
  cachingEnabled: prop<AppConfig, 'features'>('features').compose(prop<AppConfig['features'], 'caching'>('caching')),
  loggingEnabled: prop<AppConfig, 'features'>('features').compose(prop<AppConfig['features'], 'logging'>('logging'))
};

// Product lenses
const productsLens: Lens<ProductCatalog, Product[]> = prop<ProductCatalog, 'products'>('products');
const productAtIndex = (idx: number): Lens<ProductCatalog, Product> => productsLens.compose(index<Product>(idx));
const productNameLens = (idx: number): Lens<ProductCatalog, string> => productAtIndex(idx).compose(prop<Product, 'name'>('name'));
const productPriceLens = (idx: number): Lens<ProductCatalog, number> => productAtIndex(idx).compose(prop<Product, 'price'>('price'));
const productCategoryLens = (idx: number): Lens<ProductCatalog, { id: number; name: string }> => productAtIndex(idx).compose(prop<Product, 'category'>('category'));
const productTagsLens = (idx: number): Lens<ProductCatalog, string[]> => productAtIndex(idx).compose(prop<Product, 'tags'>('tags'));

// ============================================================================
// UTILITY CLASSES
// ============================================================================

// Configuration manager
class ConfigManager {
  private config: AppConfig;

  constructor(initialConfig: AppConfig) {
    this.config = initialConfig;
  }

  get<T>(lens: Lens<AppConfig, T>): T {
    return lens.get(this.config);
  }

  set<T>(lens: Lens<AppConfig, T>, value: T): ConfigManager {
    const newConfig = lens.set(value, this.config);
    return new ConfigManager(newConfig);
  }

  modify<T>(lens: Lens<AppConfig, T>, fn: (value: T) => T): ConfigManager {
    const newConfig = lens.modify(fn, this.config);
    return new ConfigManager(newConfig);
  }

  getConfig(): AppConfig {
    return this.config;
  }
}

// Data transformation lens
class TransformLens<S, A> implements Lens<S, A> {
  constructor(
    private getter: (source: S) => A,
    private setter: (value: A, source: S) => S,
    private transformer: (value: A) => A
  ) {}

  get(source: S): A {
    return this.getter(source);
  }

  set(value: A, source: S): S {
    return this.setter(value, source);
  }

  modify(fn: (value: A) => A, source: S): S {
    return this.set(fn(this.get(source)), source);
  }

  compose<B>(other: Lens<A, B>): Lens<S, B> {
    return new TransformLens<S, B>(
      (source: S) => other.get(this.get(source)),
      (value: B, source: S) => this.set(other.set(value, this.get(source)), source),
      (value: B) => value
    );
  }

  transform(source: S): S {
    return this.modify(this.transformer, source);
  }
}

// Transformation utilities
const transform = <S, A>(
  lens: Lens<S, A>,
  transformer: (value: A) => A
): TransformLens<S, A> => {
  return new TransformLens<S, A>(
    lens.get,
    lens.set,
    transformer
  );
};

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

const capitalizeName = (name: string): string => 
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

const applyDiscount = (discountPercent: number) => (price: number): number => 
  price * (1 - discountPercent / 100);

const addTag = (tag: string) => (tags: string[]): string[] => 
  tags.includes(tag) ? tags : [...tags, tag];

const removeTag = (tag: string) => (tags: string[]): string[] => 
  tags.filter(t => t !== tag);

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

const demonstrateNestedObjectUpdates = () => {
  console.log("\n=== Nested Object Updates ===");
  
  const user: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    address: {
      street: "123 Main St",
      city: "New York",
      country: "USA",
      zipCode: "10001"
    },
    preferences: {
      theme: "light",
      language: "en",
      notifications: true
    }
  };
  
  console.log("Original user:", JSON.stringify(user, null, 2));
  
  // Update nested properties
  const updatedUser1 = userStreetLens.set("456 Oak Ave", user);
  console.log("\nUpdated street:", updatedUser1.address.street);
  
  const updatedUser2 = userThemeLens.modify(theme => theme === "light" ? "dark" : "light", user);
  console.log("Updated theme:", updatedUser2.preferences.theme);
  
  // Verify immutability
  console.log("Original user unchanged:", user.address.street === "123 Main St");
  console.log("Original user unchanged:", user.preferences.theme === "light");
};

const demonstrateArrayElementUpdates = () => {
  console.log("\n=== Array Element Updates ===");
  
  const cart: ShoppingCart = {
    id: "cart-123",
    items: [
      { id: 1, name: "Book", price: 20, quantity: 1 },
      { id: 2, name: "Pen", price: 5, quantity: 2 }
    ],
    total: 30
  };
  
  console.log("Original cart:", JSON.stringify(cart, null, 2));
  
  // Update specific items
  const updatedCart1 = firstItemLens.modify(item => ({ ...item, quantity: item.quantity + 1 }), cart);
  console.log("\nUpdated first item quantity:", updatedCart1.items[0].quantity);
  
  const updatedCart2 = secondItemLens.set({ id: 3, name: "Pencil", price: 2, quantity: 3 }, cart);
  console.log("Replaced second item:", updatedCart2.items[1].name);
  
  // Verify immutability
  console.log("Original cart unchanged:", cart.items[0].quantity === 1);
  console.log("Original cart unchanged:", cart.items[1].name === "Pen");
};

const demonstrateFormStateManagement = () => {
  console.log("\n=== Form State Management ===");
  
  const initialForm: FormState = {
    personal: {
      firstName: { value: "", touched: false, dirty: false },
      lastName: { value: "", touched: false, dirty: false },
      email: { value: "", touched: false, dirty: false }
    },
    address: {
      street: { value: "", touched: false, dirty: false },
      city: { value: "", touched: false, dirty: false },
      zipCode: { value: "", touched: false, dirty: false }
    },
    preferences: {
      newsletter: { value: false, touched: false, dirty: false },
      notifications: { value: true, touched: false, dirty: false }
    }
  };
  
  console.log("Initial form state:", JSON.stringify(initialForm, null, 2));
  
  // Update form fields
  const updatedForm1 = firstNameValueLens.set("John", initialForm);
  console.log("\nUpdated firstName value:", updatedForm1.personal.firstName.value);
  console.log("firstName is dirty:", updatedForm1.personal.firstName.dirty);
  
  const updatedForm2 = firstNameErrorLens.set("First name is required", updatedForm1);
  console.log("Set firstName error:", updatedForm2.personal.firstName.error);
  
  const updatedForm3 = firstNameLens.compose(fieldTouched<string>()).set(true, updatedForm2);
  console.log("Marked firstName as touched:", updatedForm3.personal.firstName.touched);
  
  // Verify immutability
  console.log("Original form unchanged:", initialForm.personal.firstName.value === "");
};

const demonstrateConfigurationManagement = () => {
  console.log("\n=== Configuration Management ===");
  
  const initialConfig: AppConfig = {
    name: "MyApp",
    version: "1.0.0",
    environment: "development",
    database: {
      host: "localhost",
      port: 5432,
      name: "myapp_dev",
      credentials: {
        username: "dev_user",
        password: "dev_password"
      }
    },
    api: {
      baseUrl: "http://localhost:3000",
      timeout: 5000,
      retries: 3,
      headers: {
        "Content-Type": "application/json"
      }
    },
    features: {
      analytics: false,
      caching: true,
      logging: true
    }
  };
  
  const configManager = new ConfigManager(initialConfig);
  
  console.log("Initial config:", JSON.stringify(initialConfig, null, 2));
  
  // Update configuration
  const updatedManager1 = configManager
    .set(config.dbHost, "production-db.example.com")
    .set(config.dbPort, 5432)
    .modify(config.apiTimeout, timeout => timeout * 2)
    .set(config.analyticsEnabled, true);
  
  console.log("\nUpdated config:");
  console.log("- Database host:", updatedManager1.get(config.dbHost));
  console.log("- API timeout:", updatedManager1.get(config.apiTimeout));
  console.log("- Analytics enabled:", updatedManager1.get(config.analyticsEnabled));
  
  // Verify immutability
  console.log("Original config unchanged:", initialConfig.database.host === "localhost");
};

const demonstrateDataTransformation = () => {
  console.log("\n=== Data Transformation Pipeline ===");
  
  const catalog: ProductCatalog = {
    products: [
      {
        id: 1,
        name: "laptop computer",
        price: 999.99,
        category: { id: 1, name: "Electronics" },
        tags: ["computer", "portable"],
        metadata: {
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
          version: 1
        }
      },
      {
        id: 2,
        name: "wireless mouse",
        price: 29.99,
        category: { id: 1, name: "Electronics" },
        tags: ["computer", "wireless"],
        metadata: {
          createdAt: "2023-01-02",
          updatedAt: "2023-01-02",
          version: 1
        }
      }
    ],
    totalCount: 2,
    categories: [
      { id: 1, name: "Electronics", productCount: 2 }
    ]
  };
  
  console.log("Original catalog:", JSON.stringify(catalog, null, 2));
  
  // Apply transformations
  const transformedCatalog = transform(productTagsLens(1), addTag("new"))
    .transform(
      transform(productTagsLens(0), addTag("discounted"))
        .transform(
          transform(productPriceLens(1), applyDiscount(5))
            .transform(
              transform(productPriceLens(0), applyDiscount(10))
                .transform(
                  transform(productNameLens(1), capitalizeName)
                    .transform(
                      transform(productNameLens(0), capitalizeName)
                        .transform(catalog)
                    )
                )
            )
        )
    );
  
  console.log("\nTransformed catalog:");
  console.log("- Product 1 name:", transformedCatalog.products[0].name);
  console.log("- Product 1 price:", transformedCatalog.products[0].price);
  console.log("- Product 1 tags:", transformedCatalog.products[0].tags);
  console.log("- Product 2 name:", transformedCatalog.products[1].name);
  console.log("- Product 2 price:", transformedCatalog.products[1].price);
  console.log("- Product 2 tags:", transformedCatalog.products[1].tags);
  
  // Verify immutability
  console.log("Original catalog unchanged:", catalog.products[0].name === "laptop computer");
};

const demonstrateLensComposition = () => {
  console.log("\n=== Lens Composition ===");
  
  // Create a deeply nested lens
  // const deeplyNestedLens = userAddressLens
  //   .compose(addressStreetLens)
  //   .compose(prop<string, string>('length' as any)); // Access string length (invalid in TS)
  
  const user: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    address: {
      street: "123 Main St",
      city: "New York",
      country: "USA",
      zipCode: "10001"
    },
    preferences: {
      theme: "light",
      language: "en",
      notifications: true
    }
  };
  
  console.log("User:", JSON.stringify(user, null, 2));
  // console.log("Street length:", deeplyNestedLens.get(user));
  
  // Update through composition
  // const updatedUser = deeplyNestedLens.set(15, user); // This would be invalid for string length
  // console.log("Updated user street:", updatedUser.address.street);
};

const demonstrateLensLaws = () => {
  console.log("\n=== Lens Laws Verification ===");
  
  const user: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    address: {
      street: "123 Main St",
      city: "New York",
      country: "USA",
      zipCode: "10001"
    },
    preferences: {
      theme: "light",
      language: "en",
      notifications: true
    }
  };
  
  // Test Get-Set Law: set(lens, get(lens, data), data) === data
  const getSetLaw = userStreetLens.set(userStreetLens.get(user), user);
  console.log("Get-Set Law:", JSON.stringify(getSetLaw) === JSON.stringify(user));
  
  // Test Set-Get Law: get(lens, set(lens, value, data)) === value
  const newStreet = "456 Oak Ave";
  const setGetLaw = userStreetLens.get(userStreetLens.set(newStreet, user));
  console.log("Set-Get Law:", setGetLaw === newStreet);
  
  // Test Set-Set Law: set(lens, value2, set(lens, value1, data)) === set(lens, value2, data)
  const value1 = "789 Pine St";
  const value2 = "321 Elm St";
  const setSetLaw1 = userStreetLens.set(value2, userStreetLens.set(value1, user));
  const setSetLaw2 = userStreetLens.set(value2, user);
  console.log("Set-Set Law:", JSON.stringify(setSetLaw1) === JSON.stringify(setSetLaw2));
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = () => {
  console.log("🔍 Lens Pattern Examples");
  console.log("=" .repeat(50));
  
  try {
    demonstrateNestedObjectUpdates();
    demonstrateArrayElementUpdates();
    demonstrateFormStateManagement();
    demonstrateConfigurationManagement();
    demonstrateDataTransformation();
    demonstrateLensComposition();
    demonstrateLensLaws();
    
    console.log("\n✅ All lens examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running lens examples:", error);
  }
};

// Run the examples
main();

exit(0); 