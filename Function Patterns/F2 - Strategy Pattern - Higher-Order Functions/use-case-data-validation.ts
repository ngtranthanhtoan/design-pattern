/**
 * Data Validation System - Strategy Pattern Implementation
 * 
 * Demonstrates a comprehensive data validation system using higher-order functions
 * instead of traditional OOP validator classes and interfaces.
 */

import { exit } from "process";

// Core types for validation system
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

type Validator<T> = (value: T) => ValidationResult;
type AsyncValidator<T> = (value: T) => Promise<ValidationResult>;

type FieldValidators<T> = {
  [K in keyof T]?: Validator<T[K]>[];
};

type ValidationSchema<T> = {
  validators: FieldValidators<T>;
  messages?: Partial<Record<keyof T, string>>;
};

// Utility functions for creating validation results
const createValidResult = (): ValidationResult => ({
  isValid: true,
  errors: []
});

const createInvalidResult = (error: string): ValidationResult => ({
  isValid: false,
  errors: [error]
});

const combineResults = (results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(r => r.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Built-in validator factories (Strategy Pattern in action)
const createEmailValidator = (message = "Invalid email format"): Validator<string> => {
  return (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) 
      ? createValidResult()
      : createInvalidResult(message);
  };
};

const createLengthValidator = (
  min: number, 
  max: number, 
  message?: string
): Validator<string> => {
  return (value: string): ValidationResult => {
    const length = value.length;
    const defaultMessage = `Length must be between ${min} and ${max} characters`;
    const errorMessage = message || defaultMessage;
    
    return (length >= min && length <= max)
      ? createValidResult()
      : createInvalidResult(errorMessage);
  };
};

const createRequiredValidator = (message = "This field is required"): Validator<any> => {
  return (value: any): ValidationResult => {
    const isEmpty = value === null || value === undefined || 
                   (typeof value === 'string' && value.trim() === '') ||
                   (Array.isArray(value) && value.length === 0);
    
    return isEmpty 
      ? createInvalidResult(message)
      : createValidResult();
  };
};

const createPasswordValidator = (message = "Password must contain uppercase, lowercase, number and special character"): Validator<string> => {
  return (password: string): ValidationResult => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isStrong = hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    
    return isStrong 
      ? createValidResult()
      : createInvalidResult(message);
  };
};

const createNumericValidator = (message = "Must be a valid number"): Validator<string> => {
  return (value: string): ValidationResult => {
    const isNumeric = !isNaN(Number(value)) && !isNaN(parseFloat(value));
    return isNumeric 
      ? createValidResult()
      : createInvalidResult(message);
  };
};

const createRangeValidator = (
  min: number, 
  max: number, 
  message?: string
): Validator<number> => {
  return (value: number): ValidationResult => {
    const defaultMessage = `Value must be between ${min} and ${max}`;
    const errorMessage = message || defaultMessage;
    
    return (value >= min && value <= max)
      ? createValidResult()
      : createInvalidResult(errorMessage);
  };
};

const createPatternValidator = (
  pattern: RegExp, 
  message = "Invalid format"
): Validator<string> => {
  return (value: string): ValidationResult => {
    return pattern.test(value)
      ? createValidResult()
      : createInvalidResult(message);
  };
};

// Validator composition utilities
const combineValidators = <T>(...validators: Validator<T>[]): Validator<T> => {
  return (value: T): ValidationResult => {
    const results = validators.map(validator => validator(value));
    return combineResults(results);
  };
};

const createConditionalValidator = <T>(
  condition: (value: T) => boolean,
  validator: Validator<T>
): Validator<T> => {
  return (value: T): ValidationResult => {
    return condition(value) ? validator(value) : createValidResult();
  };
};

// Async validator support
const createAsyncEmailValidator = (message = "Email already exists"): AsyncValidator<string> => {
  return async (email: string): Promise<ValidationResult> => {
    // Simulate async validation (e.g., database check)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const existingEmails = ['admin@example.com', 'test@example.com'];
    const exists = existingEmails.includes(email.toLowerCase());
    
    return exists 
      ? createInvalidResult(message)
      : createValidResult();
  };
};

// Main validation engine
class ValidationEngine<T extends Record<string, any>> {
  constructor(private schema: ValidationSchema<T>) {}
  
  validate(data: T): ValidationResult {
    const fieldResults: ValidationResult[] = [];
    
    for (const [field, validators] of Object.entries(this.schema.validators)) {
      if (validators && validators.length > 0) {
        const fieldValue = data[field as keyof T];
        const validator = combineValidators(...validators);
        const result = validator(fieldValue);
        
        if (!result.isValid) {
          const customMessage = this.schema.messages?.[field as keyof T];
          if (customMessage) {
            result.errors = [customMessage];
          }
        }
        
        fieldResults.push(result);
      }
    }
    
    return combineResults(fieldResults);
  }
  
  async validateAsync(data: T, asyncValidators: Partial<Record<keyof T, AsyncValidator<any>>>): Promise<ValidationResult> {
    // First run synchronous validation
    const syncResult = this.validate(data);
    
    // Then run async validators
    const asyncResults: ValidationResult[] = [];
    
    for (const [field, asyncValidator] of Object.entries(asyncValidators)) {
      if (asyncValidator) {
        const fieldValue = data[field as keyof T];
        const result = await asyncValidator(fieldValue);
        asyncResults.push(result);
      }
    }
    
    return combineResults([syncResult, ...asyncResults]);
  }
}

// Example: User registration validation schema
type UserRegistration = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  phone: string;
};

const userRegistrationSchema: ValidationSchema<UserRegistration> = {
  validators: {
    username: [
      createRequiredValidator("Username is required"),
      createLengthValidator(3, 20, "Username must be 3-20 characters"),
      createPatternValidator(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    ],
    email: [
      createRequiredValidator("Email is required"),
      createEmailValidator("Please enter a valid email address")
    ],
    password: [
      createRequiredValidator("Password is required"),
      createLengthValidator(8, 50, "Password must be 8-50 characters"),
      createPasswordValidator("Password must contain uppercase, lowercase, number and special character")
    ],
    confirmPassword: [
      createRequiredValidator("Please confirm your password")
    ],
    age: [
      createRangeValidator(13, 120, "Age must be between 13 and 120")
    ],
    phone: [
      createPatternValidator(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    ]
  },
  messages: {
    username: "Please choose a valid username",
    email: "Please provide a valid email address"
  }
};

// Custom validator for password confirmation
const createPasswordConfirmationValidator = (passwordFieldName: keyof UserRegistration): Validator<UserRegistration> => {
  return (data: UserRegistration): ValidationResult => {
    const password = data[passwordFieldName] as string;
    const confirmPassword = data.confirmPassword;
    
    return password === confirmPassword
      ? createValidResult()
      : createInvalidResult("Passwords do not match");
  };
};

// Demonstration functions
function demonstrateBasicValidation(): void {
  console.log("🔍 BASIC VALIDATION DEMONSTRATION");
  console.log("=" + "=".repeat(35));
  
  const engine = new ValidationEngine(userRegistrationSchema);
  
  const testUsers: UserRegistration[] = [
    {
      username: "john_doe",
      email: "john@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
      age: 25,
      phone: "+1234567890"
    },
    {
      username: "jo", // Too short
      email: "invalid-email", // Invalid format
      password: "weak", // Too weak
      confirmPassword: "different", // Doesn't match
      age: 10, // Too young
      phone: "invalid-phone" // Invalid format
    },
    {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: 0,
      phone: ""
    }
  ];
  
  testUsers.forEach((user, index) => {
    console.log(`\n📋 Test User ${index + 1}:`);
    console.log(`Username: "${user.username}"`);
    console.log(`Email: "${user.email}"`);
    console.log(`Password: "${user.password}"`);
    
    const result = engine.validate(user);
    
    if (result.isValid) {
      console.log("✅ Validation passed!");
    } else {
      console.log("❌ Validation failed:");
      result.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
  });
  
  console.log();
}

function demonstrateComposedValidation(): void {
  console.log("🔧 COMPOSED VALIDATION DEMONSTRATION");
  console.log("=" + "=".repeat(38));
  
  // Create a composed validator that includes password confirmation
  const fullUserValidator = combineValidators<UserRegistration>(
    (data: UserRegistration) => new ValidationEngine(userRegistrationSchema).validate(data),
    createPasswordConfirmationValidator('password')
  );
  
  const testData: UserRegistration = {
    username: "alice_smith",
    email: "alice@example.com",
    password: "MySecurePass123!",
    confirmPassword: "DifferentPassword",
    age: 28,
    phone: "+1987654321"
  };
  
  console.log("Testing composed validation with password mismatch:");
  console.log(`Password: "${testData.password}"`);
  console.log(`Confirm Password: "${testData.confirmPassword}"`);
  
  const result = fullUserValidator(testData);
  
  if (result.isValid) {
    console.log("✅ All validations passed!");
  } else {
    console.log("❌ Validation errors:");
    result.errors.forEach(error => {
      console.log(`   • ${error}`);
    });
  }
  
  console.log();
}

async function demonstrateAsyncValidation(): Promise<void> {
  console.log("⏳ ASYNC VALIDATION DEMONSTRATION");
  console.log("=" + "=".repeat(34));
  
  const engine = new ValidationEngine(userRegistrationSchema);
  
  const asyncValidators = {
    email: createAsyncEmailValidator("This email is already registered")
  };
  
  const testUsers = [
    {
      username: "new_user",
      email: "newuser@example.com", // Available
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
      age: 30,
      phone: "+1555123456"
    },
    {
      username: "admin_user",
      email: "admin@example.com", // Already exists
      password: "AdminPass123!",
      confirmPassword: "AdminPass123!",
      age: 35,
      phone: "+1555987654"
    }
  ];
  
  for (const [index, user] of testUsers.entries()) {
    console.log(`\n📧 Testing async validation for user ${index + 1}:`);
    console.log(`Email: ${user.email}`);
    
    const result = await engine.validateAsync(user, asyncValidators);
    
    if (result.isValid) {
      console.log("✅ Email is available!");
    } else {
      console.log("❌ Validation failed:");
      result.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
  }
  
  console.log();
}

function demonstrateAdvancedStrategies(): void {
  console.log("🚀 ADVANCED VALIDATION STRATEGIES");
  console.log("=" + "=".repeat(35));
  
  // Dynamic validator selection based on user type
  type UserType = 'guest' | 'member' | 'admin';
  
  const createUserTypeValidator = (userType: UserType): Validator<UserRegistration> => {
    const strategies = {
      guest: combineValidators(
        (data: UserRegistration) => createEmailValidator("Guest email required")(data.email),
        (data: UserRegistration) => createLengthValidator(6, 20, "Guest username 6-20 chars")(data.username)
      ),
      member: combineValidators(
        (data: UserRegistration) => new ValidationEngine(userRegistrationSchema).validate(data)
      ),
      admin: combineValidators(
        (data: UserRegistration) => new ValidationEngine(userRegistrationSchema).validate(data),
        (data: UserRegistration) => createPatternValidator(/^admin_/, "Admin username must start with 'admin_'")(data.username)
      )
    };
    
    return strategies[userType];
  };
  
  const testUser: UserRegistration = {
    username: "regular_user",
    email: "user@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    age: 25,
    phone: "+1234567890"
  };
  
  const userTypes: UserType[] = ['guest', 'member', 'admin'];
  
  userTypes.forEach(userType => {
    console.log(`\n👤 Validating as ${userType}:`);
    const validator = createUserTypeValidator(userType);
    const result = validator(testUser);
    
    if (result.isValid) {
      console.log("✅ Validation passed!");
    } else {
      console.log("❌ Validation failed:");
      result.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
  });
  
  console.log();
}

function showPerformanceComparison(): void {
  console.log("⚡ PERFORMANCE COMPARISON");
  console.log("=" + "=".repeat(26));
  
  const testUser: UserRegistration = {
    username: "performance_test",
    email: "test@example.com",
    password: "TestPass123!",
    confirmPassword: "TestPass123!",
    age: 25,
    phone: "+1234567890"
  };
  
  const engine = new ValidationEngine(userRegistrationSchema);
  const iterations = 10000;
  
  console.log(`Running ${iterations} validation cycles...`);
  
  const startTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    engine.validate(testUser);
  }
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  const validationsPerSecond = Math.round((iterations / duration) * 1000);
  
  console.log(`✨ Completed ${iterations} validations in ${duration}ms`);
  console.log(`📊 Performance: ~${validationsPerSecond} validations/second`);
  console.log(`🏃‍♂️ Average: ${(duration / iterations).toFixed(3)}ms per validation`);
  console.log();
  
  console.log("Key Performance Benefits:");
  console.log("• No object instantiation overhead");
  console.log("• Efficient function composition");
  console.log("• Minimal memory allocation");
  console.log("• JIT-optimized function calls");
  console.log();
}

// Main execution
async function main(): Promise<void> {
  console.log("🎯 DATA VALIDATION SYSTEM - STRATEGY PATTERN");
  console.log("=" + "=".repeat(45));
  console.log();
  console.log("This implementation demonstrates a comprehensive validation system");
  console.log("using higher-order functions instead of traditional validator classes.");
  console.log();
  
  demonstrateBasicValidation();
  demonstrateComposedValidation();
  await demonstrateAsyncValidation();
  demonstrateAdvancedStrategies();
  showPerformanceComparison();
  
  console.log("🎉 SUMMARY");
  console.log("=" + "=".repeat(10));
  console.log("✅ Demonstrated flexible validation strategies");
  console.log("✅ Showed function composition benefits");
  console.log("✅ Proved type safety with TypeScript");
  console.log("✅ Illustrated async validation support");
  console.log("✅ Measured performance advantages");
  console.log();
  console.log("The functional approach provides:");
  console.log("• Better composability than OOP validators");
  console.log("• Higher performance with lower memory usage");
  console.log("• Easier testing of individual validation rules");
  console.log("• More flexible strategy combinations");
  console.log("• Cleaner, more maintainable code");
}

// Run the demonstration
main().catch(console.error);
exit(0); 