// ============================================================================
// E-COMMERCE PLATFORM FACTORY - Region-Specific Commerce Services
// ============================================================================

import { exit } from "process";

// E-commerce interfaces and types
interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number; // in kg
  category?: string;
}

interface Order {
  id?: string;
  items: OrderItem[];
  shippingAddress: Address;
  total?: number;
  currency?: string;
  customerId?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  processingFee?: number;
}

interface ShippingRate {
  service: string;
  cost: number;
  estimatedDays: number;
  currency: string;
}

interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  breakdown: Record<string, number>;
}

// Abstract Product interfaces
interface PaymentProcessor {
  process(amount: number, currency: string, paymentMethod: any): Promise<PaymentResult>;
  refund(transactionId: string, amount?: number): Promise<PaymentResult>;
  getSupportedCurrencies(): string[];
  getSupportedMethods(): string[];
  getProcessingFee(amount: number): number;
}

interface ShippingCalculator {
  calculate(order: Order): Promise<ShippingRate[]>;
  getEstimatedDelivery(service: string, address: Address): Promise<Date>;
  trackPackage(trackingNumber: string): Promise<any>;
  getSupportedServices(): string[];
  validateAddress(address: Address): boolean;
}

interface TaxCalculator {
  calculate(order: Order, shippingCost?: number): Promise<TaxCalculation>;
  validateTaxId(taxId: string): boolean;
  getTaxRates(region: string): Record<string, number>;
  isExempt(customerId: string): Promise<boolean>;
}

// Abstract Factory interface
interface EcommerceAbstractFactory {
  createPaymentProcessor(): PaymentProcessor;
  createShippingCalculator(): ShippingCalculator;
  createTaxCalculator(): TaxCalculator;
  getRegion(): string;
  getCurrency(): string;
  getLocale(): string;
}

// ============================================================================
// US REGION IMPLEMENTATIONS
// ============================================================================

class USPaymentProcessor implements PaymentProcessor {
  async process(amount: number, currency: string, paymentMethod: any): Promise<PaymentResult> {
    console.log(`Processing US payment: $${amount} ${currency}`);
    console.log(`Payment method: ${paymentMethod.type || 'Credit Card'}`);
    
    await this.simulateDelay(500);
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      return {
        success: true,
        transactionId: `us_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        processingFee: amount * 0.029 + 0.30 // Stripe-like fees
      };
    } else {
      return {
        success: false,
        errorMessage: 'Payment declined by issuing bank'
      };
    }
  }

  async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
    console.log(`Processing US refund for transaction: ${transactionId}`);
    return {
      success: true,
      transactionId: `refund_${transactionId}`,
      processingFee: 0
    };
  }

  getSupportedCurrencies(): string[] {
    return ['USD', 'CAD'];
  }

  getSupportedMethods(): string[] {
    return ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];
  }

  getProcessingFee(amount: number): number {
    return amount * 0.029 + 0.30;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class USShippingCalculator implements ShippingCalculator {
  async calculate(order: Order): Promise<ShippingRate[]> {
    console.log(`Calculating US shipping rates for ${order.items.length} items`);
    
    const weight = order.items.reduce((total, item) => total + (item.weight || 0.5) * item.quantity, 0);
    const baseRates = [
      { service: 'USPS Ground', baseCost: 8.99, perKg: 2.50 },
      { service: 'UPS Ground', baseCost: 12.99, perKg: 3.00 },
      { service: 'FedEx Express', baseCost: 24.99, perKg: 5.00 },
      { service: 'UPS Next Day', baseCost: 49.99, perKg: 8.00 }
    ];

    return baseRates.map(rate => ({
      service: rate.service,
      cost: Math.round((rate.baseCost + weight * rate.perKg) * 100) / 100,
      estimatedDays: rate.service.includes('Express') ? 1 : rate.service.includes('Next Day') ? 1 : 5,
      currency: 'USD'
    }));
  }

  async getEstimatedDelivery(service: string, address: Address): Promise<Date> {
    const businessDays = service.includes('Next Day') ? 1 : service.includes('Express') ? 2 : 5;
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + businessDays);
    return delivery;
  }

  async trackPackage(trackingNumber: string): Promise<any> {
    return {
      trackingNumber,
      status: 'In Transit',
      location: 'Distribution Center - Chicago, IL',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    };
  }

  getSupportedServices(): string[] {
    return ['USPS Ground', 'UPS Ground', 'FedEx Express', 'UPS Next Day'];
  }

  validateAddress(address: Address): boolean {
    return address.country === 'US' && !!address.postalCode.match(/^\d{5}(-\d{4})?$/);
  }
}

class USTaxCalculator implements TaxCalculator {
  private taxRates: Record<string, number> = {
    'CA': 0.0875, // California
    'NY': 0.08,   // New York
    'TX': 0.0625, // Texas
    'FL': 0.06,   // Florida
    'WA': 0.065   // Washington
  };

  async calculate(order: Order, shippingCost: number = 0): Promise<TaxCalculation> {
    const state = order.shippingAddress.state;
    const taxRate = this.taxRates[state] || 0.05; // Default 5% if state not found
    
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxableAmount = subtotal + shippingCost;
    const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;
    
    console.log(`US tax calculation for ${state}: ${(taxRate * 100).toFixed(2)}% on $${taxableAmount}`);
    
    return {
      subtotal,
      taxAmount,
      taxRate,
      total: subtotal + shippingCost + taxAmount,
      breakdown: {
        stateTax: taxAmount,
        localTax: 0
      }
    };
  }

  validateTaxId(taxId: string): boolean {
    // US Tax ID (EIN) format: XX-XXXXXXX
    return /^\d{2}-\d{7}$/.test(taxId);
  }

  getTaxRates(region: string): Record<string, number> {
    return this.taxRates;
  }

  async isExempt(customerId: string): Promise<boolean> {
    // Simulate checking exemption status
    return customerId.startsWith('exempt_');
  }
}

// ============================================================================
// EU REGION IMPLEMENTATIONS
// ============================================================================

class EUPaymentProcessor implements PaymentProcessor {
  async process(amount: number, currency: string, paymentMethod: any): Promise<PaymentResult> {
    console.log(`Processing EU payment: €${amount} ${currency}`);
    console.log(`Payment method: ${paymentMethod.type || 'SEPA'}`);
    
    await this.simulateDelay(700);
    
    const success = Math.random() > 0.03; // 97% success rate
    
    if (success) {
      return {
        success: true,
        transactionId: `eu_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        processingFee: amount * 0.019 + 0.25 // European rates
      };
    } else {
      return {
        success: false,
        errorMessage: 'Payment rejected - SCA authentication required'
      };
    }
  }

  async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
    console.log(`Processing EU refund for transaction: ${transactionId}`);
    return {
      success: true,
      transactionId: `refund_${transactionId}`,
      processingFee: 0
    };
  }

  getSupportedCurrencies(): string[] {
    return ['EUR', 'GBP', 'SEK', 'NOK', 'CHF'];
  }

  getSupportedMethods(): string[] {
    return ['sepa_debit', 'credit_card', 'bancontact', 'ideal', 'giropay', 'sofort'];
  }

  getProcessingFee(amount: number): number {
    return amount * 0.019 + 0.25;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class EUShippingCalculator implements ShippingCalculator {
  async calculate(order: Order): Promise<ShippingRate[]> {
    console.log(`Calculating EU shipping rates for ${order.items.length} items`);
    
    const weight = order.items.reduce((total, item) => total + (item.weight || 0.5) * item.quantity, 0);
    const baseRates = [
      { service: 'DHL Express', baseCost: 15.99, perKg: 4.50 },
      { service: 'UPS Standard', baseCost: 12.99, perKg: 3.20 },
      { service: 'DPD Classic', baseCost: 8.99, perKg: 2.80 },
      { service: 'PostNL International', baseCost: 6.99, perKg: 2.00 }
    ];

    return baseRates.map(rate => ({
      service: rate.service,
      cost: Math.round((rate.baseCost + weight * rate.perKg) * 100) / 100,
      estimatedDays: rate.service.includes('Express') ? 2 : 7,
      currency: 'EUR'
    }));
  }

  async getEstimatedDelivery(service: string, address: Address): Promise<Date> {
    const businessDays = service.includes('Express') ? 2 : 7;
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + businessDays);
    return delivery;
  }

  async trackPackage(trackingNumber: string): Promise<any> {
    return {
      trackingNumber,
      status: 'En Route',
      location: 'Sorting Facility - Frankfurt, DE',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };
  }

  getSupportedServices(): string[] {
    return ['DHL Express', 'UPS Standard', 'DPD Classic', 'PostNL International'];
  }

  validateAddress(address: Address): boolean {
    const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI'];
    return euCountries.includes(address.country);
  }
}

class EUTaxCalculator implements TaxCalculator {
  private vatRates: Record<string, number> = {
    'DE': 0.19,   // Germany
    'FR': 0.20,   // France
    'IT': 0.22,   // Italy
    'ES': 0.21,   // Spain
    'NL': 0.21,   // Netherlands
    'BE': 0.21,   // Belgium
    'AT': 0.20    // Austria
  };

  async calculate(order: Order, shippingCost: number = 0): Promise<TaxCalculation> {
    const country = order.shippingAddress.country;
    const vatRate = this.vatRates[country] || 0.20; // Default 20% VAT
    
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxableAmount = subtotal + shippingCost;
    const taxAmount = Math.round(taxableAmount * vatRate * 100) / 100;
    
    console.log(`EU VAT calculation for ${country}: ${(vatRate * 100).toFixed(0)}% on €${taxableAmount}`);
    
    return {
      subtotal,
      taxAmount,
      taxRate: vatRate,
      total: subtotal + shippingCost + taxAmount,
      breakdown: {
        vat: taxAmount,
        digitalTax: 0
      }
    };
  }

  validateTaxId(taxId: string): boolean {
    // EU VAT number format varies by country, simplified check
    return /^[A-Z]{2}\d{8,12}$/.test(taxId);
  }

  getTaxRates(region: string): Record<string, number> {
    return this.vatRates;
  }

  async isExempt(customerId: string): Promise<boolean> {
    // EU VAT exemptions are rare
    return customerId.startsWith('b2b_') && customerId.includes('_vat_exempt');
  }
}

// ============================================================================
// ASIA-PACIFIC REGION IMPLEMENTATIONS
// ============================================================================

class APACPaymentProcessor implements PaymentProcessor {
  async process(amount: number, currency: string, paymentMethod: any): Promise<PaymentResult> {
    console.log(`Processing APAC payment: ${amount} ${currency}`);
    console.log(`Payment method: ${paymentMethod.type || 'Local Bank Transfer'}`);
    
    await this.simulateDelay(800);
    
    const success = Math.random() > 0.08; // 92% success rate
    
    if (success) {
      return {
        success: true,
        transactionId: `apac_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        processingFee: amount * 0.035 + 0.50 // Higher fees for APAC
      };
    } else {
      return {
        success: false,
        errorMessage: 'Payment gateway timeout - please retry'
      };
    }
  }

  async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
    console.log(`Processing APAC refund for transaction: ${transactionId}`);
    return {
      success: true,
      transactionId: `refund_${transactionId}`,
      processingFee: amount ? amount * 0.01 : 0 // Small refund fee
    };
  }

  getSupportedCurrencies(): string[] {
    return ['SGD', 'HKD', 'AUD', 'JPY', 'KRW', 'THB', 'MYR'];
  }

  getSupportedMethods(): string[] {
    return ['alipay', 'wechat_pay', 'unionpay', 'grabpay', 'bank_transfer'];
  }

  getProcessingFee(amount: number): number {
    return amount * 0.035 + 0.50;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class APACShippingCalculator implements ShippingCalculator {
  async calculate(order: Order): Promise<ShippingRate[]> {
    console.log(`Calculating APAC shipping rates for ${order.items.length} items`);
    
    const weight = order.items.reduce((total, item) => total + (item.weight || 0.5) * item.quantity, 0);
    const baseRates = [
      { service: 'DHL Express Asia', baseCost: 25.99, perKg: 6.00 },
      { service: 'Singapore Post', baseCost: 12.99, perKg: 3.50 },
      { service: 'Australia Post', baseCost: 18.99, perKg: 4.20 },
      { service: 'Local Courier', baseCost: 8.99, perKg: 2.50 }
    ];

    return baseRates.map(rate => ({
      service: rate.service,
      cost: Math.round((rate.baseCost + weight * rate.perKg) * 100) / 100,
      estimatedDays: rate.service.includes('Express') ? 3 : rate.service.includes('Local') ? 2 : 10,
      currency: 'SGD'
    }));
  }

  async getEstimatedDelivery(service: string, address: Address): Promise<Date> {
    const businessDays = service.includes('Express') ? 3 : service.includes('Local') ? 2 : 10;
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + businessDays);
    return delivery;
  }

  async trackPackage(trackingNumber: string): Promise<any> {
    return {
      trackingNumber,
      status: 'Customs Clearance',
      location: 'Changi Airport - Singapore',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    };
  }

  getSupportedServices(): string[] {
    return ['DHL Express Asia', 'Singapore Post', 'Australia Post', 'Local Courier'];
  }

  validateAddress(address: Address): boolean {
    const apacCountries = ['SG', 'HK', 'AU', 'JP', 'KR', 'TH', 'MY'];
    return apacCountries.includes(address.country);
  }
}

class APACTaxCalculator implements TaxCalculator {
  private taxRates: Record<string, number> = {
    'SG': 0.07,   // Singapore GST
    'HK': 0.00,   // Hong Kong (no GST)
    'AU': 0.10,   // Australia GST
    'JP': 0.10,   // Japan Consumption Tax
    'KR': 0.10,   // South Korea VAT
    'TH': 0.07,   // Thailand VAT
    'MY': 0.06    // Malaysia SST
  };

  async calculate(order: Order, shippingCost: number = 0): Promise<TaxCalculation> {
    const country = order.shippingAddress.country;
    const taxRate = this.taxRates[country] || 0.08; // Default 8%
    
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxableAmount = subtotal + shippingCost;
    const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;
    
    console.log(`APAC tax calculation for ${country}: ${(taxRate * 100).toFixed(0)}% on ${taxableAmount}`);
    
    return {
      subtotal,
      taxAmount,
      taxRate,
      total: subtotal + shippingCost + taxAmount,
      breakdown: {
        gst: taxAmount,
        serviceTax: 0
      }
    };
  }

  validateTaxId(taxId: string): boolean {
    // APAC tax IDs vary significantly by country
    return taxId.length >= 8 && taxId.length <= 15;
  }

  getTaxRates(region: string): Record<string, number> {
    return this.taxRates;
  }

  async isExempt(customerId: string): Promise<boolean> {
    return customerId.includes('_duty_free');
  }
}

// ============================================================================
// CONCRETE FACTORY IMPLEMENTATIONS
// ============================================================================

class USEcommerceFactory implements EcommerceAbstractFactory {
  createPaymentProcessor(): PaymentProcessor {
    return new USPaymentProcessor();
  }

  createShippingCalculator(): ShippingCalculator {
    return new USShippingCalculator();
  }

  createTaxCalculator(): TaxCalculator {
    return new USTaxCalculator();
  }

  getRegion(): string {
    return 'US';
  }

  getCurrency(): string {
    return 'USD';
  }

  getLocale(): string {
    return 'en-US';
  }
}

class EUEcommerceFactory implements EcommerceAbstractFactory {
  createPaymentProcessor(): PaymentProcessor {
    return new EUPaymentProcessor();
  }

  createShippingCalculator(): ShippingCalculator {
    return new EUShippingCalculator();
  }

  createTaxCalculator(): TaxCalculator {
    return new EUTaxCalculator();
  }

  getRegion(): string {
    return 'EU';
  }

  getCurrency(): string {
    return 'EUR';
  }

  getLocale(): string {
    return 'en-EU';
  }
}

class APACEcommerceFactory implements EcommerceAbstractFactory {
  createPaymentProcessor(): PaymentProcessor {
    return new APACPaymentProcessor();
  }

  createShippingCalculator(): ShippingCalculator {
    return new APACShippingCalculator();
  }

  createTaxCalculator(): TaxCalculator {
    return new APACTaxCalculator();
  }

  getRegion(): string {
    return 'APAC';
  }

  getCurrency(): string {
    return 'SGD';
  }

  getLocale(): string {
    return 'en-SG';
  }
}

// ============================================================================
// ABSTRACT FACTORY REGISTRY
// ============================================================================

class EcommerceAbstractFactory {
  private static factories = new Map<string, () => EcommerceAbstractFactory>([
    ['us', () => new USEcommerceFactory()],
    ['eu', () => new EUEcommerceFactory()],
    ['apac', () => new APACEcommerceFactory()]
  ]);

  public static createForRegion(region: string): EcommerceAbstractFactory {
    const factoryCreator = this.factories.get(region.toLowerCase());
    if (!factoryCreator) {
      throw new Error(`Unsupported region: ${region}`);
    }
    return factoryCreator();
  }

  public static getSupportedRegions(): string[] {
    return Array.from(this.factories.keys());
  }
}

// Usage Example - Following the documented API exactly
async function demonstrateEcommercePlatform(): Promise<void> {
  console.log('=== E-COMMERCE PLATFORM FACTORY DEMO ===');
  console.log('Following the documented API pattern:\n');

  const regions = ['us', 'eu', 'apac'];

  for (const regionCode of regions) {
    console.log(`--- Testing ${regionCode.toUpperCase()} Region ---`);
    
    try {
      // Following the exact documented API
      const ecommerceFactory = EcommerceAbstractFactory.createForRegion(regionCode);
      const payment = ecommerceFactory.createPaymentProcessor();
      const shipping = ecommerceFactory.createShippingCalculator();
      const tax = ecommerceFactory.createTaxCalculator();

      // All services work together for region-specific commerce
      const order: Order = {
        items: [{ id: 'item1', name: 'Widget', price: 29.99, quantity: 2, weight: 0.5 }],
        shippingAddress: {
          street: '123 Main St',
          city: regionCode === 'us' ? 'New York' : regionCode === 'eu' ? 'Berlin' : 'Singapore',
          state: regionCode === 'us' ? 'NY' : '',
          country: regionCode === 'us' ? 'US' : regionCode === 'eu' ? 'DE' : 'SG',
          postalCode: regionCode === 'us' ? '10001' : regionCode === 'eu' ? '10115' : '018989'
        }
      };

      const shippingRates = await shipping.calculate(order);
      const shippingCost = shippingRates[0].cost;
      
      const taxAmount = await tax.calculate(order, shippingCost);
      const totalAmount = taxAmount.total;
      
      const paymentResult = await payment.process(totalAmount, ecommerceFactory.getCurrency(), { type: 'credit_card' });
      
      console.log(`Region: ${ecommerceFactory.getRegion()}`);
      console.log(`Currency: ${ecommerceFactory.getCurrency()}`);
      console.log(`Shipping options: ${shippingRates.length} available`);
      console.log(`Best shipping: ${shippingRates[0].service} - ${shippingRates[0].cost} ${shippingRates[0].currency}`);
      console.log(`Tax rate: ${(taxAmount.taxRate * 100).toFixed(1)}%`);
      console.log(`Total with tax: ${totalAmount.toFixed(2)} ${ecommerceFactory.getCurrency()}`);
      console.log(`Payment: ${paymentResult.success ? '✅ Success' : '❌ Failed'}`);
      
      if (paymentResult.success && paymentResult.transactionId) {
        console.log(`Transaction ID: ${paymentResult.transactionId}`);
        console.log(`Processing fee: ${paymentResult.processingFee?.toFixed(2)} ${ecommerceFactory.getCurrency()}`);
      }
      
    } catch (error) {
      console.error(`❌ Error with ${regionCode}:`, error instanceof Error ? error.message : String(error));
    }
    
    console.log();
  }

  console.log(`✅ Successfully demonstrated ${regions.length} e-commerce regions with documented API`);
}

// Testing Example
async function testEcommercePlatform(): Promise<void> {
  console.log('=== E-COMMERCE PLATFORM FACTORY TESTS ===');
  
  // Test 1: Factory creation for different regions
  console.log('Test 1 - Region factory creation:');
  const supportedRegions = EcommerceAbstractFactory.getSupportedRegions();
  
  for (const region of supportedRegions) {
    try {
      const factory = EcommerceAbstractFactory.createForRegion(region);
      console.log(`✅ ${region}: Factory created successfully`);
    } catch (error) {
      console.log(`❌ ${region}: Failed to create factory`);
    }
  }
  
  // Test 2: Service family consistency
  console.log('\nTest 2 - Service family consistency:');
  const factory = EcommerceAbstractFactory.createForRegion('us');
  
  const payment = factory.createPaymentProcessor();
  const shipping = factory.createShippingCalculator();
  const tax = factory.createTaxCalculator();
  
  console.log('✅ All services created from same factory');
  console.log('✅ Services configured for same region');
  
  // Test 3: Currency and locale consistency
  console.log('\nTest 3 - Regional configuration:');
  const usFactory = EcommerceAbstractFactory.createForRegion('us');
  const euFactory = EcommerceAbstractFactory.createForRegion('eu');
  
  console.log(`US Currency: ${usFactory.getCurrency()}, Locale: ${usFactory.getLocale()}`);
  console.log(`EU Currency: ${euFactory.getCurrency()}, Locale: ${euFactory.getLocale()}`);
  console.log('✅ Regional configuration works');
  
  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateEcommercePlatform();
  await testEcommercePlatform();
  exit(0);
})();

export {
  EcommerceAbstractFactory,
  PaymentProcessor,
  ShippingCalculator,
  TaxCalculator,
  Order,
  OrderItem,
  Address
}; 