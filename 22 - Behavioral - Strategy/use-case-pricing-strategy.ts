import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface PricingData {
  basePrice: number;
  quantity: number;
  customerType: 'regular' | 'premium' | 'enterprise';
  region: string;
  season: 'low' | 'high' | 'peak';
  productCategory: string;
  orderHistory: number;
  loyaltyPoints: number;
}

interface PricingResult {
  finalPrice: number;
  basePrice: number;
  discount: number;
  discountPercentage: number;
  appliedStrategy: string;
  breakdown: string[];
  totalSavings: number;
}

interface PricingStrategy {
  calculatePrice(basePrice: number, context: PricingData): PricingResult;
  getDiscount(): number;
  getDescription(): string;
  getApplicableConditions(): string[];
  isEligible(context: PricingData): boolean;
}

// ============================================================================
// CONCRETE STRATEGIES
// ============================================================================

class FixedPricingStrategy implements PricingStrategy {
  private readonly fixedDiscount = 10; // $10 off

  calculatePrice(basePrice: number, context: PricingData): PricingResult {
    const discount = this.fixedDiscount;
    const finalPrice = Math.max(0, basePrice - discount);
    const discountPercentage = (discount / basePrice) * 100;

    return {
      finalPrice,
      basePrice,
      discount,
      discountPercentage,
      appliedStrategy: this.getDescription(),
      breakdown: [
        `Base price: $${basePrice.toFixed(2)}`,
        `Fixed discount: -$${discount.toFixed(2)}`,
        `Final price: $${finalPrice.toFixed(2)}`
      ],
      totalSavings: discount
    };
  }

  getDiscount(): number {
    return this.fixedDiscount;
  }

  getDescription(): string {
    return "Fixed Pricing - Flat dollar amount discount";
  }

  getApplicableConditions(): string[] {
    return ["All customers", "All products", "No minimum purchase"];
  }

  isEligible(context: PricingData): boolean {
    return true; // Available to everyone
  }
}

class PercentagePricingStrategy implements PricingStrategy {
  private readonly percentageDiscount = 15; // 15% off

  calculatePrice(basePrice: number, context: PricingData): PricingResult {
    const discount = (basePrice * this.percentageDiscount) / 100;
    const finalPrice = basePrice - discount;
    const discountPercentage = this.percentageDiscount;

    return {
      finalPrice,
      basePrice,
      discount,
      discountPercentage,
      appliedStrategy: this.getDescription(),
      breakdown: [
        `Base price: $${basePrice.toFixed(2)}`,
        `Percentage discount: ${this.percentageDiscount}%`,
        `Discount amount: -$${discount.toFixed(2)}`,
        `Final price: $${finalPrice.toFixed(2)}`
      ],
      totalSavings: discount
    };
  }

  getDiscount(): number {
    return this.percentageDiscount;
  }

  getDescription(): string {
    return "Percentage Pricing - Percentage-based discount";
  }

  getApplicableConditions(): string[] {
    return ["Premium customers", "Minimum purchase $50", "Excludes clearance items"];
  }

  isEligible(context: PricingData): boolean {
    return context.customerType === 'premium' && context.basePrice >= 50;
  }
}

class DynamicPricingStrategy implements PricingStrategy {
  calculatePrice(basePrice: number, context: PricingData): PricingResult {
    let dynamicDiscount = 0;
    const breakdown: string[] = [`Base price: $${basePrice.toFixed(2)}`];

    // Season-based pricing
    let seasonMultiplier = 1.0;
    switch (context.season) {
      case 'low':
        seasonMultiplier = 0.8; // 20% discount in low season
        breakdown.push(`Low season discount: 20%`);
        break;
      case 'high':
        seasonMultiplier = 1.0; // No discount in high season
        break;
      case 'peak':
        seasonMultiplier = 1.2; // 20% premium in peak season
        breakdown.push(`Peak season premium: +20%`);
        break;
    }

    // Quantity-based discount
    let quantityDiscount = 0;
    if (context.quantity >= 10) {
      quantityDiscount = 10;
      breakdown.push(`Bulk discount (10+ items): -$${quantityDiscount.toFixed(2)}`);
    } else if (context.quantity >= 5) {
      quantityDiscount = 5;
      breakdown.push(`Bulk discount (5+ items): -$${quantityDiscount.toFixed(2)}`);
    }

    // Customer type multiplier
    let customerMultiplier = 1.0;
    switch (context.customerType) {
      case 'enterprise':
        customerMultiplier = 0.85; // 15% discount for enterprise
        breakdown.push(`Enterprise discount: 15%`);
        break;
      case 'premium':
        customerMultiplier = 0.9; // 10% discount for premium
        breakdown.push(`Premium discount: 10%`);
        break;
      case 'regular':
        customerMultiplier = 1.0; // No discount for regular
        break;
    }

    // Calculate final price
    const adjustedPrice = basePrice * seasonMultiplier * customerMultiplier - quantityDiscount;
    const finalPrice = Math.max(0, adjustedPrice);
    const totalDiscount = basePrice - finalPrice;
    const discountPercentage = (totalDiscount / basePrice) * 100;

    breakdown.push(`Final price: $${finalPrice.toFixed(2)}`);

    return {
      finalPrice,
      basePrice,
      discount: totalDiscount,
      discountPercentage,
      appliedStrategy: this.getDescription(),
      breakdown,
      totalSavings: totalDiscount
    };
  }

  getDiscount(): number {
    return 0; // Dynamic, varies by context
  }

  getDescription(): string {
    return "Dynamic Pricing - Market-based adaptive pricing";
  }

  getApplicableConditions(): string[] {
    return ["Seasonal products", "High-demand items", "Market-based pricing"];
  }

  isEligible(context: PricingData): boolean {
    return context.productCategory === 'electronics' || context.productCategory === 'fashion';
  }
}

class BulkPricingStrategy implements PricingStrategy {
  private readonly tiers = [
    { minQuantity: 1, discount: 0 },
    { minQuantity: 5, discount: 5 },
    { minQuantity: 10, discount: 10 },
    { minQuantity: 20, discount: 15 },
    { minQuantity: 50, discount: 20 }
  ];

  calculatePrice(basePrice: number, context: PricingData): PricingResult {
    const unitPrice = basePrice;
    const totalBasePrice = unitPrice * context.quantity;
    
    // Find applicable tier
    const applicableTier = this.tiers
      .filter(tier => context.quantity >= tier.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    const discountPercentage = applicableTier.discount;
    const discount = (totalBasePrice * discountPercentage) / 100;
    const finalPrice = totalBasePrice - discount;

    const breakdown = [
      `Unit price: $${unitPrice.toFixed(2)}`,
      `Quantity: ${context.quantity}`,
      `Base total: $${totalBasePrice.toFixed(2)}`,
      `Bulk discount (${discountPercentage}%): -$${discount.toFixed(2)}`,
      `Final price: $${finalPrice.toFixed(2)}`
    ];

    return {
      finalPrice,
      basePrice: totalBasePrice,
      discount,
      discountPercentage,
      appliedStrategy: this.getDescription(),
      breakdown,
      totalSavings: discount
    };
  }

  getDiscount(): number {
    return 20; // Maximum tier discount
  }

  getDescription(): string {
    return "Bulk Pricing - Quantity-based tiered discount";
  }

  getApplicableConditions(): string[] {
    return ["Minimum 5 items", "Same product", "All customer types"];
  }

  isEligible(context: PricingData): boolean {
    return context.quantity >= 5;
  }
}

class LoyaltyPricingStrategy implements PricingStrategy {
  private readonly pointsPerDollar = 10;
  private readonly discountPerPoint = 0.01; // $0.01 per point

  calculatePrice(basePrice: number, context: PricingData): PricingResult {
    const maxDiscount = context.loyaltyPoints * this.discountPerPoint;
    const maxDiscountPercentage = (maxDiscount / basePrice) * 100;
    
    // Cap discount at 25% of base price
    const cappedDiscount = Math.min(maxDiscount, basePrice * 0.25);
    const finalPrice = basePrice - cappedDiscount;
    const actualDiscountPercentage = (cappedDiscount / basePrice) * 100;

    const breakdown = [
      `Base price: $${basePrice.toFixed(2)}`,
      `Loyalty points: ${context.loyaltyPoints}`,
      `Points value: $${maxDiscount.toFixed(2)}`,
      `Applied discount: -$${cappedDiscount.toFixed(2)}`,
      `Final price: $${finalPrice.toFixed(2)}`
    ];

    if (cappedDiscount < maxDiscount) {
      breakdown.splice(3, 0, `Discount capped at 25% of base price`);
    }

    return {
      finalPrice,
      basePrice,
      discount: cappedDiscount,
      discountPercentage: actualDiscountPercentage,
      appliedStrategy: this.getDescription(),
      breakdown,
      totalSavings: cappedDiscount
    };
  }

  getDiscount(): number {
    return 25; // Maximum 25% discount
  }

  getDescription(): string {
    return "Loyalty Pricing - Points-based reward discount";
  }

  getApplicableConditions(): string[] {
    return ["Loyalty program members", "Minimum 100 points", "One-time use per order"];
  }

  isEligible(context: PricingData): boolean {
    return context.loyaltyPoints >= 100;
  }
}

// ============================================================================
// CONTEXT CLASS
// ============================================================================

class PricingContext {
  private strategy: PricingStrategy;

  constructor(strategy: PricingStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PricingStrategy): void {
    this.strategy = strategy;
  }

  calculatePrice(basePrice: number, context: PricingData): PricingResult {
    console.log(`Calculating price using: ${this.strategy.getDescription()}`);
    console.log(`Applicable conditions: ${this.strategy.getApplicableConditions().join(', ')}`);
    console.log(`Eligible: ${this.strategy.isEligible(context) ? "Yes" : "No"}`);
    console.log(`Base price: $${basePrice.toFixed(2)}`);
    console.log(`Customer type: ${context.customerType}`);
    console.log(`Quantity: ${context.quantity}`);
    console.log(`Season: ${context.season}`);
    
    const result = this.strategy.calculatePrice(basePrice, context);
    
    console.log(`Final price: $${result.finalPrice.toFixed(2)}`);
    console.log(`Discount: $${result.discount.toFixed(2)} (${result.discountPercentage.toFixed(1)}%)`);
    console.log(`Total savings: $${result.totalSavings.toFixed(2)}`);
    console.log("Breakdown:");
    result.breakdown.forEach(line => console.log(`  ${line}`));
    console.log("---");

    return result;
  }

  getCurrentStrategy(): PricingStrategy {
    return this.strategy;
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

function demonstratePricingStrategies(): void {
  console.log("=== PRICING STRATEGY DEMO ===\n");

  const context = new PricingContext(new FixedPricingStrategy());

  // Test different scenarios
  const scenarios = [
    {
      name: "Regular customer, single item",
      basePrice: 100,
      context: {
        basePrice: 100,
        quantity: 1,
        customerType: 'regular' as const,
        region: 'US',
        season: 'high' as const,
        productCategory: 'electronics',
        orderHistory: 2,
        loyaltyPoints: 50
      }
    },
    {
      name: "Premium customer, bulk order",
      basePrice: 50,
      context: {
        basePrice: 50,
        quantity: 10,
        customerType: 'premium' as const,
        region: 'US',
        season: 'low' as const,
        productCategory: 'clothing',
        orderHistory: 15,
        loyaltyPoints: 500
      }
    },
    {
      name: "Enterprise customer, seasonal product",
      basePrice: 200,
      context: {
        basePrice: 200,
        quantity: 5,
        customerType: 'enterprise' as const,
        region: 'EU',
        season: 'peak' as const,
        productCategory: 'electronics',
        orderHistory: 50,
        loyaltyPoints: 1000
      }
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    
    const strategies = [
      new FixedPricingStrategy(),
      new PercentagePricingStrategy(),
      new DynamicPricingStrategy(),
      new BulkPricingStrategy(),
      new LoyaltyPricingStrategy()
    ];

    strategies.forEach(strategy => {
      if (strategy.isEligible(scenario.context)) {
        context.setStrategy(strategy);
        context.calculatePrice(scenario.basePrice, scenario.context);
      }
    });
    console.log("");
  });
}

function demonstrateStrategyComparison(): void {
  console.log("=== PRICING STRATEGY COMPARISON ===\n");

  const testPrice = 100;
  const testContext: PricingData = {
    basePrice: 100,
    quantity: 5,
    customerType: 'premium',
    region: 'US',
    season: 'high',
    productCategory: 'electronics',
    orderHistory: 10,
    loyaltyPoints: 200
  };

  const strategies = [
    new FixedPricingStrategy(),
    new PercentagePricingStrategy(),
    new DynamicPricingStrategy(),
    new BulkPricingStrategy(),
    new LoyaltyPricingStrategy()
  ];

  console.log("Pricing Strategy Comparison (for $100 item):");
  console.log("Strategy\t\t\tFinal Price\tDiscount\tSavings\t\tEligible");
  console.log("--------\t\t\t-----------\t--------\t-------\t\t--------");

  strategies.forEach(strategy => {
    const context = new PricingContext(strategy);
    const result = context.calculatePrice(testPrice, testContext);
    const eligible = strategy.isEligible(testContext) ? "Yes" : "No";
    
    console.log(`${strategy.getDescription().split(' - ')[0].padEnd(20)}\t$${result.finalPrice.toFixed(2)}\t\t${result.discountPercentage.toFixed(1)}%\t\t$${result.totalSavings.toFixed(2)}\t\t${eligible}`);
  });
}

function demonstrateDynamicSelection(): void {
  console.log("=== DYNAMIC STRATEGY SELECTION ===\n");

  const context = new PricingContext(new FixedPricingStrategy());

  const scenarios = [
    {
      name: "New customer, single purchase",
      basePrice: 75,
      context: {
        basePrice: 75,
        quantity: 1,
        customerType: 'regular' as const,
        region: 'US',
        season: 'high' as const,
        productCategory: 'books',
        orderHistory: 0,
        loyaltyPoints: 0
      },
      recommendedStrategy: "FixedPricing",
      reason: "Simple discount for new customers"
    },
    {
      name: "Loyal customer with points",
      basePrice: 150,
      context: {
        basePrice: 150,
        quantity: 1,
        customerType: 'premium' as const,
        region: 'US',
        season: 'low' as const,
        productCategory: 'electronics',
        orderHistory: 25,
        loyaltyPoints: 800
      },
      recommendedStrategy: "LoyaltyPricing",
      reason: "Reward loyal customers with points"
    },
    {
      name: "Bulk order for business",
      basePrice: 30,
      context: {
        basePrice: 30,
        quantity: 25,
        customerType: 'enterprise' as const,
        region: 'EU',
        season: 'high' as const,
        productCategory: 'office',
        orderHistory: 100,
        loyaltyPoints: 2000
      },
      recommendedStrategy: "BulkPricing",
      reason: "Volume discount for large orders"
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    console.log(`Recommended: ${scenario.recommendedStrategy} - ${scenario.reason}`);
    
    // Select strategy based on scenario
    let selectedStrategy: PricingStrategy;
    switch (scenario.recommendedStrategy) {
      case "FixedPricing":
        selectedStrategy = new FixedPricingStrategy();
        break;
      case "PercentagePricing":
        selectedStrategy = new PercentagePricingStrategy();
        break;
      case "DynamicPricing":
        selectedStrategy = new DynamicPricingStrategy();
        break;
      case "BulkPricing":
        selectedStrategy = new BulkPricingStrategy();
        break;
      case "LoyaltyPricing":
        selectedStrategy = new LoyaltyPricingStrategy();
        break;
      default:
        selectedStrategy = new FixedPricingStrategy();
    }

    context.setStrategy(selectedStrategy);
    const result = context.calculatePrice(scenario.basePrice, scenario.context);
    
    console.log(`✅ Final price: $${result.finalPrice.toFixed(2)} (saved $${result.totalSavings.toFixed(2)})\n`);
  });
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

function testPricingStrategies(): void {
  console.log("=== PRICING STRATEGY TESTS ===\n");

  const testCases = [
    {
      name: "Basic pricing test",
      basePrice: 100,
      context: {
        basePrice: 100,
        quantity: 1,
        customerType: 'regular' as const,
        region: 'US',
        season: 'high' as const,
        productCategory: 'general',
        orderHistory: 1,
        loyaltyPoints: 0
      },
      expectedMinDiscount: 0,
      expectedMaxDiscount: 25
    },
    {
      name: "Premium customer test",
      basePrice: 200,
      context: {
        basePrice: 200,
        quantity: 1,
        customerType: 'premium' as const,
        region: 'US',
        season: 'high' as const,
        productCategory: 'electronics',
        orderHistory: 10,
        loyaltyPoints: 100
      },
      expectedMinDiscount: 5,
      expectedMaxDiscount: 25
    }
  ];

  const strategies = [
    new FixedPricingStrategy(),
    new PercentagePricingStrategy(),
    new DynamicPricingStrategy(),
    new BulkPricingStrategy(),
    new LoyaltyPricingStrategy()
  ];

  testCases.forEach((testCase, testIndex) => {
    console.log(`Test ${testIndex + 1}: ${testCase.name}`);
    
    strategies.forEach((strategy, strategyIndex) => {
      const result = strategy.calculatePrice(testCase.basePrice, testCase.context);
      const isReasonable = result.discountPercentage >= testCase.expectedMinDiscount && 
                          result.discountPercentage <= testCase.expectedMaxDiscount;
      
      console.log(`  Strategy ${strategyIndex + 1} (${strategy.getDescription().split(' - ')[0]}): ${isReasonable ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`    Discount: ${result.discountPercentage.toFixed(1)}%`);
    });
    console.log("");
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main(): void {
  try {
    demonstratePricingStrategies();
    demonstrateStrategyComparison();
    demonstrateDynamicSelection();
    testPricingStrategies();
    
    console.log("=== PRICING STRATEGY PATTERN COMPLETED ===");
  } catch (error) {
    console.error("Error in pricing demo:", error);
  }
}

// Run the demonstration
main();

exit(0); 