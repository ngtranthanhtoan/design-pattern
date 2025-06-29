import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

interface ValidationStrategy {
  validate(value: string): ValidationResult;
  getErrorMessage(): string;
  getDescription(): string;
  getSupportedFormats(): string[];
}

// ============================================================================
// CONCRETE STRATEGIES
// ============================================================================

class EmailValidationStrategy implements ValidationStrategy {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  validate(value: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};

    // Basic format validation
    if (!this.emailRegex.test(value)) {
      errors.push("Invalid email format");
      return { isValid: false, errors, warnings, metadata };
    }

    // Extract parts
    const [localPart, domain] = value.split('@');
    metadata.localPart = localPart;
    metadata.domain = domain;

    // Local part validation
    if (localPart.length > 64) {
      errors.push("Local part exceeds 64 characters");
    }

    if (localPart.length === 0) {
      errors.push("Local part cannot be empty");
    }

    // Domain validation
    if (!this.domainRegex.test(domain)) {
      errors.push("Invalid domain format");
    }

    if (domain.length > 253) {
      errors.push("Domain exceeds 253 characters");
    }

    // Common disposable email domains warning
    const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    if (disposableDomains.some(d => domain.toLowerCase().includes(d))) {
      warnings.push("Disposable email domain detected");
    }

    // Common business domains bonus
    const businessDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];
    if (businessDomains.some(d => domain.toLowerCase() === d)) {
      metadata.isCommonDomain = true;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  getErrorMessage(): string {
    return "Please enter a valid email address";
  }

  getDescription(): string {
    return "Email Address Validation";
  }

  getSupportedFormats(): string[] {
    return ["user@domain.com", "user.name@domain.co.uk"];
  }
}

class PhoneValidationStrategy implements ValidationStrategy {
  private readonly phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  private readonly usPhoneRegex = /^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

  validate(value: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};

    // Remove all non-digit characters for basic validation
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length < 10) {
      errors.push("Phone number must have at least 10 digits");
    }

    if (digitsOnly.length > 15) {
      errors.push("Phone number cannot exceed 15 digits");
    }

    // US phone number specific validation
    if (this.usPhoneRegex.test(value)) {
      metadata.country = "US";
      metadata.format = "US Standard";
      
      // Extract area code
      const match = value.match(this.usPhoneRegex);
      if (match) {
        metadata.areaCode = match[2];
        metadata.exchange = match[3];
        metadata.subscriber = match[4];
      }
    } else if (this.phoneRegex.test(digitsOnly)) {
      metadata.country = "International";
      metadata.format = "International";
    } else {
      errors.push("Invalid phone number format");
    }

    // Area code validation for US numbers
    if (metadata.country === "US" && metadata.areaCode) {
      const areaCode = parseInt(metadata.areaCode);
      if (areaCode < 200 || areaCode > 999) {
        warnings.push("Unusual area code detected");
      }
    }

    // Toll-free number detection
    const tollFreeCodes = ['800', '888', '877', '866', '855', '844', '833'];
    if (metadata.areaCode && tollFreeCodes.includes(metadata.areaCode)) {
      metadata.isTollFree = true;
      warnings.push("Toll-free number detected");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  getErrorMessage(): string {
    return "Please enter a valid phone number";
  }

  getDescription(): string {
    return "Phone Number Validation";
  }

  getSupportedFormats(): string[] {
    return ["(555) 123-4567", "+1 555 123 4567", "555-123-4567"];
  }
}

class CreditCardValidationStrategy implements ValidationStrategy {
  private readonly cardPatterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
  };

  validate(value: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};

    // Remove spaces and dashes
    const cleanValue = value.replace(/[\s-]/g, '');

    if (!/^\d+$/.test(cleanValue)) {
      errors.push("Credit card number must contain only digits");
      return { isValid: false, errors, warnings, metadata };
    }

    if (cleanValue.length < 13 || cleanValue.length > 19) {
      errors.push("Credit card number must be between 13 and 19 digits");
      return { isValid: false, errors, warnings, metadata };
    }

    // Luhn algorithm validation
    if (!this.luhnCheck(cleanValue)) {
      errors.push("Invalid credit card number (failed Luhn check)");
      return { isValid: false, errors, warnings, metadata };
    }

    // Identify card type
    const cardType = this.identifyCardType(cleanValue);
    if (cardType) {
      metadata.cardType = cardType;
      metadata.length = cleanValue.length;
      
      // Validate length for specific card types
      const expectedLengths: Record<string, number[]> = {
        visa: [13, 16],
        mastercard: [16],
        amex: [15],
        discover: [16]
      };

      const expectedLength = expectedLengths[cardType as keyof typeof expectedLengths];
      if (expectedLength && !expectedLength.includes(cleanValue.length)) {
        warnings.push(`Expected ${cardType} card to be ${expectedLength.join(' or ')} digits`);
      }
    } else {
      warnings.push("Unknown card type");
    }

    // Check for test numbers
    const testNumbers = ['4111111111111111', '5555555555554444', '378282246310005'];
    if (testNumbers.includes(cleanValue)) {
      metadata.isTestNumber = true;
      warnings.push("Test credit card number detected");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  getErrorMessage(): string {
    return "Please enter a valid credit card number";
  }

  getDescription(): string {
    return "Credit Card Validation";
  }

  getSupportedFormats(): string[] {
    return ["4111 1111 1111 1111", "5555 5555 5555 4444", "3782 822463 10005"];
  }

  private luhnCheck(value: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private identifyCardType(value: string): 'visa' | 'mastercard' | 'amex' | 'discover' | null {
    if (this.cardPatterns.visa.test(value)) return 'visa';
    if (this.cardPatterns.mastercard.test(value)) return 'mastercard';
    if (this.cardPatterns.amex.test(value)) return 'amex';
    if (this.cardPatterns.discover.test(value)) return 'discover';
    return null;
  }
}

class PostalCodeValidationStrategy implements ValidationStrategy {
  private readonly patterns = {
    us: /^\d{5}(-\d{4})?$/,
    uk: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    canada: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    germany: /^\d{5}$/,
    france: /^\d{5}$/
  };

  validate(value: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};

    // Try to identify country and validate
    let countryIdentified = false;

    // US ZIP code
    if (this.patterns.us.test(value)) {
      metadata.country = "US";
      metadata.format = "ZIP Code";
      countryIdentified = true;
      
      const zipCode = value.split('-')[0];
      metadata.zipCode = zipCode;
      metadata.extension = value.includes('-') ? value.split('-')[1] : null;
    }
    // UK postcode
    else if (this.patterns.uk.test(value)) {
      metadata.country = "UK";
      metadata.format = "Postcode";
      countryIdentified = true;
    }
    // Canadian postal code
    else if (this.patterns.canada.test(value)) {
      metadata.country = "Canada";
      metadata.format = "Postal Code";
      countryIdentified = true;
    }
    // German postal code
    else if (this.patterns.germany.test(value)) {
      metadata.country = "Germany";
      metadata.format = "PLZ";
      countryIdentified = true;
    }
    // French postal code
    else if (this.patterns.france.test(value)) {
      metadata.country = "France";
      metadata.format = "Code Postal";
      countryIdentified = true;
    }

    if (!countryIdentified) {
      errors.push("Invalid postal code format");
      return { isValid: false, errors, warnings, metadata };
    }

    // Additional validations for US ZIP codes
    if (metadata.country === "US") {
      const zipCode = parseInt(metadata.zipCode);
      
      // Check for valid ZIP code ranges
      if (zipCode < 501 || zipCode > 99950) {
        warnings.push("ZIP code outside normal range");
      }

      // Check for special ZIP codes
      if (zipCode >= 10000 && zipCode <= 19999) {
        metadata.region = "New York";
      } else if (zipCode >= 90000 && zipCode <= 99999) {
        metadata.region = "California";
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  getErrorMessage(): string {
    return "Please enter a valid postal code";
  }

  getDescription(): string {
    return "Postal Code Validation";
  }

  getSupportedFormats(): string[] {
    return ["12345", "12345-6789", "SW1A 1AA", "A1A 1A1"];
  }
}

// ============================================================================
// CONTEXT CLASS
// ============================================================================

class ValidationContext {
  private strategy: ValidationStrategy;

  constructor(strategy: ValidationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: ValidationStrategy): void {
    this.strategy = strategy;
  }

  validate(value: string): ValidationResult {
    console.log(`Validating using: ${this.strategy.getDescription()}`);
    console.log(`Value: "${value}"`);
    console.log(`Supported formats: ${this.strategy.getSupportedFormats().join(', ')}`);
    
    const result = this.strategy.validate(value);
    
    console.log(`Result: ${result.isValid ? "VALID" : "INVALID"}`);
    if (result.errors.length > 0) {
      console.log(`Errors: ${result.errors.join(', ')}`);
    }
    if (result.warnings.length > 0) {
      console.log(`Warnings: ${result.warnings.join(', ')}`);
    }
    if (result.metadata && Object.keys(result.metadata).length > 0) {
      console.log(`Metadata:`, result.metadata);
    }
    console.log("---");

    return result;
  }

  getCurrentStrategy(): ValidationStrategy {
    return this.strategy;
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

function demonstrateValidationStrategies(): void {
  console.log("=== DATA VALIDATION STRATEGY DEMO ===\n");

  const validator = new ValidationContext(new EmailValidationStrategy());

  // Test Email Validation
  console.log("1. Testing Email Validation:");
  const emailTests = [
    "user@example.com",
    "invalid-email",
    "user.name@company.co.uk",
    "test@tempmail.com"
  ];

  emailTests.forEach(email => {
    validator.validate(email);
  });

  // Test Phone Validation
  console.log("2. Testing Phone Validation:");
  validator.setStrategy(new PhoneValidationStrategy());
  const phoneTests = [
    "(555) 123-4567",
    "555-123-4567",
    "+1 555 123 4567",
    "invalid-phone"
  ];

  phoneTests.forEach(phone => {
    validator.validate(phone);
  });

  // Test Credit Card Validation
  console.log("3. Testing Credit Card Validation:");
  validator.setStrategy(new CreditCardValidationStrategy());
  const cardTests = [
    "4111111111111111",
    "5555555555554444",
    "378282246310005",
    "1234567890123456"
  ];

  cardTests.forEach(card => {
    validator.validate(card);
  });

  // Test Postal Code Validation
  console.log("4. Testing Postal Code Validation:");
  validator.setStrategy(new PostalCodeValidationStrategy());
  const postalTests = [
    "12345",
    "12345-6789",
    "SW1A 1AA",
    "A1A 1A1",
    "invalid"
  ];

  postalTests.forEach(postal => {
    validator.validate(postal);
  });
}

function demonstrateDynamicValidation(): void {
  console.log("=== DYNAMIC VALIDATION SELECTION ===\n");

  const validator = new ValidationContext(new EmailValidationStrategy());

  // Simulate form validation
  const formFields = [
    { name: "email", value: "user@example.com", type: "email" },
    { name: "phone", value: "(555) 123-4567", type: "phone" },
    { name: "card", value: "4111111111111111", type: "creditcard" },
    { name: "zip", value: "12345", type: "postalcode" }
  ];

  formFields.forEach(field => {
    console.log(`Validating field: ${field.name} (${field.type})`);
    
    // Select strategy based on field type
    switch (field.type) {
      case "email":
        validator.setStrategy(new EmailValidationStrategy());
        break;
      case "phone":
        validator.setStrategy(new PhoneValidationStrategy());
        break;
      case "creditcard":
        validator.setStrategy(new CreditCardValidationStrategy());
        break;
      case "postalcode":
        validator.setStrategy(new PostalCodeValidationStrategy());
        break;
    }

    const result = validator.validate(field.value);
    
    if (!result.isValid) {
      console.log(`❌ ${field.name}: ${validator.getCurrentStrategy().getErrorMessage()}`);
    } else {
      console.log(`✅ ${field.name}: Valid`);
    }
  });
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

function testValidationStrategies(): void {
  console.log("=== VALIDATION STRATEGY TESTS ===\n");

  const testCases = [
    {
      type: "email",
      strategy: new EmailValidationStrategy(),
      tests: [
        { value: "test@example.com", expected: true },
        { value: "invalid-email", expected: false },
        { value: "user.name@company.co.uk", expected: true }
      ]
    },
    {
      type: "phone",
      strategy: new PhoneValidationStrategy(),
      tests: [
        { value: "(555) 123-4567", expected: true },
        { value: "invalid-phone", expected: false },
        { value: "+1 555 123 4567", expected: true }
      ]
    },
    {
      type: "creditcard",
      strategy: new CreditCardValidationStrategy(),
      tests: [
        { value: "4111111111111111", expected: true },
        { value: "1234567890123456", expected: false },
        { value: "5555555555554444", expected: true }
      ]
    },
    {
      type: "postalcode",
      strategy: new PostalCodeValidationStrategy(),
      tests: [
        { value: "12345", expected: true },
        { value: "invalid", expected: false },
        { value: "12345-6789", expected: true }
      ]
    }
  ];

  testCases.forEach((testCase, testIndex) => {
    console.log(`Test ${testIndex + 1}: ${testCase.type} validation`);
    
    testCase.tests.forEach((test, subIndex) => {
      const result = testCase.strategy.validate(test.value);
      const passed = result.isValid === test.expected;
      
      console.log(`  Test ${subIndex + 1}: "${test.value}" - ${passed ? "✅ PASS" : "❌ FAIL"}`);
      if (!passed) {
        console.log(`    Expected: ${test.expected}, Got: ${result.isValid}`);
      }
    });
    console.log("");
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main(): void {
  try {
    demonstrateValidationStrategies();
    demonstrateDynamicValidation();
    testValidationStrategies();
    
    console.log("=== DATA VALIDATION STRATEGY PATTERN COMPLETED ===");
  } catch (error) {
    console.error("Error in validation demo:", error);
  }
}

// Run the demonstration
main();

exit(0); 