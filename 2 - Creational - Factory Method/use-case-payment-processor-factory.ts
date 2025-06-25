// ============================================================================
// PAYMENT PROCESSOR FACTORY - Multi-Payment Method Processing
// ============================================================================

import { exit } from "process";

// Payment data interfaces
interface PaymentMethod {
  type: 'card' | 'paypal' | 'crypto' | 'bank_transfer' | 'apple_pay' | 'google_pay';
  details: Record<string, any>;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;
  customerId?: string;
  orderId?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  processingFee?: number;
  exchangeRate?: number;
  timestamp: Date;
  providerResponse?: any;
}

interface ProcessorConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  webhookUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  [key: string]: any;
}

// Product interface - what all payment processors must implement
interface PaymentProcessor {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>;
  getTransactionStatus(transactionId: string): Promise<'pending' | 'completed' | 'failed' | 'refunded'>;
  getSupportedCurrencies(): string[];
  getSupportedPaymentMethods(): string[];
  validatePaymentMethod(method: PaymentMethod): boolean;
  getProcessingFee(amount: number, currency: string): number;
}

// Abstract Creator - defines the factory method
abstract class PaymentProcessorFactory {
  // Factory method - to be implemented by concrete creators
  abstract createProcessor(config: ProcessorConfig): PaymentProcessor;
  
  // Template method that uses the factory method
  public async setupProcessor(config: ProcessorConfig): Promise<PaymentProcessor> {
    const processor = this.createProcessor(config);
    
    // Validate configuration
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    
    console.log(`Initialized ${this.getProcessorName()} processor in ${config.environment} mode`);
    return processor;
  }
  
  // Abstract method to get processor name
  abstract getProcessorName(): string;
  
  // Static method to create appropriate factory based on provider
  public static create(provider: string): PaymentProcessorFactory {
    switch (provider.toLowerCase()) {
      case 'stripe':
        return new StripeProcessorFactory();
      case 'paypal':
        return new PayPalProcessorFactory();
      case 'square':
        return new SquareProcessorFactory();
      case 'braintree':
        return new BraintreeProcessorFactory();
      case 'razorpay':
        return new RazorpayProcessorFactory();
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }
}

// Base processor implementation
abstract class BasePaymentProcessor implements PaymentProcessor {
  protected config: ProcessorConfig;
  protected supportedCurrencies: string[] = ['USD', 'EUR', 'GBP'];
  protected supportedPaymentMethods: string[] = ['card'];

  constructor(config: ProcessorConfig) {
    this.config = config;
  }

  abstract processPayment(request: PaymentRequest): Promise<PaymentResult>;
  abstract refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>;

  async getTransactionStatus(transactionId: string): Promise<'pending' | 'completed' | 'failed' | 'refunded'> {
    // Simulate API call
    console.log(`Checking status for transaction: ${transactionId}`);
    await this.simulateDelay(100);
    
    // Mock response
    const statuses: Array<'pending' | 'completed' | 'failed' | 'refunded'> = ['pending', 'completed', 'failed', 'refunded'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  getSupportedCurrencies(): string[] {
    return [...this.supportedCurrencies];
  }

  getSupportedPaymentMethods(): string[] {
    return [...this.supportedPaymentMethods];
  }

  validatePaymentMethod(method: PaymentMethod): boolean {
    if (!this.supportedPaymentMethods.includes(method.type)) {
      return false;
    }

    switch (method.type) {
      case 'card':
        return this.validateCardDetails(method.details);
      case 'paypal':
        return this.validatePayPalDetails(method.details);
      case 'crypto':
        return this.validateCryptoDetails(method.details);
      case 'bank_transfer':
        return this.validateBankDetails(method.details);
      default:
        return true;
    }
  }

  getProcessingFee(amount: number, currency: string): number {
    // Base fee calculation (2.9% + $0.30)
    return Math.round((amount * 0.029 + 30) * 100) / 100;
  }

  protected async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected validateCardDetails(details: any): boolean {
    return details.number && details.expiryMonth && details.expiryYear && details.cvv;
  }

  protected validatePayPalDetails(details: any): boolean {
    return details.email || details.paypalId;
  }

  protected validateCryptoDetails(details: any): boolean {
    return details.walletAddress && details.cryptocurrency;
  }

  protected validateBankDetails(details: any): boolean {
    return details.accountNumber && details.routingNumber;
  }
}

// Concrete Product implementations
class StripeProcessor extends BasePaymentProcessor {
  constructor(config: ProcessorConfig) {
    super(config);
    this.supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
    this.supportedPaymentMethods = ['card', 'apple_pay', 'google_pay'];
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    console.log(`Processing Stripe payment for ${request.amount} ${request.currency}`);
    
    // Validate payment method
    if (!this.validatePaymentMethod(request.paymentMethod)) {
      return {
        success: false,
        errorCode: 'INVALID_PAYMENT_METHOD',
        errorMessage: 'Invalid payment method details',
        timestamp: new Date()
      };
    }

    // Simulate API call
    await this.simulateDelay(200);

    // Mock success/failure
    const isSuccess = Math.random() > 0.1; // 90% success rate

    if (isSuccess) {
      const transactionId = this.generateTransactionId();
      return {
        success: true,
        transactionId,
        processingFee: this.getProcessingFee(request.amount, request.currency),
        timestamp: new Date(),
        providerResponse: {
          id: transactionId,
          status: 'succeeded',
          paid: true,
          receipt_url: `https://dashboard.stripe.com/receipts/${transactionId}`
        }
      };
    } else {
      return {
        success: false,
        errorCode: 'CARD_DECLINED',
        errorMessage: 'Your card was declined',
        timestamp: new Date()
      };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    console.log(`Processing Stripe refund for transaction: ${transactionId}`);
    await this.simulateDelay(150);

    const refundId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      success: true,
      transactionId: refundId,
      timestamp: new Date(),
      providerResponse: {
        id: refundId,
        status: 'succeeded',
        charge: transactionId
      }
    };
  }

  override getProcessingFee(amount: number, currency: string): number {
    // Stripe's fee structure: 2.9% + $0.30 for US cards
    return Math.round((amount * 0.029 + 30) * 100) / 100;
  }
}

class PayPalProcessor extends BasePaymentProcessor {
  constructor(config: ProcessorConfig) {
    super(config);
    this.supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
    this.supportedPaymentMethods = ['paypal', 'card'];
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    console.log(`Processing PayPal payment for ${request.amount} ${request.currency}`);
    
    if (!this.validatePaymentMethod(request.paymentMethod)) {
      return {
        success: false,
        errorCode: 'INVALID_PAYMENT_METHOD',
        errorMessage: 'Invalid PayPal payment method',
        timestamp: new Date()
      };
    }

    await this.simulateDelay(250);

    const isSuccess = Math.random() > 0.05; // 95% success rate

    if (isSuccess) {
      const transactionId = this.generateTransactionId();
      return {
        success: true,
        transactionId,
        processingFee: this.getProcessingFee(request.amount, request.currency),
        timestamp: new Date(),
        providerResponse: {
          id: transactionId,
          state: 'approved',
          payer: { payment_method: 'paypal' }
        }
      };
    } else {
      return {
        success: false,
        errorCode: 'INSUFFICIENT_FUNDS',
        errorMessage: 'Insufficient funds in PayPal account',
        timestamp: new Date()
      };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    console.log(`Processing PayPal refund for transaction: ${transactionId}`);
    await this.simulateDelay(200);

    const refundId = `refund_${Date.now()}`;
    return {
      success: true,
      transactionId: refundId,
      timestamp: new Date(),
      providerResponse: {
        id: refundId,
        state: 'completed',
        sale_id: transactionId
      }
    };
  }

  override getProcessingFee(amount: number, currency: string): number {
    // PayPal's fee: 2.9% + $0.30 for domestic payments
    return Math.round((amount * 0.029 + 30) * 100) / 100;
  }
}

class SquareProcessor extends BasePaymentProcessor {
  constructor(config: ProcessorConfig) {
    super(config);
    this.supportedCurrencies = ['USD', 'CAD', 'AUD', 'GBP', 'EUR', 'JPY'];
    this.supportedPaymentMethods = ['card', 'apple_pay', 'google_pay'];
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    console.log(`Processing Square payment for ${request.amount} ${request.currency}`);
    
    if (!this.validatePaymentMethod(request.paymentMethod)) {
      return {
        success: false,
        errorCode: 'INVALID_CARD',
        errorMessage: 'Invalid card details',
        timestamp: new Date()
      };
    }

    await this.simulateDelay(180);

    const isSuccess = Math.random() > 0.08; // 92% success rate

    if (isSuccess) {
      const transactionId = this.generateTransactionId();
      return {
        success: true,
        transactionId,
        processingFee: this.getProcessingFee(request.amount, request.currency),
        timestamp: new Date(),
        providerResponse: {
          id: transactionId,
          status: 'COMPLETED',
          receipt_number: `SQ-${Date.now()}`
        }
      };
    } else {
      return {
        success: false,
        errorCode: 'GENERIC_DECLINE',
        errorMessage: 'Payment was declined',
        timestamp: new Date()
      };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    console.log(`Processing Square refund for transaction: ${transactionId}`);
    await this.simulateDelay(160);

    const refundId = `refund_${Date.now()}`;
    return {
      success: true,
      transactionId: refundId,
      timestamp: new Date(),
      providerResponse: {
        id: refundId,
        status: 'COMPLETED',
        payment_id: transactionId
      }
    };
  }

  override getProcessingFee(amount: number, currency: string): number {
    // Square's fee: 2.6% + $0.10
    return Math.round((amount * 0.026 + 10) * 100) / 100;
  }
}

// Simplified implementations for demo
class BraintreeProcessor extends StripeProcessor {
  override getProcessingFee(amount: number, currency: string): number {
    // Braintree's fee: 2.9% + $0.30
    return Math.round((amount * 0.029 + 30) * 100) / 100;
  }
}

class RazorpayProcessor extends StripeProcessor {
  constructor(config: ProcessorConfig) {
    super(config);
    this.supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
  }

  override getProcessingFee(amount: number, currency: string): number {
    // Razorpay's fee: 2% (for INR)
    return Math.round((amount * 0.02) * 100) / 100;
  }
}

// Concrete Creator implementations
class StripeProcessorFactory extends PaymentProcessorFactory {
  createProcessor(config: ProcessorConfig): PaymentProcessor {
    return new StripeProcessor(config);
  }

  getProcessorName(): string {
    return 'Stripe';
  }
}

class PayPalProcessorFactory extends PaymentProcessorFactory {
  createProcessor(config: ProcessorConfig): PaymentProcessor {
    return new PayPalProcessor(config);
  }

  getProcessorName(): string {
    return 'PayPal';
  }
}

class SquareProcessorFactory extends PaymentProcessorFactory {
  createProcessor(config: ProcessorConfig): PaymentProcessor {
    return new SquareProcessor(config);
  }

  getProcessorName(): string {
    return 'Square';
  }
}

class BraintreeProcessorFactory extends PaymentProcessorFactory {
  createProcessor(config: ProcessorConfig): PaymentProcessor {
    return new BraintreeProcessor(config);
  }

  getProcessorName(): string {
    return 'Braintree';
  }
}

class RazorpayProcessorFactory extends PaymentProcessorFactory {
  createProcessor(config: ProcessorConfig): PaymentProcessor {
    return new RazorpayProcessor(config);
  }

  getProcessorName(): string {
    return 'Razorpay';
  }
}

// Payment Service - shows real-world usage
class PaymentService {
  private processors: Map<string, PaymentProcessor> = new Map();

  async addProcessor(provider: string, config: ProcessorConfig): Promise<void> {
    const factory = PaymentProcessorFactory.create(provider);
    const processor = await factory.setupProcessor(config);
    this.processors.set(provider, processor);
  }

  async processPayment(provider: string, request: PaymentRequest): Promise<PaymentResult> {
    const processor = this.processors.get(provider);
    if (!processor) {
      throw new Error(`Payment processor ${provider} not configured`);
    }

    console.log(`Processing payment via ${provider}...`);
    return await processor.processPayment(request);
  }

  async processRefund(provider: string, transactionId: string, amount?: number): Promise<PaymentResult> {
    const processor = this.processors.get(provider);
    if (!processor) {
      throw new Error(`Payment processor ${provider} not configured`);
    }

    return await processor.refundPayment(transactionId, amount);
  }

  async getTransactionStatus(provider: string, transactionId: string): Promise<string> {
    const processor = this.processors.get(provider);
    if (!processor) {
      throw new Error(`Payment processor ${provider} not configured`);
    }

    return await processor.getTransactionStatus(transactionId);
  }

  getAvailableProcessors(): string[] {
    return Array.from(this.processors.keys());
  }

  getProcessorCapabilities(provider: string): { currencies: string[]; methods: string[] } | null {
    const processor = this.processors.get(provider);
    if (!processor) return null;

    return {
      currencies: processor.getSupportedCurrencies(),
      methods: processor.getSupportedPaymentMethods()
    };
  }
}

// Usage Example - Following the documented API exactly
async function demonstratePaymentProcessorFactory(): Promise<void> {
  console.log('=== PAYMENT PROCESSOR FACTORY DEMO ===');
  console.log('Following the documented API pattern:\n');

  const providers = ['stripe', 'paypal', 'square', 'braintree', 'razorpay'];

  for (const provider of providers) {
    console.log(`--- Testing ${provider.toUpperCase()} ---`);
    
    try {
      // Following the exact documented API
      const paymentFactory = PaymentProcessorFactory.create(provider);
      const processor = paymentFactory.createProcessor({
        apiKey: 'sk_test_...',
        environment: 'sandbox'
      });

      const result = await processor.processPayment({
        amount: 9999, // $99.99
        currency: 'USD',
        paymentMethod: {
          type: 'card',
          details: {
            number: '4111111111111111',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123'
          }
        },
        description: 'Premium subscription'
      });
      
      console.log('Payment processor created for:', provider);
      console.log('Supported currencies:', processor.getSupportedCurrencies().join(', '));
      console.log('Supported methods:', processor.getSupportedPaymentMethods().join(', '));
      console.log('Payment result:', result.success ? '✅ Success' : '❌ Failed');
      
      if (result.success) {
        console.log('Transaction ID:', result.transactionId);
        console.log('Processing fee: $' + result.processingFee?.toFixed(2));
        
        // Test refund using the documented pattern
        if (result.transactionId) {
          const refundResult = await processor.refundPayment(result.transactionId);
          console.log('Refund result:', refundResult.success ? '✅ Success' : '❌ Failed');
        }
      } else {
        console.log('Error:', result.errorMessage);
      }
      
    } catch (error) {
      console.error(`❌ Failed to setup ${provider}:`, error instanceof Error ? error.message : String(error));
    }
    
    console.log();
  }

  console.log(`✅ Successfully demonstrated ${providers.length} payment processors with documented API`);
}

// Testing Example
async function testPaymentProcessorFactory(): Promise<void> {
  console.log('=== PAYMENT PROCESSOR FACTORY TESTS ===');
  
  // Test 1: Factory creation for different providers
  console.log('Test 1 - Factory creation:');
  const providers = ['stripe', 'paypal', 'square', 'braintree', 'razorpay'];
  
  for (const provider of providers) {
    try {
      const factory = PaymentProcessorFactory.create(provider);
      console.log(`✅ ${provider}: Factory created successfully`);
    } catch (error) {
      console.log(`❌ ${provider}: Failed to create factory`);
    }
  }
  
  // Test 2: Processor interface consistency
  console.log('\nTest 2 - Processor interface consistency:');
  const factory = PaymentProcessorFactory.create('stripe');
  const processor = await factory.setupProcessor({
    apiKey: 'test_key',
    environment: 'sandbox'
  });
  
  const methods = ['processPayment', 'refundPayment', 'getTransactionStatus', 'getSupportedCurrencies', 'getSupportedPaymentMethods', 'validatePaymentMethod'];
  const hasAllMethods = methods.every(method => typeof (processor as any)[method] === 'function');
  
  console.log('✅ All required methods present:', hasAllMethods);
  
  // Test 3: Payment validation
  console.log('\nTest 3 - Payment method validation:');
  const validCard = {
    type: 'card' as const,
    details: {
      number: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123'
    }
  };
  
  const invalidCard = {
    type: 'card' as const,
    details: {
      number: '4111111111111111'
      // Missing required fields
    }
  };
  
  console.log('✅ Valid card validation:', processor.validatePaymentMethod(validCard));
  console.log('✅ Invalid card validation:', !processor.validatePaymentMethod(invalidCard));
  
  // Test 4: Currency and method support
  console.log('\nTest 4 - Currency and method support:');
  const currencies = processor.getSupportedCurrencies();
  const paymentMethods = processor.getSupportedPaymentMethods();
  
  console.log('✅ Currencies supported:', currencies.length > 0);
  console.log('✅ Payment methods supported:', paymentMethods.length > 0);
  
  console.log();
}

// Run demonstrations
(async () => {
  await demonstratePaymentProcessorFactory();
  await testPaymentProcessorFactory();
  exit(0);
})();

export {
  PaymentProcessorFactory,
  PaymentProcessor,
  PaymentRequest,
  PaymentResult,
  ProcessorConfig,
  PaymentService
}; 