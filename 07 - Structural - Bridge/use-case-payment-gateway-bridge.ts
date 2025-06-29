// ============================================================================
// PAYMENT BRIDGE - Charge/Refund/Subscribe across Stripe & PayPal
// ============================================================================
import { exit } from 'process';

// 1. Implementation hierarchy
interface PaymentGateway {
  charge(amount:number): Promise<string>; // returns transactionId
  refund(txId:string, amount:number): Promise<boolean>;
  subscribe(planId:string): Promise<string>; // subscriptionId
  name(): string;
}

class StripeGateway implements PaymentGateway {
  async charge(amount:number){console.log(`💳 Stripe charge $${amount}`);return 'stripe_tx_'+Date.now();}
  async refund(id:string,amount:number){console.log(`💳 Stripe refund ${id} $${amount}`);return true;}
  async subscribe(planId:string){console.log(`💳 Stripe subscribe plan ${planId}`);return 'sub_'+Date.now();}
  name(){return 'stripe';}
}

class PayPalGateway implements PaymentGateway {
  async charge(amount:number){console.log(`💰 PayPal charge $${amount}`);return 'pp_tx_'+Date.now();}
  async refund(id:string,amount:number){console.log(`💰 PayPal refund ${id} $${amount}`);return true;}
  async subscribe(planId:string){console.log(`💰 PayPal subscribe plan ${planId}`);return 'pp_sub_'+Date.now();}
  name(){return 'paypal';}
}

// 2. Abstraction hierarchy
class PaymentOperation {
  constructor(private gateway: PaymentGateway){}
  async purchase(amount:number){return this.gateway.charge(amount);} 
  async refund(txId:string,amount:number){return this.gateway.refund(txId,amount);} 
  async subscribe(planId:string){return this.gateway.subscribe(planId);} 
}

// 3. Demo
async function demo(){
  console.log('=== PAYMENT GATEWAY BRIDGE DEMO ===');
  const gateways=[new StripeGateway(), new PayPalGateway()];
  for(const gw of gateways){
    console.log(`\n--- Using ${gw.name().toUpperCase()} ---`);
    const op=new PaymentOperation(gw);
    const tx=await op.purchase(50);
    await op.refund(tx,20);
    await op.subscribe('pro');
  }
}

(async()=>{await demo(); exit(0);})();

export {PaymentGateway, StripeGateway, PayPalGateway, PaymentOperation}; 