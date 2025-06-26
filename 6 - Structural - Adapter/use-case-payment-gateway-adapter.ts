// ============================================================================
// PAYMENT GATEWAY ADAPTER - Unified Payment Processing Interface
// ============================================================================

// We use simple in-memory stubs instead of real SDKs to keep the example runnable

import { randomUUID } from 'crypto';
import { exit } from 'process';

// -----------------------------------------------------------------------------
// 1. Interfaces and Types (Target Interface)
// -----------------------------------------------------------------------------

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  provider: string;
}

interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  provider: string;
}

interface PaymentProcessor {
  /**
   * Authorises and captures a payment.
   * @param amount   Monetary amount in major units (e.g. USD)
   * @param currency ISO-4217 currency code, e.g. "USD"
   * @param source   Payment source token (card, wallet, etc.)
   */
  processPayment(amount: number, currency: string, source: string): Promise<PaymentResult>;

  /**
   * Issues a partial or full refund
   * @param transactionId Transaction/charge identifier
   * @param amount        Amount to refund in major units
   */
  refundPayment(transactionId: string, amount: number): Promise<RefundResult>;
}

// -----------------------------------------------------------------------------
// 2. Adaptee Stubs (Incompatible Interfaces)
// -----------------------------------------------------------------------------

// Each service uses a completely different API shape to highlight the need for an adapter

class StripeService {
  async createCharge(params: { amountCents: number; currency: string; token: string }): Promise<{ id: string; status: 'success' | 'failure' }> {
    return {
      id: `ch_${randomUUID()}`,
      status: 'success'
    };
  }

  async createRefund(params: { chargeId: string; amountCents: number }): Promise<{ id: string; status: 'success' | 'failure' }> {
    return {
      id: `re_${randomUUID()}`,
      status: 'success'
    };
  }
}

class PayPalService {
  async makePayment(total: string, currency: string, payerId: string): Promise<{ acknowledge: 'OK' | 'ERROR'; transaction: string }> {
    return {
      acknowledge: 'OK',
      transaction: `pp_${randomUUID()}`
    };
  }

  async issueRefund(captureId: string, refundTotal: string): Promise<{ acknowledge: 'OK' | 'ERROR'; refund: string }> {
    return {
      acknowledge: 'OK',
      refund: `pp_ref_${randomUUID()}`
    };
  }
}

class SquareService {
  async charge(amount: number, currency: string, nonce: string): Promise<{ success: boolean; reference: string }> {
    return {
      success: true,
      reference: `sq_${randomUUID()}`
    };
  }

  async refund(reference: string, amount: number): Promise<{ success: boolean; reference: string }> {
    return {
      success: true,
      reference: `sq_ref_${randomUUID()}`
    };
  }
}

// -----------------------------------------------------------------------------
// 3. Concrete Adapter Implementations (Object Adapter)
// -----------------------------------------------------------------------------

class StripeAdapter implements PaymentProcessor {
  private stripe = new StripeService();

  async processPayment(amount: number, currency: string, source: string): Promise<PaymentResult> {
    try {
      const response = await this.stripe.createCharge({ amountCents: amount * 100, currency: currency.toLowerCase(), token: source });
      return {
        success: response.status === 'success',
        transactionId: response.id,
        amount,
        provider: 'stripe'
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        amount,
        provider: 'stripe'
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<RefundResult> {
    try {
      const response = await this.stripe.createRefund({ chargeId: transactionId, amountCents: amount * 100 });
      return {
        success: response.status === 'success',
        refundId: response.id,
        amount,
        provider: 'stripe'
      };
    } catch (error) {
      return {
        success: false,
        refundId: '',
        amount,
        provider: 'stripe'
      };
    }
  }
}

class PayPalAdapter implements PaymentProcessor {
  private paypal = new PayPalService();

  async processPayment(amount: number, currency: string, source: string): Promise<PaymentResult> {
    const response = await this.paypal.makePayment(amount.toFixed(2), currency, source);
    return {
      success: response.acknowledge === 'OK',
      transactionId: response.transaction,
      amount,
      provider: 'paypal'
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<RefundResult> {
    const response = await this.paypal.issueRefund(transactionId, amount.toFixed(2));
    return {
      success: response.acknowledge === 'OK',
      refundId: response.refund,
      amount,
      provider: 'paypal'
    };
  }
}

class SquareAdapter implements PaymentProcessor {
  private square = new SquareService();

  async processPayment(amount: number, currency: string, source: string): Promise<PaymentResult> {
    const response = await this.square.charge(amount, currency, source);
    return {
      success: response.success,
      transactionId: response.reference,
      amount,
      provider: 'square'
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<RefundResult> {
    const response = await this.square.refund(transactionId, amount);
    return {
      success: response.success,
      refundId: response.reference,
      amount,
      provider: 'square'
    };
  }
}

// -----------------------------------------------------------------------------
// 4. Adapter Registry (for easy lookup)
// -----------------------------------------------------------------------------

class PaymentGatewayRegistry {
  private static registry = new Map<string, PaymentProcessor>([
    ['stripe', new StripeAdapter()],
    ['paypal', new PayPalAdapter()],
    ['square', new SquareAdapter()]
  ]);

  public static get(provider: string): PaymentProcessor {
    const gateway = this.registry.get(provider.toLowerCase());
    if (!gateway) {
      throw new Error(`Payment provider \"${provider}\" is not supported.`);
    }
    return gateway;
  }

  public static listProviders(): string[] {
    return Array.from(this.registry.keys());
  }
}

// -----------------------------------------------------------------------------
// 5. Demonstration Functions
// -----------------------------------------------------------------------------

async function demoPayments(): Promise<void> {
  console.log('=== PAYMENT GATEWAY ADAPTER DEMO ===');

  const providers = PaymentGatewayRegistry.listProviders();
  const currency = 'USD';

  for (const provider of providers) {
    const gateway = PaymentGatewayRegistry.get(provider);
    console.log(`\n--- Using ${provider.toUpperCase()} gateway ---`);

    // Process Payment
    const paymentResult = await gateway.processPayment(100, currency, 'dummy-token');
    console.log('Payment Result:', paymentResult);

    // Refund Payment (partial)
    if (paymentResult.success) {
      const refundResult = await gateway.refundPayment(paymentResult.transactionId, 40);
      console.log('Refund Result:', refundResult);
    }
  }
}

async function runTests(): Promise<void> {
  console.log('\n=== PAYMENT GATEWAY ADAPTER TESTS ===');

  // Test: Unsupported provider error handling
  try {
    PaymentGatewayRegistry.get('unknown');
    console.error('❌ Expected error for unsupported provider');
  } catch (error) {
    console.log('✅ Error thrown for unsupported provider');
  }

  // Test: All providers return success for demo operations
  for (const provider of PaymentGatewayRegistry.listProviders()) {
    const gateway = PaymentGatewayRegistry.get(provider);
    const payment = await gateway.processPayment(10, 'USD', 'token');
    if (!payment.success) {
      console.error(`❌ ${provider} payment failed`);
    } else {
      console.log(`✅ ${provider} payment succeeded`);
    }
  }
}

// -----------------------------------------------------------------------------
// 6. Execute Demo and Tests
// -----------------------------------------------------------------------------

(async () => {
  await demoPayments();
  await runTests();
  exit(0);
})();

// -----------------------------------------------------------------------------
// 7. Exports
// -----------------------------------------------------------------------------

export {
  PaymentProcessor,
  PaymentGatewayRegistry,
  PaymentResult,
  RefundResult,
  StripeAdapter,
  PayPalAdapter,
  SquareAdapter
}; 