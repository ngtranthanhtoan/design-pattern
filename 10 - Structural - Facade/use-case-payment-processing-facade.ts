import { exit } from 'process';

// Subsystem interfaces
interface PaymentGateway { charge(token:string, amount:number): string; refund(txId:string): boolean; }

class StripeGateway implements PaymentGateway {
  charge(token:string, amount:number){console.log(`💳 Stripe charge $${amount}`); return 'stripe-tx-123';}
  refund(txId:string){console.log(`↩️ Stripe refund ${txId}`); return true;}
}
class PaypalGateway implements PaymentGateway {
  charge(token:string, amount:number){console.log(`💳 PayPal charge $${amount}`); return 'paypal-tx-456';}
  refund(txId:string){console.log(`↩️ PayPal refund ${txId}`); return true;}
}

// Facade
class PaymentFacade {
  private gateways: Record<string, PaymentGateway>;
  constructor(){
    this.gateways={stripe:new StripeGateway(), paypal:new PaypalGateway()};
  }
  charge(cardToken:string, amount:number, provider:'stripe'|'paypal'='stripe'){
    return this.gateways[provider].charge(cardToken,amount);
  }
  refund(txId:string, provider:'stripe'|'paypal'='stripe'){
    return this.gateways[provider].refund(txId);
  }
}

// Demo
const facade=new PaymentFacade();
const tx=facade.charge('tok_visa',50,'stripe');
facade.refund(tx,'stripe');
exit(0); 