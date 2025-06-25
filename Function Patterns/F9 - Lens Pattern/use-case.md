# Lens Pattern - Use Cases

## Overview

This document explores practical applications of the Lens pattern in real-world scenarios. Each use case demonstrates how lenses can solve complex data access and update problems while maintaining immutability and type safety.

## Use Case 1: Nested Object Updates

### Problem
Updating deeply nested object properties without mutating the original data structure, especially in state management scenarios.

### Solution
Use property lenses to access and update nested object properties immutably.

### Implementation
```typescript
// Basic lens implementation
interface Lens<S, A> {
  get: (source: S) => A;
  set: (value: A, source: S) => S;
  modify: (fn: (value: A) => A, source: S) => S;
  compose: <B>(other: Lens<A, B>): Lens<S, B>;
}

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

// Property lens factory
const prop = <K extends keyof T, T>(key: K): Lens<T, T[K]> => {
  return new SimpleLens<T, T[K]>(
    (obj: T) => obj[key],
    (value: T[K], obj: T) => ({ ...obj, [key]: value })
  );
};

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

// Create lenses for nested properties
const userAddressLens = prop<User, 'address'>('address');
const addressStreetLens = prop<Address, 'street'>('street');
const addressCityLens = prop<Address, 'city'>('city');
const userPreferencesLens = prop<User, 'preferences'>('preferences');
const themeLens = prop<{ theme: string; language: string; notifications: boolean }, 'theme'>('theme');

// Compose lenses for deep access
const userStreetLens = userAddressLens.compose(addressStreetLens);
const userThemeLens = userPreferencesLens.compose(themeLens);

// Usage
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

// Update nested properties
const updatedUser1 = userStreetLens.set("456 Oak Ave", user);
const updatedUser2 = userThemeLens.modify(theme => theme === "light" ? "dark" : "light", user);
```

### Benefits
- **Immutability**: Original data structure is never mutated
- **Type Safety**: Compile-time guarantees about property access
- **Composability**: Easy to combine lenses for deep access
- **Reusability**: Lenses can be reused across different data structures

## Use Case 2: Array Element Updates

### Problem
Updating specific elements in arrays while maintaining immutability and handling edge cases like out-of-bounds access.

### Solution
Use array lenses to access and update array elements safely.

### Implementation
```typescript
// Array index lens
const index = <T>(index: number): Lens<T[], T> => {
  return new SimpleLens<T[], T>(
    (arr: T[]) => arr[index],
    (value: T, arr: T[]) => {
      if (index < 0 || index >= arr.length) {
        return arr; // Return original array if index is out of bounds
      }
      const newArr = [...arr];
      newArr[index] = value;
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

// Shopping cart with items
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

// Create lenses for cart operations
const cartItemsLens = prop<ShoppingCart, 'items'>('items');
const cartTotalLens = prop<ShoppingCart, 'total'>('total');

// Compose lenses for item access
const firstItemLens = cartItemsLens.compose(index<CartItem>(0));
const secondItemLens = cartItemsLens.compose(index<CartItem>(1));

// Usage
const cart: ShoppingCart = {
  id: "cart-123",
  items: [
    { id: 1, name: "Book", price: 20, quantity: 1 },
    { id: 2, name: "Pen", price: 5, quantity: 2 }
  ],
  total: 30
};

// Update specific items
const updatedCart1 = firstItemLens.modify(item => ({ ...item, quantity: item.quantity + 1 }), cart);
const updatedCart2 = secondItemLens.set({ id: 3, name: "Pencil", price: 2, quantity: 3 }, cart);
```

### Benefits
- **Safe Access**: Handles out-of-bounds access gracefully
- **Immutable Updates**: Never mutates the original array
- **Type Safety**: Compile-time guarantees about array operations
- **Composability**: Easy to combine with other lenses

## Use Case 3: Form State Management

### Problem
Managing complex form state with nested fields, validation, and error handling while maintaining immutability.

### Solution
Use lenses to create a type-safe form state management system.

### Implementation
```typescript
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

// Field lens factory
const field = <T>(fieldName: keyof T): Lens<T, FieldState<any>> => {
  return prop<T, keyof T>(fieldName);
};

// Field value lens
const fieldValue = <T>(): Lens<FieldState<T>, T> => {
  return new SimpleLens<FieldState<T>, T>(
    (field) => field.value,
    (value, field) => ({ ...field, value, dirty: true })
  );
};

// Field error lens
const fieldError = <T>(): Lens<FieldState<T>, string | undefined> => {
  return new SimpleLens<FieldState<T>, string | undefined>(
    (field) => field.error,
    (error, field) => ({ ...field, error })
  );
};

// Field touched lens
const fieldTouched = <T>(): Lens<FieldState<T>, boolean> => {
  return new SimpleLens<FieldState<T>, boolean>(
    (field) => field.touched,
    (touched, field) => ({ ...field, touched })
  );
};

// Create lenses for form fields
const personalLens = prop<FormState, 'personal'>('personal');
const addressLens = prop<FormState, 'address'>('address');
const preferencesLens = prop<FormState, 'preferences'>('preferences');

const firstNameLens = personalLens.compose(field<FormState['personal']>('firstName'));
const firstNameValueLens = firstNameLens.compose(fieldValue<string>());
const firstNameErrorLens = firstNameLens.compose(fieldError<string>());

const emailLens = personalLens.compose(field<FormState['personal']>('email'));
const emailValueLens = emailLens.compose(fieldValue<string>());

// Form actions
const updateField = <T>(lens: Lens<FormState, T>, value: T, form: FormState): FormState => {
  return lens.set(value, form);
};

const setFieldError = <T>(lens: Lens<FormState, T>, error: string, form: FormState): FormState => {
  return lens.set(error, form);
};

const markFieldTouched = <T>(lens: Lens<FormState, T>, form: FormState): FormState => {
  return lens.set(true, form);
};

// Usage
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

// Update form fields
const updatedForm1 = updateField(firstNameValueLens, "John", initialForm);
const updatedForm2 = setFieldError(firstNameErrorLens, "First name is required", updatedForm1);
const updatedForm3 = markFieldTouched(firstNameLens.compose(fieldTouched<string>()), updatedForm2);
```

### Benefits
- **Type Safety**: Compile-time guarantees about form field access
- **Immutable Updates**: Form state is never mutated
- **Composability**: Easy to combine field operations
- **Validation Integration**: Seamless integration with validation logic

## Use Case 4: Configuration Management

### Problem
Managing complex application configuration with nested settings, environment-specific values, and type-safe access.

### Solution
Use lenses to create a type-safe configuration management system.

### Implementation
```typescript
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

// Configuration lens factory
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

// Usage
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

// Update configuration
const updatedManager1 = configManager
  .set(config.dbHost, "production-db.example.com")
  .set(config.dbPort, 5432)
  .modify(config.apiTimeout, timeout => timeout * 2)
  .set(config.analyticsEnabled, true);

// Access configuration
const dbHost = updatedManager1.get(config.dbHost);
const apiTimeout = updatedManager1.get(config.apiTimeout);
const analyticsEnabled = updatedManager1.get(config.analyticsEnabled);
```

### Benefits
- **Type Safety**: Compile-time guarantees about configuration access
- **Immutable Updates**: Configuration is never mutated
- **Environment Support**: Easy to switch between environments
- **Validation**: Can integrate with configuration validation

## Use Case 5: Data Transformation Pipeline

### Problem
Building complex data transformation pipelines that need to access and update nested data structures while maintaining immutability.

### Solution
Use lenses to create composable data transformation operations.

### Implementation
```typescript
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

// Data structure for transformation
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

// Create lenses for product data
const productsLens = prop<ProductCatalog, 'products'>('products');
const productAtIndex = (index: number) => productsLens.compose(index<Product>(index));
const productNameLens = (index: number) => productAtIndex(index).compose(prop<Product, 'name'>('name'));
const productPriceLens = (index: number) => productAtIndex(index).compose(prop<Product, 'price'>('price'));
const productCategoryLens = (index: number) => productAtIndex(index).compose(prop<Product, 'category'>('category'));
const productTagsLens = (index: number) => productAtIndex(index).compose(prop<Product, 'tags'>('tags'));

// Transformation functions
const capitalizeName = (name: string): string => 
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

const applyDiscount = (discountPercent: number) => (price: number): number => 
  price * (1 - discountPercent / 100);

const addTag = (tag: string) => (tags: string[]): string[] => 
  tags.includes(tag) ? tags : [...tags, tag];

const removeTag = (tag: string) => (tags: string[]): string[] => 
  tags.filter(t => t !== tag);

// Usage
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

// Apply transformations
const transformedCatalog = catalog
  |> (catalog => transform(productNameLens(0), capitalizeName).transform(catalog))
  |> (catalog => transform(productNameLens(1), capitalizeName).transform(catalog))
  |> (catalog => transform(productPriceLens(0), applyDiscount(10)).transform(catalog))
  |> (catalog => transform(productPriceLens(1), applyDiscount(5)).transform(catalog))
  |> (catalog => transform(productTagsLens(0), addTag("discounted")).transform(catalog))
  |> (catalog => transform(productTagsLens(1), addTag("new")).transform(catalog));

// Alternative syntax for environments without pipeline operator
const applyTransformations = (catalog: ProductCatalog): ProductCatalog => {
  return transform(productTagsLens(1), addTag("new"))
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
};
```

### Benefits
- **Composability**: Easy to combine multiple transformations
- **Immutability**: Original data is never mutated
- **Type Safety**: Compile-time guarantees about transformations
- **Reusability**: Transformation functions can be reused

## Best Practices

### 1. Follow Lens Laws
- Ensure your lens implementations follow the laws
- Test the laws with property-based testing
- Use established libraries when possible

### 2. Compose Lenses
- Build complex lenses from simple ones
- Reuse common lens patterns
- Keep lenses focused and single-purpose

### 3. Use Type Safety
- Leverage TypeScript for type safety
- Define clear interfaces for your data
- Use generic types for reusability

### 4. Consider Performance
- Profile lens operations for performance
- Use immutable data structure libraries
- Consider memoization for expensive operations

## Conclusion

The Lens pattern provides powerful abstractions for handling immutable data access and updates in functional programming. By understanding and applying these use cases, developers can write more robust, maintainable, and type-safe code.

The key is to start with simple lenses and gradually build up to more complex applications. When used appropriately, lenses can significantly improve code quality and developer experience. 