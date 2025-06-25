import { exit } from "process";

// ============================================================================
// MAYBE MONAD IMPLEMENTATION
// ============================================================================

/**
 * Maybe monad for safe handling of potentially missing values.
 * @template A - The type of the value that might exist
 */
type Maybe<A> = Some<A> | None;

class Some<A> {
  readonly _tag = 'Some' as const;
  constructor(readonly value: A) {}
  
  map<B>(fn: (a: A) => B): Maybe<B> {
    return new Some(fn(this.value));
  }
  
  flatMap<B>(fn: (a: A) => Maybe<B>): Maybe<B> {
    return fn(this.value);
  }
  
  filter(predicate: (a: A) => boolean): Maybe<A> {
    return predicate(this.value) ? this : none();
  }
  
  getOrElse(defaultValue: A): A {
    return this.value;
  }
  
  orElse<B>(fn: () => Maybe<B>): Maybe<A | B> {
    return this;
  }
  
  fold<B>(onNone: () => B, onSome: (a: A) => B): B {
    return onSome(this.value);
  }
  
  isSome(): this is Some<A> {
    return true;
  }
  
  isNone(): this is None {
    return false;
  }
}

class None {
  readonly _tag = 'None' as const;
  
  map<B>(_fn: (a: never) => B): Maybe<B> {
    return this;
  }
  
  flatMap<B>(_fn: (a: never) => Maybe<B>): Maybe<B> {
    return this;
  }
  
  filter(_predicate: (a: never) => boolean): Maybe<never> {
    return this;
  }
  
  getOrElse<A>(defaultValue: A): A {
    return defaultValue;
  }
  
  orElse<B>(fn: () => Maybe<B>): Maybe<B> {
    return fn();
  }
  
  fold<B>(onNone: () => B, _onSome: (a: never) => B): B {
    return onNone();
  }
  
  isSome(): this is Some<never> {
    return false;
  }
  
  isNone(): this is None {
    return true;
  }
}

// Factory functions
const some = <A>(value: A): Maybe<A> => new Some(value);
const none = <A>(): Maybe<A> => new None();

// Utility functions
const fromNullable = <A>(value: A | null | undefined): Maybe<A> => 
  value === null || value === undefined ? none() : some(value);

const fromPredicate = <A>(predicate: (a: A) => boolean, value: A): Maybe<A> =>
  predicate(value) ? some(value) : none();

// ============================================================================
// DATA MODELS AND INTERFACES
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  preferences?: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

interface DatabaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// ============================================================================
// DATA EXTRACTION FUNCTIONS
// ============================================================================

// Safe extraction from API responses
const extractUserFromApi = (response: ApiResponse<any>): Maybe<User> => {
  if (response.status !== 200 || !response.data) {
    return none();
  }
  
  const userData = response.data;
  return fromNullable(userData)
    .filter(data => typeof data === 'object')
    .map(data => ({
      id: data.id || '',
      name: data.name || '',
      email: data.email || '',
      age: data.age,
      preferences: data.preferences
    }))
    .filter(user => user.id && user.name && user.email);
};

// Safe extraction from database records
const extractUserFromDb = (record: DatabaseRecord): Maybe<User> => {
  return fromNullable(record)
    .filter(rec => rec && typeof rec === 'object')
    .map(rec => ({
      id: rec.id || '',
      name: rec.name || '',
      email: rec.email || '',
      age: rec.age,
      preferences: rec.preferences
    }))
    .filter(user => user.id && user.name && user.email);
};

// Safe extraction from user input
const extractUserFromInput = (input: any): Maybe<User> => {
  return fromNullable(input)
    .filter(inp => inp && typeof inp === 'object')
    .map(inp => ({
      id: inp.id || '',
      name: inp.name || '',
      email: inp.email || '',
      age: inp.age,
      preferences: inp.preferences
    }))
    .filter(user => user.id && user.name && user.email);
};

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

// Normalize user data
const normalizeUser = (user: User): User => ({
  ...user,
  name: user.name.trim(),
  email: user.email.toLowerCase().trim(),
  age: user.age && user.age > 0 ? user.age : undefined
});

// Validate user data
const validateUser = (user: User): Maybe<User> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(user.email);
  const isValidName = user.name.length >= 2;
  const isValidAge = !user.age || (user.age >= 0 && user.age <= 150);
  
  return fromPredicate(
    (u: User) => isValidEmail && isValidName && isValidAge,
    user
  );
};

// Enrich user with defaults
const enrichWithDefaults = (user: User): User => ({
  ...user,
  preferences: user.preferences || {
    theme: 'light' as const,
    notifications: true,
    language: 'en'
  }
});

// ============================================================================
// BUSINESS LOGIC FUNCTIONS
// ============================================================================

// Process user profile with full pipeline
const processUserProfile = (rawData: any): User => {
  return extractUserFromInput(rawData)
    .map(normalizeUser)
    .flatMap(validateUser)
    .map(enrichWithDefaults)
    .getOrElse({
      id: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      preferences: {
        theme: 'light',
        notifications: false,
        language: 'en'
      }
    });
};

// Safe email processing
const processEmail = (email: string | null | undefined): Maybe<string> => {
  return fromNullable(email)
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0)
    .filter(e => e.includes('@'));
};

// Safe age processing
const processAge = (age: any): Maybe<number> => {
  return fromNullable(age)
    .map(a => typeof a === 'string' ? parseInt(a, 10) : a)
    .filter(a => !isNaN(a) && a >= 0 && a <= 150);
};

// Safe preference processing
const processPreferences = (prefs: any): Maybe<UserPreferences> => {
  return fromNullable(prefs)
    .filter(p => p && typeof p === 'object')
    .map(p => ({
      theme: p.theme === 'dark' ? 'dark' : 'light',
      notifications: Boolean(p.notifications),
      language: p.language || 'en'
    }));
};

// ============================================================================
// PIPELINE COMPOSITION
// ============================================================================

// Compose multiple safe operations
const createUserPipeline = (rawData: any): Maybe<User> => {
  return extractUserFromInput(rawData)
    .flatMap(user => {
      const processedEmail = processEmail(user.email);
      const processedAge = processAge(user.age);
      const processedPrefs = processPreferences(user.preferences);
      
      return processedEmail.flatMap(email =>
        processedPrefs.map(prefs => ({
          ...user,
          email,
          age: processedAge.fold(() => undefined, age => age),
          preferences: prefs
        }))
      );
    })
    .flatMap(validateUser);
};

// ============================================================================
// REAL-WORLD SCENARIOS
// ============================================================================

const demonstrateApiDataProcessing = () => {
  console.log("\n=== API Data Processing ===");
  
  // Simulate API responses
  const validApiResponse: ApiResponse<any> = {
    status: 200,
    data: {
      id: "123",
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      preferences: { theme: "dark", notifications: true, language: "en" }
    }
  };
  
  const invalidApiResponse: ApiResponse<any> = {
    status: 404,
    error: "User not found"
  };
  
  const malformedApiResponse: ApiResponse<any> = {
    status: 200,
    data: { id: "123" } // Missing required fields
  };
  
  console.log("Valid API response:");
  const validUser = extractUserFromApi(validApiResponse);
  console.log(validUser.fold(
    () => "No user found",
    user => `User: ${user.name} (${user.email})`
  ));
  
  console.log("Invalid API response:");
  const invalidUser = extractUserFromApi(invalidApiResponse);
  console.log(invalidUser.fold(
    () => "No user found",
    user => `User: ${user.name} (${user.email})`
  ));
  
  console.log("Malformed API response:");
  const malformedUser = extractUserFromApi(malformedApiResponse);
  console.log(malformedUser.fold(
    () => "No user found",
    user => `User: ${user.name} (${user.email})`
  ));
};

const demonstrateDatabaseProcessing = () => {
  console.log("\n=== Database Processing ===");
  
  const validDbRecord: DatabaseRecord = {
    id: "456",
    name: "Jane Smith",
    email: "jane@example.com",
    age: 25,
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  };
  
  const invalidDbRecord: DatabaseRecord = {
    id: "789",
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
    // Missing name and email
  };
  
  console.log("Valid database record:");
  const validUser = extractUserFromDb(validDbRecord);
  console.log(validUser.fold(
    () => "No user found",
    user => `User: ${user.name} (${user.email})`
  ));
  
  console.log("Invalid database record:");
  const invalidUser = extractUserFromDb(invalidDbRecord);
  console.log(invalidUser.fold(
    () => "No user found",
    user => `User: ${user.name} (${user.email})`
  ));
};

const demonstrateUserInputProcessing = () => {
  console.log("\n=== User Input Processing ===");
  
  const validInput = {
    id: "user123",
    name: "Alice Johnson",
    email: "alice@example.com",
    age: "28",
    preferences: { theme: "light", notifications: false }
  };
  
  const invalidInput = {
    id: "user456",
    name: "Bob",
    email: "invalid-email",
    age: "200"
  };
  
  const nullInput = null;
  
  console.log("Valid user input:");
  const validUser = processUserProfile(validInput);
  console.log(`Processed user: ${validUser.name} (${validUser.email})`);
  
  console.log("Invalid user input:");
  const invalidUser = processUserProfile(invalidInput);
  console.log(`Processed user: ${invalidUser.name} (${invalidUser.email})`);
  
  console.log("Null input:");
  const nullUser = processUserProfile(nullInput);
  console.log(`Processed user: ${nullUser.name} (${nullUser.email})`);
};

const demonstratePipelineComposition = () => {
  console.log("\n=== Pipeline Composition ===");
  
  const testData = {
    id: "pipeline123",
    name: "Pipeline User",
    email: "pipeline@example.com",
    age: "35",
    preferences: { theme: "dark", notifications: true, language: "es" }
  };
  
  const result = createUserPipeline(testData);
  
  console.log("Pipeline result:");
  result.fold(
    () => console.log("Pipeline failed - no valid user created"),
    user => console.log(`Pipeline success: ${user.name} (${user.email}) with ${user.preferences?.theme} theme`)
  );
};

const demonstrateSafeOperations = () => {
  console.log("\n=== Safe Operations ===");
  
  // Safe email processing
  const emails = ["user@example.com", "invalid-email", "", null, "UPPER@EXAMPLE.COM"];
  
  emails.forEach(email => {
    const processed = processEmail(email);
    console.log(`Email "${email}" -> ${processed.fold(() => "invalid", e => e)}`);
  });
  
  // Safe age processing
  const ages = [25, "30", "invalid", -5, 200, null];
  
  ages.forEach(age => {
    const processed = processAge(age);
    console.log(`Age "${age}" -> ${processed.fold(() => "invalid", a => a.toString())}`);
  });
  
  // Safe preference processing
  const prefs = [
    { theme: "dark", notifications: true },
    { theme: "invalid", notifications: "yes" },
    null,
    {}
  ];
  
  prefs.forEach(pref => {
    const processed = processPreferences(pref);
    console.log(`Preferences ${JSON.stringify(pref)} -> ${processed.fold(() => "invalid", p => JSON.stringify(p))}`);
  });
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = () => {
  console.log("🎯 Maybe-Option Pattern: Safe Data Processing");
  console.log("=".repeat(60));
  
  try {
    demonstrateApiDataProcessing();
    demonstrateDatabaseProcessing();
    demonstrateUserInputProcessing();
    demonstratePipelineComposition();
    demonstrateSafeOperations();
    
    console.log("\n✅ All Maybe-Option pattern examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running Maybe-Option examples:", error);
  }
};

// Run the examples
main();

exit(0);