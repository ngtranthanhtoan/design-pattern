import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  fees: number;
  processingTime: number;
  message: string;
}

interface PaymentStrategy {
  process(amount: number, currency: string): PaymentResult;
  getFees(): number;
  getProcessingTime(): number;
  getDescription(): string;
}

// ============================================================================
// CONCRETE STRATEGIES
// ============================================================================

class CreditCardStrategy implements PaymentStrategy {
  private readonly feePercentage = 0.029; // 2.9%
  private readonly fixedFee = 0.30; // $0.30

  process(amount: number, currency: string): PaymentResult {
    const fees = this.calculateFees(amount);
    const processingTime = this.getProcessingTime();
    
    // Simulate processing delay
    const startTime = Date.now();
    while (Date.now() - startTime < processingTime) {
      // Simulate processing
    }

    return {
      success: Math.random() > 0.05, // 95% success rate
      transactionId: `CC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      fees,
      processingTime,
      message: "Credit card payment processed"
    };
  }

  getFees(): number {
    return this.feePercentage;
  }

  getProcessingTime(): number {
    return 2000; // 2 seconds
  }

  getDescription(): string {
    return "Credit Card (Visa, MasterCard, Amex)";
  }

  private calculateFees(amount: number): number {
    return (amount * this.feePercentage) + this.fixedFee;
  }
}

class PayPalStrategy implements PaymentStrategy {
  private readonly feePercentage = 0.0249; // 2.49%
  private readonly fixedFee = 0.49; // $0.49

  process(amount: number, currency: string): PaymentResult {
    const fees = this.calculateFees(amount);
    const processingTime = this.getProcessingTime();
    
    // Simulate processing delay
    const startTime = Date.now();
    while (Date.now() - startTime < processingTime) {
      // Simulate processing
    }

    return {
      success: Math.random() > 0.02, // 98% success rate
      transactionId: `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      fees,
      processingTime,
      message: "PayPal payment processed"
    };
  }

  getFees(): number {
    return this.feePercentage;
  }

  getProcessingTime(): number {
    return 1500; // 1.5 seconds
  }

  getDescription(): string {
    return "PayPal";
  }

  private calculateFees(amount: number): number {
    return (amount * this.feePercentage) + this.fixedFee;
  }
}

class CryptoStrategy implements PaymentStrategy {
  private readonly feePercentage = 0.01; // 1%
  private readonly networkFee = 0.001; // $0.001

  process(amount: number, currency: string): PaymentResult {
    const fees = this.calculateFees(amount);
    const processingTime = this.getProcessingTime();
    
    // Simulate blockchain processing delay
    const startTime = Date.now();
    while (Date.now() - startTime < processingTime) {
      // Simulate blockchain confirmation
    }

    return {
      success: Math.random() > 0.01, // 99% success rate
      transactionId: `CRYPTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      fees,
      processingTime,
      message: "Cryptocurrency payment processed"
    };
  }

  getFees(): number {
    return this.feePercentage;
  }

  getProcessingTime(): number {
    return 5000; // 5 seconds (blockchain confirmation)
  }

  getDescription(): string {
    return "Cryptocurrency (Bitcoin, Ethereum)";
  }

  private calculateFees(amount: number): number {
    return (amount * this.feePercentage) + this.networkFee;
  }
}

class BankTransferStrategy implements PaymentStrategy {
  private readonly feePercentage = 0.005; // 0.5%
  private readonly fixedFee = 1.50; // $1.50

  process(amount: number, currency: string): PaymentResult {
    const fees = this.calculateFees(amount);
    const processingTime = this.getProcessingTime();
    
    // Simulate bank processing delay
    const startTime = Date.now();
    while (Date.now() - startTime < processingTime) {
      // Simulate bank processing
    }

    return {
      success: Math.random() > 0.03, // 97% success rate
      transactionId: `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      fees,
      processingTime,
      message: "Bank transfer processed"
    };
  }

  getFees(): number {
    return this.feePercentage;
  }

  getProcessingTime(): number {
    return 10000; // 10 seconds (bank processing)
  }

  getDescription(): string {
    return "Bank Transfer (ACH, Wire Transfer)";
  }

  private calculateFees(amount: number): number {
    return (amount * this.feePercentage) + this.fixedFee;
  }
}

// ============================================================================
// CONTEXT CLASS
// ============================================================================

class PaymentProcessor {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  processPayment(amount: number, currency: string = "USD"): PaymentResult {
    console.log(`Processing payment using: ${this.strategy.getDescription()}`);
    console.log(`Amount: ${currency} ${amount.toFixed(2)}`);
    console.log(`Fees: ${(this.strategy.getFees() * 100).toFixed(2)}% + fixed fee`);
    console.log(`Expected processing time: ${this.strategy.getProcessingTime()}ms`);
    console.log("Processing...");

    const result = this.strategy.process(amount, currency);
    
    console.log(`Result: ${result.success ? "SUCCESS" : "FAILED"}`);
    console.log(`Transaction ID: ${result.transactionId}`);
    console.log(`Total fees: ${currency} ${result.fees.toFixed(2)}`);
    console.log(`Actual processing time: ${result.processingTime}ms`);
    console.log(`Message: ${result.message}`);
    console.log("---");

    return result;
  }

  getCurrentStrategy(): PaymentStrategy {
    return this.strategy;
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

function demonstratePaymentStrategies(): void {
  console.log("=== PAYMENT PROCESSING STRATEGY DEMO ===\n");

  const processor = new PaymentProcessor(new CreditCardStrategy());
  const testAmount = 100.00;

  // Test Credit Card Strategy
  console.log("1. Testing Credit Card Strategy:");
  processor.processPayment(testAmount);

  // Test PayPal Strategy
  console.log("2. Testing PayPal Strategy:");
  processor.setStrategy(new PayPalStrategy());
  processor.processPayment(testAmount);

  // Test Crypto Strategy
  console.log("3. Testing Cryptocurrency Strategy:");
  processor.setStrategy(new CryptoStrategy());
  processor.processPayment(testAmount);

  // Test Bank Transfer Strategy
  console.log("4. Testing Bank Transfer Strategy:");
  processor.setStrategy(new BankTransferStrategy());
  processor.processPayment(testAmount);
}

function demonstrateStrategyComparison(): void {
  console.log("=== STRATEGY COMPARISON ===\n");

  const strategies = [
    new CreditCardStrategy(),
    new PayPalStrategy(),
    new CryptoStrategy(),
    new BankTransferStrategy()
  ];

  const testAmount = 1000.00;

  console.log("Payment Method Comparison (for $1000):");
  console.log("Method\t\t\tFees\t\tProcessing Time\tSuccess Rate");
  console.log("-------\t\t\t----\t\t---------------\t------------");

  strategies.forEach(strategy => {
    const fees = (testAmount * strategy.getFees()) + 
                 (strategy instanceof CreditCardStrategy ? 0.30 : 
                  strategy instanceof PayPalStrategy ? 0.49 :
                  strategy instanceof CryptoStrategy ? 0.001 : 1.50);
    
    const successRate = strategy instanceof CreditCardStrategy ? "95%" :
                       strategy instanceof PayPalStrategy ? "98%" :
                       strategy instanceof CryptoStrategy ? "99%" : "97%";

    console.log(`${strategy.getDescription().padEnd(20)}\t$${fees.toFixed(2)}\t\t${strategy.getProcessingTime()}ms\t\t${successRate}`);
  });
}

function demonstrateDynamicStrategySelection(): void {
  console.log("=== DYNAMIC STRATEGY SELECTION ===\n");

  const processor = new PaymentProcessor(new CreditCardStrategy());

  // Simulate different scenarios
  const scenarios = [
    { amount: 50, description: "Small purchase", preferredMethod: "PayPal" },
    { amount: 500, description: "Medium purchase", preferredMethod: "Credit Card" },
    { amount: 5000, description: "Large purchase", preferredMethod: "Bank Transfer" },
    { amount: 100, description: "Tech-savvy customer", preferredMethod: "Crypto" }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.description} ($${scenario.amount})`);
    console.log(`Preferred method: ${scenario.preferredMethod}`);
    
    // Select strategy based on scenario
    let selectedStrategy: PaymentStrategy;
    switch (scenario.preferredMethod) {
      case "PayPal":
        selectedStrategy = new PayPalStrategy();
        break;
      case "Credit Card":
        selectedStrategy = new CreditCardStrategy();
        break;
      case "Bank Transfer":
        selectedStrategy = new BankTransferStrategy();
        break;
      case "Crypto":
        selectedStrategy = new CryptoStrategy();
        break;
      default:
        selectedStrategy = new CreditCardStrategy();
    }

    processor.setStrategy(selectedStrategy);
    processor.processPayment(scenario.amount);
  });
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

function testPaymentStrategies(): void {
  console.log("=== PAYMENT STRATEGY TESTS ===\n");

  const testCases = [
    { amount: 10, currency: "USD", expectedMinFees: 0.30 },
    { amount: 100, currency: "USD", expectedMinFees: 1.00 },
    { amount: 1000, currency: "USD", expectedMinFees: 10.00 }
  ];

  const strategies = [
    new CreditCardStrategy(),
    new PayPalStrategy(),
    new CryptoStrategy(),
    new BankTransferStrategy()
  ];

  testCases.forEach((testCase, testIndex) => {
    console.log(`Test ${testIndex + 1}: Amount $${testCase.amount}`);
    
    strategies.forEach((strategy, strategyIndex) => {
      const result = strategy.process(testCase.amount, testCase.currency);
      
      console.log(`  Strategy ${strategyIndex + 1} (${strategy.getDescription()}):`);
      console.log(`    Success: ${result.success}`);
      console.log(`    Fees: $${result.fees.toFixed(2)}`);
      console.log(`    Processing Time: ${result.processingTime}ms`);
      
      // Validate fees are reasonable
      if (result.fees >= testCase.expectedMinFees) {
        console.log(`    ✅ Fees validation passed`);
      } else {
        console.log(`    ❌ Fees validation failed`);
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
    demonstratePaymentStrategies();
    demonstrateStrategyComparison();
    demonstrateDynamicStrategySelection();
    testPaymentStrategies();
    
    console.log("=== PAYMENT PROCESSING STRATEGY PATTERN COMPLETED ===");
  } catch (error) {
    console.error("Error in payment processing demo:", error);
  }
}

// Run the demonstration
main();

exit(0); 