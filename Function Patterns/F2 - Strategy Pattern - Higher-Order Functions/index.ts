/**
 * Strategy Pattern - Higher-Order Functions
 * 
 * Demonstrates how to implement the Strategy pattern using higher-order functions
 * instead of traditional OOP interfaces and classes.
 */

import { exit } from "process";

// Strategy function types
type Validator<T> = (value: T) => boolean;
type AsyncValidator<T> = (value: T) => Promise<boolean>;
type Transformer<T, R> = (input: T) => R;
type Comparator<T> = (a: T, b: T) => number;

// Example: Simple validation strategies
const emailValidator: Validator<string> = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const lengthValidator = (minLength: number, maxLength: number): Validator<string> => {
  return (value: string): boolean => {
    return value.length >= minLength && value.length <= maxLength;
  };
};

const numericValidator: Validator<string> = (value: string): boolean => {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
};

// Example: Sorting strategies
const numericSort: Comparator<number> = (a: number, b: number): number => a - b;
const alphabeticSort: Comparator<string> = (a: string, b: string): number => a.localeCompare(b);
const dateSort: Comparator<Date> = (a: Date, b: Date): number => a.getTime() - b.getTime();

// Example: Transformation strategies
const toUpperCase: Transformer<string, string> = (str: string): string => str.toUpperCase();
const toLowerCase: Transformer<string, string> = (str: string): string => str.toLowerCase();
const addPrefix = (prefix: string): Transformer<string, string> => 
  (str: string): string => `${prefix}${str}`;

// Higher-order functions that use strategies
const validateWithStrategy = <T>(validator: Validator<T>, value: T): boolean => {
  return validator(value);
};

const sortWithStrategy = <T>(items: T[], comparator: Comparator<T>): T[] => {
  return [...items].sort(comparator);
};

const transformWithStrategy = <T, R>(items: T[], transformer: Transformer<T, R>): R[] => {
  return items.map(transformer);
};

// Strategy composition example
const combineValidators = <T>(...validators: Validator<T>[]): Validator<T> => {
  return (value: T): boolean => {
    return validators.every(validator => validator(value));
  };
};

// Demonstration functions
function demonstrateValidationStrategies(): void {
  console.log("🔍 VALIDATION STRATEGIES");
  console.log("=" + "=".repeat(25));
  
  const testData = [
    "test@example.com",
    "invalid-email",
    "user@domain.co.uk",
    "not-an-email"
  ];
  
  console.log("Email validation results:");
  testData.forEach(email => {
    const isValid = validateWithStrategy(emailValidator, email);
    console.log(`  ${email}: ${isValid ? '✅' : '❌'}`);
  });
  
  console.log("\nLength validation (5-20 characters):");
  const lengthCheck = lengthValidator(5, 20);
  ["hello", "hi", "this is a very long string", "medium"].forEach(text => {
    const isValid = validateWithStrategy(lengthCheck, text);
    console.log(`  "${text}": ${isValid ? '✅' : '❌'}`);
  });
  
  console.log("\nCombined validation (email + length):");
  const combinedValidator = combineValidators(
    emailValidator,
    lengthValidator(5, 50)
  );
  
  ["test@example.com", "a@b.co", "very-long-email-address@example-domain.com"].forEach(email => {
    const isValid = validateWithStrategy(combinedValidator, email);
    console.log(`  ${email}: ${isValid ? '✅' : '❌'}`);
  });
  
  console.log();
}

function demonstrateSortingStrategies(): void {
  console.log("📊 SORTING STRATEGIES");
  console.log("=" + "=".repeat(20));
  
  const numbers = [64, 34, 25, 12, 22, 11, 90];
  const strings = ["banana", "apple", "cherry", "date"];
  const dates = [
    new Date('2023-01-15'),
    new Date('2023-03-10'),
    new Date('2023-02-20')
  ];
  
  console.log("Original numbers:", numbers);
  console.log("Sorted numbers:", sortWithStrategy(numbers, numericSort));
  console.log();
  
  console.log("Original strings:", strings);
  console.log("Sorted strings:", sortWithStrategy(strings, alphabeticSort));
  console.log();
  
  console.log("Original dates:", dates.map(d => d.toISOString().split('T')[0]));
  console.log("Sorted dates:", sortWithStrategy(dates, dateSort).map(d => d.toISOString().split('T')[0]));
  console.log();
}

function demonstrateTransformationStrategies(): void {
  console.log("🔄 TRANSFORMATION STRATEGIES");
  console.log("=" + "=".repeat(30));
  
  const names = ["john", "jane", "bob", "alice"];
  
  console.log("Original names:", names);
  console.log("Uppercase:", transformWithStrategy(names, toUpperCase));
  console.log("With prefix 'Mr. ':", transformWithStrategy(names, addPrefix("Mr. ")));
  
  // Chain transformations
  const chainedTransform = (str: string) => addPrefix("Dr. ")(toUpperCase(str));
  console.log("Chained (uppercase + prefix):", transformWithStrategy(names, chainedTransform));
  console.log();
}

function demonstrateAdvancedStrategies(): void {
  console.log("🚀 ADVANCED STRATEGY PATTERNS");
  console.log("=" + "=".repeat(32));
  
  // Strategy selection based on conditions
  type StrategySelector<T, R> = {
    condition: (input: T) => boolean;
    strategy: (input: T) => R;
  };
  
  const selectStrategy = <T, R>(
    selectors: StrategySelector<T, R>[],
    fallback: (input: T) => R
  ) => (input: T): R => {
    const selector = selectors.find(s => s.condition(input));
    return selector ? selector.strategy(input) : fallback(input);
  };
  
  const numberFormatter = selectStrategy<number, string>([
    {
      condition: (n) => n > 1000000,
      strategy: (n) => `${(n / 1000000).toFixed(1)}M`
    },
    {
      condition: (n) => n > 1000,
      strategy: (n) => `${(n / 1000).toFixed(1)}K`
    }
  ], (n) => n.toString());
  
  const testNumbers = [42, 1500, 2500000];
  console.log("Number formatting with conditional strategies:");
  testNumbers.forEach(num => {
    console.log(`  ${num} → ${numberFormatter(num)}`);
  });
  
  console.log();
}

function showUsageExamples(): void {
  console.log("💡 PRACTICAL USAGE EXAMPLES");
  console.log("=" + "=".repeat(30));
  
  console.log("1. Creating reusable validators:");
  console.log(`   const emailCheck = emailValidator;`);
  console.log(`   const strongPassword = lengthValidator(8, 128);`);
  console.log(`   const isValid = emailCheck("user@example.com"); // true`);
  console.log();
  
  console.log("2. Composing multiple strategies:");
  console.log(`   const userValidator = combineValidators(`);
  console.log(`     emailValidator,`);
  console.log(`     lengthValidator(5, 100)`);
  console.log(`   );`);
  console.log();
  
  console.log("3. Dynamic strategy selection:");
  console.log(`   const processor = amount > 1000 ? premiumProcessor : standardProcessor;`);
  console.log(`   const result = processor(paymentData);`);
  console.log();
  
  console.log("4. Strategy factories:");
  console.log(`   const createRangeValidator = (min, max) => (value) => value >= min && value <= max;`);
  console.log(`   const ageValidator = createRangeValidator(18, 120);`);
  console.log();
}

// Main execution
function main(): void {
  console.log("🎯 STRATEGY PATTERN - HIGHER-ORDER FUNCTIONS");
  console.log("=" + "=".repeat(45));
  console.log();
  console.log("This pattern replaces traditional strategy interfaces with functions");
  console.log("that can be passed as parameters, composed, and executed dynamically.");
  console.log();
  
  demonstrateValidationStrategies();
  demonstrateSortingStrategies();
  demonstrateTransformationStrategies();
  demonstrateAdvancedStrategies();
  showUsageExamples();
  
  console.log("🚀 COMPREHENSIVE EXAMPLE");
  console.log("=" + "=".repeat(23));
  console.log("Run the data validation system:");
  console.log("npm run functional:strategy:validation");
  console.log();
  console.log("Key Benefits:");
  console.log("• No classes or interfaces needed");
  console.log("• Easy function composition");
  console.log("• Type-safe with TypeScript");
  console.log("• Lightweight and performant");
  console.log("• Highly testable");
}

// Run the demonstration
main();
exit(0); 